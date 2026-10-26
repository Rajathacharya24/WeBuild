import { z } from "zod";

const latitude = z.coerce.number().min(-90).max(90);
const longitude = z.coerce.number().min(-180).max(180);

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(60),
  email: z.string().trim().toLowerCase().email("Enter a valid email").max(160),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be at most 72 characters")
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email").max(160),
  password: z.string().min(1, "Password is required").max(72)
});

export const ratingSchema = z.object({
  rating: z.coerce.number().int().min(1, "Rating must be 1-5").max(5, "Rating must be 1-5"),
  comment: z
    .string()
    .trim()
    .max(500, "Comment must be at most 500 characters")
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined))
});

const coordinatesRefinement = (data: { lat?: number; lng?: number }): boolean =>
  (data.lat === undefined) === (data.lng === undefined);

export const placeQuerySchema = z
  .object({
    lat: latitude.optional(),
    lng: longitude.optional(),
    q: z.string().trim().max(120).optional(),
    category: z.string().trim().max(60).optional(),
    limit: z.coerce.number().int().min(1).max(50).default(12)
  })
  .refine(coordinatesRefinement, {
    message: "lat and lng must be provided together",
    path: ["lat"]
  });

export const aiSearchSchema = z
  .object({
    query: z.string().trim().min(2, "Describe what you are looking for").max(280),
    lat: latitude.optional(),
    lng: longitude.optional(),
    limit: z.coerce.number().int().min(1).max(10).default(6)
  })
  .refine(coordinatesRefinement, {
    message: "lat and lng must be provided together",
    path: ["lat"]
  });

export const trendingQuerySchema = z
  .object({
    lat: latitude.optional(),
    lng: longitude.optional(),
    limit: z.coerce.number().int().min(1).max(20).default(8)
  })
  .refine(coordinatesRefinement, {
    message: "lat and lng must be provided together",
    path: ["lat"]
  });

export const placeIdSchema = z.object({
  id: z.string().trim().min(1).max(100)
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RatingInput = z.infer<typeof ratingSchema>;
export type PlaceQueryInput = z.infer<typeof placeQuerySchema>;
export type AiSearchInput = z.infer<typeof aiSearchSchema>;
export type TrendingQueryInput = z.infer<typeof trendingQuerySchema>;
