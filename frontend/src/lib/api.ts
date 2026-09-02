/**
 * Storage key written by `useAuthStore` (zustand persist) in
 * `src/store/useAuthStore.ts`. Kept as a local duplicate (rather than an
 * import) so this shared client module never crosses a "use client" boundary.
 */
const AUTH_STORAGE_KEY = "cognicare-auth";

export function getApiBase(): string {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return "http://localhost:8080/api/v1";
    }
    // Dynamic match for tablet / mobile accessing via LAN IP
    return `http://${host}:8080/api/v1`;
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
}

const LOGIN_URL = "/en/kiosk/login";

// Only /api/v1/patients/** is JWT-guarded on the backend, so a 401 there while a
// token was attached means the cached token is stale. Other endpoints (e.g. the
// kiosk scan) can legitimately 401 on a bad QR and must not wipe the session.
function isProtectedPatientPath(path: string): boolean {
  return path.startsWith("/patients");
}

function handleSessionExpired(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    // ignore storage failures
  }
  if (!window.location.pathname.includes("/kiosk/login")) {
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = LOGIN_URL;
  }
}

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "HttpError";
  }
}

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const state = JSON.parse(raw)?.state;
    const token = typeof state?.token === "string" ? state.token : null;
    return token;
  } catch {
    return null;
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers = new Headers(options?.headers);
  headers.set("Content-Type", "application/json");
  const token = getAuthToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const apiBase = getApiBase();
  const res = await fetch(`${apiBase}${path}`, {
    ...options,
    headers,
  });
  if (res.status === 401 && token && isProtectedPatientPath(path)) {
    handleSessionExpired();
  }
  if (!res.ok) throw new HttpError(res.status, `API error: ${res.status}`);
  return res.json();
}

async function requestMultipart<T>(path: string, formData: FormData): Promise<T> {
  const headers = new Headers();
  const token = getAuthToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const apiBase = getApiBase();
  const res = await fetch(`${apiBase}${path}`, {
    method: "POST",
    body: formData,
    headers,
  });
  if (res.status === 401 && token && isProtectedPatientPath(path)) {
    handleSessionExpired();
  }
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export function getMediaUrl(path?: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("blob:") || path.startsWith("data:")) {
    return path;
  }
  const apiBase = getApiBase();
  const baseUrl = apiBase.replace(/\/api\/v1\/?$/, "");
  if (path.startsWith("/uploads/")) {
    return `${baseUrl}${path}`;
  }
  if (path.startsWith("uploads/")) {
    return `${baseUrl}/${path}`;
  }
  if (path.startsWith("patients/") || path.startsWith("/patients/")) {
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    return `${baseUrl}/uploads/${cleanPath}`;
  }
  return path;
}

export interface AiChatPayload {
  patientId?: number | null;
  userMessage: string;
  personaName?: string;
  conversationHistory?: Array<{ role: string; text: string }>;
}

export interface AiChatResponse {
  replyText: string;
  spokenAudioText: string;
  emotionTone: string;
  suggestedQuickReplies: string[];
  highlightedMemoryNote?: string;
  relatedPhotoUrl?: string;
}

export interface AiCluesPayload {
  patientId?: number | null;
  targetType: string;
  targetName: string;
  targetRelationOrSignificance?: string;
  targetNotes?: string;
}

export interface AiCluesResponse {
  gentleClue1: string;
  specificClue2: string;
  directClue3: string;
  encouragingEncouragement: string;
  candidateOptions: string[];
}

export interface AiStoryPayload {
  patientId?: number | null;
  theme: string;
  currentChapterIndex: number;
  previousChoiceMade?: string;
  previousChapterSummaries?: string[];
}

export interface AiStoryChoice {
  id: string;
  label: string;
  emoji: string;
  nextThemePrompt?: string;
}

export interface AiStoryResponse {
  chapterNumber: number;
  chapterTitle: string;
  chapterNarrative: string;
  sensoryAtmosphere: string;
  storyEmoji: string;
  choices: AiStoryChoice[];
  isFinale: boolean;
}

export interface AiBazaarPayload {
  patientId?: number | null;
  marketName?: string;
  currentItem?: string;
  userOfferPrice?: number;
  userSpokenMessage?: string;
  budgetRemaining?: number;
}

export interface AiBazaarResponse {
  merchantName: string;
  merchantDialogue: string;
  itemName: string;
  finalPrice: number;
  updatedBudget: number;
  quickOptions: string[];
  isDealClosed: boolean;
  culturalFact: string;
}

export interface AiProverbPayload {
  patientId?: number | null;
  language?: string;
  category?: string;
}

export interface AiProverbResponse {
  id: string;
  category: string;
  partialVerseWithBlank: string;
  correctWord: string;
  candidateOptions: string[];
  fullProverb: string;
  explanationAndWisdom: string;
  regionOrigin: string;
}

export interface AiMemoirPayload {
  patientId?: number | null;
  photoPromptTitle?: string;
  userSpokenNarrative?: string;
}

export interface AiMemoirResponse {
  memoirTitle: string;
  poeticNarrative: string;
  emotionalTone: string;
  syntacticRichnessScore: number;
  culturalDedication: string;
}

export const api = {
  get: <T,>(path: string) => request<T>(path),
  post: <T,>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  postMultipart: <T,>(path: string, formData: FormData) =>
    requestMultipart<T>(path, formData),

  // AI Reminiscence Endpoints (Local Ollama Powered)
  aiChat: (payload: AiChatPayload) =>
    request<AiChatResponse>("/ai/reminiscence/chat", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  aiClues: (payload: AiCluesPayload) =>
    request<AiCluesResponse>("/ai/reminiscence/clues", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  aiStoryChapter: (payload: AiStoryPayload) =>
    request<AiStoryResponse>("/ai/reminiscence/story-chapter", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  aiBazaar: (payload: AiBazaarPayload) =>
    request<AiBazaarResponse>("/ai/reminiscence/bazaar", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  aiProverb: (payload: AiProverbPayload) =>
    request<AiProverbResponse>("/ai/reminiscence/proverb", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  aiMemoir: (payload: AiMemoirPayload) =>
    request<AiMemoirResponse>("/ai/reminiscence/memoir-scribe", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};