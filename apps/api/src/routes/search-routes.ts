import { Router } from "express";
import { aiSearchSchema } from "@webuild/shared";
import { optionalAuth } from "../http/auth.js";
import { asyncHandler } from "../http/errors.js";
import { parseBody } from "../http/validate.js";
import { aiSearch } from "../services/ai/search-service.js";

export const searchRoutes = Router();

searchRoutes.post(
  "/ai",
  optionalAuth,
  asyncHandler(async (request, response) => {
    const input = parseBody(aiSearchSchema, request.body);
    response.json(await aiSearch(input, request.user?.id));
  })
);
