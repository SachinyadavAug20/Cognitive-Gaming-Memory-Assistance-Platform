"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { getApiBase } from "@/lib/api";

export interface SystemStatusSnapshot {
  isSpringOnline: boolean;
  isLlmOnline: boolean;
  llmModel: string | null;
  springLatencyMs: number | null;
  llmLatencyMs: number | null;
  lastCheckedAt: Date | null;
  isChecking: boolean;
}

let currentSnapshot: SystemStatusSnapshot = {
  isSpringOnline: true,
  isLlmOnline: true,
  llmModel: null,
  springLatencyMs: null,
  llmLatencyMs: null,
  lastCheckedAt: null,
  isChecking: false,
};

const listeners = new Set<() => void>();

function emitSnapshotChange() {
  listeners.forEach((listener) => listener());
}

async function performHealthProbe(): Promise<void> {
  if (typeof window === "undefined") return;

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    currentSnapshot = {
      ...currentSnapshot,
      isSpringOnline: false,
      isLlmOnline: false,
      isChecking: false,
      lastCheckedAt: new Date(),
    };
    emitSnapshotChange();
    return;
  }

  currentSnapshot = {
    ...currentSnapshot,
    isChecking: true,
  };
  emitSnapshotChange();

  let resolvedSpring = false;
  let resolvedLlm = false;
  let resolvedModel: string | null = null;
  let latency: number | null = null;
  let llmLatency: number | null = null;

  try {
    const internalController = new AbortController();
    const timeoutId = setTimeout(() => internalController.abort(), 2200);

    const internalRes = await fetch("/api/health", {
      signal: internalController.signal,
      cache: "no-store",
    }).catch(() => null);

    clearTimeout(timeoutId);

    if (internalRes && internalRes.ok) {
      const data = await internalRes.json().catch(() => null);
      if (data) {
        resolvedSpring = Boolean(data.springOnline);
        resolvedLlm = Boolean(data.llmOnline);
        resolvedModel = data.llmModel ?? null;
        latency = typeof data.springLatencyMs === "number" ? data.springLatencyMs : null;
        llmLatency = typeof data.llmLatencyMs === "number" ? data.llmLatencyMs : null;
      }
    }
  } catch {
    resolvedSpring = false;
  }

  if (!resolvedSpring) {
    try {
      const directController = new AbortController();
      const directTimeoutId = setTimeout(() => directController.abort(), 2000);
      const apiBase = getApiBase();

      const directRes = await fetch(`${apiBase}/admin/overview`, {
        signal: directController.signal,
        cache: "no-store",
      }).catch(() => null);

      clearTimeout(directTimeoutId);

      if (directRes && directRes.ok) {
        resolvedSpring = true;
        const body = await directRes.json().catch(() => null);
        if (body?.ollamaStatus === "UP") {
          resolvedLlm = true;
        }
      }
    } catch {
      resolvedSpring = false;
    }
  }

  currentSnapshot = {
    isSpringOnline: resolvedSpring,
    isLlmOnline: resolvedLlm,
    llmModel: resolvedModel,
    springLatencyMs: latency,
    llmLatencyMs: llmLatency,
    lastCheckedAt: new Date(),
    isChecking: false,
  };
  emitSnapshotChange();
}

let pollingIntervalId: ReturnType<typeof setInterval> | null = null;

function subscribeToSystemStatus(callback: () => void) {
  listeners.add(callback);

  if (typeof window !== "undefined" && listeners.size === 1) {
    void performHealthProbe();

    pollingIntervalId = setInterval(() => {
      void performHealthProbe();
    }, 8000);

    window.addEventListener("online", handleNetworkOnline);
    window.addEventListener("offline", handleNetworkOffline);
    window.addEventListener("focus", handleWindowFocus);
  }

  return () => {
    listeners.delete(callback);
    if (listeners.size === 0 && pollingIntervalId) {
      clearInterval(pollingIntervalId);
      pollingIntervalId = null;
      if (typeof window !== "undefined") {
        window.removeEventListener("online", handleNetworkOnline);
        window.removeEventListener("offline", handleNetworkOffline);
        window.removeEventListener("focus", handleWindowFocus);
      }
    }
  };
}

function handleNetworkOnline() {
  void performHealthProbe();
}

function handleNetworkOffline() {
  currentSnapshot = {
    ...currentSnapshot,
    isSpringOnline: false,
    isLlmOnline: false,
    isChecking: false,
    lastCheckedAt: new Date(),
  };
  emitSnapshotChange();
}

function handleWindowFocus() {
  void performHealthProbe();
}

function getSystemStatusSnapshot(): SystemStatusSnapshot {
  return currentSnapshot;
}

export function useSystemStatus() {
  const status = useSyncExternalStore(
    subscribeToSystemStatus,
    getSystemStatusSnapshot,
    () => currentSnapshot
  );

  return {
    ...status,
    checkNow: performHealthProbe,
  };
}
