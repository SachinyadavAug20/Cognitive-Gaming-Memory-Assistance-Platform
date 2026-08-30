"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Activity,
  Paperclip,
  ShieldCheck,
  MapPin,
  Users,
  CheckCircle2,
  Brain,
  ArrowRight,
  TrendingUp,
  Clock,
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";

interface StateTelemetry {
  id: string;
  name: string;
  capital: string;
  registeredPatients: number;
  adherenceRate: number;
  stabilityIndex: number; // 0..100
  activePHCs: number;
  topModule: string;
  districts: { name: string; patients: number; adherence: number }[];
}

const NE_STATES_DATA: StateTelemetry[] = [
  {
    id: "assam",
    name: "Assam",
    capital: "Dispur / Guwahati",
    registeredPatients: 1420,
    adherenceRate: 93.2,
    stabilityIndex: 91.4,
    activePHCs: 64,
    topModule: "The 3D Heritage Loom & Brahmaputra River",
    districts: [
      { name: "Kamrup Metropolitan (Guwahati)", patients: 520, adherence: 94.5 },
      { name: "Dibrugarh", patients: 310, adherence: 92.1 },
      { name: "Sonitpur (Tezpur)", patients: 280, adherence: 93.0 },
      { name: "Cachar (Silchar)", patients: 310, adherence: 91.8 },
    ],
  },
  {
    id: "meghalaya",
    name: "Meghalaya",
    capital: "Shillong",
    registeredPatients: 640,
    adherenceRate: 91.8,
    stabilityIndex: 89.6,
    activePHCs: 32,
    topModule: "Ward's Lake Lotus Bloom & Khasi Ksing Drum",
    districts: [
      { name: "East Khasi Hills (Shillong)", patients: 380, adherence: 93.4 },
      { name: "West Garo Hills (Tura)", patients: 140, adherence: 89.2 },
      { name: "West Jaintia Hills (Jowai)", patients: 120, adherence: 90.5 },
    ],
  },
  {
    id: "manipur",
    name: "Manipur",
    capital: "Imphal",
    registeredPatients: 510,
    adherenceRate: 94.1,
    stabilityIndex: 92.0,
    activePHCs: 26,
    topModule: "Ima Keithel Bazaar Barter & Meitei Pung",
    districts: [
      { name: "Imphal West", patients: 260, adherence: 95.2 },
      { name: "Imphal East", patients: 150, adherence: 93.8 },
      { name: "Churachandpur", patients: 100, adherence: 92.1 },
    ],
  },
  {
    id: "mizoram",
    name: "Mizoram",
    capital: "Aizawl",
    registeredPatients: 420,
    adherenceRate: 95.0,
    stabilityIndex: 93.2,
    activePHCs: 22,
    topModule: "Mizo Thufing Proverb Cloze & Puanbu Weaving",
    districts: [
      { name: "Aizawl District", patients: 280, adherence: 96.1 },
      { name: "Lunglei", patients: 90, adherence: 93.4 },
      { name: "Champhai", patients: 50, adherence: 94.0 },
    ],
  },
  {
    id: "nagaland",
    name: "Nagaland",
    capital: "Kohima",
    registeredPatients: 380,
    adherenceRate: 89.5,
    stabilityIndex: 88.4,
    activePHCs: 20,
    topModule: "Rhythm of the Hills & Vintage Akashvani Radio",
    districts: [
      { name: "Kohima", patients: 190, adherence: 91.2 },
      { name: "Dimapur", patients: 130, adherence: 88.9 },
      { name: "Mokokchung", patients: 60, adherence: 87.5 },
    ],
  },
  {
    id: "tripura",
    name: "Tripura",
    capital: "Agartala",
    registeredPatients: 460,
    adherenceRate: 90.8,
    stabilityIndex: 90.1,
    activePHCs: 24,
    topModule: "Living Heritage Storybook & Memory Jigsaw",
    districts: [
      { name: "West Tripura (Agartala)", patients: 270, adherence: 92.0 },
      { name: "Gomati (Udaipur)", patients: 110, adherence: 89.4 },
      { name: "North Tripura (Dharmanagar)", patients: 80, adherence: 90.2 },
    ],
  },
  {
    id: "arunachal",
    name: "Arunachal Pradesh",
    capital: "Itanagar",
    registeredPatients: 320,
    adherenceRate: 88.6,
    stabilityIndex: 87.9,
    activePHCs: 18,
    topModule: "Village Wayfinding Walk & Living Root Bridge",
    districts: [
      { name: "Papum Pare (Itanagar)", patients: 160, adherence: 90.1 },
      { name: "Tawang", patients: 90, adherence: 87.4 },
      { name: "East Siang (Pasighat)", patients: 70, adherence: 88.0 },
    ],
  },
  {
    id: "sikkim",
    name: "Sikkim",
    capital: "Gangtok",
    registeredPatients: 290,
    adherenceRate: 93.8,
    stabilityIndex: 92.5,
    activePHCs: 16,
    topModule: "3D Living River & Voice Reminiscence Scribe",
    districts: [
      { name: "East Sikkim (Gangtok)", patients: 180, adherence: 94.6 },
      { name: "South Sikkim (Namchi)", patients: 70, adherence: 92.8 },
      { name: "West Sikkim (Geyzing)", patients: 40, adherence: 93.0 },
    ],
  },
];

