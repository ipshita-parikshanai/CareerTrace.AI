> ## Documentation Index
>
> Fetch the complete documentation index at: https://docs.crustdata.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Web APIs

> Search the web and fetch webpage content with the Crustdata Web APIs.

The Web APIs give you programmatic access to web search and webpage content fetching. Search across web, news, academic, deep research mode, and social media sources — or fetch the raw HTML of any public URL.

<CardGroup cols={2}>
  <Card title="Web Search" icon="magnifying-glass" href="/web-docs/search">
    Search the web across 7 source types: web, news, academic articles,
    academic authors, deep research mode, social, and enriched academic.
  </Card>

  <Card title="Web Fetch" icon="download" href="/web-docs/fetch">
    Fetch the HTML content of up to 10 public URLs in one request for
    content extraction and analysis.
  </Card>
</CardGroup>

## At a glance

|                           | Search                                                                        | Fetch                                                  |
| ------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------ |
| **Endpoint**              | `POST /web/search/live`                                                       | `POST /web/enrich/live`                                |
| **Required fields**       | `query`                                                                       | `urls`                                                 |
| **Optional fields**       | `location`, `sources`, `site`, `start_date`, `end_date`, `human_mode`, `page` | `human_mode`                                           |
| **Response shape**        | Object with `success`, `query`, `timestamp`, `results[]`, `metadata`          | Array of `{ success, url, timestamp, title, content }` |
| **Pagination**            | `page` (request multiple pages)                                               | —                                                      |
| **Max items per request** | \~10 results per page _(platform behavior)_                                   | 10 URLs                                                |
| **Timestamp unit**        | Milliseconds                                                                  | Seconds                                                |
| **Error codes**           | `400`, `401`                                                                  | `400`, `401`                                           |

---

## Before you start

You need:

- A Crustdata API key
- A terminal with `curl` (or any HTTP client)
- The required header: `x-api-version: 2025-11-01`

<Snippet file="web-auth-headers.mdx" />

<Note>
  **Convention used in these docs:** Information labeled "OpenAPI contract"
  reflects the formal API specification. Information labeled "Current platform
  behavior" (such as rate limits and credit costs) describes observed behavior
  that may change. See the [API
  reference](/openapi-specs/2025-11-01/introduction) for the formal OpenAPI
  spec.
</Note>

---

## Quickstart: search the web

The fastest way to get started is a simple web search. This single request returns search results with titles, URLs, snippets, and positions.

<CodeGroup>
  ```bash Request theme={"theme":"vitesse-black"}
  curl --request POST \
    --url https://api.crustdata.com/web/search/live \
    --header 'authorization: Bearer YOUR_API_KEY' \
    --header 'content-type: application/json' \
    --header 'x-api-version: 2025-11-01' \
    --data '{
      "query": "crustdata",
      "sources": ["web"],
      "location": "US"
    }'
  ```

```json Response theme={"theme":"vitesse-black"}
{
  "success": true,
  "query": "crustdata",
  "timestamp": 1775195367446,
  "results": [
    {
      "source": "web",
      "title": "Crustdata: Real-Time B2B Data Broker via API or Data Feed",
      "url": "https://crustdata.com/",
      "snippet": "Crustdata is a B2B data provider offering real-time company & people datasets.",
      "position": 1
    },
    {
      "source": "web",
      "title": "Crustdata: Real-time B2B data via simple APIs",
      "url": "https://www.ycombinator.com/companies/crustdata",
      "snippet": "Crustdata provides live company and people data via APIs and full dataset delivery.",
      "position": 2
    }
  ],
  "metadata": {
    "totalResults": 7,
    "failedPages": [],
    "emptyPages": []
  }
}
```

</CodeGroup>

<Note>Response trimmed for clarity.</Note>

The response contains:

