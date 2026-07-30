"use client";

import { useEffect, useRef } from "react";
import { useCrtStore } from "../store/useCrtStore";

/**
 * Full-screen WebGL canvas overlay that renders:
 * - Animated film grain (noise)
 * - Vignette (dark edges)
 * 
 * Uses pointer-events: none so it never blocks interaction.
 * Blended on top of the page content.
 */

const VERTEX_SHADER = `#version 300 es
in vec2 a_position;
out vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 outColor;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_vignetteStrength;
uniform float u_vignetteRadius;
uniform float u_grainOpacity;

void main() {
  vec2 uv = v_uv;
  
  // --- Vignette ---
  vec2 centered = uv * 2.0 - 1.0;
  centered.x *= u_resolution.x / u_resolution.y; // correct aspect ratio
  float dist = length(centered);
  float vignette = smoothstep(u_vignetteRadius, u_vignetteRadius + 1.0, dist);
  vignette *= u_vignetteStrength;
  
  outColor = vec4(0.0, 0.0, 0.0, vignette);
}`;

function createShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("CRT shader compile error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl: WebGL2RenderingContext, vs: WebGLShader, fs: WebGLShader): WebGLProgram | null {
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("CRT program link error:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

export function GrainCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const glRef = useRef<{
    gl: WebGL2RenderingContext;
    program: WebGLProgram;
    locs: Record<string, WebGLUniformLocation | null>;
  } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2", {
      alpha: true,
      premultipliedAlpha: false,
      antialias: false,
    });
    if (!gl) {
      console.warn("CRT: WebGL2 not available");
      return;
    }

    const vs = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const program = createProgram(gl, vs, fs);
    if (!program) return;

    // Full-screen quad
    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const locs = {
      u_resolution: gl.getUniformLocation(program, "u_resolution"),
      u_vignetteStrength: gl.getUniformLocation(program, "u_vignetteStrength"),
      u_vignetteRadius: gl.getUniformLocation(program, "u_vignetteRadius"),
    };

    glRef.current = { gl, program, locs };

    /*
     * The shader output depends only on config + resolution (the vignette is
     * static), so there is no need for a perpetual rAF loop. Render a single
     * frame whenever the config changes or the window resizes. This also means
     * nothing runs while crtConfig.enabled is false, and prefers-reduced-motion
     * is inherently respected (no continuous animation).
     */
    function render() {
      const ctx = glRef.current;
      if (!ctx) return;
      const { gl, program, locs } = ctx;

      const config = useCrtStore.getState().crtConfig;

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      if (!config.enabled) return;

      gl.useProgram(program);
      gl.uniform2f(locs.u_resolution, canvas!.width, canvas!.height);
      gl.uniform1f(locs.u_vignetteStrength, config.vignetteStrength);
      gl.uniform1f(locs.u_vignetteRadius, config.vignetteRadius);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    // Coalesce render requests into a single frame
    const requestRender = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(render);
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
      requestRender();
    };

    resize();
    window.addEventListener("resize", resize);

    // Re-render when the CRT config changes (enable/disable, sliders)
    const unsubscribe = useCrtStore.subscribe((state, prevState) => {
      if (state.crtConfig !== prevState.crtConfig) {
        requestRender();
      }
    });

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      unsubscribe();
      glRef.current = null;
      gl.deleteBuffer(posBuffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{
        width: "100vw",
        height: "100vh",
        zIndex: 9999,
        mixBlendMode: "normal",
      }}
    />
  );
}
