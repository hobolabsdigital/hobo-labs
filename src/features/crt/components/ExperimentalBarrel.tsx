"use client";

import { useEffect, useRef } from "react";
import { useCrtStore } from "../store/useCrtStore";

/**
 * Experimental CRT barrel distortion using drawElementImage.
 *
 * Follows the HyperFrames pattern:
 *   1. <canvas id="crt-capture" layoutsubtree> wraps <main> (in page.tsx)
 *   2. ctx = captureCanvas.getContext("2d")
 *   3. ctx.drawElementImage(main, 0, 0, w, h) — rasterize DOM into canvas
 *   4. gl.texImage2D(..., captureCanvas) — upload as WebGL texture
 *   5. Barrel distortion fragment shader renders to output canvas
 */

const VERT = `#version 300 es
in vec2 aPosition;
out vec2 vUv;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;

uniform sampler2D uTexture;
uniform float uBarrelStrength;
uniform float uAberrationOffset;
uniform float uVignetteStrength;
uniform float uVignetteRadius;
uniform float uGrainOpacity;
uniform float uTime;
uniform vec2 uResolution;
uniform float uCornerRadius;
uniform float uEdgeSoftness;
uniform float uTopDarken;

float rand(vec3 p) {
  return fract(sin(dot(p, vec3(829., 4839., 432.))) * 39428.);
}

vec2 barrelDistortion(vec2 uv, float k) {
  vec2 p = uv * 2.0 - 1.0;
  float r2 = dot(p, p);
  p *= 1.0 + k * r2;
  return p * 0.5 + 0.5;
}

// Rounded rectangle SDF — returns 0 inside, positive outside
float roundedRectSDF(vec2 p, vec2 halfSize, float radius) {
  vec2 d = abs(p) - halfSize + radius;
  return length(max(d, 0.0)) - radius;
}

void main() {
  vec2 uv = vec2(vUv.x, 1.0 - vUv.y);

  float k = uBarrelStrength * 0.0015;
  float abr = uAberrationOffset * 0.0003;

  vec2 uvR = barrelDistortion(uv, k + abr);
  vec2 uvG = barrelDistortion(uv, k);
  vec2 uvB = barrelDistortion(uv, k - abr);

  float bR = step(0.0, uvR.x) * step(uvR.x, 1.0) * step(0.0, uvR.y) * step(uvR.y, 1.0);
  float bG = step(0.0, uvG.x) * step(uvG.x, 1.0) * step(0.0, uvG.y) * step(uvG.y, 1.0);
  float bB = step(0.0, uvB.x) * step(uvB.x, 1.0) * step(0.0, uvB.y) * step(uvB.y, 1.0);

  float r = texture(uTexture, uvR).r * bR;
  float g = texture(uTexture, uvG).g * bG;
  float b = texture(uTexture, uvB).b * bB;

  outColor = vec4(r, g, b, 1.0);

  // --- CRT screen bezel (rounded border frame) ---
  // Create a rounded rectangle that is SMALLER than the viewport.
  // Everything outside it fades to black, creating a CRT monitor frame.
  vec2 centered = vUv * 2.0 - 1.0;
  float aspect = uResolution.x / uResolution.y;
  vec2 scaled = centered * vec2(aspect, 1.0);
  // Shrink the "screen" area — cornerRadius controls how much border is visible
  float inset = uCornerRadius * 0.5;
  vec2 screenSize = vec2(aspect - inset, 1.0 - inset);
  float cornerRound = uCornerRadius * 0.8; // actual corner rounding
  float dist = roundedRectSDF(scaled, screenSize, cornerRound);
  // edgeSoftness: 0 = razor-sharp cutoff, 0.3 = very soft glow
  float mask = 1.0 - smoothstep(0.0, uEdgeSoftness + 0.005, dist);
  outColor.rgb *= mask;

  // --- Vignette (soft edge darkening) ---
  vec2 vig = vUv * (1.0 - vUv);
  float vigRaw = vig.x * vig.y * 15.0;
  float vigFactor = pow(vigRaw, uVignetteRadius * 1.5);
  outColor.rgb *= mix(1.0, vigFactor, uVignetteStrength);

  // --- Top gradient darkening (for logo visibility) ---
  float topDarken = smoothstep(0.0, 0.45, 1.0 - vUv.y);
  outColor.rgb *= mix(1.0, topDarken, uTopDarken);

  // --- Film grain ---
  vec2 p = vUv * 2.0 - 1.0;
  outColor.rgb += (rand(vec3(p * uResolution.xy * 0.5, uTime)) - 0.5) * uGrainOpacity * 2.0;
}
`;

