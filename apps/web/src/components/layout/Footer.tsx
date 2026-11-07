import { Link } from "react-router-dom";
import { Instagram, Linkedin, MapPinned, Twitter } from "lucide-react";
import { appConfig } from "@/config";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-white/60 bg-white/55 backdrop-blur-md">
      <div className="shell grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-to-br from-primary to-[#57c78a] text-white shadow-glow">
              <MapPinned className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="text-lg font-display font-bold tracking-tight text-ink">{appConfig.name}</span>
          </Link>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
            {appConfig.description}
          </p>
          <div className="mt-4 flex items-center gap-2">
            {[Instagram, Twitter, Linkedin].map((Icon, index) => (
              <a
                key={index}
                href="#"
                aria-label="Social link"
                className="grid h-9 w-9 place-items-center rounded-full border border-primary/20 bg-white/85 text-primary-dark transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:bg-primary-tint/70"
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-ink">Explore</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>
              <Link to="/" className="hover:text-primary-dark">
                Explore map
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
      <div className="border-t border-white/60">
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
