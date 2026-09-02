"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import type { AdminPatientRow } from "@/types/admin";

interface AdminRevokeModalProps {
  patient: AdminPatientRow;
  revoking: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function AdminRevokeModal({
  patient,
  revoking,
  onCancel,
  onConfirm,
}: AdminRevokeModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-3xl border-4 border-black bg-surface p-6 shadow-[8px_8px_0px_#000] space-y-4">
        <div className="flex items-center gap-3 border-b-2 border-black/15 pb-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-black bg-rose-100 text-rose-700">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-serif text-lg font-black text-ink">
              Revoke QR Health Card?
            </h3>
            <span className="text-xs font-bold text-ink-secondary">
              Patient: {patient.name} (#{patient.id})
            </span>
          </div>
        </div>

        <p className="text-xs font-semibold text-ink leading-relaxed">
          Deactivating this QR card will immediately invalidate its cryptographic token. The patient will no longer be able to log in at village kiosks until a new card is generated.
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={revoking}
            className="btn-tactile rounded-xl border-2 border-black bg-surface px-4 py-2 text-xs font-black text-ink shadow-[2px_2px_0px_#000] hover:bg-surface-muted cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={revoking}
            className="btn-tactile rounded-xl border-2 border-black bg-rose-600 px-4 py-2 text-xs font-black text-white shadow-[2px_2px_0px_#000] hover:bg-rose-700 cursor-pointer disabled:opacity-50"
          >
            {revoking ? "Revoking..." : "Yes, Revoke QR Card"}
          </button>
        </div>
      </div>
    </div>
  );
}
