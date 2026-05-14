import { useEffect } from 'react';
import { useCanvasStore } from '@/features/canvas/store/useCanvasStore';

export function useEdgeAnimations() {
  const nodes = useCanvasStore(state => state.nodes);
  const setEdges = useCanvasStore(state => state.setEdges);

  // Edge styling: recent edges are bold, older edges fade out.
  // Handles are always src-right → tgt-left (enforced by NodeHandles + createEdge).
  useEffect(() => {
    setEdges((eds) =>
      eds.map((edge, i) => {
        const isLatest = i >= eds.length - 2;
        const opacity = isLatest ? 1 : 0.2;
        const strokeWidth = isLatest ? 2.5 : 1;

        // Always enforce right→left handle connection
        const needsUpdate =
          edge.sourceHandle !== 'src-right' ||
          edge.targetHandle !== 'tgt-left' ||
          edge.style?.opacity !== opacity;

        if (needsUpdate) {
          return { 
            ...edge, 
            sourceHandle: 'src-right', 
            targetHandle: 'tgt-left',
            animated: isLatest,
            style: { stroke: 'var(--foreground)', strokeWidth, opacity, transition: 'opacity 0.5s ease, stroke-width 0.5s ease' }
          };
        }
        return edge;
      })
    );
  }, [nodes, setEdges]);
}
