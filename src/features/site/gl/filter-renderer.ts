import { FRAG, VERT } from './filter-shader';

export type Palette = { paper: number[]; ink: number[]; signal: number[]; accent: number[] };
export type FrameState = {
  time: number;
  intro: number;
  lens: [number, number];
  radius: number;
  palette: Palette;
};

const UNIFORMS = ['u_res', 'u_scale', 'u_time', 'u_intro', 'u_lens', 'u_radius', 'u_paper', 'u_ink', 'u_signal', 'u_accent'] as const;
type UniformName = (typeof UNIFORMS)[number];

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const sh = gl.createShader(type);
  if (!sh) throw new Error('createShader failed');
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh);
    gl.deleteShader(sh);
    throw new Error(`shader compile failed: ${log}`);
  }
  return sh;
}

/** Thin WebGL2 wrapper: one program, one full-screen triangle, no buffers. */
export class FilterRenderer {
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram;
  private loc = {} as Record<UniformName, WebGLUniformLocation | null>;
  scale = 1;

  constructor(private canvas: HTMLCanvasElement) {
    const gl = canvas.getContext('webgl2', {
      antialias: false,
      alpha: false,
      depth: false,
      stencil: false,
      powerPreference: 'high-performance',
    });
    if (!gl) throw new Error('WebGL2 unavailable');
    this.gl = gl;
    const program = gl.createProgram();
    if (!program) throw new Error('createProgram failed');
    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(`program link failed: ${gl.getProgramInfoLog(program)}`);
    }
    this.program = program;
    gl.useProgram(program);
    for (const name of UNIFORMS) this.loc[name] = gl.getUniformLocation(program, name);
  }

  /** Match the drawing buffer to the canvas's CSS size × scale. Returns true if it changed. */
  resize(cssW: number, cssH: number, scale: number) {
    this.scale = scale;
    const w = Math.max(1, Math.round(cssW * scale));
    const h = Math.max(1, Math.round(cssH * scale));
    if (this.canvas.width === w && this.canvas.height === h) return false;
    this.canvas.width = w;
    this.canvas.height = h;
    this.gl.viewport(0, 0, w, h);
    return true;
  }

  render(s: FrameState) {
    const { gl, loc } = this;
    gl.uniform2f(loc.u_res, this.canvas.width, this.canvas.height);
    gl.uniform1f(loc.u_scale, this.scale);
    gl.uniform1f(loc.u_time, s.time);
    gl.uniform1f(loc.u_intro, s.intro);
    gl.uniform2f(loc.u_lens, s.lens[0], s.lens[1]);
    gl.uniform1f(loc.u_radius, s.radius);
    gl.uniform3fv(loc.u_paper, s.palette.paper);
    gl.uniform3fv(loc.u_ink, s.palette.ink);
    gl.uniform3fv(loc.u_signal, s.palette.signal);
    gl.uniform3fv(loc.u_accent, s.palette.accent);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  destroy() {
    this.gl.deleteProgram(this.program);
  }
}

export function hexToRgb(hex: string): number[] {
  const h = hex.trim().replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full.slice(0, 6), 16);
  if (Number.isNaN(n)) return [0, 0, 0];
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/** Reads the shader palette from the active theme's CSS custom properties. */
export function readPalette(el: Element = document.documentElement): Palette {
  const cs = getComputedStyle(el);
  const get = (name: string) => hexToRgb(cs.getPropertyValue(name));
  return { paper: get('--gl-paper'), ink: get('--gl-ink'), signal: get('--gl-signal'), accent: get('--gl-accent') };
}

export function mixPalette(a: Palette, b: Palette, t: number): Palette {
  const m = (x: number[], y: number[]) => x.map((v, i) => v + (y[i] - v) * t);
  return { paper: m(a.paper, b.paper), ink: m(a.ink, b.ink), signal: m(a.signal, b.signal), accent: m(a.accent, b.accent) };
}
