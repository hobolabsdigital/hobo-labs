export default `#version 300 es

precision highp float;

uniform mat4 u_worldMatrix;
uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_audioLevel;
uniform float u_noiseSpeed;
uniform float u_noiseScale;
uniform float u_spikeHeight;
uniform float u_audioMultiplier;
uniform float u_mouseInfluence;
uniform float u_mousePullStrength;

in vec3 position;
in vec3 normal;
in vec2 texcoord;

out vec3 v_position;
out vec3 v_normal;

// Simplex 3D Noise 
// by Ian McEwan, Ashima Arts
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

float snoise(vec3 v){ 
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 = v - i + dot(i, C.xxx) ;

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

  i = mod(i, 289.0 ); 
  vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

  float n_ = 1.0/7.0;
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                dot(p2,x2), dot(p3,x3) ) );
}

vec3 getDisplacedPosition(vec3 p) {
    // Determine the mouse influence point on the sphere
    // Mouse x, y are -1 to 1. 
    // We map mouse to a directional vector
    vec3 mouseDir = normalize(vec3(u_mouse.x, u_mouse.y, 1.0));
    
    // Distance from the vertex to the mouse direction
    float distToMouse = distance(normalize(p), mouseDir);
    
    // Base smooth noise
    float noiseVal = snoise(normalize(p) * u_noiseScale + u_time * u_noiseSpeed);
    
    // Add extra displacement near the mouse (magnetic pull)
    float mousePull = (1.0 - smoothstep(0.0, u_mouseInfluence, distToMouse)) * u_mousePullStrength;
    
    // Disable mouse pull if we moved it far away (tracking disabled)
    if (u_mouse.x > 1000.0) {
        mousePull = 0.0;
    }
    
    // Audio dynamically increases the overall base wave height smoothly
    float dynamicSpikeHeight = u_spikeHeight + (u_audioLevel * u_audioMultiplier * 0.5);
    
    // Smooth pattern combining noise, mouse pull, and audio (no sharp ridges)
    float displacement = (noiseVal * dynamicSpikeHeight) 
                       + (mousePull * 0.5); // the smooth magnetic bulge
    
    // Base radius is determined by the sphere geometry (default radius is usually 1.0 but we scale it)
    return p + normalize(p) * displacement;
}

void main() {
    // Displacement
    vec3 p = getDisplacedPosition(position);
    
    // Calculate normals using analytical method (neighbor sampling)
    float eps = 0.01;
    // create two tangent vectors
    vec3 t1 = normalize(cross(normal, vec3(0.0, 1.0, 0.0)));
    if (length(t1) < 0.01) t1 = normalize(cross(normal, vec3(1.0, 0.0, 0.0)));
    vec3 t2 = normalize(cross(normal, t1));
    
    vec3 p1 = getDisplacedPosition(position + t1 * eps);
    vec3 p2 = getDisplacedPosition(position + t2 * eps);
    
    vec3 newNormal = normalize(cross(p1 - p, p2 - p));
    
    vec4 worldPosition = u_worldMatrix * vec4(p, 1.0);
    v_position = worldPosition.xyz;
    v_normal = mat3(u_worldMatrix) * newNormal;

    gl_Position = u_projectionMatrix * u_viewMatrix * worldPosition;
}
`;
