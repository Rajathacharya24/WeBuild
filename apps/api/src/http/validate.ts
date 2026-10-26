import type { z } from "zod";
import { ApiError } from "./errors.js";

export function parseBody<T extends z.ZodTypeAny>(schema: T, body: unknown): z.infer<T> {
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new ApiError(400, "Please check the highlighted fields.", result.error.flatten());
  }
  return result.data;
}

export function parseQuery<T extends z.ZodTypeAny>(schema: T, query: unknown): z.infer<T> {
  const result = schema.safeParse(query);
  if (!result.success) {
    throw new ApiError(400, "Invalid query parameters.", result.error.flatten());
  }
  return result.data;
}
