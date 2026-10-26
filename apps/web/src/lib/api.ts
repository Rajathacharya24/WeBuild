import type {
  AiSearchInput,
  AiSearchResponse,
  AuthResponse,
  AuthUser,
  LoginInput,
  PlaceDetail,
  PlaceSummary,
  Profile,
  RegisterInput,
  TrendingPlace,
  WeekendPlan
} from "@webuild/shared";
import { appConfig } from "@/config";
import { getToken } from "./storage";

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "DELETE";
  body?: unknown;
}

function buildQuery(params: object): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers();
  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${appConfig.apiUrl}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined
    });
  } catch {
    throw new ApiClientError(
      "Cannot reach the WeBuild API. Check that the backend is running.",
      0
    );
  }

  if (!response.ok) {
    let payload: { message?: string; details?: unknown } | null = null;
    try {
      payload = (await response.json()) as { message?: string; details?: unknown };
    } catch {
      payload = null;
    }
    throw new ApiClientError(
      payload?.message ?? "The request failed. Please try again.",
      response.status,
      payload?.details
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export interface PlacesQuery {
  lat?: number;
  lng?: number;
  q?: string;
  category?: string;
  limit?: number;
}

export interface TrendingQuery {
  lat?: number;
  lng?: number;
  limit?: number;
}

export const api = {
  getPlaces(params: PlacesQuery = {}): Promise<PlaceSummary[]> {
    return request(`/api/places${buildQuery(params)}`);
  },

  getPlace(idOrSlug: string): Promise<PlaceDetail> {
    return request(`/api/places/${encodeURIComponent(idOrSlug)}`);
  },

  ratePlace(
    idOrSlug: string,
    input: { rating: number; comment?: string }
  ): Promise<PlaceDetail> {
    return request(`/api/places/${encodeURIComponent(idOrSlug)}/ratings`, {
      method: "POST",
      body: input
    });
  },

  savePlace(idOrSlug: string): Promise<{ saved: boolean }> {
    return request(`/api/places/${encodeURIComponent(idOrSlug)}/save`, {
      method: "POST"
    });
  },

  unsavePlace(idOrSlug: string): Promise<{ saved: boolean }> {
    return request(`/api/places/${encodeURIComponent(idOrSlug)}/save`, {
      method: "DELETE"
    });
  },

  getPlans(): Promise<WeekendPlan[]> {
    return request("/api/plans");
  },

  savePlan(idOrSlug: string): Promise<{ saved: boolean }> {
    return request(`/api/plans/${encodeURIComponent(idOrSlug)}/save`, {
      method: "POST"
    });
  },

  unsavePlan(idOrSlug: string): Promise<{ saved: boolean }> {
    return request(`/api/plans/${encodeURIComponent(idOrSlug)}/save`, {
      method: "DELETE"
    });
  },

  getTrending(params: TrendingQuery = {}): Promise<TrendingPlace[]> {
    return request(`/api/trending${buildQuery(params)}`);
  },

  aiSearch(input: AiSearchInput): Promise<AiSearchResponse> {
    return request("/api/search/ai", { method: "POST", body: input });
  },

  register(input: RegisterInput): Promise<AuthResponse> {
    return request("/api/auth/register", { method: "POST", body: input });
  },

  login(input: LoginInput): Promise<AuthResponse> {
    return request("/api/auth/login", { method: "POST", body: input });
  },

  getMe(): Promise<AuthUser> {
    return request("/api/auth/me");
  },

  getProfile(): Promise<Profile> {
    return request("/api/me");
  }
};
