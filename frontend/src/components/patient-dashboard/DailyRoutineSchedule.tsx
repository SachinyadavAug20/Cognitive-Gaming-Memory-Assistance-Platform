"use client";

import { useState } from "react";
import { CheckCircle2, Clock, Droplets, Pill, Image as ImageIcon, Volume2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { playTapFeedback, playCorrect } from "@/lib/sound";
import { speak } from "@/lib/speech";

interface RoutineTask {
  id: string;
  titleKey: string;
  defaultTitle: string;
  timeKey: string;
  defaultTime: string;
  icon: "pill" | "water" | "photo";
  defaultDone: boolean;
}

const INITIAL_ROUTINE: RoutineTask[] = [
  {
    id: "morning_medicine",
    titleKey: "morning_medicine",
    defaultTitle: "Morning Medicine",
    timeKey: "medicine_time",
    defaultTime: "8:00 AM",
    icon: "pill",
    defaultDone: true,
  },
  {
    id: "water_reminder",
    titleKey: "water_reminder",
    defaultTitle: "Hydration Check-In",
    timeKey: "water_count",
    defaultTime: "4 glasses today",
    icon: "water",
    defaultDone: false,
  },
  {
    id: "family_photos",
    titleKey: "family_photos",
    defaultTitle: "Family Memory Recall",
    timeKey: "memories_count",
    defaultTime: "12 memories saved",
    icon: "photo",
    defaultDone: false,
  },
];

const CARD = "border-3 border-black rounded-2xl shadow-[4px_4px_0px_rgba(0,0,0,1)]";

interface DailyRoutineScheduleProps {
  langCode: string;
  rate: number;
}

export function DailyRoutineSchedule({ langCode, rate }: DailyRoutineScheduleProps) {
  const t = useTranslations("home.routine");
  const [tasks, setTasks] = useState(INITIAL_ROUTINE);

  const toggleTask = (id: string) => {
    playTapFeedback();
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === id) {
          const next = !task.defaultDone;
          if (next) playCorrect();
          return { ...task, defaultDone: next };
        }
        return task;
      })
    );
  };

  const speakRoutine = () => {
    playTapFeedback();
    const text = tasks
      .map((tItem) => `${tItem.defaultTitle}, scheduled for ${tItem.defaultTime}`)
      .join(". ");
    speak(`Today's daily routine: ${text}`, langCode, rate);
  };

  return (
    <section aria-labelledby="routine-title">
      <div className="flex items-center justify-between border-b-2 border-black/15 pb-2">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-tea" />
          <h2 id="routine-title" className="font-serif text-xl font-black text-ink">
            {t("title") || "Today's Daily Routine"}
          </h2>
        </div>
        <button
          type="button"
          onClick={speakRoutine}
          className="btn-tactile flex items-center gap-1.5 rounded-xl border-2 border-black bg-surface px-3 py-1.5 text-xs font-black text-ink shadow-[2px_2px_0px_#000] hover:bg-surface-muted cursor-pointer"
        >
          <Volume2 className="h-3.5 w-3.5 text-tea" />
          <span>Listen</span>
        </button>
      </div>

      <div className="mt-3.5 grid gap-3 sm:grid-cols-3">
        {tasks.map((task) => {
          const title = task.titleKey && t.has(task.titleKey) ? t(task.titleKey) : task.defaultTitle;
          const time = task.timeKey && t.has(task.timeKey) ? t(task.timeKey) : task.defaultTime;

          return (
            <div
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className={`${CARD} btn-tactile flex flex-col justify-between p-3.5 transition-all cursor-pointer select-none ${
                task.defaultDone
                  ? "bg-tea-light/80 border-tea text-ink"
                  : "bg-surface text-ink hover:bg-surface-muted"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-black bg-surface shadow-sm">
                  {task.icon === "pill" && <Pill className="h-5 w-5 text-terracotta" />}
                  {task.icon === "water" && <Droplets className="h-5 w-5 text-teal-600" />}
                  {task.icon === "photo" && <ImageIcon className="h-5 w-5 text-marigold" />}
                </div>

                <button
                  type="button"
                  className={`flex h-7 w-7 items-center justify-center rounded-lg border-2 border-black font-black transition-colors ${
                    task.defaultDone ? "bg-tea text-white" : "bg-white text-transparent"
                  }`}
                  aria-label={task.defaultDone ? "Completed" : "Mark as completed"}
                >
                  <CheckCircle2 className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3">
                <h3 className="font-bold text-sm text-ink leading-tight">{title}</h3>
                <p className="text-xs text-ink-secondary mt-0.5 font-semibold">{time}</p>
              </div>

              <div className="mt-2.5 pt-2 border-t border-black/10 flex items-center justify-between text-[11px] font-black">
                <span className={task.defaultDone ? "text-tea" : "text-marigold-dark"}>
                  {task.defaultDone ? "✓ Completed" : "● Scheduled"}
                </span>
                <span className="text-[10px] text-ink-secondary/70">Tap to toggle</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
