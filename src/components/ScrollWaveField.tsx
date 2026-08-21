"use client";

import { useEffect, useRef } from "react";

type ScrollWaveFieldProps = {
  className?: string;
};

const FIELD_W = 3600;
const FIELD_D = 7000;
const CAM_Z0 = 700;
const FOV = 60;
const DPR_CAP = 1.2;
const TAU = Math.PI * 2;
const MAX_COLORS = 8;
const WAVE_DIR_X = 0;
const WAVE_DIR_Z = -1;

const VERT = `
precision highp float;
attribute vec2 aGrid;
attribute vec2 aSeed;
uniform vec2 uRes;
uniform float uFocal;
uniform float uTime;
uniform float uAmp;
uniform float uScatter;
uniform float uFreq;
uniform vec2 uDir;
uniform float uFlow;
uniform float uDepth;
uniform float uCamY;
uniform float uCamZ;
uniform float uPitch;
uniform float uRoll;
uniform float uDot;
uniform float uColorCount;
uniform vec2 uJit;
uniform vec3 uColors[8];
uniform vec3 uCursor;
uniform float uCurR;
uniform float uCurS;
uniform float uHover;
varying vec3 vCol;
varying float vA;
varying float vHot;

vec3 pickColor(float sel) {
  float idx = floor(sel * uColorCount);
  vec3 c = uColors[0];
  for (int i = 1; i < 8; i++) {
    if (float(i) >= uColorCount) break;
    if (float(i) == idx) c = uColors[i];
  }
  return c;
}

float surf(vec2 q) {
  return sin(q.x) * 0.55 + sin(q.x * 0.55 + q.y * 1.15) * 0.30 + sin(q.y * 0.75) * 0.22;
}

void main() {
  vec2 w = aGrid + (aSeed - 0.5) * uJit;
  w.y = uCamZ + mod(w.y - uFlow - uCamZ, uDepth);
  float h3 = fract(sin(dot(aSeed, vec2(91.37, 47.13))) * 12345.678);
  float h = surf(w * uFreq - uDir * uTime) * uAmp + (h3 - 0.5) * uScatter;
  float cd = length(w - uCursor.xy);
  float g = exp(-(cd * cd) / (uCurR * uCurR)) * uCursor.z;
  h += g * uCurS;
  float g2 = g * g; g2 = g2 * g2; g2 = g2 * g2;
  vec3 p = vec3(w.x, h - uCamY, w.y - uCamZ);
  float c = cos(uPitch);
  float s = sin(uPitch);
  float ry = p.y * c + p.z * s;
  float rz = -p.y * s + p.z * c;
  if (rz < 40.0) {
    gl_Position = vec4(2.0, 2.0, 0.0, 1.0);
    gl_PointSize = 0.0;
    vCol = uColors[0];
    vA = 0.0;
    vHot = 0.0;
    return;
  }
  float cr = cos(uRoll);
  float sr = sin(uRoll);
  float rx = p.x * cr - ry * sr;
  float ryr = p.x * sr + ry * cr;
  float sx = rx * uFocal / rz;
  float sy = ryr * uFocal / rz;
  gl_Position = vec4(sx / (uRes.x * 0.5), sy / (uRes.y * 0.5), 0.0, 1.0);
  float rad = max(uDot * uFocal / rz, 0.55);
  gl_PointSize = clamp(rad * 2.0 * (1.0 + g2 * uHover * 0.20), 1.0, 220.0);
  float bri = 0.28 + h3 * 0.72;
  vec2 bq = w * vec2(0.0040, 0.0032) - uDir * uTime * 0.30;
  float band = sin(bq.x) + sin(bq.y);
  float sel = fract((band + 2.0) * 0.25 + (aSeed.y - 0.5) * 0.55);
  vCol = pickColor(sel);
  float lum = dot(vCol, vec3(0.299, 0.587, 0.114));
  vHot = (0.25 + 0.75 * lum) * bri * bri * 0.7 + g2 * uHover * 0.55;
  float fog = (1.0 - smoothstep(2800.0, 6400.0, rz)) * smoothstep(70.0, 240.0, rz);
  vA = bri * fog * (1.0 + g2 * uHover * 0.55);
}
`;

