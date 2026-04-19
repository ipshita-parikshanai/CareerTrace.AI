# CareerTrace.AI

**Trace real paths to your next role — from people who once stood where you stand.**

CareerTrace turns LinkedIn into a lens: you pick your profile and a goal title, and we surface **real journeys** of professionals who share concrete background with you (school, employer, region) and have **reached that goal** — plus concise AI insights and optional outreach drafts.

---

## Why we built this

Career decisions are high-stakes, but most advice is generic. LinkedIn shows *who* people are today, not the **path** they took to get there. We wanted something grounded in **real outcomes**: not motivational quotes, but timelines, overlaps, and “people like me who made the jump.”

That gap became the core problem statement for our hackathon build.

---

## How we landed on the idea

1. **Start from data, not slides**  
   We asked: *What if every “similar story” was backed by an actual profile and a structured career history?* CrustData’s enrichment and PersonDB search made that technically possible.

2. **“People like me” has to mean something**  
   We rejected vague “similarity scores” as the headline. Instead we prioritized **explainable overlaps** — same school, same employer, same region, same role family — so users can see *why* a match is shown.

3. **Keep AI thin and honest**  
   Ranking stays **heuristic and anchor-driven**; the main LLM call produces **readable insights** (and optional intro drafts on demand). Judges and users can trace claims back to CrustData fields.

4. **Ship a full loop**  
   Input → enrich user → search people who reached the goal → enrich candidates → rank → insights → shareable read-only trace. One coherent product, not a slideware demo.

---

## What you get

| Capability | Description |
|------------|-------------|
| **Similar paths** | Journeys from LinkedIn, normalized and ranked with shared-background priority. |
| **Insights** | Patterns across the returned journeys (timeline, common moves). |
| **Outreach** | Optional AI draft intro per journey card (lazy-loaded). |
| **Trace your friend** | Share a read-only snapshot; compare side-by-side when a friend runs their own trace. |

---

## Tech stack (summary)

- **App:** Next.js (App Router), React, TypeScript, Tailwind CSS  
- **Data:** [CrustData](https://crustdata.com) — profile enrich + PersonDB search  
- **Cache:** Supabase (LinkedIn profile cache, shared traces)  
- **AI:** OpenRouter-compatible API for insights and outreach  

Hackathon reference docs from the organizing committee live in **`crustdata_new_api_doc/`** (person, company, and web API markdown).

---

## Repository layout

This hackathon codebase lives alongside documentation:

```
careertrace/              ← you are here (product README)
pathfinder/               ← Next.js application (main code)
crustdata_new_api_doc/    ← CrustData API reference (committee-provided)
```

**Run the app:**

```bash
cd pathfinder
npm install
cp .env.example .env.local   # add CRUSTDATA_API_KEY, Supabase, OpenRouter, etc.
npm run dev
```

Open `http://localhost:3000`.

---

## Environment variables

Configure in `pathfinder/.env.local` (see `pathfinder/.env.example`):

- `CRUSTDATA_API_KEY` — required for LinkedIn enrich + PersonDB search  
- Supabase URL + keys — profile cache and shared traces  
- OpenRouter (or compatible) — insights + outreach  

**Do not commit real keys.** Use your host’s secrets for production.

---

## Powered by CrustData

CareerTrace is built on CrustData’s **person enrich** and **PersonDB search** primitives — see `crustdata_new_api_doc/person.md` for endpoint details.

---

## License & team

Built for a hackathon submission. Adjust license and authors when you publish the standalone `careertrace` repository.

---

*CareerTrace.AI — real paths, explainable matches, honest AI.*
