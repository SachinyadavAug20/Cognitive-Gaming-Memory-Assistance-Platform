"use client";

import React from "react";
import { History, Download, FileSpreadsheet } from "lucide-react";
import type { AdminAuditLog } from "@/types/admin";

interface AdminAuditTabProps {
  auditLogs: AdminAuditLog[];
  onExportJson: () => void;
  onExportCsv: () => void;
}

export function AdminAuditTab({
  auditLogs,
  onExportJson,
  onExportCsv,
}: AdminAuditTabProps) {
  return (
    <div className="rounded-3xl border-4 border-black bg-surface p-6 shadow-[6px_6px_0px_#000] space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-black/10 pb-4">
        <div>
          <h2 className="font-serif text-xl font-black text-ink flex items-center gap-2">
            <History className="h-5 w-5 text-purple-700" />
            Ayushman Bharat Digital Mission (ABDM) Security Access Trail
          </h2>
          <p className="text-xs font-semibold text-ink-secondary mt-0.5">
            Immutable access logs for clinical data governance, ASHA worker actions, and tele-consultations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onExportJson}
            className="btn-tactile inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-amber-400 px-4 py-2 text-xs font-black text-black shadow-[2px_2px_0px_#000] hover:bg-amber-300 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export JSON</span>
          </button>
          <button
            type="button"
            onClick={onExportCsv}
            className="btn-tactile inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-surface px-4 py-2 text-xs font-black text-ink shadow-[2px_2px_0px_#000] hover:bg-surface-muted cursor-pointer"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-700" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b-2 border-black bg-[#FAF3E0] text-ink">
              <th className="py-3 px-3 font-black uppercase text-[10px] hidden sm:table-cell">Log ID</th>
              <th className="py-3 px-3 font-black uppercase text-[10px]">Actor / Role</th>
              <th className="py-3 px-3 font-black uppercase text-[10px]">Action Type</th>
              <th className="py-3 px-3 font-black uppercase text-[10px]">Audit Details</th>
              <th className="py-3 px-3 font-black uppercase text-[10px] hidden md:table-cell">IP Address</th>
              <th className="py-3 px-3 font-black uppercase text-[10px] text-right">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/10 font-bold">
            {auditLogs.map((logItem) => (
              <tr key={logItem.id} className="hover:bg-amber-50/50 transition-colors">
                <td className="py-3 px-3 font-mono font-black text-ink-secondary hidden sm:table-cell">{logItem.id}</td>
                <td className="py-3 px-3">
                  <span className="font-serif font-black text-ink">{logItem.actorName}</span>
                  <span className="text-[10px] font-normal text-purple-900 block">{logItem.actorRole}</span>
                </td>
                <td className="py-3 px-3">
                  <span className="rounded-lg border border-black/20 bg-purple-100 px-2 py-0.5 text-[10px] font-black text-purple-950">
                    {logItem.actionType}
                  </span>
                </td>
                <td className="py-3 px-3 text-ink-secondary max-w-xs break-words">{logItem.details}</td>
                <td className="py-3 px-3 font-mono text-ink-secondary hidden md:table-cell">{logItem.ipAddress}</td>
                <td className="py-3 px-3 text-right font-mono text-ink-secondary">
                  {new Date(logItem.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