const FRAG = `
precision highp float;
varying vec3 vCol;
varying float vA;
varying float vHot;
void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  if (d > 1.0) discard;
  float a = (1.0 - smoothstep(0.90, 1.0, d)) * vA;
  vec3 col = vCol + vec3(1.0) * pow(1.0 - d, 10.0) * vHot * 0.9;
  gl_FragColor = vec4(col * a, a);
}
`;

function parseColor(input: string): [number, number, number] {
  let h = input.replace("#", "").trim();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
}

function mulberry32(seed: number) {
  return function random() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Shader unavailable");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
}

export default function ScrollWaveField({ className }: ScrollWaveFieldProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      depth: false,
      premultipliedAlpha: true,
    });
    if (!gl) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(program);
    gl.useProgram(program);

    const aGrid = gl.getAttribLocation(program, "aGrid");
    const aSeed = gl.getAttribLocation(program, "aSeed");
    const U = (name: string) => gl.getUniformLocation(program, name);
    const uniforms = {
      res: U("uRes"),
      focal: U("uFocal"),
      time: U("uTime"),
      amp: U("uAmp"),
      scatter: U("uScatter"),
      freq: U("uFreq"),
      dir: U("uDir"),
      flow: U("uFlow"),
      depth: U("uDepth"),
      camY: U("uCamY"),
      camZ: U("uCamZ"),
      pitch: U("uPitch"),
      roll: U("uRoll"),
      dot: U("uDot"),
      colorCount: U("uColorCount"),
      jit: U("uJit"),
      colors: U("uColors[0]"),
      cursor: U("uCursor"),
      curR: U("uCurR"),
      curS: U("uCurS"),
      hover: U("uHover"),
    };

    const gridBuf = gl.createBuffer();
    const seedBuf = gl.createBuffer();
    const palBuf = new Float32Array(MAX_COLORS * 3);
    const rnd = mulberry32(0x5eed);
    const cols = window.innerWidth < 760 ? 64 : 88;
    const rows = window.innerWidth < 760 ? 118 : 164;
    const count = cols * rows;
    const spacingX = FIELD_W / (cols - 1);
    const spacingZ = FIELD_D / (rows - 1);
    const grid = new Float32Array(count * 2);
    const seed = new Float32Array(count * 2);

    let k = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        grid[k * 2] = -FIELD_W / 2 + (c + 0.5) * spacingX;
        grid[k * 2 + 1] = r * spacingZ;
        seed[k * 2] = rnd();
        seed[k * 2 + 1] = rnd();
        k++;
      }
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, gridBuf);
    gl.bufferData(gl.ARRAY_BUFFER, grid, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, seedBuf);
    gl.bufferData(gl.ARRAY_BUFFER, seed, gl.STATIC_DRAW);
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);

    const pointer = { x: 0, y: 0, sx: 0, sy: 0, active: 0, target: 0, press: 0, pressTarget: 0 };
    const scroll = { y: window.scrollY, velocity: 0, progress: 0 };
    const palette = ["#CC9149", "#F2D98A", "#8A642D", "#FFF1A8"];

    for (let i = 0; i < palette.length; i++) {
      const [r, g, b] = parseColor(palette[i]);
      palBuf[i * 3] = r;
      palBuf[i * 3 + 1] = g;
      palBuf[i * 3 + 2] = b;
    }

    let cssW = 1;
    let cssH = 1;
    let dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
      cssW = canvas.clientWidth || window.innerWidth;
      cssH = canvas.clientHeight || window.innerHeight;
      canvas.width = Math.max(1, Math.round(cssW * dpr));
      canvas.height = Math.max(1, Math.round(cssH * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();

    const onScroll = () => {
      const next = window.scrollY;
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      scroll.velocity = Math.min(1.6, Math.abs(next - scroll.y) / 120);
      scroll.y = next;
      scroll.progress = next / max;
    };
    const onMove = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.target = 1;
    };
    const onLeave = () => {
      pointer.target = 0;
      pointer.pressTarget = 0;
    };
    const onDown = () => {
      pointer.pressTarget = 1;
    };
    const onUp = () => {
      pointer.pressTarget = 0;
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);

    let raf = 0;
    let last = performance.now();
    let phase = 0;
    let flow = 0;
    let hitX = 0;
    let hitZ = -1e6;

    const groundHit = (mx: number, my: number, focal: number, pitch: number, roll: number, camY: number) => {
      const px = mx * dpr - canvas.width / 2;
      const py = -(my * dpr - canvas.height / 2);
      const cr = Math.cos(roll);
      const sr = Math.sin(roll);
      const sx = px * cr + py * sr;
      const sy = -px * sr + py * cr;
      const dx = sx / focal;
      const dy = sy / focal;
      const c = Math.cos(pitch);
      const s = Math.sin(pitch);
      const wy = dy * c - s;
      const wz = dy * s + c;
      if (wy > -1e-4) return null;
      const t = -camY / wy;
      return { x: dx * t, z: CAM_Z0 + wz * t };
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      scroll.velocity *= 0.92;

      pointer.active += (pointer.target - pointer.active) * (1 - Math.exp(-dt * 6));
      pointer.press += (pointer.pressTarget - pointer.press) * (1 - Math.exp(-dt * 8));
      const follow = 1 - Math.exp(-dt * 7);
      pointer.sx += (pointer.x - pointer.sx) * follow;
      pointer.sy += (pointer.y - pointer.sy) * follow;

      const speedBoost = 1 + pointer.press + scroll.velocity * 1.4;
      phase += dt * 2.45 * speedBoost;
      flow = (flow + dt * 410 * speedBoost) % FIELD_D;

      const pitch = ((10 + scroll.progress * 7) * Math.PI) / 180;
      const roll = (Math.sin(scroll.progress * Math.PI * 2) * 3.5 * Math.PI) / 180;
      const camY = 250 + scroll.progress * 150;
      const focal = canvas.height / (2 * Math.tan(((FOV / 2) * Math.PI) / 180));
      const hit = pointer.active > 0.001 ? groundHit(pointer.sx, pointer.sy, focal, pitch, roll, camY) : null;
      if (hit) {
        hitX = hit.x;
        hitZ = hit.z;
      } else if (pointer.active <= 0.001) {
        hitX = 0;
        hitZ = -1e6;
      }

      gl.uniform2f(uniforms.res, canvas.width, canvas.height);
      gl.uniform1f(uniforms.focal, focal);
      gl.uniform1f(uniforms.time, phase);
      gl.uniform1f(uniforms.amp, 205);
      gl.uniform1f(uniforms.scatter, 105);
      gl.uniform1f(uniforms.freq, TAU / 1900);
      gl.uniform2f(uniforms.dir, WAVE_DIR_X, WAVE_DIR_Z);
      gl.uniform1f(uniforms.flow, flow);
      gl.uniform1f(uniforms.depth, FIELD_D);
      gl.uniform1f(uniforms.camY, camY);
      gl.uniform1f(uniforms.camZ, CAM_Z0);
      gl.uniform1f(uniforms.pitch, pitch);
      gl.uniform1f(uniforms.roll, roll);
      gl.uniform1f(uniforms.dot, 2.25);
      gl.uniform1f(uniforms.colorCount, palette.length);
      gl.uniform2f(uniforms.jit, spacingX * 0.25, spacingZ * 0.7);
      gl.uniform3fv(uniforms.colors, palBuf);
      gl.uniform3f(uniforms.cursor, hitX, hitZ, pointer.active);
      gl.uniform1f(uniforms.curR, FIELD_W * 0.22);
      gl.uniform1f(uniforms.curS, 55);
      gl.uniform1f(uniforms.hover, 1.1);

      gl.bindBuffer(gl.ARRAY_BUFFER, gridBuf);
      gl.enableVertexAttribArray(aGrid);
      gl.vertexAttribPointer(aGrid, 2, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, seedBuf);
      gl.enableVertexAttribArray(aSeed);
      gl.vertexAttribPointer(aSeed, 2, gl.FLOAT, false, 0, 0);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.POINTS, 0, count);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  return (
    <div ref={hostRef} className={className} aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
