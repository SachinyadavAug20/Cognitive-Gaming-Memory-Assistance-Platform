# CogniCare — Language Support & i18n Technical Reference

> Quick revision document for SIH 2026 presentation.

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| `next-intl` | 4.14.0 | i18n framework for Next.js App Router |
| Next.js | 16.3.3 (Turbopack) | React framework with locale-prefixed routing |
| TypeScript | — | Type-safe locale keys and message access |
| Web Speech API | — | Browser-native TTS with locale-aware voices |

---

## Supported Locales

| Code | Language | Native Name | TTS Code (BCP-47) |
|---|---|---|---|
| `en` | English | English | `en-US` (default) |
| `hi` | Hindi | हिन्दी | `hi-IN` |
| `as` | Assamese | অসমীয়া | `as-IN` |
| `mr` | Marathi | मराठी | `mr-IN` |

All routes are locale-prefixed: `/en/patient`, `/hi/patient`, etc. (`localePrefix: 'always'`)

---

## Architecture — 6 Key Files

### 1. `src/i18n/routing.ts` — Locale Configuration
```ts
defineRouting({ locales: ['en','hi','as','mr'], defaultLocale: 'en', localePrefix: 'always' })
```
- Defines supported locales and default fallback
- Shared by middleware, navigation helpers, and request config

### 2. `src/i18n/request.ts` — Server-Side Message Loading
```ts
getRequestConfig(async ({ requestLocale }) => {
  // loads en.json as base, spreads target locale on top
  return { locale, messages: { ...enMessages, ...targetMessages } };
})
```
- **Deep fallback merge**: always loads `en.json` first, then overlays the target locale
- Guarantees no blank/missing text even if a non-English file has gaps
- Uses explicit `import()` per locale (not dynamic template literals) — Turbopack requirement

### 3. `src/i18n/navigation.ts` — Locale-Aware Navigation
```ts
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
```
- Drop-in replacements for Next.js `Link`, `useRouter`, `usePathname`, `redirect`
- Automatically preserves locale prefix on navigation
- Used in Navbar, LanguageSelector, all page components

### 4. `src/proxy.ts` — Middleware (Locale Detection)
```ts
export default createMiddleware(routing);
export const config = { matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)' };
```
- Next.js 16 convention: file named `proxy.ts` (not `middleware.ts`)
- Detects locale from `Accept-Language` header / URL prefix / cookie
- Redirects `/` → `/en` (or saved locale)
- Excludes API routes, static files, internal Next.js paths

### 5. `src/lib/i18n.ts` — TTS Locale Map
```ts
export const LOCALE_MAP: Record<string, string> = {
  en: "en-US", hi: "hi-IN", as: "as-IN", mr: "mr-IN"
};
```
- Maps app locale codes to BCP-47 speech synthesis language tags
- Used by `AudioPrompt` component for voice output

### 6. `next.config.ts` — Plugin Integration
```ts
const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
```
- Wraps Next.js config with `next-intl` plugin
- Enables server-side message loading and locale-aware routing

---

## App Router Layout

```
src/app/
├── layout.tsx              # Root layout — passthrough (no providers)
├── page.tsx                # Root page — redirect("/en")
└── [locale]/
    ├── layout.tsx          # Locale layout — <html lang={locale}> + NextIntlClientProvider
    ├── page.tsx            # Home page
    ├── patient/            # Patient dashboard
    ├── caregiver/          # Caregiver dashboard
    └── login/              # Login page
```

- Root `layout.tsx` renders `{children}` directly (no `<html>` or providers)
- `[locale]/layout.tsx` sets `<html lang={locale}>` dynamically and wraps with `<NextIntlClientProvider>`
- `[locale]/page.tsx` and all sub-pages use `useTranslations()` hooks
- Root `page.tsx` does `redirect("/en")` for bare `/` visits

---

## Message File Format

**Location**: `src/messages/{en,hi,as,mr}.json`

**Structure**: Nested JSON with `.label` sub-keys for conflict resolution:

```json
{
  "intake": {
    "personal": {
      "name": {
        "label": "Full Name",
        "placeholder": "e.g., Ramesh Dutta"
      },
      "gender": "Gender"
    }
  },
  "options": {
    "gender": {
      "male": "Male",
      "female": "Female",
      "other": "Other"
    }
  }
}
```

