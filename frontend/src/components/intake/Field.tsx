import { type ReactNode } from "react";

interface FieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  htmlFor?: string;
  hint?: string;
}

export function Field({ label, error, required, children, htmlFor, hint }: FieldProps) {
  return (
    <div>
      {htmlFor ? (
        <label htmlFor={htmlFor} className="block font-bold text-ink mb-1.5">
          {label} {required && <span className="text-brick">*</span>}
        </label>
      ) : (
        <label className="block font-bold text-ink mb-1.5">
          {label} {required && <span className="text-brick">*</span>}
        </label>
      )}
      {children}
      {hint && !error && (
        <p className="mt-1 text-ink-secondary text-xs font-medium">{hint}</p>
      )}
      {error && (
        <p role="alert" className="mt-1 text-brick text-sm font-bold">
          {error}
        </p>
      )}
    </div>
  );
}

/* ── Shared input class constant ── */
export const INPUT_CLASS =
  "w-full min-h-[56px] px-4 rounded-xl border-3 bg-surface text-ink text-lg font-medium placeholder:text-ink-secondary/40 focus:outline-none focus:border-marigold transition-colors";

export const INPUT_ERROR_CLASS =
  "w-full min-h-[56px] px-4 rounded-xl border-3 border-brick bg-surface text-ink text-lg font-medium placeholder:text-ink-secondary/40 focus:outline-none focus:border-marigold transition-colors";

export const INPUT_SMALL_CLASS =
  "w-full min-h-[48px] px-3 rounded-lg border-3 border-border-soft bg-surface text-ink font-medium placeholder:text-ink-secondary/40 focus:outline-none focus:border-marigold transition-colors";

export const INPUT_SMALL_ERROR_CLASS =
  "w-full min-h-[48px] px-3 rounded-lg border-3 border-brick bg-surface text-ink font-medium placeholder:text-ink-secondary/40 focus:outline-none focus:border-marigold transition-colors";
