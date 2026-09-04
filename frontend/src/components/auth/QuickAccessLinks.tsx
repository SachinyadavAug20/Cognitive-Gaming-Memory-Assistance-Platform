import { Link } from "@/i18n/navigation";
import { User, UserCheck } from "lucide-react";

export function QuickAccessLinks() {
  return (
    <div className="text-center space-y-2">
      <p className="text-ink-secondary text-sm">Quick access as:</p>
      <div className="flex gap-2.5 justify-center">
        <Link href="/patient" className="btn-tactile inline-flex items-center gap-1.5 bg-tea text-ink-inverse border-border text-sm px-4 py-2.5 min-h-[48px] rounded-lg font-bold">
          <User className="h-4 w-4" />
          <span>Patient</span>
        </Link>
        <Link href="/caregiver" className="btn-tactile inline-flex items-center gap-1.5 bg-marigold text-ink-inverse border-border text-sm px-4 py-2.5 min-h-[48px] rounded-lg font-bold">
          <UserCheck className="h-4 w-4" />
          <span>Caregiver</span>
        </Link>
      </div>
    </div>
  );
}
