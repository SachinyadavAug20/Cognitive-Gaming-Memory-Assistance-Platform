"use client";

import React from "react";
import { Activity, RefreshCw, Building2, Lock, ShieldAlert, Radio, WifiOff, Cpu } from "lucide-react";
import type { AdminHeaderTexts } from "@/lib/adminI18n";
import { useSystemStatus } from "@/hooks/useSystemStatus";

interface AdminHeaderProps {
  headerTexts: AdminHeaderTexts;
  lastRefreshedAt: Date;
  autoRefresh: boolean;
  isRefreshing: boolean;
  onToggleAutoRefresh: () => void;
  onRefreshTelemetry: () => void;
}

export function AdminHeader({
  headerTexts,
  lastRefreshedAt,
  autoRefresh,
  isRefreshing,
  onToggleAutoRefresh,
  onRefreshTelemetry,
}: AdminHeaderProps) {
  const systemStatus = useSystemStatus();

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border-4 border-black bg-surface p-6 shadow-[6px_6px_0px_#000]">
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1 rounded-full border-2 border-emerald-900/40 bg-emerald-100 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-950">
            <Building2 className="h-3 w-3 text-emerald-700" />
            {headerTexts.mdonerBadge}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border-2 border-rose-900/40 bg-rose-100 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-rose-950">
            <Lock className="h-3 w-3 text-rose-700" />
            {headerTexts.confidentialBadge}
          </span>
          <span
            suppressHydrationWarning
            className={`inline-flex items-center gap-1 rounded-full border-2 border-black px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
              systemStatus.isSpringOnline
                ? "bg-emerald-100 text-emerald-950"
                : "bg-rose-100 text-rose-950"
            }`}
          >
            {systemStatus.isSpringOnline ? (
              <Radio className="h-2.5 w-2.5 text-emerald-700 animate-pulse" />
            ) : (
              <WifiOff className="h-2.5 w-2.5 text-rose-700" />
            )}
            {systemStatus.isSpringOnline ? "Spring Online" : "Spring Offline"}
          </span>
          <span
            suppressHydrationWarning
            className={`inline-flex items-center gap-1 rounded-full border-2 border-black px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
              systemStatus.isLlmOnline
                ? "bg-purple-100 text-purple-950"
                : "bg-neutral-100 text-neutral-700"
            }`}
          >
            <Cpu className={`h-2.5 w-2.5 ${systemStatus.isLlmOnline ? "text-purple-700 animate-pulse" : "text-neutral-500"}`} />
            {systemStatus.isLlmOnline ? `LLM Online (${systemStatus.llmModel || "Local"})` : "LLM Offline"}
          </span>
          <span suppressHydrationWarning className="text-[11px] font-bold text-ink-secondary">
            {headerTexts.updatedLabel} {lastRefreshedAt.toLocaleTimeString()}
          </span>
        </div>

        <h1 className="font-serif text-2xl sm:text-3xl font-black text-ink flex items-center gap-2.5">
          <ShieldAlert className="h-8 w-8 text-tea shrink-0" />
          {headerTexts.title}
        </h1>
        <p className="text-xs sm:text-sm font-semibold text-ink-secondary mt-1">
          {headerTexts.subtitle}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onToggleAutoRefresh}
          className={`btn-tactile flex items-center gap-1.5 rounded-xl border-2 border-black px-3.5 py-2 text-xs font-black shadow-[2px_2px_0px_#000] cursor-pointer transition-colors ${
            autoRefresh ? "bg-emerald-200 text-emerald-950" : "bg-surface text-ink-secondary"
          }`}
        >
          <Activity className={`h-4 w-4 ${autoRefresh ? "text-emerald-700 animate-pulse" : ""}`} />
          <span>{headerTexts.autoSyncLabel} {autoRefresh ? headerTexts.on30s : headerTexts.off}</span>
        </button>

        <button
          type="button"
          onClick={onRefreshTelemetry}
          disabled={isRefreshing}
          className="btn-tactile flex items-center gap-1.5 rounded-xl border-2 border-black bg-amber-200 px-4 py-2 text-xs font-black text-amber-950 shadow-[2px_2px_0px_#000] hover:bg-amber-300 cursor-pointer active:translate-y-0.5 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          <span>{isRefreshing ? headerTexts.syncingBtn : headerTexts.refreshBtn}</span>
        </button>
      </div>
    </div>
  );
}
