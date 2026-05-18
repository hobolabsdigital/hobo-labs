export default `#version 300 es

precision highp float;

uniform vec3 u_cameraPosition;
uniform vec3 u_color1;
uniform vec3 u_color2;
// We no longer need u_dofStrength and u_focusDistance here, but we can keep the uniforms so the JS code doesn't crash if it still sets them, or remove them and update JS. Let's keep them for safety or remove them and update JS.
// Actually we will remove them and update JS.

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

    // base color of ferrofluid
    vec3 baseColor = u_color1 * 0.1;

    // specular
    float specPower = 50.0;
    float specularValue = pow(max(0.0, dot(R, V)), specPower);
    vec3 specular = specularValue * vec3(1.0, 1.0, 1.0);

    // diffuse lighting
    float diffuseValue = max(0.0, dot(N, L));
    vec3 diffuse = diffuseValue * u_color1 * 0.4;

    // fresnel
    float ft = max(0.0, dot(N, V));
    float fresnelPower = 3.0;
    float fresnelValue = pow(1.0 - ft, fresnelPower);
    vec3 fresnel = fresnelValue * u_color2 * 1.5;

    // iridescence (oil slick effect)
    vec3 a = vec3(0.5, 0.5, 0.5);
    vec3 b = vec3(0.5, 0.5, 0.5);
    vec3 c = vec3(1.0, 1.0, 1.0); 
    vec3 d = u_color1;
    vec3 rawIridescence = palette(ft * 3.0, a, b, c, d);
    vec3 iridescence = rawIridescence * fresnelValue * 0.5;

    // combine
    vec3 color = baseColor + diffuse + fresnel * 0.5 + specular * 1.5 + iridescence;

    // Set alpha to 1.0 so it is fully opaque against the transparent background
    outColor = vec4(color, 1.0);
}
`;
