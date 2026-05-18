import { mat4, vec3 } from "gl-matrix";
import * as twgl from "twgl.js";

import sphereVert from '../shaders/sphere_vert';
import sphereFrag from '../shaders/sphere_frag';
import quadVert from '../shaders/quad_vert';
import dofFrag from '../shaders/dof_frag';

export class FerrofluidSystem {
    private gl: WebGL2RenderingContext;
    private programInfo: twgl.ProgramInfo;
    private dofProgramInfo: twgl.ProgramInfo;
    private bufferInfo: twgl.BufferInfo;
    private quadBufferInfo: twgl.BufferInfo;
    private fboInfo: twgl.FramebufferInfo;
    private requestAnimationId: number = 0;

    private time: number = 0;
    private theme: string = 'default';
    private mouse: { x: number, y: number } = { x: 0, y: 0 };
    private targetMouse: { x: number, y: number } = { x: 0, y: 0 };
    private cameraPosition: vec3 = [0, 0, 5];

    // Audio band state (smoothed on the JS side before arriving here)
    private audioBass: number = 0;
    private audioMids: number = 0;
    private audioHighs: number = 0;
    private audioEnergy: number = 0;
    private audioTransient: number = 0;

    private mouseVelocity: number = 0;
    private params: any = {
        noiseSpeed: 0.001,
        noiseScale: 1.3,
        spikeHeight: 0.15,
        audioMultiplier: 0.5,
        cameraZ: 5.0,
        mouseInfluence: 1.5,
        mousePullStrength: 0.4,
        dofStrength: 0.8,
        focusDistance: 3.5,
        zoomAmount: 1.2,
        parallaxAmount: 0.5,
        orbitAmount: 0.4,
    };

    constructor(canvas: HTMLCanvasElement, onInit?: (instance: FerrofluidSystem) => void) {
        // Initialize WebGL2 with alpha for a transparent background
        const gl = canvas.getContext('webgl2', {
            alpha: true,
            premultipliedAlpha: false,
            antialias: true
        });

        if (!gl) {
            throw new Error('WebGL2 is not supported');
        }

        this.gl = gl;

        // Compile Shaders
        this.programInfo = twgl.createProgramInfo(gl, [sphereVert, sphereFrag]);
        this.dofProgramInfo = twgl.createProgramInfo(gl, [quadVert, dofFrag]);

        // Create Sphere Buffer (Subdivisions around 128 for good displacement detail)
        this.bufferInfo = twgl.primitives.createSphereBufferInfo(gl, 1.5, 128, 128);
        this.quadBufferInfo = twgl.primitives.createXYQuadBufferInfo(gl);

        // Framebuffer for post-processing
        this.fboInfo = twgl.createFramebufferInfo(gl, [
            { internalFormat: gl.RGBA8, format: gl.RGBA, type: gl.UNSIGNED_BYTE, min: gl.LINEAR, wrap: gl.CLAMP_TO_EDGE },
            { internalFormat: gl.DEPTH_COMPONENT32F, format: gl.DEPTH_COMPONENT, type: gl.FLOAT }
        ]);

        if (onInit) {
            onInit(this);
        }
    }

    setTheme(theme: string) {
        this.theme = theme;
    }

    setMouse(x: number, y: number) {
        this.targetMouse = { x, y };
    }

    /** @deprecated Use setAudioBands instead */
    setAudioLevel(level: number) {
        // Backward compat: map single level to bass-only
        this.audioBass += (level - this.audioBass) * 0.2;
    }

    setAudioBands(bass: number, mids: number, highs: number, energy: number, transient: number) {
        // Smooth on arrival to prevent GPU-side jitter
        const smoothRate = 0.25;
        this.audioBass += (bass - this.audioBass) * smoothRate;
        this.audioMids += (mids - this.audioMids) * smoothRate;
        this.audioHighs += (highs - this.audioHighs) * smoothRate;
        this.audioEnergy += (energy - this.audioEnergy) * 0.15; // slower for envelope
        this.audioTransient += (transient - this.audioTransient) * 0.4; // faster for attacks
    }

