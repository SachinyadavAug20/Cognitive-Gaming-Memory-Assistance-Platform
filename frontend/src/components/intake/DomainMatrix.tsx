"use client";

import { useTranslations } from "next-intl";
import { Brain, Home, HeartPulse } from "lucide-react";
import type { ClinicalDomains, DomainMetric } from "@/types/intake";

interface DomainMatrixProps {
  domains: ClinicalDomains;
}

const CATEGORY_GROUPS: Record<string, string[]> = {
  categoryCognitive: [
    "memory", "attention", "executive_function", "orientation", "language", "visuospatial", "decision_making",
  ],
  categoryIadls: [
    "medication_management", "financial_management", "navigation", "meal_preparation", "driving", "household_tasks",
  ],
  categoryBehavioral: [
    "apathy", "agitation", "social_withdrawal", "sleep_disturbance",
  ],
};

function domainStyle(item: DomainMetric, tSeverity: ReturnType<typeof useTranslations>) {
  const isImpaired =
    (item as unknown as { needs_help?: boolean; needsHelp?: boolean }).needs_help ??
    (item as unknown as { needs_help?: boolean; needsHelp?: boolean }).needsHelp ??
    false;

  const rawLevel = (
    (item as unknown as { impairment_level?: string; impairmentLevel?: string }).impairment_level ??
    (item as unknown as { impairment_level?: string; impairmentLevel?: string }).impairmentLevel ??
    (isImpaired ? "Moderate" : "None")
  ).toLowerCase();

  const dataScorePct =
    (item as unknown as { score_pct?: number; scorePct?: number }).score_pct ??
    (item as unknown as { score_pct?: number; scorePct?: number }).scorePct;

  const scorePct =
    dataScorePct !== undefined && dataScorePct !== null && Number.isFinite(dataScorePct)
      ? Math.max(0, Math.min(100, dataScorePct))
      : rawLevel.includes("severe")
        ? 15
        : rawLevel.includes("mod")
          ? 40
          : rawLevel.includes("mild")
            ? 70
            : 100;

  let badgeColor: string;
  let barColor: string;
  let badgeLabel: string;

  if (rawLevel.includes("severe")) {
    badgeColor = "bg-brick text-white";
    barColor = "bg-brick";
    badgeLabel = tSeverity("domainMatrix.severity.severe");
  } else if (rawLevel.includes("mod")) {
    badgeColor = "bg-terracotta text-white";
    barColor = "bg-terracotta";
    badgeLabel = tSeverity("domainMatrix.severity.moderate");
  } else if (rawLevel.includes("mild")) {
    badgeColor = "bg-marigold text-white";
    barColor = "bg-marigold";
    badgeLabel = tSeverity("domainMatrix.severity.mild");
  } else {
    badgeColor = "bg-tea text-white";
    barColor = "bg-tea";
    badgeLabel = tSeverity("domainMatrix.severity.intact");
  }

  const evidenceText =
    item.evidence &&
    item.evidence !== "No evidence provided" &&
    item.evidence !== "null"
      ? item.evidence
      : null;

  return { badgeColor, barColor, badgeLabel, scorePct, evidenceText };
}

export function DomainMatrix({ domains }: DomainMatrixProps) {
  const t = useTranslations("intake");
  const tCategory = (key: string) =>
    t(("medical." + key) as "medical.categoryCognitive" | "medical.categoryIadls" | "medical.categoryBehavioral") || key;

  const domainLabels: Record<string, string> = {
    memory: t("domainMatrix.domains.memory"),
    attention: t("domainMatrix.domains.attention"),
    executive_function: t("domainMatrix.domains.executiveFunction"),
    orientation: t("domainMatrix.domains.orientation"),
    language: t("domainMatrix.domains.language"),
    visuospatial: t("domainMatrix.domains.visuospatial"),
    decision_making: t("domainMatrix.domains.decisionMaking"),
    medication_management: t("domainMatrix.domains.medicationManagement"),
    financial_management: t("domainMatrix.domains.financialManagement"),
    navigation: t("domainMatrix.domains.navigation"),
    meal_preparation: t("domainMatrix.domains.mealPreparation"),
    driving: t("domainMatrix.domains.driving"),
    household_tasks: t("domainMatrix.domains.householdTasks"),
    apathy: t("domainMatrix.domains.apathy"),
    agitation: t("domainMatrix.domains.agitation"),
    social_withdrawal: t("domainMatrix.domains.socialWithdrawal"),
  };

  if (!domains || Object.keys(domains).length === 0) return null;

  return (
    <div className="border-3 border-border rounded-2xl bg-surface p-5 md:p-6 shadow-[4px_4px_0_var(--color-border)] space-y-6">
      {/* Header + Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-border-soft pb-3 gap-2">
        <div>
          <h4 className="font-[family-name:var(--font-serif)] font-black text-xl text-ink">
            {t("domainMatrix.heading")}
          </h4>
          <p className="text-xs font-semibold text-ink-secondary">
            {t("domainMatrix.desc")}
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-bold">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-tea" /> {t("domainMatrix.severity.intact")}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-marigold" /> {t("domainMatrix.severity.mild")}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-terracotta" /> {t("domainMatrix.severity.moderate")}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-brick" /> {t("domainMatrix.severity.severe")}
          </span>
        </div>
      </div>

      {Object.entries(CATEGORY_GROUPS).map(([categoryKey, domainKeys]) => {
        const activeKeys = domainKeys.filter((k) => domains[k]);
        if (activeKeys.length === 0) return null;
        const CategoryIcon = categoryKey === "categoryCognitive" ? Brain : categoryKey === "categoryIadls" ? Home : HeartPulse;

        return (
          <div key={categoryKey} className="space-y-3">
            <h5 className="font-bold text-xs uppercase tracking-wider text-ink-secondary flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5">
                <CategoryIcon className="h-3.5 w-3.5 text-terracotta shrink-0" />
                <span>{tCategory(categoryKey)}</span>
              </span>
              <span className="flex-1 h-[1px] bg-border-soft" />
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeKeys.map((key) => {
                const item = domains[key];
                const style = domainStyle(item, t);

                return (
                  <div
                    key={key}
                    className="p-3.5 rounded-xl border-2 border-border bg-surface-muted/60 hover:bg-surface-muted transition-colors flex flex-col justify-between gap-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs uppercase tracking-wider text-ink">
                        {domainLabels[key] || key.replace(/_/g, " ")}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${style.badgeColor}`}
                      >
                        {style.badgeLabel}
                      </span>
                    </div>

                    {/* Visual Retention Bar */}
                    <div className="w-full bg-surface h-2 rounded-full border border-border-soft overflow-hidden">
                      <div
                        className={`h-full ${style.barColor} transition-all duration-500`}
                        style={{ width: `${style.scorePct}%` }}
                      />
                    </div>

                    {style.evidenceText ? (
                      <p className="text-[11px] text-ink-secondary italic leading-relaxed border-l-2 border-border/40 pl-2 bg-white/40 p-1 rounded-r">
                        &ldquo;{style.evidenceText}&rdquo;
                      </p>
                    ) : (
                      <span className="text-[10px] text-ink-secondary/50 italic">
                        {t("domainMatrix.empty")}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
