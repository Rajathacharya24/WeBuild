# WeBuild — Discover Bangalore

WeBuild is a mobile-first web app for finding places, following weekend plans and
seeing what Bangalore is into this week. It combines a map-led home page with
keyword search, an optional AI search layer, place ratings, saved plans and a
7-day trending chart.

## Screenshots

<!-- Replace these placeholders with real screenshots, e.g. docs/screenshots/home.png -->

| Home (map + search) | Place detail | Weekend plans | Trending |
| ------------------- | ------------ | ------------- | -------- |
| _add screenshot_    | _add screenshot_ | _add screenshot_ | _add screenshot_ |

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
# 1) Clone and enter the project
git clone <repo-url> WeBuild
cd WeBuild

# 2) Copy env and set a JWT secret
cp .env.example .env
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
# Paste the generated value into JWT_SECRET in .env

# 3) Install deps + set up the database
npm install
npm run db:generate
npm run db:deploy
npm run db:seed

# 4) Start the app
npm run dev
```

- API: http://localhost:4000
- Web: http://localhost:5173
- Demo login (local development only): `demo@webuild.app` / `demo1234`

`npm run setup` is a shortcut for step 3:

```bash
npm install
npm run db:generate
npm run db:deploy
npm run db:seed
```

The seed creates 34 Bangalore places, 6 weekend plans and 8 demo users.

> **Warning:** The seed data and demo credentials are for local development and
> demos only. Do **not** run `db:seed` against a production database, and never
> leave the demo account (`demo@webuild.app` / `demo1234`) enabled in production.

## Environment variables

All variables live in the repository-root `.env` (loaded by Vite and the API).

| Variable         | Default                 | Purpose                                              |
| ---------------- | ----------------------- | ---------------------------------------------------- |
| `NODE_ENV`       | `development`           | Runtime mode                                         |
| `API_PORT`       | `4000`                  | Express port                                         |
| `WEB_ORIGIN`     | `http://localhost:5173` | Allowed CORS origin(s), comma-separated              |
| `DATABASE_URL`   | `file:./dev.db`         | SQLite file, relative to `apps/api/prisma`           |
| `JWT_SECRET`     | —                       | Signing secret; required outside development         |
| `JWT_EXPIRES_IN` | `7d`                    | Token lifetime                                       |
| `AI_PROVIDER`    | `openai`                | AI provider name                                     |
| `OPENAI_API_KEY` | empty                   | Optional; without it AI search uses keyword fallback |
| `OPENAI_MODEL`   | `gpt-4o-mini`           | Chat model used for ranking                          |
| `VITE_API_URL`   | `http://localhost:4000` | API base URL baked into the web build                |

## Scripts

| Command              | What it does                                                                 |
| -------------------- | ---------------------------------------------------------------------------- |
| `npm run dev`        | Run API and web together                                                     |
| `npm run build`      | Type-check and build shared, API and web                                     |
| `npm run typecheck`  | Type-check every workspace                                                   |
| `npm test`           | Run shared and API unit tests (Vitest)                                       |
| `npm run db:migrate` | Create/apply a migration in development                                      |
| `npm run db:deploy`  | Apply committed migrations (CI/production)                                   |
| `npm run db:seed`    | Re-create the demo data (places, plans, demo users); safe to re-run. **Dev/demo only — never run in production** |
| `npm run db:studio`  | Open Prisma Studio                                                           |

## API

Base URL: `/api`. Authenticated requests use `Authorization: Bearer <token>`.

| Method   | Path                    | Auth | Description                                                 |
| -------- | ----------------------- | ---- | ----------------------------------------------------------- |
| `GET`    | `/health`               | —    | Health check                                                |
| `POST`   | `/auth/register`        | —    | Create account                                              |
| `POST`   | `/auth/login`           | —    | Log in                                                      |
| `GET`    | `/auth/me`              | Yes  | Current user                                                |
| `GET`    | `/places`               | Opt. | List/filter places (`q`, `category`, `lat`, `lng`, `limit`) |
| `GET`    | `/places/:slug`         | Opt. | Place detail, photos and recent ratings                     |
| `POST`   | `/places/:slug/ratings` | Yes  | Create or update your rating                                |
| `POST`   | `/places/:slug/save`    | Yes  | Save a place                                                |
| `DELETE` | `/places/:slug/save`    | Yes  | Remove a saved place                                        |
| `GET`    | `/plans`                | Opt. | Weekend plans with stops                                    |
| `POST`   | `/plans/:slug/save`     | Yes  | Save a plan                                                 |
| `DELETE` | `/plans/:slug/save`     | Yes  | Unsave a plan                                               |
| `GET`    | `/me`                   | Yes  | Profile, stats, ratings, saved items                        |
| `GET`    | `/trending`             | Opt. | Weekly ranking (`lat`, `lng`, `limit`)                      |
| `POST`   | `/search/ai`            | Opt. | AI/keyword search                                           |

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
- Run `npm run db:deploy` against the production database to apply migrations.
  Do **not** run `db:seed` in production; it loads demo data and demo accounts.
  If you need starter content, load your own data instead.
- Set a strong `JWT_SECRET`, restrict `WEB_ORIGIN`, and keep `OPENAI_API_KEY`
  server-side only.
- SPA routing needs a fallback to `index.html` (Vite preview and most static
  hosts handle this; configure rewrites otherwise).

## Contributing

Contributions are welcome.

1. Fork the repository and create a branch: `git checkout -b feature/your-change`
2. Make your changes, keeping shared types and Zod schemas in `packages/shared`
3. Run `npm run typecheck && npm test && npm run build` and make sure all pass
4. Commit with a clear message and open a pull request describing what changed and why

For larger changes, please open an issue first to discuss the approach.

## License

Released under the [MIT License](LICENSE). Add a `LICENSE` file to the repository
root (or replace this section if you choose a different license).
