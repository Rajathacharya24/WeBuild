import { Link } from "react-router-dom";
import { MapPinned } from "lucide-react";
import { appConfig } from "@/config";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-line bg-primary-tint/40">
      <div className="shell grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-2xl bg-primary text-white">
              <MapPinned className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="text-lg font-bold tracking-tight text-ink">{appConfig.name}</span>
          </Link>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
            {appConfig.description}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-ink">Explore</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>
              <Link to="/#nearby" className="hover:text-primary-dark">
                Nearby places
              </Link>
            </li>
            <li>
              <Link to="/#weekend-plans" className="hover:text-primary-dark">
                Weekend plans
              </Link>
            </li>
            <li>
              <Link to="/#trending" className="hover:text-primary-dark">
                Trending this week
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-ink">Account</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>
              <Link to="/login" className="hover:text-primary-dark">
                Log in
              </Link>
            </li>
            <li>
              <Link to="/signup" className="hover:text-primary-dark">
                Create account
              </Link>
            </li>
            <li>
              <Link to="/profile" className="hover:text-primary-dark">
                My profile
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary/10">
        <div className="shell flex flex-col gap-2 py-4 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {appConfig.name}. Built for {appConfig.city}.
          </p>
          <p>
            Maps by OpenStreetMap. Place data is seeded and ready to swap for a live source.
          </p>
        </div>
      </div>
    </footer>
  );
}
