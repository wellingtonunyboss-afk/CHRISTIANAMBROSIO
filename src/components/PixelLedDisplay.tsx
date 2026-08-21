"use client";

import { useEffect, useMemo, useRef, type CSSProperties } from "react";

type PixelLedDisplayProps = {
  items?: string[];
  separator?: string;
  speed?: number;
  direction?: "left" | "right";
  textSize?: number;
  dotSize?: number;
  spread?: number;
  onColor?: string;
  offColor?: string;
  className?: string;
  style?: CSSProperties;
};

const ROWS = 7;
const FONT: number[][] = [
  [0x00, 0x00, 0x00, 0x00, 0x00], [0x00, 0x00, 0x5f, 0x00, 0x00], [0x00, 0x07, 0x00, 0x07, 0x00],
  [0x14, 0x7f, 0x14, 0x7f, 0x14], [0x24, 0x2a, 0x7f, 0x2a, 0x12], [0x23, 0x13, 0x08, 0x64, 0x62],
  [0x36, 0x49, 0x55, 0x22, 0x50], [0x00, 0x05, 0x03, 0x00, 0x00], [0x00, 0x1c, 0x22, 0x41, 0x00],
  [0x00, 0x41, 0x22, 0x1c, 0x00], [0x14, 0x08, 0x3e, 0x08, 0x14], [0x08, 0x08, 0x3e, 0x08, 0x08],
  [0x00, 0x50, 0x30, 0x00, 0x00], [0x08, 0x08, 0x08, 0x08, 0x08], [0x00, 0x60, 0x60, 0x00, 0x00],
  [0x20, 0x10, 0x08, 0x04, 0x02], [0x3e, 0x51, 0x49, 0x45, 0x3e], [0x00, 0x42, 0x7f, 0x40, 0x00],
  [0x42, 0x61, 0x51, 0x49, 0x46], [0x21, 0x41, 0x45, 0x4b, 0x31], [0x18, 0x14, 0x12, 0x7f, 0x10],
  [0x27, 0x45, 0x45, 0x45, 0x39], [0x3c, 0x4a, 0x49, 0x49, 0x30], [0x01, 0x71, 0x09, 0x05, 0x03],
  [0x36, 0x49, 0x49, 0x49, 0x36], [0x06, 0x49, 0x49, 0x29, 0x1e], [0x00, 0x36, 0x36, 0x00, 0x00],
  [0x00, 0x56, 0x36, 0x00, 0x00], [0x00, 0x08, 0x14, 0x22, 0x41], [0x14, 0x14, 0x14, 0x14, 0x14],
  [0x41, 0x22, 0x14, 0x08, 0x00], [0x02, 0x01, 0x51, 0x09, 0x06], [0x32, 0x49, 0x79, 0x41, 0x3e],
  [0x7e, 0x11, 0x11, 0x11, 0x7e], [0x7f, 0x49, 0x49, 0x49, 0x36], [0x3e, 0x41, 0x41, 0x41, 0x22],
  [0x7f, 0x41, 0x41, 0x22, 0x1c], [0x7f, 0x49, 0x49, 0x49, 0x41], [0x7f, 0x09, 0x09, 0x01, 0x01],
  [0x3e, 0x41, 0x41, 0x51, 0x32], [0x7f, 0x08, 0x08, 0x08, 0x7f], [0x00, 0x41, 0x7f, 0x41, 0x00],
  [0x20, 0x40, 0x41, 0x3f, 0x01], [0x7f, 0x08, 0x14, 0x22, 0x41], [0x7f, 0x40, 0x40, 0x40, 0x40],
  [0x7f, 0x02, 0x04, 0x02, 0x7f], [0x7f, 0x04, 0x08, 0x10, 0x7f], [0x3e, 0x41, 0x41, 0x41, 0x3e],
  [0x7f, 0x09, 0x09, 0x09, 0x06], [0x3e, 0x41, 0x51, 0x21, 0x5e], [0x7f, 0x09, 0x19, 0x29, 0x46],
  [0x46, 0x49, 0x49, 0x49, 0x31], [0x01, 0x01, 0x7f, 0x01, 0x01], [0x3f, 0x40, 0x40, 0x40, 0x3f],
  [0x1f, 0x20, 0x40, 0x20, 0x1f], [0x7f, 0x20, 0x18, 0x20, 0x7f], [0x63, 0x14, 0x08, 0x14, 0x63],
  [0x03, 0x04, 0x78, 0x04, 0x03], [0x61, 0x51, 0x49, 0x45, 0x43],
];

