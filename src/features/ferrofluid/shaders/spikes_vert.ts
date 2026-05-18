/* eslint-disable */
export default `#version 300 es

precision highp float;

uniform mat4 u_worldMatrix;
uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;
uniform sampler2D u_heightMapTexture;
uniform float u_zoom;

in vec3 position;
in vec2 texcoord;

out vec3 v_position;
out vec2 v_texcoord;
out vec3 v_normal;


ivec2 ndx2tex(ivec2 dimensions, int index) {
    int y = index / dimensions.x;
    int x = index % dimensions.x;
    return ivec2(x, y);
}

int tex2ndx(ivec2 dimensions, ivec2 tex) {
    return tex.x + tex.y * dimensions.x;
}

ivec2 pos2CellIndex(vec2 p, ivec2 cellTexSize, vec2 domainScale, float cellSize) {
    vec2 pi = p * 0.5 + 0.5;
    pi = clamp(pi, vec2(0.001), vec2(.999));
    pi *= domainScale;
    return ivec2(pi / cellSize);
}

int pos2CellId(vec2 p, ivec2 cellTexSize, vec2 domainScale, float cellSize) {
    ivec2 cellIndex = pos2CellIndex(p, cellTexSize, domainScale, cellSize);
    return tex2ndx(cellTexSize, cellIndex);
}

int getFlatCellIndex(ivec2 cellIndex, int numGridCells) {
    int p1 = 73856093; // some large primes
    int p2 = 19349663;
    int n = p1 * cellIndex.x ^ p2 * cellIndex.y;
    n %= numGridCells;
    return n;
}

vec3 distort(vec3 p, float zoom) {
    // get the height info
    vec2 uv = p.xz * 0.5 + 0.5;
    float res = texture(u_heightMapTexture, uv).r;

    // smooth out edges
    float edge = smoothstep(0.5, (1. - u_zoom) * .2 + 0.8, 1. - length(p));
    res *= edge;

    // spherical part
    vec3 sp = normalize(p - vec3(0., -.4, 0.)) * res;
    vec3 r = p + sp;

    return r;
}

void main() {
    vec2 heightMapSize = vec2(textureSize(u_heightMapTexture, 0));
    vec2 heightMapTexelSize = 1./heightMapSize;
    float zoom = u_zoom + 1.9;

    vec3 p = distort(position, zoom);
    vec4 worldPosition = u_worldMatrix * vec4(p, 1.);
    
    // normal estimation
    float epsilon = heightMapTexelSize.x * 2.;
    vec3 t = distort(position + vec3(epsilon, 0., 0.), zoom);
    vec3 b = distort(position + vec3(0., 0., epsilon), zoom);
    v_normal = normalize(cross(t - p, p - b));

    //float h = texture(u_heightMapTexture, position.xz * 0.5 + 0.5).r;
    //v_normal = normalize(vec3(h, 1., 1.));

    v_texcoord = texcoord;
    v_position = worldPosition.xyz;
    gl_Position = u_projectionMatrix * u_viewMatrix * worldPosition;
    //gl_Position = u_projectionMatrix * u_viewMatrix * u_worldMatrix * vec4(position, 1.);
}`;
