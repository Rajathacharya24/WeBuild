import { useMemo, useRef, useState, type FormEvent } from "react";
import { Filter, MapPin, Search, Sparkles, Star } from "lucide-react";
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
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "top-rated" | "coffee" | "parks" | "food"
  >("all");

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

  const filteredPlaces = useMemo(() => {
    const base = [...nearbyPlaces];

    const filtered =
      selectedFilter === "all"
        ? base
        : selectedFilter === "top-rated"
          ? base.sort((a, b) => b.rating - a.rating)
          : base.filter((place) => {
              const category = place.category.toLowerCase();

              if (selectedFilter === "coffee") {
                return category.includes("cafe") || category.includes("coffee");
              }

              if (selectedFilter === "parks") {
                return category.includes("park") || category.includes("nature");
              }

              if (selectedFilter === "food") {
                return category.includes("restaurant") || category.includes("food");
              }

              return true;
            });

    return filtered.slice(0, 4);
  }, [nearbyPlaces, selectedFilter]);

  return (
    <main id="main-content" className="min-h-screen pb-10">
      <section className="pt-4 sm:pt-6">
        <div className="shell">
          <div className="relative">
            <PlacesMap
              places={nearbyPlaces}
              userLocation={location.point}
              locationStatus={location.status}
              onRetryLocation={location.retry}
            />

            <div className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center px-3">
              <div className="pointer-events-auto w-full max-w-2xl rounded-full border border-white/80 bg-white/90 p-2 shadow-[0_18px_40px_rgba(15,23,42,0.18)] backdrop-blur-md">
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

                  <label className="flex flex-1 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2.5">
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
                    className="rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark disabled:opacity-70"
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

      <section className="shell mt-5">
        <div className="grid gap-3 sm:gap-4 lg:grid-cols-[1.7fr_0.7fr]">
          <div className="card-surface p-3 sm:p-5">
            <div className="flex items-start justify-between gap-2 sm:gap-3">
              <div>
                <p className="eyebrow text-[10px] sm:text-xs">Nearby picks</p>
                <h2 className="mt-1 text-lg font-bold text-ink sm:text-xl">Nearest places</h2>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-tint px-2 py-1 text-[10px] font-semibold text-primary-dark sm:px-2.5 sm:text-xs">
                <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5" aria-hidden="true" />
                Top rated
              </span>
            </div>

            <div className="mt-3 space-y-2 sm:mt-4 sm:space-y-3">
              {filteredPlaces.length > 0 ? (
                filteredPlaces.map((place) => (
                  <div
                    key={place.id}
                    className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/60 px-2.5 py-2 sm:gap-3 sm:rounded-2xl sm:px-3 sm:py-2.5"
                  >
                    <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary-tint text-primary-dark sm:h-11 sm:w-11 sm:rounded-xl">
                        <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-ink sm:text-sm">{place.name}</p>
                        <p className="truncate text-[10px] text-muted sm:text-xs">
                          {place.area} · {place.category}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1 text-[10px] font-semibold text-amber-500 sm:text-xs">
                      <Star className="h-3 w-3 fill-current sm:h-3.5 sm:w-3.5" aria-hidden="true" />
                      {place.rating.toFixed(1)}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted sm:text-sm">No places match this filter right now.</p>
              )}
            </div>
          </div>

          <aside className="card-surface p-3 sm:p-5">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-primary-tint text-primary-dark sm:h-8 sm:w-8">
                <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
              </span>
              <div>
                <p className="eyebrow text-[10px] sm:text-xs">Filter</p>
                <h3 className="hidden text-base font-bold text-ink sm:block">Your interest</h3>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5 sm:mt-4 sm:gap-2">
              {[
                { id: "all", label: "All" },
                { id: "top-rated", label: "Top rated" },
                { id: "coffee", label: "Coffee" },
                { id: "parks", label: "Parks" },
                { id: "food", label: "Food" }
              ].map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setSelectedFilter(filter.id as typeof selectedFilter)}
                  className={[
                    "rounded-full border px-2.5 py-1 text-[10px] font-semibold transition-colors sm:px-3 sm:py-1.5 sm:text-xs",
                    selectedFilter === filter.id
                      ? "border-primary bg-primary text-white"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:border-primary/40 hover:text-primary-dark"
                  ].join(" ")}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="mt-3 rounded-xl bg-primary-tint p-2.5 text-primary-dark sm:mt-5 sm:rounded-2xl sm:p-3">
              <p className="text-[11px] font-semibold sm:text-sm">Quick picks</p>
              <p className="mt-1 text-[10px] leading-relaxed text-primary-dark/80 sm:text-xs">
                Best nearby spots based on rating, distance and what you like most.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
