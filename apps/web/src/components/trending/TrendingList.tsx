import { Link } from "react-router-dom";
import { Flame, TrendingUp } from "lucide-react";
import type { TrendingPlace } from "@webuild/shared";
import { formatDistance } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { SafeImage } from "@/components/ui/SafeImage";
import { Stars } from "@/components/ui/Stars";

export function TrendingList({ places }: { places: TrendingPlace[] }) {
  return (
    <div className="card-surface overflow-hidden">
      <ol className="divide-y divide-line">
        {places.map((place) => (
          <li key={place.id}>
            <Link
              to={`/places/${place.slug}`}
              className="group flex items-center gap-3 p-4 transition-colors hover:bg-primary-tint/50 sm:gap-4"
              title={`Trend score this week: ${place.score}`}
            >
              <span className="w-6 shrink-0 text-center text-lg font-black text-primary/40 sm:text-xl">
                {place.rank}
              </span>
              <SafeImage
                src={place.imageUrl}
                alt={place.name}
                className="h-14 w-14 shrink-0 rounded-2xl sm:h-16 sm:w-16"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate text-sm font-bold text-ink group-hover:text-primary-dark sm:text-base">
                    {place.name}
                  </h3>
                  <Badge variant={place.rank <= 3 ? "dark" : "primary"}>
                    {place.rank === 1 ? (
                      <Flame className="h-3 w-3" aria-hidden="true" />
                    ) : (
                      <TrendingUp className="h-3 w-3" aria-hidden="true" />
                    )}
                    {place.trendLabel}
                  </Badge>
                </div>
                <p className="mt-0.5 truncate text-xs text-muted">
                  {place.category} · {place.area} · {formatDistance(place.distanceKm)}
                </p>
                <div className="mt-1">
                  <Stars value={place.rating} showValue count={place.ratingCount} />
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