- **`success`** — whether the search executed successfully.
- **`results[]`** — an array of search results, each with `source`, `title`, `url`, `snippet`, and `position`.
- **`metadata.totalResults`** — the total number of results available (may exceed the displayed count if you didn't request all pages).

---

## End-to-end: Search → Company Enrich

The most common workflow chains a web search with a downstream Crustdata API call. Here is a complete 3-step example:

<Steps>
  <Step title="Search for a company's website">
    ```bash theme={"theme":"vitesse-black"}
    curl --request POST \
      --url https://api.crustdata.com/web/search/live \
      --header 'authorization: Bearer YOUR_API_KEY' \
      --header 'content-type: application/json' \
      --header 'x-api-version: 2025-11-01' \
      --data '{"query": "ADAMSBROWN, LLC website", "sources": ["web"]}'
    ```

    **Extract:** `results[0].url` → `"https://www.adamsbrowncpa.com/"`

  </Step>

  <Step title="Normalize the URL to a domain">
    ```javascript theme={"theme":"vitesse-black"}
    const domain = new URL("https://www.adamsbrowncpa.com/")
      .hostname.replace("www.", ""); // "adamsbrowncpa.com"
    ```
  </Step>

  <Step title="Enrich the company via Company API">
    ```bash theme={"theme":"vitesse-black"}
    curl --request POST \
      --url https://api.crustdata.com/company/enrich \
      --header 'authorization: Bearer YOUR_API_KEY' \
      --header 'content-type: application/json' \
      --header 'x-api-version: 2025-11-01' \
      --data '{"domains": ["adamsbrowncpa.com"]}'
    ```

    This returns the full company profile: name, headcount, funding, industry, and more.

  </Step>
</Steps>

---

## Which API should you start with?

| If you want to...                                         | Start with                        |
| --------------------------------------------------------- | --------------------------------- |
| Find companies, news, academic papers, or social mentions | [Search](/web-docs/search)        |
| Get the HTML content of specific URLs for processing      | [Fetch](/web-docs/fetch)          |
| Do both — search then fetch the top results               | Search first, then Fetch the URLs |

## Common workflows

<Steps>
  <Step title="Competitive intelligence">
    [Search](/web-docs/search) for a competitor's name across `news` and
    `web` sources, then [Fetch](/web-docs/fetch) the top result URLs to
    extract full article content.
  </Step>

  <Step title="Find company domain → Enrich">
    [Search](/web-docs/search) with the company name + "website" to discover
    the domain (first result URL). Then pass it to the [Company Enrich
    API](/company-docs/enrichment) for the full company profile.
  </Step>

  <Step title="Find LinkedIn → Identify company">
    [Search](/web-docs/search) with the company name and `site:
                "linkedin.com/company"` to get the LinkedIn URL. Then pass it to the
    [Company Identify API](/company-docs/identify).
  </Step>

  <Step title="Find person → Enrich">
    [Search](/web-docs/search) with a person's name and `site:
                "linkedin.com/in"` to find their LinkedIn profile URL. Then pass it to
    the [Person Enrich API](/person-docs/enrichment).
  </Step>

  <Step title="Academic research">
    [Search](/web-docs/search) with `sources: ["scholar-articles"]` to find
    papers with citation data, or `sources: ["scholar-author"]` to get full
    author profiles with h-index metrics.
  </Step>

  <Step title="AI-powered answers">
    [Search](/web-docs/search) with `sources: ["ai"]` to get an AI-generated
    overview with source references.
  </Step>

  <Step title="Content monitoring">
    [Fetch](/web-docs/fetch) the same set of URLs on a schedule and diff the
    `content` field to detect changes.
  </Step>
</Steps>

---

## Choosing a search source

The Web Search API supports seven source types. Each returns a different result shape — always specify `sources` explicitly for predictable parsing.

| Source                      | What it returns                  | Safe to pass `url` to Fetch? | Typical downstream action                                            |
| --------------------------- | -------------------------------- | ---------------------------- | -------------------------------------------------------------------- |
| `web`                       | Standard web results             | Yes                          | Fetch page content, discover domains/profiles                        |
| `news`                      | News articles                    | Yes                          | Fetch full article, monitor press coverage                           |
| `scholar-articles`          | Academic articles                | Yes                          | Download PDF via `pdf_url`, analyze citations                        |
| `scholar-articles-enriched` | Articles with richer author data | Yes                          | Same as above, plus follow author profiles                           |
| `scholar-author`            | Researcher profiles              | No                           | Read citation metrics and publications directly from the result      |
| `ai`                        | AI-generated overview            | No                           | Use `content` directly; fetch `references[].url` for source articles |
| `social`                    | Social media posts               | Yes                          | Monitor social mentions                                              |

<Tip>
  **For Fetch workflows:** Only pass URLs from sources marked "Yes" in the
  fetchable `url` column directly to [Web Fetch](/web-docs/fetch). For AI
  results, fetch the `references[].url` values instead. For scholar-author
  results, the `url` is a profile page, not a content page.
</Tip>

<Note>
  **OpenAPI contract:** The `site`, `start_date`, and `end_date` parameters
  are defined in the spec. **Current platform behavior:** These parameters
  primarily affect `web` and `news` results. `scholar-author` and `ai`
  searches may not filter by these parameters.
</Note>

---

## Cross-API workflow map

The Web APIs are often the first step in a larger pipeline. Here's how they connect to other Crustdata APIs:

| Starting point                    | Web Search query pattern                         | Extract from result           | Pass to                                                                          |
| --------------------------------- | ------------------------------------------------ | ----------------------------- | -------------------------------------------------------------------------------- |
| Company name → company profile    | `"ACME Inc website"`, `sources: ["web"]`         | `results[0].url` → domain     | [Company Enrich](/company-docs/enrichment) (`domains`)                           |
| Company name → identify company   | `"ACME Inc"`, `site: "linkedin.com/company"`     | `results[0].url` → LinkedIn   | [Company Identify](/company-docs/identify) (`professional_network_profile_urls`) |
| Person name → person profile      | `"Jane Smith Google"`, `site: "linkedin.com/in"` | `results[0].url` → LinkedIn   | [Person Enrich](/person-docs/enrichment) (`professional_network_profile_urls`)   |
| Any search → full article content | Any search query                                 | `results[].url`               | [Web Fetch](/web-docs/fetch) (`urls`)                                            |
| AI overview → source articles     | `"topic"`, `sources: ["ai"]`                     | `results[0].references[].url` | [Web Fetch](/web-docs/fetch) (`urls`)                                            |

---

## Error handling

<Snippet file="web-error-responses.mdx" />

---

## Next steps

- [Web Search](/web-docs/search) — search the web, news, scholars, AI, and social media.
- [Web Fetch](/web-docs/fetch) — fetch the HTML content of public URLs.
- [Web API Examples](/web-docs/examples) — ready-to-copy patterns for common use cases.
  > ## Documentation Index
  >
  > Fetch the complete documentation index at: https://docs.crustdata.com/llms.txt
  > Use this file to discover all available pages before exploring further.

# Web Search

> Search the web across multiple sources including web, news, academic papers, deep research mode, and social media.

**Use this when** you want to find web pages, news articles, academic papers, author profiles, AI-generated overviews, or social media posts matching a search query.

The Web Search API accepts a query and returns results from one or more source types. The result shape varies by source — always specify `sources` explicitly when you need predictable parsing.

Every request goes to the same endpoint:

```
POST https://api.crustdata.com/web/search/live
```

<Snippet file="web-auth-headers.mdx" />

<CardGroup cols={3}>
  <Card title="Parameters" icon="sliders" href="#request-body">
    Request fields and defaults
  </Card>

  <Card title="Result shapes" icon="shapes" href="#result-shapes-by-source">
    Per-source field tables with Tabs
  </Card>

  <Card title="Field matrix" icon="table" href="#field-presence-by-source">
    Which fields exist for each source
  </Card>
</CardGroup>

<Callout icon="lock" color="#f59e0b">
  <strong>Pricing:</strong> <code>1 credit per query</code>.
</Callout>

<Note>
  Default `rate-limit` is 15 requests per minute. Send an email to
  [gtm@crustdata.co](mailto:gtm@crustdata.co) to discuss higher limits if
  needed for your use case.
</Note>

## Request body

| Parameter    | Type      | Required | Default | Description                                                                                                                                                                                  |
| ------------ | --------- | -------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `query`      | string    | Yes      | —       | Search query text. Max 5,000 characters. Supports search operators like `site:` and `filetype:`.                                                                                             |
| `location`   | string    | No       | —       | ISO 3166-1 alpha-2 country code for region-specific results (e.g., `"US"`, `"GB"`, `"JP"`).                                                                                                  |
| `sources`    | string\[] | No       | —       | Sources to query: `web`, `news`, `scholar-articles`, `scholar-articles-enriched`, `scholar-author`, `ai`, `social`. **Current platform behavior:** omitting this field searches all sources. |
| `site`       | string    | No       | —       | Restrict results to a domain (e.g., `"linkedin.com/company"`, `"github.com"`). Max 500 characters.                                                                                           |
| `start_date` | integer   | No       | —       | Unix timestamp (seconds). Only results after this date.                                                                                                                                      |
| `end_date`   | integer   | No       | —       | Unix timestamp (seconds). Only results before this date. Must be > `start_date`.                                                                                                             |
| `human_mode` | boolean   | No       | `false` | Attempt a browser-like retrieval path when standard search access is blocked by bot protection.                                                                                              |
| `page`       | integer   | No       | `1`     | Number of result pages to aggregate into the response. Minimum: `1`.                                                                                                                         |

<Snippet file="web-site-parameter.mdx" />

### Source capabilities

<Note>
  **Current platform behavior — not guaranteed by the OpenAPI contract.**
  Parameter applicability varies by source. This table reflects observed
  behavior.
</Note>

| Source                      | Best use case            | Fetchable `url`? | `site` effective? | Date filters effective? |
| --------------------------- | ------------------------ | ---------------- | ----------------- | ----------------------- |
| `web`                       | General web search       | Yes              | Yes               | Yes                     |
| `news`                      | News articles            | Yes              | Yes               | Yes                     |
| `scholar-articles`          | Academic papers          | Yes              | No                | Yes                     |
| `scholar-articles-enriched` | Papers + author profiles | Yes              | No                | Yes                     |
| `scholar-author`            | Researcher profiles      | No               | No                | No                      |
| `ai`                        | AI-generated summaries   | No               | No                | No                      |
| `social`                    | Social media mentions    | Yes              | No                | No                      |

## Response body

| Field                   | Type    | Description                                                                                                                     |
| ----------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `success`               | boolean | Whether the search executed successfully.                                                                                       |
| `query`                 | string  | The query as interpreted by the API (includes `site:` prefix if `site` was set).                                                |
| `timestamp`             | integer | Unix timestamp in milliseconds when the search was performed.                                                                   |
| `results`               | array   | Search results. Shape varies by `source` — see [Result shapes by source](#result-shapes-by-source).                             |
| `metadata.totalResults` | integer | Total number of results available across all pages (may exceed the number in the `results` array if you requested fewer pages). |
| `metadata.failedPages`  | array   | Page numbers that failed to return results.                                                                                     |
| `metadata.emptyPages`   | array   | Page numbers that returned no results.                                                                                          |

<Note>
  **Timestamps:** Search `timestamp` is in **milliseconds**. Fetch `timestamp`
  is in **seconds**. Divide Search timestamps by 1000 when comparing across
  endpoints.
</Note>

---

## Your first search

The simplest search uses a `query` with an explicit `sources` array. Always specify `sources` for predictable result parsing.

<CodeGroup>
  ```bash Request theme={"theme":"vitesse-black"}
  curl --request POST \
    --url https://api.crustdata.com/web/search/live \
    --header 'authorization: Bearer YOUR_API_KEY' \
    --header 'content-type: application/json' \
    --header 'x-api-version: 2025-11-01' \
    --data '{
      "query": "crustdata",
      "sources": ["web"],
      "location": "US"
    }'
  ```

```json Response theme={"theme":"vitesse-black"}
{
  "success": true,
  "query": "crustdata",
  "timestamp": 1775195367446,
  "results": [
    {
      "source": "web",
      "title": "Crustdata: Real-Time B2B Data Broker via API or Data Feed",
      "url": "https://crustdata.com/",
      "snippet": "Crustdata is a B2B data provider offering real-time company & people datasets. Access APIs and live signals to power sales and investment workflows.",
      "position": 1
    },
    {
      "source": "web",
      "title": "Crustdata: Real-time B2B data via simple APIs",
      "url": "https://www.ycombinator.com/companies/crustdata",
      "snippet": "Crustdata provides live company and people data via APIs and full dataset delivery.",
      "position": 2
    }
  ],
  "metadata": {
    "totalResults": 7,
    "failedPages": [],
    "emptyPages": []
  }
}
```

</CodeGroup>

<Note>Response trimmed for clarity.</Note>

**Extract:** Each result in `results[]` contains `source`, `title`, `url`, `snippet`, and `position`. Use `position` for ranking and `url` for follow-up fetching.

---

## Restrict results to a specific site

Use the `site` parameter to limit results to a single domain. Useful for finding company pages on LinkedIn, profiles on GitHub, or content on a specific website.

<CodeGroup>
  ```bash Request theme={"theme":"vitesse-black"}
  curl --request POST \
    --url https://api.crustdata.com/web/search/live \
    --header 'authorization: Bearer YOUR_API_KEY' \
    --header 'content-type: application/json' \
    --header 'x-api-version: 2025-11-01' \
    --data '{
      "query": "ADAMSBROWN, LLC",
      "sources": ["web"],
      "site": "linkedin.com/company"
    }'
  ```

```json Response theme={"theme":"vitesse-black"}
{
  "success": true,
  "query": "site:linkedin.com/company ADAMSBROWN, LLC",
  "timestamp": 1775195371211,
  "results": [
    {
      "source": "web",
      "title": "Adams Brown",
      "url": "https://www.linkedin.com/company/adams-brown-cpa",
      "snippet": "Adams Brown, LLC, a leading CPA and advisory firm, has delivered value-added accounting and advisory services to businesses and their owners since 1945.",
      "position": 1
    }
  ],
  "metadata": {
    "totalResults": 10,
    "failedPages": [],
    "emptyPages": []
  }
}
```

</CodeGroup>

**Extract:** The first result URL is typically the best match. For company LinkedIn URLs, pass the result to the [Company Identify API](/company-docs/identify) for a full profile.

---

## Search with date filtering

Use `start_date` and `end_date` (Unix timestamps in seconds) to limit results to a specific time range.

<CodeGroup>
  ```bash Request theme={"theme":"vitesse-black"}
  curl --request POST \
    --url https://api.crustdata.com/web/search/live \
    --header 'authorization: Bearer YOUR_API_KEY' \
    --header 'content-type: application/json' \
    --header 'x-api-version: 2025-11-01' \
    --data '{
      "query": "distributed systems",
      "location": "US",
      "sources": ["web", "news"],
      "site": "example.com",
      "start_date": 1728259200,
      "end_date": 1730937600
    }'
  ```
</CodeGroup>

<Tip>
  Convert dates to Unix timestamps: October 7, 2024 = `1728259200`. You can
  use any Unix timestamp converter tool.
</Tip>

---

## Use human mode when standard retrieval is blocked

Set `human_mode: true` when you want the API to attempt a browser-like retrieval
path for the search request.

<CodeGroup>
  ```bash Request theme={"theme":"vitesse-black"}
  curl --request POST \
      --url https://api.crustdata.com/web/search/live \
      --header 'authorization: Bearer YOUR_API_KEY' \
      --header 'content-type: application/json' \
      --header 'x-api-version: 2025-11-01' \
      --data '{
          "query": "crustdata",
          "sources": ["web"],
          "human_mode": true
      }'
  ```
</CodeGroup>

<Note>
  **Current platform behavior:** `human_mode: true` returns the normal search
  response shape with `success`, `query`, `timestamp`, `results`, and
  `metadata`.
</Note>

---

## Result shapes by source

The `results[]` array shape depends on the `source` field of each result. Use this reference when parsing multi-source responses.

<Tabs>
  <Tab title="web / news">
    Standard web and news results share the same shape.

    | Field      | Type    | Description                |
    | ---------- | ------- | -------------------------- |
    | `source`   | string  | `"web"` or `"news"`.       |
    | `title`    | string  | Page title.                |
    | `url`      | string  | Page URL.                  |
    | `snippet`  | string  | Text excerpt.              |
    | `position` | integer | Result position (1-based). |

    ```json theme={"theme":"vitesse-black"}
    {
        "source": "web",
        "title": "Crustdata: Real-Time B2B Data Broker via API or Data Feed",
        "url": "https://crustdata.com/",
        "snippet": "Crustdata is a B2B data provider offering real-time company & people datasets.",
        "position": 1
    }
    ```

  </Tab>

  <Tab title="scholar-articles">
    Academic article results include citation data, author information, and optional PDF links.

    | Field       | Type    | Description                                            |
    | ----------- | ------- | ------------------------------------------------------ |
    | `source`    | string  | `"scholar-articles"` or `"scholar-articles-enriched"`. |
    | `title`     | string  | Article title.                                         |
    | `url`       | string  | Link to the article.                                   |
    | `snippet`   | string  | Abstract excerpt.                                      |
    | `metadata`  | string  | Citation string: `"Author - Year - Publisher"`.        |
    | `pdf_url`   | string? | Direct PDF link, if available.                         |
    | `position`  | integer | Result position (1-based).                             |
    | `authors`   | array   | `[{ name, profile_url, profile_id }]`.                 |
    | `citations` | integer | Total citation count.                                  |

    ```json theme={"theme":"vitesse-black"}
    {
        "source": "scholar-articles",
        "title": "Understanding deep learning",
        "url": "https://books.google.com/books?hl=en&lr=lang_en&id=rvyxEAAAQBAJ",
        "snippet": "...to this field understand the principles behind deep learning.",
        "metadata": "SJD Prince - 2023 - books.google.com",
        "pdf_url": null,
        "position": 1,
        "authors": [
            {
                "name": "SJD Prince",
                "profile_url": "https://scholar.google.com/citations?user=fjm67xYAAAAJ&hl=en&oi=sra",
                "profile_id": "fjm67xYAAAAJ"
            }
        ],
        "citations": 618
    }
    ```

    <Tip>
      Use `scholar-articles-enriched` instead of `scholar-articles` to get richer author profile data. The result shape is the same, with more author fields populated.
    </Tip>

  </Tab>

  <Tab title="scholar-author">
    Author profile results have a completely different shape — no `snippet`, `position`, or `title`. Instead, you get a full researcher profile.

    | Field         | Type    | Description                                                                  |
    | ------------- | ------- | ---------------------------------------------------------------------------- |
    | `source`      | string  | `"scholar-author"`.                                                          |
    | `url`         | string  | Academic profile URL.                                                        |
    | `name`        | string  | Author full name.                                                            |
    | `affiliation` | string  | Institutional affiliation.                                                   |
    | `website`     | string? | Personal or institutional website.                                           |
    | `interests`   | array   | `[{ title, link }]` — research interests.                                    |
    | `thumbnail`   | string? | Profile photo URL.                                                           |
    | `citations`   | object  | `{ all, since_2020 }` — total and recent counts.                             |
    | `h_index`     | object  | `{ all, since_2020 }`.                                                       |
    | `i10_index`   | object  | `{ all, since_2020 }`.                                                       |
    | `articles`    | array   | Top publications: `[{ title, url, year, citations, authors, publication }]`. |

    ```json theme={"theme":"vitesse-black"}
    {
        "source": "scholar-author",
        "url": "https://scholar.google.com/citations?user=NMS69lQAAAAJ&hl=en&oi=ao",
        "name": "Jeff Dean",
        "affiliation": "Google Chief Scientist, Google Research and Google DeepMind",
        "website": "http://research.google.com/people/jeff",
        "interests": [
            { "title": "Distributed systems", "link": "https://scholar.google.com/..." }
        ],
        "citations": { "all": 401624, "since_2020": 231008 },
        "h_index": { "all": 114, "since_2020": 78 },
        "i10_index": { "all": 319, "since_2020": 203 },
        "articles": [
            {
                "title": "MapReduce: simplified data processing on large clusters",
                "url": "https://scholar.google.com/...",
                "year": "2008",
                "citations": "37255",
                "authors": "J Dean, S Ghemawat",
                "publication": "Communications of the ACM 51 (1), 107-113, 2008"
            }
        ]
    }
    ```

  </Tab>

  <Tab title="ai">
    Deep research mode returns a single AI-generated overview with source references. No `snippet`, `position`, or standard search fields.

    | Field        | Type   | Description                                       |
    | ------------ | ------ | ------------------------------------------------- |
    | `source`     | string | `"ai"`.                                           |
    | `title`      | string | Always `"AI Overview"`.                           |
    | `content`    | string | AI-generated overview text.                       |
    | `references` | array  | Source articles: `[{ title, url, snippet }]`.     |
    | `images`     | array  | Embedded images: `[{ url, alt, width, height }]`. |

    ```json theme={"theme":"vitesse-black"}
    {
        "source": "ai",
        "title": "AI Overview",
        "content": "The primary difference between uv and pip is speed and scope...",
        "references": [
            {
                "title": "uv vs pip: Managing Python Packages and Dependencies",
                "url": "https://realpython.com/uv-vs-pip/",
                "snippet": "When it comes to Python package managers..."
            }
        ],
        "images": []
    }
    ```

  </Tab>

  <Tab title="social">
    Social media results use the same shape as web/news results.

    | Field      | Type    | Description                |
    | ---------- | ------- | -------------------------- |
    | `source`   | string  | `"social"`.                |
    | `title`    | string  | Post or page title.        |
    | `url`      | string  | Post URL.                  |
    | `snippet`  | string  | Post excerpt.              |
    | `position` | integer | Result position (1-based). |

    <Note>
      **Current platform behavior:** Social search results may return empty
      for some queries depending on availability. Always check `results.length`
      before processing.
    </Note>

  </Tab>
</Tabs>

### Result ordering and ranking

<Note>
  **Current platform behavior:** When querying a single source, `position`
  reflects the source's natural ranking order. When querying multiple sources,
  results from different sources are interleaved and `position` may reflect a
  per-source rank rather than a global rank. `metadata.totalResults` is the
  total count across all requested sources and pages.
</Note>

### Parsing multi-source responses

When you query multiple sources at once (or omit `sources`), the `results[]` array can contain items with different shapes. Always check the `source` field of each result to determine which fields are available:

```javascript theme={"theme":"vitesse-black"}
for (const result of response.results) {
  switch (result.source) {
    case "web":
    case "news":
    case "social":
      // Standard: title, url, snippet, position
      console.log(result.title, result.url);
      break;
    case "scholar-articles":
    case "scholar-articles-enriched":
      // Academic: standard fields + authors, citations, pdf_url, metadata
      console.log(result.title, result.citations, result.authors);
      break;
    case "scholar-author":
      // Author profile: name, affiliation, h_index, articles[]
      console.log(result.name, result.affiliation, result.h_index);
      break;
    case "ai":
      // AI overview: content, references[]
      console.log(result.content, result.references);
      break;
  }
}
```

---

## Multi-page search

Use `page` to request multiple result pages in a single response. The `metadata` object tells you which pages succeeded.

<CodeGroup>
  ```bash Request theme={"theme":"vitesse-black"}
  curl --request POST \
    --url https://api.crustdata.com/web/search/live \
    --header 'authorization: Bearer YOUR_API_KEY' \
    --header 'content-type: application/json' \
    --header 'x-api-version: 2025-11-01' \
    --data '{
      "query": "artificial intelligence startups",
      "sources": ["web"],
      "location": "US",
      "page": 3
    }'
  ```

```json Response (with page 2 failure) theme={"theme":"vitesse-black"}
{
  "success": true,
  "query": "artificial intelligence startups",
  "timestamp": 1775195500000,
  "results": [
    {
      "source": "web",
      "title": "AI Startup Landscape 2026",
      "url": "https://example.com/ai-startups",
      "snippet": "...",
      "position": 1
    },
    {
      "source": "web",
      "title": "Top AI Companies to Watch",
      "url": "https://example.com/top-ai",
      "snippet": "...",
      "position": 2
    }
  ],
  "metadata": {
    "totalResults": 25,
    "failedPages": [2],
    "emptyPages": [3]
  }
}
```

</CodeGroup>

<Note>
  Response trimmed for clarity. Pages 1 succeeded, page 2 failed, page 3 was
  empty.
</Note>

The response aggregates results across all successful pages into a single `results[]` array. Check `metadata` to understand page-level outcomes:

- **`metadata.totalResults`** — total results available across all sources and pages.
- **`metadata.failedPages`** — page numbers that returned errors. Retry the request with a smaller `page` value if needed.
- **`metadata.emptyPages`** — page numbers that returned no results. You have reached the end of available results — **do not retry**.

**Handling page outcomes:**

```javascript theme={"theme":"vitesse-black"}
if (response.metadata.failedPages.length > 0) {
  // Some pages failed — retry the full request or reduce page
  console.log("Failed pages:", response.metadata.failedPages);
}

