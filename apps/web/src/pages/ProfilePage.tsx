import { useState, type ReactNode } from "react";
import { Link, Navigate, useLocation, useSearchParams } from "react-router-dom";
import {
  Bookmark,
  CheckCircle2,
  MapPin,
  Star,
  UserRound
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useAsync } from "@/hooks/useAsync";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { formatDate, getInitials } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { buttonClasses } from "@/components/ui/Button";
import { PlanCard } from "@/components/plans/PlanCard";
import { SavedPlaceCard } from "@/components/places/SavedPlaceCard";
import { EmptyState, ErrorState, Spinner } from "@/components/ui/States";
import { Stars } from "@/components/ui/Stars";
import { SafeImage } from "@/components/ui/SafeImage";

type Tab = "ratings" | "plans" | "places";

const validTabs: Tab[] = ["ratings", "plans", "places"];

export function ProfilePage() {
  const { user, initializing } = useAuth();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const tab: Tab = validTabs.includes(tabParam as Tab) ? (tabParam as Tab) : "ratings";

  const profileQuery = useAsync(
    () => api.getProfile(),
    [user?.id],
    Boolean(user)
  );

  const [pendingPlanId, setPendingPlanId] = useState<string | null>(null);
  const [planError, setPlanError] = useState<string | null>(null);

  if (initializing) {
    return (
      <main id="main-content" className="shell py-16">
        <Spinner label="Loading your profile…" />
      </main>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ next: `${location.pathname}${location.search}` }}
        replace
      />
    );
  }

  function setTab(nextTab: Tab) {
    if (nextTab === "ratings") {
      setSearchParams({});
    } else {
      setSearchParams({ tab: nextTab });
    }
  }

  async function unsavePlan(planId: string) {
    setPendingPlanId(planId);
    setPlanError(null);
    try {
      await api.unsavePlan(planId);
      const profile = profileQuery.data;
      if (profile) {
        profileQuery.setData({
          ...profile,
          stats: {
            ...profile.stats,
            savedPlans: Math.max(0, profile.stats.savedPlans - 1)
          },
          savedPlans: profile.savedPlans.filter((plan) => plan.id !== planId)
        });
      }
    } catch (error) {
      setPlanError(getErrorMessage(error));
    } finally {
      setPendingPlanId(null);
    }
  }

  const profile = profileQuery.data;

  return (
    <main id="main-content" className="pb-12">
      <div className="shell pt-6 sm:pt-10">
        <div className="card-surface overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-primary-dark via-primary to-emerald-400 sm:h-28" />
          <div className="px-5 pb-6 sm:px-7">
            <div className="-mt-10 flex flex-col gap-4 sm:-mt-12 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-4">
                <span className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-3xl border-4 border-white bg-primary-tint text-xl font-black text-primary-dark shadow-card sm:h-24 sm:w-24">
                  {user.avatarUrl ? (
                    <SafeImage
                      src={user.avatarUrl}
                      alt={user.name}
                      className="h-full w-full"
                      loading="eager"
                    />
                  ) : (
                    getInitials(user.name)
                  )}
                </span>
                <div className="pb-1">
                  <p className="eyebrow">Explorer profile</p>
                  <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                    {user.name}
                  </h1>
                  <p className="text-sm text-muted">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 pb-1">
                <Badge variant="primary">
                  <UserRound className="h-3 w-3" aria-hidden="true" />
                  Member since {formatDate(user.createdAt)}
                </Badge>
                <Link to="/#nearby" className={buttonClasses("outline", "sm")}>
                  Explore places
                </Link>
              </div>
            </div>

            {profileQuery.loading ? (
              <div className="mt-7 grid gap-3 sm:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="skeleton h-24" />
                ))}
              </div>
            ) : profile ? (
              <div className="mt-7 grid gap-3 sm:grid-cols-4">
                <StatCard
                  icon={<Star className="h-4 w-4" />}
                  label="Ratings given"
                  value={profile.stats.ratings}
                />
                <StatCard
                  icon={<CheckCircle2 className="h-4 w-4" />}
                  label="Places visited"
                  value={profile.stats.placesVisited}
                />
                <StatCard
                  icon={<Bookmark className="h-4 w-4" />}
                  label="Saved plans"
                  value={profile.stats.savedPlans}
                />
                <StatCard
                  icon={<MapPin className="h-4 w-4" />}
                  label="Saved places"
                  value={profile.stats.savedPlaces}
                />
              </div>
            ) : null}
          </div>
        </div>

        {profileQuery.error ? (
          <div className="mt-6">
            <ErrorState
              message={profileQuery.error}
              onRetry={() => void profileQuery.reload()}
            />
          </div>
        ) : null}

        {profileQuery.loading ? (
          <div className="mt-8">
            <Spinner label="Loading your ratings, plans and places…" />
          </div>
        ) : profile ? (
          <div className="mt-8">
            <div
              className="no-scrollbar flex gap-2 overflow-x-auto rounded-full bg-primary-tint p-1"
              role="tablist"
              aria-label="Profile sections"
            >
              <TabButton
                active={tab === "ratings"}
                onClick={() => setTab("ratings")}
                controls="panel-ratings"
              >
                My ratings ({profile.stats.ratings})
              </TabButton>
              <TabButton
                active={tab === "plans"}
                onClick={() => setTab("plans")}
                controls="panel-plans"
              >
                Saved plans ({profile.stats.savedPlans})
              </TabButton>
              <TabButton
                active={tab === "places"}
                onClick={() => setTab("places")}
                controls="panel-places"
              >
                Saved places ({profile.stats.savedPlaces})
              </TabButton>
            </div>

            <div className="mt-6">
              {tab === "ratings" ? (
                <div
                  id="panel-ratings"
                  role="tabpanel"
                  aria-label="My ratings"
                  className="space-y-3"
                >
                  {profile.ratings.length > 0 ? (
                    profile.ratings.map((rating) => (
                      <article
                        key={rating.id}
                        className="card-surface flex flex-col gap-4 p-4 sm:flex-row sm:items-center"
                      >
                        <Link
                          to={`/places/${rating.place.slug}`}
                          className="flex min-w-0 flex-1 items-center gap-3"
                        >
                          <SafeImage
                            src={rating.place.imageUrl}
                            alt={rating.place.name}
                            className="h-20 w-24 shrink-0 rounded-2xl"
                          />
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary-dark">
                              {rating.place.category} · {rating.place.area}
                            </p>
                            <h2 className="truncate text-base font-bold text-ink hover:text-primary-dark">
                              {rating.place.name}
                            </h2>
                            <div className="mt-1 flex items-center gap-2">
                              <Stars value={rating.rating} showValue />
                              <span className="text-xs text-muted">
                                Updated {formatDate(rating.updatedAt)}
                              </span>
                            </div>
                          </div>
                        </Link>
                        {rating.comment ? (
                          <p className="max-w-sm text-sm leading-relaxed text-muted sm:border-l sm:border-line sm:pl-4">
                            “{rating.comment}”
                          </p>
                        ) : null}
                        <Link
                          to={`/places/${rating.place.slug}`}
                          className={buttonClasses("outline", "sm") + " w-fit shrink-0"}
                        >
                          View place
                        </Link>
                      </article>
                    ))
                  ) : (
                    <EmptyState
                      title="You have not rated anything yet"
                      message="Visit a place page and leave a rating to start building your Bangalore map."
                      icon={<Star className="h-8 w-8" />}
                      action={
                        <Link to="/#nearby" className={buttonClasses("primary", "md")}>
                          Find a place
                        </Link>
                      }
                    />
                  )}
                </div>
              ) : null}

              {tab === "plans" ? (
                <div id="panel-plans" role="tabpanel" aria-label="Saved plans">
                  {planError ? (
                    <p
                      role="alert"
                      className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700"
                    >
                      {planError}
                    </p>
                  ) : null}
                  {profile.savedPlans.length > 0 ? (
                    <div className="grid gap-5 md:grid-cols-2">
                      {profile.savedPlans.map((plan) => (
                        <PlanCard
                          key={plan.id}
                          plan={plan}
                          pending={pendingPlanId === plan.id}
                          onToggle={(selected) => void unsavePlan(selected.id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      title="No saved plans yet"
                      message="Save a ready-made weekend plan and it will appear here for quick access."
                      icon={<Bookmark className="h-8 w-8" />}
                      action={
                        <Link to="/#weekend-plans" className={buttonClasses("primary", "md")}>
                          Browse weekend plans
                        </Link>
                      }
                    />
                  )}
                </div>
              ) : null}

              {tab === "places" ? (
                <div
                  id="panel-places"
                  role="tabpanel"
                  aria-label="Saved places"
                  className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
                >
                  {profile.savedPlaces.length > 0 ? (
                    profile.savedPlaces.map((place) => (
                      <SavedPlaceCard key={place.id} place={place} />
                    ))
                  ) : (
                    <div className="sm:col-span-2 lg:col-span-3">
                      <EmptyState
                        title="No saved places yet"
                        message="Tap “Save place” on any place page to keep it handy."
                        icon={<MapPin className="h-8 w-8" />}
                        action={
                          <Link to="/#nearby" className={buttonClasses("primary", "md")}>
                            Explore nearby
                          </Link>
                        }
                      />
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-primary/10 bg-primary-tint/50 p-4">
      <div className="flex items-center gap-1.5 text-primary-dark">
        <span aria-hidden="true">{icon}</span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em]">{label}</span>
      </div>
      <p className="mt-1 text-2xl font-black tracking-tight text-ink">{value}</p>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  controls,
  children
}: {
  active: boolean;
  onClick: () => void;
  controls: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      aria-controls={controls}
      onClick={onClick}
      className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
        active
          ? "bg-white text-primary-dark shadow-sm"
          : "text-primary-dark/70 hover:text-primary-dark"
      }`}
    >
      {children}
    </button>
  );
}