const LIVE_SESSION_FEED = [
  { id: 1, text: "Patient #AS-104 (Guwahati) completed 3D Heritage Loom", metric: "100% Precision", time: "4s ago", state: "Assam" },
  { id: 2, text: "ASHA Worker (Shillong PHC) registered new Elder Profile", metric: "ABHA Linked", time: "16s ago", state: "Meghalaya" },
  { id: 3, text: "Patient #MN-209 (Imphal) completed Folk Proverb Cloze", metric: "+100 XP Gain", time: "32s ago", state: "Manipur" },
  { id: 4, text: "Patient #MZ-088 (Aizawl) engaged in 3D Living River Gestures", metric: "89.4% Path Eff.", time: "55s ago", state: "Mizoram" },
  { id: 5, text: "Doctor Review (Kohima District Hospital) validated Biomarker Radar", metric: "Status: Stable", time: "1m ago", state: "Nagaland" },
];

export default function CommandCenterPage() {
  const [selectedStateId, setSelectedStateId] = useState<string>("assam");

  const activeState = NE_STATES_DATA.find((s) => s.id === selectedStateId) || NE_STATES_DATA[0];

  const totalPatients = NE_STATES_DATA.reduce((acc, s) => acc + s.registeredPatients, 0);
  const totalPHCs = NE_STATES_DATA.reduce((acc, s) => acc + s.activePHCs, 0);
  const avgAdherence = (
    NE_STATES_DATA.reduce((acc, s) => acc + s.adherenceRate, 0) / NE_STATES_DATA.length
  ).toFixed(1);

  return (
    <div className="min-h-screen bg-[#FAF6F0] pb-16">
      <AppHeader />

      <main className="mx-auto max-w-6xl px-4 pt-6 space-y-6">
        {/* TOP COMMAND CENTER HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border-3 border-black bg-surface p-5 shadow-[4px_4px_0px_#000]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Paperclip className="h-4 w-4 text-tea" />
              <span className="text-xs font-black uppercase tracking-wider text-ink">
                MDoNER 8-State Epidemiology & Telemetry Command Center
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-black text-ink flex items-center gap-2">
              <Activity className="h-7 w-7 text-tea" /> Regional Cognitive Health Telemetry
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-ink-secondary mt-1">
              Real-time clinical monitoring, district therapy adherence, and ASHA network telemetry across North East India
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-green-100 px-3 py-1.5 text-xs font-black text-green-900 shadow-[2px_2px_0px_#000]">
              <span className="h-2.5 w-2.5 rounded-full bg-green-600 animate-pulse" />
              <span>8 States Connected</span>
            </span>
            <Link
              href="/caregiver"
              className="btn-tactile inline-flex items-center gap-1 rounded-xl border-2 border-black bg-tea px-3.5 py-1.5 text-xs font-black text-white shadow-[2px_2px_0px_#000] hover:bg-tea-dark"
            >
              <span>Caregiver Portal</span> <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* HIGH-LEVEL REGIONAL MACRO METRICS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="rounded-2xl border-3 border-black bg-surface p-4 shadow-[3px_3px_0px_#000] text-left">
            <div className="flex items-center justify-between text-ink-secondary mb-1">
              <span className="text-xs font-black uppercase tracking-wider">Total Patients</span>
              <Users className="h-4 w-4 text-tea" />
            </div>
            <div className="font-serif text-2xl font-black text-ink">{totalPatients.toLocaleString()}</div>
            <span className="text-[10px] font-bold text-green-700 mt-1 block">Active across 8 NES States</span>
          </div>

          <div className="rounded-2xl border-3 border-black bg-surface p-4 shadow-[3px_3px_0px_#000] text-left">
            <div className="flex items-center justify-between text-ink-secondary mb-1">
              <span className="text-xs font-black uppercase tracking-wider">Avg Adherence</span>
              <TrendingUp className="h-4 w-4 text-green-700" />
            </div>
            <div className="font-serif text-2xl font-black text-green-800">{avgAdherence}%</div>
            <span className="text-[10px] font-bold text-ink-secondary mt-1 block">Weekly Session Goal</span>
          </div>

          <div className="rounded-2xl border-3 border-black bg-surface p-4 shadow-[3px_3px_0px_#000] text-left">
            <div className="flex items-center justify-between text-ink-secondary mb-1">
              <span className="text-xs font-black uppercase tracking-wider">Connected PHCs</span>
              <MapPin className="h-4 w-4 text-amber-700" />
            </div>
            <div className="font-serif text-2xl font-black text-ink">{totalPHCs} Facilities</div>
            <span className="text-[10px] font-bold text-ink-secondary mt-1 block">ASHA Tablet Nodes</span>
          </div>

          <div className="rounded-2xl border-3 border-black bg-surface p-4 shadow-[3px_3px_0px_#000] text-left">
            <div className="flex items-center justify-between text-ink-secondary mb-1">
              <span className="text-xs font-black uppercase tracking-wider">Active Modules</span>
              <Brain className="h-4 w-4 text-purple-700" />
            </div>
            <div className="font-serif text-2xl font-black text-purple-900">18 CDTx Suite</div>
            <span className="text-[10px] font-bold text-tea mt-1 block">Local Ollama & 3D WebGL</span>
          </div>
        </div>

        {/* STATE SELECTOR PILLS */}
        <div className="space-y-2 text-left">
          <span className="text-xs font-black uppercase tracking-wider text-tea block">
            Select North Eastern State to Inspect:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {NE_STATES_DATA.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedStateId(s.id)}
                className={`btn-tactile rounded-xl border-2 px-3.5 py-1.5 text-xs font-black transition-all cursor-pointer ${
                  selectedStateId === s.id
                    ? "border-black bg-tea text-white shadow-[2px_2px_0px_#000]"
                    : "border-black bg-surface text-ink hover:bg-surface-muted shadow-[1px_1px_0px_#000]"
                }`}
              >
                {s.name} ({s.registeredPatients})
              </button>
            ))}
          </div>
        </div>

        {/* SELECTED STATE DEEP-DIVE & LIVE STREAM GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* STATE CLINICAL DETAILS (2 COLS) */}
          <div className="lg:col-span-2 space-y-4 text-left">
            <div className="rounded-2xl border-3 border-black bg-surface p-5 shadow-[4px_4px_0px_#000] space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-black/10 pb-3">
                <div>
                  <span className="text-[10px] font-black uppercase text-tea block">
                    State Health Network
                  </span>
                  <h2 className="font-serif text-2xl font-black text-ink">
                    {activeState.name} • {activeState.capital}
                  </h2>
                </div>
                <span className="rounded-lg border-2 border-black bg-[#FAF5EE] px-3 py-1 text-xs font-black text-ink">
                  Stability Index: {activeState.stabilityIndex}%
                </span>
              </div>

              {/* District Adherence Table */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-ink-secondary mb-2">
                  District Clinical Adherence & Patient Clusters:
                </h3>
                <div className="space-y-2">
                  {activeState.districts.map((d, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-xl border border-black/20 bg-[#FAF5EE] p-3 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-tea shrink-0" />
                        <span className="font-black text-ink">{d.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-ink-secondary">{d.patients} Patients</span>
                        <span className="rounded bg-teal-100 px-2 py-0.5 font-black text-teal-800 border border-teal-300">
                          {d.adherence}% Adherence
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* State Highlight Info Card */}
              <div className="rounded-xl border-2 border-black bg-tea-light p-3.5 text-xs text-ink space-y-1">
                <span className="font-black text-tea-dark block">
                  Top Prescribed Therapeutic Module:
                </span>
                <p className="font-bold text-tea-dark">
                  ✨ {activeState.topModule}
                </p>
              </div>
            </div>

            {/* ABDM & ABHA INTEGRATION ARCHITECTURE CARD */}
            <div className="rounded-2xl border-3 border-black bg-[#FFFBF0] p-5 shadow-[4px_4px_0px_#000] text-left space-y-2.5">
              <div className="flex items-center justify-between border-b-2 border-amber-300 pb-2">
                <span className="text-xs font-black uppercase text-amber-950 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-amber-700" /> Ayushman Bharat (ABDM / ABHA) Readiness
                </span>
                <span className="text-[10px] font-black uppercase rounded bg-amber-200 text-amber-950 px-2 py-0.5 border border-amber-400">
                  FHIR Interoperable
                </span>
              </div>
              <p className="text-xs font-medium text-ink leading-relaxed">
                CogniCare is engineered to bind continuous digital biomarkers to the patient&apos;s 14-digit <strong>Ayushman Bharat Health Account (ABHA ID)</strong>. Clinical milestones, MMSE trajectory data, and motor reaction times can be seamlessly synced with State Hospital EMRs using standardized HL7/FHIR protocols.
              </p>
            </div>
          </div>

          {/* REAL-TIME SESSION ACTIVITY FEED (1 COL) */}
          <div className="rounded-2xl border-3 border-black bg-surface p-4 shadow-[4px_4px_0px_#000] text-left space-y-3">
            <div className="flex items-center justify-between border-b-2 border-black/10 pb-2">
              <span className="text-xs font-black uppercase tracking-wider text-tea flex items-center gap-1.5">
                <Clock className="h-4 w-4" /> Live Field Stream
              </span>
              <span className="h-2 w-2 rounded-full bg-green-500 animate-ping" />
            </div>

            <div className="space-y-2.5">
              {LIVE_SESSION_FEED.map((feed) => (
                <div
                  key={feed.id}
                  className="rounded-xl border border-black/20 bg-[#FAF5EE] p-2.5 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-[10px] text-ink-secondary font-bold">
                    <span className="font-black text-tea">{feed.state}</span>
                    <span>{feed.time}</span>
                  </div>
                  <p className="font-bold text-ink leading-snug">{feed.text}</p>
                  <div className="flex items-center gap-1 text-[10px] font-black text-teal-800">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>{feed.metric}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-black/10 text-center">
              <span className="text-[10px] font-bold text-ink-secondary">
                Simulated real-time WebSocket telemetry feed
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
