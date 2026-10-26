import { Link } from "react-router-dom";
import type { PlaceRef } from "@webuild/shared";
import { SafeImage } from "@/components/ui/SafeImage";
import { Stars } from "@/components/ui/Stars";

export function SavedPlaceCard({ place }: { place: PlaceRef }) {
  return (
    <Link
      to={`/places/${place.slug}`}
      className="group card-surface flex items-center gap-3 overflow-hidden p-3 transition-colors hover:border-primary/30"
    >
      <SafeImage
        src={place.imageUrl}
        alt={place.name}
        className="h-20 w-24 shrink-0 rounded-2xl"
      />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary-dark">
          {place.category}
        </p>
        <h3 className="truncate text-sm font-bold text-ink group-hover:text-primary-dark">
          {place.name}
        </h3>
        <p className="truncate text-xs text-muted">{place.area}</p>
        <div className="mt-1">
          <Stars value={place.rating} showValue count={place.ratingCount} />
        </div>
      </div>
    </Link>
  );
}
