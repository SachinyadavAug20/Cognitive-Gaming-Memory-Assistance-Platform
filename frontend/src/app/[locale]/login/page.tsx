import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";
import { QuickAccessLinks } from "@/components/auth/QuickAccessLinks";

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

        <LoginForm />

        <QuickAccessLinks />
      </div>
    </div>
  );
}
