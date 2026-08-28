"use client";

import { useTranslations } from "next-intl";

const GENDER_KEYS = ["male", "female", "other"] as const;
const RELATIONSHIP_KEYS = ["spouse", "child", "sibling", "parent", "self", "other"] as const;

interface StepPersonalInfoProps {
  data: {
    fullName: string;
    dateOfBirth: string;
    gender: string;
    phone: string;
    relationship: string;
  };
  errors: Record<string, string>;
  onChange: (field: string, value: string) => void;
}

export function StepPersonalInfo({ data, errors, onChange }: StepPersonalInfoProps) {
  const t = useTranslations("intake.personal");
  const tGender = useTranslations("options.gender");
  const tRel = useTranslations("options.relationship");

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="font-[family-name:var(--font-serif)] text-2xl md:text-3xl font-bold text-ink">
          {t("title")}
        </h2>
        <p className="text-ink-secondary text-base">
          {t("subtitle")}
        </p>
      </div>

      <div className="space-y-4">
        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block font-bold text-ink mb-1.5">
            {t("name.label")} <span className="text-brick">*</span>
          </label>
          <input
            id="fullName"
            type="text"
            value={data.fullName}
            onChange={(e) => onChange("fullName", e.target.value)}
            placeholder={t("name.placeholder")}
            aria-describedby={errors.fullName ? "err-fullName" : undefined}
            className={`w-full min-h-[56px] px-4 rounded-xl border-3 bg-surface text-ink text-lg font-medium placeholder:text-ink-secondary/40 focus:outline-none focus:border-marigold transition-colors ${
              errors.fullName ? "border-brick" : "border-border-soft"
            }`}
          />
          {errors.fullName && (
            <p id="err-fullName" role="alert" className="mt-1 text-brick text-sm font-bold">
              {errors.fullName}
            </p>
          )}
        </div>

        {/* Date of Birth */}
        <div>
          <label htmlFor="dob" className="block font-bold text-ink mb-1.5">
            {t("dob")} <span className="text-brick">*</span>
          </label>
          <input
            id="dob"
            type="date"
            value={data.dateOfBirth}
            onChange={(e) => onChange("dateOfBirth", e.target.value)}
            aria-describedby={errors.dateOfBirth ? "err-dob" : undefined}
            className={`w-full min-h-[56px] px-4 rounded-xl border-3 bg-surface text-ink text-lg font-medium focus:outline-none focus:border-marigold transition-colors ${
              errors.dateOfBirth ? "border-brick" : "border-border-soft"
            }`}
          />
          {errors.dateOfBirth && (
            <p id="err-dob" role="alert" className="mt-1 text-brick text-sm font-bold">
              {errors.dateOfBirth}
            </p>
          )}
        </div>

        {/* Gender */}
        <div>
          <label className="block font-bold text-ink mb-1.5">
            {t("gender")} <span className="text-brick">*</span>
          </label>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Gender">
            {GENDER_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={data.gender === key}
                onClick={() => onChange("gender", key)}
                className={`min-h-[56px] px-6 rounded-xl border-3 font-bold text-lg transition-all ${
                  data.gender === key
                    ? "bg-marigold text-white border-border"
                    : "bg-surface text-ink border-border-soft hover:border-border hover:bg-surface-muted"
                }`}
              >
                {tGender(key)}
              </button>
            ))}
          </div>
          {errors.gender && (
            <p role="alert" className="mt-1 text-brick text-sm font-bold">
              {errors.gender}
            </p>
          )}
        </div>

        {/* Phone Number */}
        <div>
          <label htmlFor="phone" className="block font-bold text-ink mb-1.5">
            {t("phone.label")} <span className="text-brick">*</span>
          </label>
          <input
            id="phone"
            type="tel"
            value={data.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            placeholder={t("phone.placeholder")}
            aria-describedby={errors.phone ? "err-phone" : undefined}
            className={`w-full min-h-[56px] px-4 rounded-xl border-3 bg-surface text-ink text-lg font-medium placeholder:text-ink-secondary/40 focus:outline-none focus:border-marigold transition-colors ${
              errors.phone ? "border-brick" : "border-border-soft"
            }`}
          />
          {errors.phone && (
            <p id="err-phone" role="alert" className="mt-1 text-brick text-sm font-bold">
              {errors.phone}
            </p>
          )}
        </div>

        {/* Relationship */}
        <div>
          <label className="block font-bold text-ink mb-1.5">
            {t("relationship")} <span className="text-brick">*</span>
          </label>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Relationship">
            {RELATIONSHIP_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={data.relationship === key}
                onClick={() => onChange("relationship", key)}
                className={`min-h-[56px] px-5 rounded-xl border-3 font-bold transition-all ${
                  data.relationship === key
                    ? "bg-tea text-white border-border"
                    : "bg-surface text-ink border-border-soft hover:border-border hover:bg-surface-muted"
                }`}
              >
                {tRel(key)}
              </button>
            ))}
          </div>
          {errors.relationship && (
            <p role="alert" className="mt-1 text-brick text-sm font-bold">
              {errors.relationship}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
