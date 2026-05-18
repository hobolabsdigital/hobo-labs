'use client';

import React, { useEffect, useRef } from 'react';
import { Sketch } from '../core/sketch-04';
import { useTheme } from '@/core/theme/theme-provider';

export const FerrofluidCanvas = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sketchRef = useRef<Sketch | null>(null);
    const typingEnergyRef = useRef(0);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const { theme } = useTheme();

    useEffect(() => {
        if (!canvasRef.current) return;

        // Custom control mimicking AudioControl but for typing
        const typingControl = {
            isInitialized: true,
            getValue: () => {
                // Decay the energy smoothly
                typingEnergyRef.current *= 0.95;
                if (typingEnergyRef.current < 0.01) typingEnergyRef.current = 0;
                return Math.min(1, typingEnergyRef.current);
            }
        };

        const onInit = (instance: Sketch) => {
            instance.run();
            // Start entry animation
            // instance.entryProgress is internal but we can trigger it or let it run
            // It automatically runs `this.entryProgress += this.#deltaFrames;`
        };

        const onEntryAnimationDone = () => {
            console.log('Ferrofluid entry done');
        };

        sketchRef.current = new Sketch(
            canvasRef.current,
            typingControl,
            onInit,
            onEntryAnimationDone,
            false // isDev
        );

        const handleResize = () => {
            if (sketchRef.current) {
                sketchRef.current.resize();
            }
        };

        window.addEventListener('resize', handleResize);
        
        return () => {
            window.removeEventListener('resize', handleResize);
            if (sketchRef.current) {
                sketchRef.current.destroy();
            }
        };
    }, []);

    useEffect(() => {
        const handleKeyDown = () => {
            typingEnergyRef.current = Math.min(1.0, typingEnergyRef.current + 0.15);
            
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            
            typingTimeoutRef.current = setTimeout(() => {
                // Reset happens organically via decay, but we could force clear
            }, 500);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div 
            className="fixed inset-0 z-[-1] overflow-hidden pointer-events-auto"
            style={{ 
                background: '#0a0a0a',
                // CSS filter based on theme
                filter: theme === 'cyberpunk' 
                    ? 'sepia(0.5) hue-rotate(-45deg) saturate(2) brightness(0.8) contrast(1.5)' 
                    : theme === 'blueprint'
                    ? 'invert(1) hue-rotate(180deg) saturate(0) contrast(1.2)'
                    : 'none'
            }}
        >
            <canvas 
                ref={canvasRef} 
                className="w-full h-full block touch-none"
            />
        </div>
    );
};
