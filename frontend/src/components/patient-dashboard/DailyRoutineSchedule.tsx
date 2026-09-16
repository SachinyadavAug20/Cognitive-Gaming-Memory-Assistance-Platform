"use client";

import React, { useState } from "react";
import { Clock, Volume2 } from "lucide-react";
import { useLocale } from "next-intl";
import { playTapFeedback, playCorrect, playWaterRipple, unlockAudio } from "@/lib/sound";
import { speak } from "@/lib/speech";
import { ROUTINE_DATA } from "./routineI18n";
import { RoutineMedicineCard } from "./RoutineMedicineCard";
import { RoutineHydrationCard } from "./RoutineHydrationCard";
import { RoutineActivityCard } from "./RoutineActivityCard";
import { RoutineAppointmentCard } from "./RoutineAppointmentCard";

interface DailyRoutineScheduleProps {
  langCode: string;
  rate: number;
}

export function DailyRoutineSchedule({ langCode, rate }: DailyRoutineScheduleProps) {
  const locale = useLocale();
  const normalizedLocaleCode = locale?.split("-")[0]?.toLowerCase() || "en";
  const routineContent = ROUTINE_DATA[normalizedLocaleCode] || ROUTINE_DATA.en;

  const [medicineCompletedState, setMedicineCompletedState] = useState(true);
  const [glassesConsumedCount, setGlassesConsumedCount] = useState(4);
  const [activityCompletedState, setActivityCompletedState] = useState(false);
  const [appointmentCompletedState, setAppointmentCompletedState] = useState(false);

  const synthesizeSpokenAudioNarration = (narrationScript: string) => {
    playTapFeedback();
    unlockAudio();
    speak(narrationScript, locale || langCode, rate);
  };

  const handleSpeakFullDailySchedule = () => {
    synthesizeSpokenAudioNarration(routineContent.allSpoken);
  };

  const handleToggleMedicineAdministrationStatus = () => {
    playTapFeedback();
    const updatedStatus = !medicineCompletedState;
    if (updatedStatus) playCorrect();
    setMedicineCompletedState(updatedStatus);
  };

  const handleIncrementWaterIntakeGlass = (clickEvent: React.MouseEvent) => {
    clickEvent.stopPropagation();
    playWaterRipple();
    setGlassesConsumedCount((previousGlasses) => Math.min(8, previousGlasses + 1));
  };

  const handleDecrementWaterIntakeGlass = (clickEvent: React.MouseEvent) => {
    clickEvent.stopPropagation();
    playTapFeedback();
    setGlassesConsumedCount((previousGlasses) => Math.max(0, previousGlasses - 1));
  };

  const handleToggleDailyCognitiveActivityStatus = () => {
    playTapFeedback();
    const updatedStatus = !activityCompletedState;
    if (updatedStatus) playCorrect();
    setActivityCompletedState(updatedStatus);
  };

  const handleToggleClinicalAppointmentStatus = () => {
    playTapFeedback();
    const updatedStatus = !appointmentCompletedState;
    if (updatedStatus) playCorrect();
    setAppointmentCompletedState(updatedStatus);
  };

  const hydrationGoalPercentage = Math.min(100, Math.round((glassesConsumedCount / 6) * 100));

  return (
    <section id="routine-schedule" aria-labelledby="routine-title" className="space-y-4 text-left scroll-mt-24">
      <div className="flex items-center justify-between gap-3 border-b-2 border-black/15 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-black bg-tea/15 text-tea shadow-2xs">
            <Clock className="h-5 w-5 stroke-[2.5]" />
          </div>
          <div>
            <h2 id="routine-title" className="font-serif text-2xl sm:text-3xl font-black text-ink leading-tight">
              {routineContent.title}
            </h2>
            <p className="text-xs sm:text-sm font-bold text-ink-secondary mt-0.5">
              {routineContent.subtitle}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSpeakFullDailySchedule}
          className="btn-tactile shrink-0 flex min-h-[50px] items-center gap-2.5 rounded-2xl border-3 border-black bg-white px-5 py-3 text-sm sm:text-base font-black text-ink shadow-[3px_3px_0px_#000] hover:bg-amber-100 cursor-pointer active:scale-95 transition-all"
          title={routineContent.listenAll}
          aria-label={routineContent.listenAll}
        >
          <Volume2 className="h-6 w-6 text-tea shrink-0 stroke-[2.5]" />
          <span className="hidden sm:inline">{routineContent.listenAll}</span>
          <span className="sm:hidden">{routineContent.listen}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        <RoutineMedicineCard
          medicineDone={medicineCompletedState}
          medTag={routineContent.medTag}
          medTimeSub={routineContent.medTimeSub}
          medTitle={routineContent.medTitle}
          medDetail={routineContent.medDetail}
          medTaken={routineContent.medTaken}
          medTapTake={routineContent.medTapTake}
          listenAriaLabel={routineContent.listen}
          onToggleMedicine={handleToggleMedicineAdministrationStatus}
          onSpeakMedicine={() => synthesizeSpokenAudioNarration(routineContent.medSpoken)}
        />

        <RoutineHydrationCard
          glasses={glassesConsumedCount}
          waterPct={hydrationGoalPercentage}
          waterTag={routineContent.waterTag}
          waterTimeSub={routineContent.waterTimeSub}
          waterTitle={routineContent.waterTitle}
          waterDetail={routineContent.waterDetail}
          waterGlasses={routineContent.waterGlasses}
          waterGoalDone={routineContent.waterGoalDone}
          waterGoal={routineContent.waterGoal}
          waterDrinkBtn={routineContent.waterDrinkBtn}
          listenAriaLabel={routineContent.listen}
          onAddWater={handleIncrementWaterIntakeGlass}
          onRemoveWater={handleDecrementWaterIntakeGlass}
          onSpeakWater={() =>
            synthesizeSpokenAudioNarration(
              routineContent.waterSpoken.replace("{glasses}", String(glassesConsumedCount))
            )
          }
        />

        <RoutineActivityCard
          activityDone={activityCompletedState}
          actTag={routineContent.actTag}
          actTimeSub={routineContent.actTimeSub}
          actTitle={routineContent.actTitle}
          actDetail={routineContent.actDetail}
          actDone={routineContent.actDone}
          actTapDo={routineContent.actTapDo}
          listenAriaLabel={routineContent.listen}
          onToggleActivity={handleToggleDailyCognitiveActivityStatus}
          onSpeakActivity={() => synthesizeSpokenAudioNarration(routineContent.actSpoken)}
        />

        <RoutineAppointmentCard
          appointmentDone={appointmentCompletedState}
          aptTag={routineContent.aptTag}
          aptTimeSub={routineContent.aptTimeSub}
          aptTitle={routineContent.aptTitle}
          aptDetail={routineContent.aptDetail}
          aptVisited={routineContent.aptVisited}
          aptScheduled={routineContent.aptScheduled}
          aptMarkVisited={routineContent.aptMarkVisited}
          listenAriaLabel={routineContent.listen}
          onToggleAppointment={handleToggleClinicalAppointmentStatus}
          onSpeakAppointment={() => synthesizeSpokenAudioNarration(routineContent.aptSpoken)}
        />
      </div>
    </section>
  );
}
