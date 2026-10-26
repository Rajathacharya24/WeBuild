# WeBuild — Discover Bangalore

WeBuild is a mobile-first web app for finding places, following weekend plans and
seeing what Bangalore is into this week. It combines a map-led home page with
keyword search, an optional AI search layer, place ratings, saved plans and a
7-day trending chart.

## Stack

| Layer    | Technology                                                                 |
| -------- | -------------------------------------------------------------------------- |
| Web      | React 18, Vite, TypeScript, Tailwind CSS, React Router, React-Leaflet, PWA |
| API      | Node.js, Express, TypeScript, Zod, JWT, bcrypt                             |
| Database | SQLite + Prisma                                                            |
| Shared   | TypeScript + Zod contracts used by both web and API                        |

The repository is an npm-workspace monorepo:

```
apps/
  api/       Express API, Prisma schema, migrations, seed data
  web/       React SPA (installable PWA)
packages/
  shared/    Shared types, Zod schemas and pure business helpers
```

## Getting started

Requirements: Node.js 20+ and npm 10+.

```bash
cp .env.example .env
# Set a real JWT secret:
#   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

npm run setup   # installs dependencies, generates Prisma client, migrates + seeds
npm run dev     # API on :4000, web on :5173
```

`npm run setup` is a shortcut for:

```bash
npm install
npm run db:generate
npm run db:deploy
npm run db:seed
```

Demo account: `demo@webuild.app` / `demo1234`. The seed creates 34 Bangalore
places, 6 weekend plans and 8 demo users.

## Environment variables

All variables live in the repository-root `.env` (loaded by Vite and the API).

| Variable         | Default                 | Purpose                                             |
| ---------------- | ----------------------- | --------------------------------------------------- |
| `NODE_ENV`       | `development`           | Runtime mode                                        |
| `API_PORT`       | `4000`                  | Express port                                        |
| `WEB_ORIGIN`     | `http://localhost:5173` | Allowed CORS origin(s), comma-separated             |
| `DATABASE_URL`   | `file:./dev.db`         | SQLite file, relative to `apps/api/prisma`          |
| `JWT_SECRET`     | —                       | Signing secret; required outside development        |
| `JWT_EXPIRES_IN` | `7d`                    | Token lifetime                                      |
| `AI_PROVIDER`    | `openai`                | AI provider name                                    |
| `OPENAI_API_KEY` | empty                   | Optional; without it AI search uses keyword fallback |
| `OPENAI_MODEL`   | `gpt-4o-mini`           | Chat model used for ranking                         |
| `VITE_API_URL`   | `http://localhost:4000` | API base URL baked into the web build               |

## Scripts

| Command              | What it does                                    |
| -------------------- | ----------------------------------------------- |
| `npm run dev`        | Run API and web together                        |
| `npm run build`      | Type-check and build shared, API and web        |
| `npm run typecheck`  | Type-check every workspace                      |
| `npm test`           | Run shared and API unit tests (Vitest)          |
| `npm run db:migrate` | Create/apply a migration in development         |
| `npm run db:deploy`  | Apply committed migrations (CI/production)      |
| `npm run db:seed`    | Reset seed data (idempotent)                    |
| `npm run db:studio`  | Open Prisma Studio                              |

## API

Base URL: `/api`. Authenticated requests use `Authorization: Bearer <token>`.

| Method   | Path                        | Auth | Description                                   |
| -------- | --------------------------- | ---- | --------------------------------------------- |
| `GET`    | `/health`                   | —    | Health check                                  |
| `POST`   | `/auth/register`            | —    | Create account                                |
| `POST`   | `/auth/login`               | —    | Log in                                        |
| `GET`    | `/auth/me`                  | Yes  | Current user                                  |
| `GET`    | `/places`                   | Opt. | List/filter places (`q`, `category`, `lat`, `lng`, `limit`) |
| `GET`    | `/places/:slug`             | Opt. | Place detail, photos and recent ratings       |
| `POST`   | `/places/:slug/ratings`     | Yes  | Create or update your rating                  |
| `POST`   | `/places/:slug/save`        | Yes  | Save a place                                  |
| `DELETE` | `/places/:slug/save`        | Yes  | Remove a saved place                          |
| `GET`    | `/plans`                    | Opt. | Weekend plans with stops                      |
| `POST`   | `/plans/:slug/save`         | Yes  | Save a plan                                   |
| `DELETE` | `/plans/:slug/save`         | Yes  | Unsave a plan                                 |
| `GET`    | `/me`                       | Yes  | Profile, stats, ratings, saved items           |
| `GET`    | `/trending`                 | Opt. | Weekly ranking (`lat`, `lng`, `limit`)         |
| `POST`   | `/search/ai`                | Opt. | AI/keyword search                             |

### Search and distance

- `GET /places` accepts `lat`/`lng` and returns a `distanceKm` for each place
  using the Haversine formula in `packages/shared/src/utils.ts`.
- `POST /search/ai` sends the query and candidate places to the configured LLM
  provider. If no API key is configured (or the provider fails), it returns
  keyword matches with `source: "fallback"` so the UI still works.
- Trending score = `ratings × 3 + views × 1 + saves × 5`, counted over the last
  seven days.

## Data model

`User`, `Place`, `PlacePhoto`, `Rating`, `WeekendPlan`, `PlanStop`, `SavedPlan`,
`SavedPlace` and `ActivityEvent`. A user has at most one rating per place; posting
again updates it. Seeded content lives in `apps/api/prisma/data/`.

## App configuration

Branding, city and map defaults are centralised in `apps/web/app.config.ts`.
Change the app name, short name, theme colours or default map centre there — the
UI, page title and PWA manifest read from it.

## Design system

- White surfaces with a green accent: `#16A34A` primary, `#166534` dark,
  `#F0FDF4` tint.
- Tokens are CSS variables in `apps/web/src/index.css` and Tailwind theme
  extensions in `apps/web/tailwind.config.ts`.
- Mobile-first layout: the map occupies roughly half the viewport on phones,
  with responsive grids for cards and plans.
- Reusable primitives live in `apps/web/src/components/ui/`.
- All network access goes through `apps/web/src/lib/api.ts`, keeping UI
  components independent of transport details.

## Testing and quality

```bash
npm run typecheck
npm test
npm run build
```

The tests cover distance/rating/trending helpers and shared validation, plus API
request validation. The web build is a PWA with offline caching for app assets,
Unsplash place photos and OpenStreetMap tiles.

## Deployment notes

- Build with `npm run build`; serve `apps/web/dist` from a static host and
  `apps/api/dist/index.js` with `node` (set the env vars above).
- Run `npm run db:deploy && npm run db:seed` once against the production
  database, or migrate your own.
- Set a strong `JWT_SECRET`, restrict `WEB_ORIGIN`, and keep `OPENAI_API_KEY`
  server-side only.
- SPA routing needs a fallback to `index.html` (Vite preview and most static
  hosts handle this; configure rewrites otherwise).

## Credits

Map data © OpenStreetMap contributors. Place photography via Unsplash. Weekend
plan and place copy is original seed content for demo purposes.
