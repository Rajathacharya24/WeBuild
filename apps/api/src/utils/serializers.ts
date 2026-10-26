import type { Prisma, User } from "@prisma/client";
import {
  calculateAverageRating,
  haversineKm,
  roundKm,
  type AuthUser,
  type GeoPoint,
  type PlaceCategory,
  type PlaceReview,
  type PlaceSummary,
  type WeekendPlan
} from "@webuild/shared";

export type PlaceWithRatings = Prisma.PlaceGetPayload<{
  include: { ratings: { select: { rating: true } } };
}>;

export type RatingWithUser = Prisma.RatingGetPayload<{
  include: { user: { select: { name: true } } };
}>;

export type PlanWithStops = Prisma.WeekendPlanGetPayload<{
  include: {
    stops: { include: { place: { select: { slug: true } } } };
    _count: { select: { savedBy: true } };
  };
}>;

export function toAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt.toISOString()
  };
}

export function ratingSummary(ratings: Array<{ rating: number }>): {
  rating: number;
  ratingCount: number;
} {
  const { average, count } = calculateAverageRating(ratings.map((item) => item.rating));
  return { rating: average, ratingCount: count };
}

export function toPlaceSummary(
  place: PlaceWithRatings,
  origin: GeoPoint | null,
  savedByMe: boolean
): PlaceSummary {
  const summary = ratingSummary(place.ratings);
  const distanceKm = origin
    ? roundKm(
        haversineKm(origin, {
          lat: place.latitude,
          lng: place.longitude
        })
      )
    : null;

  return {
    id: place.id,
    slug: place.slug,
    name: place.name,
    category: place.category as PlaceCategory,
    area: place.area,
    address: place.address,
    description: place.description,
    latitude: place.latitude,
    longitude: place.longitude,
    imageUrl: place.imageUrl,
    priceLevel: place.priceLevel,
    rating: summary.rating,
    ratingCount: summary.ratingCount,
    distanceKm,
    savedByMe
  };
}

export function toPlaceReview(rating: RatingWithUser, currentUserId?: string): PlaceReview {
  return {
    id: rating.id,
    rating: rating.rating,
    comment: rating.comment,
    authorName: rating.user.name,
    createdAt: rating.createdAt.toISOString(),
    updatedAt: rating.updatedAt.toISOString(),
    isMine: rating.userId === currentUserId
  };
}

export function toWeekendPlan(plan: PlanWithStops, savedByMe: boolean): WeekendPlan {
  return {
    id: plan.id,
    slug: plan.slug,
    title: plan.title,
    description: plan.description,
    durationHours: plan.durationHours,
    budgetMin: plan.budgetMin,
    budgetMax: plan.budgetMax,
    imageUrl: plan.imageUrl,
    stops: plan.stops
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((stop) => ({
        id: stop.id,
        name: stop.name,
        note: stop.note,
        placeSlug: stop.place?.slug ?? null,
        order: stop.order
      })),
    savedByMe,
    saveCount: plan._count.savedBy
  };
}
