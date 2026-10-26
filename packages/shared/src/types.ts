import type { PlaceCategory } from "./categories.js";

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface PlaceSummary {
  id: string;
  slug: string;
  name: string;
  category: PlaceCategory;
  area: string;
  address: string;
  description: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  priceLevel: number;
  rating: number;
  ratingCount: number;
  distanceKm: number | null;
  savedByMe: boolean;
}

export interface PlacePhoto {
  id: string;
  url: string;
  alt: string;
  order: number;
}

export interface PlaceReview {
  id: string;
  rating: number;
  comment: string | null;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  isMine: boolean;
}

export interface PlaceDetail extends PlaceSummary {
  photos: PlacePhoto[];
  reviews: PlaceReview[];
  myRating: PlaceReview | null;
}

export interface PlanStop {
  id: string;
  name: string;
  note: string | null;
  placeSlug: string | null;
  order: number;
}

export interface WeekendPlan {
  id: string;
  slug: string;
  title: string;
  description: string;
  durationHours: number;
  budgetMin: number;
  budgetMax: number;
  imageUrl: string;
  stops: PlanStop[];
  savedByMe: boolean;
  saveCount: number;
}

export type TrendLabel = "Surging" | "Hot" | "Trending";

export interface TrendingPlace extends PlaceSummary {
  score: number;
  rank: number;
  trendLabel: TrendLabel;
}

export interface PlaceRef {
  id: string;
  slug: string;
  name: string;
  category: PlaceCategory;
  area: string;
  imageUrl: string;
  rating: number;
  ratingCount: number;
}

export interface ProfileRating {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  place: PlaceRef;
}

export interface ProfileStats {
  ratings: number;
  savedPlans: number;
  savedPlaces: number;
  placesVisited: number;
}

export interface Profile {
  user: AuthUser;
  stats: ProfileStats;
  ratings: ProfileRating[];
  savedPlans: WeekendPlan[];
  savedPlaces: PlaceRef[];
}

export interface AiSearchResult {
  place: PlaceSummary;
  reason: string;
}

export interface AiSearchResponse {
  source: "ai" | "fallback";
  message: string;
  results: AiSearchResult[];
}

export interface ApiErrorResponse {
  message: string;
  details?: unknown;
}

export type SearchMode = "search" | "ai";
