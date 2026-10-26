import { Router } from "express";
import { placeIdSchema } from "@webuild/shared";
import { getUserId, optionalAuth, requireAuth } from "../http/auth.js";
import { asyncHandler } from "../http/errors.js";
import { parseBody } from "../http/validate.js";
import { listPlans, savePlan, unsavePlan } from "../services/plans-service.js";

export const plansRoutes = Router();

plansRoutes.get(
  "/",
  optionalAuth,
  asyncHandler(async (request, response) => {
    response.json(await listPlans(request.user?.id));
  })
);

plansRoutes.post(
  "/:id/save",
  requireAuth,
  asyncHandler(async (request, response) => {
    const { id } = parseBody(placeIdSchema, request.params);
    response.json(await savePlan(id, getUserId(request)));
  })
);

plansRoutes.delete(
  "/:id/save",
  requireAuth,
  asyncHandler(async (request, response) => {
    const { id } = parseBody(placeIdSchema, request.params);
    response.json(await unsavePlan(id, getUserId(request)));
  })
);
