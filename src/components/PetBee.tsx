"use client";

import React, { useEffect } from 'react';
import { useBeeStore } from '../store/useBeeStore';
import { BeeIcon } from './BeeIcon';

export const PetBee = React.memo(function PetBee({ id }: { id: string }) {
  const bee = useBeeStore(state => state.bees[id]);
  const activeMischief = useBeeStore(state => state.activeMischief);
  const isSleeping = useBeeStore(state => state.isSleeping);

  if (!bee) return null;

  return (
    <div
      id={`bee-${id}`}
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        zIndex: 9999, 
        pointerEvents: 'none',
        // Initialize at its start position to avoid a flash at 0,0
        transform: `translate(${bee.position.x}px, ${bee.position.y}px)`
      }}
      className={`${activeMischief !== 'none' ? 'animate-pulse' : ''}`}
    >
      <div className="relative group w-12 h-12">
        <BeeIcon beeType={bee.type} isSleeping={isSleeping} className="w-full h-full drop-shadow-lg" />
        {bee.mood === 'mischievous' && (
          <span className="absolute -top-4 -right-2 text-[10px] bg-black text-white px-1 font-mono">
            BUZZ...
          </span>
        )}
      </div>
    </div>
  );
});
