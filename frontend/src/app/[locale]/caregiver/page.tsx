import type { Metadata } from "next";
import { CaregiverContent } from "./CaregiverContent";
import { buildMetadata } from "@/lib/metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({
    locale,
    title: "Caregiver Dashboard",
    description:
      "Cognitive therapy caregiver dashboard with session history, adherence tracking, and patient progress for elderly dementia care in North East India.",
    path: "/caregiver",
  });
}

export default function CaregiverDashboard() {
  return (
    <div className="min-h-[100vh] pb-4 md:overflow-hidden flex flex-col">
      <CaregiverContent />
    </div>
  );
}