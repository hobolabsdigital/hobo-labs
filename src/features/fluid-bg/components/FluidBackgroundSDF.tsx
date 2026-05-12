"use client";

import { useEffect, useRef } from "react";
import { useCanvasStore } from '@/features/canvas/store/useCanvasStore';
import { useControls } from "leva";

const NUM_POINTS = 20;

const vertShader = `
    precision highp float;
    attribute vec2 aPosition;
    void main () {
        gl_Position = vec4(aPosition, 0.0, 1.0);
    }
`;

const fragShader = `
    precision highp float;

    uniform vec2 u_points[${NUM_POINTS}];
    uniform vec2 u_velocity;
    uniform float u_radius;
    uniform float u_smin;
    uniform float u_stretch;
    uniform float u_aberration;

    float smin(float a, float b, float k) {
        float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
        return mix(b, a, h) - k * h * (1.0 - h);
    }

    float sdStretchedCircle(vec2 p, vec2 dir, float speed, float radius, float stretchFactor) {
        float stretch = speed * stretchFactor;
        float pDotD = dot(p, dir);
        vec2 warpedP = p - dir * clamp(pDotD, -stretch, stretch);
        return length(warpedP) - radius;
    }

    float map(vec2 p) {
        float speed = length(u_velocity);
        vec2 dir = speed > 0.001 ? u_velocity / speed : vec2(0.0, 1.0);

        // The head stretches based on velocity (capsule)
        float d = sdStretchedCircle(p - u_points[0], dir, speed, u_radius, u_stretch);

        // The tail is a series of shrinking metaballs
        for(int i = 1; i < ${NUM_POINTS}; i++) {
            float progress = float(i) / float(${NUM_POINTS});
            // Taper the radius down to 0 at the end of the tail
            float tailRadius = u_radius * (1.0 - progress);
            
            d = smin(d, length(p - u_points[i]) - tailRadius, u_smin);
        }
        return d;
    }

    void main () {
        vec2 uv = gl_FragCoord.xy;

        // Chromatic aberration at the boundary
        vec2 offsetR = u_velocity * u_aberration;
        vec2 offsetB = -u_velocity * u_aberration;

        float dR = map(uv + offsetR);
        float dG = map(uv);
        float dB = map(uv + offsetB);

        // Smooth boundary anti-aliasing (1.5 pixel soft edge)
        float edge = 1.5;
        float r = 1.0 - smoothstep(0.0, edge, dR);
        float g = 1.0 - smoothstep(0.0, edge, dG);
        float b = 1.0 - smoothstep(0.0, edge, dB);

        vec3 C = vec3(r, g, b);
        float a = max(C.r, max(C.g, C.b));
        
        gl_FragColor = vec4(C, a);
    }
`;

