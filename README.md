# CareerTrace.AI

**Trace real paths to your next role — from people who once stood where you stand.**

CareerTrace turns LinkedIn into a lens: you pick your profile and a goal title, and we surface **real journeys** of professionals who share concrete background with you (same company, school, city) and have **reached that goal** — plus concise AI insights and optional outreach drafts.

---

## Why we built this

Career decisions are high-stakes, but most advice is generic. LinkedIn shows *who* people are today, not the **path** they took to get there. We wanted something grounded in **real outcomes**: timelines, overlaps, and “people like me who made the jump.”

---

## How it works today (technical)

- **CrustData v2 Person API** (`/person/enrich`, `/person/search`) with `Bearer` auth and `x-api-version: 2025-11-01`.
- **Cascade search**: we ask CrustData in order — same employer + role → same employer → same college (+ degree) → same college → same city + role → broad goal title — and stop once we have enough candidates. Each result shows **which tier** it came from and **how many people** matched that tier (`total_count`).
- **Ranking** stays heuristic and anchor-driven; one main LLM call summarizes patterns across journeys.
- **Women role models**: a small **curated** sidebar (hand-picked names in `data/women-mentors.json`) — not inferred from gender.

Detailed architecture: see `**crusdata_api_doc/ARCHITECTURE.md`** in the monorepo (if present).

---

## Who can use it / limits

- **Your profile must exist in CrustData.** We call **enrich** on your LinkedIn URL first. If CrustData has never indexed that person, enrich returns **no match** — the app responds with **404** and a clear message (not a payment error).
- **Search** finds *other* people in CrustData’s database who match your goal and shared background. Coverage depends on CrustData’s index (typically stronger for larger employers and well-known schools).
- If someone isn’t indexed: use **another public profile** CrustData already has for the demo, or ask **CrustData** about indexing or realtime enrichment options for your account.

---

## Repo layout (monorepo)

```
PeopleLikeMe/
  careertrace/          ← this README (product + migration notes)
  pathfinder/           ← Next.js app (clone this folder into your new repo root if you prefer)
  crusdata_api_doc/     ← optional API / architecture docs
```

---

## Moving to a **new** Git repository

1. **Create** the new repo on GitHub (empty, no README if you want a clean import).
2. **Copy the app** — either:
  - push the whole `PeopleLikeMe` monorepo, or  
  - copy only `pathfinder/` into the new repo root and commit that as your app.
3. **Environment** — copy **values** from your old machine’s `pathfinder/.env.local` into the new repo’s `pathfinder/.env.local` (create it next to `.env.example`). Do **not** commit `.env.local`.
  Variables you need:

  | Variable                        | Purpose                                        |
  | ------------------------------- | ---------------------------------------------- |
  | `CRUSTDATA_API_KEY`             | CrustData v2 API (required)                    |
  | `CRUSTDATA_API_URL`             | Usually `https://api.crustdata.com`            |
  | `OPENROUTER_API_KEY`            | Insights + outreach (required for AI features) |
  | `AI_MODEL`                      | OpenRouter model id                            |
  | `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL                           |
  | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key                              |
  | `NEXT_PUBLIC_APP_URL`           | Your site URL in production                    |

4. **Replace** `pathfinder/.env.example` in the new repo with the **template** from this project (placeholders only). Your **real** keys stay only in `.env.local` or your host’s secret store.
5. **Install & run**
  ```bash
   cd pathfinder
   npm install
   cp .env.example .env.local
   # edit .env.local with real keys
   npm run dev
  ```
6. **Supabase**: run `pathfinder/lib/supabase/schema.sql` (or your current schema) on the new project if you use a fresh database.
7. **Clear cache** (optional, after copying DB or for a clean demo):
  ```bash
   curl -X POST 'http://localhost:3000/api/admin/clear-cache?confirm=yes'
  ```

---

## README files: what’s what


| File                                    | Role                                                   |
| --------------------------------------- | ------------------------------------------------------ |
| `**careertrace/README.md**` (this file) | Product story, migration, limits, who it’s for.        |
| `**pathfinder/README.md**`              | Developer setup, stack, structure for the Next.js app. |


Update both when you rename the product or change env vars.

---

## Powered by CrustData

CareerTrace is built on CrustData’s **person enrich** and **person search** (v2). Judges can follow the data path from enrich → cascade tiers → ranked journeys.

---

## License & team

Built for a hackathon submission. Adjust license and authors when you publish.

---

*CareerTrace.AI — real paths, explainable matches, honest AI.*