"use client";

import React from "react";
import { Link } from "@/i18n/navigation";
import { BookOpen, ExternalLink, ShieldCheck, CheckCircle2, Award, FileText } from "lucide-react";
import { CLINICAL_REFERENCES } from "@/lib/clinicalReferences";

export function ClinicalEvidenceShowcase() {
  const highlightRefs = [
    CLINICAL_REFERENCES.find((r) => r.id === "nih-statpearls-dementia-2022")!,
    CLINICAL_REFERENCES.find((r) => r.id === "finger-lancet-2015")!,
    CLINICAL_REFERENCES.find((r) => r.id === "active-jama-2002")!,
    CLINICAL_REFERENCES.find((r) => r.id === "errorless-clare-2008")!,
    CLINICAL_REFERENCES.find((r) => r.id === "sea-hero-quest-natcomm-2019")!,
    CLINICAL_REFERENCES.find((r) => r.id === "w3c-coga-2023")!,
  ].filter(Boolean);

  return (
    <section className="w-full rounded-3xl border-3 border-black bg-surface p-6 sm:p-8 shadow-[5px_5px_0px_#000] space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-black/10 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-tea-light border border-tea/30 text-tea text-xs font-black uppercase tracking-wider mb-2">
            <Award className="h-3.5 w-3.5" />
            <span>Peer-Reviewed Clinical Foundation</span>
          </div>
          <h2 className="font-serif font-black text-2xl sm:text-3xl text-ink leading-tight">
            Backed by Clinical Research, Not Fiction
          </h2>
          <p className="text-xs sm:text-sm text-ink-secondary mt-1 max-w-2xl font-medium leading-relaxed">
            Every cognitive drill, adaptive difficulty algorithm, and accessibility accommodation in CogniCare is grounded in landmark randomized controlled trials, peer-reviewed medical journals, and official statutory guidelines.
          </p>
        </div>

        <Link
          href="/clinical-evidence"
          className="btn-tactile inline-flex items-center gap-2 rounded-2xl border-2 border-black bg-tea px-4 py-2.5 text-xs sm:text-sm font-black text-white shadow-[2px_2px_0px_#000] hover:bg-emerald-900 transition-colors"
        >
          <FileText className="h-4 w-4" />
          <span>Explore SaMD Class B Dossier</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Grid of Verified References */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {highlightRefs.map((ref) => (
          <article
            key={ref.id}
            className="flex flex-col justify-between rounded-2xl border-2 border-black bg-white p-4 shadow-[3px_3px_0px_#000] hover:translate-y-[-2px] transition-transform"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-md bg-stone-100 border border-stone-200 px-2 py-0.5 text-[10px] font-mono font-bold text-stone-700">
                  {ref.publisher.split("/")[0].trim()}
                </span>
                <span className="text-[11px] font-bold text-stone-500">
                  {ref.year}
                </span>
              </div>

              <h3 className="font-serif text-xs sm:text-sm font-bold text-stone-900 line-clamp-2">
                {ref.title}
              </h3>

              <p className="text-[11px] text-stone-600 line-clamp-1">
                {ref.authors} &bull; <em>{ref.journal.split(",")[0]}</em>
              </p>

              <p className="text-[11px] text-stone-700 font-medium leading-relaxed line-clamp-3 bg-stone-50 p-2 rounded-lg border border-stone-200/60">
                {ref.clinicalTakeaway}
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-stone-200 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1 font-mono text-stone-500 text-[10px]">
                {ref.pmid ? (
                  <span>PMID: {ref.pmid}</span>
                ) : ref.bookshelfId ? (
                  <span>NCBI: {ref.bookshelfId}</span>
                ) : (
                  <span>Official Spec</span>
                )}
              </div>

              <a
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-bold text-tea hover:text-emerald-900 underline"
              >
                <span>Read Official Paper</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>
          </article>
        ))}
      </div>

      <div className="rounded-2xl border-2 border-black/15 bg-amber-50/70 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-950 font-medium">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-800 shrink-0" />
          <span>
            Complies with CDSCO SaMD Class B Rules 2017 &bull; ICMR AI Ethics Guidelines 2023 &bull; W3C COGA AAA Standards
          </span>
        </div>
        <Link
          href="/clinical-evidence"
          className="font-bold underline hover:text-amber-900 text-xs"
        >
          View all 20+ peer-reviewed citations &rarr;
        </Link>
      </div>
    </section>
  );
}
