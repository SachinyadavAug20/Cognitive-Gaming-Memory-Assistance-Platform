import { ScrapbookCard } from "@/components/ui/ScrapbookCard";

interface MemoryVaultProps {
  photos: string[];
}

export function MemoryVault({ photos }: MemoryVaultProps) {
  return (
    <ScrapbookCard>
      <h2 className="font-[family-name:var(--font-serif)] font-bold text-xl text-ink mb-4">
        📸 Memory Vault — Family Photos
      </h2>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {photos.map((emoji, i) => (
          <div
            key={i}
            className="aspect-square rounded-lg border-2 border-border-soft bg-surface-muted flex items-center justify-center text-3xl hover:border-border hover:bg-surface transition-colors cursor-pointer"
          >
            {emoji}
          </div>
        ))}
        <button className="aspect-square rounded-lg border-3 border-dashed border-border-soft bg-surface-muted flex items-center justify-center text-2xl text-ink-secondary hover:border-terracotta hover:text-terracotta transition-colors">
          +
        </button>
      </div>
      <p className="text-sm text-ink-secondary mt-3">
        Upload family photos for personalized memory puzzles. Drag photos
        here or click + to add.
      </p>
    </ScrapbookCard>
  );
}
