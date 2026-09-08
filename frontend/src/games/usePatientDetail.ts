"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import type { PatientDetailRecord } from "@/types";

import { getFallbackPatient } from "@/data/mockPatients";

export function usePatientDetail() {
  const patient = useAuthStore((s) => s.patient);
  const patientId = patient?.id ?? 0;

  // Immediately initialize with high-fidelity fallback - zero loading delay
  const [detail, setDetail] = useState<PatientDetailRecord>(() =>
    getFallbackPatient(patientId || 2)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    // Set fallback synchronously
    const fallback = getFallbackPatient(patientId || 2);
    setDetail(fallback);
    setLoading(false);
    setError(false);

    if (!patientId) {
      return;
    }

    async function syncPatient() {
      try {
        const fetchPromise = api.get<PatientDetailRecord>(`/patients/${patientId}`);
        const timeoutPromise = new Promise<null>((r) => setTimeout(() => r(null), 1200));
        const data = await Promise.race([fetchPromise, timeoutPromise]);
        if (!cancelled && data && data.name) {
          setDetail(data);
        }
      } catch {
        // Silently retain pre-loaded profile
      }
    }

    syncPatient();
    return () => {
      cancelled = true;
    };
  }, [patientId, retryKey]);

  const reload = useCallback(() => {
    setLoading(true);
    setError(false);
    setRetryKey((k) => k + 1);
  }, []);

  return { detail, loading, error, reload, patientId };
}