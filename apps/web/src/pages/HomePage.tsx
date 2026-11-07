import { useRef, useState, type FormEvent } from "react";
import { Flame, Search } from "lucide-react";
import { useAsync } from "@/hooks/useAsync";
import { useGeolocation } from "@/hooks/useGeolocation";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { PlacesMap } from "@/components/map/PlacesMap";
import { TrendingList } from "@/components/trending/TrendingList";

export function HomePage() {
  const location = useGeolocation();
  const inputRef = useRef<HTMLInputElement>(null);
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

  const trending = useAsync(() => api.getTrending({ limit: 8 }), []);

  async function runSearch() {
    const query = term.trim();

    if (query.length < 2) {
      setSearchError("Type at least 2 characters to search.");
      inputRef.current?.focus();
      return;
    }

    setSearching(true);
    setSearchError(null);

    try {
      await api.getPlaces({
        q: query,
        lat: location.point.lat,
        lng: location.point.lng,
        limit: 12
      });
    } catch (error) {
      setSearchError(getErrorMessage(error));
    } finally {
      setSearching(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void runSearch();
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
                  <label className="flex flex-1 items-center gap-2 rounded-full border border-primary/15 bg-white px-3 py-2.5 shadow-inner">
                    <Search className="h-4 w-4 text-muted" aria-hidden="true" />
                    <input
                      ref={inputRef}
                      type="search"
                      value={term}
                      onChange={(event) => setTerm(event.target.value)}
                      placeholder="Search cafes, parks, Indiranagar…"
                      autoComplete="off"
                      className="w-full border-0 bg-transparent text-sm text-ink placeholder:text-muted/80 focus:outline-none"
                    />
                  </label>

                  <button
                    type="submit"
                    className="btn-gradient rounded-full px-4 py-2.5 text-sm font-semibold disabled:opacity-70"
                    disabled={searching}
                  >
                    {searching ? "..." : "Search"}
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

      <section id="trending" className="shell mt-8">
        <div className="fade-in-up">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="eyebrow flex items-center gap-1.5">
                <Flame className="h-3.5 w-3.5" aria-hidden="true" />
                Trending this week
              </p>
              <h2 className="mt-1 text-xl font-black text-ink sm:text-2xl">
                What everybody is checking out
              </h2>
            </div>
          </div>

          {trending.data && trending.data.length > 0 ? (
            <div className="mt-4">
              <TrendingList places={trending.data} />
            </div>
          ) : trending.loading ? (
            <p className="mt-4 rounded-2xl border border-dashed border-primary/15 bg-primary-tint/40 px-4 py-6 text-center text-sm text-muted">
              Loading trending places…
            </p>
          ) : trending.error ? (
            <p className="mt-4 rounded-2xl border border-dashed border-primary/15 bg-primary-tint/40 px-4 py-6 text-center text-sm text-muted">
              {trending.error}
            </p>
          ) : (
            <p className="mt-4 rounded-2xl border border-dashed border-primary/15 bg-primary-tint/40 px-4 py-6 text-center text-sm text-muted">
              No trending places yet this week.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
