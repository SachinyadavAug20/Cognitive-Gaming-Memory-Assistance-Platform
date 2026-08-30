/**
 * Storage key written by `useAuthStore` (zustand persist) in
 * `src/store/useAuthStore.ts`. Kept as a local duplicate (rather than an
 * import) so this shared client module never crosses a "use client" boundary.
 */
const AUTH_STORAGE_KEY = "cognicare-auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

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

  const res = await fetch(`${API_BASE}${path}`, {
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

  const res = await fetch(`${API_BASE}${path}`, {
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
  const baseUrl = API_BASE.replace(/\/api\/v1\/?$/, "");
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

export const api = {
  get: <T,>(path: string) => request<T>(path),
  post: <T,>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  postMultipart: <T,>(path: string, formData: FormData) =>
    requestMultipart<T>(path, formData),
};