import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { KioskLoginClient } from "./KioskLoginClient";
import { buildMetadata } from "@/lib/metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return buildMetadata({
    locale,
    title: "Patient Kiosk Check-In",
    description:
      "Zero-touch QR health card kiosk authentication for elderly dementia and MCI patients. Scan your CogniCare health card to begin cognitive therapy.",
    path: "/kiosk/login",
  });
}

export default function KioskLoginPage() {
  return <KioskLoginClient />;
}