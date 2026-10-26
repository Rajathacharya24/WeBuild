import type { ErrorRequestHandler, RequestHandler } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { env } from "../env.js";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function asyncHandler(
  handler: (req: Parameters<RequestHandler>[0], res: Parameters<RequestHandler>[1], next: Parameters<RequestHandler>[2]) => Promise<unknown>
): RequestHandler {
  return (req, res, next) => {
    void Promise.resolve(handler(req, res, next)).catch(next);
  };
}

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({ message: "Route not found." });
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ApiError) {
    res.status(error.status).json({
      message: error.message,
      ...(error.details !== undefined ? { details: error.details } : {})
    });
    return;
  }

  if (error instanceof ZodError) {
    res.status(400).json({
      message: "Invalid request.",
      details: error.flatten()
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      res.status(409).json({ message: "That record already exists." });
      return;
    }
    if (error.code === "P2025") {
      res.status(404).json({ message: "Record not found." });
      return;
    }
  }

  if (env.NODE_ENV !== "test") {
    console.error(error);
  }
  res.status(500).json({ message: "Something went wrong. Please try again." });
};
