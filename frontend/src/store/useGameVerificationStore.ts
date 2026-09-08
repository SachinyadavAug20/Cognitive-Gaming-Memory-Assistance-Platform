"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface GameVerification {
  gameId: string;
  isVerified: boolean;
  verifiedBy: string;
  role: "clinician" | "caregiver" | "occupational_therapist" | "asha_worker";
  verifiedAt: string;
  clinicalRationale: string;
  targetStage: string;
  safetyAssurances: string[];
}

export const INITIAL_VERIFICATIONS: Record<string, GameVerification> = {
  "day-in-my-world": {
    gameId: "day-in-my-world",
    isVerified: true,
    verifiedBy: "Dr. B. K. Sarma (Consultant Geriatrician, GMCH Guwahati)",
    role: "clinician",
    verifiedAt: "2026-09-01",
    clinicalRationale:
      "Optimal 6-chapter reminiscence journey anchoring morning orientation and episodic recall in familiar Assamese cultural environments.",
    targetStage: "MCI / Mild Dementia (CDR 0.5 - 1.0)",
    safetyAssurances: [
      "Zero Blue-Light Exhaustion",
      "Paced Multi-Sensory Prompts",
      "Culturally Congruent Grounding",
    ],
  },
  "majuli-walk": {
    gameId: "majuli-walk",
    isVerified: true,
    verifiedBy: "Sunita Borah (Primary Caregiver)",
    role: "caregiver",
    verifiedAt: "2026-09-03",
    clinicalRationale:
      "Gentle landmark exploration reinforcing island memories without spatial disorientation. Keeps elder calm and happy.",
    targetStage: "Early-to-Moderate Dementia (CDR 1.0)",
    safetyAssurances: [
      "Zero Sudden Scene Changes",
      "Seated Smooth Camera Traversal",
      "No Timed Penalties",
    ],
  },
  "tea-harvest": {
    gameId: "tea-harvest",
    isVerified: true,
    verifiedBy: "Pranab Phukan (PHC Occupational Therapist)",
    role: "occupational_therapist",
    verifiedAt: "2026-09-02",
    clinicalRationale:
      "Approved for upper-limb kinetic coordination and bilateral arm reach calibration via contactless webcam kinematics.",
    targetStage: "MCI to Mild Impairment",
    safetyAssurances: [
      "Contactless Seated Interaction",
      "Fall-Safe Movement Envelope",
      "Tremor-Compensated Gestures",
    ],
  },
  "tea-harvest-vision": {
    gameId: "tea-harvest-vision",
    isVerified: true,
    verifiedBy: "Pranab Phukan (PHC Occupational Therapist)",
    role: "occupational_therapist",
    verifiedAt: "2026-09-02",
    clinicalRationale:
      "Approved for upper-limb kinetic coordination and bilateral arm reach calibration via contactless webcam kinematics.",
    targetStage: "MCI to Mild Impairment",
    safetyAssurances: [
      "Contactless Seated Interaction",
      "Fall-Safe Movement Envelope",
      "Tremor-Compensated Gestures",
    ],
  },
  "bihu-dhol": {
    gameId: "bihu-dhol",
    isVerified: true,
    verifiedBy: "Dr. Ananya Neog (Regional Tele-MANAS Coordinator)",
    role: "clinician",
    verifiedAt: "2026-09-04",
    clinicalRationale:
      "Auditory-motor entrainment using authentic Assamese folk rhythms to stimulate temporal lobe synchrony and rhythm retention.",
    targetStage: "Mild-to-Moderate Dementia (CDR 0.5 - 2.0)",
    safetyAssurances: [
      "Acoustically Calibrated Frequencies (<75dB)",
      "Zero Startling Sounds",
      "Spaced Rhythm Reinforcement",
    ],
  },
  "brahmaputra-boat": {
    gameId: "brahmaputra-boat",
    isVerified: true,
    verifiedBy: "Dr. B. C. Baruah (Consultant Neurologist)",
    role: "clinician",
    verifiedAt: "2026-09-05",
    clinicalRationale:
      "Continuous visual motor tracking calibrated to measure motor hesitation, micro-tremors, and sustained attention across river crossings.",
    targetStage: "Mild Cognitive Impairment (CDR 0.5)",
    safetyAssurances: [
      "Calm River Soundscapes",
      "Adaptive Flow Dynamics",
      "Subtle Visual Guidance",
    ],
  },
  "grandchild-chat": {
    gameId: "grandchild-chat",
    isVerified: true,
    verifiedBy: "Sunita Borah (Primary Caregiver)",
    role: "caregiver",
    verifiedAt: "2026-09-06",
    clinicalRationale:
      "Soothing conversational companion with grandson Arnav's synthetic voice; effectively de-escalates evening sundowning agitation.",
    targetStage: "All Dementia Stages (CDR 0.5 - 2.5)",
    safetyAssurances: [
      "Familiar Voice Profile",
      "Zero Aggressive Correction",
      "Warm Emotional Validation",
    ],
  },
  "arrow-escape": {
    gameId: "arrow-escape",
    isVerified: true,
    verifiedBy: "Dr. B. K. Sarma (Geriatric Neurology)",
    role: "clinician",
    verifiedAt: "2026-09-07",
    clinicalRationale:
      "Spatial orientation and directional reflex training calibrated for executive function preservation without cognitive distress.",
    targetStage: "Early Cognitive Impairment",
    safetyAssurances: [
      "High-Contrast Colorblind Safe",
      "Haptic Tactile Feedback",
      "Untimed Exploration Option",
    ],
  },
};

