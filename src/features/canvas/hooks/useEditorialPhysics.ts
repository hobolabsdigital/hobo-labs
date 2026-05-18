import { useEffect, useRef } from 'react';
import * as d3 from 'd3-force';
import { useCanvasStore } from '@/features/canvas/store/useCanvasStore';
import {
  DEFAULT_Y,
  FORCE_X_STRIDE,
  NODE_DIMS,
  NODE_DIMS_DEFAULT,
  LINK_MAX_DISTANCE,
} from '@/features/canvas/constants';
import { forceAABB } from './forceAABB';

export function useEditorialPhysics() {
  const nodesLength = useCanvasStore(state => state.nodes.length);
  const edgesLength = useCanvasStore(state => state.edges.length);
  const setNodes = useCanvasStore(state => state.setNodes);
  const physicsConfig = useCanvasStore(state => state.physicsConfig);
  const setSimulationRef = useCanvasStore(state => state.setSimulationRef);
  
  // Store the persistent D3 simulation and current internal nodes array
  const simulationRef = useRef<d3.Simulation<any, any> | null>(null);
  const internalNodesRef = useRef<any[]>([]);

  // 1. Initialize the simulation ONCE
  useEffect(() => {
    if (simulationRef.current) return; // Already initialized

    const simulation = d3.forceSimulation()
      // Initial physics configuration
      .velocityDecay(physicsConfig.velocityDecay)
      .force('charge', d3.forceManyBody().strength(physicsConfig.chargeStrength))
      // AABB rectangular collision replaces forceCollide
      .force('aabb', forceAABB(4))
      .force('link', d3.forceLink()
        .id((d: any) => d.id)
        // Ideal distance = edge-to-edge gap; hard cap at LINK_MAX_DISTANCE
        // so nodes can't drift off-screen when x-flow pushes them apart.
        .distance((link: any) => {
          const srcDims = NODE_DIMS[link.source?.type] ?? NODE_DIMS_DEFAULT;
          const tgtDims = NODE_DIMS[link.target?.type] ?? NODE_DIMS_DEFAULT;
          const ideal = srcDims.w / 2 + tgtDims.w / 2 + 60;
          return Math.min(ideal, LINK_MAX_DISTANCE);
        })
        // Higher strength (0.3) so the spring actually resists x-flow pulling
        // nodes beyond the max distance. physicsConfig.linkStrength (0.05) was
        // too weak to keep wide nodes on-screen.
        .strength(0.3)
        .iterations(physicsConfig.linkIterations)
      )
      .force('x-flow', d3.forceX().x((d: any) => {
        // Hero and intro nodes are pinned — don't apply x force
        if (d.type === 'hero' || d.type === 'intro') return d.x;
        // Push each subsequent node further right based on creation order
        const index = d.data?.creationIndex ?? 0;
        return index * FORCE_X_STRIDE;
      }).strength(0.04))
      // Gentle vertical centering — keeps nodes from drifting too far up/down
      .force('y-center', d3.forceY().y(DEFAULT_Y).strength(0.01));

    simulationRef.current = simulation;
    setSimulationRef(simulation);

    simulation.on('tick', () => {
      const currentTrackedId = useCanvasStore.getState().trackedNodeId;
      const currentRfInstance = useCanvasStore.getState().rfInstance;
      const internalNodes = internalNodesRef.current;

      setNodes((currentNodes) =>
        currentNodes.map(node => {
          const simNode = internalNodes.find(n => n.id === node.id);
          if (simNode) {
            // Frame-by-frame camera tracking for the active node
            if (node.id === currentTrackedId && currentRfInstance) {
              // Only reposition camera if node moved significantly (prevents jitter)
              const lastCameraPos = (simulationRef.current as any).__lastCameraPos || { x: 0, y: 0 };
              const dx = Math.abs(simNode.x - lastCameraPos.x);
              const dy = Math.abs(simNode.y - lastCameraPos.y);
              if (dx > 20 || dy > 20) {
                currentRfInstance.setCenter(simNode.x, simNode.y, { zoom: 0.9, duration: 0 });
                (simulationRef.current as any).__lastCameraPos = { x: simNode.x, y: simNode.y };
              }
            }

            // Only update if movement is significant to avoid micro-stutters
            if (Math.abs(node.position.x - simNode.x) > 1 || Math.abs(node.position.y - simNode.y) > 1) {
              return { ...node, position: { x: simNode.x, y: simNode.y } };
            }
          }
          return node;
        })
      );
    });

    return () => {
      simulation.stop();
      simulationRef.current = null;
      setSimulationRef(null);
    };
  }, []); // Run only once on mount

  // 2. React to Topology Changes (Nodes/Edges Added or Removed)
  useEffect(() => {
    const simulation = simulationRef.current;
    if (!simulation) return;

    const { nodes, edges } = useCanvasStore.getState();

    // 2a. Reconcile internal simulation nodes (preserve existing instances)
    const newInternalNodes = nodes.map(n => {
      // Find if this node already exists in the physics engine
      const existing = internalNodesRef.current.find(inNode => inNode.id === n.id);
      if (existing) {
        return existing; // Keep existing velocity/momentum!
      } else {
        // It's a new node! Use top-left position directly (no center-correction)
        const isInitial = n.type === 'hero' && n.id === 'hero-1';
        const isIntro = n.type === 'intro';
        return {
          ...n,
          x: n.position.x,
          y: n.position.y,
          // Lock the initial hero node so it never moves
          fx: isInitial || isIntro ? n.position.x : undefined,
          fy: isInitial || isIntro ? n.position.y : undefined
        };
      }
    });

    internalNodesRef.current = newInternalNodes;

    // 2b. Reconcile links
    const simLinks = edges
      .filter(e => newInternalNodes.some(n => n.id === e.source) && newInternalNodes.some(n => n.id === e.target))
      .map(e => ({ ...e, source: e.source, target: e.target }));

    // 2c. Update simulation data without blowing it up
    simulation.nodes(newInternalNodes);
    const linkForce = simulation.force('link') as d3.ForceLink<any, any>;
    if (linkForce) {
      linkForce.links(simLinks);
    }

    // 2d. Reheat: give the simulation enough energy to settle new nodes
    //     alpha(0.3) is strong enough for charge/link/x-flow to find equilibrium
    //     alongside the constant-strength AABB collision force.
    simulation.alpha(0.3).restart();

  }, [nodesLength, edgesLength]); // Run when nodes/edges are added/removed

  // 3. React to Physics Config Changes (Debug Sliders)
  useEffect(() => {
    const simulation = simulationRef.current;
    if (!simulation) return;

    simulation.velocityDecay(physicsConfig.velocityDecay);
    
    const chargeForce = simulation.force('charge') as d3.ForceManyBody<any>;
    if (chargeForce) chargeForce.strength(physicsConfig.chargeStrength);

    const linkForce = simulation.force('link') as d3.ForceLink<any, any>;
    if (linkForce) {
      linkForce.strength(physicsConfig.linkStrength).iterations(physicsConfig.linkIterations);
    }
    
    // Nudge the simulation so live slider tweaks take immediate effect
    simulation.alphaTarget(0.1).restart();
    setTimeout(() => {
      if (simulationRef.current) simulationRef.current.alphaTarget(0);
    }, 500);

  }, [physicsConfig]);
}
