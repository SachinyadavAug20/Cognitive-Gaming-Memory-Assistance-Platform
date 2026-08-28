"use client";

import type { IntakeFormData } from "@/types/intake";
import { LANGUAGE_OPTIONS } from "@/types/intake";

interface StepReviewProps {
  data: IntakeFormData;
  onEditStep: (step: number) => void;
}

export function StepReview({ data, onEditStep }: StepReviewProps) {
  const langLabel =
    LANGUAGE_OPTIONS.find((l) => l.code === data.lifeStory.preferredLanguage)
      ?.label || data.lifeStory.preferredLanguage;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="font-[family-name:var(--font-serif)] text-2xl md:text-3xl font-bold text-ink">
          Review & Submit
        </h2>
        <p className="text-ink-secondary text-base">
          Please check that everything looks right before we create the patient&apos;s profile.
        </p>
      </div>

      {/* Personal Info */}
      <ReviewSection title="Personal Information" icon="👤" onEdit={() => onEditStep(0)}>
        <ReviewRow label="Name" value={data.personal.fullName} />
        <ReviewRow label="Date of Birth" value={data.personal.dateOfBirth} />
        <ReviewRow label="Gender" value={data.personal.gender} />
        <ReviewRow label="Phone" value={data.personal.phone} />
        <ReviewRow label="Relationship" value={data.personal.relationship} />
      </ReviewSection>

      {/* Medical Report */}
      <ReviewSection title="Medical Report" icon="🏥" onEdit={() => onEditStep(1)}>
        {data.diagnostic.extractedData ? (
          <>
            <ReviewRow
              label="Diagnosis"
              value={data.diagnostic.extractedData.diagnosis}
            />
            <ReviewRow
              label="Date"
              value={data.diagnostic.extractedData.dateOfDiagnosis}
            />
            <ReviewRow
              label="Cognitive Score"
              value={`${data.diagnostic.extractedData.score ?? "--"}/${data.diagnostic.extractedData.maxScore ?? 30} (${data.diagnostic.extractedData.testType})`}
            />
            <ReviewRow
              label="Medications"
              value={data.diagnostic.extractedData.medications.join(", ") || "None"}
            />
            <ReviewRow
              label="Physician"
              value={data.diagnostic.extractedData.examiningPhysician || "—"}
            />
          </>
        ) : (
          <p className="text-ink-secondary italic">No report uploaded — skipped</p>
        )}
      </ReviewSection>

      {/* Family Members */}
      <ReviewSection
        title="Family & Relatives"
        icon="👨‍👩‍👧"
        onEdit={() => onEditStep(2)}
        count={data.relatives.length}
      >
        {data.relatives.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {data.relatives.map((rel, i) => (
              <div key={i} className="flex items-center gap-2 bg-surface-muted rounded-xl px-3 py-2">
                {rel.photoUrl ? (
                  <img
                    src={rel.photoUrl}
                    alt={rel.name}
                    className="w-10 h-10 rounded-lg object-cover border-2 border-border"
                  />
                ) : (
                  <span className="w-10 h-10 rounded-lg bg-border-soft flex items-center justify-center text-lg">
                    📷
                  </span>
                )}
                <div>
                  <p className="font-bold text-ink text-sm">{rel.name}</p>
                  <p className="text-ink-secondary text-xs">{rel.relationship}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-ink-secondary italic">No family members added</p>
        )}
      </ReviewSection>

      {/* Life Story */}
      <ReviewSection title="Life Story & Interests" icon="📖" onEdit={() => onEditStep(3)}>
        <ReviewRow label="Occupation" value={data.lifeStory.occupation || "Not specified"} />
        <ReviewRow label="Language" value={langLabel} />
        <ReviewRow
          label="Interests"
          value={data.lifeStory.interests.join(", ") || "None selected"}
        />
        <ReviewRow
          label="Favorite Music"
          value={data.lifeStory.favoriteMusic || "Not specified"}
        />
        {data.lifeStory.lifeEvents.length > 0 && (
          <ReviewRow
            label="Life Events"
            value={data.lifeStory.lifeEvents
              .filter((e) => e.event)
              .map((e) => `${e.event} (${e.year})`)
              .join(", ")}
          />
        )}
        {data.lifeStory.joyNote && (
          <ReviewRow label="What brings joy" value={data.lifeStory.joyNote} />
        )}
      </ReviewSection>

      {/* Familiar Places */}
      <ReviewSection
        title="Familiar Places"
        icon="📍"
        onEdit={() => onEditStep(4)}
        count={data.landmarks.length}
      >
        <div className="flex flex-wrap gap-2">
          {data.landmarks.map((lm, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 bg-surface-muted rounded-xl px-3 py-2 font-bold text-ink text-sm"
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
  onEdit,
  count,
  children,
}: {
  title: string;
  icon: string;
  onEdit: () => void;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <div className="border-3 border-border-soft rounded-2xl bg-surface overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-surface-muted border-b-3 border-border-soft">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <h3 className="font-bold text-ink">{title}</h3>
          {count !== undefined && (
            <span className="bg-marigold-light text-marigold text-xs font-bold px-2 py-0.5 rounded-full">
              {count}
            </span>
          )}
        </div>
        <button
          onClick={onEdit}
          className="text-sky font-bold text-sm hover:underline"
        >
          Edit
        </button>
      </div>
      <div className="p-4 space-y-2">{children}</div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="font-bold text-ink-secondary text-sm min-w-[120px] flex-shrink-0">
        {label}
      </span>
      <span className="text-ink text-sm">{value || "—"}</span>
    </div>
  );
}
