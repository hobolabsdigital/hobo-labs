import { useMemo, useEffect, useRef } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { toPng } from 'html-to-image';
import { BrainMode, useBeeStore } from '@/features/swarm/store/useBeeStore';

export function useSwarmAgent(type: BrainMode) {
  const setMischief = useBeeStore(state => state.setMischief);
  const setTerminalText = useBeeStore(state => state.setTerminalText);
  const setThemeOverrides = useBeeStore(state => state.setThemeOverrides);
  const targetId = useBeeStore(state => state.swarmTarget[type]);

  const transport = useMemo(() => new DefaultChatTransport({ api: `/api/bee/${type}` }), [type]);

  const { messages, sendMessage, setMessages } = useChat({
    transport,
    onToolCall({ toolCall }: any) {
      if (toolCall.toolName === 'applyMischief' || toolCall.toolName === 'applyImpeccableDesign') {
        const data = (toolCall.args || toolCall.input) as any;
        const mischiefVal = data?.mischief || data?.mischief_type;
        if (mischiefVal) setMischief(mischiefVal);
        if (data?.styles) setThemeOverrides(type, data.styles);

        // Log the actions for visibility
        if (toolCall.toolName === 'applyImpeccableDesign') {
          setTerminalText(`[${type.toUpperCase()}] Impeccable Design Applied:\n${data?.critique || 'No critique provided.'}`);
        } else {
          setTerminalText(`[${type.toUpperCase()}] Action executed.`);
        }
      }
    }
  });

  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.role === 'assistant') {
      const textPart = lastMsg.parts?.find((p: any) => p.type === 'text') as any;
      const textContent = (textPart ? textPart.text : '');
      if (textContent) {
        setTerminalText(`[${type.toUpperCase()} BRAIN]\n${textContent}`);
      }
    }
  }, [messages, type, setTerminalText]);

  const isExecuting = useRef(false);

  const executeTick = async () => {
    if (isExecuting.current) return;
    isExecuting.current = true;

    let imageBase64: string | undefined;

    let activeTargetId = targetId;

    // Autonomous Targeting: If bees don't have a target, they pick a random node!
    if (!activeTargetId || activeTargetId === 'global') {
      const { nodes } = await import('@/features/canvas/store/useCanvasStore').then(m => m.useCanvasStore.getState());
      if (nodes.length > 0) {
        const { visitedNodes, addVisitedNode, clearVisitedNodes } = useBeeStore.getState();

        let targetableNodes = nodes.filter(n => !visitedNodes.includes(n.id));

        // If all nodes have been visited, reset the tracking list
        if (targetableNodes.length === 0) {
          clearVisitedNodes();
          targetableNodes = nodes;
        }

        const randomNode = targetableNodes[Math.floor(Math.random() * targetableNodes.length)];
        activeTargetId = randomNode.id;
        useBeeStore.getState().setSwarmTarget(type, activeTargetId);
        addVisitedNode(activeTargetId);
      }
    }

    if (type === 'soldier' && activeTargetId && activeTargetId !== 'global') {
      const nodeEl = document.querySelector(`.react-flow__node[data-id="${activeTargetId}"]`) as HTMLElement;
      if (nodeEl) {
        nodeEl.classList.add('swarm-scanning-marquee');
        try {
          imageBase64 = await toPng(nodeEl);
        } catch (e) {
          console.error("Capture failed", e);
        }
        nodeEl.classList.remove('swarm-scanning-marquee');
      }
    }

    setTerminalText(`[${type.toUpperCase()} BRAIN] Analyzing...`);

    // We clear the messages state before sending to prevent accumulating history.
    // Accumulating history with tool calls caused Zod union validation errors in the Vercel AI SDK
    // because client tool call history doesn't always map strictly to Server CoreMessages over many turns.
    setMessages([]);

    const messageData: any = {
      text: type === 'soldier' ? 'Critique and fix this node design.' : 'Triggering swarm...',
    };

    if (imageBase64) {
      messageData.files = [{
        type: 'file',
        url: imageBase64,
        mediaType: 'image/png'
      }];
    }

    if (sendMessage) {
      // Small timeout to ensure state clears before sending
      setTimeout(() => {
        sendMessage(messageData);
        isExecuting.current = false;
      }, 0);
    } else {
      isExecuting.current = false;
    }
  };

  return { executeTick };
}
