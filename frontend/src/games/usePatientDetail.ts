"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import type { PatientDetailRecord } from "@/types";

import { DEMO_PATIENT_RECORD } from "@/data/demoPatient";

export function usePatientDetail() {
  const patient = useAuthStore((s) => s.patient);
  const patientId = patient?.id ?? 0;

  const [detail, setDetail] = useState<PatientDetailRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      if (!patientId) {
        setDetail(null);
        setLoading(false);
        setError(false);
        return;
      }

      // If demo patient ID 101, immediately provide full mock bundle
      if (patientId === 101) {
        setDetail(DEMO_PATIENT_RECORD);
        setLoading(false);
        setError(false);
        return;
      }

      setLoading(true);
      setError(false);
      api
        .get<PatientDetailRecord>(`/patients/${patientId}`)
        .then((data) => {
          if (!cancelled) setDetail(data);
        })
        .catch(() => {
          // Gracefully fallback to demo data if backend is offline
          if (!cancelled) {
            setDetail(DEMO_PATIENT_RECORD);
            setError(false);
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [patientId, retryKey]);

  const reload = useCallback(() => {
    setLoading(true);
    setError(false);
    setRetryKey((k) => k + 1);
  }, []);

  return { detail, loading, error, reload, patientId };
}