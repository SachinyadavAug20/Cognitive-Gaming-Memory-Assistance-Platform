interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  steps: { label: string; icon: string }[];
  onStepClick?: (step: number) => void;
}

export function ProgressBar({
  currentStep,
  totalSteps,
  steps,
  onStepClick,
}: ProgressBarProps) {
  return (
    <nav aria-label="Form progress" className="mb-8">
      <p className="text-sm font-bold text-ink-secondary mb-3 text-center">
        Step {currentStep + 1} of {totalSteps}
      </p>

      {/* Desktop: horizontal */}
      <div className="hidden md:flex items-center justify-center gap-1">
        {steps.map((step, i) => {
          const isCompleted = i < currentStep;
          const isCurrent = i === currentStep;
          const isClickable = isCompleted && onStepClick;

          return (
            <div key={i} className="flex items-center">
              <button
                onClick={() => isClickable && onStepClick(i)}
                disabled={!isClickable}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all
                  ${isCurrent ? "bg-marigold text-white border-3 border-border" : ""}
                  ${isCompleted ? "bg-tea-light text-tea border-3 border-tea cursor-pointer hover:bg-tea/10" : ""}
                  ${!isCurrent && !isCompleted ? "bg-surface-muted text-ink-secondary/50 border-3 border-border-soft" : ""}
                `}
                aria-current={isCurrent ? "step" : undefined}
              >
                <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 border-current">
                  {isCompleted ? "✓" : i + 1}
                </span>
                <span className="hidden lg:inline">{step.label}</span>
              </button>

              {i < steps.length - 1 && (
                <div
                  className={`w-4 h-0.5 mx-1 ${
                    isCompleted ? "bg-tea" : "bg-border-soft"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile: simple */}
      <div className="md:hidden">
        <div className="flex gap-1.5 justify-center">
          {steps.map((step, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === currentStep
                  ? "w-8 bg-marigold"
                  : i < currentStep
                  ? "w-4 bg-tea"
                  : "w-4 bg-border-soft"
              }`}
            />
          ))}
        </div>
        <p className="text-center text-sm font-bold text-ink mt-2">
          <span className="text-2xl mr-1">{steps[currentStep].icon}</span>
          {steps[currentStep].label}
        </p>
      </div>
    </nav>
  );
}
