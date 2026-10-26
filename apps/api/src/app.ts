import cors from "cors";
import express from "express";
import { env } from "./env.js";
import { errorHandler, notFoundHandler } from "./http/errors.js";
import { apiRoutes } from "./routes/index.js";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(
    cors({
      origin: env.WEB_ORIGIN.split(",").map((origin) => origin.trim()),
      methods: ["GET", "POST", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"]
    })
  );
  app.use(express.json({ limit: "100kb" }));

  app.get("/api/health", (_request, response) => {
    response.json({ status: "ok", service: "webuild-api" });
  });

  app.use("/api", apiRoutes);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
