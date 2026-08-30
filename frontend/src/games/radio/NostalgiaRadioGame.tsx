"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Radio, Music, Search } from "lucide-react";
import { GameHeader } from "@/components/layout/GameHeader";
import { GameError, GameLoading } from "@/components/games/GameState";
import { Celebration } from "@/components/games/Celebration";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { AudioPrompt } from "@/components/ui/AudioPrompt";
import { MemoryLightbox } from "@/components/ui/MemoryLightbox";
import {
  playPress,
  playCorrect,
  playComplete,
  playRadioTune,
  playLifeSong,
  playLandmarkChime,
  playDholBeat,
} from "@/lib/sound";
import { speak, stopSpeaking } from "@/lib/speech";
import { getMediaUrl } from "@/lib/api";
import { recordGameSession, resolveAdaptiveLevel } from "@/lib/telemetry";
import { useSessionGuard } from "@/games/useSessionGuard";
import { usePatientDetail } from "@/games/usePatientDetail";
import { speechRate, startLevel } from "@/games/config";

export interface RadioStation {
  id: string;
  freq: number; // e.g. 600 kHz
  title: string;
  stationName: string;
  desc: string;
  emoji: string;
  soundType: "flute" | "chimes" | "dhol" | "calm";
}

const STATIONS: RadioStation[] = [
  {
    id: "guwahati",
    freq: 600,
    title: "Akashvani Guwahati",
    stationName: "Folk Airs & Brahmaputra Melodies",
    desc: "Acoustic flute melodies reminiscent of Dr. Bhupen Hazarika.",
    emoji: "🪈",
    soundType: "flute",
  },
  {
    id: "shillong",
    freq: 840,
    title: "Akashvani Shillong",
    stationName: "Cathedral Chimes & Choral Airs",
    desc: "Peaceful Sunday cathedral bells and evening hymn harmonies.",
    emoji: "🔔",
    soundType: "chimes",
  },
  {
    id: "bihu",
    freq: 1040,
    title: "Village Gramophone",
    stationName: "Festive Dhol & Spring Rhythms",
    desc: "Heartwarming rhythmic beats of the spring harvest festival.",
    emoji: "🥁",
    soundType: "dhol",
  },
  {
    id: "tea-news",
    freq: 1300,
    title: "Hilltop Weather & Memories",
    stationName: "Evening Veranda Stories",
    desc: "Soothing acoustic tunes and childhood nostalgic airs.",
    emoji: "📻",
    soundType: "calm",
  },
];

function GameShell({
  title,
  score,
  children,
}: {
  title: string;
  score: number;
  children: React.ReactNode;
}) {
  return (
    <section className="pb-12">
      <GameHeader title={title} score={score} backHref="/patient/games" bgColor="bg-tea" />
      <div className="mx-auto max-w-3xl px-4 pt-6">{children}</div>
    </section>
  );
}

