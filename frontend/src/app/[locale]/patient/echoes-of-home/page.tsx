import { Suspense } from "react";
import { EchoesOfHomeClient } from "@/components/capsule/EchoesOfHomeClient";
import { Spinner } from "@/components/ui/Spinner";

export const metadata = {
  title: "Echoes of Home — Peaceful Sounds & Memories | CogniCare",
  description:
    "Reconnect with cherished memories through gentle 3D visuals, ambient soundscapes, family voice recordings, and comforting reminiscence.",
};

export default function EchoesOfHomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-stone-950">
          <Spinner className="h-10 w-10 text-teal-400" />
        </div>
      }
    >
      <EchoesOfHomeClient />
    </Suspense>
  );
}
