import { useState, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { Node } from '@xyflow/react';
import { useCanvasStore } from '../store/useCanvasStore';

export function useEditorialChat() {
  const [input, setInput] = useState('');
  const isMockApiEnabled = useCanvasStore(state => state.isMockApiEnabled);
  const setNodes = useCanvasStore(state => state.setNodes);
  const setEdges = useCanvasStore(state => state.setEdges);
  const setTrackedNodeId = useCanvasStore(state => state.setTrackedNodeId);
  const rfInstance = useCanvasStore(state => state.rfInstance);

  const { messages, append, status, stop } = useChat({
    api: isMockApiEnabled ? '/api/chat?mock=true' : '/api/chat',
    onToolCall: ({ toolCall }) => {
      // Wrap in setTimeout to ensure state updates happen outside useChat's render cycle
      setTimeout(() => {
        if (toolCall.toolName === 'createNode') {
          const input = toolCall.input as any;
          let xPos = 600;
          let yPos = 400;

          if (input.layoutIntent) {
            switch (input.layoutIntent) {
              case 'top_left': xPos = -400; yPos = -200; break;
              case 'top_right': xPos = 1600; yPos = -200; break;
              case 'bottom_left': xPos = -400; yPos = 1000; break;
              case 'bottom_right': xPos = 1600; yPos = 1000; break;
              case 'far_right': xPos = 2400; yPos = 400; break;
              case 'center': xPos = 600; yPos = 400; break;
            }
          } else {
            // Read state once
            const currentNodes = useCanvasStore.getState().nodes;
            const ghost = currentNodes.find(n => n.id === 'ghost-node');
            if (ghost) {
              xPos = ghost.position.x;
              yPos = ghost.position.y;
            } else {
              const realNodes = currentNodes.filter(n => n.id !== 'ghost-node' && n.id !== toolCall.toolCallId);
              if (realNodes.length > 0) {
                const parent = realNodes[realNodes.length - 1];
                xPos = parent.position.x + 150 + (Math.random() * 50);
                yPos = parent.position.y + 100 + (Math.random() * 50 - 25);
              } else {
                xPos = 600 + (Math.random() * 400 - 200);
                yPos = 400 + (Math.random() * 400 - 200);
              }
            }
          }

          setNodes((nds) => {
            if (nds.some(n => n.id === toolCall.toolCallId)) return nds;

            const newNode: Node = {
              id: toolCall.toolCallId,
              type: input.type === 'hero' ? 'hero' : 'text',
              position: { x: xPos, y: yPos },
              data: {
                headline: input.headline,
                subline: input.subline,
                text: input.text,
                label: input.label,
                animationEffect: input.animationEffect
              }
            };

            setTrackedNodeId(newNode.id);
            setTimeout(() => { 
              if (useCanvasStore.getState().trackedNodeId === newNode.id) {
                setTrackedNodeId(null);
              }
            }, 1500);

            return [...nds.filter(n => n.id !== 'ghost-node'), newNode];
          });

          setEdges((eds) => {
            const currentNodes = useCanvasStore.getState().nodes;
            const realNodes = currentNodes.filter(n => n.id !== 'ghost-node' && n.id !== toolCall.toolCallId);

            if (realNodes.length > 0) {
              const lastNodeId = realNodes[realNodes.length - 1].id;
              const edgeId = `e-${lastNodeId}-${toolCall.toolCallId}`;

              if (eds.some(e => e.id === edgeId)) return eds;
              return [
                ...eds.filter(e => e.target !== 'ghost-node'),
                { id: edgeId, source: lastNodeId, target: toolCall.toolCallId }
              ];
            }
            return eds.filter(e => e.target !== 'ghost-node');
          });

          const currentRfInstance = useCanvasStore.getState().rfInstance;
          if (currentRfInstance) {
            setTimeout(() => {
              currentRfInstance.fitView({ padding: 0.3, duration: 800, maxZoom: 1.2 });
            }, 50);
          }
        }
      }, 0);
    }
  });

  // Ghost node streaming sync
  useEffect(() => {
    if (status === 'streaming' || status === 'submitted') {
      const lastMessage = messages[messages.length - 1];
      let ghostContent = "Organizing thoughts...";

      if (lastMessage && lastMessage.role === 'assistant') {
        const msg = lastMessage as any;
        const toolInvocation = msg.parts?.find((p: any) => p.type === 'tool-invocation')?.toolInvocation;
        const streamingText = toolInvocation?.args?.text;

        ghostContent = msg.parts?.find((p: any) => p.type === 'reasoning')?.reasoning ||
          streamingText ||
          msg.parts?.find((p: any) => p.type === 'text')?.text ||
          msg.reasoning ||
          msg.content ||
          "Organizing thoughts...";
      }

      setNodes(nds => {
        const hasGhost = nds.some(n => n.id === 'ghost-node');
        if (!hasGhost) {
          const dropX = 600 + (Math.random() * 200 - 100);
          const dropY = 600 + (Math.random() * 200 - 100);
          return [...nds, {
            id: 'ghost-node',
            type: 'ghost',
            position: { x: dropX, y: dropY },
            data: { text: ghostContent }
          }];
        } else {
          return nds.map(n => n.id === 'ghost-node' ? { ...n, data: { text: ghostContent } } : n);
        }
      });

      setEdges(eds => {
        if (!eds.some(e => e.target === 'ghost-node')) {
          const currentNodes = useCanvasStore.getState().nodes;
          const lastReal = currentNodes.filter(n => n.id !== 'ghost-node').pop();
          if (lastReal) {
            return [...eds, { id: `e-ghost`, source: lastReal.id, target: 'ghost-node' }];
          }
        }
        return eds;
      });
    } else {
      setNodes(nds => nds.filter(n => n.id !== 'ghost-node'));
      setEdges(eds => eds.filter(e => e.target !== 'ghost-node'));
    }
  }, [messages, status, setNodes, setEdges]);

  const handleSend = () => {
    if (!input.trim()) return;

    const promptId = `prompt-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    
    setNodes(nds => {
      const lastNode = nds[nds.length - 1];
      let dropX = 400 + (Math.random() * 200);
      let dropY = 400 + (Math.random() * 200);

      if (lastNode) {
        dropX = lastNode.position.x + 150 + (Math.random() * 100);
        dropY = lastNode.position.y + (Math.random() * 100 - 50);
      }

      const newNode = {
        id: promptId,
        type: 'prompt',
        position: { x: dropX, y: dropY },
        data: { text: input }
      };

      setTrackedNodeId(promptId);
      setTimeout(() => { 
        if (useCanvasStore.getState().trackedNodeId === promptId) {
          setTrackedNodeId(null);
        }
      }, 1500);

      return [...nds, newNode];
    });
    
    setEdges(eds => {
      const currentNodes = useCanvasStore.getState().nodes;
      const lastNode = currentNodes[currentNodes.length - 2]; // before the prompt we just added
      if (lastNode) {
        const edgeId = `e-${lastNode.id}-${promptId}`;
        if (eds.some(e => e.id === edgeId)) return eds;
        return [...eds, { id: edgeId, source: lastNode.id, target: promptId }];
      }
      return eds;
    });

    const currentRfInstance = useCanvasStore.getState().rfInstance;
    if (currentRfInstance) {
      setTimeout(() => {
        currentRfInstance.fitView({ padding: 0.3, duration: 800, maxZoom: 1.2 });
      }, 50);
    }

    append({ role: 'user', content: input });
    setInput('');
  };

  return {
    input,
    setInput,
    handleSend,
    status,
    stop,
    messages
  };
}
