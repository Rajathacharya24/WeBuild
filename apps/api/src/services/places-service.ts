import { Prisma } from "@prisma/client";
import type { GeoPoint, PlaceDetail, PlaceSummary, RatingInput } from "@webuild/shared";
import { prisma } from "../db.js";
import { ApiError } from "../http/errors.js";
import {
  toPlaceReview,
  toPlaceSummary,
  type PlaceWithRatings
} from "../utils/serializers.js";

const stopWords = new Set([
  "the",
  "and",
  "for",
  "with",
  "near",
  "from",
  "that",
  "this",
  "have",
  "into",
  "some",
  "good",
  "best",
  "work",
  "work from"
]);

function tokensFor(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 2 && !stopWords.has(token));
}

function matchCount(place: PlaceWithRatings, tokens: string[]): number {
  const haystack = `${place.name} ${place.category} ${place.area} ${place.description}`.toLowerCase();
  return tokens.reduce((count, token) => (haystack.includes(token) ? count + 1 : count), 0);
}

export async function getSavedPlaceIds(userId?: string): Promise<Set<string>> {
  if (!userId) return new Set();
  const saved = await prisma.savedPlace.findMany({
    where: { userId },
    select: { placeId: true }
  });
  return new Set(saved.map((item) => item.placeId));
}

export async function listPlaces({
  origin,
  query,
  category,
  limit,
  userId
}: {
  origin: GeoPoint | null;
  query?: string;
  category?: string;
  limit: number;
  userId?: string;
}): Promise<PlaceSummary[]> {
  const [places, savedIds] = await Promise.all([
    prisma.place.findMany({
      include: { ratings: { select: { rating: true } } }
    }),
    getSavedPlaceIds(userId)
  ]);

  const tokens = query ? tokensFor(query) : [];
  const normalisedCategory = category?.trim().toLowerCase();

  const filtered = places.filter((place) => {
    if (normalisedCategory && place.category.toLowerCase() !== normalisedCategory) {
      return false;
    }
    if (!query) return true;
    if (tokens.length === 0) {
      return `${place.name} ${place.category} ${place.area}`
        .toLowerCase()
        .includes(query.trim().toLowerCase());
    }
    return matchCount(place, tokens) > 0;
  });

  const summaries = filtered.map((place) => ({
    place,
    summary: toPlaceSummary(place, origin, savedIds.has(place.id)),
    relevance: tokens.length > 0 ? matchCount(place, tokens) : 0
  }));

  summaries.sort((a, b) => {
    if (tokens.length > 0 && b.relevance !== a.relevance) {
      return b.relevance - a.relevance;
    }
    if (origin && a.summary.distanceKm !== null && b.summary.distanceKm !== null) {
      return a.summary.distanceKm - b.summary.distanceKm;
    }
    if (b.summary.ratingCount !== a.summary.ratingCount) {
      return b.summary.ratingCount - a.summary.ratingCount;
    }
    return b.summary.rating - a.summary.rating;
  });

  return summaries.slice(0, limit).map((item) => item.summary);
}

type PlaceDetailRecord = Prisma.PlaceGetPayload<{
  include: {
    photos: true;
    ratings: {
      include: { user: { select: { name: true } } };
      orderBy: { createdAt: "desc" };
    };
  };
}>;

async function findPlaceRecord(idOrSlug: string): Promise<PlaceDetailRecord> {
  const place = await prisma.place.findFirst({
    where: {
      OR: [{ id: idOrSlug }, { slug: idOrSlug }]
    },
    include: {
      photos: { orderBy: { order: "asc" } },
      ratings: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!place) {
    throw new ApiError(404, "Place not found.");
  }

  return place;
}

export async function getPlaceDetail(
  idOrSlug: string,
  userId?: string,
  trackView = true
): Promise<PlaceDetail> {
  const place = await findPlaceRecord(idOrSlug);
  const savedByMe = userId
    ? Boolean(
        await prisma.savedPlace.findUnique({
          where: { userId_placeId: { userId, placeId: place.id } }
        })
      )
    : false;

  if (trackView) {
    try {
      await prisma.activityEvent.create({
        data: { type: "VIEW", placeId: place.id, userId: userId ?? null }
      });
    } catch {
      // A failed view event must never block a place page.
    }
  }

  const myRating = userId
    ? place.ratings.find((rating) => rating.userId === userId)
    : undefined;

  return {
    ...toPlaceSummary(place, null, savedByMe),
    photos: place.photos.map((photo) => ({
      id: photo.id,
      url: photo.url,
      alt: photo.alt,
      order: photo.order
    })),
    reviews: place.ratings.map((rating) => toPlaceReview(rating, userId)),
    myRating: myRating ? toPlaceReview(myRating, userId) : null
  };
}

export async function ratePlace(
  idOrSlug: string,
  userId: string,
  input: RatingInput
): Promise<PlaceDetail> {
  const place = await prisma.place.findFirst({
    where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
    select: { id: true }
  });

  if (!place) {
    throw new ApiError(404, "Place not found.");
  }

  await prisma.rating.upsert({
    where: { userId_placeId: { userId, placeId: place.id } },
    create: {
      userId,
      placeId: place.id,
      rating: input.rating,
      comment: input.comment ?? null
    },
    update: {
      rating: input.rating,
      comment: input.comment ?? null
    }
  });

  try {
    await prisma.activityEvent.create({
      data: { type: "RATING", placeId: place.id, userId }
    });
  } catch {
    // Rating the place is the important part; analytics are best-effort.
  }

  return getPlaceDetail(place.id, userId, false);
}

export async function savePlace(
  idOrSlug: string,
  userId: string
): Promise<{ saved: true }> {
  const place = await prisma.place.findFirst({
    where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
    select: { id: true }
  });

  if (!place) {
    throw new ApiError(404, "Place not found.");
  }

  const existing = await prisma.savedPlace.findUnique({
    where: { userId_placeId: { userId, placeId: place.id } }
  });

  if (!existing) {
    await prisma.savedPlace.create({
      data: { userId, placeId: place.id }
    });
    try {
      await prisma.activityEvent.create({
        data: { type: "SAVE", placeId: place.id, userId }
      });
    } catch {
      // Saving the place is the important part; analytics are best-effort.
    }
  }

  return { saved: true };
}

export async function unsavePlace(
  idOrSlug: string,
  userId: string
): Promise<{ saved: false }> {
  const place = await prisma.place.findFirst({
    where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
    select: { id: true }
  });

  if (!place) {
    throw new ApiError(404, "Place not found.");
  }

  await prisma.savedPlace.deleteMany({
    where: { userId, placeId: place.id }
  });

  return { saved: false };
}
