export default `#version 300 es

precision highp float;

uniform vec3 u_cameraPosition;
uniform vec3 u_color1;
uniform vec3 u_color2;

// Emotional audio bands
uniform float u_audioBass;
uniform float u_audioMids;
uniform float u_audioHighs;
uniform float u_audioEnergy;
uniform float u_audioTransient;

// Audio sensitivity
uniform float u_fresnelBoost;

in vec3 v_position;
in vec3 v_normal;

out vec4 outColor;

vec3 palette( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d ) {
    return a + b*cos( 6.28318*(c*t+d) );
}

void main() {
    vec3 V = normalize(u_cameraPosition - v_position);
    vec3 N = normalize(v_normal);
    
    // Light from top right
    vec3 L = normalize(vec3(1.0, 2.0, 2.0));
    vec3 R = reflect(-L, N);

    // --- Emotional base color ---
    // Energy modulates brightness: quiet = dark brooding, loud = luminous
    float energyBrightness = 0.08 + u_audioEnergy * 0.12;
    vec3 baseColor = u_color1 * energyBrightness;
    // Bass darkens for density and weight
    baseColor *= (1.0 - u_audioBass * 0.15);

    // --- Specular ---
    // Highs boost specular sharpness (tighter highlight)
    float specPower = 50.0 + u_audioHighs * 30.0;
    float specularValue = pow(max(0.0, dot(R, V)), specPower);
    // Bass adds specular intensity (dense = shinier reflections)
    vec3 specular = specularValue * vec3(1.0) * (1.0 + u_audioBass * 0.2);

    // --- Diffuse ---
    float diffuseValue = max(0.0, dot(N, L));
    // Energy boosts diffuse contribution
    vec3 diffuse = diffuseValue * u_color1 * (0.35 + u_audioEnergy * 0.15);

    // --- Fresnel ---
    float ft = max(0.0, dot(N, V));
    float fresnelPower = 3.0;
    float fresnelValue = pow(1.0 - ft, fresnelPower);
    // Mids modulate fresnel intensity — emotional swells light up the edges
    float fresnelBoost = 1.0 + u_audioMids * u_fresnelBoost;
    vec3 fresnel = fresnelValue * u_color2 * fresnelBoost;

    // --- Iridescence (oil slick) ---
    vec3 a = vec3(0.5, 0.5, 0.5);
    vec3 b = vec3(0.5, 0.5, 0.5);
    vec3 c = vec3(1.0, 1.0, 1.0); 
    // Energy shifts palette: quiet = monochromatic, peak = full rainbow
    vec3 d = mix(u_color1, u_color1 * vec3(1.0, 0.7, 1.3), u_audioEnergy);
    vec3 rawIridescence = palette(ft * 3.0, a, b, c, d);
    // Highs + energy boost iridescence visibility
    float iridescenceStrength = 0.35 + u_audioHighs * 0.25 + u_audioEnergy * 0.15;
    vec3 iridescence = rawIridescence * fresnelValue * iridescenceStrength;

    // --- Transient flash ---
    // Positive transients create a white additive bloom (fast attack, slow decay)
    float flashIntensity = max(0.0, u_audioTransient) * 0.12;
    vec3 flash = vec3(flashIntensity);

    // --- Combine ---
    vec3 color = baseColor + diffuse + fresnel * 0.5 + specular * 1.5 + iridescence + flash;

    // Fully opaque against transparent background
    outColor = vec4(color, 1.0);
}
`;
