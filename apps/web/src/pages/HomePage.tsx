import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { ArrowRight, Filter, MapPin, Search, Sparkles, Star } from "lucide-react";
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
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

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

  const filteredPlaces = useMemo(() => [...nearbyPlaces].slice(0, 4), [nearbyPlaces]);

  useEffect(() => {
    if (!filteredPlaces.length) {
      setSelectedPlaceId(null);
      return;
    }

    if (!selectedPlaceId || !filteredPlaces.some((place) => place.id === selectedPlaceId)) {
      setSelectedPlaceId(filteredPlaces[0].id);
    }
  }, [filteredPlaces, selectedPlaceId]);

  const selectedPlace =
    filteredPlaces.find((place) => place.id === selectedPlaceId) ?? filteredPlaces[0] ?? null;

  const routeSteps = useMemo(() => {
    if (!selectedPlace) {
      return [];
    }

    const area = selectedPlace.area;

    return [
      {
        title: "From your location",
        subtitle: "You are here",
        detail: "Start from your current spot and head toward the nearest stop."
      },
      {
        title: "Metro / rapid transit",
        subtitle: "Best route",
        detail: `Take the fastest route toward ${area} to avoid traffic and save time.`
      },
      {
        title: "Short walk",
        subtitle: "2 min walk",
        detail: `Continue on foot to ${selectedPlace.name} and get closer to your destination.`
      },
      {
        title: "Arrive at destination",
        subtitle: "You are there",
        detail: `Enjoy your visit to ${selectedPlace.name}.`
      }
    ];
  }, [selectedPlace]);

  return (
    <main id="main-content" className="min-h-screen pb-10">
      <section className="pt-4 sm:pt-6">
        <div className="shell">
          <div className="fade-in-up mb-6 rounded-[28px] border border-white/70 bg-white/70 p-5 shadow-card backdrop-blur-md sm:p-7">
            <p className="eyebrow">Bangalore explorer</p>
            <h1 className="hero-title mt-2 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
              Discover beautiful places with live route style tracking.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
              Search by vibe, pick your destination, and follow a classy step-by-step journey experience.
            </p>
            <div className="mt-4">
              <button
                type="button"
                onClick={() => inputRef.current?.focus()}
                className="btn-gradient rounded-full px-5 py-2.5 text-sm font-semibold"
              >
                Start exploring now
              </button>
            </div>
          </div>

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

      <section className="shell mt-5">
        <div className="grid gap-4 lg:grid-cols-[1.8fr_0.9fr]">
          <div className="relative overflow-hidden rounded-[28px] border border-white/70 bg-gradient-to-br from-white/85 via-primary-tint/60 to-[#ddf2e6] p-3 shadow-soft backdrop-blur-lg sm:p-5">
            <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-r from-primary/10 via-primary-tint to-transparent" />

            <div className="relative flex items-start justify-between gap-2 sm:gap-3">
              <div>
                <p className="eyebrow text-[10px] sm:text-xs">Nearby picks</p>
                <h2 className="mt-1 text-lg font-black text-ink sm:text-2xl">Nearest places</h2>
              </div>

              <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700 shadow-sm sm:px-2.5 sm:text-xs">
                <Star className="h-3 w-3 fill-current sm:h-3.5 sm:w-3.5" aria-hidden="true" />
                Top rated
              </span>
            </div>

            <div className="relative mt-4 space-y-2.5 sm:mt-5 sm:space-y-3">
              {filteredPlaces.length > 0 ? (
                filteredPlaces.map((place) => (
                  <button
                    type="button"
                    key={place.id}
                    onClick={() => setSelectedPlaceId(place.id)}
                    className={[
                      "group flex w-full items-center justify-between gap-2 rounded-2xl border px-2.5 py-2.5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card sm:gap-3 sm:px-3 sm:py-3",
                      selectedPlace?.id === place.id
                        ? "border-primary/30 bg-primary-tint/70 shadow-card"
                        : "border-slate-200/80 bg-white/90 hover:border-primary/25"
                    ].join(" ")}
                  >
                    <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary-tint to-emerald-100 text-primary-dark ring-4 ring-primary/5 sm:h-12 sm:w-12">
                        <MapPin className="h-4 w-4 sm:h-4.5 sm:w-4.5" aria-hidden="true" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-bold text-ink sm:text-base">{place.name}</p>
                        </div>
                        <p className="mt-0.5 truncate text-[10px] text-muted sm:text-xs">
                          {place.area} · {place.category}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-600 sm:text-xs">
                      <Star className="h-3 w-3 fill-current" aria-hidden="true" />
                      {place.rating.toFixed(1)}
                    </div>
                  </button>
                ))
              ) : (
                <p className="rounded-2xl border border-dashed border-primary/15 bg-primary-tint/40 px-3 py-4 text-xs text-muted sm:text-sm">
                  No places match this filter right now.
                </p>
              )}
            </div>
          </div>

          <aside className="rounded-[28px] border border-white/70 bg-white/80 p-3 shadow-card backdrop-blur-lg sm:p-4">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-primary-tint text-primary-dark">
                  <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="eyebrow text-[10px] sm:text-xs">Live route</p>
                  <h3 className="text-base font-black text-ink sm:text-lg">Track your trip</h3>
                </div>
              </div>

              <div className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">
                On the way
              </div>
            </div>

            {selectedPlace ? (
              <>
                <div className="mt-4 rounded-2xl border border-primary/10 bg-gradient-to-br from-primary-tint to-emerald-50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary-dark/70">Destination</p>
                      <p className="mt-2 text-sm font-black text-ink sm:text-base">{selectedPlace.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-muted">ETA</p>
                      <p className="text-sm font-black text-primary-dark">12 min</p>
                    </div>
                  </div>
                  <p className="mt-1 text-[10px] text-muted sm:text-xs">{selectedPlace.area} · {selectedPlace.category}</p>
                </div>

                <div className="mt-4 rounded-2xl bg-slate-50 p-3">
                  <div className="mb-3 flex items-center justify-between text-[10px] font-semibold text-muted sm:text-[11px]">
                    <span>Route progress</span>
                    <span>65%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full w-[65%] rounded-full bg-gradient-to-r from-primary to-emerald-500" />
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {routeSteps.map((step, index) => {
                    const isActive = index === 1;
                    const isComplete = index < 2;

                    return (
                      <div key={step.title} className="relative flex gap-3">
                        {index < routeSteps.length - 1 ? (
                          <div className="absolute left-[11px] top-6 h-[calc(100%-10px)] w-px bg-slate-200" />
                        ) : null}

                        <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white shadow-sm" style={{backgroundColor: isComplete ? "#16a34a" : isActive ? "#d1fae5" : "#e2e8f0", color: isComplete || isActive ? "white" : "#64748b"}}>
                          {isComplete ? "✓" : index + 1}
                        </div>

                        <div className={[
                          "min-w-0 flex-1 rounded-2xl border p-2.5",
                          isActive
                            ? "border-primary/30 bg-primary-tint/70"
                            : isComplete
                              ? "border-emerald-100 bg-emerald-50/60"
                              : "border-slate-200 bg-slate-50/60"
                        ].join(" ")}>
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-[11px] font-bold text-ink sm:text-xs">{step.title}</p>
                            <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted">
                              {step.subtitle}
                            </span>
                          </div>
                          <p className="mt-1 text-[10px] leading-relaxed text-muted sm:text-[11px]">{step.detail}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 rounded-2xl border border-dashed border-primary/15 bg-white p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary-dark/80 sm:text-[11px]">
                      Next suggestion
                    </p>
                    <ArrowRight className="h-3.5 w-3.5 text-primary-dark" aria-hidden="true" />
                  </div>
                  <p className="mt-2 text-[10px] leading-relaxed text-muted sm:text-xs">
                    After this stop, explore a nearby cafe or park to keep the evening flowing smooth and easy.
                  </p>
                </div>
              </>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-primary/15 bg-primary-tint/60 p-3 text-[10px] text-muted sm:text-xs">
                Choose a nearby place to see your live trip route.
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}
