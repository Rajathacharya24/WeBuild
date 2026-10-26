import { Router } from "express";
import bcrypt from "bcryptjs";
import { loginSchema, registerSchema, type AuthResponse } from "@webuild/shared";
import { prisma } from "../db.js";
import { getUserId, requireAuth, signToken } from "../http/auth.js";
import { ApiError, asyncHandler } from "../http/errors.js";
import { parseBody } from "../http/validate.js";
import { toAuthUser } from "../utils/serializers.js";

export const authRoutes = Router();

authRoutes.post(
  "/register",
  asyncHandler(async (request, response) => {
    const input = parseBody(registerSchema, request.body);

    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new ApiError(409, "An account with this email already exists.");
    }

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash: await bcrypt.hash(input.password, 10)
      }
    });

    const authUser = toAuthUser(user);
    const payload: AuthResponse = { token: signToken(authUser), user: authUser };
    response.status(201).json(payload);
  })
);

authRoutes.post(
  "/login",
  asyncHandler(async (request, response) => {
    const input = parseBody(loginSchema, request.body);

    const user = await prisma.user.findUnique({ where: { email: input.email } });
    const valid = user ? await bcrypt.compare(input.password, user.passwordHash) : false;

    if (!user || !valid) {
      throw new ApiError(401, "Email or password is incorrect.");
    }

    const authUser = toAuthUser(user);
    const payload: AuthResponse = { token: signToken(authUser), user: authUser };
    response.json(payload);
  })
);

authRoutes.get(
  "/me",
  requireAuth,
  asyncHandler(async (request, response) => {
    const user = await prisma.user.findUnique({ where: { id: getUserId(request) } });
    if (!user) {
      throw new ApiError(404, "User not found.");
    }
    response.json(toAuthUser(user));
  })
);
