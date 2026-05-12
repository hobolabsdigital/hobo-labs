import React, { useEffect, useRef } from 'react';
import { useBeeStore, BrainMode } from '../store/useBeeStore';
import { PetBee } from './PetBee';
import { useSwarmAgent } from '../hooks/useSwarmAgent';
import { useSwarmPhysics } from '../hooks/useSwarmPhysics';

export function Swarm({ count = 3, type = 'worker' }: { count?: number, type?: BrainMode }) {
  const bees = useBeeStore(state => state.bees);
  const addBees = useBeeStore(state => state.addBees);
  const initialized = useRef(false);

  // Initialize bees for this instance
  useEffect(() => {
    if (!initialized.current) {
      addBees(count, type);
      initialized.current = true;
    }
  }, [addBees, count, type]);

  // Use Custom Hooks for Physics & AI Agent Interaction
  useSwarmPhysics(type);
  const { executeTick } = useSwarmAgent(type);

  const manualOverride = useBeeStore(state => state.manualOverride);
  const forceTickCount = useBeeStore(state => state.forceTick[type]);

  // Interval Tick
  useEffect(() => {
    if (manualOverride) return;
    const tick = setInterval(() => {
      executeTick();
    }, 60000); // Check every minute
    return () => clearInterval(tick);
  }, [manualOverride, executeTick]);

  // Force Tick Trigger
  const lastForceTick = useRef(forceTickCount);
  useEffect(() => {
    if (forceTickCount > lastForceTick.current) {
      lastForceTick.current = forceTickCount;
      executeTick();
    }
  }, [forceTickCount, executeTick]);

  const instanceBees = Object.values(bees).filter(b => b.type === type);

  return (
    <>
      {instanceBees.map(bee => (
        <PetBee 
          key={bee.id} 
          id={bee.id} 
        />
      ))}
    </>
  );
}
