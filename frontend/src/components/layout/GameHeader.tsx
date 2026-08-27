import Link from "next/link";

interface GameHeaderProps {
  title: string;
  score: number;
  backHref: string;
  bgColor: string;
}

export function GameHeader({ title, score, backHref, bgColor }: GameHeaderProps) {
  return (
    <div className={`${bgColor} border-b-4 border-border px-6 py-4`}>
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        <Link
          href={backHref}
          className="text-ink-inverse/80 hover:text-ink-inverse font-bold text-lg transition-colors"
        >
          ← Back
        </Link>
        <h1 className="font-[family-name:var(--font-serif)] font-bold text-xl md:text-2xl text-ink-inverse">
          {title}
        </h1>
        <div className="font-bold text-lg text-ink-inverse">
          Score: {score}
        </div>
      </div>
    </div>
  );
}
