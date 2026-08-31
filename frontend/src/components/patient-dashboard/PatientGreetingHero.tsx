"use client";

import Image from "next/image";
import { User, Sparkles, Paperclip, ShieldCheck, Volume2 } from "lucide-react";
import { AudioToggle } from "@/components/ui/AudioToggle";
import { speak } from "@/lib/speech";

interface PatientGreetingHeroProps {
  greeting: string;
  heroText: string;
  avatarPhoto: string | null;
  avatarInitials: string;
  langCode: string;
  rate: number;
  orientationText: string;
  heroPrompt: string;
  dateText: string;
}

export function PatientGreetingHero({
  greeting,
  heroText,
  avatarPhoto,
  avatarInitials,
  langCode,
  rate,
  orientationText,
  heroPrompt,
  dateText,
}: PatientGreetingHeroProps) {
  return (
    <div className="rounded-2xl border-3 border-black bg-surface p-4 sm:p-6 shadow-[4px_4px_0px_#000]">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl border-2 border-black bg-tea/15 text-tea shadow-[2px_2px_0px_#000] overflow-hidden">
            {avatarPhoto ? (
              <Image
                src={avatarPhoto}
                alt="Patient Avatar"
                width={64}
                height={64}
                className="h-full w-full object-cover"
                priority
              />
            ) : avatarInitials ? (
              <span className="font-serif text-xl sm:text-2xl font-black">{avatarInitials}</span>
            ) : (
              <User className="h-7 w-7" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <Paperclip className="h-3.5 w-3.5 text-tea" />
              <span className="text-[10px] font-black uppercase tracking-wider text-tea">
                MDoNER Cognitive Therapy Session
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-black text-ink">
              {greeting}
            </h1>
            <p className="text-xs sm:text-sm font-bold text-ink-secondary mt-0.5">
              {dateText} &bull; {orientationText}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => speak(heroText, langCode, rate)}
            className="btn-tactile inline-flex items-center gap-2 rounded-xl border-2 border-black bg-white px-3.5 py-1.5 text-xs font-black text-ink shadow-[2px_2px_0px_#000] cursor-pointer"
          >
            <Volume2 className="h-4 w-4 text-tea" />
            <span>Listen</span>
          </button>
          <AudioToggle />
          <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase text-tea bg-tea-light px-2.5 py-1 rounded-xl border border-tea/30">
            <ShieldCheck className="h-3.5 w-3.5" /> Caregiver Synced
          </span>
        </div>
      </div>

      <div className="mt-4 rounded-xl border-2 border-black bg-tea-light/60 p-3 text-xs font-bold text-ink flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-tea shrink-0" />
        <span>{heroPrompt}</span>
      </div>
    </div>
  );
}
