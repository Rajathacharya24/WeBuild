import { cn } from "@/lib/format";

export function PlaceCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("card-surface overflow-hidden", className)}>
      <div className="skeleton aspect-[4/3] rounded-none" />
      <div className="space-y-3 p-4">
        <div className="skeleton h-5 w-3/4" />
        <div className="skeleton h-3.5 w-1/2" />
        <div className="skeleton h-3.5 w-full" />
      </div>
    </div>
  );
}

export function PlanCardSkeleton() {
  return (
    <div className="card-surface overflow-hidden">
      <div className="skeleton aspect-[16/9] rounded-none" />
      <div className="space-y-3 p-5">
        <div className="skeleton h-5 w-2/3" />
        <div className="skeleton h-3.5 w-full" />
        <div className="skeleton h-10 w-full rounded-full" />
      </div>
    </div>
  );
}

export function TrendingSkeleton() {
  return (
    <div className="card-surface divide-y divide-line">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex items-center gap-4 p-4">
          <div className="skeleton h-12 w-12 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-1/2" />
            <div className="skeleton h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
