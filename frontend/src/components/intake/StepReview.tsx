"use client";

import { useTranslations } from "next-intl";
import { StepHeader } from "./StepHeader";
import type { IntakeFormData } from "@/types/intake";
import { LANGUAGE_OPTIONS } from "@/types/intake";
import { getMediaUrl } from "@/lib/api";
import type { ReactNode } from "react";
import {
  User,
  Hospital,
  Users,
  BookOpen,
  MapPin,
  Pencil,
} from "lucide-react";

interface StepReviewProps {
  data: IntakeFormData;
  onEditStep: (step: number) => void;
}

export function StepReview({ data, onEditStep }: StepReviewProps) {
  const t = useTranslations("intake.review");
  const langLabel =
    LANGUAGE_OPTIONS.find((l) => l.code === data.lifeStory.preferredLanguage)
      ?.label || data.lifeStory.preferredLanguage;

  return (
    <div className="space-y-6">
      <StepHeader
        title={t("title")}
        subtitle={t("subtitle")}
      />

      <ReviewSection title={t("personal")} icon={User} editLabel={t("edit")} onEdit={() => onEditStep(0)}>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <ReviewField label={t("fieldName")} value={data.personal.fullName} />
          <ReviewField label={t("fieldDob")} value={data.personal.dateOfBirth} />
          <ReviewField label={t("fieldGender")} value={data.personal.gender} />
          <ReviewField label={t("fieldPhone")} value={data.personal.phone} />
          <div className="sm:col-span-2">
            <ReviewField label={t("fieldRelationship")} value={data.personal.relationship} />
          </div>
        </dl>
      </ReviewSection>

      <ReviewSection title={t("medical")} icon={Hospital} editLabel={t("edit")} onEdit={() => onEditStep(1)}>
        {data.diagnostic.extractedData ? (
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <ReviewField label={t("fieldDiagnosis")} value={data.diagnostic.extractedData.diagnosis} />
            <ReviewField label={t("fieldDate")} value={data.diagnostic.extractedData.dateOfDiagnosis} />
            <div>
              <dt className="text-xs font-black uppercase text-ink-secondary/70">{t("fieldStage")}</dt>
              <dd className="font-bold text-ink capitalize mt-0.5">
                {data.diagnostic.extractedData.stage || t("notSpecified")}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-black uppercase text-ink-secondary/70">{t("fieldSeverity")}</dt>
              <dd className="font-bold text-ink capitalize mt-0.5">
                {data.diagnostic.extractedData.severity || t("notSpecified")}
              </dd>
            </div>
            {data.diagnostic.extractedData.cognitiveScores &&
              data.diagnostic.extractedData.cognitiveScores.length > 0 && (
                <div className="sm:col-span-2">
                  <dt className="text-xs font-black uppercase text-ink-secondary/70">{t("fieldScores")}</dt>
                  <dd className="font-bold text-ink mt-0.5">
                    {data.diagnostic.extractedData.cognitiveScores
                      .map((s: { testType: string; score: number; maxScore: number }) => `${s.testType}: ${s.score}/${s.maxScore}`)
                      .join(", ")}
                  </dd>
                </div>
              )}
          </dl>
        ) : (
          <p className="text-ink-secondary italic text-sm">{t("noMedical")}</p>
        )}
      </ReviewSection>

      <ReviewSection
        title={t("family")}
        icon={Users}
        editLabel={t("edit")}
        onEdit={() => onEditStep(2)}
        count={data.relatives.length}
      >
        {data.relatives.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.relatives.map((rel, i) => {
              const photo = getMediaUrl(rel.photoUrl);
              return (
                <div key={i} className="flex items-center gap-3 bg-surface-muted/70 border border-border-soft rounded-xl p-2.5">
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photo}
                      alt={rel.name}
                      className="w-11 h-11 rounded-lg object-cover border-2 border-border shrink-0"
                    />
                  ) : (
                    <span className="w-11 h-11 rounded-lg bg-surface border border-border-soft flex items-center justify-center shrink-0">
                      <User className="h-5 w-5 text-ink-secondary" />
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="font-bold text-ink text-sm truncate">{rel.name}</p>
                    <p className="text-ink-secondary text-xs">{rel.relationship}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-ink-secondary italic text-sm">{t("noFamily")}</p>
        )}
      </ReviewSection>

      <ReviewSection title={t("life")} icon={BookOpen} editLabel={t("edit")} onEdit={() => onEditStep(3)}>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <ReviewField label={t("fieldOccupation")} value={data.lifeStory.occupation} fallback={t("notSpecified")} />
          <ReviewField label={t("fieldLanguage")} value={langLabel} />
          <div>
            <dt className="text-xs font-black uppercase text-ink-secondary/70">{t("fieldInterests")}</dt>
            <dd className="font-bold text-ink mt-0.5">
              {data.lifeStory.interests && data.lifeStory.interests.length > 0
                ? data.lifeStory.interests.join(", ")
                : t("noneSelected")}
            </dd>
          </div>
          <ReviewField label={t("fieldMusic")} value={data.lifeStory.favoriteMusic} fallback={t("notSpecified")} />
          {data.lifeStory.lifeEvents && data.lifeStory.lifeEvents.length > 0 && (
            <div className="sm:col-span-2">
              <dt className="text-xs font-black uppercase text-ink-secondary/70">{t("fieldLifeEvents")}</dt>
              <dd className="font-bold text-ink mt-0.5">
                {data.lifeStory.lifeEvents
                  .filter((e) => e.event)
                  .map((e) => `${e.event} (${e.year})`)
                  .join(", ")}
              </dd>
            </div>
          )}
          {data.lifeStory.joyNote && (
            <div className="sm:col-span-2">
              <dt className="text-xs font-black uppercase text-ink-secondary/70">{t("fieldJoy")}</dt>
              <dd className="font-bold text-ink mt-0.5 leading-relaxed">{data.lifeStory.joyNote}</dd>
            </div>
          )}
        </dl>
      </ReviewSection>

      <ReviewSection
        title={t("places")}
        icon={MapPin}
        editLabel={t("edit")}
        onEdit={() => onEditStep(4)}
        count={data.landmarks.length}
      >
        <div className="flex flex-wrap gap-2">
          {data.landmarks.map((lm, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 bg-surface-muted border border-border-soft rounded-xl px-3 py-2 font-bold text-ink text-sm"
            >
              <MapPin className="h-4 w-4 text-tea shrink-0" />
              {lm.name}
            </span>
          ))}
        </div>
      </ReviewSection>
    </div>
  );
}

function ReviewField({
  label,
  value,
  fallback = "—",
}: {
  label: string;
  value?: string | null;
  fallback?: string;
}) {
  return (
    <div>
      <dt className="text-xs font-black uppercase text-ink-secondary/70">{label}</dt>
      <dd className="font-bold text-ink capitalize mt-0.5">{value || fallback}</dd>
    </div>
  );
}

function ReviewSection({
  title,
  icon: IconComp,
  editLabel,
  onEdit,
  count,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  editLabel: string;
  onEdit: () => void;
  count?: number;
  children: ReactNode;
}) {
  return (
    <div className="border-3 border-border rounded-2xl bg-surface p-5 shadow-[4px_4px_0_var(--color-border)] space-y-4">
      <div className="flex items-center justify-between border-b-2 border-border-soft pb-3">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-marigold-light border-2 border-border flex items-center justify-center text-ink shadow-[1px_1px_0_var(--color-border)] shrink-0">
            <IconComp className="h-4 w-4 text-ink" />
          </span>
          <h4 className="font-[family-name:var(--font-serif)] font-black text-lg text-ink">
            {title}
          </h4>
          {count !== undefined && (
            <span className="bg-marigold-light text-marigold border border-marigold/30 text-xs font-black px-2 py-0.5 rounded-full">
              {count}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1 px-3 py-1 bg-surface-muted hover:bg-marigold-light text-ink hover:text-marigold border border-border-soft hover:border-marigold rounded-lg text-xs font-bold transition-all cursor-pointer"
        >
          <Pencil className="h-3 w-3" />
          <span>{editLabel}</span>
        </button>
      </div>
      <div>{children}</div>
    </div>
  );
}
