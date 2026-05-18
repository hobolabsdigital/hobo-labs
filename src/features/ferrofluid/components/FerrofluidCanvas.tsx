'use client';

import React, { useEffect, useRef } from 'react';
import { FerrofluidSystem } from '../core/ferrofluid-system';
import { useTheme } from '@/core/theme/theme-provider';
import { useFerrofluidStore } from '../store/useFerrofluidStore';

export const FerrofluidCanvas = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const systemRef = useRef<FerrofluidSystem | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const dataArrayRef = useRef<Uint8Array>(new Uint8Array(0));

    const { theme } = useTheme();

    const config = useFerrofluidStore((s) => s.config);
    const setIsPlaying = useFerrofluidStore((s) => s.setIsPlaying);
    const setToggleAudioFn = useFerrofluidStore((s) => s.setToggleAudioFn);

    useEffect(() => {
        if (!canvasRef.current) return;

        const onInit = (instance: FerrofluidSystem) => {
            instance.run();
        };

        systemRef.current = new FerrofluidSystem(canvasRef.current, onInit);

        // Initial setup
        systemRef.current.setTheme(theme || 'dark');

        const handleResize = () => {
            if (systemRef.current) {
                systemRef.current.resize();
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (systemRef.current) {
                systemRef.current.destroy();
            }
        };
    }, []); // Only run once on mount

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (systemRef.current) {
                if (config.enableMouseTracking) {
                    // Normalize to -1 to 1
                    const x = (e.clientX / window.innerWidth) * 2 - 1;
                    const y = -(e.clientY / window.innerHeight) * 2 + 1;
                    systemRef.current.setMouse(x, y);
                } else {
                    // Move mouse out of view
                    systemRef.current.setMouse(9999.0, 9999.0);
                }
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (systemRef.current && e.touches.length > 0) {
                if (config.enableMouseTracking) {
                    const touch = e.touches[0];
                    const x = (touch.clientX / window.innerWidth) * 2 - 1;
                    const y = -(touch.clientY / window.innerHeight) * 2 + 1;
                    systemRef.current.setMouse(x, y);
                } else {
                    systemRef.current.setMouse(9999.0, 9999.0);
                }
            }
        };

        // If it was just toggled off, immediately clear the mouse pull effect
        if (!config.enableMouseTracking && systemRef.current) {
            systemRef.current.setMouse(9999.0, 9999.0);
        }

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('touchstart', handleTouchMove);
        window.addEventListener('touchmove', handleTouchMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchstart', handleTouchMove);
            window.removeEventListener('touchmove', handleTouchMove);
        };
    }, [config.enableMouseTracking]);

    useEffect(() => {
        if (systemRef.current) {
            systemRef.current.setTheme(theme || 'dark');
        }
    }, [theme]);

    useEffect(() => {
        if (systemRef.current) {
            systemRef.current.setParams(config);
        }
    }, [config]);

    // Setup Audio
    useEffect(() => {
        const playlist = ['/FerrofluidSystem.mp3', '/FerrofluidSystem2.mp3'];
        let currentTrack = 0;

        const audio = new Audio(playlist[currentTrack]);
        audio.crossOrigin = 'anonymous';
        audioRef.current = audio;

        // Create audio context but don't resume it until user interaction
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        audioContextRef.current = ctx;

        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;
        analyserRef.current = analyser;

        const source = ctx.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(ctx.destination);

        dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

        const toggleAudio = () => {
            if (audioRef.current) {
                if (audioContextRef.current?.state === 'suspended') {
                    audioContextRef.current.resume();
                }
                if (audioRef.current.paused) {
                    audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
                } else {
                    audioRef.current.pause();
                    setIsPlaying(false);
                }
            }
        };

        const playNext = () => {
            currentTrack = (currentTrack + 1) % playlist.length;
            audio.src = playlist[currentTrack];
            audio.play().then(() => setIsPlaying(true)).catch(console.error);
        };

        audio.addEventListener('ended', playNext);

        const tryPlay = () => {
            if (audio.paused) {
                audio.play().then(() => {
                    setIsPlaying(true);
                    if (audioContextRef.current?.state === 'suspended') {
                        audioContextRef.current.resume();
                    }
                }).catch((err) => {
                    console.log("Autoplay prevented. Waiting for user interaction...");
                });
            }
        };

        const isMobile = window.innerWidth <= 767;

        // If autoplay is blocked, try again on the first user interaction
        const onFirstInteraction = () => {
            tryPlay();
            window.removeEventListener('pointerdown', onFirstInteraction);
            window.removeEventListener('keydown', onFirstInteraction);
            window.removeEventListener('touchstart', onFirstInteraction);
        };

        if (!isMobile) {
            // Attempt autoplay immediately
            tryPlay();
            
            window.addEventListener('pointerdown', onFirstInteraction);
            window.addEventListener('keydown', onFirstInteraction);
            window.addEventListener('touchstart', onFirstInteraction);
        }

        setToggleAudioFn(toggleAudio);

        return () => {
            if (!isMobile) {
                window.removeEventListener('pointerdown', onFirstInteraction);
                window.removeEventListener('keydown', onFirstInteraction);
                window.removeEventListener('touchstart', onFirstInteraction);
            }
            setToggleAudioFn(null);
            audio.removeEventListener('ended', playNext);
            audio.pause();
            audio.src = '';
            ctx.close();
        };
    }, [setToggleAudioFn, setIsPlaying]);

    // Audio animation loop
    useEffect(() => {
        let raf: number;
        const loop = () => {
            if (analyserRef.current && dataArrayRef.current && systemRef.current && !audioRef.current?.paused) {
                analyserRef.current.getByteFrequencyData(dataArrayRef.current as any);

                // Focus on lower frequencies for a bass-heavy beat reaction
                let sum = 0;
                const bassBins = Math.floor(dataArrayRef.current.length * 0.3); // first 30% of bins

                for (let i = 0; i < bassBins; i++) {
                    sum += dataArrayRef.current[i];
                }
                const average = sum / bassBins;

                // Map 0-255 to 0-1 and apply a non-linear curve to make it punchy
                let audioLevel = average / 255.0;
                audioLevel = Math.pow(audioLevel, 2.0); // Curve the input so peaks are more dramatic

                systemRef.current.setAudioLevel(audioLevel);
            } else if (systemRef.current && audioRef.current?.paused) {
                // Decay back to 0 if paused
                systemRef.current.setAudioLevel(0);
            }

            raf = requestAnimationFrame(loop);
        };
        loop();
        return () => cancelAnimationFrame(raf);
    }, []);

    // Determine theme-specific opacity and blend mode to ensure visibility
    let opacityMultiplier = 1.0;
    const activeBlendMode = config.blendMode as any;

    if (theme === 'retro') {
        opacityMultiplier = 1.4; // Reduced from 2.8 to improve text legibility 
    } else if (theme === 'brutalist') {
        opacityMultiplier = 3.33; // Boost opacity to 1.0
    } else if (theme === 'blueprint') {
        opacityMultiplier = 1.5; // Boost to ~0.45
    } else if (theme === 'cyberpunk') {
        opacityMultiplier = 2.0; // Boost to ~0.6
    }

    const finalOpacity = Math.min(1.0, config.canvasOpacity * opacityMultiplier);

    return (
        <div
            className="fixed inset-0 z-[-10] overflow-hidden pointer-events-none"
            style={{
                background: 'transparent',
                opacity: finalOpacity,
                mixBlendMode: activeBlendMode
            }}
        >
            <canvas
                ref={canvasRef}
                className="w-full h-full block"
            />
        </div>
    );
};
