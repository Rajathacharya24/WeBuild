import { Router } from "express";
import { getUserId, requireAuth } from "../http/auth.js";
import { asyncHandler } from "../http/errors.js";
import { getProfile } from "../services/profile-service.js";

export const profileRoutes = Router();

profileRoutes.get(
  "/",
  requireAuth,
  asyncHandler(async (request, response) => {
    response.json(await getProfile(getUserId(request)));
  })
);
