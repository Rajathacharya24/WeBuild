import { describe, expect, it } from "vitest";
import {
  calculateAverageRating,
  computeTrendingScore,
  haversineKm,
  roundKm,
  trendLabelForRank
} from "../src/index.js";

const bangaloreCenter = { lat: 12.9716, lng: 77.5946 };
const lalbagh = { lat: 12.9507, lng: 77.5848 };
const nandiHills = { lat: 13.3702, lng: 77.6835 };

describe("haversineKm", () => {
  it("returns zero for the same point", () => {
    expect(haversineKm(bangaloreCenter, bangaloreCenter)).toBe(0);
  });

  it("calculates a short Bangalore city distance", () => {
    const km = haversineKm(bangaloreCenter, lalbagh);
    expect(km).toBeGreaterThan(2);
    expect(km).toBeLessThan(3.5);
    expect(roundKm(km)).toBeGreaterThan(0);
  });

  it("calculates the longer Nandi Hills distance", () => {
    expect(haversineKm(bangaloreCenter, nandiHills)).toBeGreaterThan(40);
    expect(haversineKm(bangaloreCenter, nandiHills)).toBeLessThan(55);
  });
});

describe("calculateAverageRating", () => {
  it("returns an empty summary for no ratings", () => {
    expect(calculateAverageRating([])).toEqual({ average: 0, count: 0 });
  });

  it("averages ratings and rounds to one decimal", () => {
    expect(calculateAverageRating([4, 5, 4])).toEqual({ average: 4.3, count: 3 });
  });

  it("keeps half-star precision", () => {
    expect(calculateAverageRating([4, 5])).toEqual({ average: 4.5, count: 2 });
  });
});

describe("computeTrendingScore", () => {
  it("weights saves and ratings above views", () => {
    expect(
      computeTrendingScore({ recentRatings: 2, recentViews: 10, recentSaves: 1 })
    ).toBe(21);
  });

  it("increases as any positive signal increases", () => {
    const base = computeTrendingScore({
      recentRatings: 1,
      recentViews: 1,
      recentSaves: 1
    });
    const boosted = computeTrendingScore({
      recentRatings: 2,
      recentViews: 1,
      recentSaves: 1
    });
    expect(boosted).toBeGreaterThan(base);
  });
});

describe("trendLabelForRank", () => {
  it("labels the top ranks", () => {
    expect(trendLabelForRank(1)).toBe("Surging");
    expect(trendLabelForRank(2)).toBe("Hot");
    expect(trendLabelForRank(4)).toBe("Trending");
  });
});
