export const VERT = `#version 300 es
in vec2 aPosition;
out vec2 vUv;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

export const FRAG = `#version 300 es
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
  vec2 centered = vUv * 2.0 - 1.0;
  float aspect = uResolution.x / uResolution.y;
  vec2 scaled = centered * vec2(aspect, 1.0);
  float inset = uCornerRadius * 0.5;
  vec2 screenSize = vec2(aspect - inset, 1.0 - inset);
  float cornerRound = uCornerRadius * 0.8;
  float dist = roundedRectSDF(scaled, screenSize, cornerRound);
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