**Namespaces covered**: `nav`, `home`, `patient`, `puzzle`, `wayfinding`, `caregiver`, `intake` (with sub-namespaces: `personal`, `medical`, `family`, `life`, `places`, `review`, `wizard`), `options` (`gender`, `relationship`, `relativeRelationship`, `interests`, `status`, `metrics`), `game`, `common`, `audio`

---

## Key Patterns in Components

### Translations (Server & Client)
```tsx
import { useTranslations } from "next-intl";

function MyComponent() {
  const t = useTranslations("intake.personal");  // namespace
  return <h2>{t("title")}</h2>;                   // key access
}
```

### Current Locale
```tsx
import { useLocale } from "next-intl";
const locale = useLocale();  // "en" | "hi" | "as" | "mr"
```

### Locale-Aware Links
```tsx
import Link from "@/i18n/navigation";
<Link href="/patient">  // automatically becomes /hi/patient etc.
```

### Language Switching
```tsx
import { useRouter, usePathname } from "@/i18n/navigation";
const router = useRouter();
const pathname = usePathname();
router.replace(pathname, { locale: "hi" });  // navigates to /hi/...
```

---

## TTS Integration

**Component**: `src/components/ui/AudioPrompt.tsx`

```tsx
const locale = useLocale();
const resolvedLang = LOCALE_MAP[locale] ?? "en-US";
const utterance = new SpeechSynthesisUtterance(text);
utterance.lang = resolvedLang;  // e.g., "hi-IN"
utterance.rate = 0.85;          // slow for elderly users
window.speechSynthesis.speak(utterance);
```

- Uses browser-native Web Speech API (no external service)
- Automatically resolves voice language from current locale
- Rate 0.85x for cognitive accessibility

---

## Language Selector

**Component**: `src/components/ui/LanguageSelector.tsx`

- 4-button segmented pill: `ENG | हिन्दी | অসমীয়া | मराठी`
- Uses `useLocale()` for active state, `useRouter().replace()` for switching
- Client component (`"use client"`)
- Styled with theme tokens (`bg-marigold`, `text-white` for active)

---

## Deep Fallback Mechanism

Problem: If a non-English locale file is missing a key, the UI shows blank text.

Solution in `request.ts`:
```ts
const enMessages = await import('@/messages/en.json');
const targetMessages = locale === 'en' ? {} : await messageLoaders[locale]();
return { messages: { ...enMessages, ...targetMessages } };
```

- `en.json` is always loaded as the base (100% complete)
- Target locale spread on top — only overrides keys that exist
- Missing keys in Hindi/Assamese/Marathi fall back to English automatically
- No blank text ever reaches the UI

---

## Turbopack Constraint

Dynamic template literal imports fail under Turbopack:
```ts
// ❌ FAILS — Turbopack can't resolve
const msgs = await import(`@/messages/${locale}.json`);

// ✅ WORKS — explicit imports
const messageLoaders = {
  en: () => import('@/messages/en.json'),
  hi: () => import('@/messages/hi.json'),
  as: () => import('@/messages/as.json'),
  mr: () => import('@/messages/mr.json'),
};
```

---

## Components Using i18n

| Component | Type | Hooks Used |
|---|---|---|
| `LanguageSelector` | Client | `useLocale`, `useRouter`, `usePathname` |
| `AudioPrompt` | Client | `useLocale` |
| `Navbar` | Client | `useTranslations('nav')`, locale-aware `Link` |
| `StepPersonalInfo` | Client | `useTranslations` x 3 (intake, options.gender, options.relationship) |
| `StepFamilyMembers` | Client | `useTranslations` x 4 (intake.family, name, notes, options.relativeRelationship) |
| `StepLifeStory` | Client | `useTranslations` x 2 (intake.life, options.interests) |
| `StepFamiliarPlaces` | Client | `useTranslations` x 3 (intake.places, name, desc) |
| `StepDiagnosticReport` | Client | `useTranslations('intake.medical')` |
| `StepReview` | Client | `useTranslations('intake.review')` |
| `IntakeWizard` | Client | `useTranslations` x 2 (intake, intake.wizard) |
| `ReminderRow` | Client | `useTranslations('options.status')` |
| `PatientCard` | Client | `useTranslations('options.metrics')` |
| `GameHeader` | Client | `useTranslations('game')` |
| `CaregiverContent` | Client | `useTranslations('caregiver')` |
