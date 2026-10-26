import { Link } from "react-router-dom";
import { Bookmark, MapPin } from "lucide-react";
import type { PlaceSummary } from "@webuild/shared";
import { formatDistance } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { SafeImage } from "@/components/ui/SafeImage";
import { Stars } from "@/components/ui/Stars";

export function PlaceCard({ place }: { place: PlaceSummary }) {
  return (
    <article className="group card-surface h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-soft">
      <Link to={`/places/${place.slug}`} className="flex h-full flex-col">
        <div className="relative aspect-[4/3] overflow-hidden bg-primary-tint">
          <SafeImage
            src={place.imageUrl}
            alt={place.name}
            className="h-full w-full transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
            <Badge variant="outline" className="bg-white/95 backdrop-blur">
              {place.category}
            </Badge>
            {place.savedByMe ? (
              <span
                className="grid h-7 w-7 place-items-center rounded-full bg-primary-dark text-white shadow-sm"
                title="Saved place"
              >
                <Bookmark className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                <span className="sr-only">Saved place</span>
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base font-bold leading-snug text-ink group-hover:text-primary-dark">
              {place.name}
            </h3>
            <Stars value={place.rating} showValue count={place.ratingCount} />
          </div>

          <p className="mt-1.5 flex items-center gap-1 text-xs text-muted">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">
              {place.area} · {formatDistance(place.distanceKm)}
            </span>
          </p>

          <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-muted">
            {place.description}
          </p>
        </div>
      </Link>
    </article>
  );
}
