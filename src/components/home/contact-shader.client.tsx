"use client";

import { useEffect, useRef } from "react";
import styles from "./contact-shader.module.css";

const vertexSource = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const fragmentSource = `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;

float filament(float phase, float sharpness) {
  return pow(0.5 + 0.5 * sin(phase), sharpness);
}

float ribbon(float offset, float phase) {
  float falloff = offset * 2.5;
  float envelope = exp(-falloff * falloff);
  float highlights = 0.55 + 0.45 * filament(offset * 23.0 + phase, 4.0);
  return envelope * (0.022 + 0.165 * filament(offset * 91.0, 11.0) * highlights);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
  float time = u_time * 0.085;

  // Opposing slopes meet behind the form as the two bends drift independently.
  float rising = p.x - p.y * 0.86 + 0.14 * sin(p.y * 6.0 + time);
  float falling = p.x + p.y * 0.78 - 0.13 * sin(p.y * 5.5 - time * 1.27 + 0.8);
  float light = ribbon(rising, p.y * 6.0 - time * 2.0)
              + ribbon(falling, -p.y * 5.0 + time * 1.7);
  light = min(light, 0.26);

  // Fade at the section boundaries so the shader meets the surrounding black.
  float fade = smoothstep(0.0, 0.16, uv.y) * smoothstep(0.0, 0.18, 1.0 - uv.y);
  vec3 color = vec3(0.20, 0.91, 0.065) * light * fade;
  gl_FragColor = vec4(color, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  gl.deleteShader(shader);
  return null;
}

function createRenderer(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext("webgl", { alpha: false, antialias: false, depth: false, powerPreference: "low-power" });
  if (!gl) return null;

  const program = gl.createProgram();
  const vertices = gl.createBuffer();
  const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const dispose = () => {
    gl.deleteProgram(program);
    gl.deleteBuffer(vertices);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
  };
  if (!program || !vertices || !vertex || !fragment) {
    dispose();
    return null;
  }

  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    dispose();
    return null;
  }

  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertices);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const resolution = gl.getUniformLocation(program, "u_resolution");
  const time = gl.getUniformLocation(program, "u_time");

  return {
    draw(width: number, height: number, elapsed: number) {
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      gl.viewport(0, 0, width, height);
      gl.uniform2f(resolution, width, height);
      gl.uniform1f(time, elapsed);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    dispose,
  };
}

export function ContactShader() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let renderer: ReturnType<typeof createRenderer>;
    let attempted = false;
    let visible = false;
    let frame = 0;
    let previousDraw = 0;
    let elapsed = 0;
    let width = 1;
    let height = 1;

    const resize = () => {
      const { clientWidth, clientHeight } = canvas;
      const scale = Math.min(window.devicePixelRatio, 1.5, 1100 / Math.max(clientWidth, clientHeight, 1));
      width = Math.max(1, Math.round(clientWidth * scale));
      height = Math.max(1, Math.round(clientHeight * scale));
    };
    const render = (timestamp: number) => {
      if (!previousDraw || timestamp - previousDraw >= 1000 / 30 - 1) {
        elapsed += previousDraw ? Math.min((timestamp - previousDraw) / 1000, 0.1) : 0;
        previousDraw = timestamp;
        renderer?.draw(width, height, elapsed);
        canvas.dataset.painted = "true";
      }
      frame = window.requestAnimationFrame(render);
    };
    const stop = () => {
      window.cancelAnimationFrame(frame);
      frame = 0;
      previousDraw = 0;
    };
    const sync = () => {
      if (motion.matches || !visible || document.hidden) {
        stop();
        return;
      }
      if (!attempted) {
        attempted = true;
        renderer = createRenderer(canvas);
      }
      if (renderer && !frame) frame = window.requestAnimationFrame(render);
    };
    const handleContextLoss = () => {
      stop();
      renderer = null;
      delete canvas.dataset.painted;
    };

    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    const resizeObserver = new ResizeObserver(resize);
    resize();
    resizeObserver.observe(canvas);
    intersection.observe(canvas);
    motion.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    canvas.addEventListener("webglcontextlost", handleContextLoss);
    return () => {
      stop();
      renderer?.dispose();
      delete canvas.dataset.painted;
      resizeObserver.disconnect();
      intersection.disconnect();
      motion.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      canvas.removeEventListener("webglcontextlost", handleContextLoss);
    };
  }, []);

  return <div className={styles.backdrop} aria-hidden="true">
    <canvas ref={canvasRef} className={styles.canvas} />
  </div>;
}
