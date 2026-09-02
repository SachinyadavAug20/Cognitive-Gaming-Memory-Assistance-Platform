"use client";

import React from "react";
import {
  ShieldAlert,
  MapPin,
  TrendingUp,
  Video,
  Pill,
  HeartHandshake,
  HeartPulse,
  Coins,
  Megaphone,
  Users,
  Gamepad2,
  Sliders,
  Radio,
  BookOpen,
  History,
  LucideIcon,
} from "lucide-react";

export type AdminTab =
  | "surveillance"
  | "regions"
  | "predictive"
  | "telemanas"
  | "medications"
  | "burnout"
  | "alerts"
  | "incentives"
  | "broadcast"
  | "patients"
  | "sessions"
  | "ai"
  | "kiosks"
  | "cultural"
  | "audit";

interface TabItem {
  id: AdminTab;
  label: string;
  icon: LucideIcon;
  count?: number;
  alertBadge?: boolean;
}

interface AdminTabsNavProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  surveillanceCount: number;
  districtsCount: number;
  teleManasCount: number;
  medAdherenceCount: number;
  caregiverBurnoutCount: number;
  unresolvedAlertsCount: number;
  ashaIncentivesCount: number;
  broadcastsCount: number;
  patientsCount: number;
  sessionsCount: number;
  kiosksCount: number;
  culturalAssetsCount: number;
}

export function AdminTabsNav({
  activeTab,
  onTabChange,
  surveillanceCount,
  districtsCount,
  teleManasCount,
  medAdherenceCount,
  caregiverBurnoutCount,
  unresolvedAlertsCount,
  ashaIncentivesCount,
  broadcastsCount,
  patientsCount,
  sessionsCount,
  kiosksCount,
  culturalAssetsCount,
}: AdminTabsNavProps) {
  const tabs: TabItem[] = [
    { id: "surveillance", label: "NER Dementia & MCI Surveillance Matrix", icon: ShieldAlert, count: surveillanceCount || 8, alertBadge: true },
    { id: "regions", label: "NER Heatmap & GIS", icon: MapPin, count: districtsCount },
    { id: "predictive", label: "Predictive AI Trajectories", icon: TrendingUp },
    { id: "telemanas", label: "Tele-MANAS Neurology Hub", icon: Video, count: teleManasCount },
    { id: "medications", label: "Medication & Care", icon: Pill, count: medAdherenceCount },
    { id: "burnout", label: "Caregiver Burden Index", icon: HeartHandshake, count: caregiverBurnoutCount },
    { id: "alerts", label: "Clinical Escalations & ASHA", icon: HeartPulse, count: unresolvedAlertsCount, alertBadge: unresolvedAlertsCount > 0 },
    { id: "incentives", label: "ASHA DBT Ledger", icon: Coins, count: ashaIncentivesCount },
    { id: "broadcast", label: "Emergency Siren Broadcast", icon: Megaphone, count: broadcastsCount },
    { id: "patients", label: "Patients & QR Passkeys", icon: Users, count: patientsCount },
    { id: "sessions", label: "Games Audit Trail", icon: Gamepad2, count: sessionsCount },
    { id: "ai", label: "ML Engine Calibration", icon: Sliders },
    { id: "kiosks", label: "PHC Fleet & 2G Sync", icon: Radio, count: kiosksCount },
    { id: "cultural", label: "Cultural Assets Bank", icon: BookOpen, count: culturalAssetsCount },
    { id: "audit", label: "ABDM / Security Audit", icon: History },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 border-b-3 border-black pb-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`btn-tactile flex items-center gap-1.5 rounded-2xl border-2 border-black px-3 py-1.5 text-[11px] font-black cursor-pointer transition-all ${
              isActive
                ? "bg-black text-white shadow-[3px_3px_0px_#000] -translate-y-0.5"
                : "bg-surface text-ink hover:bg-amber-100/60 shadow-[2px_2px_0px_#000]"
            }`}
          >
            <Icon className={`h-3.5 w-3.5 ${isActive ? "text-amber-300" : "text-tea"}`} />
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`rounded-full px-1.5 py-0.2 text-[9px] font-black ${
                  tab.alertBadge
                    ? "bg-rose-500 text-white animate-bounce"
                    : isActive
                    ? "bg-white/20 text-white"
                    : "bg-black/10 text-ink"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
