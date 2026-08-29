interface StepHeaderProps {
  title: string;
  subtitle?: string;
}

export function StepHeader({ title, subtitle }: StepHeaderProps) {
  return (
    <div className="text-center space-y-1">
      <h2 className="font-[family-name:var(--font-serif)] text-2xl md:text-3xl font-bold text-ink">
        {title}
      </h2>
      {subtitle && (
        <p className="text-ink-secondary text-base">{subtitle}</p>
      )}
    </div>
  );
}
