/* eslint-disable */
export default `#version 300 es

precision highp float;

uniform sampler2D u_positionTexture;
uniform vec2 u_domainScale;
uniform ivec2 u_cellTexSize;
uniform float u_cellSize;


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

out uvec2 outIndices;

void main() {
    ivec2 texSize = textureSize(u_positionTexture, 0);
    vec2 uv = gl_FragCoord.xy / vec2(texSize);

    int particleId = tex2ndx(texSize, ivec2(gl_FragCoord.xy));

    ivec2 pi_tex = ndx2tex(texSize, particleId);
    vec4 pi = texelFetch(u_positionTexture, pi_tex, 0);
    int cellId = pos2CellId(pi.xy, u_cellTexSize, u_domainScale, u_cellSize);

    outIndices = uvec2(cellId, particleId);
}`;
