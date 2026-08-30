export interface GameSession {
  gameId: string;
  level: number;
  outcome: "completed" | "abandoned";
  score: number;
  startedAt: string;
  endedAt: string;
  taps: number;
  errorCount: number;
  timeToCompleteSec: number;
}

export type NewSession = Omit<
  GameSession,
  "endedAt" | "errorCount" | "timeToCompleteSec"
> & {
  errorCount?: number;
};

interface PendingItem extends GameSession {
  attempts: number;
}

const KEY = (patientId: number) => `cognicare-games-${patientId}`;
const PENDING_KEY = (patientId: number) => `cognicare-games-pending-${patientId}`;
const MAX = 300;
const MAX_PENDING = 300;
const MAX_SYNC_ATTEMPTS = 5;

const SYNC_URL = () =>
  `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1"}/telemetry/sessions`;

function read<T>(key: string): T[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage failures
  }
}

function toSec(startedAt: string, endedAt: string): number {
  const startMs = Date.parse(startedAt);
  const endMs = Date.parse(endedAt);
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) return 0;
  return Math.max(0, Math.round((endMs - startMs) / 1000));
}

/**
 * Best-effort push of the queued sessions to the backend. Offline-first:
 * failures (or no connectivity) simply keep the queue in localStorage so it can
 * be flushed later when connectivity is restored.
 */
export function flushPendingSync(patientId: number): Promise<{ synced: number; pending: number }> {
  const key = PENDING_KEY(patientId);
  const queue = read<PendingItem>(key) ?? [];
  if (!queue.length) return Promise.resolve({ synced: 0, pending: 0 });

  return fetch(SYNC_URL(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ patientId, sessions: queue }),
  })
    .then((res) => {
      if (!res.ok) throw new Error(`sync failed (${res.status})`);
      write(key, []);
      return { synced: queue.length, pending: 0 };
    })
    .catch(() => {
      const retried = queue.map((item) => ({
        ...item,
        attempts: (item.attempts ?? 0) + 1,
      }));
      write(
        key,
        MAX_SYNC_ATTEMPTS > 0 ? retried.slice(-MAX_PENDING) : []
      );
      return { synced: 0, pending: retried.length };
    });
}

function record(patientId: number, session: NewSession): void {
  if (!patientId) return;
  const key = KEY(patientId);
  const all = read<GameSession>(key) ?? [];
  const endedAt = new Date().toISOString();
  const full: GameSession = {
    ...session,
    errorCount: session.errorCount ?? 0,
    endedAt,
    timeToCompleteSec: toSec(session.startedAt, endedAt),
  };
  all.push(full);
  if (all.length > MAX) all.splice(0, all.length - MAX);
  write(key, all);

  const pendingKey = PENDING_KEY(patientId);
  const pending = read<PendingItem>(pendingKey) ?? [];
  pending.push({ ...full, attempts: 0 });
  if (pending.length > MAX_PENDING) pending.splice(0, pending.length - MAX_PENDING);
  write(pendingKey, pending);

  if (typeof navigator === "undefined" || navigator.onLine) {
    void flushPendingSync(patientId);
  }
}

export function recordGameSession(
  patientId: number,
  session: NewSession
): void {
  if (!patientId) return;
  record(patientId, { ...session, outcome: "completed" });
}

export function recordGameAbandonment(
  patientId: number,
  session: Pick<GameSession, "gameId" | "level" | "startedAt"> &
    Partial<Pick<GameSession, "taps" | "errorCount" | "score">>
): void {
  if (!patientId) return;
  record(patientId, {
    gameId: session.gameId,
    level: session.level,
    outcome: "abandoned",
    score: session.score ?? 0,
    taps: session.taps ?? 0,
    errorCount: session.errorCount ?? 0,
    startedAt: session.startedAt,
  });
}

export function getGameSessions(patientId: number): GameSession[] {
  if (!patientId) return [];
  return read<GameSession>(KEY(patientId)) ?? [];
}

export function getRecentSessions(
  patientId: number,
  gameId: string,
  limit = 5
): GameSession[] {
  return getGameSessions(patientId)
    .filter((s) => s.gameId === gameId && s.outcome === "completed")
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
    .slice(0, limit);
}

export function getGamePlayCount(patientId: number, gameId: string): number {
  return getGameSessions(patientId).filter(
    (s) => s.gameId === gameId && s.outcome === "completed"
  ).length;
}

export function getTodayPlayCount(patientId: number): number {
  const today = new Date().toISOString().slice(0, 10);
  return getGameSessions(patientId).filter(
    (s) => s.outcome === "completed" && s.startedAt.slice(0, 10) === today
  ).length;
}

const SLOW_SESSION_SEC = 150;
const HIGH_ERROR_COUNT = 3;
const FAST_SESSION_SEC = 45;
const LOW_ERROR_AVG = 0.5;

/**
 * AI adaptive engine: given recent telemetry, decide whether the next session
 * of the same game should be easier, harder, or unchanged. Falling back to the
 * caregiver's configured startLevel when there is no telemetry yet.
 */
export function adjustDifficulty(sessions: GameSession[], baseLevel: number): number {
  const recent = sessions.slice(0, 5);
  if (!recent.length) return baseLevel;

  const avgErrors = recent.reduce((sum, s) => sum + (s.errorCount ?? 0), 0) / recent.length;
  const avgTime = recent.reduce((sum, s) => sum + (s.timeToCompleteSec ?? 0), 0) / recent.length;

  if (avgErrors >= HIGH_ERROR_COUNT || avgTime >= SLOW_SESSION_SEC) {
    return Math.max(1, baseLevel - 1);
  }
  if (avgErrors <= LOW_ERROR_AVG && avgTime <= FAST_SESSION_SEC) {
    return Math.min(3, baseLevel + 1);
  }
  return baseLevel;
}

/**
 * Read a patient's recent sessions for a game from localStorage and return the
 * adaptively adjusted difficulty level (1..3). Used at the top of game sessions.
 */
export function resolveAdaptiveLevel(
  patientId: number,
  gameId: string,
  baseLevel: number
): number {
  if (!patientId) return baseLevel;
  return adjustDifficulty(getRecentSessions(patientId, gameId, 5), baseLevel);
}