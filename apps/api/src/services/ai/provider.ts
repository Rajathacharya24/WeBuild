export interface AiCandidate {
  id: string;
  name: string;
  category: string;
  area: string;
  rating: number;
  ratingCount: number;
  description: string;
  distanceKm: number | null;
}

export interface AiRankRequest {
  query: string;
  candidates: AiCandidate[];
  limit: number;
}

export interface RankedPlace {
  placeId: string;
  reason: string;
}

export interface LlmProvider {
  name: string;
  rankPlaces(request: AiRankRequest): Promise<RankedPlace[]>;
}
