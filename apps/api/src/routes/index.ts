import type { FastifyInstance } from "fastify";
import { tripRoutes } from "./trip-routes.js";

export async function registerRoutes(app: FastifyInstance) {
  await app.register(tripRoutes, { prefix: "/api/v1/trips" });
}
