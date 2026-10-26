import { Router } from "express";
import { placeIdSchema, placeQuerySchema, ratingSchema } from "@webuild/shared";
import { getUserId, optionalAuth, requireAuth } from "../http/auth.js";
import { asyncHandler } from "../http/errors.js";
import { parseBody, parseQuery } from "../http/validate.js";
import {
  getPlaceDetail,
  listPlaces,
  ratePlace,
  savePlace,
  unsavePlace
} from "../services/places-service.js";

export const placesRoutes = Router();

placesRoutes.get(
  "/",
  optionalAuth,
  asyncHandler(async (request, response) => {
    const query = parseQuery(placeQuerySchema, request.query);
    const origin =
      query.lat !== undefined && query.lng !== undefined
        ? { lat: query.lat, lng: query.lng }
        : null;

    const places = await listPlaces({
      origin,
      query: query.q,
      category: query.category,
      limit: query.limit,
      userId: request.user?.id
    });

    response.json(places);
  })
);

placesRoutes.get(
  "/:id",
  optionalAuth,
  asyncHandler(async (request, response) => {
    const { id } = parseBody(placeIdSchema, request.params);
    response.json(await getPlaceDetail(id, request.user?.id));
  })
);

placesRoutes.post(
  "/:id/ratings",
  requireAuth,
  asyncHandler(async (request, response) => {
    const { id } = parseBody(placeIdSchema, request.params);
    const input = parseBody(ratingSchema, request.body);
    response.json(await ratePlace(id, getUserId(request), input));
  })
);

placesRoutes.post(
  "/:id/save",
  requireAuth,
  asyncHandler(async (request, response) => {
    const { id } = parseBody(placeIdSchema, request.params);
    response.json(await savePlace(id, getUserId(request)));
  })
);

placesRoutes.delete(
  "/:id/save",
  requireAuth,
  asyncHandler(async (request, response) => {
    const { id } = parseBody(placeIdSchema, request.params);
    response.json(await unsavePlace(id, getUserId(request)));
  })
);
