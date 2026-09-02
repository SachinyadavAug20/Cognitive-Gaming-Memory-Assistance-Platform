"use client";

import React, { useState, useMemo } from "react";
import { BookOpen, Sparkles } from "lucide-react";
import type { AdminCulturalAsset } from "@/types/admin";

export interface NewProverbFormState {
  languageCode: string;
  languageName: string;
  category: string;
  textPrompt: string;
  nativeScript: string;
  missingWordAnswer: string;
  culturalContext: string;
}

interface AdminCulturalTabProps {
  culturalAssets: AdminCulturalAsset[];
  newProverb: NewProverbFormState;
  addingProverb: boolean;
  onProverbChange: React.Dispatch<React.SetStateAction<NewProverbFormState>>;
  onAddProverb: (e: React.FormEvent) => void;
}

export function AdminCulturalTab({
  culturalAssets,
  newProverb,
  addingProverb,
  onProverbChange,
  onAddProverb,
}: AdminCulturalTabProps) {
  const [cultureLangFilter, setCultureLangFilter] = useState<string>("ALL");

  const filteredCulturalAssets = useMemo(() => {
    if (cultureLangFilter === "ALL") return culturalAssets;
    return culturalAssets.filter((a) => a.languageCode === cultureLangFilter);
  }, [culturalAssets, cultureLangFilter]);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border-4 border-black bg-surface p-6 shadow-[6px_6px_0px_#000] space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-black/10 pb-4">
          <div>
            <h2 className="font-serif text-xl font-black text-ink flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-amber-800" />
              Regional Cultural Proverbs & Memory Bank (11 Languages)
            </h2>
            <p className="text-xs font-semibold text-ink-secondary mt-0.5">
              Proverbs and folklore prompts feeding AI cloze games and Grandchild reminiscence
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-black text-ink-secondary uppercase mr-1">Lang:</span>
            {(["ALL", "as", "kha", "mni", "lus", "brx", "hi", "mr"] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setCultureLangFilter(lang)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-black border-2 border-black cursor-pointer transition-colors ${
                  cultureLangFilter === lang
                    ? "bg-black text-white shadow-[2px_2px_0px_#000]"
                    : "bg-[#FAF6F0] text-ink hover:bg-amber-100"
                }`}
              >
                {lang === "ALL" ? "All Languages" : lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredCulturalAssets.map((asset) => (
            <div
              key={asset.id}
              className="rounded-3xl border-3 border-black bg-[#FAF5EE] p-5 shadow-[4px_4px_0px_#000] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="rounded-full bg-amber-200 border border-amber-900/30 px-2.5 py-0.5 text-[10px] font-black text-amber-950 uppercase">
                    {asset.languageName} ({asset.languageCode})
                  </span>
                  <span className="font-mono text-[10px] font-bold text-ink-secondary">{asset.id}</span>
                </div>

                <h3 className="font-serif text-base font-black text-ink">{asset.textPrompt}</h3>
                <p className="font-serif text-xs text-amber-900 font-bold mt-1">{asset.nativeScript}</p>

                <div className="mt-3 rounded-xl border border-black/10 bg-surface p-2.5 text-xs">
                  <span className="font-black text-emerald-800 block">Answer Word: {asset.missingWordAnswer}</span>
                  <p className="text-[11px] text-ink-secondary mt-0.5 italic">{asset.culturalContext}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add New Proverb Form */}
      <form
        onSubmit={onAddProverb}
        className="rounded-3xl border-4 border-black bg-surface p-6 shadow-[6px_6px_0px_#000] space-y-4"
      >
        <h3 className="font-serif text-lg font-black text-ink flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-600" />
          Add New Cultural Proverb / Verse
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
          <div>
            <label className="block mb-1 text-ink-secondary">Language Name & Code:</label>
            <input
              type="text"
              required
              placeholder="e.g. Mizo (lus), Bodo (brx)"
              value={newProverb.languageName}
              onChange={(e) => onProverbChange((prev) => ({ ...prev, languageName: e.target.value }))}
              className="w-full rounded-xl border-2 border-black bg-[#FAF6F0] p-2.5 text-xs text-ink focus:outline-none"
            />
          </div>
          <div>
            <label className="block mb-1 text-ink-secondary">Missing Target Answer Word:</label>
            <input
              type="text"
              required
              placeholder="e.g. মাছ, তেন, বাতি"
              value={newProverb.missingWordAnswer}
              onChange={(e) => onProverbChange((prev) => ({ ...prev, missingWordAnswer: e.target.value }))}
              className="w-full rounded-xl border-2 border-black bg-[#FAF6F0] p-2.5 text-xs text-ink focus:outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block mb-1 text-ink-secondary">Proverb Prompt & Native Script:</label>
            <input
              type="text"
              required
              placeholder="e.g. ধানৰ ভঁৰাল, পুখুৰীৰ..."
              value={newProverb.textPrompt}
              onChange={(e) =>
                onProverbChange((prev) => ({
                  ...prev,
                  textPrompt: e.target.value,
                  nativeScript: e.target.value,
                }))
              }
              className="w-full rounded-xl border-2 border-black bg-[#FAF6F0] p-2.5 text-xs text-ink focus:outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block mb-1 text-ink-secondary">Cultural Heritage Context:</label>
            <textarea
              rows={2}
              placeholder="Why this memory is familiar and comforting to elders..."
              value={newProverb.culturalContext}
              onChange={(e) => onProverbChange((prev) => ({ ...prev, culturalContext: e.target.value }))}
              className="w-full rounded-xl border-2 border-black bg-[#FAF6F0] p-2.5 text-xs text-ink focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={addingProverb}
          className="btn-tactile rounded-xl border-2 border-black bg-amber-400 px-5 py-2 text-xs font-black text-black shadow-[2px_2px_0px_#000] hover:bg-amber-300 cursor-pointer disabled:opacity-50"
        >
          {addingProverb ? "Adding..." : "Add Cultural Memory Asset"}
        </button>
      </form>
    </div>
  );
}
