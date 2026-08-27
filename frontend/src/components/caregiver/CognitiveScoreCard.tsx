import type { ScoreData } from "@/types";
import { ScrapbookCard } from "@/components/ui/ScrapbookCard";
import { ScoreBar } from "@/components/caregiver/ScoreBar";

interface CognitiveScoreCardProps {
  scores: ScoreData;
}

export function CognitiveScoreCard({ scores }: CognitiveScoreCardProps) {
  return (
    <ScrapbookCard>
      <h2 className="font-[family-name:var(--font-serif)] font-bold text-xl text-ink mb-4">
        Current Cognitive Scores
      </h2>
      <div className="grid md:grid-cols-3 gap-6">
        <ScoreBar
          label="Visual Memory"
          value={scores.memory}
          color="bg-tea"
        />
        <ScoreBar
          label="Spatial Orientation"
          value={scores.spatial}
          color="bg-terracotta"
        />
        <ScoreBar
          label="Reaction Time"
          value={scores.reaction}
          color="bg-marigold"
        />
      </div>
    </ScrapbookCard>
  );
}
