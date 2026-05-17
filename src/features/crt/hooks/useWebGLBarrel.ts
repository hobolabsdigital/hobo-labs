import { useEffect, RefObject } from "react";
import { useCrtStore } from "../store/useCrtStore";
import { VERT, FRAG } from "../shaders/barrel-shaders";

export function useWebGLBarrel(glRef: RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    let destroyed = false;
    let rafId = 0;

    function trySetup() {
      const glCanvas = glRef.current;
      if (destroyed || !glCanvas) return;

      const captureCanvas = document.getElementById("crt-capture") as HTMLCanvasElement | null;
      if (!captureCanvas) {
        setTimeout(trySetup, 200);
        return;
      }

      const ctx2d = captureCanvas.getContext("2d");
      if (!ctx2d || typeof (ctx2d as any).drawElementImage !== "function") {
        useCrtStore.getState().setCrtMode("standard");
        return;
      }

      const mainEl = captureCanvas.querySelector("#crt-main") as HTMLElement | null;
      if (!mainEl) {
        setTimeout(trySetup, 200);
        return;
      }

      const cap = captureCanvas;
      const ctx = ctx2d;
      const main = mainEl;
      const output = glCanvas;

      const gl = output.getContext("webgl2", { alpha: false, antialias: false });
      if (!gl) return;

      function compile(src: string, type: number) {
        const s = gl!.createShader(type)!;
        gl!.shaderSource(s, src);
        gl!.compileShader(s);
        if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS)) return null;
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
          rafId = requestAnimationFrame(render);
          return;
        }

        const w = window.innerWidth;
        const h = window.innerHeight;

        if (cap.width !== w || cap.height !== h) {
          cap.width = w;
          cap.height = h;
          output.width = w;
          output.height = h;
          output.style.width = w + "px";
          output.style.height = h + "px";
        }

        try {
          ctx.clearRect(0, 0, w, h);
          (ctx as any).drawElementImage(main, 0, 0, w, h);
        } catch (e) {
          if (frameCount < 5) console.warn("[CRT Exp] waiting for paint record...");
          rafId = requestAnimationFrame(render);
          return;
        }

        gl!.viewport(0, 0, w, h);
        gl!.bindTexture(gl!.TEXTURE_2D, tex);
        gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, gl!.RGBA, gl!.UNSIGNED_BYTE, cap);
        ctx.clearRect(0, 0, w, h);

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

        output.style.display = "block";
        frameCount++;

        rafId = requestAnimationFrame(render);
      }

      rafId = requestAnimationFrame(render);
    }

    requestAnimationFrame(() => requestAnimationFrame(trySetup));

    return () => {
      destroyed = true;
      cancelAnimationFrame(rafId);
    };
  }, [glRef]);
}
