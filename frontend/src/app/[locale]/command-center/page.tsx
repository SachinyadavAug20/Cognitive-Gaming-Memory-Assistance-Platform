import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { CommandCenterClient } from "./CommandCenterClient";
import { buildMetadata } from "@/lib/metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return buildMetadata({
    locale,
    title: "Public Health Command Center",
    description:
      "North Eastern Region dementia surveillance and early-intervention command center with live clinical early warnings, epidemiological matrix and 2G offline sync across 8 states.",
    path: "/command-center",
  });
}

export default function CommandCenterPage() {
  return <CommandCenterClient />;
}