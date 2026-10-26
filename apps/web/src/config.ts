import { APP_CONFIG } from "../app.config";

export const appConfig = {
  ...APP_CONFIG,
  apiUrl: (import.meta.env.VITE_API_URL ?? "http://localhost:4000").replace(/\/$/, "")
};
