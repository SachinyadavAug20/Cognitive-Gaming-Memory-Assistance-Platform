"use client";

import { Link } from "@/i18n/navigation";
import { ExternalLink, BookOpen, ShieldCheck, FileText } from "lucide-react";

export function FooterBar() {
  return (
    <footer className="border-t-2 border-border-soft pt-6 pb-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="space-y-1">
          <p className="font-serif font-black text-sm text-ink">
            CogniCare &bull; AI Serious Gaming &amp; Memory Assistance Platform
          </p>
          <p className="text-xs text-ink-secondary">
            Ministry of Development of North Eastern Region (MDoNER) Initiative &bull; Smart India Hackathon 2026 (PS 26003)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/clinical-evidence"
            className="inline-flex items-center gap-1 font-bold text-tea hover:underline"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Clinical Evidence Dossier (SaMD Class B)</span>
          </Link>
          <span className="text-stone-300">|</span>
          <Link
            href="/command-center"
            className="inline-flex items-center gap-1 font-bold text-ink-secondary hover:text-ink"
          >
            <span>Public Health Telemetry</span>
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-black/10 text-[11px] text-stone-600">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="font-bold text-stone-800">Official Clinical References:</span>
          <a
            href="https://www.ncbi.nlm.nih.gov/books/NBK557444/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 hover:text-tea underline"
          >
            <span>NIH StatPearls (NBK557444)</span>
            <ExternalLink className="h-2.5 w-2.5" />
          </a>
          <a
            href="https://pubmed.ncbi.nlm.nih.gov/12425705/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 hover:text-tea underline"
          >
            <span>ACTIVE Study (JAMA 2002)</span>
            <ExternalLink className="h-2.5 w-2.5" />
          </a>
          <a
            href="https://pubmed.ncbi.nlm.nih.gov/25771249/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 hover:text-tea underline"
          >
            <span>FINGER Trial (Lancet 2015)</span>
            <ExternalLink className="h-2.5 w-2.5" />
          </a>
          <a
            href="https://www.w3.org/TR/coga-usable/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 hover:text-tea underline"
          >
            <span>W3C COGA Guidelines</span>
            <ExternalLink className="h-2.5 w-2.5" />
          </a>
          <a
            href="https://cdsco.gov.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 hover:text-tea underline"
          >
            <span>CDSCO SaMD Class B</span>
            <ExternalLink className="h-2.5 w-2.5" />
          </a>
        </div>

        <p className="text-[10px] text-stone-500 font-medium">
          Zero fiction &bull; Strictly peer-reviewed clinical protocols &bull; HIPAA &amp; ICMR AI Ethics aligned
        </p>
      </div>
    </footer>
  );
}
