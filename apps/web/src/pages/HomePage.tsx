import { useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock3,
  RefreshCw,
  Search,
  Sparkles,
  Star,
  TrendingUp,
  Wallet
} from "lucide-react";
import type {
  AiSearchResponse,
  PlaceSummary,
  SearchMode,
  WeekendPlan
} from "@webuild/shared";
import { appConfig } from "@/config";
import { useAuth } from "@/context/AuthContext";
import { useAsync } from "@/hooks/useAsync";
import { useGeolocation } from "@/hooks/useGeolocation";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { cn } from "@/lib/format";
import { PlacesMap } from "@/components/map/PlacesMap";
import { PlaceCard } from "@/components/places/PlaceCard";
import { PlanCard } from "@/components/plans/PlanCard";
import { TrendingList } from "@/components/trending/TrendingList";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EmptyState, ErrorState } from "@/components/ui/States";
import {
  PlaceCardSkeleton,
  PlanCardSkeleton,
  TrendingSkeleton
} from "@/components/ui/Skeletons";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface SearchState {
  mode: SearchMode;
  query: string;
  places?: PlaceSummary[];
  ai?: AiSearchResponse;
}

const exampleSearches = [
  "quiet cafe to work from near Indiranagar",
  "cheap family weekend plan",
  "sunset walk near Cubbon Park"
];