const FOLD: Record<string, string> = {
  Á: "A", À: "A", Ã: "A", Â: "A", É: "E", Ê: "E", Í: "I", Ó: "O", Õ: "O", Ô: "O",
  Ú: "U", Ç: "C", á: "A", à: "A", ã: "A", â: "A", é: "E", ê: "E", í: "I", ó: "O",
  õ: "O", ô: "O", ú: "U", ç: "C",
};

function glyphFor(char: string) {
  const folded = FOLD[char] ?? char;
  const code = folded.toUpperCase().charCodeAt(0);
  return FONT[code - 32] ?? FONT[0];
}

function buildColumns(items: string[], separator: string, spread: number) {
  const columns: number[] = [];
  const blanks = (count: number) => {
    for (let i = 0; i < count; i++) columns.push(0);
  };
  const writeText = (text: string) => {
    [...text].forEach((char, index, arr) => {
      if (char === " ") {
        blanks(spread + 3);
        return;
      }
      glyphFor(char).forEach((col) => columns.push(col));
      if (arr[index + 1] !== undefined && arr[index + 1] !== " ") blanks(spread);
    });
  };
  items.map((item) => item.trim()).filter(Boolean).forEach((item) => {
    writeText(item);
    blanks(spread + 5);
    writeText(separator);
    blanks(spread + 5);
  });
  return columns.length ? columns : [0, 0, 0, 0, 0];
}

export default function PixelLedDisplay({
  items = ["SITES PROFISSIONAIS", "SISTEMAS SOB MEDIDA", "IA APLICADA"],
  separator = "-",
  speed = 16,
  direction = "left",
  textSize = 96,
  dotSize = 12,
  spread = 1,
  onColor = "#F2D98A",
  offColor = "rgba(242,217,138,0.08)",
  className,
  style,
}: PixelLedDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const itemsKey = JSON.stringify(items);
  const columns = useMemo(() => buildColumns(JSON.parse(itemsKey), separator, spread), [itemsKey, separator, spread]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    let raf = 0;
    let last = 0;
    let offset = 0;
    let cell = 1;
    let radius = 1;
    let visibleCols = 0;
    let yPad = 0;

    const measure = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cssWidth = canvas.clientWidth || 600;
      const cssHeight = canvas.clientHeight || 120;
      const fittedTextSize = Math.min(textSize, cssHeight * 0.78);
      canvas.width = Math.max(1, Math.round(cssWidth * dpr));
      canvas.height = Math.max(1, Math.round(cssHeight * dpr));
      cell = Math.max(1, (fittedTextSize / ROWS) * dpr);
      radius = Math.min((dotSize * dpr) / 2, cell * 0.39);
      visibleCols = Math.ceil(canvas.width / cell) + 2;
      yPad = (canvas.height - ROWS * cell) / 2;
    };

    const dot = (x: number, y: number) => {
      ctx.moveTo(x + radius, y);
      ctx.arc(x, y, radius, 0, Math.PI * 2);
    };

    const draw = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const sign = direction === "right" ? -1 : 1;
      const whole = Math.floor(offset);
      const shift = (offset - whole) * cell;
      const xBase = -sign * shift;

      ctx.beginPath();
      for (let cx = 0; cx < visibleCols; cx++) {
        const px = xBase + cx * cell + cell / 2;
        for (let row = 0; row < ROWS; row++) dot(px, yPad + row * cell + cell / 2);
      }
      ctx.fillStyle = offColor;
      ctx.fill();

      ctx.beginPath();
      for (let cx = 0; cx < visibleCols; cx++) {
        const source = cx + sign * whole;
        const bits = columns[((source % columns.length) + columns.length) % columns.length];
        if (!bits) continue;
        const px = xBase + cx * cell + cell / 2;
        for (let row = 0; row < ROWS; row++) {
          if ((bits >> row) & 1) dot(px, yPad + row * cell + cell / 2);
        }
      }
      const wobble = 0.9 + Math.sin(time / 120) * 0.04 + Math.sin(time / 43) * 0.025;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.shadowColor = onColor;
      ctx.shadowBlur = radius * 5;
      ctx.globalAlpha = wobble;
      ctx.fillStyle = onColor;
      ctx.fill();
      ctx.restore();
    };

    const frame = (time: number) => {
      const dt = last ? Math.min((time - last) / 1000, 0.05) : 0;
      last = time;
      offset = (offset + speed * dt) % columns.length;
      draw(time);
      raf = requestAnimationFrame(frame);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(canvas);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [columns, direction, dotSize, offColor, onColor, speed, textSize]);

  return <canvas ref={canvasRef} className={className} style={{ display: "block", height: "100%", width: "100%", ...style }} />;
}
