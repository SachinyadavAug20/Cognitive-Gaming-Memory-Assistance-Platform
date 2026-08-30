export interface GameSession {
  gameId: string;
  level: number;
  outcome: "completed" | "abandoned";
  score: number;
  startedAt: string;
  endedAt: string;
  taps: number;
}

const KEY = (patientId: number) => `cognicare-games-${patientId}`;
const MAX = 300;

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

export function recordGameSession(
  patientId: number,
  session: Omit<GameSession, "endedAt">
): void {
  if (!patientId) return;
  const key = KEY(patientId);
  const all = read<GameSession>(key) ?? [];
  all.push({
    ...session,
    endedAt: new Date().toISOString(),
  });
  if (all.length > MAX) all.splice(0, all.length - MAX);
  write(key, all);
}

export function getGameSessions(patientId: number): GameSession[] {
  if (!patientId) return [];
  return read<GameSession>(KEY(patientId)) ?? [];
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