if (response.metadata.emptyPages.length > 0) {
  // No more results available — do not request more pages
  console.log(
    "Reached end of results at page",
    Math.min(...response.metadata.emptyPages),
  );
}
```

<Note>
  **Current platform behavior (not guaranteed by the OpenAPI contract):** Each
  page returns approximately 10 results. If `metadata.emptyPages` contains
  page numbers, you have reached the end of available results.
</Note>

---

## Field presence by source

Use this reference to determine which fields are present for each source type.

<Note>
  **Naming note:** The API uses `metadata` in two different contexts. The
  **response-level** `metadata` is an object with `totalResults`,
  `failedPages`, and `emptyPages`. The **per-result** `metadata` field
  (scholar-articles only) is a citation string like `"Author - Year -
        Publisher"`. Always use the full path (`response.metadata` vs
  `result.metadata`) to avoid confusion.
</Note>

**Standard fields** — present in `web`, `news`, `social`, and `scholar-articles` / `scholar-articles-enriched`:

| Field      | Sources with this field                                        | Notes                            |
| ---------- | -------------------------------------------------------------- | -------------------------------- |
| `source`   | All sources                                                    | Always present                   |
| `title`    | `web`, `news`, `social`, `scholar-articles*`, `ai`             | AI: always `"AI Overview"`       |
| `url`      | `web`, `news`, `social`, `scholar-articles*`, `scholar-author` | Academic author: profile link    |
| `snippet`  | `web`, `news`, `social`, `scholar-articles*`                   | Absent in `ai`, `scholar-author` |
| `position` | `web`, `news`, `social`, `scholar-articles*`                   | Absent in `ai`, `scholar-author` |

