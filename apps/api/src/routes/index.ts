import { Router } from "express";
import { authRoutes } from "./auth-routes.js";
import { placesRoutes } from "./places-routes.js";
import { plansRoutes } from "./plans-routes.js";
import { profileRoutes } from "./profile-routes.js";
import { searchRoutes } from "./search-routes.js";
import { trendingRoutes } from "./trending-routes.js";

export const apiRoutes = Router();

apiRoutes.use("/auth", authRoutes);
apiRoutes.use("/places", placesRoutes);
apiRoutes.use("/plans", plansRoutes);
apiRoutes.use("/me", profileRoutes);
apiRoutes.use("/trending", trendingRoutes);
apiRoutes.use("/search", searchRoutes);
