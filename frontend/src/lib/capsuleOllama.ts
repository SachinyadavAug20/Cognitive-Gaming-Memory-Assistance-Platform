import type { MemoryCapsule } from "@/types/capsule";

export async function fetchCapsuleVariation(
  capsule: MemoryCapsule,
  patientName: string
): Promise<{ text: string; isAiGenerated: boolean }> {
  try {
    const res = await fetch("/api/capsules/narrate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientName,
        capsuleTitle: capsule.title,
        locationName: capsule.locationName,
        familyMemberName: capsule.familyMemberName,
        relationship: capsule.relationship,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.narration) {
        return { text: data.narration, isAiGenerated: true };
      }
    }
  } catch {
    // Silently fall back to pre-authored sensory prompt
  }

  return {
    text: capsule.guidedPrompts.sensoryPrompt,
    isAiGenerated: false,
  };
}
