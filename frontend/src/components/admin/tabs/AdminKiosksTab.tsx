"use client";

import React from "react";
import { Database, Radio } from "lucide-react";
import type { AdminOfflineQueue, AdminKioskDevice } from "@/types/admin";

interface AdminKiosksTabProps {
  offlineQueue: AdminOfflineQueue | null;
  kioskDevices: AdminKioskDevice[];
}

export function AdminKiosksTab({
  offlineQueue,
  kioskDevices,
}: AdminKiosksTabProps) {
  return (
    <div className="space-y-6">
      {/* 2G Low Bandwidth Status */}
      <div className="rounded-3xl border-4 border-black bg-[#FAF5EE] p-6 shadow-[6px_6px_0px_#000] space-y-4">
        <div className="flex items-center justify-between border-b-2 border-black/10 pb-3">
          <div>
            <h2 className="font-serif text-xl font-black text-ink flex items-center gap-2">
              <Database className="h-5 w-5 text-amber-700" />
              2G Hill-Cellular Offline Synchronization Queue
            </h2>
            <p className="text-xs font-semibold text-ink-secondary mt-0.5">
              ABDM & ICMR compliant local packet compression for remote North Eastern villages
            </p>
          </div>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-950 border border-emerald-400">
            {offlineQueue?.syncStatus ?? "SYNCHRONIZED"}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold text-ink">
          <div className="rounded-2xl border-2 border-black bg-surface p-3 text-center">
            <span className="text-[10px] font-black uppercase text-ink-secondary block">Pending Packets</span>
            <span className="font-serif text-2xl font-black text-ink">{offlineQueue?.pendingSyncPackets ?? 2}</span>
          </div>
          <div className="rounded-2xl border-2 border-black bg-surface p-3 text-center">
            <span className="text-[10px] font-black uppercase text-ink-secondary block">Packets Today</span>
            <span className="font-serif text-2xl font-black text-emerald-700">{offlineQueue?.synchronizedToday ?? 48}</span>
          </div>
          <div className="rounded-2xl border-2 border-black bg-surface p-3 text-center">
            <span className="text-[10px] font-black uppercase text-ink-secondary block">Bandwidth Saved</span>
            <span className="font-serif text-2xl font-black text-amber-800">{offlineQueue?.dataSavedPct ?? 68.4}%</span>
          </div>
          <div className="rounded-2xl border-2 border-black bg-surface p-3 text-center">
            <span className="text-[10px] font-black uppercase text-ink-secondary block">Carrier Mode</span>
            <span className="font-serif text-base font-black text-purple-900 mt-1 block">
              {offlineQueue?.networkType ?? "2G Edge Hills"}
            </span>
          </div>
        </div>
      </div>

      {/* Hardware Fleet Deep Telemetry */}
      <div className="rounded-3xl border-4 border-black bg-surface p-6 shadow-[6px_6px_0px_#000] space-y-4">
        <div className="flex items-center justify-between border-b-2 border-black/10 pb-3">
          <h2 className="font-serif text-xl font-black text-ink flex items-center gap-2">
            <Radio className="h-5 w-5 text-emerald-600" />
            Kiosk Fleet Hardware Diagnostics (Battery, FPS & Storage)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {kioskDevices.map((dev) => (
            <div
              key={dev.deviceId}
              className="rounded-3xl border-3 border-black bg-surface p-5 shadow-[4px_4px_0px_#000] space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs font-black text-ink-secondary">{dev.deviceId}</span>
                  <h3 className="font-serif text-base font-black text-ink">{dev.villageLocation}</h3>
                </div>
                <span className="rounded-full bg-emerald-100 border border-emerald-400 px-2.5 py-0.5 text-[10px] font-black text-emerald-950">
                  {dev.deviceHealth}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold pt-2 border-t border-black/10">
                <div className="rounded-xl border border-black/20 bg-emerald-50 p-2">
                  <span className="text-[9px] uppercase text-ink-secondary block">Battery</span>
                  <span className="font-black text-emerald-900">{dev.batteryPct}%</span>
                </div>
                <div className="rounded-xl border border-black/20 bg-blue-50 p-2">
                  <span className="text-[9px] uppercase text-ink-secondary block">Camera FPS</span>
                  <span className="font-black text-blue-900">{dev.cameraFps} FPS</span>
                </div>
                <div className="rounded-xl border border-black/20 bg-purple-50 p-2">
                  <span className="text-[9px] uppercase text-ink-secondary block">Storage</span>
                  <span className="font-black text-purple-900">{Math.round(dev.storageFreeMb / 1024)} GB Free</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
