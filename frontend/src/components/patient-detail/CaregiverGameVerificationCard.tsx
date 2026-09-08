"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  ShieldCheck,
  CheckCircle2,
  Filter,
  Search,
  Stethoscope,
  HeartHandshake,
  Award,
  Sparkles,
  Edit3,
  Check,
  Brain,
  AlertCircle,
} from "lucide-react";
import { GAMES } from "@/games/registry";
import {
  useGameVerificationStore,
  type GameVerification,
} from "@/store/useGameVerificationStore";
import { CaregiverVerifyModal } from "@/components/games/CaregiverVerifyModal";
import { ClinicalEndorsementModal } from "@/components/games/ClinicalEndorsementModal";

interface CaregiverGameVerificationCardProps {
  patientId: number;
}

export function CaregiverGameVerificationCard({
  patientId,
}: CaregiverGameVerificationCardProps) {
  const { verifications, toggleVerification, isGameVerified, getVerification } =
    useGameVerificationStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "verified" | "unverified">(
    "all"
  );
  const [editingGameId, setEditingGameId] = useState<string | null>(null);
  const [viewingCertificateGameId, setViewingCertificateGameId] = useState<
    string | null
  >(null);

  const verifiedGamesCount = GAMES.filter((g) => isGameVerified(g.id)).length;
  const clinicianCount = Object.values(verifications).filter(
    (v) => v.isVerified && v.role === "clinician"
  ).length;
  const caregiverCount = Object.values(verifications).filter(
    (v) => v.isVerified && v.role === "caregiver"
  ).length;

  const filteredGames = GAMES.filter((game) => {
    const isVer = isGameVerified(game.id);
    if (filterMode === "verified" && !isVer) return false;
    if (filterMode === "unverified" && isVer) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = game.titleKey.toLowerCase().includes(q) || game.id.toLowerCase().includes(q);
      const matchDomain = game.domain.toLowerCase().includes(q);
      return matchTitle || matchDomain;
    }
    return true;
  });

  const selectedGameForEdit = GAMES.find((g) => g.id === editingGameId);
  const selectedGameForView = GAMES.find((g) => g.id === viewingCertificateGameId);
  const selectedVerification = viewingCertificateGameId
    ? getVerification(viewingCertificateGameId)
    : undefined;

  return (
    <div className="rounded-3xl border-3 border-black bg-surface p-5 sm:p-6 shadow-[6px_6px_0px_#000] text-ink">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black/10 pb-4">
        <div className="flex items-start gap-3">
          <div className="relative h-12 w-12 shrink-0 select-none">
            <Image
              src="/sample-images/101-removebg-preview.png"
              alt="Verification Badge Seal"
              fill
              className="object-contain drop-shadow -rotate-6"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-black text-emerald-800 uppercase tracking-wide">
              <ShieldCheck className="h-4 w-4" />
              <span>Field Expert & Caregiver Certifications</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-ink leading-tight">
              Verified CDTx Prescriptions
            </h2>
            <p className="text-xs font-medium text-ink-secondary mt-0.5">
              Caregiver & clinician endorsed serious games calibrated for Patient #{patientId}
            </p>
          </div>
        </div>

        {/* Stats Summary Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="rounded-xl border-2 border-black bg-emerald-100 px-2.5 py-1 text-xs font-black text-emerald-950 shadow-[2px_2px_0px_#000]">
            {verifiedGamesCount} Stamped
          </span>
          <span className="rounded-xl border-2 border-black bg-teal-100 px-2.5 py-1 text-xs font-black text-teal-950 shadow-[2px_2px_0px_#000]">
            {clinicianCount} Clinician
          </span>
          <span className="rounded-xl border-2 border-black bg-amber-100 px-2.5 py-1 text-xs font-black text-amber-950 shadow-[2px_2px_0px_#000]">
            {caregiverCount} Caregiver
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-4 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-secondary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search games or cognitive domains..."
            className="w-full rounded-xl border-2 border-black bg-white pl-9 pr-3 py-1.5 text-xs font-bold text-ink shadow-[2px_2px_0px_#000] focus:outline-hidden focus:ring-2 focus:ring-tea"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {(["all", "verified", "unverified"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setFilterMode(mode)}
              className={`rounded-xl border-2 border-black px-3 py-1.5 text-xs font-black capitalize transition-all cursor-pointer shadow-[2px_2px_0px_#000] ${
                filterMode === mode
                  ? "bg-tea text-white"
                  : "bg-surface-muted text-ink hover:bg-black/5"
              }`}
            >
              {mode === "all"
                ? `All (${GAMES.length})`
                : mode === "verified"
                ? `Verified (${verifiedGamesCount})`
                : `Unstamped (${GAMES.length - verifiedGamesCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* Games List Table */}
      <div className="mt-4 divide-y divide-black/10 max-h-96 overflow-y-auto rounded-2xl border-2 border-black/20 bg-surface-muted/40 pr-1">
        {filteredGames.length === 0 ? (
          <div className="p-8 text-center text-xs font-bold text-ink-secondary">
            No games found matching your filter criteria.
          </div>
        ) : (
          filteredGames.map((game) => {
            const isVer = isGameVerified(game.id);
            const verData = getVerification(game.id);

            return (
              <div
                key={game.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 hover:bg-surface transition-colors"
              >
                {/* Left: Info & Stamp Preview */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-black bg-white shadow-[2px_2px_0px_#000]">
                    {isVer ? (
                      <div className="relative h-9 w-9 -rotate-6">
                        <Image
                          src="/sample-images/101-removebg-preview.png"
                          alt="Verified Stamp"
                          fill
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <Brain className="h-5 w-5 text-ink-secondary" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs sm:text-sm font-black text-ink capitalize">
                        {game.id.replace(/-/g, " ")}
                      </span>
                      <span className="rounded bg-tea-light px-1.5 py-0.2 text-[10px] font-extrabold text-tea border border-tea/30">
                        {game.domain}
                      </span>
                      {isVer && (
                        <span className="rounded-full bg-emerald-100 border border-emerald-600 px-2 py-0.2 text-[9px] font-black text-emerald-900 flex items-center gap-1">
                          <Check className="h-2.5 w-2.5 stroke-[3]" /> Field Expert Verified
                        </span>
                      )}
                    </div>

                    {isVer && verData && (
                      <p className="mt-1 text-[11px] font-medium text-ink-secondary line-clamp-1 italic">
                        &ldquo;{verData.clinicalRationale}&rdquo; &mdash;{" "}
                        <span className="font-bold text-ink">{verData.verifiedBy}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {isVer && (
                    <button
                      type="button"
                      onClick={() => setViewingCertificateGameId(game.id)}
                      className="btn-tactile rounded-xl border-2 border-black bg-surface px-2.5 py-1 text-xs font-black text-ink hover:bg-tea-light cursor-pointer shadow-[2px_2px_0px_#000]"
                      title="View Clinical Certificate"
                    >
                      Certificate
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setEditingGameId(game.id)}
                    className="btn-tactile flex items-center gap-1 rounded-xl border-2 border-black bg-surface-muted px-2.5 py-1 text-xs font-black text-ink hover:bg-amber-100 cursor-pointer shadow-[2px_2px_0px_#000]"
                    title="Customize Verification & Clinical Notes"
                  >
                    <Edit3 className="h-3 w-3" />
                    <span>{isVer ? "Edit" : "Certify"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleVerification(game.id)}
                    className={`btn-tactile flex h-7 w-7 items-center justify-center rounded-xl border-2 border-black cursor-pointer shadow-[2px_2px_0px_#000] transition-colors ${
                      isVer
                        ? "bg-tea text-white hover:bg-emerald-800"
                        : "bg-surface-muted text-black/30 hover:text-ink hover:bg-surface"
                    }`}
                    title={isVer ? "Remove verification stamp" : "Quick-stamp as verified"}
                    aria-label={`Toggle verification for ${game.id}`}
                  >
                    <Check className={`h-4 w-4 stroke-[3] ${isVer ? "opacity-100" : "opacity-30"}`} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Modal */}
      {editingGameId && (
        <CaregiverVerifyModal
          isOpen={true}
          onClose={() => setEditingGameId(null)}
          gameId={editingGameId}
          gameTitle={selectedGameForEdit ? selectedGameForEdit.id.replace(/-/g, " ") : editingGameId}
          gameDomain={selectedGameForEdit?.domain}
        />
      )}

      {/* Certificate Viewer Modal */}
      {viewingCertificateGameId && selectedVerification && (
        <ClinicalEndorsementModal
          isOpen={true}
          onClose={() => setViewingCertificateGameId(null)}
          verification={selectedVerification}
          gameTitle={selectedGameForView ? selectedGameForView.id.replace(/-/g, " ") : viewingCertificateGameId}
          gameDomain={selectedGameForView?.domain}
          onOpenEdit={() => {
            const gid = viewingCertificateGameId;
            setViewingCertificateGameId(null);
            setEditingGameId(gid);
          }}
        />
      )}
    </div>
  );
}
