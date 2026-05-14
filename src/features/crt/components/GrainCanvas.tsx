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

// Hash-based noise (no texture needed)
float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float grain(vec2 uv, float t) {
  return hash(uv * u_resolution + vec2(t * 100.0, t * 57.0));
}

void main() {
  vec2 uv = v_uv;
  
  // --- Vignette ---
  vec2 centered = uv * 2.0 - 1.0;
  centered.x *= u_resolution.x / u_resolution.y; // correct aspect ratio
  float dist = length(centered);
  float vignette = smoothstep(u_vignetteRadius, u_vignetteRadius + 1.0, dist);
  vignette *= u_vignetteStrength;
  
  // --- Film Grain ---
  float noise = grain(uv, u_time) * 2.0 - 1.0; // -1 to 1
  float grainEffect = noise * u_grainOpacity;
  
  // Combine: vignette darkens, grain adds texture
  // Output as premultiplied alpha for proper blending
  float darkness = vignette;
  outColor = vec4(
    grainEffect - darkness,
    grainEffect - darkness,
    grainEffect - darkness,
    max(darkness, abs(grainEffect))
  );
  
  // Simple additive grain + subtractive vignette
  outColor = vec4(vec3(grainEffect), 0.0) + vec4(0.0, 0.0, 0.0, darkness);
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
      u_time: gl.getUniformLocation(program, "u_time"),
      u_resolution: gl.getUniformLocation(program, "u_resolution"),
      u_vignetteStrength: gl.getUniformLocation(program, "u_vignetteStrength"),
      u_vignetteRadius: gl.getUniformLocation(program, "u_vignetteRadius"),
      u_grainOpacity: gl.getUniformLocation(program, "u_grainOpacity"),
    };

    glRef.current = { gl, program, locs };

    // Enable blending for the overlay
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    resize();
    window.addEventListener("resize", resize);

    const startTime = performance.now();

    function render() {
      const ctx = glRef.current;
      if (!ctx) return;
      const { gl, program, locs } = ctx;

      const config = useCrtStore.getState().crtConfig;
      const time = ((performance.now() - startTime) / 1000) * config.grainSpeed;

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      if (!config.enabled) {
        rafRef.current = requestAnimationFrame(render);
        return;
      }

      gl.useProgram(program);
      gl.uniform1f(locs.u_time, time);
      gl.uniform2f(locs.u_resolution, canvas!.width, canvas!.height);
      gl.uniform1f(locs.u_vignetteStrength, config.vignetteStrength);
      gl.uniform1f(locs.u_vignetteRadius, config.vignetteRadius);
      gl.uniform1f(locs.u_grainOpacity, config.grainOpacity);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      rafRef.current = requestAnimationFrame(render);
    }

    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
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
