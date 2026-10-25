import type { FastifyPluginAsync } from "fastify";
import {
  planTripInputSchema,
  planTripOutputSchema,
  type PlanTripInput,
  type PlanTripOutput
} from "@webuild/shared";
import { generateTripPlan } from "../services/ai-service.js";

export const tripRoutes: FastifyPluginAsync = async (app) => {
  app.post("/plan", async (request, reply) => {
    const parseResult = planTripInputSchema.safeParse(request.body);

    if (!parseResult.success) {
      return reply.badRequest("Invalid trip planning payload.");
    }

    const input: PlanTripInput = parseResult.data;
    const output: PlanTripOutput = await generateTripPlan(input);

    const validatedOutput = planTripOutputSchema.parse(output);

    return reply.send(validatedOutput);
  });
};
