import { NextResponse } from "next/server";
import type { DiagnosticData } from "@/types/intake";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pdfBase64 } = body;

    if (!pdfBase64) {
      return NextResponse.json({ error: "No PDF data provided" }, { status: 400 });
    }

    // Simulate LLM processing delay (2-3 seconds)
    await new Promise((resolve) => setTimeout(resolve, 2500));

    // Mock diagnostic data extracted from PDF
    // In production, this would call the Spring Boot backend or Ollama API
    const mockData: DiagnosticData = {
      diagnosis: "Mild Cognitive Impairment",
      icd10: "G31.84",
      dateOfDiagnosis: "March 2026",
      examiningPhysician: "Dr. Ananya Sharma, Neurology",
      clinicOrHospital: "Guwahati Medical College",
      testType: "MoCA",
      score: 24,
      maxScore: 30,
      stage: "Mild Cognitive Impairment",
      recommendedStartLevel: 1,
      medications: ["Donepezil 10mg daily", "Memantine 5mg twice daily"],
      physicianNotes:
        "Patient presents with mild memory impairment affecting daily activities. MoCA score 24/30 indicates mild deficit. Recommend cognitive stimulation therapy and regular follow-up.",
    };

    return NextResponse.json(mockData);
  } catch {
    return NextResponse.json(
      { error: "Failed to analyze report" },
      { status: 500 }
    );
  }
}
