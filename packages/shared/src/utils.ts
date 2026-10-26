import type { GeoPoint, TrendLabel } from "./types.js";

const EARTH_RADIUS_KM = 6371;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function haversineKm(from: GeoPoint, to: GeoPoint): number {
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

export function roundKm(km: number): number {
  return Math.round(km * 10) / 10;
}

export function calculateAverageRating(ratings: number[]): {
  average: number;
  count: number;
} {
  if (ratings.length === 0) {
    return { average: 0, count: 0 };
  }

  const total = ratings.reduce((sum, rating) => sum + rating, 0);
  return {
    average: Math.round((total / ratings.length) * 10) / 10,
    count: ratings.length
  };
}

export interface TrendingSignals {
  recentRatings: number;
  recentViews: number;
  recentSaves: number;
}

// Trending score for the last 7 days: ratings are the strongest signal (x3),
// saves show intent (x5), and views provide a light popularity baseline (x1).
export function computeTrendingScore({
  recentRatings,
  recentViews,
  recentSaves
}: TrendingSignals): number {
  return recentRatings * 3 + recentViews + recentSaves * 5;
}

export function trendLabelForRank(rank: number): TrendLabel {
  if (rank === 1) return "Surging";
  if (rank <= 3) return "Hot";
  return "Trending";
}
