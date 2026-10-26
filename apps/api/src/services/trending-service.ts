import type { GeoPoint, TrendingPlace } from "@webuild/shared";
import {
  computeTrendingScore,
  trendLabelForRank
} from "@webuild/shared";
import { prisma } from "../db.js";
import { toPlaceSummary } from "../utils/serializers.js";
import { getSavedPlaceIds } from "./places-service.js";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export async function getTrending({
  origin,
  limit,
  userId
}: {
  origin: GeoPoint | null;
  limit: number;
  userId?: string;
}): Promise<TrendingPlace[]> {
  const since = new Date(Date.now() - SEVEN_DAYS_MS);

  const [places, savedIds, groups] = await Promise.all([
    prisma.place.findMany({
      include: { ratings: { select: { rating: true } } }
    }),
    getSavedPlaceIds(userId),
    prisma.activityEvent.groupBy({
      by: ["placeId", "type"],
      where: { createdAt: { gte: since } },
      _count: { _all: true }
    })
  ]);

  const signals = new Map<
    string,
    { recentRatings: number; recentViews: number; recentSaves: number }
  >();

  for (const group of groups) {
    const current = signals.get(group.placeId) ?? {
      recentRatings: 0,
      recentViews: 0,
      recentSaves: 0
    };
    if (group.type === "RATING") current.recentRatings = group._count._all;
    if (group.type === "VIEW") current.recentViews = group._count._all;
    if (group.type === "SAVE") current.recentSaves = group._count._all;
    signals.set(group.placeId, current);
  }

  return places
    .map((place) => {
      const signal = signals.get(place.id) ?? {
        recentRatings: 0,
        recentViews: 0,
        recentSaves: 0
      };
      return {
        summary: toPlaceSummary(place, origin, savedIds.has(place.id)),
        score: computeTrendingScore(signal)
      };
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.summary.ratingCount !== a.summary.ratingCount) {
        return b.summary.ratingCount - a.summary.ratingCount;
      }
      return b.summary.rating - a.summary.rating;
    })
    .slice(0, limit)
    .map((item, index) => {
      const rank = index + 1;
      return {
        ...item.summary,
        score: item.score,
        rank,
        trendLabel: trendLabelForRank(rank)
      };
    });
}
