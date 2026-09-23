"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import {
  Stethoscope,
  Activity,
  ClipboardList,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Brain,
  Sliders,
  FileText,
  TrendingUp,
  User,
  Clock,
  Sparkles,
  HeartPulse,
} from "lucide-react";
import { BiomarkerRadarChart } from "@/components/biomarkers/BiomarkerRadarChart";
import { MetabolicCognitiveTracker } from "@/components/patient-dashboard/MetabolicCognitiveTracker";
import { playTapFeedback, playPress } from "@/lib/sound";
import { useLocale } from "next-intl";

interface PatientRosterItem {
  id: number;
  name: string;
  age: number;
  diagnosis: string;
  cdrScore: string;
  mocaScore: number;
  bloodSugarAvg: number;
  lastSession: string;
  prescribedGame: string;
  adherencePct: number;
  alert: boolean;
}

const PATIENTS: PatientRosterItem[] = [
  {
    id: 1,
    name: "Biren Borah",
    age: 74,
    diagnosis: "Early Alzheimer's / Amnestic MCI",
    cdrScore: "CDR 1.0 (Mild)",
    mocaScore: 18,
    bloodSugarAvg: 142,
    lastSession: "Today 09:30 AM (Card Mastery Level 4)",
    prescribedGame: "Card Mastery & Majuli 3D Walk",
    adherencePct: 92,
    alert: false,
  },
  {
    id: 2,
    name: "Pratima Devi",
    age: 78,
    diagnosis: "Mild Cognitive Impairment (Vascular)",
    cdrScore: "CDR 0.5 (Questionable)",
    mocaScore: 22,
    bloodSugarAvg: 178,
    lastSession: "Yesterday (Lotus Painter)",
    prescribedGame: "Tea Garden Match-3",
    adherencePct: 78,
    alert: true, // Blood sugar spike
  },
  {
    id: 3,
    name: "Hemanta Saikia",
    age: 71,
    diagnosis: "Post-Stroke Cognitive Recovery",
    cdrScore: "CDR 1.0 (Mild)",
    mocaScore: 19,
    bloodSugarAvg: 110,
    lastSession: "2 hours ago (Brahmaputra Boat)",
    prescribedGame: "Brahmaputra Boat & Loom",
    adherencePct: 88,
    alert: false,
  },
];

import { useCareSyncStore } from "@/lib/careSyncStore";

