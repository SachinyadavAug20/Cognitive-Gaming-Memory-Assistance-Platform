import Link from "next/link";

export function QuickAccessLinks() {
  return (
    <div className="text-center space-y-2">
      <p className="text-ink-secondary text-sm">Quick access as:</p>
      <div className="flex gap-2.5 justify-center">
        <Link href="/patient" className="btn-tactile bg-tea text-ink-inverse border-border text-sm px-4 py-2.5 min-h-[48px] rounded-lg">
          🧑 Patient
        </Link>
        <Link href="/caregiver" className="btn-tactile bg-marigold text-ink-inverse border-border text-sm px-4 py-2.5 min-h-[48px] rounded-lg">
          👨‍⚕️ Caregiver
        </Link>
      </div>
    </div>
  );
}
