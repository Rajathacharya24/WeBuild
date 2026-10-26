import type { NextFunction, Request, Response } from "express";
import type { SignOptions } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import type { AuthUser } from "@webuild/shared";
import { prisma } from "../db.js";
import { env } from "../env.js";
import { toAuthUser } from "../utils/serializers.js";
import { ApiError } from "./errors.js";

export function signToken(user: AuthUser): string {
  return jwt.sign(
    { sub: user.id, email: user.email },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"] }
  );
}

async function userFromRequest(request: Request): Promise<AuthUser | null> {
  const header = request.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    return null;
  }

  const token = header.slice("Bearer ".length).trim();
  if (!token) return null;

  const payload = jwt.verify(token, env.JWT_SECRET);
  if (typeof payload === "string" || typeof payload.sub !== "string") {
    throw new jwt.JsonWebTokenError("Invalid token payload");
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  return user ? toAuthUser(user) : null;
}

export async function requireAuth(
  request: Request,
  _response: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await userFromRequest(request);
    if (!user) {
      throw new ApiError(401, "Please log in to continue.");
    }
    request.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      next(new ApiError(401, "Your session has expired. Please log in again."));
      return;
    }
    next(error);
  }
}

export async function optionalAuth(
  request: Request,
  _response: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await userFromRequest(request);
    if (user) request.user = user;
  } catch {
    // Optional routes treat an invalid token as an anonymous request.
  }
  next();
}

export function getUserId(request: Request): string {
  if (!request.user) {
    throw new ApiError(401, "Please log in to continue.");
  }
  return request.user.id;
}