**Academic article fields** — `scholar-articles` and `scholar-articles-enriched` only:

| Field       | Type    | Notes                                               |
| ----------- | ------- | --------------------------------------------------- |
| `metadata`  | string  | Citation string: `"Author - Year - Publisher"`      |
| `pdf_url`   | string? | Direct PDF download link — handle outside Web Fetch |
| `authors`   | array   | `[{ name, profile_url, profile_id }]`               |
| `citations` | integer | Total citation count                                |

**Academic author fields** — `scholar-author` only:

| Field         | Type    | Notes                                                        |
| ------------- | ------- | ------------------------------------------------------------ |
| `name`        | string  | Author full name                                             |
| `affiliation` | string  | Institutional affiliation                                    |
| `website`     | string? | Personal or institutional website                            |
| `interests`   | array   | `[{ title, link }]`                                          |
| `thumbnail`   | string? | Profile photo URL                                            |
| `citations`   | object  | `{ all, since_2020 }` — different type than scholar-articles |
| `h_index`     | object  | `{ all, since_2020 }`                                        |
| `i10_index`   | object  | `{ all, since_2020 }`                                        |
| `articles`    | array   | `[{ title, url, year, citations, authors, publication }]`    |

**Deep research mode fields** — `ai` only:

| Field        | Type   | Notes                                          |
| ------------ | ------ | ---------------------------------------------- |
| `content`    | string | AI-generated overview text                     |
| `references` | array  | `[{ title, url, snippet }]` — fetch these URLs |
| `images`     | array  | `[{ url, alt, width, height }]`                |