    setParams(params: any) {
        this.params = { ...this.params, ...params };
        if (params.cameraZ !== undefined) {
            this.cameraPosition[2] = params.cameraZ;
        }
    }

    resize() {
        if (!this.gl) return;
        if (twgl.resizeCanvasToDisplaySize(this.gl.canvas as HTMLCanvasElement, window.devicePixelRatio || 1)) {
            // Resize FBO if canvas resized
            twgl.resizeFramebufferInfo(this.gl, this.fboInfo, [
                { internalFormat: this.gl.RGBA8, format: this.gl.RGBA, type: this.gl.UNSIGNED_BYTE, min: this.gl.LINEAR, wrap: this.gl.CLAMP_TO_EDGE },
                { internalFormat: this.gl.DEPTH_COMPONENT32F, format: this.gl.DEPTH_COMPONENT, type: this.gl.FLOAT }
            ]);
        }
    }

    private updateMouse() {
        const dx = this.targetMouse.x - this.mouse.x;
        const dy = this.targetMouse.y - this.mouse.y;

        // Calculate velocity (movement magnitude) and smooth it
        const currentVelocity = Math.sqrt(dx * dx + dy * dy);
        this.mouseVelocity += (currentVelocity - this.mouseVelocity) * 0.1;

        // Smoothly interpolate mouse for organic feel
        this.mouse.x += dx * 0.05;
        this.mouse.y += dy * 0.05;
    }

