import type { Prisma } from "@prisma/client";
import type { WeekendPlan } from "@webuild/shared";
import { prisma } from "../db.js";
import { ApiError } from "../http/errors.js";
import { toWeekendPlan } from "../utils/serializers.js";

export const planInclude = {
  stops: {
    include: { place: { select: { slug: true } } },
    orderBy: { order: "asc" }
  },
  _count: { select: { savedBy: true } }
} satisfies Prisma.WeekendPlanInclude;

export async function getSavedPlanIds(userId?: string): Promise<Set<string>> {
  if (!userId) return new Set();
  const saved = await prisma.savedPlan.findMany({
    where: { userId },
    select: { planId: true }
  });
  return new Set(saved.map((item) => item.planId));
}

export async function listPlans(userId?: string): Promise<WeekendPlan[]> {
  const [plans, savedIds] = await Promise.all([
    prisma.weekendPlan.findMany({
      include: planInclude,
      orderBy: { durationHours: "asc" }
    }),
    getSavedPlanIds(userId)
  ]);

  return plans.map((plan) => toWeekendPlan(plan, savedIds.has(plan.id)));
}

async function findPlanId(idOrSlug: string): Promise<string> {
  const plan = await prisma.weekendPlan.findFirst({
    where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
    select: { id: true }
  });

  if (!plan) {
    throw new ApiError(404, "Weekend plan not found.");
  }

  return plan.id;
}

export async function savePlan(
  idOrSlug: string,
  userId: string
): Promise<{ saved: true }> {
  const planId = await findPlanId(idOrSlug);
  const existing = await prisma.savedPlan.findUnique({
    where: { userId_planId: { userId, planId } }
  });

  if (!existing) {
    await prisma.savedPlan.create({ data: { userId, planId } });
  }

  return { saved: true };
}

export async function unsavePlan(
  idOrSlug: string,
  userId: string
): Promise<{ saved: false }> {
  const planId = await findPlanId(idOrSlug);
  await prisma.savedPlan.deleteMany({
    where: { userId, planId }
  });
  return { saved: false };
}