<Tip>
  For full request/response examples of each source type, see the [Web API
  Examples](/web-docs/examples) page.
</Tip>

---

## Error handling

Search returns `400` for invalid requests and `401` for auth failures.

<CodeGroup>
  ```json 400 — missing query theme={"theme":"vitesse-black"}
  {
      "error": {
          "type": "invalid_request",
          "message": "query: This field is required.",
          "metadata": []
      }
  }
  ```

```json 400 — invalid source theme={"theme":"vitesse-black"}
{
  "error": {
    "type": "invalid_request",
    "message": "sources: {0: [ErrorDetail(string='\"invalid_source\" is not a valid choice.', code='invalid_choice')]}",
    "metadata": []
  }
}
```

```json 401 — bad API key theme={"theme":"vitesse-black"}
{
  "message": "Invalid API key in request"
}
```

</CodeGroup>

<Snippet file="web-error-responses.mdx" />

---

## Common gotchas

| Mistake                                            | Fix                                                                                                      |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Omitting `sources` and expecting uniform results   | Different sources return different fields. Specify `sources` explicitly for predictable parsing.         |
| Using `site` with `scholar-author` or `ai` sources | `site` only applies to `web` and `news` sources. It has no effect on academic or deep research searches. |
| Expecting `snippet` in deep research mode results  | Deep research mode returns `content` and `references` instead of `snippet` and `position`.               |
| Expecting `position` in scholar-author results     | Academic author results don't have `position` — they have `name`, `affiliation`, `citations`, etc.       |
| Using `start_date` >= `end_date`                   | `start_date` must be strictly less than `end_date`.                                                      |

---

## Next steps

- [Web Fetch](/web-docs/fetch) — fetch the HTML content of URLs returned by search results.
- [Web API Examples](/web-docs/examples) — ready-to-copy patterns for common workflows.
  > ## Documentation Index
  >
  > Fetch the complete documentation index at: https://docs.crustdata.com/llms.txt
  > Use this file to discover all available pages before exploring further.

