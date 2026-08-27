"use client";

import { GENDER_OPTIONS, RELATIONSHIP_OPTIONS } from "@/types/intake";

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
  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="font-[family-name:var(--font-serif)] text-2xl md:text-3xl font-bold text-ink">
          About the Patient
        </h2>
        <p className="text-ink-secondary text-base">
          We need a few basics to set up the patient&apos;s profile and tailor games to their level.
        </p>
      </div>

      <div className="space-y-4">
        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block font-bold text-ink mb-1.5">
            Full Name <span className="text-brick">*</span>
          </label>
          <input
            id="fullName"
            type="text"
            value={data.fullName}
            onChange={(e) => onChange("fullName", e.target.value)}
            placeholder="e.g., Ramesh Dutta"
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
            Date of Birth <span className="text-brick">*</span>
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
            Gender <span className="text-brick">*</span>
          </label>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Gender">
            {GENDER_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={data.gender === option}
                onClick={() => onChange("gender", option)}
                className={`min-h-[56px] px-6 rounded-xl border-3 font-bold text-lg transition-all ${
                  data.gender === option
                    ? "bg-marigold text-white border-border"
                    : "bg-surface text-ink border-border-soft hover:border-border hover:bg-surface-muted"
                }`}
              >
                {option}
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
            Phone Number <span className="text-brick">*</span>
          </label>
          <input
            id="phone"
            type="tel"
            value={data.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            placeholder="e.g., 9876543210"
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
            Who is filling this form? <span className="text-brick">*</span>
          </label>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Relationship">
            {RELATIONSHIP_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={data.relationship === option}
                onClick={() => onChange("relationship", option)}
                className={`min-h-[56px] px-5 rounded-xl border-3 font-bold transition-all ${
                  data.relationship === option
                    ? "bg-tea text-white border-border"
                    : "bg-surface text-ink border-border-soft hover:border-border hover:bg-surface-muted"
                }`}
              >
                {option}
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
