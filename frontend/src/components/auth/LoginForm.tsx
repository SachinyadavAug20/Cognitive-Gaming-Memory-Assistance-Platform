import Link from "next/link";

export function LoginForm() {
  return (
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
  );
}
