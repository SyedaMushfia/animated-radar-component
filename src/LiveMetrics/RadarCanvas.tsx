import { useEffect, useRef } from "react";
import type { MetricConfig, LiveMetricsTheme, RadarOptions } from "./types";

interface RadarCanvasProps {
  metrics: MetricConfig[];
  radarRadius: number;
  theme: LiveMetricsTheme;
  radar: RadarOptions;
}

/** 
 * Parses a CSS color string and returns it with the given alpha applied.
 * - Works for hex colors (#rrggbb / #rgb)
 * - Passes rgba/rgb strings through untouched (to avoid double-alpha)
 */
function withAlpha(color: string, alpha: number): string {
  if (color.startsWith("rgba") || color.startsWith("rgb(")) return color;

  // Convert 3-digit hex to 6-digit hex
  let hex = color.replace("#", "");
  if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");

  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  return `rgba(${r},${g},${b},${alpha})`;
}

export function RadarCanvas({ metrics, radarRadius, theme, radar }: RadarCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sweepAngle = useRef<number>(0);       // Current sweep arm rotation in radians
  const rafRef = useRef<number | null>(null); // RequestAnimationFrame reference

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = canvas.width;
    const cx = size / 2; // Center X
    const cy = size / 2; // Center Y
    const R = radarRadius;
    const accent = theme.accentColor;

    /** Main draw loop */
    function draw() {
      if (!ctx) return;

      // Clear canvas for the next frame
      ctx.clearRect(0, 0, size, size);

      // ── Draw concentric rings
      for (let i = 1; i <= radar.ringCount; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, (R / radar.ringCount) * i, 0, Math.PI * 2);
        ctx.strokeStyle = withAlpha(accent, 0.06 + i * 0.015);
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // ── Draw radial grid spokes every 30 degrees
      for (let a = 0; a < 360; a += 30) {
        const rad = (a * Math.PI) / 180;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(rad) * R, cy + Math.sin(rad) * R);
        ctx.strokeStyle = withAlpha(accent, 0.07);
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // ── Update sweep arm angle if enabled
      if (radar.showSweep && radar.sweepSpeed > 0) {
        sweepAngle.current = (sweepAngle.current + radar.sweepSpeed) % (Math.PI * 2);
      }

      // ── Draw sweep arm
      if (radar.showSweep) {
        const sweep = sweepAngle.current;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(sweep);

        // Sweep tail (fading gradient)
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, R, -Math.PI * 0.32, 0);
        ctx.closePath();
        const tailGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, R);
        tailGrad.addColorStop(0,    withAlpha(accent, 0.00));
        tailGrad.addColorStop(0.4,  withAlpha(accent, 0.08));
        tailGrad.addColorStop(0.75, withAlpha(accent, 0.18));
        tailGrad.addColorStop(1,    withAlpha(accent, 0.06));
        ctx.fillStyle = tailGrad;
        ctx.fill();

        // Sweep line (bright front)
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(R, 0);
        ctx.strokeStyle = withAlpha(accent, 0.97);
        ctx.lineWidth = 1.2;
        ctx.shadowBlur = 0;
        ctx.stroke();

        ctx.restore();
      }

      // ── Draw central glow
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 18);
      cg.addColorStop(0,   withAlpha(accent, 0.95));
      cg.addColorStop(0.4, withAlpha(accent, 0.4));
      cg.addColorStop(1,   "transparent");
      ctx.beginPath();
      ctx.arc(cx, cy, 18, 0, Math.PI * 2);
      ctx.fillStyle = cg;
      ctx.fill();

      // ── Draw blips for each metric
      metrics.forEach((m) => {
        const rad = (m.blip.angle * Math.PI) / 180;
        const bx = cx + Math.cos(rad) * m.blip.r * R;
        const by = cy + Math.sin(rad) * m.blip.r * R;

        if (m.disconnected) {
          // Gray out disconnected blips
          ctx.beginPath();
          ctx.arc(bx, by, 4, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(150,150,150,0.4)";
          ctx.shadowBlur = 0;
          ctx.fill();
          return;
        }

        // Blip pulse animation
        const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 600 + m.blip.angle);

        // Blip glow
        const bg = ctx.createRadialGradient(bx, by, 0, bx, by, 10 + pulse * 4);
        bg.addColorStop(0, m.color);
        bg.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(bx, by, 10 + pulse * 4, 0, Math.PI * 2);
        ctx.fillStyle = bg;
        ctx.fill();

        // Blip core
        ctx.beginPath();
        ctx.arc(bx, by, 4, 0, Math.PI * 2);
        ctx.fillStyle = m.color;
        ctx.shadowBlur = 14;
        ctx.shadowColor = m.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Request the next frame
      rafRef.current = requestAnimationFrame(draw);
    }

    // Start drawing loop
    draw();

    // Cleanup animation frame on unmount
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [metrics, radarRadius, theme, radar]);

  return (
    <canvas
      ref={canvasRef}
      width={radarRadius * 2}
      height={radarRadius * 2}
      style={{ width: radarRadius * 2, height: radarRadius * 2 }}
      className="absolute inset-0"
    />
  );
}