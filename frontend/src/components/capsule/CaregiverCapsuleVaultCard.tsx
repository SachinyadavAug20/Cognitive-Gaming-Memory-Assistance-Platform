"use client";

import React, { useState } from "react";
import { Link } from "@/i18n/navigation";
import {
  Sparkles,
  Plus,
  Play,
  Volume2,
  Heart,
  Eye,
  Camera,
  Layers,
  Bird,
  CloudRain,
  Waves,
  Bell,
  Music,
  Store,
  Clock,
  Lock,
  Shield,
  Smile,
  Calendar,
} from "lucide-react";
import type { MemoryCapsule, AmbientSoundType, FutureTimeCapsule } from "@/types/capsule";
import { getAllCapsulesForPatient, getCapsuleSessionLogs, getFutureTimeCapsules } from "@/data/defaultCapsules";
import { CreateCapsuleModal } from "./CreateCapsuleModal";
import { FutureTimeCapsuleModal } from "./FutureTimeCapsuleModal";
import { speak, stopSpeaking } from "@/lib/speech";

interface CaregiverCapsuleVaultCardProps {
  patientId: number;
  patientName: string;
}

function SoundIcon({ type }: { type: AmbientSoundType }) {
  if (type === "rain") return <CloudRain className="h-3.5 w-3.5 text-blue-700" />;
  if (type === "river") return <Waves className="h-3.5 w-3.5 text-cyan-700" />;
  if (type === "namghar") return <Bell className="h-3.5 w-3.5 text-amber-700" />;
  if (type === "flute") return <Music className="h-3.5 w-3.5 text-teal-700" />;
  if (type === "bazaar") return <Store className="h-3.5 w-3.5 text-orange-700" />;
  return <Bird className="h-3.5 w-3.5 text-emerald-700" />;
}

