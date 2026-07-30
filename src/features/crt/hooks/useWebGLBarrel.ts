import { useEffect, RefObject } from "react";
import { useCrtStore } from "../store/useCrtStore";
import { VERT, FRAG } from "../shaders/barrel-shaders";

export function useWebGLBarrel(glRef: RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    let destroyed = false;
    let rafId = 0;
    let retryTimeoutId: ReturnType<typeof setTimeout> | undefined;
    let unsubscribe: (() => void) | null = null;
    let cleanupGl: (() => void) | null = null;

    function trySetup() {
      const glCanvas = glRef.current;
      if (destroyed || !glCanvas) return;

      const captureCanvas = document.getElementById("crt-capture") as HTMLCanvasElement | null;
      if (!captureCanvas) {
        retryTimeoutId = setTimeout(trySetup, 200);
        return;
      }

      const ctx2d = captureCanvas.getContext("2d");
      if (!ctx2d || typeof (ctx2d as unknown as { drawElementImage?: unknown }).drawElementImage !== "function") {
        useCrtStore.getState().setCrtMode("standard");
        return;
      }

      const mainEl = captureCanvas.querySelector("#crt-main") as HTMLElement | null;
      if (!mainEl) {
        retryTimeoutId = setTimeout(trySetup, 200);
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
      if (!vs || !fs) {
        if (vs) gl.deleteShader(vs);
        if (fs) gl.deleteShader(fs);
        return;
      }

      const prog = gl.createProgram()!;
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        gl.deleteProgram(prog);
        gl.deleteShader(vs);
        gl.deleteShader(fs);
        return;
      }

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
        vigStr: gl.getUniformLocation(prog, "uVignetteStrength"),
        vigRad: gl.getUniformLocation(prog, "uVignetteRadius"),
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
      let running = false;

      const startLoop = () => {
        if (running || destroyed) return;
        running = true;
        rafId = requestAnimationFrame(render);
      };

      const stopLoop = () => {
        running = false;
        cancelAnimationFrame(rafId);
      };

      // GL resource cleanup, invoked from the effect teardown
      cleanupGl = () => {
        gl.deleteTexture(tex);
        gl.deleteBuffer(buf);
        gl.deleteVertexArray(vao);
        gl.deleteProgram(prog);
        gl.deleteShader(vs);
        gl.deleteShader(fs);
      };

      function render() {
        if (destroyed || !running) return;

        const config = useCrtStore.getState().crtConfig;
        if (!config.enabled) {
          // Stop the loop entirely while disabled; the store subscription
          // below restarts it when the effect is re-enabled.
          output.style.display = "none";
          stopLoop();
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
          (ctx as unknown as { drawElementImage: (el: HTMLElement, x: number, y: number, w: number, h: number) => void }).drawElementImage(main, 0, 0, w, h);
        } catch {
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
        gl!.uniform1f(loc.vigStr, config.vignetteStrength);
        gl!.uniform1f(loc.vigRad, config.vignetteRadius);
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

      // Restart the loop when the CRT effect gets re-enabled
      unsubscribe = useCrtStore.subscribe((state, prevState) => {
        if (state.crtConfig.enabled && !prevState.crtConfig.enabled) {
          startLoop();
        }
      });

      startLoop();
    }

    requestAnimationFrame(() => requestAnimationFrame(trySetup));

    return () => {
      destroyed = true;
      if (retryTimeoutId !== undefined) clearTimeout(retryTimeoutId);
      cancelAnimationFrame(rafId);
      unsubscribe?.();
      cleanupGl?.();
    };
  }, [glRef]);
}
