import { useCanvasStore } from '../store/useCanvasStore';
import { useBeeStore, MischiefType } from '../store/useBeeStore';

export function DebugPanel() {
  const isDebugDrawerOpen = useCanvasStore(state => state.isDebugDrawerOpen);
  const setDebugDrawerOpen = useCanvasStore(state => state.setDebugDrawerOpen);
  const nodes = useCanvasStore(state => state.nodes);
  const edges = useCanvasStore(state => state.edges);
  const setNodes = useCanvasStore(state => state.setNodes);
  const setEdges = useCanvasStore(state => state.setEdges);
  const setTrackedNodeId = useCanvasStore(state => state.setTrackedNodeId);
  
  const physicsConfig = useCanvasStore(state => state.physicsConfig);
  const setPhysicsConfig = useCanvasStore(state => state.setPhysicsConfig);
  const fluidConfig = useCanvasStore(state => state.fluidConfig);
  const setFluidConfig = useCanvasStore(state => state.setFluidConfig);

  const activeMischief = useBeeStore(state => state.activeMischief);
  const setMischief = useBeeStore(state => state.setMischief);
  const swarmTarget = useBeeStore(state => state.swarmTarget);
  const setSwarmTarget = useBeeStore(state => state.setSwarmTarget);

  return (
    <div className={`fixed top-4 right-0 z-50 transition-transform duration-300 ease-out ${isDebugDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <button 
        onClick={() => setDebugDrawerOpen(!isDebugDrawerOpen)}
        className={`bg-[var(--foreground)] text-[var(--background)] px-3 py-1 text-xs font-mono absolute right-[100%] top-0 hover:bg-opacity-80 transition-all duration-300 whitespace-nowrap mr-4`}
      >
        [ PLAYGROUND ]
      </button>

      <div className="bg-[var(--background)] border border-[var(--foreground)] border-r-0 p-4 shadow-2xl flex flex-col gap-4 font-mono w-80 h-auto max-h-[90vh] overflow-y-auto">
          
          <div className="flex flex-col gap-2 border-b border-[var(--foreground)] pb-4">
            <h3 className="text-xs uppercase tracking-wider font-bold mb-2">Swarm Controls</h3>
            <div className="flex flex-wrap gap-2 mb-2">
              {(['none', 'invert', 'float_nodes', 'buzz_text', 'theme_hack'] as MischiefType[]).map(mischief => (
                <button
                  key={mischief}
                  className={`px-2 py-1 text-[10px] uppercase font-bold border hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors ${activeMischief === mischief ? 'bg-[var(--foreground)] text-[var(--background)]' : 'border-[var(--foreground)] text-[var(--foreground)]'}`}
                  onClick={() => setMischief(mischief)}
                >
                  {mischief}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-1 text-[10px]">
              <label>Swarm Target (Node ID or 'global')</label>
              <input 
                type="text" 
                value={swarmTarget || ''} 
                onChange={(e) => setSwarmTarget(e.target.value || null)}
                placeholder="null"
                className="bg-transparent border border-[var(--foreground)] p-1 text-[var(--foreground)] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 border-b border-[var(--foreground)] pb-4">
            <h3 className="text-xs uppercase tracking-wider font-bold mb-2">Node Physics</h3>
            
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

          <div className="flex flex-col gap-2 pt-2 border-b border-[var(--foreground)] pb-4">
            <h3 className="text-xs uppercase tracking-wider font-bold mb-2 mt-2">Fluid Physics</h3>
            
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[10px]">
                <label>Splat Radius</label>
                <span>{fluidConfig.SPLAT_RADIUS.toFixed(2)}</span>
              </div>
              <input type="range" min="0.01" max="1.0" step="0.01" value={fluidConfig.SPLAT_RADIUS} onChange={(e) => setFluidConfig({ SPLAT_RADIUS: parseFloat(e.target.value) })} className="w-full accent-[var(--foreground)]" />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[10px]">
                <label>Density Dissipation</label>
                <span>{fluidConfig.DENSITY_DISSIPATION.toFixed(1)}</span>
              </div>
              <input type="range" min="0.1" max="5.0" step="0.1" value={fluidConfig.DENSITY_DISSIPATION} onChange={(e) => setFluidConfig({ DENSITY_DISSIPATION: parseFloat(e.target.value) })} className="w-full accent-[var(--foreground)]" />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[10px]">
                <label>Velocity Dissipation</label>
                <span>{fluidConfig.VELOCITY_DISSIPATION.toFixed(1)}</span>
              </div>
              <input type="range" min="0.1" max="5.0" step="0.1" value={fluidConfig.VELOCITY_DISSIPATION} onChange={(e) => setFluidConfig({ VELOCITY_DISSIPATION: parseFloat(e.target.value) })} className="w-full accent-[var(--foreground)]" />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[10px]">
                <label>Pressure</label>
                <span>{fluidConfig.PRESSURE.toFixed(2)}</span>
              </div>
              <input type="range" min="0.0" max="1.0" step="0.01" value={fluidConfig.PRESSURE} onChange={(e) => setFluidConfig({ PRESSURE: parseFloat(e.target.value) })} className="w-full accent-[var(--foreground)]" />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[10px]">
                <label>Curl</label>
                <span>{fluidConfig.CURL}</span>
              </div>
              <input type="range" min="0" max="100" step="1" value={fluidConfig.CURL} onChange={(e) => setFluidConfig({ CURL: parseInt(e.target.value) })} className="w-full accent-[var(--foreground)]" />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[10px]">
                <label>Aberration</label>
                <span>{fluidConfig.ABERRATION_MULT.toFixed(3)}</span>
              </div>
              <input type="range" min="0.0" max="10.0" step="0.001" value={fluidConfig.ABERRATION_MULT} onChange={(e) => setFluidConfig({ ABERRATION_MULT: parseFloat(e.target.value) })} className="w-full accent-[var(--foreground)]" />
            </div>

            <div className="flex items-center justify-between pt-2">
              <label htmlFor="color-cycle-mode" className="text-[10px] uppercase tracking-wider">Color Cycle</label>
              <input
                type="checkbox"
                id="color-cycle-mode"
                checked={fluidConfig.COLOR_CYCLE}
                onChange={(e) => setFluidConfig({ COLOR_CYCLE: e.target.checked })}
                className="w-3 h-3 accent-[var(--foreground)]"
              />
            </div>

            {!fluidConfig.COLOR_CYCLE && (
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-[10px]">
                  <label>Splat Color</label>
                  <input type="color" value={fluidConfig.SPLAT_COLOR} onChange={(e) => setFluidConfig({ SPLAT_COLOR: e.target.value })} className="h-6 w-8 p-0 border-0 cursor-pointer" />
                </div>
              </div>
            )}
            
            {fluidConfig.COLOR_CYCLE && (
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[10px]">
                  <label>Cycle Speed</label>
                  <span>{fluidConfig.COLOR_CYCLE_SPEED.toFixed(1)}</span>
                </div>
                <input type="range" min="0.1" max="5.0" step="0.1" value={fluidConfig.COLOR_CYCLE_SPEED} onChange={(e) => setFluidConfig({ COLOR_CYCLE_SPEED: parseFloat(e.target.value) })} className="w-full accent-[var(--foreground)]" />
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-1 text-xs text-muted-foreground pt-2">
            <div>Nodes: {nodes.length}</div>
            <div>Edges: {edges.length}</div>
          </div>
      </div>
    </div>
  );
}
