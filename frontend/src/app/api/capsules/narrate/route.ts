import { NextResponse } from "next/server";

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434/api/generate";

export async function POST(req: Request) {
  try {
    const {
      patientName,
      capsuleTitle,
      locationName,
      familyMemberName,
      relationship,
    } = await req.json();

    const cleanName = patientName || "Dear friend";
    const prompt = `You are Saathi, a gentle, compassionate dementia care memory companion in North East India.
Speak in 1 single, soothing, comforting sentence to ${cleanName}.
Remind them gently of the memory "${capsuleTitle}" at ${locationName}, shared with their loving ${relationship || "family member"} ${familyMemberName || ""}.
Focus on comforting sensory details like warmth, light, or loving presence. Keep it simple, warm, and under 25 words. Do not use markdown or quotes.`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "qwen2.5:1.5b",
        prompt: prompt,
        stream: false,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      let text = (data.response || "").trim();
      text = text.replace(/^["']|["']$/g, "").trim();
      if (text.length > 5) {
        return NextResponse.json({
          narration: text,
          source: "ollama",
        });
      }
    }
  } catch (err) {
    // Graceful offline fallback
  }

  return NextResponse.json({
    narration: null,
    source: "fallback",
  });
}
