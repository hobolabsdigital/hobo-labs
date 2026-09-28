/**
 * "The filter" — one noise field, rendered two ways.
 *
 * Outside the lens: a domain-warped field printed as ordered-dither riso
 * layers (paper → accent → ink → signal). Raw generation.
 * Inside the lens: the same field, magnified, drawn as a measured drawing —
 * contour lines, index contours and a grid, in the inverse palette. The judge.
 *
 * u_order (0→1, driven by scroll) grows the lens until it fills the screen.
 */

export const VERT = /* glsl */ `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

export const FRAG = /* glsl */ `#version 300 es
precision highp float;

uniform vec2 u_res;      // drawing buffer, px
uniform float u_scale;   // buffer px per CSS px
uniform float u_time;
uniform float u_intro;   // 0→1 on load: the print develops
uniform vec2 u_lens;     // lens centre, CSS px, origin top-left
uniform float u_radius;  // lens radius, CSS px
uniform vec3 u_paper;
uniform vec3 u_ink;
uniform vec3 u_signal;
uniform vec3 u_accent;

out vec4 outColor;

// 2D simplex noise — Ashima Arts / Stefan Gustavson (MIT)
vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 r = mat2(0.8, -0.6, 0.6, 0.8);
  for (int i = 0; i < 4; i++) {
    v += a * snoise(p);
    p = r * p * 1.97 + 11.7;
    a *= 0.48;
  }
  return v;
}

float fbm3(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 r = mat2(0.8, -0.6, 0.6, 0.8);
  for (int i = 0; i < 3; i++) {
    v += a * snoise(p);
    p = r * p * 2.01 + 7.3;
    a *= 0.5;
  }
  return v;
}

// Domain-warped field in ~[0,1]. w = warp magnitude, used to place signal veins.
float field(vec2 p, float t, out float w) {
  vec2 q = vec2(fbm3(p + vec2(0.0, 0.11 * t)), fbm3(p + vec2(5.2, 1.3) - 0.09 * t));
  vec2 r = vec2(fbm3(p + 1.5 * q + vec2(1.7, 9.2) + 0.15 * t), fbm3(p + 1.5 * q + vec2(8.3, 2.8) - 0.12 * t));
  w = length(r);
  return clamp(0.5 + 0.7 * fbm(p + 1.35 * r), 0.0, 1.0);
}

float bayer4(vec2 cell) {
  ivec2 i = ivec2(mod(cell, 4.0));
  int idx = i.x + i.y * 4;
  float m[16] = float[16](0.0, 8.0, 2.0, 10.0, 12.0, 4.0, 14.0, 6.0, 3.0, 11.0, 1.0, 9.0, 15.0, 7.0, 13.0, 5.0);
  return (m[idx] + 0.5) / 16.0;
}

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

// CSS px → field space. Feature size scales gently with viewport width.
vec2 toField(vec2 css, float t) {
  float unit = 300.0 + 0.24 * (u_res.x / u_scale);
  return css / unit + vec2(0.018 * t, 0.0);
}

// Anti-aliased line on a periodic value; width in px of that value's screen derivative.
float isoLine(float v, float widthPx) {
  float fw = max(fwidth(v), 1e-4);
  float d = abs(fract(v - 0.5) - 0.5) / fw;
  return 1.0 - smoothstep(widthPx * 0.5 - 0.5, widthPx * 0.5 + 0.5, d);
}

vec3 raw(vec2 css, float t) {
  float w;
  float f = field(toField(css, t), t, w);
  vec2 cell = floor(css / 2.0);
  float th = bayer4(cell) * 0.9 + 0.05 + (hash(cell) - 0.5) * 0.06;
  float dev = 1.0 - u_intro;
  float tAcc = smoothstep(0.34, 0.22, f) * 0.85 - dev;
  float tInk = smoothstep(0.61, 0.74, f) - dev;
  // Thin filaments along one iso-level, only where the warp runs hot.
  float band = 1.0 - smoothstep(0.01, 0.028, abs(f - 0.47));
  float tSig = band * smoothstep(0.35, 0.7, w) - dev;
  vec3 col = u_paper;
  col = mix(col, u_accent, step(th, tAcc));
  col = mix(col, u_ink, step(th, tInk));
  col = mix(col, u_signal, step(th, tSig));
  return col;
}

vec3 judged(vec2 css, vec2 rel, float d, float t) {
  // Glass: stronger zoom-out towards the rim.
  float k = d / max(u_radius, 1.0);
  float mag = mix(0.58, 0.40, k * k * k);
  float w;
  float f = field(toField(u_lens + rel * mag, t), t, w);
  float minor = isoLine(f * 14.0, 1.0);
  float major = isoLine(f * 14.0 / 4.0, 1.6);
  // The one level that counts: above it, a frame passes. Drawn thick, in signal.
  float fw = max(fwidth(f), 1e-4);
  float onBrand = 1.0 - smoothstep(0.7, 1.7, abs(f - 0.62) / fw);
  // Section hatching over everything that passes.
  float hatch = isoLine((css.x + css.y) / 7.0, 1.0) * step(0.62, f);
  float gMinor = max(isoLine(css.x / 16.0, 1.0), isoLine(css.y / 16.0, 1.0));
  float gMajor = max(isoLine(css.x / 80.0, 1.0), isoLine(css.y / 80.0, 1.0));
  vec3 col = u_ink;
  col = mix(col, u_paper, 0.07 * gMinor + 0.16 * gMajor);
  col = mix(col, u_paper, 0.28 * hatch);
  col = mix(col, u_paper, 0.42 * minor);
  col = mix(col, u_paper, 0.95 * major);
  col = mix(col, u_signal, onBrand);
  return col;
}

void main() {
  vec2 css = vec2(gl_FragCoord.x, u_res.y - gl_FragCoord.y) / u_scale;
  float t = u_time;
  vec2 rel = css - u_lens;
  float d = length(rel);
  float R = u_radius;
  float aa = 1.0;

  vec3 col;
  if (d < R - aa) {
    col = judged(css, rel, d, t);
  } else if (d > R + aa) {
    // The lens presses into the field around it.
    vec2 push = rel / max(d, 1.0) * 28.0 * exp(-pow((d - R) / (R * 0.6), 2.0));
    col = raw(css - push, t);
  } else {
    float m = smoothstep(R + aa, R - aa, d);
    col = mix(raw(css, t), judged(css, rel, d, t), m);
  }

  // Rim + graduated ticks, like a loupe reticle.
  float ring = 1.0 - smoothstep(0.6, 1.6, abs(d - R));
  float arc = atan(rel.y, rel.x) * R;
  float period = 6.2831853 * R / 72.0;
  float tick = 1.0 - smoothstep(0.4, 1.2, abs(mod(arc, period) - period * 0.5));
  float along = mod(arc + period * 0.5, period * 6.0) < period ? 14.0 : 7.0;
  float band = step(R + 3.0, d) * step(d, R + 3.0 + along);
  col = mix(col, u_ink, max(ring, tick * band) * step(8.0, R));

  // Crosshair at the lens centre.
  float cross = (1.0 - smoothstep(0.5, 1.2, abs(rel.x))) * step(abs(rel.y), 10.0)
              + (1.0 - smoothstep(0.5, 1.2, abs(rel.y))) * step(abs(rel.x), 10.0);
  col = mix(col, u_signal, clamp(cross, 0.0, 1.0) * step(d, R) * step(24.0, R));

  outColor = vec4(col, 1.0);
}`;
