"use client";

import React from "react";
import { Link } from "@/i18n/navigation";
import {
  RefreshCw,
  Paperclip,
  ShieldCheck,
  Building2,
} from "lucide-react";

interface AdminHeaderProps {
  onRefresh: () => void;
  refreshing: boolean;
}

export function AdminHeader({ onRefresh, refreshing }: AdminHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Official Government Memorandum Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-3 border-black bg-[#EFE9DF] p-4 shadow-[4px_4px_0px_#000]">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-black bg-tea text-white">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Paperclip className="h-3.5 w-3.5 text-ink" />
              <span className="text-[11px] font-black uppercase tracking-wider text-ink">
                Govt of India // MDoNER Track • ICMR Surveillance Registry
              </span>
            </div>
            <p className="text-xs font-bold text-ink-secondary">
              North Eastern Regional Cognitive Digital Therapeutics Administration & Clinical Governance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-black bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-950">
            <ShieldCheck className="h-4 w-4 text-emerald-700" />
            <span>DISHA / ABDM Level-3 Certified</span>
          </span>
          <Link
            href="/caregiver"
            className="btn-tactile rounded-xl border-2 border-black bg-surface px-3 py-1.5 text-xs font-black text-ink hover:bg-surface-muted shadow-[2px_2px_0px_#000]"
          >
            Caregiver Portal →
          </Link>
        </div>
      </div>

      {/* Main Title & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-black text-ink tracking-tight flex items-center gap-3">
            <span>CogniCare Command Matrix</span>
            <span className="rounded-xl border-2 border-black bg-tea px-2.5 py-0.5 text-xs font-black uppercase text-white shadow-[2px_2px_0px_#000]">
              ADMIN v2.6
            </span>
          </h1>
          <p className="text-sm font-semibold text-ink-secondary mt-1">
            Centralized epidemiological surveillance, AI telemetry, Tele-MANAS triage, and PHC edge fleet orchestration across 8 North Eastern States.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="btn-tactile flex items-center gap-2 rounded-2xl border-3 border-black bg-surface px-4 py-2.5 text-xs font-black text-ink shadow-[3px_3px_0px_#000] hover:bg-surface-muted cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 text-tea ${refreshing ? "animate-spin" : ""}`} />
            <span>{refreshing ? "Synchronizing Telemetry..." : "Refresh Live Feed"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
