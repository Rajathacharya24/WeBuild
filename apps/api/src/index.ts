import { createApp } from "./app.js";
import { prisma } from "./db.js";
import { env } from "./env.js";

const app = createApp();
const server = app.listen(env.API_PORT, () => {
  console.log(`WeBuild API listening on http://localhost:${env.API_PORT}`);
});

async function shutdown(signal: string): Promise<void> {
  console.log(`Received ${signal}. Shutting down.`);
  server.close(() => {
    void prisma.$disconnect().finally(() => process.exit(0));
  });
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