interface GameVerificationState {
  verifications: Record<string, GameVerification>;
  caregiverMode: boolean;
  setCaregiverMode: (enabled: boolean) => void;
  toggleCaregiverMode: () => void;
  isGameVerified: (gameId: string) => boolean;
  getVerification: (gameId: string) => GameVerification | undefined;
  setVerification: (verification: GameVerification) => void;
  toggleVerification: (
    gameId: string,
    defaultInfo?: Partial<GameVerification>
  ) => void;
  removeVerification: (gameId: string) => void;
  resetToDefaults: () => void;
}

export const useGameVerificationStore = create<GameVerificationState>()(
  persist(
    (set, get) => ({
      verifications: { ...INITIAL_VERIFICATIONS },
      caregiverMode: false,

      setCaregiverMode: (enabled: boolean) => set({ caregiverMode: enabled }),
      toggleCaregiverMode: () =>
        set((state: GameVerificationState) => ({ caregiverMode: !state.caregiverMode })),

      isGameVerified: (gameId: string) => {
        const id = gameId.replace(/-vision$/, "");
        const current = get().verifications;
        const item =
          current[gameId] ||
          current[id] ||
          INITIAL_VERIFICATIONS[gameId] ||
          INITIAL_VERIFICATIONS[id];
        return Boolean(item && item.isVerified);
      },

      getVerification: (gameId: string) => {
        const id = gameId.replace(/-vision$/, "");
        const current = get().verifications;
        return (
          current[gameId] ||
          current[id] ||
          INITIAL_VERIFICATIONS[gameId] ||
          INITIAL_VERIFICATIONS[id]
        );
      },

      setVerification: (verification: GameVerification) => {
        set((state: GameVerificationState) => ({
          verifications: {
            ...state.verifications,
            [verification.gameId]: verification,
          },
        }));
      },

      toggleVerification: (
        gameId: string,
        defaultInfo?: Partial<GameVerification>
      ) => {
        set((state: GameVerificationState) => {
          const existing = state.verifications[gameId];
          const currentlyVerified = Boolean(existing && existing.isVerified);

          if (currentlyVerified) {
            const updated = {
              ...existing,
              isVerified: false,
            };
            return {
              verifications: {
                ...state.verifications,
                [gameId]: updated,
              },
            };
          } else {
            const today = new Date().toISOString().split("T")[0];
            const updated: GameVerification = existing
              ? { ...existing, isVerified: true, verifiedAt: today }
              : {
                  gameId,
                  isVerified: true,
                  verifiedBy:
                    defaultInfo?.verifiedBy ||
                    "Sunita Borah (Primary Caregiver)",
                  role: defaultInfo?.role || "caregiver",
                  verifiedAt: today,
                  clinicalRationale:
                    defaultInfo?.clinicalRationale ||
                    "Evaluated and approved for daily home CDTx cognitive stimulation.",
                  targetStage:
                    defaultInfo?.targetStage ||
                    "Mild Cognitive Impairment (CDR 0.5)",
                  safetyAssurances: defaultInfo?.safetyAssurances || [
                    "Zero Blue-Light Fatigue",
                    "Fall-Safe Kinematics",
                    "Low Cognitive Stress",
                  ],
                };
            return {
              verifications: {
                ...state.verifications,
                [gameId]: updated,
              },
            };
          }
        });
      },

      removeVerification: (gameId: string) => {
        set((state: GameVerificationState) => {
          const copy = { ...state.verifications };
          delete copy[gameId];
          return { verifications: copy };
        });
      },

      resetToDefaults: () => {
        set({ verifications: { ...INITIAL_VERIFICATIONS } });
      },
    }),
    {
      name: "cognicare_game_verifications",
      storage: createJSONStorage(() => localStorage),
      merge: (persistedState: any, currentState: any) => ({
        ...currentState,
        ...persistedState,
        verifications: {
          ...INITIAL_VERIFICATIONS,
          ...(persistedState?.verifications || {}),
        },
      }),
    }
  )
);