export default function DoctorDashboardPage() {
  const locale = useLocale();
  const normLoc = (locale?.split("-")[0]?.toLowerCase() || "en");

  const setPrescription = useCareSyncStore((s) => s.setPrescription);
  const currentStoreRx = useCareSyncStore((s) => s.prescription);

  const [selectedPatientId, setSelectedPatientId] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<"clinical" | "rx" | "metabolic" | "moca">("clinical");
  const [rxNotes, setRxNotes] = useState<string>(
    currentStoreRx.doctorNotes ||
    "Prescribed: Heritage Card Mastery (Taash) 10 mins daily for working memory. Keep post-prandial glucose under 160 mg/dL to avoid cognitive reaction delays."
  );
  const [rxSaved, setRxSaved] = useState<boolean>(false);

  const currentPatient = PATIENTS.find((p) => p.id === selectedPatientId) || PATIENTS[0];

  const handleSaveRx = (e: React.FormEvent) => {
    e.preventDefault();
    playPress();

    setPrescription({
      doctorNotes: rxNotes,
      prescribedGameTitle: "Heritage Playing Cards (Taash)",
      prescribedGameId: "card-mastery",
      prescribedRoute: "/patient/games/card-mastery",
      dailyTargetMinutes: 10,
      assistanceLevel: 2,
    });

    setRxSaved(true);
    setTimeout(() => setRxSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-canvas pb-24 text-ink">
      {/* Header */}
      <div className="bg-slate-900 text-white border-b-4 border-black px-4 py-6 md:px-8 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-500 border-2 border-white flex items-center justify-center text-white shadow-sm">
              <Stethoscope className="h-6 w-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider bg-teal-400 text-black px-2 py-0.5 rounded">
                  Clinical Portal
                </span>
                <span className="text-xs text-neutral-300">Dr. Arindam Sharma, MD (Neurology)</span>
              </div>
              <h1 className="font-serif font-black text-2xl sm:text-3xl mt-0.5">
                Physician & Clinician Dashboard
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/caregiver"
              className="px-3.5 py-1.5 rounded-xl border-2 border-white/40 bg-neutral-800 text-xs font-bold hover:bg-neutral-700"
            >
              Caregiver Portal →
            </Link>
            <Link
              href="/patient"
              className="px-3.5 py-1.5 rounded-xl border-2 border-teal-400 bg-teal-500 text-black text-xs font-black hover:bg-teal-400 shadow-[2px_2px_0px_#000]"
            >
              Patient View →
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Patient Selector Strip */}
        <div className="border-3 border-black bg-surface rounded-3xl p-4 shadow-[4px_4px_0px_#000]">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-ink-secondary flex items-center gap-1.5">
              <User className="h-4 w-4 text-teal-600" />
              <span>Active Clinical Roster ({PATIENTS.length} patients)</span>
            </span>
            <span className="text-xs font-bold text-teal-700">ABDM / ABHA Synced</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PATIENTS.map((p) => {
              const isSelected = p.id === selectedPatientId;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    playTapFeedback();
                    setSelectedPatientId(p.id);
                  }}
                  className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    isSelected
                      ? "border-black bg-amber-50 shadow-[3px_3px_0px_#000] ring-2 ring-teal-600"
                      : "border-black/20 bg-canvas hover:bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-serif font-black text-base text-ink">{p.name}</h3>
                      <p className="text-xs text-ink-secondary">{p.age} y/o • {p.diagnosis}</p>
                    </div>
                    {p.alert && (
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" title="Glycemic alert" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2 font-mono text-[11px]">
                    <span className="bg-neutral-200 px-1.5 py-0.5 rounded font-bold">{p.cdrScore}</span>
                    <span className="text-teal-700 font-bold">MoCA: {p.mocaScore}/30</span>
                    <span className="text-amber-800 font-bold">Avg Sugar: {p.bloodSugarAvg}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 border-b-2 border-black/20 pb-2 overflow-x-auto">
          {[
            { id: "clinical", label: "Patient Clinical Overview", icon: ClipboardList },
            { id: "rx", label: "Digital Prescription (CDTx)", icon: FileText },
            { id: "metabolic", label: "Sugar vs Cognitive Lag", icon: HeartPulse },
            { id: "moca", label: "MoCA Subtests Radar", icon: Brain },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  playTapFeedback();
                  setActiveTab(tab.id as typeof activeTab);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-slate-900 text-white shadow-[2px_2px_0px_#000]"
                    : "border-2 border-black/20 bg-surface text-ink hover:bg-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: CLINICAL OVERVIEW */}
        {activeTab === "clinical" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="border-3 border-black bg-surface rounded-2xl p-4 shadow-[3px_3px_0px_#000]">
                <span className="text-xs font-bold text-ink-secondary">Cognitive Staging</span>
                <div className="font-serif font-black text-2xl text-ink mt-1">
                  {currentPatient.cdrScore}
                </div>
                <p className="text-xs text-ink-secondary mt-1">
                  Clinical Dementia Rating • MoCA {currentPatient.mocaScore}/30
                </p>
              </div>

              <div className="border-3 border-black bg-surface rounded-2xl p-4 shadow-[3px_3px_0px_#000]">
                <span className="text-xs font-bold text-ink-secondary">Glycemic Stability</span>
                <div className="font-serif font-black text-2xl text-teal-700 mt-1">
                  {currentPatient.bloodSugarAvg} mg/dL
                </div>
                <p className="text-xs text-ink-secondary mt-1">
                  {currentPatient.bloodSugarAvg > 160
                    ? "⚠️ Post-meal spikes causing episodic fog"
                    : "✓ Euglycemic baseline maintained"}
                </p>
              </div>

              <div className="border-3 border-black bg-surface rounded-2xl p-4 shadow-[3px_3px_0px_#000]">
                <span className="text-xs font-bold text-ink-secondary">Therapy Adherence</span>
                <div className="font-serif font-black text-2xl text-emerald-700 mt-1">
                  {currentPatient.adherencePct}%
                </div>
                <p className="text-xs text-ink-secondary mt-1">
                  {currentPatient.lastSession}
                </p>
              </div>
            </div>

            <div className="border-3 border-black bg-surface rounded-3xl p-5 sm:p-6 shadow-[4px_4px_0px_#000]">
              <h3 className="font-serif font-black text-xl text-ink">Neurologist Diagnostic Note</h3>
              <p className="text-sm text-ink-secondary mt-2 leading-relaxed">
                Patient displays stable episodic recognition when engaged with culturally grounded stimulus (54-card Assamese deck and Majuli 3D walk). Tremor filter demonstrates high bilateral stability (92%). Blood glucose tracking indicates a strong correlation between post-prandial spikes (&gt;175 mg/dL) and increased reaction latency (+160ms). Continuous non-punitive cognitive stimulation prescribed.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: DIGITAL PRESCRIPTION (CDTx) */}
        {activeTab === "rx" && (
          <div className="border-3 border-black bg-surface rounded-3xl p-5 sm:p-6 shadow-[4px_4px_0px_#000] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-black text-xl text-ink">Digital CDTx Prescription</h3>
                <p className="text-xs text-ink-secondary">
                  Prescribe therapy games and metabolic guidance directly to patient dashboard
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-teal-100 text-teal-800 px-2.5 py-1 rounded border border-teal-600">
                Rx #CDTX-2026-904
              </span>
            </div>

            <form onSubmit={handleSaveRx} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-ink">Prescribed Clinical Games Suite</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
                  {[
                    "Card Mastery (Taash)",
                    "Majuli 3D Walk",
                    "Tea Garden Match-3",
                    "Dainik Newspaper Sudoku",
                  ].map((g) => (
                    <div key={g} className="p-2.5 rounded-xl border-2 border-black bg-amber-50 text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" />
                      <span>{g}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-ink">Physician Clinical Directives & Diet Notes</label>
                <textarea
                  rows={4}
                  value={rxNotes}
                  onChange={(e) => setRxNotes(e.target.value)}
                  className="mt-1 w-full p-3 rounded-xl border-2 border-black bg-canvas font-mono text-xs text-ink focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-ink-secondary">
                  {rxSaved ? "✓ Prescription updated & synced to patient portal!" : "Syncs in real-time to patient and family dashboards"}
                </span>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl border-2 border-black bg-teal-600 text-white font-bold text-xs shadow-[2px_2px_0px_#000] hover:bg-teal-700 cursor-pointer"
                >
                  Save & Dispatch Rx
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: METABOLIC COGNITIVE TRACKER */}
        {activeTab === "metabolic" && (
          <div className="space-y-4">
            <MetabolicCognitiveTracker />
          </div>
        )}

        {/* TAB 4: MOCA RADAR */}
        {activeTab === "moca" && (
          <div className="border-3 border-black bg-surface rounded-3xl p-5 sm:p-6 shadow-[4px_4px_0px_#000]">
            <BiomarkerRadarChart />
          </div>
        )}
      </div>
    </div>
  );
}
