export type PlanTripInput = {
  destination: string;
  days: number;
  budget: "low" | "mid" | "high";
  interests: string[];
  startDate?: string;
};

export type DayPlan = {
  day: number;
  theme: string;
  highlights: string[];
};

export type PlanTripOutput = {
  summary: string;
  dailyPlan: DayPlan[];
  estimatedBudgetNote: string;
  tips: string[];
  source: "ai" | "fallback";
};

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
