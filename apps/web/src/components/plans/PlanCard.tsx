import { Link } from "react-router-dom";
import { Bookmark, BookmarkCheck, Clock, MapPin, Wallet } from "lucide-react";
import type { WeekendPlan } from "@webuild/shared";
import { formatBudget, formatDuration } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SafeImage } from "@/components/ui/SafeImage";

interface PlanCardProps {
  plan: WeekendPlan;
  pending: boolean;
  onToggle: (plan: WeekendPlan) => void;
}

export function PlanCard({ plan, pending, onToggle }: PlanCardProps) {
  return (
    <article className="card-surface flex h-full flex-col overflow-hidden">
      <div className="relative aspect-[16/9] overflow-hidden bg-primary-tint">
        <SafeImage src={plan.imageUrl} alt={plan.title} className="h-full w-full" />
        <div className="absolute inset-x-3 top-3 flex flex-wrap gap-2">
          <Badge variant="outline" className="bg-white/95 backdrop-blur">
            <Clock className="h-3 w-3" aria-hidden="true" />
            {formatDuration(plan.durationHours)}
          </Badge>
          <Badge variant="outline" className="bg-white/95 backdrop-blur">
            <Wallet className="h-3 w-3" aria-hidden="true" />
            {formatBudget(plan.budgetMin, plan.budgetMax)}
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold leading-snug text-ink">{plan.title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">{plan.description}</p>

        <ol className="mt-4 space-y-3">
          {plan.stops.map((stop, index) => (
            <li key={stop.id} className="flex gap-3">
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary-tint text-[11px] font-bold text-primary-dark">
                {index + 1}
              </span>
              <div className="min-w-0">
                {stop.placeSlug ? (
                  <Link
                    to={`/places/${stop.placeSlug}`}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-ink hover:text-primary-dark"
                  >
                    <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                    {stop.name}
                  </Link>
                ) : (
                  <p className="text-sm font-semibold text-ink">{stop.name}</p>
                )}
                {stop.note ? (
                  <p className="mt-0.5 text-xs leading-relaxed text-muted">{stop.note}</p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-auto pt-5">
          <Button
            type="button"
            variant={plan.savedByMe ? "secondary" : "primary"}
            fullWidth
            loading={pending}
            onClick={() => onToggle(plan)}
            aria-pressed={plan.savedByMe}
          >
            {plan.savedByMe ? (
              <BookmarkCheck className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Bookmark className="h-4 w-4" aria-hidden="true" />
            )}
            {plan.savedByMe ? "Saved to your plans" : "Save this plan"}
          </Button>
          {plan.saveCount > 0 ? (
            <p className="mt-2 text-center text-[11px] text-muted">
              Saved by {plan.saveCount} {plan.saveCount === 1 ? "person" : "people"}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
