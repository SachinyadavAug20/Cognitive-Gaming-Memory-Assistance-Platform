import { ScrapbookCard } from "@/components/ui/ScrapbookCard";
import { Camera, Plus } from "lucide-react";

interface MemoryVaultProps {
  photos: string[];
}

export function MemoryVault({ photos }: MemoryVaultProps) {
  return (
    <ScrapbookCard>
      <h2 className="flex items-center gap-2 font-[family-name:var(--font-serif)] font-bold text-xl text-ink mb-4">
        <Camera className="h-5 w-5 text-tea" />
        <span>Memory Vault — Family Photos</span>
      </h2>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {photos.map((item, i) => (
          <div
            key={i}
            className="aspect-square rounded-lg border-2 border-border-soft bg-surface-muted flex items-center justify-center text-sm font-bold text-ink hover:border-border hover:bg-surface transition-colors cursor-pointer"
          >
            {item}
          </div>
        ))}
        <button
          type="button"
          aria-label="Add photo"
          className="aspect-square rounded-lg border-3 border-dashed border-border-soft bg-surface-muted flex items-center justify-center text-ink-secondary hover:border-terracotta hover:text-terracotta transition-colors cursor-pointer"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>
      <p className="text-sm text-ink-secondary mt-3">
        Upload family photos for personalized memory puzzles. Drag photos
        here or click + to add.
      </p>
    </ScrapbookCard>
  );
}
