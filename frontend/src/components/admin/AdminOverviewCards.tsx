"use client";

import React from "react";
import { Users, QrCode, Cpu, Database } from "lucide-react";
import type { AdminOverview, AdminAiDiagnostics, AdminOfflineQueue } from "@/types/admin";

interface AdminOverviewCardsProps {
  loading: boolean;
  overview: AdminOverview | null;
  aiDiag: AdminAiDiagnostics | null;
  offlineQueue: AdminOfflineQueue | null;
}

export function AdminOverviewCards({
  loading,
  overview,
  aiDiag,
  offlineQueue,
}: AdminOverviewCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Registered Patients */}
      <div className="rounded-3xl border-4 border-black bg-surface p-5 shadow-[5px_5px_0px_#000] flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase text-ink-secondary">Patients Registered</span>
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-black bg-blue-100">
            <Users className="h-5 w-5 text-blue-800" />
          </span>
        </div>
        <div className="mt-3">
          <span className="font-serif text-3xl font-black text-ink">
            {loading ? "..." : overview?.totalPatients ?? 0}
          </span>
          <p className="text-[11px] font-bold text-ink-secondary mt-0.5">
            8 NER States Enrolled
          </p>
        </div>
      </div>

      {/* Card 2: Active Passkeys */}
      <div className="rounded-3xl border-4 border-black bg-surface p-5 shadow-[5px_5px_0px_#000] flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase text-ink-secondary">Active QR Passkeys</span>
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-black bg-emerald-100">
            <QrCode className="h-5 w-5 text-emerald-800" />
          </span>
        </div>
        <div className="mt-3">
          <span className="font-serif text-3xl font-black text-emerald-700">
            {loading ? "..." : overview?.activeCards ?? 0}
          </span>
          <p className="text-[11px] font-bold text-emerald-800 mt-0.5">
            Eligible for village kiosk check-in
          </p>
        </div>
      </div>

      {/* Card 3: AI Node Status */}
      <div className="rounded-3xl border-4 border-black bg-surface p-5 shadow-[5px_5px_0px_#000] flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase text-ink-secondary">Ollama Edge AI</span>
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-black bg-purple-100">
            <Cpu className="h-5 w-5 text-purple-800" />
          </span>
        </div>
        <div className="mt-3">
          <div className="flex items-center gap-2">
            <span
              className={`inline-block h-3.5 w-3.5 rounded-full border border-black ${
                overview?.ollamaStatus === "UP"
                  ? "bg-emerald-500 animate-pulse"
                  : "bg-rose-500"
              }`}
            />
            <span className="font-serif text-2xl font-black text-ink">
              {overview?.ollamaStatus === "UP" ? "ONLINE" : "OFFLINE"}
            </span>
          </div>
          <p className="text-[11px] font-bold text-ink-secondary mt-0.5">
            {aiDiag?.defaultModel ?? "llama3.2:3b"} • {aiDiag?.latencyMs ?? 35}ms
          </p>
        </div>
      </div>

      {/* Card 4: Low-Bandwidth Sync Status */}
      <div className="rounded-3xl border-4 border-black bg-surface p-5 shadow-[5px_5px_0px_#000] flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase text-ink-secondary">2G Sync Queue</span>
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-black bg-amber-100">
            <Database className="h-5 w-5 text-amber-800" />
          </span>
        </div>
        <div className="mt-3">
          <span className="font-serif text-3xl font-black text-amber-800">
            {offlineQueue?.dataSavedPct ?? 68.4}% Saved
          </span>
          <p className="text-[11px] font-bold text-ink-secondary mt-0.5">
            {offlineQueue?.synchronizedToday ?? 48} packets synchronized
          </p>
        </div>
      </div>
    </div>
  );
}
