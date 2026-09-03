import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { HomeClient } from "./HomeClient";
import { RegionalStatesHub } from "@/components/home/RegionalStatesHub";
import { ClinicalImpactBadges } from "@/components/home/ClinicalImpactBadges";
import { FooterBar } from "@/components/home/FooterBar";
import { buildMetadata } from "@/lib/metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return buildMetadata({
    locale,
    title: "CogniCare CDTx — AI Memory & Cognitive Therapy for Elderly",
    description:
      "CogniCare CDTx delivers clinically calibrated cognitive gaming, dementia screening and memory assistance for elderly patients across North East India. 11 regional languages, 40+ serious games, local Ollama AI.",
    path: "",
    keywords: [
      "dementia cognitive therapy",
      "Alzheimer's memory assistance",
      "CDTx serious games",
      "MDoNER North East India",
      "elderly healthcare gaming",
      "Assamese Khasi Manipuri digital health",
    ],
  });
}

export default async function Home({ params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-canvas paper-texture">
      <main className="flex-1 px-4 py-6 md:px-8 md:py-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-8">
          <HomeClient />

          {/* 3. MDoNER 8-State North Eastern Cultural Memory Ecosystem */}
          <RegionalStatesHub />

          {/* 4. Clinical & Public Health Impact Pillars */}
          <ClinicalImpactBadges />

          {/* 5. Footer */}
          <FooterBar />
        </div>
      </main>
    </div>
  );
}