# 🌍 WeBuild

> Discover what's nearby, track every trip, and let AI plan your next adventure.

WeBuild is a location-based travel app that shows the places closest to you, keeps a record of everywhere you've been, and uses AI to recommend and plan trips. It is designed to scale from a small prototype into a large product.

---

## ✨ Features

### 📍 Nearby Places
- Live location detection with a manual-location fallback
- Nearest places on a map and in a list (restaurants, cafes, hotels, tourist spots, hospitals, ATMs, petrol pumps, and more)
- Filter by category, distance radius, rating, and open now
- Sort by distance, rating, or popularity
- Place details: photos, rating, address, hours, distance, directions, save to favorites

### 👤 Profile and Travel Stats
- Total places visited
- Total trips taken
- Total distance travelled (km)
- Cities and countries visited, with a map of visited places
- Travel timeline and history
- Favorites and saved places
- Badges and achievements (e.g. "10 cities visited")
- Monthly and yearly charts
- Editable profile, avatar, bio, and privacy settings

### 🤖 AI Features
- **AI trip planner**: destination, days, budget, and interests become a day-wise itinerary
- **Smart recommendations** based on your history, location, time, and weather
- **AI chat assistant** to ask about a place or plan your day
- **Trip summaries** and a yearly "Travel Wrapped" recap
- **Natural language search**, e.g. "quiet cafe with wifi near me"

---

## 🏗️ Architecture

WeBuild starts as a **modular monolith** that can later be split into microservices (user, places, trips, stats, AI, notifications).

```
Client (Web / Mobile)
        │
   REST API  (/api/v1)
        │
┌───────┴────────────────────────────┐
│  Auth │ Places │ Trips │ Stats │ AI │
└───────┬────────────────────────────┘
        │
 PostgreSQL + PostGIS    Redis (cache, rate limit)    Job queue
        │
 Maps/Places provider (abstracted)    LLM provider (abstracted)
```

### Tech Stack

| Layer | Technology |
|---|---|
| Backend | `[Java Spring Boot / your stack]` |
| Frontend | `[React / Next.js / React Native / Flutter]` |
| Database | PostgreSQL + PostGIS |
| Cache | Redis |
| Auth | JWT + Google OAuth |
| Maps | `[Google Places / Mapbox / OpenStreetMap]` |
| AI | `[LLM API of your choice]` behind an `AIService` interface |
| DevOps | Docker, docker-compose, GitHub Actions |
| Docs | Swagger / OpenAPI |

---

## 🗄️ Core Data Model

`users` · `places` · `visits` · `trips` · `trip_points` · `favorites` · `badges` · `ai_requests`

- A **visit** is recorded on check-in or after staying near a place for a set time.
- A **trip** is a group of visits with a start and end.
- **Distance** is calculated from GPS points using the Haversine formula, with noise filtering.

---

## 🚀 Getting Started

### Prerequisites
- Git
- Docker and docker-compose
- `[Java 17+ / Node.js 18+ / your runtime]`

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/webuild.git
cd webuild

# 2. Copy environment variables
cp .env.example .env
# then fill in your API keys (maps, AI, OAuth)

# 3. Start the services
docker-compose up -d

# 4. Run the backend
# [add your command here, e.g. ./mvnw spring-boot:run]

# 5. Run the frontend
# [add your command here, e.g. npm install && npm run dev]
```

### Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_SECRET` | Secret used to sign tokens |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `MAPS_API_KEY` | Maps/Places provider key |
| `AI_API_KEY` | LLM provider key |

> Never commit your `.env` file.

---

## 📁 Project Structure

```
webuild/
├── backend/
│   ├── auth/
│   ├── places/
│   ├── trips/
│   ├── stats/
│   └── ai/
├── frontend/
├── docker-compose.yml
├── .env.example
└── README.md
```

*(Update this to match your actual folders.)*

---

## 🗺️ Roadmap

- [x] Starter code and initial commits
- [ ] Phase 1: Project setup and cleanup of old code
- [ ] Phase 2: Auth and user profile
- [ ] Phase 3: Nearby places (backend, then UI)
- [ ] Phase 4: Visits, trips, and stats dashboard
- [ ] Phase 5: AI features
- [ ] Phase 6: Caching, performance, tests, deployment
- [ ] Future: social sharing, offline maps, group trips, premium plans

---

## 🤝 Contributing

1. Fork the repo and create a branch: `git checkout -b feat/your-feature`
2. Use conventional commits: `feat:`, `fix:`, `refactor:`, `chore:`
3. Never rewrite shared history (no force-push to `main`)
4. Open a pull request with a clear description

---

## 🧪 Testing

```bash
# [add your test command here]
```

Tests cover the nearest-place query, stats calculation, and authentication.

---

## 📄 License

[MIT](LICENSE) © `[Your Name]`

---

## 📬 Contact

Built by **[Your Name]** · `[email / LinkedIn / GitHub]`# WeBuild
