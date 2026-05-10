import { useCanvasStore } from '../store/useCanvasStore';

export function DebugPanel() {
  const isMockApiEnabled = useCanvasStore(state => state.isMockApiEnabled);
  const setMockApiEnabled = useCanvasStore(state => state.setMockApiEnabled);
  const isDebugDrawerOpen = useCanvasStore(state => state.isDebugDrawerOpen);
  const setDebugDrawerOpen = useCanvasStore(state => state.setDebugDrawerOpen);
  const nodes = useCanvasStore(state => state.nodes);
  const edges = useCanvasStore(state => state.edges);
  const setNodes = useCanvasStore(state => state.setNodes);
  const setEdges = useCanvasStore(state => state.setEdges);
  const setTrackedNodeId = useCanvasStore(state => state.setTrackedNodeId);
  
  const physicsConfig = useCanvasStore(state => state.physicsConfig);
  const setPhysicsConfig = useCanvasStore(state => state.setPhysicsConfig);

  return (
    <div className={`absolute top-4 right-4 z-50 flex flex-col items-end gap-2 transition-transform duration-300 ${isDebugDrawerOpen ? 'translate-x-0' : 'translate-x-[calc(100%-2rem)]'}`}>
      <button 
        onClick={() => setDebugDrawerOpen(!isDebugDrawerOpen)}
        className="bg-[var(--foreground)] text-[var(--background)] px-3 py-1 text-xs font-mono absolute -left-24 top-0 hover:bg-opacity-80 transition-opacity"
      >
        [ ⚙️ DEBUG ]
      </button>

      {isDebugDrawerOpen && (
        <div className="bg-[var(--background)] border border-[var(--foreground)] p-4 shadow-2xl flex flex-col gap-4 font-mono w-72 h-auto max-h-[80vh] overflow-y-auto">
          <div className="flex flex-col gap-2 border-b border-[var(--foreground)] pb-4">
            <h3 className="text-xs uppercase tracking-wider font-bold mb-2">Physics Engine</h3>
            
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[10px]">
                <label>Friction (Velocity Decay)</label>
                <span>{physicsConfig.velocityDecay.toFixed(2)}</span>
              </div>
              <input type="range" min="0" max="1" step="0.05" value={physicsConfig.velocityDecay} onChange={(e) => setPhysicsConfig({ velocityDecay: parseFloat(e.target.value) })} className="w-full accent-[var(--foreground)]" />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[10px]">
                <label>Gravity (Charge Strength)</label>
                <span>{physicsConfig.chargeStrength}</span>
              </div>
              <input type="range" min="-2000" max="100" step="50" value={physicsConfig.chargeStrength} onChange={(e) => setPhysicsConfig({ chargeStrength: parseFloat(e.target.value) })} className="w-full accent-[var(--foreground)]" />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[10px]">
                <label>Link Distance</label>
                <span>{physicsConfig.linkDistance}</span>
              </div>
              <input type="range" min="10" max="500" step="10" value={physicsConfig.linkDistance} onChange={(e) => setPhysicsConfig({ linkDistance: parseFloat(e.target.value) })} className="w-full accent-[var(--foreground)]" />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[10px]">
                <label>Link Strength</label>
                <span>{physicsConfig.linkStrength.toFixed(1)}</span>
              </div>
              <input type="range" min="0" max="5" step="0.1" value={physicsConfig.linkStrength} onChange={(e) => setPhysicsConfig({ linkStrength: parseFloat(e.target.value) })} className="w-full accent-[var(--foreground)]" />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[10px]">
                <label>Link Rigidity (Iterations)</label>
                <span>{physicsConfig.linkIterations}</span>
              </div>
              <input type="range" min="1" max="30" step="1" value={physicsConfig.linkIterations} onChange={(e) => setPhysicsConfig({ linkIterations: parseInt(e.target.value) })} className="w-full accent-[var(--foreground)]" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <label htmlFor="mock-api-mode" className="text-xs uppercase tracking-wider">Enable Route Mock</label>
            <input
              type="checkbox"
              id="mock-api-mode"
              checked={isMockApiEnabled}
              onChange={(e) => setMockApiEnabled(e.target.checked)}
              className="w-4 h-4"
            />
          </div>
          
          <div className="flex flex-col gap-1 text-xs text-muted-foreground border-t border-[var(--foreground)] pt-4 mt-2">
            <div>Nodes: {nodes.length}</div>
            <div>Edges: {edges.length}</div>
            <div>API: {isMockApiEnabled ? '/api/chat?mock=true' : '/api/chat'}</div>
          </div>

          <div className="flex flex-col gap-2 mt-4">
            <button 
              onClick={() => {
                const promptId = `prompt-${Date.now()}`;
                setNodes(nds => {
                  const lastNode = nds[nds.length - 1];
                  const dropX = lastNode ? lastNode.position.x - 200 : 400;
                  const dropY = lastNode ? lastNode.position.y + 100 : 400;
                  return [...nds, { id: promptId, type: 'prompt', position: { x: dropX, y: dropY }, data: { text: "Explain brutalism." } }];
                });
                setEdges(eds => {
                  const lastNode = nodes[nodes.length - 1];
                  if (!lastNode) return eds;
                  return [...eds, { id: `e-${lastNode.id}-${promptId}`, source: lastNode.id, target: promptId }];
                });
                setTrackedNodeId(promptId);
                setTimeout(() => { 
                  if (useCanvasStore.getState().trackedNodeId === promptId) setTrackedNodeId(null); 
                }, 1500);
              }}
              className="text-xs border border-[var(--foreground)] p-1 hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors"
            >
              + Spawn Mock Prompt
            </button>
            <button 
              onClick={() => {
                const aiNodeId = `mock-ai-${Date.now()}`;
                setNodes(nds => {
                  const lastNode = nds.filter(n => n.type === 'prompt').pop() || nds[nds.length - 1];
                  const dropX = lastNode ? lastNode.position.x + 200 : 600;
                  const dropY = lastNode ? lastNode.position.y + 100 : 400;
                  return [...nds, { 
                    id: aiNodeId, 
                    type: 'hero', 
                    position: { x: dropX, y: dropY }, 
                    data: { headline: "MOCK RESPONSE", subline: "Generated instantly for layout testing." } 
                  }];
                });
                setEdges(eds => {
                  const lastPrompt = nodes.filter(n => n.type === 'prompt').pop() || nodes[nodes.length - 1];
                  if (!lastPrompt) return eds;
                  return [...eds, { id: `e-${lastPrompt.id}-${aiNodeId}`, source: lastPrompt.id, target: aiNodeId }];
                });
                setTrackedNodeId(aiNodeId);
                setTimeout(() => { 
                  if (useCanvasStore.getState().trackedNodeId === aiNodeId) setTrackedNodeId(null); 
                }, 1500);
              }}
              className="text-xs border border-[var(--foreground)] p-1 hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors"
            >
              + Spawn Mock AI Response
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
