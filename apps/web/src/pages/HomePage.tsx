import { useRef, useState, type FormEvent } from "react";
import { Search, Sparkles } from "lucide-react";
import type { SearchMode } from "@webuild/shared";
import { useAsync } from "@/hooks/useAsync";
import { useGeolocation } from "@/hooks/useGeolocation";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { PlacesMap } from "@/components/map/PlacesMap";

export function HomePage() {
  const location = useGeolocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<SearchMode>("search");
  const [term, setTerm] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const nearby = useAsync(
    () =>
      api.getPlaces({
        lat: location.point.lat,
        lng: location.point.lng,
        limit: 8
      }),
    [location.point.lat, location.point.lng]
  );

  async function runSearch(nextMode: SearchMode, override?: string) {
    const query = (override ?? term).trim();
    setMode(nextMode);

    if (query.length < 2) {
      setSearchError("Type at least 2 characters to search.");
      inputRef.current?.focus();
      return;
    }

    setSearching(true);
    setSearchError(null);

    try {
      if (nextMode === "ai") {
        await api.aiSearch({
          query,
          lat: location.point.lat,
          lng: location.point.lng,
          limit: 6
        });
      } else {
        await api.getPlaces({
          q: query,
          lat: location.point.lat,
          lng: location.point.lng,
          limit: 12
        });
      }
    } catch (error) {
      setSearchError(getErrorMessage(error));
    } finally {
      setSearching(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void runSearch(mode);
  }

  const nearbyPlaces = nearby.data ?? [];

  return (
    <main id="main-content" className="min-h-screen pb-10">
      <section className="pt-4 sm:pt-6">
        <div className="shell">
          <div className="relative fade-in-up">
            <PlacesMap
              places={nearbyPlaces}
              userLocation={location.point}
              locationStatus={location.status}
              onRetryLocation={location.retry}
            />

            <div className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center px-3">
              <div className="pointer-events-auto w-full max-w-2xl rounded-full border border-white/85 bg-white/85 p-2 shadow-card backdrop-blur-xl">
                <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="flex rounded-full bg-primary-tint p-1">
                    <button
                      type="button"
                      onClick={() => setMode("search")}
                      aria-pressed={mode === "search"}
                      className={[
                        "rounded-full px-3 py-2 text-xs font-semibold transition-colors sm:px-4",
                        mode === "search"
                          ? "bg-white text-primary-dark shadow-sm"
                          : "text-primary-dark/70 hover:text-primary-dark"
                      ].join(" ")}
                    >
                      Normal
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode("ai")}
                      aria-pressed={mode === "ai"}
                      className={[
                        "rounded-full px-3 py-2 text-xs font-semibold transition-colors sm:px-4",
                        mode === "ai"
                          ? "bg-white text-primary-dark shadow-sm"
                          : "text-primary-dark/70 hover:text-primary-dark"
                      ].join(" ")}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                        AI
                      </span>
                    </button>
                  </div>

                  <label className="flex flex-1 items-center gap-2 rounded-full border border-primary/15 bg-white px-3 py-2.5 shadow-inner">
                    <Search className="h-4 w-4 text-muted" aria-hidden="true" />
                    <input
                      ref={inputRef}
                      type="search"
                      value={term}
                      onChange={(event) => setTerm(event.target.value)}
                      placeholder={
                        mode === "ai"
                          ? "Describe your ideal day, vibe, budget…"
                          : "Search cafes, parks, Indiranagar…"
                      }
                      autoComplete="off"
                      className="w-full border-0 bg-transparent text-sm text-ink placeholder:text-muted/80 focus:outline-none"
                    />
                  </label>

                  <button
                    type="submit"
                    className="btn-gradient rounded-full px-4 py-2.5 text-sm font-semibold disabled:opacity-70"
                    disabled={searching}
                  >
                    {searching ? "..." : mode === "ai" ? "Ask AI" : "Search"}
                  </button>
                </form>

                {searchError ? (
                  <p className="mt-2 px-2 text-xs text-red-600">{searchError}</p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