# Web Fetch

> Fetch the HTML content of public webpages by URL for content extraction, data collection, and monitoring.

**Use this when** you have specific URLs and need to retrieve their full HTML content — for content extraction, data collection, SEO analysis, or change tracking.

The Web Fetch API accepts a list of URLs and returns the page title and full HTML content for each. You can fetch up to 10 URLs in a single request.

Every request goes to the same endpoint:

```
POST https://api.crustdata.com/web/enrich/live
```

<Note>
  The endpoint path is `/web/enrich/live` (not `/web/fetch/live`) because it
  follows the Crustdata convention where "enrich" means adding data to a known
  identifier — in this case, enriching a URL with its page content.
</Note>

<Snippet file="web-auth-headers.mdx" />

<Callout icon="lock" color="#f59e0b">
  <strong>Pricing:</strong> <code>1 credit per page</code>.
</Callout>

<Note>
  Default `rate-limit` is 15 requests per minute. Send an email to
  [gtm@crustdata.co](mailto:gtm@crustdata.co) to discuss higher limits if
  needed for your use case.
</Note>

## Request body

| Parameter    | Type      | Required | Default | Description                                                                                       |
| ------------ | --------- | -------- | ------- | ------------------------------------------------------------------------------------------------- |
| `urls`       | string\[] | Yes      | —       | URLs to fetch. Min: 1, max: 10. Must include `http://` or `https://`.                             |
| `human_mode` | boolean   | No       | `false` | Attempt a browser-like fetch path when a site is protected by Cloudflare or similar bot controls. |

## Response body

The response is an **array** (not an object) — one entry per URL in your request.

| Field       | Type     | Description                                                   |
| ----------- | -------- | ------------------------------------------------------------- |
| `success`   | boolean  | Whether this URL was fetched successfully.                    |
| `url`       | string?  | The URL that was fetched. `null` if the fetch failed.         |
| `timestamp` | integer? | Unix timestamp (**seconds**) when fetched. `null` on failure. |
| `title`     | string?  | The `<title>` tag content. `null` on failure.                 |
| `content`   | string?  | Full HTML content of the page. `null` on failure.             |

<Note>
  **Timestamps:** Fetch timestamps are in **seconds**. Search timestamps are
  in **milliseconds**. Account for this when comparing timestamps across
  endpoints.
</Note>

<Note>
  **Two kinds of failure, two places to check:**

- **Request-level errors** (`400`, `401`) — the entire request failed. You get an error object, not an array. Caused by missing fields, empty arrays, or bad auth.
- **Per-URL failures** within a `200` — individual entries with `success: false` and `null` fields. Caused by unreachable URLs, timeouts, or bot protection.

Always check the HTTP status first, then check `success` for each entry in the array.
</Note>

---

## Fetch a single URL

The simplest request fetches one URL and returns its HTML content.

<CodeGroup>
  ```bash Request theme={"theme":"vitesse-black"}
  curl --request POST \
    --url https://api.crustdata.com/web/enrich/live \
    --header 'authorization: Bearer YOUR_API_KEY' \
    --header 'content-type: application/json' \
    --header 'x-api-version: 2025-11-01' \
    --data '{
      "urls": ["https://example.com"]
    }'
  ```

```json Response theme={"theme":"vitesse-black"}
[
  {
    "success": true,
    "url": "https://example.com",
    "timestamp": 1775193366,
    "title": "Example Domain",
    "content": "<html lang=\"en\"><head><title>Example Domain</title>...</head><body><div><h1>Example Domain</h1><p>This domain is for use in documentation examples.</p></div></body></html>"
  }
]
```

</CodeGroup>

<Note>
  The `content` field is trimmed here. It contains the full HTML of the
  fetched page.
</Note>

**Extract:** Parse `content` using an HTML parser (BeautifulSoup for Python, Cheerio for Node.js) to extract specific elements like text, links, or metadata.

---

## Fetch multiple URLs

Pass up to 10 URLs to fetch their content in parallel.

<CodeGroup>
  ```bash Request theme={"theme":"vitesse-black"}
  curl --request POST \
    --url https://api.crustdata.com/web/enrich/live \
    --header 'authorization: Bearer YOUR_API_KEY' \
    --header 'content-type: application/json' \
    --header 'x-api-version: 2025-11-01' \
    --data '{
      "urls": [
        "https://example.com",
        "https://example.org",
        "https://www.crustdata.com"
      ]
    }'
  ```

```json Response theme={"theme":"vitesse-black"}
[
  {
    "success": true,
    "url": "https://example.org",
    "timestamp": 1775193386,
    "title": "Example Domain",
    "content": "<html lang=\"en\"><head><title>Example Domain</title></head><body>...</body></html>"
  },
  {
    "success": true,
    "url": "https://example.com",
    "timestamp": 1775193386,
    "title": "Example Domain",
    "content": "<html lang=\"en\"><head><title>Example Domain</title></head><body>...</body></html>"
  },
  {
    "success": true,
    "url": "https://www.crustdata.com",
    "timestamp": 1775193387,
    "title": "Crustdata: Real-Time B2B Data Broker",
    "content": "<html>...</html>"
  }
]
```

</CodeGroup>

<Note>
  **Current platform behavior:** The response array order may differ from the
  request order. Match successful results by their `url` field, not by array
  index.
</Note>

---

## Handle partial failures

When some URLs succeed and others fail, the request still returns `200`. Failed URLs have `success: false` with all other fields as `null`.

<CodeGroup>
  ```bash Request theme={"theme":"vitesse-black"}
  curl --request POST \
    --url https://api.crustdata.com/web/enrich/live \
    --header 'authorization: Bearer YOUR_API_KEY' \
    --header 'content-type: application/json' \
    --header 'x-api-version: 2025-11-01' \
    --data '{
      "urls": [
        "https://example.com",
        "https://this-domain-does-not-exist-xyz.com"
      ]
    }'
  ```

```json Response theme={"theme":"vitesse-black"}
[
  {
    "success": true,
    "url": "https://example.com",
    "timestamp": 1775193366,
    "title": "Example Domain",
    "content": "<html lang=\"en\"><head><title>Example Domain</title></head><body>...</body></html>"
  },
  {
    "success": false,
    "url": null,
    "timestamp": null,
    "title": null,
    "content": null
  }
]
```

</CodeGroup>

### Correlating failures to input URLs

Failed entries have `url: null`, so you cannot directly identify which input URL failed. To correlate failures:

1. Track the URLs you sent.
2. Collect the `url` values from all successful entries.
3. Any input URL not in the successful set is the one that failed.

