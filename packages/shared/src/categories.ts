export const PLACE_CATEGORIES = [
  "Nature",
  "Cafe",
  "Food",
  "Heritage",
  "Shopping",
  "Nightlife",
  "Museum",
  "Temple",
  "Entertainment",
  "Art",
  "Neighborhood"
] as const;

export type PlaceCategory = (typeof PLACE_CATEGORIES)[number];
