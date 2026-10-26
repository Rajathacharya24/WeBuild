import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Compass,
  MapPin,
  Navigation,
  Star,
  Wallet
} from "lucide-react";
import type { PlaceDetail } from "@webuild/shared";
import { useAuth } from "@/context/AuthContext";
import { useAsync } from "@/hooks/useAsync";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { formatDate, getInitials, priceLevelLabel } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonClasses } from "@/components/ui/Button";
import { SafeImage } from "@/components/ui/SafeImage";
import { Stars, RatingInput } from "@/components/ui/Stars";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { MiniMap } from "@/components/map/MiniMap";

export function PlaceDetailsPage() {
  const { slug = "" } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const placeQuery = useAsync(
    () => api.getPlace(slug),
    [slug, user?.id],
    slug.length > 0
  );

  if (placeQuery.loading) {
    return <PlaceDetailsSkeleton />;
  }

  if (placeQuery.error || !placeQuery.data) {
    return (
      <main id="main-content" className="shell py-10">
        <ErrorState
          message={placeQuery.error ?? "This place could not be loaded."}
          onRetry={() => void placeQuery.reload()}
        />
        <div className="mt-4 text-center">
          <Link to="/#nearby" className="text-sm font-semibold text-primary-dark hover:underline">
            Back to nearby places
          </Link>
        </div>
      </main>
    );
  }

  const place = placeQuery.data;

  function updatePlace(updated: PlaceDetail) {
    placeQuery.setData(updated);
  }

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`;

  return (
    <main id="main-content" className="pb-12">
      <div className="shell pt-5 sm:pt-8">
        <Link
          to="/#nearby"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition-colors hover:text-primary-dark"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to places
        </Link>

        <header className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="primary">{place.category}</Badge>
              <Badge variant="muted">
                <MapPin className="h-3 w-3" aria-hidden="true" />
                {place.area}
              </Badge>
              {place.savedByMe ? (
                <Badge variant="dark">
                  <BookmarkCheck className="h-3 w-3" aria-hidden="true" />
                  Saved
                </Badge>
              ) : null}
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              {place.name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <Stars value={place.rating} size="md" showValue count={place.ratingCount} />
              <span className="text-sm text-muted">{place.address}</span>
            </div>
          </div>
        </header>

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="order-2 space-y-10 lg:order-1">
            <Gallery place={place} />

            <section aria-labelledby="about-heading">
              <h2 id="about-heading" className="text-xl font-bold tracking-tight text-ink">
                About this place
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted">{place.description}</p>
              <dl className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-primary-tint/60 p-4">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary-dark">
                    Category
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-ink">{place.category}</dd>
                </div>
                <div className="rounded-2xl bg-primary-tint/60 p-4">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary-dark">
                    Neighbourhood
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-ink">{place.area}</dd>
                </div>
                <div className="rounded-2xl bg-primary-tint/60 p-4">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary-dark">
                    Price
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-ink">
                    {priceLevelLabel(place.priceLevel)}
                  </dd>
                </div>
              </dl>
            </section>

            <section aria-labelledby="location-heading">
              <h2 id="location-heading" className="text-xl font-bold tracking-tight text-ink">
                Location
              </h2>
              <p className="mt-2 text-sm text-muted">{place.address}</p>
              <div className="mt-3">
                <MiniMap place={place} />
              </div>
            </section>

            <section aria-labelledby="reviews-heading">
              <div className="flex items-center justify-between gap-3">
                <h2 id="reviews-heading" className="text-xl font-bold tracking-tight text-ink">
                  Reviews
                  <span className="ml-2 text-sm font-medium text-muted">
                    {place.reviews.length}
                  </span>
                </h2>
                <Stars value={place.rating} showValue count={place.ratingCount} />
              </div>

              {place.reviews.length > 0 ? (
                <ul className="mt-4 space-y-3">
                  {place.reviews.map((review) => (
                    <li
                      key={review.id}
                      className={`rounded-3xl border p-4 ${
                        review.isMine
                          ? "border-primary/25 bg-primary-tint/40"
                          : "border-line bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span className="grid h-9 w-9 place-items-center rounded-full bg-primary-tint text-xs font-bold text-primary-dark">
                            {getInitials(review.authorName)}
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-ink">
                              {review.authorName}
                              {review.isMine ? (
                                <span className="ml-1.5 text-xs font-medium text-primary-dark">
                                  (you)
                                </span>
                              ) : null}
                            </p>
                            <p className="text-xs text-muted">{formatDate(review.createdAt)}</p>
                          </div>
                        </div>
                        <Stars value={review.rating} />
                      </div>
                      {review.comment ? (
                        <p className="mt-3 text-sm leading-relaxed text-muted">{review.comment}</p>
                      ) : (
                        <p className="mt-3 text-xs italic text-muted">No comment added.</p>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-4">
                  <EmptyState
                    title="No reviews yet"
                    message="Be the first to rate this place and help other explorers."
                    icon={<Star className="h-8 w-8" />}
                  />
                </div>
              )}
            </section>

            <section aria-labelledby="rate-heading" id="rate">
              <h2 id="rate-heading" className="text-xl font-bold tracking-tight text-ink">
                {place.myRating ? "Update your rating" : "Rate this place"}
              </h2>
              <div className="mt-3">
                {user ? (
                  <RatePlaceForm
                    key={place.id}
                    place={place}
                    onUpdated={updatePlace}
                  />
                ) : (
                  <div className="rounded-3xl border border-primary/15 bg-primary-tint/50 p-5">
                    <p className="text-sm text-muted">
                      Log in to rate {place.name} and keep track of places you have visited.
                    </p>
                    <Link
                      to="/login"
                      state={{ next: `/places/${place.slug}` }}
                      className={buttonClasses("primary", "md") + " mt-3"}
                    >
                      Log in to rate
                    </Link>
                  </div>
                )}
              </div>
            </section>
          </div>

          <aside className="order-1 h-fit lg:order-2 lg:sticky lg:top-24">
            <div className="card-surface p-5">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-4xl font-black tracking-tight text-ink">
                    {place.rating > 0 ? place.rating.toFixed(1) : "New"}
                  </p>
                  <Stars value={place.rating} showValue count={place.ratingCount} />
                </div>
                <Badge variant="primary">{place.category}</Badge>
              </div>

              <div className="mt-5 space-y-3 text-sm">
                <p className="flex items-start gap-2 text-muted">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  {place.address}
                </p>
                <p className="flex items-start gap-2 text-muted">
                  <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  {priceLevelLabel(place.priceLevel)}
                </p>
                <p className="flex items-start gap-2 text-muted">
                  <Compass className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  {place.area}, {place.category}
                </p>
              </div>

              <div className="mt-5 space-y-2">
                <SavePlaceButton
                  place={place}
                  onUpdated={updatePlace}
                  onLogin={() =>
                    navigate("/login", { state: { next: `/places/${place.slug}` } })
                  }
                />
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonClasses("outline", "md", true)}
                >
                  <Navigation className="h-4 w-4" aria-hidden="true" />
                  Get directions
                </a>
              </div>

              <p className="mt-4 rounded-2xl bg-primary-tint/70 px-3 py-2 text-center text-[11px] leading-relaxed text-primary-dark">
                {place.myRating
                  ? `You rated this place ${place.myRating.rating}/5. You can update it any time.`
                  : "Your ratings and saves help shape the weekly trending list."}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Gallery({ place }: { place: PlaceDetail }) {
  const photos = place.photos.length > 0 ? place.photos : [
    { id: "fallback", url: place.imageUrl, alt: place.name, order: 0 }
  ];
  const [main, ...rest] = photos;

  if (!main) return null;

  return (
    <div className="grid gap-2 sm:grid-cols-[2fr_1fr]">
      <SafeImage
        src={main.url}
        alt={main.alt}
        className="h-64 w-full rounded-3xl sm:h-[420px]"
        loading="eager"
      />
      {rest.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-1">
          {rest.slice(0, 2).map((photo) => (
            <SafeImage
              key={photo.id}
              src={photo.url}
              alt={photo.alt}
              className="h-36 w-full rounded-3xl sm:h-[206px]"
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function SavePlaceButton({
  place,
  onUpdated,
  onLogin
}: {
  place: PlaceDetail;
  onUpdated: (place: PlaceDetail) => void;
  onLogin: () => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    setPending(true);
    setError(null);
    try {
      if (place.savedByMe) {
        await api.unsavePlace(place.id);
        onUpdated({ ...place, savedByMe: false });
      } else {
        await api.savePlace(place.id);
        onUpdated({ ...place, savedByMe: true });
      }
    } catch (caught) {
      if (caught instanceof Error && caught.message.includes("log in")) {
        onLogin();
      } else {
        setError(getErrorMessage(caught));
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <Button
        type="button"
        variant={place.savedByMe ? "secondary" : "primary"}
        fullWidth
        loading={pending}
        onClick={() => void toggle()}
        aria-pressed={place.savedByMe}
      >
        {place.savedByMe ? (
          <BookmarkCheck className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Bookmark className="h-4 w-4" aria-hidden="true" />
        )}
        {place.savedByMe ? "Saved place" : "Save place"}
      </Button>
      {error ? (
        <p role="alert" className="mt-2 text-xs text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function RatePlaceForm({
  place,
  onUpdated
}: {
  place: PlaceDetail;
  onUpdated: (place: PlaceDetail) => void;
}) {
  const [rating, setRating] = useState(place.myRating?.rating ?? 0);
  const [comment, setComment] = useState(place.myRating?.comment ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (rating < 1) {
      setError("Choose a star rating from 1 to 5.");
      return;
    }

    setPending(true);
    setError(null);
    setSuccess(false);

    try {
      const updated = await api.ratePlace(place.id, {
        rating,
        comment: comment.trim() || undefined
      });
      onUpdated(updated);
      setSuccess(updated.myRating ? "Your rating is live." : "Rating saved.");
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card-surface space-y-4 p-5">
      <div>
        <p className="text-sm font-semibold text-ink">Your rating</p>
        <div className="mt-2">
          <RatingInput value={rating} onChange={setRating} disabled={pending} />
        </div>
      </div>

      <div>
        <label htmlFor="review-comment" className="text-sm font-semibold text-ink">
          Comment <span className="font-normal text-muted">(optional)</span>
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          rows={4}
          maxLength={500}
          disabled={pending}
          placeholder="What stood out? Was it worth the trip?"
          className="mt-2 w-full resize-y rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink placeholder:text-muted/80 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <p className="mt-1 text-right text-[11px] text-muted">{comment.length}/500</p>
      </div>

      {error ? (
        <p role="alert" className="rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      {success ? (
        <p role="status" className="rounded-2xl bg-primary-tint px-3 py-2 text-sm text-primary-dark">
          {success}
        </p>
      ) : null}

      <Button type="submit" loading={pending} fullWidth>
        {place.myRating ? "Update rating" : "Submit rating"}
      </Button>
    </form>
  );
}

function PlaceDetailsSkeleton() {
  return (
    <main id="main-content" className="shell py-8">
      <div className="skeleton h-4 w-32" />
      <div className="mt-4 space-y-3">
        <div className="skeleton h-5 w-40" />
        <div className="skeleton h-10 w-2/3" />
        <div className="skeleton h-4 w-1/2" />
      </div>
      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          <div className="skeleton h-64 w-full rounded-3xl sm:h-[420px]" />
          <div className="skeleton h-5 w-48" />
          <div className="skeleton h-24 w-full" />
        </div>
        <div className="skeleton h-64 w-full rounded-3xl" />
      </div>
    </main>
  );
}
