import type { PlaceRef, Profile } from "@webuild/shared";
import { prisma } from "../db.js";
import { ApiError } from "../http/errors.js";
import { ratingSummary, toAuthUser, toWeekendPlan } from "../utils/serializers.js";
import { planInclude } from "./plans-service.js";

export async function getProfile(userId: string): Promise<Profile> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      ratings: {
        include: {
          place: {
            include: { ratings: { select: { rating: true } } }
          }
        },
        orderBy: { updatedAt: "desc" }
      },
      savedPlans: {
        include: { plan: { include: planInclude } },
        orderBy: { createdAt: "desc" }
      },
      savedPlaces: {
        include: {
          place: {
            include: { ratings: { select: { rating: true } } }
          }
        },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  const toPlaceRef = (place: (typeof user.savedPlaces)[number]["place"]): PlaceRef => {
    const summary = ratingSummary(place.ratings);
    return {
      id: place.id,
      slug: place.slug,
      name: place.name,
      category: place.category as PlaceRef["category"],
      area: place.area,
      imageUrl: place.imageUrl,
      rating: summary.rating,
      ratingCount: summary.ratingCount
    };
  };

  const ratings = user.ratings.map((rating) => ({
    id: rating.id,
    rating: rating.rating,
    comment: rating.comment,
    createdAt: rating.createdAt.toISOString(),
    updatedAt: rating.updatedAt.toISOString(),
    place: toPlaceRef(rating.place)
  }));

  return {
    user: toAuthUser(user),
    stats: {
      ratings: ratings.length,
      savedPlans: user.savedPlans.length,
      savedPlaces: user.savedPlaces.length,
      placesVisited: new Set(ratings.map((rating) => rating.place.id)).size
    },
    ratings,
    savedPlans: user.savedPlans.map((item) => toWeekendPlan(item.plan, true)),
    savedPlaces: user.savedPlaces.map((item) => toPlaceRef(item.place))
  };
}
