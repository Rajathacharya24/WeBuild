import type { AiSearchInput, AiSearchResponse, GeoPoint } from "@webuild/shared";
import { env } from "../../env.js";
import { listPlaces } from "../places-service.js";
import { OpenAiLlmProvider } from "./openai-provider.js";
import type { LlmProvider } from "./provider.js";

function getProvider(): LlmProvider | null {
  if (env.AI_PROVIDER !== "openai" || !env.OPENAI_API_KEY) {
    return null;
  }
  return new OpenAiLlmProvider();
}

async function keywordFallback(
  input: AiSearchInput,
  origin: GeoPoint | null,
  userId: string | undefined,
  message: string
): Promise<AiSearchResponse> {
  const places = await listPlaces({
    origin,
    query: input.query,
    limit: input.limit,
    userId
  });

  return {
    source: "fallback",
    message,
    results: places.map((place) => ({
      place,
      reason: "Matched your keyword search."
    }))
  };
}

export async function aiSearch(
  input: AiSearchInput,
  userId?: string
): Promise<AiSearchResponse> {
  const origin =
    input.lat !== undefined && input.lng !== undefined
      ? { lat: input.lat, lng: input.lng }
      : null;

  const provider = getProvider();
  if (!provider) {
    return keywordFallback(
      input,
      origin,
      userId,
      "AI search is not configured. Showing keyword matches instead. Add OPENAI_API_KEY on the server to enable AI ranking."
    );
  }

  const candidates = await listPlaces({
    origin,
    limit: 24,
    userId
  });

  if (candidates.length === 0) {
    return {
      source: "fallback",
      message: "No places are available to rank yet.",
      results: []
    };
  }

  try {
    const ranked = await provider.rankPlaces({
      query: input.query,
      limit: input.limit,
      candidates: candidates.map((place) => ({
        id: place.id,
        name: place.name,
        category: place.category,
        area: place.area,
        rating: place.rating,
        ratingCount: place.ratingCount,
        description: place.description,
        distanceKm: place.distanceKm
      }))
    });

    if (ranked.length === 0) {
      return keywordFallback(
        input,
        origin,
        userId,
        "AI search could not find a confident match. Showing keyword matches instead."
      );
    }

    const byId = new Map(candidates.map((place) => [place.id, place]));
    const results = ranked.flatMap((item) => {
      const place = byId.get(item.placeId);
      return place ? [{ place, reason: item.reason }] : [];
    });

    return {
      source: "ai",
      message: `AI ranked ${results.length} ${results.length === 1 ? "place" : "places"} for your search.`,
      results
    };
  } catch (error) {
    if (env.NODE_ENV !== "test") {
      console.error("AI search failed, falling back to keyword search.", error);
    }
    return keywordFallback(
      input,
      origin,
      userId,
      "AI search is temporarily unavailable. Showing keyword matches instead."
    );
  }
}
