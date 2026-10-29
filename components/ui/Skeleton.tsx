interface SkeletonProps {
  className?: string;
  /** Pulsar indica carregamento; em prévias estáticas, deixe desligado. */
  animated?: boolean;
}

export function Skeleton({ className = "", animated = true }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`rounded-sm bg-elevated/70 ${animated ? "animate-pulse motion-reduce:animate-none" : ""} ${className}`}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="border border-line bg-surface p-6">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-5 h-5 w-4/5" />
      <Skeleton className="mt-2 h-5 w-3/5" />
      <Skeleton className="mt-6 h-3 w-full" />
      <Skeleton className="mt-2 h-3 w-11/12" />
    </div>
  );
}
