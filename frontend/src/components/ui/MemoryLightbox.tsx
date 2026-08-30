"use client";

import { useEffect, useRef, useState } from "react";
import { getMediaUrl } from "@/lib/api";
import { speak, stopSpeaking } from "@/lib/speech";

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
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        aria-label={closeLabel}
        onClick={handleClose}
        className="absolute inset-0 h-full w-full cursor-pointer bg-ink/80"
      />
      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col gap-4 overflow-y-auto rounded-3xl border-4 border-black bg-white p-5 shadow-[6px_6px_0_rgba(0,0,0,1)]">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-[family-name:var(--font-serif)] text-2xl font-bold text-ink">
            {title}
          </h2>
        </div>

        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={altText ?? title}
            className="max-h-[45vh] w-full rounded-2xl border-4 border-black bg-surface-muted object-contain"
          />
        ) : null}

        {text ? (
          <p className="rounded-2xl border-2 border-border bg-surface p-4 text-xl font-semibold leading-snug text-ink">
            {text}
          </p>
        ) : null}

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
          className="btn-tactile min-h-[64px] w-full rounded-2xl border-4 border-black bg-ink px-6 text-xl font-extrabold text-white"
        >
          ✕ {closeLabel}
        </button>
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
      className={`btn-tactile inline-flex min-h-[64px] items-center justify-center gap-3 rounded-2xl border-4 border-black px-6 text-xl font-extrabold ${
        speaking
          ? "animate-pulse bg-marigold text-ink ring-4 ring-marigold/70"
          : "bg-marigold text-ink"
      }`}
    >
      <span className="text-3xl">🔊</span>
      {speaking && (
        <span className="flex h-6 items-end gap-[3px]">
          {[1, 2, 3, 4].map((i) => (
            <span key={i} className="w-[4px] rounded-full bg-ink speak-bar" />
          ))}
        </span>
      )}
      <span>{speaking ? speakingLabel : listenLabel}</span>
    </button>
  );
}