export function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useGeolocation();
  const inputRef = useRef<HTMLInputElement>(null);

  const nearby = useAsync(
    () =>
      api.getPlaces({
        lat: location.point.lat,
        lng: location.point.lng,
        limit: 8
      }),
    [location.point.lat, location.point.lng, user?.id]
  );

  const plans = useAsync(() => api.getPlans(), [user?.id]);
  const trending = useAsync(
    () =>
      api.getTrending({
        lat: location.point.lat,
        lng: location.point.lng,
        limit: 8
      }),
    [location.point.lat, location.point.lng, user?.id]
  );

  const [mode, setMode] = useState<SearchMode>("search");
  const [term, setTerm] = useState("");
  const [searchState, setSearchState] = useState<SearchState | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [pendingPlanId, setPendingPlanId] = useState<string | null>(null);
  const [planError, setPlanError] = useState<string | null>(null);

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
        const ai = await api.aiSearch({
          query,
          lat: location.point.lat,
          lng: location.point.lng,
          limit: 6
        });
        setSearchState({ mode: "ai", query, ai });
      } else {
        const places = await api.getPlaces({
          q: query,
          lat: location.point.lat,
          lng: location.point.lng,
          limit: 12
        });
        setSearchState({ mode: "search", query, places });
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

  function applyExampleSearch(example: string) {
    setTerm(example);
    void runSearch("ai", example);
  }

  function clearSearch() {
    setSearchState(null);
    setSearchError(null);
    setTerm("");
    inputRef.current?.focus();
  }

  async function togglePlan(plan: WeekendPlan) {
    if (!user) {
      navigate("/login", { state: { next: "/" } });
      return;
    }

    setPendingPlanId(plan.id);
    setPlanError(null);

    try {
      const nextSaved = !plan.savedByMe;
      if (nextSaved) {
        await api.savePlan(plan.id);
      } else {
        await api.unsavePlan(plan.id);
      }
      plans.setData(
        plans.data?.map((item) =>
          item.id === plan.id
            ? {
                ...item,
                savedByMe: nextSaved,
                saveCount: Math.max(0, item.saveCount + (nextSaved ? 1 : -1))
              }
            : item
        ) ?? null
      );
    } catch (error) {
      setPlanError(getErrorMessage(error));
    } finally {
      setPendingPlanId(null);
    }
  }

  const nearbyPlaces = nearby.data ?? [];

  return (
    <main id="main-content" className="pb-10">
      <section className="pt-4 sm:pt-6">
        <div className="shell">
          <PlacesMap
            places={nearbyPlaces}
            userLocation={location.point}
            locationStatus={location.status}
            onRetryLocation={location.retry}
          />
        </div>
      </section>

      <section className="shell mt-5 sm:mt-7" aria-labelledby="find-heading">
        <div className="card-surface p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="eyebrow">Find your next stop</p>
              <h1
                id="find-heading"
                className="mt-1 text-2xl font-bold tracking-tight text-ink sm:text-3xl"
              >
                What are you in the mood for?
              </h1>
              <p className="mt-1 text-sm text-muted">
                Search by keyword or describe the kind of day you want.
              </p>
            </div>
            <Badge variant="primary" className="w-fit">
              <Star className="h-3 w-3" aria-hidden="true" />
              Curated for {appConfig.city}
            </Badge>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
            <label htmlFor="place-search" className="sr-only">
              Search places or describe a plan
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
                aria-hidden="true"
              />
              <input
                ref={inputRef}
                id="place-search"
                type="search"
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                placeholder={
                  mode === "ai"
                    ? "Describe your ideal day, budget or vibe…"
                    : "Search cafes, parks, Indiranagar, heritage…"
                }
                className="w-full rounded-full border border-line bg-white py-3.5 pl-12 pr-4 text-sm text-ink placeholder:text-muted/80 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
                autoComplete="off"
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div
                className="flex rounded-full bg-primary-tint p-1"
                role="group"
                aria-label="Choose search mode"
              >
                <button
                  type="button"
                  onClick={() => setMode("ai")}
                  aria-pressed={mode === "ai"}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors sm:flex-none",
                    mode === "ai"
                      ? "bg-white text-primary-dark shadow-sm"
                      : "text-primary-dark/70 hover:text-primary-dark"
                  )}
                >
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  AI Search
                </button>
                <button
                  type="button"
                  onClick={() => setMode("search")}
                  aria-pressed={mode === "search"}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors sm:flex-none",
                    mode === "search"
                      ? "bg-white text-primary-dark shadow-sm"
                      : "text-primary-dark/70 hover:text-primary-dark"
                  )}
                >
                  <Search className="h-4 w-4" aria-hidden="true" />
                  Search
                </button>
              </div>

              <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                <p className="hidden text-xs text-muted md:block">
                  {mode === "ai"
                    ? "AI ranks the best matches and explains why."
                    : "Keyword search across names, categories and areas."}
                </p>
                <Button type="submit" size="md" className="sm:min-w-32">
                  {searching ? "Searching…" : mode === "ai" ? "Ask AI" : "Search"}
                </Button>
              </div>
            </div>
          </form>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted">Try:</span>
            {exampleSearches.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => applyExampleSearch(example)}
                className="rounded-full border border-primary/15 bg-primary-tint/60 px-3 py-1.5 text-left text-[11px] font-medium text-primary-dark transition-colors hover:border-primary/40 hover:bg-primary-tint"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </section>

      {(searching || searchError || searchState) && (
        <section
          className="shell mt-8"
          aria-labelledby="search-results-heading"
          aria-live="polite"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Results</p>
              <h2
                id="search-results-heading"
                className="text-xl font-bold tracking-tight text-ink sm:text-2xl"
              >
                {searchState ? `“${searchState.query}”` : "Searching Bangalore"}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {searchState ? (
                <Badge variant={searchState.mode === "ai" ? "dark" : "primary"}>
                  {searchState.mode === "ai" ? "AI ranked" : "Keyword"}
                </Badge>
              ) : null}
              <Button variant="ghost" size="sm" onClick={clearSearch}>
                Clear
              </Button>
            </div>
          </div>

          {searching ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <PlaceCardSkeleton key={index} />
              ))}
            </div>
          ) : searchError ? (
            <ErrorState
              message={searchError}
              onRetry={() => void runSearch(mode, term)}
            />
          ) : searchState?.mode === "ai" && searchState.ai ? (
            <div className="space-y-4">
              <div
                className={cn(
                  "flex items-start gap-3 rounded-2xl border p-4 text-sm",
                  searchState.ai.source === "ai"
                    ? "border-primary/20 bg-primary-tint text-primary-dark"
                    : "border-amber-200 bg-amber-50 text-amber-800"
                )}
              >
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-semibold">
                    {searchState.ai.source === "ai" ? "AI search" : "Keyword fallback"}
                  </p>
                  <p className="mt-0.5 leading-relaxed">{searchState.ai.message}</p>
                </div>
              </div>

              {searchState.ai.results.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {searchState.ai.results.map((result) => (
                    <div key={result.place.id} className="flex flex-col gap-2">
                      <PlaceCard place={result.place} />
                      <p className="flex items-start gap-1.5 px-1 text-xs leading-relaxed text-muted">
                        <Sparkles
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary"
                          aria-hidden="true"
                        />
                        {result.reason}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No confident matches yet"
                  message="Try naming a neighbourhood, a category or a budget. For example: “cafe in Indiranagar under ₹500”."
                />
              )}
            </div>
          ) : searchState?.mode === "search" && searchState.places ? (
            searchState.places.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {searchState.places.map((place) => (
                  <PlaceCard key={place.id} place={place} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No places matched that search"
                message="Try a category like Cafe, Nature or Heritage, or a neighbourhood like Indiranagar or Malleshwaram."
              />
            )
          ) : null}
        </section>
      )}

      <section id="nearby" className="shell mt-12 scroll-mt-24 sm:mt-16" aria-labelledby="nearby-heading">
        <SectionHeader
          id="nearby-heading"
          eyebrow="Sorted by distance"
          title="Nearby places"
          description="The closest spots to you right now, from parks and cafes to heritage walks."
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => void nearby.reload()}
              loading={nearby.loading}
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              Refresh
            </Button>
          }
        />

        {nearby.loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <PlaceCardSkeleton key={index} />
            ))}
          </div>
        ) : nearby.error ? (
          <ErrorState message={nearby.error} onRetry={() => void nearby.reload()} />
        ) : nearbyPlaces.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {nearbyPlaces.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No nearby places found"
            message="Try moving the map or refreshing your location."
            action={
              <Button size="sm" variant="outline" onClick={location.retry}>
                Update location
              </Button>
            }
          />
        )}
      </section>

      <section
        id="weekend-plans"
        className="shell mt-12 scroll-mt-24 sm:mt-16"
        aria-labelledby="plans-heading"
      >
        <SectionHeader
          id="plans-heading"
          eyebrow="Ready-made routes"
          title="Weekend plans"
          description="Time-boxed Bangalore itineraries with realistic budgets. Save one and make it yours."
          action={
            <Badge variant="primary">
              <Clock3 className="h-3 w-3" aria-hidden="true" />
              2–8 hour plans
            </Badge>
          }
        />

        {planError ? (
          <p role="alert" className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {planError}
          </p>
        ) : null}

        {plans.loading ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <PlanCardSkeleton key={index} />
            ))}
          </div>
        ) : plans.error ? (
          <ErrorState message={plans.error} onRetry={() => void plans.reload()} />
        ) : plans.data && plans.data.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {plans.data.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                pending={pendingPlanId === plan.id}
                onToggle={(selected) => void togglePlan(selected)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No plans published yet"
            message="Weekend plans will appear here as soon as they are added."
          />
        )}
      </section>

      <section
        id="trending"
        className="shell mt-12 scroll-mt-24 sm:mt-16"
        aria-labelledby="trending-heading"
      >
        <SectionHeader
          id="trending-heading"
          eyebrow="Last 7 days"
          title="Trending in Bangalore"
          description="Ranked by fresh ratings, views and saves from the community this week."
        />

        <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
          <div>
            {trending.loading ? (
              <TrendingSkeleton />
            ) : trending.error ? (
              <ErrorState message={trending.error} onRetry={() => void trending.reload()} />
            ) : trending.data && trending.data.length > 0 ? (
              <TrendingList places={trending.data} />
            ) : (
              <EmptyState
                title="No trending activity yet"
                message="Rate, save or view a place to help it climb the weekly chart."
              />
            )}
          </div>

          <aside className="card-surface h-fit p-5">
            <div className="flex items-center gap-2 text-primary-dark">
              <TrendingUp className="h-4 w-4" aria-hidden="true" />
              <h3 className="text-sm font-bold">How trending works</h3>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted">
              We score activity from the last 7 days. Saves signal intent, ratings carry
              the most weight, and views give every place a baseline.
            </p>
            <div className="mt-4 space-y-2 rounded-2xl bg-primary-tint p-3 text-xs text-primary-dark">
              <p className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5">
                  <Star className="h-3.5 w-3.5" aria-hidden="true" /> Rating
                </span>
                <span className="font-bold">× 3</span>
              </p>
              <p className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5">
                  <Wallet className="h-3.5 w-3.5" aria-hidden="true" /> Save
                </span>
                <span className="font-bold">× 5</span>
              </p>
              <p className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5">
                  <Search className="h-3.5 w-3.5" aria-hidden="true" /> View
                </span>
                <span className="font-bold">× 1</span>
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
