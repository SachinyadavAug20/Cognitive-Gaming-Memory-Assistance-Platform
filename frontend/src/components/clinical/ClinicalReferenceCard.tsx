"use client";

import React, { useState } from "react";
import { ExternalLink, BookOpen, CheckCircle2, Shield, ChevronDown, ChevronUp } from "lucide-react";
import { useLocale } from "next-intl";
import { type ClinicalReference, getReferenceById } from "@/lib/clinicalReferences";

interface ClinicalReferenceCardProps {
  referenceId?: string;
  reference?: ClinicalReference;
  compact?: boolean;
}

const REF_CARD_I18N: Record<string, {
  officialSource: string;
  rationale: string;
  pubmed: string;
  doi: string;
}> = {
  en: { officialSource: "Official Source", rationale: "Peer-Reviewed Clinical Rationale:", pubmed: "PubMed Entry", doi: "DOI Resolution" },
  as: { officialSource: "আনুষ্ঠানিক উৎস", rationale: "সমীক্ষিত ক্লিনিকেল ভিত্তি:", pubmed: "পাবমেড ভুক্তি", doi: "DOI সমাধান" },
  hi: { officialSource: "आधिकारिक स्रोत", rationale: "समीक्षित नैदानिक आधार:", pubmed: "पबमेड प्रविष्टि", doi: "DOI समाधान" },
  bn: { officialSource: "অফিসিয়াল উৎস", rationale: "সমীক্ষিত ক্লিনিক্যাল ভিত্তি:", pubmed: "পাবমেড ভুক্তি", doi: "DOI সমাধান" },
  mr: { officialSource: "अधिकृत स्रोत", rationale: "पुनरावलोकन केलेला क्लिनिकल आधार:", pubmed: "पबमेड नोंद", doi: "DOI संदर्भ" },
  ne: { officialSource: "आधिकारिक स्रोत", rationale: "समीक्षित क्लिनिकल आधार:", pubmed: "पबमेड प्रविष्टि", doi: "DOI समाधान" },
  mni: { officialSource: "অফিসিয়েল হৌরকফম", rationale: "পিয়র-রিভিউ তৌবা ক্লিনিকেল মরম:", pubmed: "পাবমেড চংবা", doi: "DOI রিসোলুশন" },
  brx: { officialSource: "गुबै फुंखा", rationale: "बिजिरनाय क्लिनिकेल बिथा:", pubmed: "पाबमेड हाबनाय", doi: "DOI राहा" },
  grt: { officialSource: "Katchi Jakalgipa Ja·pang", rationale: "Nirikgimin Clinical Pangchakani:", pubmed: "PubMed Katta", doi: "DOI Solution" },
  kha: { officialSource: "Ka Tlong Ba Shisha", rationale: "Ka Nongrim Clinical Ba La Peit:", pubmed: "PubMed Entry", doi: "DOI Resolution" },
  lus: { officialSource: "Hmun Dik Tak", rationale: "Clinical Finfiahna Dik:", pubmed: "PubMed Thuziak", doi: "DOI Enna" },
};

export function ClinicalReferenceCard({
  referenceId,
  reference: propRef,
  compact = false,
}: ClinicalReferenceCardProps) {
  const locale = useLocale();
  const t = REF_CARD_I18N[locale] || REF_CARD_I18N.en;
  const [expanded, setExpanded] = useState(!compact);
  const ref = propRef || (referenceId ? getReferenceById(referenceId) : undefined);

  if (!ref) return null;

  return (
    <div className="rounded-xl border border-stone-200/90 bg-white p-4 text-left shadow-2xs transition-all hover:border-emerald-600/40">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-mono font-bold text-stone-700 border border-stone-200">
            <BookOpen className="h-3 w-3 text-stone-600" />
            {ref.publisher.split("/")[0].trim()}
          </span>

          <span
            className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase border ${
              ref.category === "clinical_trial"
                ? "bg-indigo-50 border-indigo-200 text-indigo-900"
                : ref.category === "neuropsych"
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : ref.category === "regulatory"
                ? "bg-rose-50 border-rose-200 text-rose-900"
                : "bg-amber-50 border-amber-200 text-amber-900"
            }`}
          >
            {ref.category.replace("_", " ")}
          </span>

          <span className="text-xs text-stone-500 font-medium">({ref.year})</span>

          {ref.pmid && (
            <span className="rounded bg-sky-50 border border-sky-200 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-sky-800">
              PMID: {ref.pmid}
            </span>
          )}

          {ref.bookshelfId && (
            <span className="rounded bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-emerald-800">
              NCBI: {ref.bookshelfId}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {compact && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="text-stone-500 hover:text-stone-800 p-1 text-xs cursor-pointer"
              aria-label={expanded ? "Collapse citation" : "Expand citation"}
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          )}

          <a
            href={ref.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg border border-emerald-700/30 bg-emerald-800 hover:bg-emerald-900 px-2.5 py-1 text-xs font-semibold text-white shadow-2xs transition-colors cursor-pointer"
          >
            <span>{t.officialSource}</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      <h4 className="mt-2.5 font-serif text-sm font-bold text-stone-900 leading-snug">
        {ref.title}
      </h4>

      <p className="mt-1 text-xs text-stone-600">
        {ref.authors} &bull; <em className="font-semibold text-stone-800">{ref.journal}</em>
      </p>

      {expanded && (
        <div className="mt-3 rounded-lg border border-emerald-900/10 bg-emerald-50/50 p-2.5 space-y-2 text-xs">
          <div className="flex items-start gap-1.5 text-emerald-950">
            <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-[11px] uppercase tracking-wide text-emerald-900">
                {t.rationale}
              </span>
              <p className="text-stone-700 text-xs leading-relaxed">{ref.clinicalTakeaway}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-emerald-900/10 text-[11px]">
            {ref.pubmedUrl && (
              <a
                href={ref.pubmedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-sky-800 hover:underline"
              >
                <span>{t.pubmed}</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            )}
            {ref.doiUrl && (
              <a
                href={ref.doiUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-indigo-800 hover:underline"
              >
                <span>{t.doi}</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
