import { Suspense } from "react";
import { EchoesOfHomeClient } from "@/components/capsule/EchoesOfHomeClient";
import { Spinner } from "@/components/ui/Spinner";

export const metadata = {
  title: "Family Photos & Peaceful Sounds | CogniCare",
  description:
    "Look at beloved family photos and listen to gentle, comforting sounds of nature and music.",
};

export default function EchoesOfHomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-stone-950">
          <Spinner className="h-10 w-10 text-emerald-400" />
        </div>
      }
    >
      <EchoesOfHomeClient />
    </Suspense>
  );
}
