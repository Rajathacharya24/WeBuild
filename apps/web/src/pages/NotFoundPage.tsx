import { Link } from "react-router-dom";
import { Compass, MapPin } from "lucide-react";
import { buttonClasses } from "@/components/ui/Button";

export function NotFoundPage() {
  return (
    <main id="main-content" className="shell flex min-h-[60vh] items-center justify-center py-12">
      <div className="max-w-lg text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-primary-tint text-primary-dark">
          <Compass className="h-8 w-8" aria-hidden="true" />
        </span>
        <p className="eyebrow mt-6">404 · Off the map</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink">
          This page is not in Bangalore.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          The link may be old, or the place may have moved. Head back to the map and
          start exploring again.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/" className={buttonClasses("primary", "md")}>
            <MapPin className="h-4 w-4" aria-hidden="true" />
            Back to the map
          </Link>
          <Link to="/#trending" className={buttonClasses("outline", "md")}>
            See what is trending
          </Link>
        </div>
      </div>
    </main>
  );
}
