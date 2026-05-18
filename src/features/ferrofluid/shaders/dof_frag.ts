export default `#version 300 es
precision highp float;

in vec2 v_texcoord;
out vec4 outColor;

uniform sampler2D u_colorTexture;
uniform sampler2D u_depthTexture;
uniform vec2 u_resolution;
uniform float u_focusDistance;
uniform float u_dofStrength;

const float GOLDEN_ANGLE = 2.39996323;
const int SAMPLES = 48;

void main() {
    float depth = texture(u_depthTexture, v_texcoord).r;
    
    // Convert depth to linear
    float near = 0.1;
    float far = 100.0;
    float z = depth * 2.0 - 1.0; 
    float linearDepth = (2.0 * near * far) / (far + near - z * (far - near));

    // Special case for background (depth == 1.0)
    if (depth >= 1.0) {
        linearDepth = far;
    }

    // Compute Circle of Confusion with a focal dead zone
    // This allows the entire 3D object to be sharp when centered
    float distFromFocus = abs(linearDepth - u_focusDistance);
    float focalRange = 2.5; // Dead zone to encompass the whole blob
    float blurAmount = max(0.0, distFromFocus - focalRange);
    
    float coc = blurAmount * u_dofStrength;
    
    // Smooth falloff and scale for high quality bokeh
    coc = smoothstep(0.0, 3.0, coc) * 24.0; // Max blur radius

    vec4 centerColor = texture(u_colorTexture, v_texcoord);
    
    if (coc < 0.5) {
        outColor = centerColor;
        return;
    }

    vec2 texel = 1.0 / u_resolution;
    
    vec3 accColor = vec3(0.0);
    float accAlpha = 0.0;
    float tot = 0.0;
    
    // Bokeh blur with chromatic aberration
    for (int i = 0; i < SAMPLES; i++) {
        float r = sqrt(float(i) + 0.5) / sqrt(float(SAMPLES));
        float theta = float(i) * GOLDEN_ANGLE;
        
        vec2 offset = vec2(cos(theta), sin(theta)) * r * coc * texel;
        
        // Chromatic aberration at the edges of the blur
        float ca = r * coc * 0.05 * texel.x; 
        
        // Sample channels individually for CA
        float sr = texture(u_colorTexture, v_texcoord + offset + vec2(ca, 0.0)).r;
        float sg = texture(u_colorTexture, v_texcoord + offset).g;
        float sb = texture(u_colorTexture, v_texcoord + offset - vec2(ca, 0.0)).b;
        
        // We use the center offset for alpha
        float sa = texture(u_colorTexture, v_texcoord + offset).a;
        
        // Pre-multiply to avoid dark halos on transparent backgrounds
        accColor += vec3(sr, sg, sb) * sa;
        accAlpha += sa;
        tot += 1.0;
    }
    
    if (accAlpha > 0.0) {
        accColor /= accAlpha;
    }
    accAlpha /= tot;
    
    outColor = vec4(accColor, accAlpha);
}
`;
