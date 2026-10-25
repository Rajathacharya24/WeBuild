import type { PlanTripInput, PlanTripOutput } from "@webuild/shared";
import { env } from "../env.js";

function buildFallbackPlan(input: PlanTripInput): PlanTripOutput {
  const dailyPlan = Array.from({ length: input.days }, (_, index) => {
    const day = index + 1;
    const baseInterests = input.interests.length > 0 ? input.interests : ["Sightseeing"];

    return {
      day,
      theme: `Day ${day} in ${input.destination}`,
      highlights: [
        `Morning: Explore local ${baseInterests[index % baseInterests.length].toLowerCase()} spots`,
        "Afternoon: Signature neighborhood walk and food break",
        "Evening: Relaxed activity with local culture"
      ]
    };
  });

  return {
    summary: `${input.days}-day ${input.destination} plan tailored for ${input.budget} budget travel.`,
    dailyPlan,
    estimatedBudgetNote: `Budget tier: ${input.budget}. Add flights/hotel prices dynamically using partner APIs later.`,
    tips: [
      "Reserve key attractions early.",
      "Keep one flexible half-day for weather changes.",
      "Use offline maps for commute-heavy routes."
    ],
    source: "fallback"
  };
}

export async function generateTripPlan(input: PlanTripInput): Promise<PlanTripOutput> {
  if (env.AI_PROVIDER !== "openai" || !env.OPENAI_API_KEY) {
    return buildFallbackPlan(input);
  }

  return buildFallbackPlan(input);
}
