import type { PlanTripInput, PlanTripOutput } from "@webuild/shared";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function planTrip(input: PlanTripInput): Promise<PlanTripOutput> {
  const response = await fetch(`${API_URL}/api/v1/trips/plan`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(input)
  });

  if (!response.ok) {
    throw new Error("Unable to generate trip plan right now.");
  }

  return response.json() as Promise<PlanTripOutput>;
}
