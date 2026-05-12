import { useEffect } from 'react';
import { useBeeStore, BrainMode } from '../store/useBeeStore';
import { useCanvasStore } from '../store/useCanvasStore';

export function useSwarmPhysics(type: BrainMode) {
  // Boids algorithm loop
  useEffect(() => {
    let animationFrameId: number;

    const loop = () => {
      const state = useBeeStore.getState();
      const rfInstance = useCanvasStore.getState().rfInstance;
      const targetId = state.swarmTarget[type];
      
      let targetPos: {x: number, y: number} | null = null;
      if (targetId && rfInstance) {
        if (targetId === 'global') {
          targetPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        } else {
          const node = useCanvasStore.getState().nodes.find(n => n.id === targetId);
          if (node) {
            targetPos = rfInstance.flowToScreenPosition({ x: node.position.x, y: node.position.y });
          }
        }
      }

      const nodesArray = useCanvasStore.getState().nodes;
      const setNodes = useCanvasStore.getState().setNodes;

      const beesArr = Object.values(state.bees).filter(b => b.type === type);
      const perceptionRadius = 150;
      const maxSpeed = 5;
      const maxForce = 0.2;

      // Temporary node nudging check
      let modifiedNodes = false;
      const newNodes = state.activeMischief === 'float_nodes' ? [...nodesArray] : nodesArray;

      beesArr.forEach((bee) => {
        let alignX = 0, alignY = 0;
        let cohesionX = 0, cohesionY = 0;
        let sepX = 0, sepY = 0;
        let total = 0;

        beesArr.forEach(other => {
          if (bee.id !== other.id) {
            const dx = bee.position.x - other.position.x;
            const dy = bee.position.y - other.position.y;
            const d = Math.sqrt(dx*dx + dy*dy);
            
            if (d < perceptionRadius) {
              alignX += other.velocity.x;
              alignY += other.velocity.y;
              cohesionX += other.position.x;
              cohesionY += other.position.y;
              total++;
            }
            if (d < 80 && d > 0) { // Increased separation radius
              sepX += (dx / d) * (80 - d); // stronger push the closer they are
              sepY += (dy / d) * (80 - d);
            }
          }
        });

        if (total > 0) {
          alignX /= total; alignY /= total;
          cohesionX /= total; cohesionY /= total;
          
          // Steer towards cohesion
          cohesionX -= bee.position.x;
          cohesionY -= bee.position.y;
        }

        if (state.isSleeping) {
          bee.velocity.x *= 0.8; // increased air friction
          bee.velocity.y += 0.5; // gravity
          
          // bounce on the floor
          if (bee.position.y >= window.innerHeight - 30) {
            bee.position.y = window.innerHeight - 30;
            bee.velocity.y *= -0.3; // low bounce
            
            // Apply heavy friction to kill remaining velocity completely when on the floor
            bee.velocity.x *= 0.5; 
            
            // Hard stop if velocity is very small to prevent micro-vibrations
            if (Math.abs(bee.velocity.x) < 0.1) bee.velocity.x = 0;
            if (Math.abs(bee.velocity.y) < 0.1) bee.velocity.y = 0;
          }
        } else {
          // Apply flocking forces only when awake
          bee.velocity.x += (alignX * 0.05) + (cohesionX * 0.005) + (sepX * 0.05);
          bee.velocity.y += (alignY * 0.05) + (cohesionY * 0.005) + (sepY * 0.05);

          // Target gathering force - much stronger so they stick to nodes when panning
          if (targetPos) {
            const tx = targetPos.x - bee.position.x;
            const ty = targetPos.y - bee.position.y;
            const d = Math.sqrt(tx*tx + ty*ty);
            if (d > 0) {
              // If they are far, fly fast. If close, circle around it.
              const pull = d > 200 ? 0.5 : 0.1;
              bee.velocity.x += (tx / d) * pull;
              bee.velocity.y += (ty / d) * pull;
            }
          }

          // Add some random noise
          bee.velocity.x += (Math.random() - 0.5) * 1.5;
          bee.velocity.y += (Math.random() - 0.5) * 1.5;

          // Edge avoidance steering
          const margin = 150;
          const turnFactor = 0.5;
          if (bee.position.x < margin) bee.velocity.x += turnFactor;
          if (bee.position.x > window.innerWidth - margin) bee.velocity.x -= turnFactor;
          if (bee.position.y < margin) bee.velocity.y += turnFactor;
          if (bee.position.y > window.innerHeight - margin) bee.velocity.y -= turnFactor;

          // Limit speed
          const speed = Math.sqrt(bee.velocity.x*bee.velocity.x + bee.velocity.y*bee.velocity.y);
          if (speed > maxSpeed) {
            bee.velocity.x = (bee.velocity.x / speed) * maxSpeed;
            bee.velocity.y = (bee.velocity.y / speed) * maxSpeed;
          }
        }

        // Update position
        bee.position.x += bee.velocity.x;
        bee.position.y += bee.velocity.y;

        // Hard bounds fallback just in case
        const padding = 24;
        if (bee.position.x > window.innerWidth - padding) { bee.position.x = window.innerWidth - padding; bee.velocity.x *= -1; }
        if (bee.position.x < padding) { bee.position.x = padding; bee.velocity.x *= -1; }
        if (bee.position.y > window.innerHeight - padding) { bee.position.y = window.innerHeight - padding; bee.velocity.y *= -1; }
        if (bee.position.y < padding) { bee.position.y = padding; bee.velocity.y *= -1; }

        // Update DOM element directly
        const domNode = document.getElementById(`bee-${bee.id}`);
        if (domNode) {
          const isMovingRight = bee.velocity.x > 0;
          domNode.style.transform = `translate(${bee.position.x}px, ${bee.position.y}px) scaleX(${isMovingRight ? -1 : 1})`;
        }

        // Node nudging logic
        if (state.activeMischief === 'float_nodes' && rfInstance) {
          const projectedPos = rfInstance.screenToFlowPosition({ x: bee.position.x, y: bee.position.y });
          newNodes.forEach((n, i) => {
            const ndx = n.position.x - projectedPos.x;
            const ndy = n.position.y - projectedPos.y;
            const ndist = Math.sqrt(ndx*ndx + ndy*ndy);
            // Snap to 50px grid upon bump
            if (ndist < 40) {
              modifiedNodes = true;
              newNodes[i] = {
                ...n,
                position: { 
                  x: Math.round((n.position.x + (ndx > 0 ? 50 : -50)) / 50) * 50, 
                  y: Math.round((n.position.y + (ndy > 0 ? 50 : -50)) / 50) * 50 
                }
              };
            }
          });
        }
      });

      if (modifiedNodes && state.activeMischief === 'float_nodes') {
        setNodes(newNodes);
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [type]);
}