export function CaregiverCapsuleVaultCard({
  patientId,
  patientName,
}: CaregiverCapsuleVaultCardProps) {
  const [activeTab, setActiveTab] = useState<"scenes" | "timeCapsules">("scenes");
  const [capsules, setCapsules] = useState<MemoryCapsule[]>(() =>
    getAllCapsulesForPatient(patientId)
  );
  const [timeCapsules, setTimeCapsules] = useState<FutureTimeCapsule[]>(() =>
    getFutureTimeCapsules(patientId)
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTimeCapsuleModalOpen, setIsTimeCapsuleModalOpen] = useState(false);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  const logs = getCapsuleSessionLogs(patientId);

  const handleCreated = (newCapsule: MemoryCapsule) => {
    setCapsules((prev) => [newCapsule, ...prev]);
  };

  const handleTimeCapsuleClose = () => {
    setIsTimeCapsuleModalOpen(false);
    setTimeCapsules(getFutureTimeCapsules(patientId));
  };

  const handlePlayVoice = (cap: FutureTimeCapsule) => {
    if (playingVoiceId === cap.id) {
      stopSpeaking();
      setPlayingVoiceId(null);
      return;
    }
    stopSpeaking();
    setPlayingVoiceId(cap.id);
    speak(cap.messageText, "as", 0.82, undefined, () => {
      setPlayingVoiceId(null);
    });
  };

  return (
    <div className="scrapbook-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-border-soft pb-4 mb-4">
        <div>
          <h2 className="font-[family-name:var(--font-serif)] font-bold text-xl md:text-2xl text-ink flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-amber-600" />
            <span>Echoes of Home — Memories & Soundscapes</span>
          </h2>
          <p className="text-sm text-ink-secondary mt-0.5">
            Living 3D spatial scenes, peaceful regional soundscapes, and sealed future messages
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/patient/echoes-of-home?capsuleId=${capsules[0]?.id || ""}`}
            className="btn-tactile inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-white px-3.5 py-1.5 text-xs font-black text-ink shadow-[2px_2px_0px_#000] hover:bg-amber-50 cursor-pointer"
          >
            <Play className="h-3.5 w-3.5 text-tea fill-tea" />
            <span>Launch Player</span>
          </Link>

          {activeTab === "scenes" ? (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="btn-tactile inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-tea px-3.5 py-1.5 text-xs font-black text-white shadow-[2px_2px_0px_#000] hover:bg-tea-dark cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>New 3D Scene</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsTimeCapsuleModalOpen(true)}
              className="btn-tactile inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-amber-600 px-3.5 py-1.5 text-xs font-black text-white shadow-[2px_2px_0px_#000] hover:bg-amber-700 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Seal New Time Capsule</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-4">
        <button
          type="button"
          onClick={() => setActiveTab("scenes")}
          className={`px-4 py-2 rounded-xl text-xs font-black border-2 border-black transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "scenes"
              ? "bg-tea text-white shadow-[2px_2px_0px_#000]"
              : "bg-surface text-ink hover:bg-surface-muted shadow-xs"
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>3D Living Scenes ({capsules.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("timeCapsules")}
          className={`px-4 py-2 rounded-xl text-xs font-black border-2 border-black transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "timeCapsules"
              ? "bg-amber-600 text-white shadow-[2px_2px_0px_#000]"
              : "bg-surface text-ink hover:bg-surface-muted shadow-xs"
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>Future Time Capsules ({timeCapsules.length})</span>
        </button>
      </div>

      {/* Clinical Telemetry & Engagement Strip */}
      <div className="mb-5 rounded-2xl border-2 border-black bg-amber-50/70 p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-bold text-ink">
              <strong>{capsules.length}</strong> Living Capsules Ready
            </span>
          </div>
          <span className="text-ink-secondary hidden sm:inline">•</span>
          <span className="font-bold text-ink hidden sm:inline">
            3D Spatial Audio: <strong>Active</strong>
          </span>
          <span className="text-ink-secondary hidden sm:inline">•</span>
          <span className="font-bold text-ink hidden md:inline">
            Webcam Gaze Tracking: <strong>Calibrated</strong>
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-ink-secondary font-bold">
          {logs.length > 0 ? (
            <span className="text-emerald-900 bg-emerald-100 border border-emerald-300 rounded-lg px-2.5 py-0.5 font-black text-[11px]">
              Latest Session: {logs[0].caregiverObservation ? `Patient ${logs[0].caregiverObservation}` : "Completed"} ({logs[0].durationSeconds}s)
            </span>
          ) : (
            <span className="text-[11px] text-ink-secondary">
              Gaze engagement & emotional reactions automatically recorded
            </span>
          )}
        </div>
      </div>

      {/* Grid of Capsules or Time Capsules */}
      {activeTab === "scenes" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {capsules.map((cap) => (
            <div
              key={cap.id}
              className="group relative rounded-2xl border-3 border-black bg-surface p-3.5 shadow-[4px_4px_0px_#000] flex flex-col justify-between hover:translate-y-[-2px] transition-transform"
            >
              <div>
                {/* Photo Banner with Badges */}
                <div className="relative h-36 w-full rounded-xl overflow-hidden border-2 border-black mb-3 bg-slate-900">
                  <img
                    src={cap.photoUrl}
                    alt={cap.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                  {/* Top Badges */}
                  <div className="absolute top-2 left-2 flex items-center gap-1">
                    <span className="inline-flex items-center gap-1 rounded-full border border-black/40 bg-white/90 px-2 py-0.5 text-[10px] font-black text-ink backdrop-blur-xs">
                      <SoundIcon type={cap.ambientSoundType} />
                      <span className="capitalize">{cap.ambientSoundType}</span>
                    </span>
                    {cap.hotspots && cap.hotspots.length > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-600 bg-amber-300 px-2 py-0.5 text-[10px] font-black text-amber-950">
                        <Sparkles className="h-3 w-3" />
                        <span>{cap.hotspots.length} Hotspots</span>
                      </span>
                    )}
                  </div>

                  <div className="absolute top-2 right-2">
                    <span className="inline-flex items-center gap-1 rounded-full border border-black/40 bg-amber-200 px-2 py-0.5 text-[10px] font-black text-amber-950">
                      <Layers className="h-3 w-3" />
                      <span>3D Scene</span>
                    </span>
                  </div>

                  {/* Bottom Photo Title */}
                  <div className="absolute bottom-2 left-2 right-2 text-white">
                    <span className="text-[10px] font-semibold text-white/80 block truncate">
                      {cap.locationName}
                    </span>
                    <h3 className="font-serif text-sm font-black text-white leading-tight line-clamp-1">
                      {cap.title}
                    </h3>
                  </div>
                </div>

                {/* Family voice note preview */}
                <div className="rounded-xl border border-black/10 bg-amber-50/70 p-2.5 mb-3 text-xs">
                  <div className="flex items-center gap-1.5 text-amber-900 font-bold mb-1">
                    <Volume2 className="h-3.5 w-3.5 text-amber-800 shrink-0" />
                    <span className="text-[11px] font-black">
                      Voice Note from {cap.familyMemberName} ({cap.relationship})
                    </span>
                  </div>
                  <p className="text-[11px] text-ink italic line-clamp-2 leading-relaxed">
                    "{cap.voiceNoteText}"
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-black/10">
                <span className="text-[10px] font-bold text-ink-secondary capitalize">
                  {cap.seasonOrTime}
                </span>
                <Link
                  href={`/patient/echoes-of-home?capsuleId=${cap.id}`}
                  className="btn-tactile inline-flex items-center gap-1.5 rounded-lg border-2 border-black bg-tea-light px-3 py-1 text-xs font-black text-tea-dark shadow-[1px_1px_0px_#000] hover:bg-tea hover:text-white cursor-pointer transition-colors"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Experience</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border-2 border-amber-300 bg-amber-50/80 p-3 text-xs text-amber-950 flex items-start gap-2.5">
            <Clock className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">
                Identity Anchors & Messages for Future Days
              </p>
              <p className="text-amber-900/90 text-[11px] mt-0.5 leading-relaxed">
                These sealed time capsules provide emotional orientation and reassurance when the patient feels disoriented or during festive milestones (Rongali Bihu, family reunions).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {timeCapsules.map((tc) => {
              const isPlaying = playingVoiceId === tc.id;
              return (
                <div
                  key={tc.id}
                  className="group rounded-2xl border-3 border-black bg-surface p-4 shadow-[4px_4px_0px_#000] flex flex-col justify-between hover:translate-y-[-2px] transition-transform"
                >
                  <div>
                    {/* Header badges */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="inline-flex items-center gap-1 rounded-full border border-black/20 bg-amber-100 px-2.5 py-0.5 text-[10px] font-black text-amber-900">
                        <Lock className="h-3 w-3" />
                        <span className="capitalize">{tc.milestone.replace("_", " ")}</span>
                      </span>
                      <span className="text-[10px] font-bold text-ink-secondary">
                        {new Date(tc.sealedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="font-serif text-base font-black text-ink mb-1">
                      {tc.title}
                    </h3>
                    <p className="text-[11px] font-bold text-ink-secondary mb-3">
                      By {tc.authorName} • For {tc.recipient.replace("_", " ")}
                    </p>

                    {/* Photo if present */}
                    {tc.photoUrl && (
                      <div className="relative h-32 w-full rounded-xl overflow-hidden border-2 border-black mb-3">
                        <img
                          src={tc.photoUrl}
                          alt={tc.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}

                    {/* Message Card */}
                    <div className="rounded-xl border border-black/10 bg-amber-50/60 p-3 mb-3 text-xs leading-relaxed text-ink italic font-serif">
                      "{tc.messageText}"
                    </div>
                  </div>

                  {/* Audio note button */}
                  <div className="pt-2 border-t border-black/10 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handlePlayVoice(tc)}
                      className={`btn-tactile inline-flex items-center gap-1.5 rounded-lg border-2 border-black px-2.5 py-1 text-xs font-black cursor-pointer ${
                        isPlaying
                          ? "bg-emerald-500 text-white"
                          : "bg-white text-ink hover:bg-amber-100 shadow-[1px_1px_0px_#000]"
                      }`}
                    >
                      <Volume2 className={`h-3.5 w-3.5 ${isPlaying ? "animate-bounce" : ""}`} />
                      <span>{isPlaying ? "Playing..." : "Listen Note"}</span>
                    </button>

                    <Link
                      href="/patient/echoes-of-home"
                      className="text-xs font-black text-tea hover:underline inline-flex items-center gap-1"
                    >
                      <span>Stage View</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <CreateCapsuleModal
        patientId={patientId}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={handleCreated}
      />

      <FutureTimeCapsuleModal
        patientId={patientId}
        patientName={patientName}
        isOpen={isTimeCapsuleModalOpen}
        onClose={handleTimeCapsuleClose}
        langCode="as"
      />
    </div>
  );
}
