"use client";

import { useEffect, useRef, useState } from "react";
import { getMediaUrl } from "@/lib/api";
import { speak, stopSpeaking } from "@/lib/speech";
import { Heart, Volume2, X } from "lucide-react";

interface MemoryLightboxProps {
  open: boolean;
  onClose: () => void;
  photoUrl?: string | null;
  title: string;
  text?: string | null;
  langCode?: string;
  rate?: number;
  closeLabel?: string;
  listenLabel?: string;
  speakingLabel?: string;
  altText?: string;
}

export function MemoryLightbox({
  open,
  onClose,
  photoUrl,
  title,
  text,
  langCode = "en",
  rate = 0.85,
  closeLabel = "Close",
  listenLabel = "Listen to memory",
  speakingLabel = "Speaking...",
  altText,
}: MemoryLightboxProps) {
  const src = getMediaUrl(photoUrl ?? undefined) ?? null;
  const closeRef = useRef<HTMLButtonElement>(null);
  const prevFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    prevFocus.current = document.activeElement as HTMLElement | null;
    const closeBtn = closeRef.current;
    closeBtn?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      prevFocus.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleClose = () => {
    stopSpeaking();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        aria-label={closeLabel}
        onClick={handleClose}
        className="absolute inset-0 h-full w-full cursor-pointer bg-black/75 backdrop-blur-xs"
      />
      <div className="relative flex max-h-[92vh] w-full max-w-xl flex-col gap-4 overflow-y-auto rounded-3xl border-4 border-black bg-surface p-5 sm:p-6 shadow-[8px_8px_0px_#000] text-ink animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b-2 border-black/15 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl border-2 border-black bg-marigold text-white shadow-xs">
              <Heart className="h-4 w-4" />
            </span>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-tea block">
                Treasured Reminiscence
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-black text-ink leading-tight">
                {title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-black bg-surface hover:bg-surface-muted shadow-xs cursor-pointer"
            aria-label={closeLabel}
          >
            <X className="h-5 w-5 text-ink" />
          </button>
        </div>

        {/* Media Frame */}
        {src ? (
          <div className="relative overflow-hidden rounded-2xl border-3 border-black bg-amber-50/50 p-2 shadow-[3px_3px_0px_#000]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={altText ?? title}
              className="max-h-[42vh] w-full rounded-xl object-contain"
            />
          </div>
        ) : null}

        {/* Memory Text Body */}
        {text ? (
          <div className="rounded-2xl border-2 border-black/20 bg-amber-50/40 p-4 shadow-inner">
            <p className="font-serif text-base sm:text-lg font-bold leading-relaxed text-ink">
              {text}
            </p>
          </div>
        ) : null}

        {/* Action Controls */}
        <div className="flex flex-col gap-2.5 pt-1">
          {text ? (
            <ListenButton
              text={text}
              langCode={langCode}
              rate={rate}
              listenLabel={listenLabel}
              speakingLabel={speakingLabel}
            />
          ) : null}

          <button
            ref={closeRef}
            type="button"
            onClick={handleClose}
            className="btn-tactile flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl border-3 border-black bg-ink px-6 text-sm font-black text-white shadow-[3px_3px_0px_#000] hover:bg-black cursor-pointer"
          >
            <X className="h-4 w-4" />
            <span>{closeLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

interface ListenButtonProps {
  text: string;
  langCode: string;
  rate: number;
  listenLabel: string;
  speakingLabel: string;
}

function ListenButton({
  text,
  langCode,
  rate,
  listenLabel,
  speakingLabel,
}: ListenButtonProps) {
  const [speaking, setSpeaking] = useState(false);

  const handleClick = () => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    speak(text, langCode, rate, () => setSpeaking(true), () => setSpeaking(false));
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`btn-tactile flex min-h-[54px] w-full items-center justify-center gap-2.5 rounded-2xl border-3 border-black px-6 text-sm sm:text-base font-black shadow-[3px_3px_0px_#000] cursor-pointer ${
        speaking
          ? "animate-pulse bg-marigold text-white ring-3 ring-amber-300"
          : "bg-marigold text-white hover:bg-amber-600"
      }`}
    >
      <Volume2 className="h-5 w-5" />
      <span>{speaking ? speakingLabel : listenLabel}</span>
    </button>
  );
}
