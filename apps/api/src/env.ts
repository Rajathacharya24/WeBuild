import { existsSync } from "node:fs";
import path from "node:path";
import { config } from "dotenv";
import { z } from "zod";

const envFiles = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "../../.env"),
  path.resolve(process.cwd(), "../.env")
];

const envFile = envFiles.find((file) => existsSync(file));
if (envFile) {
  config({ path: envFile });
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  WEB_ORIGIN: z.string().default("http://localhost:5173"),
  DATABASE_URL: z.string().min(1).default("file:./dev.db"),
  JWT_SECRET: z.string().min(16).default("dev-only-secret-change-me"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  AI_PROVIDER: z.enum(["openai", "none"]).default("openai"),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default("gpt-4o-mini")
});

export const env = envSchema.parse(process.env);

if (
  env.NODE_ENV === "production" &&
  (env.JWT_SECRET === "dev-only-secret-change-me" ||
    env.JWT_SECRET.includes("replace-with-a-long-random-string"))
) {
  throw new Error("Set a strong JWT_SECRET before running in production.");
}
