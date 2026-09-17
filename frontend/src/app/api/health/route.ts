import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SPRING_HEALTH_URL = process.env.SPRING_HEALTH_URL || "http://localhost:8080/api/v1/health";
const SPRING_OVERVIEW_URL = process.env.SPRING_OVERVIEW_URL || "http://localhost:8080/api/v1/admin/overview";
const OLLAMA_TAGS_URL = process.env.OLLAMA_TAGS_URL || "http://localhost:11434/api/tags";

async function fetchWithTimeout(url: string, timeoutMs = 1800): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      signal: controller.signal,
      cache: "no-store",
    });
  } finally {
    clearTimeout(id);
  }
}

export async function GET() {
  let springOnline = false;
  let springLatencyMs = 0;
  let llmReportedBySpring = false;

  const springStart = Date.now();
  try {
    let res = await fetchWithTimeout(SPRING_HEALTH_URL, 1800);
    if (!res.ok && res.status === 404) {
      res = await fetchWithTimeout(SPRING_OVERVIEW_URL, 1800);
    }
    if (res.ok) {
      springOnline = true;
      springLatencyMs = Date.now() - springStart;
      const data = await res.json().catch(() => null);
      if (data) {
        if (data.llmOnline === true || data.ollamaStatus === "UP") {
          llmReportedBySpring = true;
        }
      }
    }
  } catch {
    springOnline = false;
    springLatencyMs = Date.now() - springStart;
  }

  let directLlmOnline = false;
  let llmLatencyMs = 0;
  let llmModel: string | null = null;

  const llmStart = Date.now();
  try {
    const res = await fetchWithTimeout(OLLAMA_TAGS_URL, 1800);
    if (res.ok) {
      directLlmOnline = true;
      llmLatencyMs = Date.now() - llmStart;
      const data = await res.json().catch(() => null);
      if (data?.models && Array.isArray(data.models) && data.models.length > 0) {
        llmModel = data.models[0].name || data.models[0].model || null;
      }
    }
  } catch {
    directLlmOnline = false;
    llmLatencyMs = Date.now() - llmStart;
  }

  const isLlmOnline = directLlmOnline || llmReportedBySpring;

  return NextResponse.json({
    springOnline,
    llmOnline: isLlmOnline,
    llmModel: llmModel || (isLlmOnline ? "qwen2.5:1.5b" : null),
    springLatencyMs,
    llmLatencyMs,
    timestamp: new Date().toISOString(),
  });
}