```javascript theme={"theme":"vitesse-black"}
const requestedUrls = [
  "https://example.com",
  "https://this-domain-does-not-exist-xyz.com",
];
const successfulUrls = new Set(
  fetchResponse.filter((r) => r.success).map((r) => r.url),
);
const failedUrls = requestedUrls.filter((url) => !successfulUrls.has(url));
// failedUrls = ["https://this-domain-does-not-exist-xyz.com"]
```

<Tip>
  Always check the `success` field for each entry in the response array. Build
  your parsing logic to handle both successful and failed entries gracefully.
</Tip>

---

## Bypass Cloudflare protection

Some websites use Cloudflare to block automated requests. Set `human_mode: true` to attempt a browser-like fetch path for these pages.

```bash theme={"theme":"vitesse-black"}
curl --request POST \
  --url https://api.crustdata.com/web/enrich/live \
  --header 'authorization: Bearer YOUR_API_KEY' \
  --header 'content-type: application/json' \
  --header 'x-api-version: 2025-11-01' \
  --data '{
    "urls": ["https://example.com"],
        "human_mode": true
  }'
```

<Note>
  **Current platform behavior:** Cloudflare bypass is not guaranteed. Some
  sites have additional protections that may still block the request.
</Note>

---

## Processing fetched content

The `content` field returns raw HTML. Here are common next steps:

| Task                  | Approach                                                       |
| --------------------- | -------------------------------------------------------------- |
| Extract text          | Parse HTML and strip tags (BeautifulSoup, Cheerio, etc.)       |
| Extract links         | Find all `<a>` tags and their `href` attributes                |
| Extract metadata      | Parse `<meta>` tags for SEO data (description, og:title, etc.) |
| Detect changes        | Fetch periodically and diff the `content` or `title` fields    |
| Resolve relative URLs | Combine relative paths with the base `url` from the response   |

---

## Error handling

Fetch returns request-level errors for invalid input or auth failures. These are separate from per-URL `success: false` entries within a `200` response.

<CodeGroup>
  ```json 400 — missing urls theme={"theme":"vitesse-black"}
  {
      "error": {
          "type": "invalid_request",
          "message": "urls: This field is required.",
          "metadata": []
      }
  }
  ```

```json 400 — empty urls array theme={"theme":"vitesse-black"}
{
  "error": {
    "type": "invalid_request",
    "message": "urls: This list may not be empty.",
    "metadata": []
  }
}
```

```json 401 — bad API key theme={"theme":"vitesse-black"}
{
  "message": "Invalid API key in request"
}
```

</CodeGroup>

<Snippet file="web-error-responses.mdx" />

---

## Common gotchas

| Mistake                                  | Fix                                                                                                             |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Omitting `http://` or `https://` in URLs | All URLs must include the protocol prefix.                                                                      |
| Sending more than 10 URLs                | The API accepts a maximum of 10 URLs per request. Batch larger lists.                                           |
| Assuming response order matches request  | Match results by the `url` field, not by array index.                                                           |
| Treating a `200` as all-success          | A `200` can contain failed entries. Check `success` for each item.                                              |
| Sending an empty `urls` array            | Returns `400`: `"urls: This list may not be empty."`.                                                           |
| Expecting JavaScript-rendered content    | **Current platform behavior:** The API fetches server-side HTML. JavaScript-heavy SPAs may return minimal HTML. |
| Comparing Search and Fetch timestamps    | Search uses milliseconds, Fetch uses seconds. Divide Search by 1000 to compare.                                 |

---

## Next steps

- [Web Search](/web-docs/search) — search the web to find URLs to fetch.
- [Web API Examples](/web-docs/examples) — ready-to-copy patterns for common workflows.

> ## Documentation Index
>
> Fetch the complete documentation index at: https://docs.crustdata.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Web Fetch

> Fetch the HTML content of public webpages by URL for content extraction, data collection, and monitoring.

**Use this when** you have specific URLs and need to retrieve their full HTML content — for content extraction, data collection, SEO analysis, or change tracking.

The Web Fetch API accepts a list of URLs and returns the page title and full HTML content for each. You can fetch up to 10 URLs in a single request.

Every request goes to the same endpoint:

```
POST https://api.crustdata.com/web/enrich/live
```

<Note>
  The endpoint path is `/web/enrich/live` (not `/web/fetch/live`) because it
  follows the Crustdata convention where "enrich" means adding data to a known
  identifier — in this case, enriching a URL with its page content.
</Note>

<Snippet file="web-auth-headers.mdx" />

<Callout icon="lock" color="#f59e0b">
  <strong>Pricing:</strong> <code>1 credit per page</code>.
</Callout>

<Note>
  Default `rate-limit` is 15 requests per minute. Send an email to
  [gtm@crustdata.co](mailto:gtm@crustdata.co) to discuss higher limits if
  needed for your use case.
</Note>

## Request body

| Parameter    | Type      | Required | Default | Description                                                                                       |
| ------------ | --------- | -------- | ------- | ------------------------------------------------------------------------------------------------- |
| `urls`       | string\[] | Yes      | —       | URLs to fetch. Min: 1, max: 10. Must include `http://` or `https://`.                             |
| `human_mode` | boolean   | No       | `false` | Attempt a browser-like fetch path when a site is protected by Cloudflare or similar bot controls. |

## Response body

The response is an **array** (not an object) — one entry per URL in your request.

| Field       | Type     | Description                                                   |
| ----------- | -------- | ------------------------------------------------------------- |
| `success`   | boolean  | Whether this URL was fetched successfully.                    |
| `url`       | string?  | The URL that was fetched. `null` if the fetch failed.         |
| `timestamp` | integer? | Unix timestamp (**seconds**) when fetched. `null` on failure. |
| `title`     | string?  | The `<title>` tag content. `null` on failure.                 |
| `content`   | string?  | Full HTML content of the page. `null` on failure.             |

<Note>
  **Timestamps:** Fetch timestamps are in **seconds**. Search timestamps are
  in **milliseconds**. Account for this when comparing timestamps across
  endpoints.
</Note>

<Note>
  **Two kinds of failure, two places to check:**

- **Request-level errors** (`400`, `401`) — the entire request failed. You get an error object, not an array. Caused by missing fields, empty arrays, or bad auth.
- **Per-URL failures** within a `200` — individual entries with `success: false` and `null` fields. Caused by unreachable URLs, timeouts, or bot protection.

Always check the HTTP status first, then check `success` for each entry in the array.
</Note>

---

## Fetch a single URL

The simplest request fetches one URL and returns its HTML content.

<CodeGroup>
  ```bash Request theme={"theme":"vitesse-black"}
  curl --request POST \
    --url https://api.crustdata.com/web/enrich/live \
    --header 'authorization: Bearer YOUR_API_KEY' \
    --header 'content-type: application/json' \
    --header 'x-api-version: 2025-11-01' \
    --data '{
      "urls": ["https://example.com"]
    }'
  ```

