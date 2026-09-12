"use client";

import React, { useState } from "react";
import { BookOpen, X, ExternalLink, ShieldCheck, Sparkles } from "lucide-react";
import { getReferencesForGame, type ClinicalReference } from "@/lib/clinicalReferences";
import { ClinicalReferenceCard } from "./ClinicalReferenceCard";
import { Link } from "@/i18n/navigation";

interface GameClinicalDrawerProps {
  gameId: string;
  gameTitle?: string;
}

export function GameClinicalDrawer({ gameId, gameTitle }: GameClinicalDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const references: ClinicalReference[] = getReferencesForGame(gameId);

  return (
    <>
      {/* Discreet floating button in top-right / top-bar of game */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-xl border-2 border-black/80 bg-white/95 px-3 py-1.5 text-xs font-black text-ink shadow-[2px_2px_0px_#000] hover:bg-amber-50 hover:border-black transition-all cursor-pointer z-30"
        title="View Clinical Research, PubMed Citations & Evidence Base"
        aria-label="View Clinical Evidence"
      >
        <BookOpen className="h-3.5 w-3.5 text-tea stroke-[2.5]" />
        <span className="hidden sm:inline">Clinical Evidence</span>
        <span className="sm:hidden">R&D</span>
      </button>

      {/* Modal / Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-3xl border-3 border-black bg-[#FAF8F5] p-5 sm:p-6 shadow-[6px_6px_0px_#000]">
            {/* Header */}
            <div className="flex items-start justify-between border-b-2 border-black/10 pb-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-tea-light border border-tea/30 px-2.5 py-0.5 text-[10px] font-black uppercase text-tea">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Software as a Medical Device (SaMD) Class B</span>
                </div>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
                  Clinical Evidence &amp; Scientific Basis
                </h3>
                <p className="text-xs text-stone-600">
                  Peer-reviewed cognitive trial rationale for{" "}
                  <strong className="text-stone-900">{gameTitle || gameId}</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-xl border-2 border-black bg-white p-1.5 text-black hover:bg-stone-100 shadow-[2px_2px_0px_#000] cursor-pointer"
                aria-label="Close modal"
              >
                <X className="h-4 w-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Citations List */}
            <div className="mt-4 space-y-3">
              {references.map((ref) => (
                <ClinicalReferenceCard key={ref.id} reference={ref} compact={false} />
              ))}
            </div>

            {/* Footer with link to Full Clinical Dossier */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t-2 border-black/10 pt-4 text-xs">
              <span className="text-stone-600 text-[11px]">
                Aligned with W3C COGA, CDSCO SaMD, and ICMR AI Ethics Guidelines.
              </span>
              <Link
                href="/clinical-evidence"
                target="_blank"
                className="inline-flex items-center gap-1.5 font-bold text-emerald-800 hover:text-emerald-950 underline"
              >
                <span>Read Full SaMD R&amp;D Dossier</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
