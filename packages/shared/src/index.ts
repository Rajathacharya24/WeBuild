import { z } from "zod";

export const budgetSchema = z.enum(["low", "mid", "high"]);

export const planTripInputSchema = z.object({
  destination: z.string().min(2),
  days: z.number().int().min(1).max(30),
  budget: budgetSchema,
  interests: z.array(z.string().min(2)).max(10),
  startDate: z.string().optional()
});

export const dayPlanSchema = z.object({
  day: z.number().int().min(1),
  theme: z.string(),
  highlights: z.array(z.string().min(2)).min(1)
});

export const planTripOutputSchema = z.object({
  summary: z.string(),
  dailyPlan: z.array(dayPlanSchema),
  estimatedBudgetNote: z.string(),
  tips: z.array(z.string()),
  source: z.enum(["ai", "fallback"])
});

export type Budget = z.infer<typeof budgetSchema>;
export type PlanTripInput = z.infer<typeof planTripInputSchema>;
export type DayPlan = z.infer<typeof dayPlanSchema>;
export type PlanTripOutput = z.infer<typeof planTripOutputSchema>;
