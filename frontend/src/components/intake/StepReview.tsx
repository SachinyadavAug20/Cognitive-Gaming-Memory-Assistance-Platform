"use client";

import { useTranslations } from "next-intl";
import type { IntakeFormData } from "@/types/intake";
import { LANGUAGE_OPTIONS } from "@/types/intake";

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
      <div className="text-center space-y-1">
        <h2 className="font-[family-name:var(--font-serif)] text-2xl md:text-3xl font-bold text-ink">
          {t("title")}
        </h2>
        <p className="text-ink-secondary text-sm md:text-base">
          {t("subtitle") || "Please check that everything looks right before we create the patient's profile."}
        </p>
      </div>

      {/* Personal Info */}
      <ReviewSection title={t("personal")} icon="👤" editLabel={t("edit")} onEdit={() => onEditStep(0)}>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <div>
            <dt className="text-xs font-black uppercase text-ink-secondary/70">{t("fieldName")}</dt>
            <dd className="font-bold text-ink mt-0.5">{data.personal.fullName || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-black uppercase text-ink-secondary/70">{t("fieldDob")}</dt>
            <dd className="font-bold text-ink mt-0.5">{data.personal.dateOfBirth || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-black uppercase text-ink-secondary/70">{t("fieldGender")}</dt>
            <dd className="font-bold text-ink capitalize mt-0.5">{data.personal.gender || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-black uppercase text-ink-secondary/70">{t("fieldPhone")}</dt>
            <dd className="font-bold text-ink mt-0.5">{data.personal.phone || "—"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-black uppercase text-ink-secondary/70">{t("fieldRelationship")}</dt>
            <dd className="font-bold text-ink capitalize mt-0.5">{data.personal.relationship || "—"}</dd>
          </div>
        </dl>
      </ReviewSection>

      {/* Medical Report */}
      <ReviewSection title={t("medical")} icon="🏥" editLabel={t("edit")} onEdit={() => onEditStep(1)}>
        {data.diagnostic.extractedData ? (
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div>
              <dt className="text-xs font-black uppercase text-ink-secondary/70">{t("fieldDiagnosis")}</dt>
              <dd className="font-bold text-ink mt-0.5">{data.diagnostic.extractedData.diagnosis || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-black uppercase text-ink-secondary/70">{t("fieldDate")}</dt>
              <dd className="font-bold text-ink mt-0.5">{data.diagnostic.extractedData.dateOfDiagnosis || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-black uppercase text-ink-secondary/70">{t("fieldScore")}</dt>
              <dd className="font-bold text-ink mt-0.5">
                {data.diagnostic.extractedData.score ?? "--"}/{data.diagnostic.extractedData.maxScore ?? 30} ({data.diagnostic.extractedData.testType || "MMSE"})
              </dd>
            </div>
            <div>
              <dt className="text-xs font-black uppercase text-ink-secondary/70">{t("fieldPhysician")}</dt>
              <dd className="font-bold text-ink mt-0.5">{data.diagnostic.extractedData.examiningPhysician || "—"}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-black uppercase text-ink-secondary/70">{t("fieldMedications")}</dt>
              <dd className="font-bold text-ink mt-0.5">
                {data.diagnostic.extractedData.medications && data.diagnostic.extractedData.medications.length > 0
                  ? data.diagnostic.extractedData.medications.join(", ")
                  : "None"}
              </dd>
            </div>
          </dl>
        ) : (
          <p className="text-ink-secondary italic text-sm">{t("noReport")}</p>
        )}
      </ReviewSection>

      {/* Family Members */}
      <ReviewSection
        title={t("family")}
        icon="👨‍👩‍👧"
        editLabel={t("edit")}
        onEdit={() => onEditStep(2)}
        count={data.relatives.length}
      >
        {data.relatives.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.relatives.map((rel, i) => (
              <div key={i} className="flex items-center gap-3 bg-surface-muted/70 border border-border-soft rounded-xl p-2.5">
                {rel.photoUrl ? (
                  <img
                    src={rel.photoUrl}
                    alt={rel.name}
                    className="w-11 h-11 rounded-lg object-cover border-2 border-border shrink-0"
                  />
                ) : (
                  <span className="w-11 h-11 rounded-lg bg-surface border border-border-soft flex items-center justify-center text-xl shrink-0">
                    👤
                  </span>
                )}
                <div className="min-w-0">
                  <p className="font-bold text-ink text-sm truncate">{rel.name}</p>
                  <p className="text-ink-secondary text-xs">{rel.relationship}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-ink-secondary italic text-sm">{t("noFamily")}</p>
        )}
      </ReviewSection>

      {/* Life Story */}
      <ReviewSection title={t("life")} icon="📖" editLabel={t("edit")} onEdit={() => onEditStep(3)}>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <div>
            <dt className="text-xs font-black uppercase text-ink-secondary/70">{t("fieldOccupation")}</dt>
            <dd className="font-bold text-ink mt-0.5">{data.lifeStory.occupation || t("notSpecified")}</dd>
          </div>
          <div>
            <dt className="text-xs font-black uppercase text-ink-secondary/70">{t("fieldLanguage")}</dt>
            <dd className="font-bold text-ink mt-0.5">{langLabel}</dd>
          </div>
          <div>
            <dt className="text-xs font-black uppercase text-ink-secondary/70">{t("fieldInterests")}</dt>
            <dd className="font-bold text-ink mt-0.5">
              {data.lifeStory.interests && data.lifeStory.interests.length > 0
                ? data.lifeStory.interests.join(", ")
                : t("noneSelected")}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-black uppercase text-ink-secondary/70">{t("fieldMusic")}</dt>
            <dd className="font-bold text-ink mt-0.5">{data.lifeStory.favoriteMusic || t("notSpecified")}</dd>
          </div>
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

      {/* Familiar Places */}
      <ReviewSection
        title={t("places")}
        icon="📍"
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
              <span className="text-lg">{lm.emoji}</span>
              {lm.name}
            </span>
          ))}
        </div>
      </ReviewSection>
    </div>
  );
}

function ReviewSection({
  title,
  icon,
  editLabel,
  onEdit,
  count,
  children,
}: {
  title: string;
  icon: string;
  editLabel: string;
  onEdit: () => void;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <div className="border-3 border-border rounded-2xl bg-surface p-5 shadow-[4px_4px_0_var(--color-border)] space-y-4">
      <div className="flex items-center justify-between border-b-2 border-border-soft pb-3">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-marigold-light border-2 border-border flex items-center justify-center text-sm shadow-[1px_1px_0_var(--color-border)] shrink-0">
            {icon}
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
          ✏️ {editLabel}
        </button>
      </div>
      <div>{children}</div>
    </div>
  );
}

