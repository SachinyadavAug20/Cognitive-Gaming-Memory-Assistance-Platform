"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Award,
  CheckCircle2,
  Sparkles,
  Zap,
  ShieldCheck,
  Paperclip,
} from "lucide-react";

interface CelebrationProps {
  icon?: LucideIcon | React.ComponentType<{ className?: string; size?: number | string }>;
  emoji?: string;
  title: string;
  subtitle?: string;
  xpEarned?: number;
  accuracy?: string;
  pieces?: number;
  children?: ReactNode;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  vRot: number;
  shape: "rect" | "circle" | "star";
  alpha: number;
}

const PARTICLE_COLORS = [
  "#1B4D3E", // Deep Tea
  "#D97706", // Marigold
  "#2563EB", // Blue
  "#059669", // Emerald
  "#DC2626", // Brick
  "#F59E0B", // Gold
  "#7C3AED", // Violet
];

export function Celebration({
  icon: Icon = Award,
  title,
  subtitle = "Cognitive engagement session verified and recorded into digital clinical record.",
  xpEarned = 100,
  accuracy = "100%",
  children,
}: CelebrationProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [xpDisplay, setXpDisplay] = useState(0);

  // Animated count-up for XP
  useEffect(() => {
    let current = 0;
    const step = Math.max(1, Math.floor(xpEarned / 25));
    const interval = setInterval(() => {
      current += step;
      if (current >= xpEarned) {
        setXpDisplay(xpEarned);
        clearInterval(interval);
      } else {
        setXpDisplay(current);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [xpEarned]);

  // Canvas particle physics engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const width = (canvas.width = canvas.offsetWidth || 600);
    const height = (canvas.height = canvas.offsetHeight || 500);

    const particles: Particle[] = [];
    const count = 90;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 4 + Math.random() * 8;
      particles.push({
        x: width / 2,
        y: height / 3,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        size: 5 + Math.random() * 7,
        color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2,
        shape: i % 3 === 0 ? "star" : i % 2 === 0 ? "rect" : "circle",
        alpha: 1,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      let alive = false;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.16; // gravity
        p.vx *= 0.98; // air resistance
        p.rotation += p.vRot;
        p.alpha -= 0.005;

        if (p.alpha > 0) {
          alive = true;
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = p.color;

          if (p.shape === "circle") {
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          } else if (p.shape === "rect") {
            ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.6);
          } else {
            // Draw 4-point star
            ctx.beginPath();
            ctx.moveTo(0, -p.size);
            ctx.lineTo(p.size * 0.3, -p.size * 0.3);
            ctx.lineTo(p.size, 0);
            ctx.lineTo(p.size * 0.3, p.size * 0.3);
            ctx.lineTo(0, p.size);
            ctx.lineTo(-p.size * 0.3, p.size * 0.3);
            ctx.lineTo(-p.size, 0);
            ctx.lineTo(-p.size * 0.3, -p.size * 0.3);
            ctx.closePath();
            ctx.fill();
          }

          ctx.restore();
        }
      }

      if (alive) {
        animId = requestAnimationFrame(render);
      }
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center gap-5 py-6 text-center max-w-xl mx-auto w-full">
      {/* Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 w-full h-full z-0"
      />

      {/* Official Government Dossier Ribbon */}
      <div className="relative z-10 w-full max-w-md flex items-center justify-between rounded-xl border-2 border-black bg-[#EFE9DF] px-3.5 py-1.5 shadow-[2px_2px_0px_#000]">
        <div className="flex items-center gap-2">
          <Paperclip className="h-4 w-4 text-ink" />
          <span className="text-[11px] font-black uppercase tracking-wider text-ink">
            Clinical Milestone Protocol // Verified
          </span>
        </div>
        <ShieldCheck className="h-4 w-4 text-tea" />
      </div>

      {/* Hero Badge Box */}
      <div className="relative z-10 flex flex-col items-center gap-3">
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border-3 border-black bg-tea text-white shadow-[4px_4px_0px_#000] animate-bounce">
          <Icon className="h-10 w-10 stroke-[2.5]" />
          <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-black bg-marigold text-white shadow-sm">
            <Sparkles className="h-4 w-4" />
          </span>
        </div>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 rounded-full border-2 border-black bg-tea-light px-3 py-1 text-xs font-black text-ink shadow-[2px_2px_0px_#000]">
            <CheckCircle2 className="h-3.5 w-3.5 text-tea" />
            <span>Therapeutic Objective Complete</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-ink font-serif">
            {title}
          </h2>
          <p className="text-xs font-semibold text-ink-secondary max-w-md mx-auto">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Gamified Stat Progression Bar (Boot.dev Inspired) */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border-3 border-black bg-surface p-3.5 shadow-[4px_4px_0px_#000] text-left">
        <div className="flex items-center justify-between border-b-2 border-black/10 pb-2 mb-2.5">
          <div className="flex items-center gap-1.5 text-xs font-black uppercase text-tea">
            <Zap className="h-4 w-4 text-marigold fill-marigold" />
            <span>Reminiscence Experience</span>
          </div>
          <span className="text-xs font-black text-ink bg-marigold/20 border border-marigold px-2 py-0.5 rounded-md">
            +{xpDisplay} XP
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-center text-xs font-black">
          <div className="rounded-xl border-2 border-black bg-tea-light/40 p-2">
            <span className="text-[10px] text-ink-secondary block uppercase">Precision Score</span>
            <span className="text-base text-tea">{accuracy}</span>
          </div>
          <div className="rounded-xl border-2 border-black bg-amber-50 p-2">
            <span className="text-[10px] text-ink-secondary block uppercase">Cognitive Status</span>
            <span className="text-base text-amber-900">Engaged</span>
          </div>
        </div>
      </div>

      {/* Custom Game Milestone Content */}
      {children && <div className="relative z-10 flex flex-col items-center gap-4 w-full">{children}</div>}
    </div>
  );
}
