import { z } from "zod";
import { env } from "../../env.js";
import type { AiRankRequest, LlmProvider, RankedPlace } from "./provider.js";

const responseSchema = z.object({
  results: z
    .array(
      z.object({
        placeId: z.string().min(1),
        reason: z.string().trim().min(1).max(220)
      })
    )
    .max(20)
});

const openAiResponseSchema = z.object({
  choices: z
    .array(
      z.object({
        message: z.object({
          content: z.string().nullable()
        })
      })
    )
    .min(1)
});

export class OpenAiLlmProvider implements LlmProvider {
  public readonly name = "openai";

  async rankPlaces({ query, candidates, limit }: AiRankRequest): Promise<RankedPlace[]> {
    if (!env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured.");
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: env.OPENAI_MODEL,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are a concise Bangalore local guide. Rank only places from the supplied candidate list. " +
              "Return JSON with this shape: {\"results\":[{\"placeId\":\"...\",\"reason\":\"one short sentence\"}]}. " +
              "Never invent a placeId. Prefer places that genuinely match the user's intent, budget and location."
          },
          {
            role: "user",
            content: JSON.stringify({
              query,
              limit,
              candidates: candidates.map((candidate) => ({
                placeId: candidate.id,
                name: candidate.name,
                category: candidate.category,
                area: candidate.area,
                rating: candidate.rating,
                ratingCount: candidate.ratingCount,
                distanceKm: candidate.distanceKm,
                description: candidate.description
              }))
            })
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI request failed with status ${response.status}.`);
    }

    const payload = openAiResponseSchema.parse(await response.json());
    const content = payload.choices[0]?.message.content;
    if (!content) {
      throw new Error("OpenAI returned an empty response.");
    }

    const parsed = responseSchema.parse(JSON.parse(content));
    const allowedIds = new Set(candidates.map((candidate) => candidate.id));
    const seen = new Set<string>();

    return parsed.results
      .filter((result) => allowedIds.has(result.placeId) && !seen.has(result.placeId))
      .filter((result) => {
        seen.add(result.placeId);
        return true;
      })
      .slice(0, limit);
  }
}
