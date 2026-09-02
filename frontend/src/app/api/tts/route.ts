import { NextRequest, NextResponse } from "next/server";

// Language code mapping for Neural & Regional Speech Synthesis
const TTS_LANG_MAP: Record<string, string> = {
  en: "en",
  "en-in": "en",
  "en-us": "en",
  hi: "hi",
  "hi-in": "hi",
  bn: "bn",
  "bn-in": "bn",
  as: "bn", // Bengali audio engine shares phonetic script for Assamese Unicode
  "as-in": "bn",
  mr: "mr",
  "mr-in": "mr",
  ne: "ne",
  "ne-in": "ne",
  "ne-np": "ne",
  mni: "bn", // Manipuri (Meetei / Bengali script)
  "mni-in": "bn",
  brx: "hi", // Bodo (Devanagari script)
  "brx-in": "hi",
  grt: "en", // Garo (Roman script)
  "grt-in": "en",
  kha: "en", // Khasi (Roman script)
  "kha-in": "en",
  lus: "en", // Mizo (Roman script)
  "lus-in": "en",
};

// In-memory cache for generated TTS audio buffers (prevents redundant network requests)
const ttsCache = new Map<string, { buffer: ArrayBuffer; contentType: string }>();
const MAX_CACHE_SIZE = 250;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const text = searchParams.get("text")?.trim();
  const rawLang = (searchParams.get("lang") || "en").toLowerCase();

  if (!text) {
    return NextResponse.json({ error: "Text parameter is required" }, { status: 400 });
  }

  // Normalize language
  const langKey = rawLang.split("-")[0] || "en";
  const targetLang = TTS_LANG_MAP[rawLang] || TTS_LANG_MAP[langKey] || "en";

  const cacheKey = `${targetLang}:${text.slice(0, 160)}`;
  if (ttsCache.has(cacheKey)) {
    const cached = ttsCache.get(cacheKey)!;
    return new NextResponse(cached.buffer, {
      status: 200,
      headers: {
        "Content-Type": cached.contentType,
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  }

  try {
    // Neural TTS audio stream provider
    const encodedText = encodeURIComponent(text.slice(0, 200));
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=${targetLang}&client=tw-ob`;

    const res = await fetch(ttsUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Referer: "https://translate.google.com/",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Upstream TTS synthesis failed", status: res.status },
        { status: 502 }
      );
    }

    const arrayBuffer = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") || "audio/mpeg";

    // Manage LRU cache
    if (ttsCache.size >= MAX_CACHE_SIZE) {
      const firstKey = ttsCache.keys().next().value;
      if (firstKey) ttsCache.delete(firstKey);
    }
    ttsCache.set(cacheKey, { buffer: arrayBuffer, contentType });

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "TTS service exception", details: String(error) },
      { status: 500 }
    );
  }
}
