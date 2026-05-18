/* eslint-disable */
export default `#version 300 es

precision highp float;
precision highp int;
precision highp usampler2D;

uniform float u_heightFactor;
uniform float u_scale;
uniform float u_smoothFactor;
uniform float u_spikeFactor;
uniform sampler2D u_particlePosTexture;

in vec2 v_uv;

out vec4 outHeight;


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

// https://iquilezles.org/articles/functions/
float almostIdentity( float x, float m, float n )
{
    if( x>m ) return x;
    float a = 2.0*n - m;
    float b = 2.0*m - 3.0*n;
    float t = x/m;
    return (a*t + b)*t*t + n;
}

void main() {
    ivec2 particleTexSize = textureSize(u_particlePosTexture, 0);
    int particleCount = particleTexSize.x * particleTexSize.y;

    vec2 pos = v_uv * 2. - 1.;
    float w = u_smoothFactor; // smoothing factor (the higher, the smoother)
    float res = 1.; // result height value

    // smooth voronoi (https://www.shadertoy.com/view/ldB3zc)
    for(int i=0; i<particleCount; i++) {
        vec4 pj = texelFetch(u_particlePosTexture, ndx2tex(particleTexSize, i), 0) * u_scale;
        float d = distance(pj.xy, pos);

        // do the smooth min 
        float h = smoothstep( -1., 1., (res - d) / w );
        res = mix(res, d, h) - h * (1.0 - h) * (w / (1.0 + 3.0 * w));
    }

    // the heightmap should get more spiky if the particles are denser
    res = clamp(res * u_spikeFactor, 0., 1.);

    // smooth out the spike peaks
    res = almostIdentity(res, 0.1, 0.04);
    
    // apply height factor
    res = (1. - res);
    res *= u_heightFactor;

    outHeight = vec4(res);
}`;
