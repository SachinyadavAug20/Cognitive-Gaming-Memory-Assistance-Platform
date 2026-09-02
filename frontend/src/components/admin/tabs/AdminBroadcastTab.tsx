"use client";

import React from "react";
import { Megaphone } from "lucide-react";
import type { AdminEmergencyBroadcast } from "@/types/admin";

export interface EmergencyBroadcastFormState {
  targetState: string;
  targetDistrict: string;
  alertCategory: string;
  language: string;
  messageText: string;
}

interface AdminBroadcastTabProps {
  broadcasts: AdminEmergencyBroadcast[];
  newBroadcast: EmergencyBroadcastFormState;
  dispatchingBroadcast: boolean;
  onBroadcastChange: React.Dispatch<React.SetStateAction<EmergencyBroadcastFormState>>;
  onDispatchBroadcast: (e: React.FormEvent) => void;
}

export function AdminBroadcastTab({
  broadcasts,
  newBroadcast,
  dispatchingBroadcast,
  onBroadcastChange,
  onDispatchBroadcast,
}: AdminBroadcastTabProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border-4 border-black bg-surface p-6 shadow-[6px_6px_0px_#000] space-y-4">
        <div className="flex items-center justify-between border-b-2 border-black/10 pb-3">
          <div>
            <h2 className="font-serif text-xl font-black text-ink flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-rose-600" />
              Regional Disaster & Extreme Weather Wandering Broadcast Siren
            </h2>
            <p className="text-xs font-semibold text-ink-secondary mt-0.5">
              1-Click native audio IVR & SMS broadcast dispatched to all registered caregivers during floods or landslides
            </p>
          </div>
        </div>

        {/* Form to dispatch broadcast */}
        <form onSubmit={onDispatchBroadcast} className="rounded-2xl border-2 border-black bg-rose-50 p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-bold">
            <div>
              <label className="block mb-1 text-ink-secondary">Target State & District:</label>
              <input
                type="text"
                required
                value={newBroadcast.targetDistrict}
                onChange={(e) => onBroadcastChange((prev) => ({ ...prev, targetDistrict: e.target.value }))}
                className="w-full rounded-xl border-2 border-black bg-surface p-2 text-xs text-ink focus:outline-none"
              />
            </div>
            <div>
              <label className="block mb-1 text-ink-secondary">Alert Category:</label>
              <select
                value={newBroadcast.alertCategory}
                onChange={(e) => onBroadcastChange((prev) => ({ ...prev, alertCategory: e.target.value }))}
                className="w-full rounded-xl border-2 border-black bg-surface p-2 text-xs text-ink focus:outline-none font-bold"
              >
                <option value="FLOOD_MONSOON_WANDERING">Brahmaputra Flood / River Surge</option>
                <option value="LANDSLIDE_POWER_OUTAGE">Hill Landslide / Power Outage</option>
                <option value="EXTREME_COLD_WEATHER">Winter Extreme Cold Advisory</option>
              </select>
            </div>
            <div>
              <label className="block mb-1 text-ink-secondary">Regional Native Language:</label>
              <select
                value={newBroadcast.language}
                onChange={(e) => onBroadcastChange((prev) => ({ ...prev, language: e.target.value }))}
                className="w-full rounded-xl border-2 border-black bg-surface p-2 text-xs text-ink focus:outline-none font-bold"
              >
                <option value="as">Assamese (অসমীয়া)</option>
                <option value="kha">Khasi</option>
                <option value="mni">Manipuri (Meitei)</option>
                <option value="lus">Mizo</option>
                <option value="hi">Hindi</option>
                <option value="en">English</option>
              </select>
            </div>
            <div className="sm:col-span-3">
              <label className="block mb-1 text-ink-secondary">Emergency Message Text (TTS Audio + SMS):</label>
              <textarea
                rows={2}
                required
                value={newBroadcast.messageText}
                onChange={(e) => onBroadcastChange((prev) => ({ ...prev, messageText: e.target.value }))}
                className="w-full rounded-xl border-2 border-black bg-surface p-2 text-xs text-ink focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={dispatchingBroadcast}
            className="btn-tactile rounded-xl border-2 border-black bg-rose-600 px-5 py-2.5 text-xs font-black text-white shadow-[3px_3px_0px_#000] hover:bg-rose-700 cursor-pointer disabled:opacity-50"
          >
            {dispatchingBroadcast ? "Dispatched..." : "Broadcast Emergency Siren to Caregivers 🚨"}
          </button>
        </form>

        {/* Broadcasts History */}
        <div className="mt-4 space-y-2">
          <span className="text-xs font-black uppercase text-ink-secondary block">
            Broadcast Log History:
          </span>
          <div className="space-y-2">
            {broadcasts.map((bc) => (
              <div key={bc.broadcastId} className="rounded-2xl border-2 border-black bg-surface p-3 text-xs flex justify-between items-center">
                <div>
                  <span className="font-mono text-[10px] font-black text-ink-secondary">{bc.broadcastId}</span>
                  <p className="font-bold text-ink mt-0.5">{bc.messageText}</p>
                  <span className="text-[10px] text-ink-secondary">
                    📍 {bc.targetDistrict} • Delivered to {bc.recipientsDelivered} households
                  </span>
                </div>
                <span className="rounded-full bg-emerald-100 border border-emerald-400 px-2 py-0.5 text-[9px] font-black text-emerald-950">
                  {bc.dispatchStatus}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
