"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  ExternalLink,
  QrCode,
  KeyRound,
  Ban,
} from "lucide-react";
import type { AdminPatientRow } from "@/types/admin";

interface AdminPatientsTabProps {
  patients: AdminPatientRow[];
  loading: boolean;
  reissuingId: number | null;
  onReissueCard: (patientId: number, patientName: string) => void;
  onRevokeCard: (patient: AdminPatientRow) => void;
}

export function AdminPatientsTab({
  patients,
  loading,
  reissuingId,
  onReissueCard,
  onRevokeCard,
}: AdminPatientsTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [cardFilter, setCardFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.phone.includes(searchQuery) ||
        p.id.toString().includes(searchQuery);

      if (cardFilter === "ACTIVE") return matchesSearch && p.hasActiveCard;
      if (cardFilter === "INACTIVE") return matchesSearch && !p.hasActiveCard;
      return matchesSearch;
    });
  }, [patients, searchQuery, cardFilter]);

  return (
    <div className="rounded-3xl border-4 border-black bg-surface p-6 shadow-[6px_6px_0px_#000] space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-black/10 pb-4">
        <div>
          <h2 className="font-serif text-xl font-black text-ink flex items-center gap-2">
            <Users className="h-5 w-5 text-tea" />
            Patient Directory & Security Tokens
          </h2>
          <p className="text-xs font-semibold text-ink-secondary mt-0.5">
            Inspect credentials, generate instant QR health passkeys, or revoke compromised tokens
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-secondary" />
            <input
              type="text"
              placeholder="Search name, phone or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-xl border-2 border-black bg-[#FAF6F0] pl-9 pr-3 py-1.5 text-xs font-bold text-ink placeholder:text-ink-secondary/70 focus:outline-none focus:ring-2 focus:ring-tea"
            />
          </div>

          <div className="flex items-center gap-1 rounded-xl border-2 border-black bg-[#FAF6F0] p-1">
            {(["ALL", "ACTIVE", "INACTIVE"] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setCardFilter(filter)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-black cursor-pointer transition-colors ${
                  cardFilter === filter
                    ? "bg-black text-white shadow-sm"
                    : "text-ink hover:bg-black/10"
                }`}
              >
                {filter === "ALL" ? "All" : filter === "ACTIVE" ? "Active QR" : "No QR"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b-2 border-black bg-[#FAF3E0] text-ink">
              <th className="py-3 px-3 font-black uppercase text-[10px]">ID</th>
              <th className="py-3 px-3 font-black uppercase text-[10px]">Patient Name</th>
              <th className="py-3 px-3 font-black uppercase text-[10px]">Gender / Lang</th>
              <th className="py-3 px-3 font-black uppercase text-[10px]">Phone</th>
              <th className="py-3 px-3 font-black uppercase text-[10px]">QR Health Card</th>
              <th className="py-3 px-3 font-black uppercase text-[10px] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/10 font-bold">
            {filteredPatients.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-ink-secondary">
                  {loading ? "Loading patient records..." : "No patient records match the search query."}
                </td>
              </tr>
            ) : (
              filteredPatients.map((p) => (
                <tr key={p.id} className="hover:bg-amber-50/50 transition-colors">
                  <td className="py-3 px-3 font-mono font-black text-ink-secondary">#{p.id}</td>
                  <td className="py-3 px-3">
                    <span className="font-serif text-sm font-black text-ink">{p.name}</span>
                  </td>
                  <td className="py-3 px-3 text-ink-secondary">
                    <span>{p.gender}</span> • <span className="font-black text-ink">{p.preferredLanguage}</span>
                  </td>
                  <td className="py-3 px-3 font-mono text-ink-secondary">{p.phone}</td>
                  <td className="py-3 px-3">
                    {p.hasActiveCard ? (
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-600/40 bg-emerald-100 px-2.5 py-0.5 text-[10px] font-black text-emerald-950">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          Active ({p.activeCardToken ?? "Linked"})
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-black/20 bg-surface-muted px-2.5 py-0.5 text-[10px] font-bold text-ink-secondary">
                        <XCircle className="h-3 w-3" />
                        No Active Token
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/caregiver/patients/${p.id}`}
                        target="_blank"
                        className="btn-tactile inline-flex items-center gap-1 rounded-xl border-2 border-black bg-surface px-2.5 py-1 text-[11px] font-black text-ink shadow-[2px_2px_0px_#000] hover:bg-surface-muted cursor-pointer"
                      >
                        <span>Profile</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>

                      <Link
                        href={`/caregiver/patients/${p.id}/card`}
                        target="_blank"
                        className="btn-tactile inline-flex items-center gap-1 rounded-xl border-2 border-black bg-amber-100 px-2.5 py-1 text-[11px] font-black text-amber-950 shadow-[2px_2px_0px_#000] hover:bg-amber-200 cursor-pointer"
                      >
                        <QrCode className="h-3 w-3" />
                        <span>Card</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => onReissueCard(p.id, p.name)}
                        disabled={reissuingId === p.id}
                        className="btn-tactile inline-flex items-center gap-1 rounded-xl border-2 border-black bg-blue-100 px-2.5 py-1 text-[11px] font-black text-blue-950 shadow-[2px_2px_0px_#000] hover:bg-blue-200 cursor-pointer disabled:opacity-50"
                        title="Generate new active QR passkey token"
                      >
                        <KeyRound className="h-3 w-3 text-blue-700" />
                        <span>{reissuingId === p.id ? "Issuing..." : "Re-issue"}</span>
                      </button>

                      {p.hasActiveCard && (
                        <button
                          type="button"
                          onClick={() => onRevokeCard(p)}
                          className="btn-tactile inline-flex items-center gap-1 rounded-xl border-2 border-black bg-rose-100 px-2.5 py-1 text-[11px] font-black text-rose-950 shadow-[2px_2px_0px_#000] hover:bg-rose-200 cursor-pointer"
                        >
                          <Ban className="h-3 w-3 text-rose-700" />
                          <span>Revoke</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
