import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 paper-texture">
      <div className="w-full max-w-md space-y-5">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-5">
            <div className="w-10 h-10 bg-terracotta rounded-xl border-3 border-border flex items-center justify-center shadow-[3px_3px_0px_var(--color-border)]">
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-ink-inverse">
                <path d="M12 2a7 7 0 017 7c0 3-1.5 5-3 6.5V18a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2.5C6.5 14 5 12 5 9a7 7 0 017-7z" stroke="currentColor" strokeWidth="2" />
                <path d="M10 10h4M12 8v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <span className="font-[family-name:var(--font-serif)] font-bold text-2xl text-ink">CogniCare</span>
          </Link>
          <h1 className="font-[family-name:var(--font-serif)] font-bold text-xl text-ink mb-1">Welcome Back</h1>
          <p className="text-ink-secondary text-base">Sign in to continue</p>
        </div>

        <div className="scrapbook-card space-y-4">
          <div>
            <label className="block text-xs font-bold text-ink mb-1.5 uppercase tracking-wider">Email</label>
            <input type="email" placeholder="you@example.com"
              className="w-full px-4 py-3 text-base border-3 border-border rounded-xl bg-surface text-ink focus:border-terracotta focus:outline-none transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-bold text-ink mb-1.5 uppercase tracking-wider">Password</label>
            <input type="password" placeholder="••••••••"
              className="w-full px-4 py-3 text-base border-3 border-border rounded-xl bg-surface text-ink focus:border-terracotta focus:outline-none transition-colors" />
          </div>
          <Link href="/patient"
            className="btn-tactile bg-terracotta text-ink-inverse border-border text-lg px-6 py-3.5 min-h-[56px] rounded-xl w-full flex items-center justify-center gap-2">
            Sign In <span className="text-lg">→</span>
          </Link>
        </div>

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
      </div>
    </div>
  );
}
