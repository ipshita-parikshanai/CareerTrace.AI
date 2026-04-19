# CareerTrace.AI

Career path discovery: trace a goal role from your LinkedIn profile using real histories, **CrustData** Person API, and AI insights. Built for the CrustData hackathon.

## Documentation (this repo)

| Doc | Purpose |
|-----|---------|
| **[README.md](./README.md)** (this file) | Setup and overview |
| **[API_FIX_GUIDE.md](./API_FIX_GUIDE.md)** | CrustData / API troubleshooting |
| **[DEMO_SCRIPT.md](./DEMO_SCRIPT.md)** | Demo walkthrough |

**CrustData reference (committee / vendor markdown):** [`crustdata_new_api_doc/`](./crustdata_new_api_doc/) — `person.md`, `company.md`, `web.md`.

## Repo layout

```
CareerTrace/
├── README.md
├── API_FIX_GUIDE.md
├── DEMO_SCRIPT.md
├── app/                 # Next.js App Router
├── components/
├── lib/
├── public/
├── crustdata_new_api_doc/   # CrustData API reference markdown
```

## Quick start

From the **repository root**:

```bash
npm install
cp .env.example .env.local
# Edit .env.local: CRUSTDATA_API_KEY, OPENROUTER_API_KEY, Supabase, etc.
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Supabase:** apply `lib/supabase/schema.sql` in the Supabase SQL editor if you use a fresh database.

## Hosting (Vercel / similar)

Root directory is the Next.js app: set **Root Directory** to `.` (or leave default), **Build command** `npm run build`, **Output** handled by Next.js.

## Environment variables

Configure in **`.env.local`** (see `.env.example`). Do **not** commit real keys.

- `CRUSTDATA_API_KEY` — Person enrich + search  
- `OPENROUTER_API_KEY` — insights + outreach  
- `NEXT_PUBLIC_SUPABASE_*` — profile cache / shared traces  
- `NEXT_PUBLIC_APP_URL` — your public URL in production  

## License & team

Built for a hackathon submission. Adjust license and authors when you publish.
