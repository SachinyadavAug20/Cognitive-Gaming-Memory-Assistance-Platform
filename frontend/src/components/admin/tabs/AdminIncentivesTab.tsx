"use client";

import React from "react";
import { Coins, ShieldCheck } from "lucide-react";
import type { AdminAshaIncentive } from "@/types/admin";

interface AdminIncentivesTabProps {
  ashaIncentives: AdminAshaIncentive[];
  onApproveIncentive: (workerId: string, workerName: string, amount: number) => void;
}

export function AdminIncentivesTab({
  ashaIncentives,
  onApproveIncentive,
}: AdminIncentivesTabProps) {
  return (
    <div className="rounded-3xl border-4 border-black bg-surface p-6 shadow-[6px_6px_0px_#000] space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-black/10 pb-4">
        <div>
          <h2 className="font-serif text-xl font-black text-ink flex items-center gap-2">
            <Coins className="h-5 w-5 text-amber-600" />
            ASHA Direct Benefit Transfer (DBT) & Screening Honorarium
          </h2>
          <p className="text-xs font-semibold text-ink-secondary mt-0.5">
            Government incentive disbursement ledger for community cognitive screening and assisted game therapy
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b-2 border-black bg-[#FAF3E0] text-ink">
              <th className="py-3 px-3 font-black uppercase text-[10px]">Worker ID</th>
              <th className="py-3 px-3 font-black uppercase text-[10px]">ASHA Worker</th>
              <th className="py-3 px-3 font-black uppercase text-[10px]">PHC District</th>
              <th className="py-3 px-3 font-black uppercase text-[10px]">Screenings</th>
              <th className="py-3 px-3 font-black uppercase text-[10px]">Sessions Assisted</th>
              <th className="py-3 px-3 font-black uppercase text-[10px]">Earned DBT</th>
              <th className="py-3 px-3 font-black uppercase text-[10px]">Bank / ABHA</th>
              <th className="py-3 px-3 font-black uppercase text-[10px] text-right">Disbursement</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/10 font-bold">
            {ashaIncentives.map((inc) => (
              <tr key={inc.workerId} className="hover:bg-amber-50/50 transition-colors">
                <td className="py-3 px-3 font-mono font-black text-ink-secondary">{inc.workerId}</td>
                <td className="py-3 px-3">
                  <span className="font-serif text-sm font-black text-ink">{inc.workerName}</span>
                </td>
                <td className="py-3 px-3 text-ink-secondary">{inc.district}</td>
                <td className="py-3 px-3">{inc.screeningsCompleted} Screenings</td>
                <td className="py-3 px-3">{inc.assistedGameSessions} Sessions</td>
                <td className="py-3 px-3 font-serif font-black text-emerald-700 text-sm">
                  ₹{inc.totalIncentiveInr.toLocaleString()}
                </td>
                <td className="py-3 px-3 font-mono text-ink-secondary">{inc.abhaLinkedBankMasked}</td>
                <td className="py-3 px-3 text-right">
                  {inc.disbursementStatus === "APPROVED" ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-600/40 bg-emerald-100 px-3 py-0.5 text-[10px] font-black text-emerald-950">
                      <ShieldCheck className="h-3 w-3 text-emerald-600" />
                      Approved for DBT
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onApproveIncentive(inc.workerId, inc.workerName, inc.totalIncentiveInr)}
                      className="btn-tactile rounded-xl border-2 border-black bg-amber-300 px-3 py-1 text-xs font-black text-amber-950 shadow-[2px_2px_0px_#000] hover:bg-amber-400 cursor-pointer"
                    >
                      Approve DBT
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
