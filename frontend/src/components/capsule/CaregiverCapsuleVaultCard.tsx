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
} from "lucide-react";
import type { MemoryCapsule, AmbientSoundType } from "@/types/capsule";
import { getAllCapsulesForPatient, getCapsuleSessionLogs } from "@/data/defaultCapsules";
import { CreateCapsuleModal } from "./CreateCapsuleModal";

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
  const [capsules, setCapsules] = useState<MemoryCapsule[]>(() =>
    getAllCapsulesForPatient(patientId)
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const logs = getCapsuleSessionLogs(patientId);

  const handleCreated = (newCapsule: MemoryCapsule) => {
    setCapsules((prev) => [newCapsule, ...prev]);
  };

  return (
    <div className="scrapbook-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-border-soft pb-4 mb-4">
        <div>
          <h2 className="font-[family-name:var(--font-serif)] font-bold text-xl md:text-2xl text-ink flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-amber-600" />
            <span>Echoes of Home — Multi-Sensory Memory Vault</span>
          </h2>
          <p className="text-sm text-ink-secondary mt-0.5">
            Living 3D spatial scenes, procedural regional soundscapes, webcam gaze tracking & family voices
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

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="btn-tactile inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-tea px-3.5 py-1.5 text-xs font-black text-white shadow-[2px_2px_0px_#000] hover:bg-tea-dark cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>New Capsule</span>
          </button>
        </div>
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

      {/* Grid of Capsules */}
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

      <CreateCapsuleModal
        patientId={patientId}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={handleCreated}
      />
    </div>
  );
}
