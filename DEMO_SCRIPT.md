# CareerTrace.AI — Demo Script (≈3 min)

> **Goal of the demo:** show that CareerTrace turns a LinkedIn URL + a goal title into **explainable, real career paths** powered by **CrustData Person API** + AI insights — and surfaces *non-obvious* mentors, not just the boring "SWE → Senior SWE → EM" path.

**Your demo profile:** your own LinkedIn  
**Your goal:** **Engineering Manager**

---

## 0 · Before you hit record (60 sec sanity)

1. App is at **http://localhost:3001** (or whatever port the dev server settled on — check `terminals/3.txt`).
2. Toggle **light mode** for the demo (more contrast on screen recording).
3. Have **one** real demo profile pre-typed in case your own LinkedIn 502s:
   - `https://www.linkedin.com/in/jeffweiner08/` → goal `Engineering Manager` (always works, deep cache).
4. Close every other browser tab.
5. Open the app, **don't** submit yet.

---

## 1 · The hook — 20 sec

> "Career advice on LinkedIn is mostly survivorship bias. We built **CareerTrace** so the advice is the *receipts*: real people who actually made the jump you want to make, why their path is similar to yours, and how to message them."

Show the landing page. Cursor on the hero headline.

---

## 2 · The trace — 60 sec

1. Paste **your LinkedIn URL** into the input.
2. Type **`Engineering Manager`** as the goal.
3. Click **Trace my path**.
4. While the loader runs, narrate:

> "Under the hood we're hitting **CrustData's Person API**. First we *enrich* this profile, then we run a **6-tier cascade search** — each tier is a different definition of ‘similar to you’. We start with the most precise (people who worked at your company AND in your role family AND are now Engineering Managers), and fall back if we don't have enough. Every tier shows the population it searched, so the answer is honest: ‘12 of 4,812 matches.’"

When results land, the dialog/grid appears.

---

## 3 · The grid — 30 sec

Scroll through the results page. Point to:

- **Tier badges** ("T1 Same company + same role · Atlassian", "T4 Same college") — these are the *explainability primitives*. Judges love these.
- **`X% path match`** — AI-derived similarity score across education, early career, industry, skills.
- **`⭐ N overlaps with you` chip** — only fires on **same company / same exact title / same school / same degree**. (We made this strict on purpose. No "kinda similar role" noise.)
- **Found-via reasoning** — "Worked at your current company in the same role family, now at the goal title."

> "You're not looking at scraped LinkedIn rows. Each card explains *why* it's relevant to **you**, not why it's relevant in general."

---

## 4 · Open one journey — 60 sec (this is your money shot)

Open a candidate whose journey is **non-obvious** — pick someone who became EM but **did NOT come from a pure-SWE-ladder background** (e.g. PM → EM, designer → EM, support → EM). Tier 2 ("Same company, any role → goal") is where these usually surface.

1. Show the **full journey timeline**: schools, every degree, every job, with dates.
2. Point at any **amber-highlighted row** — that's a *strict* overlap with you (same company, same school, same exact title). Hover the chip; it shows what you have that overlaps.
3. Read the **AI "Why this path is similar"** card aloud. Highlight the four sub-scores (Education / Early career / Industry / Skills).
4. Click **Draft an intro message**. Show the personalized note we generate (also AI, also explainable — uses the overlap as the hook).

> "This is the killer demo: the path from your IIIT-Hyderabad B.Tech to *Engineering Manager* doesn't have to be linear. Here's someone who took a left turn at year 4 — and the system can pre-write the message that gets you a coffee chat."

If you have time, copy the message and show "Open LinkedIn" — proves it's actually shippable.

---

## 5 · Close — 20 sec

> "Every search costs us about $0.02 in CrustData credits and one OpenRouter call. We surface paths nobody else does because we *cascade* — same company first, then same school, then same metro. And we explain every choice. CareerTrace, built on CrustData. Thanks."

Cut. Done.

---

## What the judges will check after watching

- ✅ **Real CrustData usage** → shown via "Powered by CrustData" pill in the header (click it: lists the actual endpoints we hit).
- ✅ **Explainability** → tier badges + reasoning + sub-scores + strict overlap chips.
- ✅ **AI integration** → "Why this path is similar" + outreach drafter (OpenRouter).
- ✅ **Non-obvious value** → cascade tier 2/3/4 surfaces career switchers, not just the linear ladder.

---

## Cheat sheet — phrases to drop verbatim

- "Cascade in descending precision."
- "Same company AND same role family — now at the goal title."
- "Strict overlap chips — same exact company, school, or title. No fuzzy noise."
- "Honest population count — '8 of 4,812 matches' beats 'we found people'."
- "AI-drafted outreach grounded in your overlap."
- "Built on the CrustData Person API."

---

## Backup if your own profile fails on demo day

Use one of these — they're cached and reliable:

| URL | Goal | Why |
|---|---|---|
| `https://www.linkedin.com/in/jeffweiner08/` | `Engineering Manager` | Big SWE-→-leadership tree |
| `https://www.linkedin.com/in/williamhgates/` | `Product Manager` | Diverse non-circular paths |
| `https://www.linkedin.com/in/satyanadella/` | `Data Scientist` | Engineer → data switchers |

---

## Surfacing non-circuital backgrounds for the EM demo

The **6-tier cascade** already does this for you — you don't have to change anything:

| Tier | Filter | Surfaces |
|---|---|---|
| **T1** | same company **+** same role family → EM | The "linear ladder" people |
| **T2** | same company → EM (any role) | **PMs / designers / TPMs / IC switchers who became EMs** ← the non-obvious ones |
| **T3** | same school **+** same degree → EM | IIIT-H B.Tech alumni who became EMs anywhere |
| **T4** | same school → EM | All IIIT-H alumni who became EMs |
| **T5** | same metro + same role family → EM | Local network |
| **T6** | broad goal title only | Last-resort fallback |

**During the demo, deliberately scroll to a Tier 2 card and open it.** The candidate's first job will *not* be Software Engineer — that's the moment that makes you stand out. Say:

> "Notice this person's first role was actually a Product Analyst, not an engineer. CareerTrace pulls in the lateral paths into Engineering Management — not just the obvious ladder. That's the difference between this and a LinkedIn search."
