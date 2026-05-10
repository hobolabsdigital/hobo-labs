import { useEffect } from 'react';
import { useCanvasStore } from '../store/useCanvasStore';

export function useEdgeAnimations() {
  const nodes = useCanvasStore(state => state.nodes);
  const setEdges = useCanvasStore(state => state.setEdges);

  // Dynamic edge routing (Intelligent Line Sprouting)
  useEffect(() => {
    setEdges((eds) =>
      eds.map((edge, i) => {
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);
        if (!sourceNode || !targetNode) return edge;

        const dx = targetNode.position.x - sourceNode.position.x;
        const dy = targetNode.position.y - sourceNode.position.y;

        let sourcePos = 'bottom';
        let targetPos = 'top';

        if (Math.abs(dx) > Math.abs(dy)) {
          // Horizontal difference is greater
          if (dx > 0) {
            sourcePos = 'right';
            targetPos = 'left';
          } else {
            sourcePos = 'left';
            targetPos = 'right';
          }
        } else {
          // Vertical difference is greater
          if (dy > 0) {
            sourcePos = 'bottom';
            targetPos = 'top';
          } else {
            sourcePos = 'top';
            targetPos = 'bottom';
          }
        }

        const isLatest = i >= eds.length - 2;
        const opacity = isLatest ? 1 : 0.2;
        const strokeWidth = isLatest ? 2.5 : 1;

        if (edge.sourceHandle !== sourcePos || edge.targetHandle !== targetPos || edge.style?.opacity !== opacity) {
          return { 
            ...edge, 
            sourceHandle: sourcePos, 
            targetHandle: targetPos,
            animated: isLatest,
            style: { stroke: 'var(--foreground)', strokeWidth, opacity, transition: 'opacity 0.5s ease, stroke-width 0.5s ease' }
          };
        }
        return edge;
      })
    );
  }, [nodes, setEdges]); // Run whenever nodes move
}
