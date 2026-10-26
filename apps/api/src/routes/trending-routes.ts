import { Router } from "express";
import { trendingQuerySchema } from "@webuild/shared";
import { optionalAuth } from "../http/auth.js";
import { asyncHandler } from "../http/errors.js";
import { parseQuery } from "../http/validate.js";
import { getTrending } from "../services/trending-service.js";

export const trendingRoutes = Router();

trendingRoutes.get(
  "/",
  optionalAuth,
  asyncHandler(async (request, response) => {
    const query = parseQuery(trendingQuerySchema, request.query);
    const origin =
      query.lat !== undefined && query.lng !== undefined
        ? { lat: query.lat, lng: query.lng }
        : null;

    response.json(
      await getTrending({
        origin,
        limit: query.limit,
        userId: request.user?.id
      })
    );
  })
);
