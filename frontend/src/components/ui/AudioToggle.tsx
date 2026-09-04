"use client";

import { useState, useCallback } from "react";
import { Volume2, Volume1, VolumeX } from "lucide-react";
import {
  getVolume,
  setVolume,
  isEnabled,
  setSoundsEnabled,
  playTapFeedback,
} from "@/lib/sound";

import { useLocale } from "next-intl";
import { getHubStrings } from "@/lib/gameI18n";

const CARD =
  "border-2 border-black rounded-2xl shadow-[3px_3px_0px_rgba(0,0,0,1)]";

export function AudioToggle() {
  const locale = useLocale();
  const hub = getHubStrings(locale);
  const [volume, setVol] = useState(() => getVolume());
  const [enabled, setEnabled] = useState(() => isEnabled());
  const [showSlider, setShowSlider] = useState(false);

  const toggle = useCallback(() => {
    const next = !enabled;
    setSoundsEnabled(next);
    setEnabled(next);
    if (next) playTapFeedback();
  }, [enabled]);

  const changeVolume = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = Number(e.target.value) / 100;
      setVolume(v);
      setVol(v);
      if (!enabled) {
        setSoundsEnabled(true);
        setEnabled(true);
      }
    },
    [enabled]
  );

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowSlider(true)}
      onMouseLeave={() => setShowSlider(false)}
      onFocus={() => setShowSlider(true)}
      onBlur={() => setShowSlider(false)}
    >
      <button
        type="button"
        onClick={toggle}
        aria-label={enabled ? hub.soundOff : hub.soundOn}
        className={`${CARD} btn-tactile flex min-h-[48px] items-center gap-2 rounded-xl bg-surface px-3 text-base font-extrabold text-ink`}
      >
        <span className="flex items-center" aria-hidden="true">
          {enabled ? (
            volume > 0.5 ? (
              <Volume2 className="h-5 w-5 text-tea" />
            ) : volume > 0 ? (
              <Volume1 className="h-5 w-5 text-tea" />
            ) : (
              <VolumeX className="h-5 w-5 text-ink-secondary" />
            )
          ) : (
            <VolumeX className="h-5 w-5 text-ink-secondary" />
          )}
        </span>
        <span className="hidden sm:inline text-sm">
          {enabled ? hub.soundOn : hub.soundOff}
        </span>
      </button>

      {showSlider && enabled && (
        <div className="absolute top-full left-0 z-50 mt-1 w-40 rounded-xl border-2 border-black bg-white p-3 shadow-md">
          <input
            type="range"
            min="0"
            max="100"
            value={Math.round(volume * 100)}
            onChange={changeVolume}
            className="w-full accent-tea cursor-pointer"
            aria-label="Volume"
          />
          <p className="mt-1 text-center text-xs font-bold text-ink-secondary">
            {Math.round(volume * 100)}%
          </p>
        </div>
      )}
    </div>
  );
}
