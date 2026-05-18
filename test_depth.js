const n = 0.1;
const f = 100.0;
const z_eye = -6.0; // camera looks down -Z, so object at 6.0 distance has z_eye = -6.0

// P[2][2] = -(f+n)/(f-n)
const p22 = -(f + n) / (f - n);
// P[2][3] = -2*f*n/(f-n)
const p23 = -2 * f * n / (f - n);

const z_clip = z_eye * p22 + 1.0 * p23;
const w_clip = -z_eye;

const z_ndc = z_clip / w_clip;
console.log("z_ndc:", z_ndc);

// WebGL maps NDC z (-1 to 1) to Depth (0 to 1)
const depth = z_ndc * 0.5 + 0.5;
console.log("depth (0 to 1):", depth);

// Shader formula:
const z = depth * 2.0 - 1.0;
const linearDepth = (2.0 * n * f) / (f + n - z * (f - n));
console.log("linearDepth:", linearDepth);

// At camera distance 10.5
const z_eye2 = -10.5;
const z_clip2 = z_eye2 * p22 + 1.0 * p23;
const w_clip2 = -z_eye2;
const z_ndc2 = z_clip2 / w_clip2;
const depth2 = z_ndc2 * 0.5 + 0.5;
const z2 = depth2 * 2.0 - 1.0;
const linearDepth2 = (2.0 * n * f) / (f + n - z2 * (f - n));
console.log("linearDepth2:", linearDepth2);
