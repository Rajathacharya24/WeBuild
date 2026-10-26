import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";

const app = createApp();

describe("API validation", () => {
  it("reports health", async () => {
    const response = await request(app).get("/api/health");
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
  });

  it("rejects a malformed registration payload", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "A",
      email: "nope",
      password: "short"
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/highlighted fields/i);
  });

  it("rejects AI search without a query", async () => {
    const response = await request(app).post("/api/search/ai").send({ query: "" });
    expect(response.status).toBe(400);
  });

  it("rejects a lone latitude without longitude", async () => {
    const response = await request(app).get("/api/places?lat=12.97");
    expect(response.status).toBe(400);
  });

  it("returns JSON 404 for unknown routes", async () => {
    const response = await request(app).get("/api/does-not-exist");
    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Route not found.");
  });
});
