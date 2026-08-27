interface GamePreviewTileProps {
  emoji: string;
  name: string;
  subtitle: string;
  bgColor: string;
  borderColor: string;
}

export function GamePreviewTile({ emoji, name, subtitle, bgColor, borderColor }: GamePreviewTileProps) {
  return (
    <div className={`${bgColor} border-2 ${borderColor} rounded-lg py-2 px-2.5 text-center`}>
      <div className="text-2xl mb-0.5">{emoji}</div>
      <div className="text-xs font-bold text-ink">{name}</div>
      <div className="text-[10px] text-ink-secondary">{subtitle}</div>
    </div>
  );
}