export function ExperimentalBarrel() {
  const glRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    let destroyed = false;

    function trySetup() {
      const glCanvas = glRef.current;
      if (destroyed || !glCanvas) return;

      const captureCanvas = document.getElementById("crt-capture") as HTMLCanvasElement | null;
      if (!captureCanvas) {
        console.warn("[CRT Exp] Waiting for #crt-capture...");
        setTimeout(trySetup, 200);
        return;
      }

      const ctx2d = captureCanvas.getContext("2d");
      if (!ctx2d || typeof (ctx2d as any).drawElementImage !== "function") {
        console.error("[CRT Exp] drawElementImage not available — falling back to standard");
        useCrtStore.getState().setCrtMode("standard");
        return;
      }

      const mainEl = captureCanvas.querySelector("#crt-main") as HTMLElement | null;
      if (!mainEl) {
        console.warn("[CRT Exp] Waiting for #crt-main...");
        setTimeout(trySetup, 200);
        return;
      }

      // Non-null aliases for use inside the render closure
      const cap = captureCanvas;
      const ctx = ctx2d;
      const main = mainEl;
      const output = glCanvas;

      console.log("[CRT Exp] ✓ Pipeline ready");

      // Set up the WebGL "theater" canvas
      const gl = output.getContext("webgl2", { alpha: false, antialias: false });
      if (!gl) return;

      function compile(src: string, type: number) {
        const s = gl!.createShader(type)!;
        gl!.shaderSource(s, src);
        gl!.compileShader(s);
        if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS)) {
          console.error("Shader:", gl!.getShaderInfoLog(s));
          return null;
        }
        return s;
      }

      const vs = compile(VERT, gl.VERTEX_SHADER);
      const fs = compile(FRAG, gl.FRAGMENT_SHADER);
      if (!vs || !fs) return;

      const prog = gl.createProgram()!;
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;

      const vao = gl.createVertexArray()!;
      gl.bindVertexArray(vao);
      const buf = gl.createBuffer()!;
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const aPos = gl.getAttribLocation(prog, "aPosition");
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      const tex = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

      gl.useProgram(prog);
      const loc = {
        tex: gl.getUniformLocation(prog, "uTexture"),
        barrel: gl.getUniformLocation(prog, "uBarrelStrength"),
        aberration: gl.getUniformLocation(prog, "uAberrationOffset"),
        vigStr: gl.getUniformLocation(prog, "uVignetteStrength"),
        vigRad: gl.getUniformLocation(prog, "uVignetteRadius"),
        grain: gl.getUniformLocation(prog, "uGrainOpacity"),
        time: gl.getUniformLocation(prog, "uTime"),
        res: gl.getUniformLocation(prog, "uResolution"),
        corner: gl.getUniformLocation(prog, "uCornerRadius"),
        edge: gl.getUniformLocation(prog, "uEdgeSoftness"),
        topDark: gl.getUniformLocation(prog, "uTopDarken"),
      };

      // Size the WebGL canvas to viewport immediately
      const initW = window.innerWidth;
      const initH = window.innerHeight;
      output.width = initW;
      output.height = initH;
      output.style.width = initW + "px";
      output.style.height = initH + "px";

      let frameCount = 0;

      function render() {
        if (destroyed) return;

        const config = useCrtStore.getState().crtConfig;
        if (!config.enabled) {
          output.style.display = "none";
          rafRef.current = requestAnimationFrame(render);
          return;
        }

        const w = window.innerWidth;
        const h = window.innerHeight;

        // Keep both canvases sized to viewport
        if (cap.width !== w || cap.height !== h) {
          cap.width = w;
          cap.height = h;
          output.width = w;
          output.height = h;
          output.style.width = w + "px";
          output.style.height = h + "px";
        }

        // Capture DOM → canvas pixel buffer
        try {
          ctx.clearRect(0, 0, w, h);
          (ctx as any).drawElementImage(main, 0, 0, w, h);
        } catch (e) {
          // "No cached paint record" — retry next frame, Chrome needs more time
          if (frameCount < 5) console.warn("[CRT Exp] waiting for paint record...");
          rafRef.current = requestAnimationFrame(render);
          return;
        }

        // Upload capture canvas → WebGL texture
        gl!.viewport(0, 0, w, h);
        gl!.bindTexture(gl!.TEXTURE_2D, tex);
        gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, gl!.RGBA, gl!.UNSIGNED_BYTE, cap);

        // Clear the capture canvas bitmap after upload so it doesn't
        // show through behind the WebGL output canvas
        ctx.clearRect(0, 0, w, h);

        // Render barrel distortion
        gl!.useProgram(prog);
        gl!.uniform1i(loc.tex, 0);
        gl!.uniform1f(loc.barrel, config.barrelStrength);
        gl!.uniform1f(loc.aberration, config.aberrationOffset);
        gl!.uniform1f(loc.vigStr, config.vignetteStrength);
        gl!.uniform1f(loc.vigRad, config.vignetteRadius);
        gl!.uniform1f(loc.grain, config.grainOpacity);
        gl!.uniform1f(loc.time, performance.now() * 0.001 * config.grainSpeed);
        gl!.uniform2f(loc.res, w, h);
        gl!.uniform1f(loc.corner, config.cornerRadius);
        gl!.uniform1f(loc.edge, config.edgeSoftness);
        gl!.uniform1f(loc.topDark, config.topDarken);

        gl!.bindVertexArray(vao);
        gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);

        // Show the output canvas
        output.style.display = "block";

        frameCount++;
        if (frameCount === 1) console.log("[CRT Exp] ✓ First frame rendered");

        rafRef.current = requestAnimationFrame(render);
      }

      rafRef.current = requestAnimationFrame(render);
    }

    // Wait for 2 paint cycles so Chrome has a cached paint record
    // for the layoutsubtree content before we try to capture it.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        trySetup();
      });
    });

    return () => {
      destroyed = true;
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={glRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, display: "none" }}
    />
  );
}