```json Response theme={"theme":"vitesse-black"}
[
  {
    "success": true,
    "url": "https://example.com",
    "timestamp": 1775193366,
    "title": "Example Domain",
    "content": "<html lang=\"en\"><head><title>Example Domain</title>...</head><body><div><h1>Example Domain</h1><p>This domain is for use in documentation examples.</p></div></body></html>"
  }
]
```

</CodeGroup>

<Note>
  The `content` field is trimmed here. It contains the full HTML of the
  fetched page.
</Note>

**Extract:** Parse `content` using an HTML parser (BeautifulSoup for Python, Cheerio for Node.js) to extract specific elements like text, links, or metadata.

---

## Fetch multiple URLs

Pass up to 10 URLs to fetch their content in parallel.

<CodeGroup>
  ```bash Request theme={"theme":"vitesse-black"}
  curl --request POST \
    --url https://api.crustdata.com/web/enrich/live \
    --header 'authorization: Bearer YOUR_API_KEY' \
    --header 'content-type: application/json' \
    --header 'x-api-version: 2025-11-01' \
    --data '{
      "urls": [
        "https://example.com",
        "https://example.org",
        "https://www.crustdata.com"
      ]
    }'
  ```

```json Response theme={"theme":"vitesse-black"}
[
  {
    "success": true,
    "url": "https://example.org",
    "timestamp": 1775193386,
    "title": "Example Domain",
    "content": "<html lang=\"en\"><head><title>Example Domain</title></head><body>...</body></html>"
  },
  {
    "success": true,
    "url": "https://example.com",
    "timestamp": 1775193386,
    "title": "Example Domain",
    "content": "<html lang=\"en\"><head><title>Example Domain</title></head><body>...</body></html>"
  },
  {
    "success": true,
    "url": "https://www.crustdata.com",
    "timestamp": 1775193387,
    "title": "Crustdata: Real-Time B2B Data Broker",
    "content": "<html>...</html>"
  }
]
```

</CodeGroup>

<Note>
  **Current platform behavior:** The response array order may differ from the
  request order. Match successful results by their `url` field, not by array
  index.
</Note>

---

## Handle partial failures

When some URLs succeed and others fail, the request still returns `200`. Failed URLs have `success: false` with all other fields as `null`.

<CodeGroup>
  ```bash Request theme={"theme":"vitesse-black"}
  curl --request POST \
    --url https://api.crustdata.com/web/enrich/live \
    --header 'authorization: Bearer YOUR_API_KEY' \
    --header 'content-type: application/json' \
    --header 'x-api-version: 2025-11-01' \
    --data '{
      "urls": [
        "https://example.com",
        "https://this-domain-does-not-exist-xyz.com"
      ]
    }'
  ```

```json Response theme={"theme":"vitesse-black"}
[
  {
    "success": true,
    "url": "https://example.com",
    "timestamp": 1775193366,
    "title": "Example Domain",
    "content": "<html lang=\"en\"><head><title>Example Domain</title></head><body>...</body></html>"
  },
  {
    "success": false,
    "url": null,
    "timestamp": null,
    "title": null,
    "content": null
  }
]
```

</CodeGroup>

### Correlating failures to input URLs

Failed entries have `url: null`, so you cannot directly identify which input URL failed. To correlate failures:

1. Track the URLs you sent.
2. Collect the `url` values from all successful entries.
3. Any input URL not in the successful set is the one that failed.

```javascript theme={"theme":"vitesse-black"}
const requestedUrls = [
  "https://example.com",
  "https://this-domain-does-not-exist-xyz.com",
];
const successfulUrls = new Set(
  fetchResponse.filter((r) => r.success).map((r) => r.url),
);
const failedUrls = requestedUrls.filter((url) => !successfulUrls.has(url));
// failedUrls = ["https://this-domain-does-not-exist-xyz.com"]
```

<Tip>
  Always check the `success` field for each entry in the response array. Build
  your parsing logic to handle both successful and failed entries gracefully.
</Tip>

---

## Bypass Cloudflare protection

Some websites use Cloudflare to block automated requests. Set `human_mode: true` to attempt a browser-like fetch path for these pages.

```bash theme={"theme":"vitesse-black"}
curl --request POST \
  --url https://api.crustdata.com/web/enrich/live \
  --header 'authorization: Bearer YOUR_API_KEY' \
  --header 'content-type: application/json' \
  --header 'x-api-version: 2025-11-01' \
  --data '{
    "urls": ["https://example.com"],
        "human_mode": true
  }'
```

<Note>
  **Current platform behavior:** Cloudflare bypass is not guaranteed. Some
  sites have additional protections that may still block the request.
</Note>

---

## Processing fetched content

The `content` field returns raw HTML. Here are common next steps:

| Task                  | Approach                                                       |
| --------------------- | -------------------------------------------------------------- |
| Extract text          | Parse HTML and strip tags (BeautifulSoup, Cheerio, etc.)       |
| Extract links         | Find all `<a>` tags and their `href` attributes                |
| Extract metadata      | Parse `<meta>` tags for SEO data (description, og:title, etc.) |
| Detect changes        | Fetch periodically and diff the `content` or `title` fields    |
| Resolve relative URLs | Combine relative paths with the base `url` from the response   |

---

## Error handling

Fetch returns request-level errors for invalid input or auth failures. These are separate from per-URL `success: false` entries within a `200` response.

<CodeGroup>
  ```json 400 — missing urls theme={"theme":"vitesse-black"}
  {
      "error": {
          "type": "invalid_request",
          "message": "urls: This field is required.",
          "metadata": []
      }
  }
  ```

```json 400 — empty urls array theme={"theme":"vitesse-black"}
{
  "error": {
    "type": "invalid_request",
    "message": "urls: This list may not be empty.",
    "metadata": []
  }
}
```

```json 401 — bad API key theme={"theme":"vitesse-black"}
{
  "message": "Invalid API key in request"
}
```

</CodeGroup>

<Snippet file="web-error-responses.mdx" />

---

## Common gotchas

| Mistake                                  | Fix                                                                                                             |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Omitting `http://` or `https://` in URLs | All URLs must include the protocol prefix.                                                                      |
| Sending more than 10 URLs                | The API accepts a maximum of 10 URLs per request. Batch larger lists.                                           |
| Assuming response order matches request  | Match results by the `url` field, not by array index.                                                           |
| Treating a `200` as all-success          | A `200` can contain failed entries. Check `success` for each item.                                              |
| Sending an empty `urls` array            | Returns `400`: `"urls: This list may not be empty."`.                                                           |
| Expecting JavaScript-rendered content    | **Current platform behavior:** The API fetches server-side HTML. JavaScript-heavy SPAs may return minimal HTML. |
| Comparing Search and Fetch timestamps    | Search uses milliseconds, Fetch uses seconds. Divide Search by 1000 to compare.                                 |

---

## Next steps

- [Web Search](/web-docs/search) — search the web to find URLs to fetch.
- [Web API Examples](/web-docs/examples) — ready-to-copy patterns for common workflows.
