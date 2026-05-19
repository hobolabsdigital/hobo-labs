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
    }, [theme]); // Run when theme changes to setup the correct mode

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
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioContextClass();
        audioContextRef.current = ctx;

        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512; // 256 bins, ~86Hz resolution for better band separation
        analyser.smoothingTimeConstant = 0.75;
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
                    audioRef.current.play().then(() => setIsPlaying(true)).catch((err: Error) => console.error(err));
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
                }).catch(() => {
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

    // Multi-band audio analysis loop
    useEffect(() => {
        let raf: number;

        // Adaptive gain: running peak trackers per band (~3s decay at 60fps)
        const PEAK_DECAY = 0.997;
        let peakBass = 0.01;
        let peakMids = 0.01;
        let peakHighs = 0.01;
        let peakEnergy = 0.01;

        // Envelope state
        let smoothEnergy = 0;
        let prevEnergy = 0;
        let smoothTransient = 0;

        const loop = () => {
            if (analyserRef.current && dataArrayRef.current && systemRef.current) {
                const isPlaying = !audioRef.current?.paused;

                if (isPlaying) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    analyserRef.current.getByteFrequencyData(dataArrayRef.current as any);
                    const bins = dataArrayRef.current;
                    const numBins = bins.length; // 256 with fftSize=512

                    // Band boundaries (fftSize=512, sampleRate=44100, ~86Hz/bin)
                    // Bass (sub-bass+bass): 0-550 Hz → bins 0-6
                    const bassEnd = 7;
                    // Mids: 550-3400 Hz → bins 7-39
                    const midsEnd = 40;
                    // Highs: 3400+ Hz → bins 40-255

                    let bassSum = 0, midsSum = 0, highsSum = 0;
                    for (let i = 0; i < bassEnd; i++) bassSum += bins[i];
                    for (let i = bassEnd; i < midsEnd; i++) midsSum += bins[i];
                    for (let i = midsEnd; i < numBins; i++) highsSum += bins[i];

                    const rawBass = bassSum / bassEnd / 255;
                    const rawMids = midsSum / (midsEnd - bassEnd) / 255;
                    const rawHighs = highsSum / (numBins - midsEnd) / 255;

                    // Adaptive gain: normalize against running peak
                    peakBass = Math.max(peakBass * PEAK_DECAY, rawBass);
                    peakMids = Math.max(peakMids * PEAK_DECAY, rawMids);
                    peakHighs = Math.max(peakHighs * PEAK_DECAY, rawHighs);

                    const normBass = peakBass > 0.001 ? rawBass / peakBass : 0;
                    const normMids = peakMids > 0.001 ? rawMids / peakMids : 0;
                    const normHighs = peakHighs > 0.001 ? rawHighs / peakHighs : 0;

                    // Energy envelope with asymmetric attack/decay
                    const rawEnergy = (rawBass * 0.4 + rawMids * 0.4 + rawHighs * 0.2);
                    const attackRate = 0.3;   // fast attack (~50ms)
                    const releaseRate = 0.008; // slow release (~800ms)
                    const rate = rawEnergy > smoothEnergy ? attackRate : releaseRate;
                    smoothEnergy += (rawEnergy - smoothEnergy) * rate;

                    peakEnergy = Math.max(peakEnergy * PEAK_DECAY, smoothEnergy);
                    const normEnergy = peakEnergy > 0.001 ? smoothEnergy / peakEnergy : 0;

                    // Transient detection (energy derivative)
                    const rawTransient = smoothEnergy - prevEnergy;
                    prevEnergy = smoothEnergy;
                    const transientAttack = rawTransient > smoothTransient ? 0.5 : 0.05;
                    smoothTransient += (rawTransient - smoothTransient) * transientAttack;
                    const normTransient = Math.max(-1, Math.min(1, smoothTransient * 50));

                    // Non-linear curves for punchiness
                    const bass = Math.pow(normBass, 1.5);
                    const mids = Math.pow(normMids, 1.2);
                    const highs = normHighs; // already sparse, don't compress

                    systemRef.current.setAudioBands(bass, mids, highs, normEnergy, normTransient);
                } else {
                    // Decay all bands smoothly when paused
                    systemRef.current.setAudioBands(0, 0, 0, 0, 0);
                }
            }

            raf = requestAnimationFrame(loop);
        };
        loop();
        return () => cancelAnimationFrame(raf);
    }, []);

    // Determine theme-specific opacity and blend mode to ensure visibility
    let opacityMultiplier = 1.0;
    const activeBlendMode = config.blendMode as import('react').CSSProperties['mixBlendMode'];

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
