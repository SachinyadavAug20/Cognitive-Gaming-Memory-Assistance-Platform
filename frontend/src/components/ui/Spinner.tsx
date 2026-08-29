interface SpinnerProps {
  label?: string;
  className?: string;
}

export function Spinner({ label = "Loading…", className = "" }: SpinnerProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="w-10 h-10 border-4 border-marigold border-t-transparent rounded-full animate-spin" aria-label={label} role="status" />
    </div>
  );
}
