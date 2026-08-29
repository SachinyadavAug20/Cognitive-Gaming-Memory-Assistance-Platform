"use client";

interface GamePreviewTileProps {
  emoji: string;
  name: string;
  subtitle: string;
  bgColor: string;
  borderColor: string;
  comingSoonLabel?: string;
}

const COMING_SOON_MESSAGE =
  "This game module is currently in development for the hackathon.";

export function GamePreviewTile({ emoji, name, subtitle, bgColor, borderColor, comingSoonLabel = "Coming Soon" }: GamePreviewTileProps) {
  return (
    <button
      type="button"
      onClick={() => alert(COMING_SOON_MESSAGE)}
      aria-label={`${name} — ${comingSoonLabel}`}
      className={`${bgColor} border-2 ${borderColor} rounded-lg py-2 px-2.5 text-center flex flex-col items-center opacity-80 cursor-not-allowed`}
    >
      <span className="text-2xl mb-0.5">{emoji}</span>
      <span className="text-xs font-bold text-ink">{name}</span>
      <span className="text-[10px] text-ink-secondary">{subtitle}</span>
      <span className="mt-1 text-[9px] font-bold uppercase tracking-wide bg-ink/10 text-ink-secondary px-1.5 py-0.5 rounded-full">
        {comingSoonLabel}
      </span>
    </button>
  );
}