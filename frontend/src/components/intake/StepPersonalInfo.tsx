"use client";

import { useTranslations } from "next-intl";
import { StepHeader } from "./StepHeader";
import { Field, INPUT_CLASS } from "./Field";
import { SelectChip } from "./SelectChip";

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
      <StepHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="space-y-4">
        <Field label={t("name.label")} error={errors.fullName} required htmlFor="fullName">
          <input
            id="fullName"
            type="text"
            value={data.fullName}
            onChange={(e) => onChange("fullName", e.target.value)}
            placeholder={t("name.placeholder")}
            aria-describedby={errors.fullName ? "err-fullName" : undefined}
            className={`${INPUT_CLASS} ${errors.fullName ? "!border-brick" : ""}`}
          />
        </Field>

        <Field label={t("dob")} error={errors.dateOfBirth} required htmlFor="dob">
          <input
            id="dob"
            type="date"
            value={data.dateOfBirth}
            onChange={(e) => onChange("dateOfBirth", e.target.value)}
            aria-describedby={errors.dateOfBirth ? "err-dob" : undefined}
            className={`${INPUT_CLASS} ${errors.dateOfBirth ? "!border-brick" : ""}`}
          />
        </Field>

        <Field label={t("gender")} error={errors.gender} required>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t("gender")}>
            {GENDER_KEYS.map((key) => (
              <SelectChip
                key={key}
                label={tGender(key)}
                selected={data.gender === key}
                tone="marigold"
                onClick={() => onChange("gender", key)}
              />
            ))}
          </div>
        </Field>

        <Field label={t("phone.label")} error={errors.phone} required htmlFor="phone">
          <input
            id="phone"
            type="tel"
            value={data.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            placeholder={t("phone.placeholder")}
            aria-describedby={errors.phone ? "err-phone" : undefined}
            className={`${INPUT_CLASS} ${errors.phone ? "!border-brick" : ""}`}
          />
        </Field>

        <Field label={t("relationship")} error={errors.relationship} required>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t("relationship")}>
            {RELATIONSHIP_KEYS.map((key) => (
              <SelectChip
                key={key}
                label={tRel(key)}
                selected={data.relationship === key}
                tone="tea"
                onClick={() => onChange("relationship", key)}
              />
            ))}
          </div>
        </Field>
      </div>
    </div>
  );
}
