import { describe, expect, it } from "vitest";
import { aiSearchSchema, loginSchema, ratingSchema, registerSchema } from "../src/index.js";

describe("API input validation", () => {
  it("rejects invalid registration payloads", () => {
    expect(
      registerSchema.safeParse({ name: "A", email: "not-an-email", password: "short" }).success
    ).toBe(false);
  });

  it("normalises email casing on login", () => {
    const parsed = loginSchema.parse({ email: " Demo@WeBuild.App ", password: "password" });
    expect(parsed.email).toBe("demo@webuild.app");
  });

  it("rejects ratings outside 1-5", () => {
    expect(ratingSchema.safeParse({ rating: 6 }).success).toBe(false);
    expect(ratingSchema.safeParse({ rating: 0 }).success).toBe(false);
  });

  it("treats an empty comment as no comment", () => {
    const parsed = ratingSchema.parse({ rating: 5, comment: "   " });
    expect(parsed.comment).toBeUndefined();
  });

  it("rejects AI searches that are too short", () => {
    expect(aiSearchSchema.safeParse({ query: "x" }).success).toBe(false);
  });

  it("applies sensible defaults for AI search", () => {
    const parsed = aiSearchSchema.parse({ query: "quiet cafe in Indiranagar" });
    expect(parsed.limit).toBe(6);
  });
});
