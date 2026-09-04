"use client";

import { useEffect, useRef, useState } from "react";
import { Activity, ShieldCheck, RotateCcw } from "lucide-react";

const DESIGN_W = 440;
const DESIGN_H = 200;

export function TrajectoryHeatmap() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = DESIGN_W;
    let height = DESIGN_H;
    let progress = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const sx = width / DESIGN_W;
      const sy = height / DESIGN_H;
      const scale = () => {
        ctx.save();
        ctx.scale(sx, sy);
      };
      const restore = () => ctx.restore();

      // 1. Grid lines
      ctx.strokeStyle = "#E5E7EB";
      ctx.lineWidth = 1 / Math.max(sx, sy);
      scale();
      for (let x = 0; x <= 440; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 200);
        ctx.stroke();
      }
      for (let y = 0; y <= 200; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(440, y);
        ctx.stroke();
      }
      restore();

      // 2. Geodesic Optimal Path (Dashed Grey Line)
      ctx.save();
      ctx.scale(sx, sy);
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = "#9CA3AF";
      ctx.lineWidth = 2;
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(40, 160);
      ctx.lineTo(400, 40);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // 3. Patient Actual Trajectory with Micro-Jitter (Teal Line)
      ctx.save();
      ctx.scale(sx, sy);
      ctx.strokeStyle = "#1B4D3E";
      ctx.lineWidth = 3.5;
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(40, 160);

      const maxSteps = 100;
      const currentSteps = Math.floor((progress / 100) * maxSteps);

      for (let i = 1; i <= currentSteps; i++) {
        const t = i / maxSteps;
        const idealX = 40 + (400 - 40) * t;
        const idealY = 160 + (40 - 160) * t;

        // Realistic clinical motor tremor & hesitation wave
        const jitterY = Math.sin(t * 18) * 14 * Math.sin(t * Math.PI) + Math.cos(t * 32) * 4;
        const jitterX = Math.cos(t * 14) * 8 * Math.sin(t * Math.PI);

        ctx.lineTo(idealX + jitterX, idealY + jitterY);
      }
      ctx.stroke();
      ctx.restore();

      // 4. Start & End Target Anchors (drawn in design space so radii stay proportional)
      ctx.save();
      ctx.scale(sx, sy);
      ctx.fillStyle = "#1B4D3E";
      ctx.beginPath();
      ctx.arc(40, 160, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = "#DC2626";
      ctx.beginPath();
      ctx.arc(400, 40, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // 5. Hesitation Micro-Events (Yellow Warning Rings)
      ctx.save();
      ctx.scale(sx, sy);
      if (currentSteps > 35) {
        ctx.fillStyle = "#F59E0B";
        ctx.beginPath();
        ctx.arc(160, 118, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      if (currentSteps > 70) {
        ctx.fillStyle = "#F59E0B";
        ctx.beginPath();
        ctx.arc(280, 72, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();

      if (isPlaying) {
        progress += 1.2;
        if (progress > 100) progress = 100;
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    const resize = () => {
      const w = wrap.clientWidth;
      if (w <= 0) return;
      const dpr = window.devicePixelRatio || 1;
      width = Math.max(160, w);
      height = Math.round(width * (DESIGN_H / DESIGN_W));
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(() => resize());
    ro.observe(wrap);

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      ro.disconnect();
    };
  }, [isPlaying]);

  return (
    <div className="w-full rounded-2xl border-3 border-black bg-surface p-4 shadow-[4px_4px_0px_#000] text-left space-y-3">
      <div className="flex items-center justify-between border-b-2 border-black/10 pb-2">
        <span className="text-xs font-black uppercase tracking-wider text-tea flex items-center gap-1.5">
          <Activity className="h-4 w-4" /> Continuous Motor Trajectory Jitter
        </span>
        <span className="flex items-center gap-1 text-[10px] font-black uppercase text-teal-800 bg-teal-100 px-2 py-0.5 rounded border border-teal-300">
          <ShieldCheck className="h-3.5 w-3.5" /> High Precision
        </span>
      </div>

      <div
        ref={wrapRef}
        className="relative w-full overflow-hidden rounded-xl border-2 border-black bg-[#FAF6F0]"
      >
        <canvas ref={canvasRef} className="block max-w-full" />
      </div>

      {/* Quantitative Clinical Biomarkers */}
      <div className="grid grid-cols-3 gap-2 pt-1">
        <div className="rounded-xl border border-black/20 bg-[#FAF5EE] p-2 text-center">
          <span className="block text-[9px] font-bold text-ink-secondary uppercase">
            Path Efficiency
          </span>
          <span className="text-xs sm:text-sm font-black text-teal-800">89.4% (Optimal)</span>
        </div>

        <div className="rounded-xl border border-black/20 bg-[#FAF5EE] p-2 text-center">
          <span className="block text-[9px] font-bold text-ink-secondary uppercase">
            Reaction Latency
          </span>
          <span className="text-xs sm:text-sm font-black text-ink">420 ms</span>
        </div>

        <div className="rounded-xl border border-black/20 bg-[#FAF5EE] p-2 text-center">
          <span className="block text-[9px] font-bold text-ink-secondary uppercase">
            Apraxia Risk
          </span>
          <span className="text-xs sm:text-sm font-black text-green-700">Low / Stable</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-black/10">
        <span className="text-[11px] font-bold text-ink-secondary inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-600 inline-block shrink-0" />
          <span>Yellow indicators denote micro-hesitation cognitive checkpoints (&gt;350ms).</span>
        </span>
        <button
          type="button"
          onClick={() => {
            setIsPlaying(true);
            const canvas = canvasRef.current;
            if (canvas) {
              const ctx = canvas.getContext("2d");
              if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
          }}
          className="flex items-center gap-1 text-xs font-black text-tea hover:underline cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Replay Path
        </button>
      </div>
    </div>
  );
}