"use client";

import { useTranslations } from "next-intl";
import type { Reminder } from "@/types";
import { ScrapbookCard } from "@/components/ui/ScrapbookCard";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface ReminderRowProps {
  reminder: Reminder;
  interactive?: boolean;
  onToggle?: (reminder: Reminder) => void;
}

export function ReminderRow({
  reminder,
  interactive = false,
  onToggle,
}: ReminderRowProps) {
  const t = useTranslations("options.status");

  const statusLabel =
    reminder.status === "completed"
      ? t("done")
      : reminder.status === "due"
        ? t("now")
        : t("later");

  const content = (
    <>
      <span className="text-2xl shrink-0">{reminder.emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-sm text-ink leading-tight">
          {reminder.title}
        </div>
        <div className="text-ink-secondary text-xs">{reminder.time}</div>
      </div>
      <StatusBadge status={reminder.status}>{statusLabel}</StatusBadge>
    </>
  );

  if (interactive && onToggle) {
    return (
      <button
        type="button"
        onClick={() => onToggle(reminder)}
        className={`btn-tactile w-full text-left ${
          reminder.status === "completed" ? "opacity-80" : ""
        }`}
        aria-pressed={reminder.status === "completed"}
      >
        <ScrapbookCard className="flex items-center gap-3 !p-3">
          {content}
        </ScrapbookCard>
      </button>
    );
  }

  return (
    <ScrapbookCard className="flex items-center gap-3 !p-3">
      {content}
    </ScrapbookCard>
  );
}