"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowLeft, Award, Paperclip } from "lucide-react";

interface GameHeaderProps {
  title: string;
  score: number;
  backHref: string;
  bgColor: string;
}

export function GameHeader({ title, score, backHref, bgColor }: GameHeaderProps) {
  const t = useTranslations("game");

  return (
    <div className={`${bgColor} border-b-3 border-black px-4 sm:px-6 py-3.5 text-white shadow-sm`}>
      <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
        <Link
          href={backHref}
          className="btn-tactile inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-white/20 px-3 py-1.5 text-xs font-black text-white hover:bg-white/30 shadow-[2px_2px_0px_#000]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>{t("back")}</span>
        </Link>
        <div className="flex items-center gap-2 min-w-0">
          <Paperclip className="h-4 w-4 text-white/80 shrink-0 hidden sm:inline" />
          <h1 className="font-serif font-black text-base sm:text-lg text-white truncate text-center">
            {title}
          </h1>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-white px-3 py-1 text-xs font-black text-ink shadow-[2px_2px_0px_#000]">
          <Award className="h-3.5 w-3.5 text-tea" />
          <span>{score} pts</span>
        </div>
      </div>
    </div>
  );
}