export function NostalgiaRadioGame() {
  const locale = useLocale();
  const { detail, loading, error, reload, patientId } = usePatientDetail();

  const level = resolveAdaptiveLevel(patientId, "radio", startLevel(detail));
  const rate = speechRate(detail);

  const [phase, setPhase] = useState<"intro" | "tune" | "done">("intro");
  const [currentFreq, setCurrentFreq] = useState(530);
  const [tunedStationId, setTunedStationId] = useState<string | null>(null);
  const [discoveredStations, setDiscoveredStations] = useState<string[]>([]);
  const [lightboxPhoto, setLightboxPhoto] = useState<{ title: string; url: string; note: string } | null>(null);
  const [score, setScore] = useState(0);
  const [taps, setTaps] = useState(0);
  const [startedAt, setStartedAt] = useState<string | null>(null);

  const guard = useSessionGuard({
    patientId,
    gameId: "radio",
    level,
    startedAt,
    taps,
    errorCount: 0,
  });

  useEffect(() => {
    return () => stopSpeaking();
  }, []);

  const activeStation = useMemo(
    () => STATIONS.find((s) => s.id === tunedStationId) ?? null,
    [tunedStationId]
  );

  // Associated memory photo for the tuned station
  const stationMemoryPhoto = useMemo(() => {
    if (!activeStation) return null;
    const places = detail?.familiarPlaces ?? [];
    const members = detail?.familyMembers ?? [];

    if (activeStation.id === "shillong") {
      const church = places.find((p) => p.name.toLowerCase().includes("cathedral") || p.name.toLowerCase().includes("church"));
      if (church) return { title: church.name, url: church.photoUrl ?? "", note: church.description ?? "" };
    }
    if (activeStation.id === "guwahati" && places.length > 0) {
      return { title: places[0].name, url: places[0].photoUrl ?? "", note: places[0].description ?? "" };
    }
    if (members.length > 0) {
      return { title: members[0].name, url: members[0].photoUrl ?? "", note: members[0].notes ?? "" };
    }
    return null;
  }, [activeStation, detail]);

  const playStationAudio = useCallback((station: RadioStation) => {
    playRadioTune();
    if (station.soundType === "flute") {
      playLifeSong();
    } else if (station.soundType === "chimes") {
      playLandmarkChime();
    } else if (station.soundType === "dhol") {
      playDholBeat(false);
      setTimeout(() => playDholBeat(true), 180);
      setTimeout(() => playDholBeat(false), 360);
    } else {
      playLifeSong();
    }
  }, []);

  function startRadio() {
    stopSpeaking();
    playPress();
    setCurrentFreq(600);
    setTunedStationId("guwahati");
    setDiscoveredStations(["guwahati"]);
    setScore(1);
    setTaps(0);
    setStartedAt(new Date().toISOString());
    setPhase("tune");

    playStationAudio(STATIONS[0]);
    speak(
      "Welcome to the Nostalgia Tuner. Turn the dial to explore vintage radio frequencies and rediscover cherished melodies.",
      locale,
      rate
    );
  }

  function tuneToStation(station: RadioStation) {
    playPress();
    setTaps((v) => v + 1);
    setCurrentFreq(station.freq);
    setTunedStationId(station.id);
    playStationAudio(station);

    if (!discoveredStations.includes(station.id)) {
      playCorrect();
      setScore((s) => s + 1);
      const nextDiscovered = [...discoveredStations, station.id];
      setDiscoveredStations(nextDiscovered);

      if (nextDiscovered.length >= STATIONS.length) {
        setTimeout(() => completeRadioSession(), 4000);
      }
    }

    speak(`${station.title}: ${station.stationName}. ${station.desc}`, locale, rate);
  }

  function completeRadioSession() {
    stopSpeaking();
    playComplete();
    setPhase("done");
    guard.markCompleted();

    if (startedAt) {
      recordGameSession(patientId, {
        gameId: "radio",
        level,
        outcome: "completed",
        score: STATIONS.length,
        startedAt,
        taps,
      });
    }
    speak(
      "You have tuned into all heritage radio stations! The memories and melodies are forever in your heart.",
      locale,
      rate
    );
  }

  if (loading) return <GameLoading />;
  if (error)
    return (
      <GameShell title="The Nostalgia Tuner" score={0}>
        <GameError onRetry={reload} />
      </GameShell>
    );

  return (
    <GameShell title="The Nostalgia Tuner 📻" score={score}>
      {phase === "intro" ? (
        <div className="flex flex-col items-center gap-6 py-8 text-center">
          <div className="text-6xl animate-pulse">📻</div>
          <p className="font-serif text-3xl font-black text-ink">
            The Nostalgia Tuner
          </p>
          <p className="max-w-md text-lg font-semibold text-ink-secondary">
            Tune into vintage All India Radio broadcasts to awaken nostalgic folk airs, church chimes, and family memories.
          </p>

          {/* Stations List Preview */}
          <div className="w-full max-w-md rounded-2xl border-3 border-black bg-surface p-4 text-left shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            <span className="text-xs font-black uppercase tracking-wider text-tea">
              Available Frequencies ({STATIONS.length} Stations)
            </span>
            <div className="mt-2 space-y-2">
              {STATIONS.map((s) => (
                <div key={s.id} className="flex items-center justify-between border-b border-border/60 pb-1.5 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{s.emoji}</span>
                    <span className="text-sm font-bold text-ink">{s.title}</span>
                  </div>
                  <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-black text-amber-900 border border-amber-300">
                    {s.freq} kHz
                  </span>
                </div>
              ))}
            </div>
          </div>

          <AudioPrompt
            text="Welcome to the Nostalgia Tuner. Turn the dial to explore vintage radio frequencies and cherished memories."
            label="Listen"
            size="md"
          />

          <ChunkyButton variant="tea" size="2xl" onClick={startRadio}>
            Turn On Radio 📻
          </ChunkyButton>
        </div>
      ) : phase === "tune" ? (
        <div className="flex flex-col items-center gap-5 py-4">
          {/* DISCOVERY PROGRESS BAR */}
          <div className="w-full max-w-md flex items-center justify-between rounded-2xl border-2 border-black bg-surface px-4 py-2 shadow-sm">
            <span className="text-sm font-black text-tea">📻 Akashvani Receiver</span>
            <span className="text-xs font-bold text-ink-secondary">
              {discoveredStations.length} / {STATIONS.length} Stations Tuned
            </span>
          </div>

          {/* VINTAGE WOODEN RADIO CASING */}
          <div className="relative w-full max-w-sm sm:max-w-md rounded-3xl border-4 border-[#3B2212] bg-[#2A1608] p-5 shadow-[8px_8px_0px_rgba(0,0,0,0.9)] overflow-hidden select-none">
            {/* Brass Nameplate */}
            <div className="text-center pb-2">
              <span className="inline-block rounded border border-amber-600 bg-gradient-to-r from-amber-700 via-amber-500 to-amber-700 px-4 py-0.5 text-[11px] font-black uppercase tracking-widest text-black shadow-inner">
                Akashvani Deluxe
              </span>
            </div>

            {/* Glowing Frequency Dial Meter */}
            <div className="relative my-3 rounded-2xl border-3 border-amber-900 bg-[#120B04] p-3 shadow-inner">
              <div className="flex justify-between text-[10px] font-black text-amber-400/80 mb-1 px-1">
                <span>530</span>
                <span>700</span>
                <span>900</span>
                <span>1100</span>
                <span>1300</span>
                <span>1600 kHz</span>
              </div>

              {/* Tuning Track & Needle */}
              <div className="relative h-6 w-full rounded-lg bg-black/60 border border-amber-500/40 overflow-hidden flex items-center">
                {/* Dial ticks */}
                <div className="absolute inset-0 flex justify-between px-2 opacity-30">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div key={i} className={`w-[1px] ${i % 4 === 0 ? "h-full bg-amber-400" : "h-2 bg-white"}`} />
                  ))}
                </div>

                {/* Moving Red Tuning Needle */}
                <div
                  className="absolute top-0 bottom-0 w-1.5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,1)] transition-all duration-500"
                  style={{
                    left: `${Math.max(2, Math.min(96, ((currentFreq - 530) / (1600 - 530)) * 100))}%`,
                  }}
                />
              </div>

              {/* Current Station Callout in Dial */}
              <div className="mt-2 text-center">
                <span className="font-serif text-lg font-black text-amber-300">
                  {activeStation ? `${activeStation.title} (${activeStation.freq} kHz)` : `${currentFreq} kHz`}
                </span>
              </div>
            </div>

            {/* Illuminated Memory Stage (Scrapbook Photo) */}
            {stationMemoryPhoto && stationMemoryPhoto.url ? (
              <div className="relative my-3 overflow-hidden rounded-2xl border-3 border-amber-900/80 bg-black shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getMediaUrl(stationMemoryPhoto.url) ?? ""}
                  alt={stationMemoryPhoto.title}
                  className="h-44 w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 text-white">
                  <p className="text-sm font-black">{stationMemoryPhoto.title}</p>
                  <p className="text-xs text-white/80 line-clamp-1">{stationMemoryPhoto.note}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setLightboxPhoto(stationMemoryPhoto)}
                  className="absolute top-2 right-2 rounded-full border border-black bg-surface/90 px-2.5 py-0.5 text-[10px] font-black text-ink shadow cursor-pointer flex items-center gap-1"
                >
                  <Search className="h-3 w-3" />
                  <span>View</span>
                </button>
              </div>
            ) : (
              /* Woven Speaker Grille Pattern */
              <div className="my-3 h-32 w-full rounded-2xl border-2 border-amber-900/60 bg-[radial-gradient(#D97706_1px,transparent_1px)] [background-size:8px_8px] bg-black/40 flex items-center justify-center text-center p-4">
                <p className="text-sm font-bold text-amber-200/90">
                  {activeStation ? activeStation.desc : "Tune into a station below"}
                </p>
              </div>
            )}
          </div>

          {/* STATION PRESET BUTTONS */}
          <div className="w-full max-w-md space-y-2 text-center pt-2">
            <p className="text-sm font-black text-ink-secondary uppercase tracking-wider">
              Tap to Tune Into Heritage Frequencies
            </p>
            <div className="grid grid-cols-2 gap-3">
              {STATIONS.map((station) => {
                const isTuned = tunedStationId === station.id;
                const isDiscovered = discoveredStations.includes(station.id);

                return (
                  <button
                    key={station.id}
                    type="button"
                    onClick={() => tuneToStation(station)}
                    className={`btn-tactile group relative flex items-center gap-3 rounded-2xl border-3 border-black p-3 text-left transition-all duration-200 cursor-pointer shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-0.5 ${
                      isTuned
                        ? "bg-tea text-white scale-102 ring-4 ring-tea"
                        : isDiscovered
                        ? "bg-amber-100 text-ink hover:bg-amber-200"
                        : "bg-surface text-ink hover:bg-surface-muted"
                    }`}
                  >
                    <span className="text-3xl">{station.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-black leading-tight truncate">
                        {station.title}
                      </p>
                      <span className="text-[10px] font-bold opacity-80">
                        {station.freq} kHz {isDiscovered ? "✓" : ""}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* PHASE: DONE CELEBRATION */
        <Celebration icon={Radio} title="All Heritage Frequencies Discovered!">
          <div className="flex flex-col items-center gap-5 max-w-md mx-auto text-left">
            <div className="relative w-full rounded-3xl border-4 border-black bg-[#FAF5EE] p-5 shadow-[6px_6px_0px_rgba(0,0,0,1)] text-ink select-none">
              <h3 className="font-serif text-2xl font-black text-tea">
                Akashvani Memory Broadcast
              </h3>
              <p className="text-xs font-bold text-ink-secondary mt-1">
                You tuned into every timeless frequency across the North Eastern hills.
              </p>

              {/* Station Recap */}
              <div className="mt-3 space-y-1.5 border-t border-border pt-2">
                {STATIONS.map((s) => (
                  <div key={s.id} className="flex items-center justify-between text-xs font-extrabold text-ink">
                    <span>{s.title}</span>
                    <span className="text-tea">Tuned ({s.freq} kHz) ✓</span>
                  </div>
                ))}
              </div>

              {/* Replay Music */}
              <div className="mt-4 flex items-center justify-between pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => playLifeSong()}
                  className="group flex items-center gap-2 rounded-xl border-2 border-black bg-marigold-light px-3.5 py-2 text-ink shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-transform active:translate-y-0.5 cursor-pointer"
                >
                  <Music className="h-4 w-4 text-ink" />
                  <span className="text-xs font-black">Replay Folk Broadcast</span>
                </button>
                <span className="text-xs font-bold text-ink-secondary">
                  Score: {score}/{STATIONS.length}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <ChunkyButton variant="tea" size="xl" onClick={startRadio}>
                Tune Again
              </ChunkyButton>
              <Link
                href="/patient"
                className="btn-tactile inline-flex items-center gap-2 rounded-2xl border-2 border-border bg-surface px-6 py-3 font-extrabold text-ink hover:bg-surface-muted shadow-[2px_2px_0px_rgba(0,0,0,1)]"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </Celebration>
      )}

      {/* Memory Lightbox */}
      <MemoryLightbox
        open={lightboxPhoto !== null}
        onClose={() => setLightboxPhoto(null)}
        photoUrl={lightboxPhoto?.url}
        title={lightboxPhoto?.title ?? ""}
        text={lightboxPhoto?.note ?? null}
        langCode={locale}
        rate={rate}
        closeLabel="Close"
        listenLabel="Listen"
        speakingLabel="Listening..."
      />
    </GameShell>
  );
}