export function FluidBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isTimelineHovered = useCanvasStore((state) => state.isTimelineHovered);
  const isTimelineHoveredRef = useRef(isTimelineHovered);

  const controls = useControls('Blob Physics', {
    BLOB_RADIUS: { value: 88, min: 10, max: 200, step: 1 },
    MAGNETIC_RADIUS: { value: 20, min: 5, max: 100, step: 1 },
    SMIN_FACTOR: { value: 103, min: 10, max: 300, step: 1 },
    STRETCH_INTENSITY: { value: 1.5, min: 0.0, max: 10.0, step: 0.1 },
    ABERRATION_MULT: { value: 2.5, min: 0.0, max: 5.0, step: 0.1 },
    HEAD_LERP: { value: 0.2, min: 0.01, max: 1.0, step: 0.01 },
    TAIL_LERP: { value: 0.25, min: 0.01, max: 1.0, step: 0.01 },
    SWELL_MULT: { value: 1.5, min: 1.0, max: 3.0, step: 0.1 },
  });
  const controlsRef = useRef(controls);

  useEffect(() => {
    isTimelineHoveredRef.current = isTimelineHovered;
  }, [isTimelineHovered]);

  useEffect(() => {
    controlsRef.current = controls;
  }, [controls]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const gl = canvas.getContext("webgl");
    if (!gl) return;

    // Compile shaders
    const vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs!, vertShader);
    gl.compileShader(vs!);

    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs!, fragShader);
    gl.compileShader(fs!);

    if (!gl.getShaderParameter(fs!, gl.COMPILE_STATUS)) {
      console.error("Shader Error:", gl.getShaderInfoLog(fs!));
      return;
    }

    const program = gl.createProgram();
    gl.attachShader(program!, vs!);
    gl.attachShader(program!, fs!);
    gl.linkProgram(program!);
    gl.useProgram(program);

    // Quad geometry
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1, -1,
        1, -1,
        -1, 1,
        -1, 1,
        1, -1,
        1, 1,
      ]),
      gl.STATIC_DRAW
    );
    const posLocation = gl.getAttribLocation(program!, "aPosition");
    gl.enableVertexAttribArray(posLocation);
    gl.vertexAttribPointer(posLocation, 2, gl.FLOAT, false, 0, 0);

    // Uniforms
    const uPointsLoc = gl.getUniformLocation(program!, "u_points");
    const uVelocityLoc = gl.getUniformLocation(program!, "u_velocity");
    const uRadiusLoc = gl.getUniformLocation(program!, "u_radius");
    const uSminLoc = gl.getUniformLocation(program!, "u_smin");
    const uStretchLoc = gl.getUniformLocation(program!, "u_stretch");
    const uAberrationLoc = gl.getUniformLocation(program!, "u_aberration");

    // JS State
    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const points = Array.from({ length: NUM_POINTS }, () => ({ ...target }));
    let velocity = { x: 0, y: 0 };
    let currentRadius = 0;
    let currentSmin = 100;

    let isPressed = false;

    const handlePointerMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = window.innerHeight - e.clientY; // Flip Y for WebGL
    };

    const handlePointerDown = (e: PointerEvent) => {
      isPressed = true;
      target.x = e.clientX;
      target.y = window.innerHeight - e.clientY;
    };

    const handlePointerUp = () => {
      isPressed = false;
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("resize", handleResize);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

    let animationFrameId: number;

    function render() {
      if (!gl) return;
      const c = controlsRef.current;

      let tx = target.x;
      let ty = target.y;

      if (isTimelineHoveredRef.current) {
        tx = window.innerWidth - 32;
      }

      // 1. Move head with 'buttery' lerp
      const lastHeadX = points[0].x;
      const lastHeadY = points[0].y;

      points[0].x += (tx - points[0].x) * c.HEAD_LERP;
      points[0].y += (ty - points[0].y) * c.HEAD_LERP;

      // 2. Calculate velocity (delta per frame)
      velocity.x = points[0].x - lastHeadX;
      velocity.y = points[0].y - lastHeadY;
      const speed = Math.hypot(velocity.x, velocity.y);

      // 3. Radius & Smin dynamics
      let targetRadius = c.BLOB_RADIUS;
      let targetSmin = c.SMIN_FACTOR;

      if (isTimelineHoveredRef.current) {
        targetRadius = c.MAGNETIC_RADIUS;
        targetSmin = c.SMIN_FACTOR;
      } else if (isPressed) {
        // Swell up and don't disappear when actively pressing/dragging
        targetRadius = c.BLOB_RADIUS * c.SWELL_MULT;
        targetSmin = c.SMIN_FACTOR * c.SWELL_MULT;
      } else {
        // Map speed to a factor between 0 and 1, with a deadzone so small jitters don't keep it alive
        const speedFactor = Math.min(Math.max(speed - 0.5, 0) / 3.0, 1.0);
        // Go negative to ensure the SDF radius completely vanishes despite smin bloat
        targetRadius = (c.BLOB_RADIUS * speedFactor) - (10.0 * (1.0 - speedFactor));
        targetSmin = c.SMIN_FACTOR * speedFactor;
      }
      
      currentRadius += (targetRadius - currentRadius) * 0.15;
      currentSmin += (targetSmin - currentSmin) * 0.15;

      // 4. Move tail
      for (let i = 1; i < NUM_POINTS; i++) {
        points[i].x += (points[i - 1].x - points[i].x) * c.TAIL_LERP;
        points[i].y += (points[i - 1].y - points[i].y) * c.TAIL_LERP;
      }

      // Flatten points for uniform
      const flatPoints = new Float32Array(NUM_POINTS * 2);
      for (let i = 0; i < NUM_POINTS; i++) {
        flatPoints[i * 2] = points[i].x;
        flatPoints[i * 2 + 1] = points[i].y;
      }

      // Upload uniforms
      gl.uniform2fv(uPointsLoc, flatPoints);
      gl.uniform2f(uVelocityLoc, velocity.x, velocity.y);
      gl.uniform1f(uRadiusLoc, currentRadius);
      gl.uniform1f(uSminLoc, Math.max(currentSmin, 0.001)); // Prevent division by zero
      gl.uniform1f(uStretchLoc, c.STRETCH_INTENSITY);
      gl.uniform1f(uAberrationLoc, c.ABERRATION_MULT);

      // Draw
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animationFrameId = requestAnimationFrame(render);
    }

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-40 mix-blend-difference">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
