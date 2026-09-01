"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  Droplets,
  Pill,
  Image as ImageIcon,
  Volume2,
  CalendarCheck,
  PhoneCall,
  Plus,
  Minus,
  AlertCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { playTapFeedback, playCorrect, playPineBreeze } from "@/lib/sound";
import { speak } from "@/lib/speech";

interface RoutineTask {
  id: string;
  titleKey: string;
  defaultTitle: string;
  timeKey: string;
  defaultTime: string;
  icon: "pill" | "water" | "photo" | "appointment";
  defaultDone: boolean;
}

const INITIAL_ROUTINE: RoutineTask[] = [
  {
    id: "morning_medicine",
    titleKey: "morning_medicine",
    defaultTitle: "Morning Medicine (BP & Vitamin)",
    timeKey: "medicine_time",
    defaultTime: "8:00 AM • 1 Pill with Water",
    icon: "pill",
    defaultDone: true,
  },
  {
    id: "water_reminder",
    titleKey: "water_reminder",
    defaultTitle: "Hydration Check-In",
    timeKey: "water_count",
    defaultTime: "4 of 6 glasses today",
    icon: "water",
    defaultDone: false,
  },
  {
    id: "doctor_appointment",
    titleKey: "doctor_appointment",
    defaultTitle: "PHC Medical Check-Up",
    timeKey: "appointment_time",
    defaultTime: "Dr. B. K. Sarma • Dispur PHC",
    icon: "appointment",
    defaultDone: false,
  },
  {
    id: "family_photos",
    titleKey: "family_photos",
    defaultTitle: "Family Memory Recall",
    timeKey: "memories_count",
    defaultTime: "12 memories with Sunita",
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
  const [glasses, setGlasses] = useState(4);
  const [sosActive, setSosActive] = useState(false);

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

  const addWater = (e: React.MouseEvent) => {
    e.stopPropagation();
    playPineBreeze();
    setGlasses((g) => {
      const next = Math.min(8, g + 1);
      if (next >= 6) {
        setTasks((prev) =>
          prev.map((tItem) => (tItem.id === "water_reminder" ? { ...tItem, defaultDone: true } : tItem))
        );
      }
      return next;
    });
  };

  const removeWater = (e: React.MouseEvent) => {
    e.stopPropagation();
    playTapFeedback();
    setGlasses((g) => Math.max(0, g - 1));
  };

  const handleSos = () => {
    playCorrect();
    setSosActive(true);
    speak(
      "Connecting you with your primary caregiver Sunita and your local ASHA health worker. Please rest comfortably.",
      langCode,
      rate
    );
  };

  const speakRoutine = () => {
    playTapFeedback();
    const text = tasks
      .map((tItem) => `${tItem.defaultTitle}, scheduled for ${tItem.defaultTime}`)
      .join(". ");
    speak(`Today's daily routine: ${text}. Hydration level is ${glasses} glasses.`, langCode, rate);
  };

  return (
    <section aria-labelledby="routine-title" className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-black/15 pb-2">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-tea" />
          <h2 id="routine-title" className="font-serif text-xl font-black text-ink">
            {t.has("title") ? t("title") : t.has("label") ? t("label") : "Today's Daily Routine & Care Reminders"}
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

      {/* Routine Cards Grid (4 Essential Reminders) */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tasks.map((task) => {
          const title = task.titleKey && t.has(task.titleKey) ? t(task.titleKey) : task.defaultTitle;
          const time =
            task.id === "water_reminder"
              ? `${glasses} of 6 glasses today`
              : task.timeKey && t.has(task.timeKey)
              ? t(task.timeKey)
              : task.defaultTime;

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
                  {task.icon === "appointment" && <CalendarCheck className="h-5 w-5 text-purple-700" />}
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

              {/* Special Interactive Water Counter */}
              {task.id === "water_reminder" && (
                <div className="mt-2.5 flex items-center justify-between bg-white/70 rounded-xl p-1 border border-black/20">
                  <button
                    type="button"
                    onClick={removeWater}
                    className="h-6 w-6 rounded-lg bg-surface border border-black flex items-center justify-center text-xs font-black hover:bg-surface-muted cursor-pointer"
                    aria-label="Decrease water"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="text-[11px] font-black text-teal-800">
                    💧 {glasses} Glasses
                  </span>
                  <button
                    type="button"
                    onClick={addWater}
                    className="h-6 w-6 rounded-lg bg-teal-600 text-white border border-black flex items-center justify-center text-xs font-black hover:bg-teal-700 cursor-pointer"
                    aria-label="Drink a glass of water"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              )}

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

      {/* Emergency Caregiver & ASHA Worker Quick-Connect SOS */}
      <div className="rounded-2xl border-3 border-black bg-gradient-to-r from-red-50 via-amber-50 to-orange-50 p-4 shadow-[4px_4px_0px_#000] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-black bg-brick text-white shadow-xs">
            <PhoneCall className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-brick flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" /> Caregiver Direct Connect
              </span>
            </div>
            <h3 className="font-serif text-sm sm:text-base font-black text-ink">
              Need assistance? Connect with Sunita Borah (Daughter) or Dispur PHC ASHA Worker
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSos}
          className={`btn-tactile w-full sm:w-auto px-4 py-2.5 rounded-xl border-2 border-black font-black text-xs shadow-[2px_2px_0px_#000] cursor-pointer flex items-center justify-center gap-2 ${
            sosActive ? "bg-emerald-700 text-white" : "bg-brick text-white hover:bg-red-700"
          }`}
        >
          <PhoneCall className="h-4 w-4" />
          <span>{sosActive ? "✓ Caregiver Alert Sent" : "Call Family Caregiver"}</span>
        </button>
      </div>
    </section>
  );
}