    run() {
        let lastTime = 0;

        const render = (time: number) => {
            const dt = time - lastTime;
            lastTime = time;

            // Accumulate time for fluid simulation
            this.time += dt;

            this.updateMouse();
            this.resize();

            const gl = this.gl;

            // --- PASS 1: Render scene to FBO ---
            twgl.bindFramebufferInfo(gl, this.fboInfo);
            gl.viewport(0, 0, this.fboInfo.width, this.fboInfo.height);

            // Clear canvas fully transparent
            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            gl.enable(gl.DEPTH_TEST);
            gl.enable(gl.CULL_FACE); // Optimize by culling backfaces
            gl.cullFace(gl.BACK);

            // Setup Matrices
            const aspect = gl.canvas.width / gl.canvas.height;
            const projectionMatrix = mat4.perspective(mat4.create(), 45 * Math.PI / 180, aspect, 0.1, 100.0);

            // Parallax and zoom based on mouse position
            const mouseMag = Math.sqrt(this.mouse.x * this.mouse.x + this.mouse.y * this.mouse.y);
            const zoomOffset = mouseMag * this.params.zoomAmount;

            const parallaxX = this.mouse.x * this.params.parallaxAmount;
            const parallaxY = -this.mouse.y * this.params.parallaxAmount; // WebGL Y is up, but mouse Y is typically inverted

            const currentEye: vec3 = [
                this.cameraPosition[0] + parallaxX,
                this.cameraPosition[1] + parallaxY,
                this.cameraPosition[2] + zoomOffset
            ];

            const viewMatrix = mat4.lookAt(
                mat4.create(),
                currentEye, // Eye
                [parallaxX * 0.3, parallaxY * 0.3, 0], // Center (follows eye slightly for parallax feel)
                [0, 1, 0]  // Up
            );

            // Subtle orbit effect based on mouse position
            const worldMatrix = mat4.create();
            // Rotate around Y axis based on mouse X
            mat4.rotateY(worldMatrix, worldMatrix, this.mouse.x * this.params.orbitAmount);
            // Rotate around X axis based on mouse Y
            mat4.rotateX(worldMatrix, worldMatrix, -this.mouse.y * this.params.orbitAmount);

            // Setup Theme Colors
            let color1 = [0.0, 0.33, 0.67]; // Default Blue
            let color2 = [0.8, 0.9, 1.0];   // Default Light

            if (this.theme === 'cyberpunk') {
                color1 = [0.8, 0.1, 0.4]; // Neon Pink
                color2 = [0.2, 0.9, 0.8]; // Cyan
            } else if (this.theme === 'blueprint') {
                color1 = [0.05, 0.1, 0.4]; // Deep Blue
                color2 = [0.9, 0.9, 1.0]; // Bright White/Light Blue
            } else if (this.theme === 'retro') {
                color1 = [0.91, 0.4, 0.54]; // Warm Pink (#E8668A)
                color2 = [1.0, 0.55, 0.26]; // Orange (#FF8C42)
            } else if (this.theme === 'brutalist') {
                color1 = [0.04, 0.04, 0.04]; // Black (#0A0A0A)
                color2 = [0.09, 0.87, 0.95]; // Cyan (#17DFF1)
            }

            // Draw Scene
            gl.useProgram(this.programInfo.program);
            twgl.setBuffersAndAttributes(gl, this.programInfo, this.bufferInfo);
            twgl.setUniforms(this.programInfo, {
                u_worldMatrix: worldMatrix,
                u_viewMatrix: viewMatrix,
                u_projectionMatrix: projectionMatrix,
                u_cameraPosition: currentEye,
                u_time: this.time,
                u_mouse: [this.mouse.x, this.mouse.y],
                u_color1: color1,
                u_color2: color2,
                // Emotional audio bands
                u_audioBass: this.audioBass,
                u_audioMids: this.audioMids,
                u_audioHighs: this.audioHighs,
                u_audioEnergy: this.audioEnergy,
                u_audioTransient: this.audioTransient,
                // Config params
                u_noiseSpeed: this.params.noiseSpeed,
                u_noiseScale: this.params.noiseScale,
                u_spikeHeight: this.params.spikeHeight,
                u_audioMultiplier: this.params.audioMultiplier,
                u_mouseInfluence: this.params.mouseInfluence,
                u_mousePullStrength: this.params.mousePullStrength,
                // Audio sensitivity (from debug sliders)
                u_energyFloor: this.params.energyFloor ?? 0.15,
                u_bassPunch: this.params.bassPunch ?? 0.12,
                u_midsDetail: this.params.midsDetail ?? 0.3,
                u_highsShimmer: this.params.highsShimmer ?? 0.02,
                u_transientCrack: this.params.transientCrack ?? 0.02,
                u_fresnelBoost: this.params.fresnelBoost ?? 0.8,
            });

            twgl.drawBufferInfo(gl, this.bufferInfo);

            // --- PASS 2: Depth of Field Post-Process ---
            twgl.bindFramebufferInfo(gl, null); // Render to canvas
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.disable(gl.DEPTH_TEST);
            gl.disable(gl.CULL_FACE);

            gl.useProgram(this.dofProgramInfo.program);
            twgl.setBuffersAndAttributes(gl, this.dofProgramInfo, this.quadBufferInfo);
            
            // Dynamically scale DoF strength based on mouse distance from center
            let dynamicDofStrength = 0;
            if (this.mouse.x < 1000.0) {
                const mag = Math.min(1.0, mouseMag);
                dynamicDofStrength = this.params.dofStrength * (mag * mag);
            }

            // Transient-driven chromatic aberration boost
            const caBoost = Math.max(0, this.audioTransient) * 0.05;

            twgl.setUniforms(this.dofProgramInfo, {
                u_colorTexture: this.fboInfo.attachments[0],
                u_depthTexture: this.fboInfo.attachments[1],
                u_resolution: [gl.canvas.width, gl.canvas.height],
                u_focusDistance: this.params.focusDistance,
                u_dofStrength: dynamicDofStrength,
                u_caBoost: caBoost,
                u_audioEnergy: this.audioEnergy
            });

            twgl.drawBufferInfo(gl, this.quadBufferInfo);

            this.requestAnimationId = requestAnimationFrame(render);
        };

        this.requestAnimationId = requestAnimationFrame(render);
    }

    destroy() {
        if (this.requestAnimationId) {
            cancelAnimationFrame(this.requestAnimationId);
        }
        // Additional WebGL cleanup could go here
    }
}
