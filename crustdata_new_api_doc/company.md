> ## Documentation Index
> Fetch the complete documentation index at: https://docs.crustdata.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Company APIs

> Find, enrich, and analyze company records with the Crustdata Company APIs.

The Company APIs help you answer practical business questions: Which companies match your target market? What does this company look like before outreach? What are the valid filter values for my search?

There are four core endpoints, each designed for a different step in your workflow.

| API                                        | What it does                                                | Best for                                            |
| ------------------------------------------ | ----------------------------------------------------------- | --------------------------------------------------- |
| [Search](/company-docs/search)             | Find companies matching structured filters                  | Building lists, market scans, segmentation          |
| [Autocomplete](/company-docs/autocomplete) | Discover valid field values for search filters              | Building filter dropdowns, validating filter inputs |
| [Enrich](/company-docs/enrichment)         | Get a detailed company profile from a known identifier      | Research, scoring, personalization                  |
| [Identify](/company-docs/identify)         | Resolve a company from partial info (name, domain, URL, ID) | CRM deduplication, lead routing, entity resolution  |

## At a glance

|                     | Search                                               | Autocomplete                   | Enrich                           | Identify                         |
| ------------------- | ---------------------------------------------------- | ------------------------------ | -------------------------------- | -------------------------------- |
| **Endpoint**        | `/company/search`                                    | `/company/search/autocomplete` | `/company/enrich`                | `/company/identify`              |
| **Data source**     | Crustdata indexed                                    | Crustdata indexed              | Crustdata indexed                | Crustdata indexed                |
| **Purpose**         | Find companies by filters                            | Discover valid filter values   | Get full company profile         | Match partial info to a company  |
| **Filter syntax**   | `{ "field": "dotpath", "type": "op", "value": ... }` | Optional `filters` param       | N/A                              | N/A                              |
| **Pagination**      | Cursor-based                                         | —                              | —                                | —                                |
| **Field selection** | `fields` = dot-paths or sections                     | —                              | `fields` = dot-paths or sections | `fields` = dot-paths or sections |
| **Error codes**     | `400`, `401`, `403`, `500`                           | `400`, `401`, `500`            | `400`, `401`, `403`, `500`       | `400`, `401`, `403`, `500`       |

***

## Before you start

You need:

* A Crustdata API key
* A terminal with `curl` (or any HTTP client)
* The required header: `x-api-version: 2025-11-01`

All requests use **Bearer token authentication** and require the API version header:

```bash theme={"theme":"vitesse-black"}
--header 'authorization: Bearer YOUR_API_KEY'
--header 'x-api-version: 2025-11-01'
```

<Note>Replace `YOUR_API_KEY` in each example with your actual API key.</Note>

<Note>
  **Convention used in these docs:** Information labeled "OpenAPI contract"
  reflects the formal API specification. Information labeled "Current platform
  behavior" (such as rate limits, credit costs, and max page ranges) describes
  observed behavior that may change. See the [API
  reference](/openapi-specs/2025-11-01/introduction) for the formal OpenAPI
  spec.
</Note>

***

## Quickstart: enrich a company from a domain

The fastest way to get started is to enrich a company from its website domain. This single request returns the full company profile.

<CodeGroup>
  ```bash Request theme={"theme":"vitesse-black"}
  curl --request POST \
    --url https://api.crustdata.com/company/enrich \
    --header 'authorization: Bearer YOUR_API_KEY' \
    --header 'content-type: application/json' \
    --header 'x-api-version: 2025-11-01' \
    --data '{
      "domains": ["retool.com"]
    }'
  ```

  ```json Response theme={"theme":"vitesse-black"}
  {
      "results": [
          {
              "matched_on": "retool.com",
              "match_type": "domain",
              "matches": [
                  {
                      "confidence_score": 1.0,
                      "company_data": {
                          "basic_info": {
                              "name": "Retool",
                              "primary_domain": "retool.com",
                              "website": "https://retool.com/",
                              "company_type": "Privately Held",
                              "year_founded": "2017-01-01",
                              "employee_count_range": "201-500",
                              "industries": [
                                  "Software Development",
                                  "Technology, Information and Internet"
                              ]
                          }
                      }
                  }
              ]
          }
      ]
  }
  ```
</CodeGroup>

<Note>
  Response trimmed for clarity. The full response includes headcount, funding,
  hiring, competitors, and more.
</Note>

The response is an object with a `results` array — one entry per identifier you submitted:

* **`matched_on`** — the input you sent (`retool.com`).
* **`match_type`** — which identifier type was used (`domain`, `name`, `crustdata_company_id`, or `professional_network_profile_url`).
* **`confidence_score`** — how confident the match is (`1.0` = exact match).
* **`company_data`** — the full company profile, including `basic_info`, `headcount`, `funding`, `locations`, `taxonomy`, and more.

***

## Which API should you start with?

| If you want to...                                              | Start with                                 |
| -------------------------------------------------------------- | ------------------------------------------ |
| Build a target account list by geography, industry, or funding | [Search](/company-docs/search)             |
| Discover valid filter values before building search queries    | [Autocomplete](/company-docs/autocomplete) |
| Get richer context for scoring, prioritization, or diligence   | [Enrich](/company-docs/enrichment)         |

## Common workflows

1. **Discovery** — Start with [Autocomplete](/company-docs/autocomplete) to find valid filter values, then [Search](/company-docs/search) to build your list, then [Enrich](/company-docs/enrichment) the top matches for full profiles.
2. **Data cleanup** — Use [Enrich](/company-docs/enrichment) with a domain to resolve ambiguous records from CRM imports.
3. **Lead routing** — [Enrich](/company-docs/enrichment) incoming domains to get a stable company ID and industry, then [Search](/company-docs/search) for similar companies.

***

## Error handling

All Company API endpoints return structured errors. The exact status codes vary by endpoint:

| Status | Meaning                                                        | Applies to               |
| ------ | -------------------------------------------------------------- | ------------------------ |
| `400`  | Invalid request (bad field, wrong operator, malformed filters) | All endpoints            |
| `401`  | Invalid or missing API key                                     | All endpoints            |
| `403`  | Permission denied or insufficient credits                      | Search, Enrich, Identify |
| `500`  | Internal server error                                          | All endpoints            |

Error response format:

```json theme={"theme":"vitesse-black"}
{
    "error": {
        "type": "invalid_request",
        "message": "Unsupported columns in conditions: ['nonexistent_field']",
        "metadata": []
    }
}
```

For `401`, the format is simpler: `{"message": "Invalid API key in request"}`.

***

## Terminology reference

These are the most common terms used across the Company APIs:

| You say        | API request field                                                   | Used in          |
| -------------- | ------------------------------------------------------------------- | ---------------- |
| Company domain | `domains`                                                           | Enrich, Identify |
| Company name   | `names`                                                             | Enrich, Identify |
| Company ID     | `crustdata_company_ids`                                             | Enrich, Identify |
| HQ country     | `locations.hq_country` (ISO3: `"USA"`, `"GBR"`)                     | Search           |
| Industry       | `taxonomy.professional_network_industry` or `basic_info.industries` | Search           |
| Employee count | `headcount.total`                                                   | Search           |
| Total funding  | `funding.total_investment_usd`                                      | Search           |

<Note>
  Search uses ISO3 country codes (`"USA"`, `"GBR"`). Use
  [Autocomplete](/company-docs/autocomplete) to discover exact values for
  indexed Search filters.
</Note>

### Company ID fields

The company data model includes two ID fields:

| Field                   | Meaning                                                                                                    | When to use                                                                                     |
| ----------------------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `crustdata_company_id`  | Stable Crustdata company identifier. Appears at the top level of search results and inside `company_data`. | Use this for Search → Enrich workflows. Pass it in `crustdata_company_ids` when calling Enrich. |
| `basic_info.company_id` | Internal source company identifier. May match `crustdata_company_id` but is not guaranteed to.             | Generally, prefer `crustdata_company_id` for cross-API workflows.                               |

***

## Common footguns

| Mistake                                        | Fix                                                                                                                              |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Using `"United States"` in Search              | Search uses ISO3 codes: `"USA"`, `"GBR"`. Use [Autocomplete](/company-docs/autocomplete) to discover exact values.               |
| Using `>=` or `<=` operators in Search         | Use `=>` and `=<` instead.                                                                                                       |
| Mixing identifier types in Enrich              | Send one type per request: `domains`, `names`, `crustdata_company_ids`, or `professional_network_profile_urls`.                  |
| Confusing Search `fields` with Enrich `fields` | Search `fields` are dot-path response fields (e.g., `basic_info.name`). Enrich `fields` are section groups (e.g., `basic_info`). |
| Omitting `fields` in Search                    | Returns all fields per company — very large payloads. Always specify `fields` in production.                                     |

## Shared guidance

Use the endpoint pages for request/response details and no-match behavior.
For pricing, see [Pricing](/general/pricing). For rate-limit guidance, see
[Rate limits](/general/rate-limits).

***

## Next steps

* [Company Search](/company-docs/search) — find companies by domain, industry, funding, headcount, and more.
* [Company Autocomplete](/company-docs/autocomplete) — discover valid filter values before building queries.
* [Company Enrich](/company-docs/enrichment) — get detailed profiles with headcount, funding, hiring, and competitors.
* [Company Identify](/company-docs/identify) — resolve partial company info to a known entity.
* [Company Examples](/company-docs/examples) — ready-to-copy patterns for common use cases.

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.crustdata.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Company APIs

> Find, enrich, and analyze company records with the Crustdata Company APIs.

The Company APIs help you answer practical business questions: Which companies match your target market? What does this company look like before outreach? What are the valid filter values for my search?

There are four core endpoints, each designed for a different step in your workflow.

| API                                        | What it does                                                | Best for                                            |
| ------------------------------------------ | ----------------------------------------------------------- | --------------------------------------------------- |
| [Search](/company-docs/search)             | Find companies matching structured filters                  | Building lists, market scans, segmentation          |
| [Autocomplete](/company-docs/autocomplete) | Discover valid field values for search filters              | Building filter dropdowns, validating filter inputs |
| [Enrich](/company-docs/enrichment)         | Get a detailed company profile from a known identifier      | Research, scoring, personalization                  |
| [Identify](/company-docs/identify)         | Resolve a company from partial info (name, domain, URL, ID) | CRM deduplication, lead routing, entity resolution  |

## At a glance

|                     | Search                                               | Autocomplete                   | Enrich                           | Identify                         |
| ------------------- | ---------------------------------------------------- | ------------------------------ | -------------------------------- | -------------------------------- |
| **Endpoint**        | `/company/search`                                    | `/company/search/autocomplete` | `/company/enrich`                | `/company/identify`              |
| **Data source**     | Crustdata indexed                                    | Crustdata indexed              | Crustdata indexed                | Crustdata indexed                |
| **Purpose**         | Find companies by filters                            | Discover valid filter values   | Get full company profile         | Match partial info to a company  |
| **Filter syntax**   | `{ "field": "dotpath", "type": "op", "value": ... }` | Optional `filters` param       | N/A                              | N/A                              |
| **Pagination**      | Cursor-based                                         | —                              | —                                | —                                |
| **Field selection** | `fields` = dot-paths or sections                     | —                              | `fields` = dot-paths or sections | `fields` = dot-paths or sections |
| **Error codes**     | `400`, `401`, `403`, `500`                           | `400`, `401`, `500`            | `400`, `401`, `403`, `500`       | `400`, `401`, `403`, `500`       |

***

## Before you start

You need:

* A Crustdata API key
* A terminal with `curl` (or any HTTP client)
* The required header: `x-api-version: 2025-11-01`

All requests use **Bearer token authentication** and require the API version header:

```bash theme={"theme":"vitesse-black"}
--header 'authorization: Bearer YOUR_API_KEY'
--header 'x-api-version: 2025-11-01'
```

<Note>Replace `YOUR_API_KEY` in each example with your actual API key.</Note>

<Note>
  **Convention used in these docs:** Information labeled "OpenAPI contract"
  reflects the formal API specification. Information labeled "Current platform
  behavior" (such as rate limits, credit costs, and max page ranges) describes
  observed behavior that may change. See the [API
  reference](/openapi-specs/2025-11-01/introduction) for the formal OpenAPI
  spec.
</Note>

***

## Quickstart: enrich a company from a domain

The fastest way to get started is to enrich a company from its website domain. This single request returns the full company profile.

<CodeGroup>
  ```bash Request theme={"theme":"vitesse-black"}
  curl --request POST \
    --url https://api.crustdata.com/company/enrich \
    --header 'authorization: Bearer YOUR_API_KEY' \
    --header 'content-type: application/json' \
    --header 'x-api-version: 2025-11-01' \
    --data '{
      "domains": ["retool.com"]
    }'
  ```

  ```json Response theme={"theme":"vitesse-black"}
  {
      "results": [
          {
              "matched_on": "retool.com",
              "match_type": "domain",
              "matches": [
                  {
                      "confidence_score": 1.0,
                      "company_data": {
                          "basic_info": {
                              "name": "Retool",
                              "primary_domain": "retool.com",
                              "website": "https://retool.com/",
                              "company_type": "Privately Held",
                              "year_founded": "2017-01-01",
                              "employee_count_range": "201-500",
                              "industries": [
                                  "Software Development",
                                  "Technology, Information and Internet"
                              ]
                          }
                      }
                  }
              ]
          }
      ]
  }
  ```
</CodeGroup>

<Note>
  Response trimmed for clarity. The full response includes headcount, funding,
  hiring, competitors, and more.
</Note>

The response is an object with a `results` array — one entry per identifier you submitted:

* **`matched_on`** — the input you sent (`retool.com`).
* **`match_type`** — which identifier type was used (`domain`, `name`, `crustdata_company_id`, or `professional_network_profile_url`).
* **`confidence_score`** — how confident the match is (`1.0` = exact match).
* **`company_data`** — the full company profile, including `basic_info`, `headcount`, `funding`, `locations`, `taxonomy`, and more.

***

## Which API should you start with?

| If you want to...                                              | Start with                                 |
| -------------------------------------------------------------- | ------------------------------------------ |
| Build a target account list by geography, industry, or funding | [Search](/company-docs/search)             |
| Discover valid filter values before building search queries    | [Autocomplete](/company-docs/autocomplete) |
| Get richer context for scoring, prioritization, or diligence   | [Enrich](/company-docs/enrichment)         |

## Common workflows

1. **Discovery** — Start with [Autocomplete](/company-docs/autocomplete) to find valid filter values, then [Search](/company-docs/search) to build your list, then [Enrich](/company-docs/enrichment) the top matches for full profiles.
2. **Data cleanup** — Use [Enrich](/company-docs/enrichment) with a domain to resolve ambiguous records from CRM imports.
3. **Lead routing** — [Enrich](/company-docs/enrichment) incoming domains to get a stable company ID and industry, then [Search](/company-docs/search) for similar companies.

***

## Error handling

All Company API endpoints return structured errors. The exact status codes vary by endpoint:

| Status | Meaning                                                        | Applies to               |
| ------ | -------------------------------------------------------------- | ------------------------ |
| `400`  | Invalid request (bad field, wrong operator, malformed filters) | All endpoints            |
| `401`  | Invalid or missing API key                                     | All endpoints            |
| `403`  | Permission denied or insufficient credits                      | Search, Enrich, Identify |
| `500`  | Internal server error                                          | All endpoints            |

Error response format:

```json theme={"theme":"vitesse-black"}
{
    "error": {
        "type": "invalid_request",
        "message": "Unsupported columns in conditions: ['nonexistent_field']",
        "metadata": []
    }
}
```

For `401`, the format is simpler: `{"message": "Invalid API key in request"}`.

***

## Terminology reference

These are the most common terms used across the Company APIs:

| You say        | API request field                                                   | Used in          |
| -------------- | ------------------------------------------------------------------- | ---------------- |
| Company domain | `domains`                                                           | Enrich, Identify |
| Company name   | `names`                                                             | Enrich, Identify |
| Company ID     | `crustdata_company_ids`                                             | Enrich, Identify |
| HQ country     | `locations.hq_country` (ISO3: `"USA"`, `"GBR"`)                     | Search           |
| Industry       | `taxonomy.professional_network_industry` or `basic_info.industries` | Search           |
| Employee count | `headcount.total`                                                   | Search           |
| Total funding  | `funding.total_investment_usd`                                      | Search           |

<Note>
  Search uses ISO3 country codes (`"USA"`, `"GBR"`). Use
  [Autocomplete](/company-docs/autocomplete) to discover exact values for
  indexed Search filters.
</Note>

### Company ID fields

The company data model includes two ID fields:

| Field                   | Meaning                                                                                                    | When to use                                                                                     |
| ----------------------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `crustdata_company_id`  | Stable Crustdata company identifier. Appears at the top level of search results and inside `company_data`. | Use this for Search → Enrich workflows. Pass it in `crustdata_company_ids` when calling Enrich. |
| `basic_info.company_id` | Internal source company identifier. May match `crustdata_company_id` but is not guaranteed to.             | Generally, prefer `crustdata_company_id` for cross-API workflows.                               |

***

## Common footguns

| Mistake                                        | Fix                                                                                                                              |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Using `"United States"` in Search              | Search uses ISO3 codes: `"USA"`, `"GBR"`. Use [Autocomplete](/company-docs/autocomplete) to discover exact values.               |
| Using `>=` or `<=` operators in Search         | Use `=>` and `=<` instead.                                                                                                       |
| Mixing identifier types in Enrich              | Send one type per request: `domains`, `names`, `crustdata_company_ids`, or `professional_network_profile_urls`.                  |
| Confusing Search `fields` with Enrich `fields` | Search `fields` are dot-path response fields (e.g., `basic_info.name`). Enrich `fields` are section groups (e.g., `basic_info`). |
| Omitting `fields` in Search                    | Returns all fields per company — very large payloads. Always specify `fields` in production.                                     |

## Shared guidance

Use the endpoint pages for request/response details and no-match behavior.
For pricing, see [Pricing](/general/pricing). For rate-limit guidance, see
[Rate limits](/general/rate-limits).

***

## Next steps

* [Company Search](/company-docs/search) — find companies by domain, industry, funding, headcount, and more.
* [Company Autocomplete](/company-docs/autocomplete) — discover valid filter values before building queries.
* [Company Enrich](/company-docs/enrichment) — get detailed profiles with headcount, funding, hiring, and competitors.
* [Company Identify](/company-docs/identify) — resolve partial company info to a known entity.
* [Company Examples](/company-docs/examples) — ready-to-copy patterns for common use cases.
> ## Documentation Index
> Fetch the complete documentation index at: https://docs.crustdata.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Company Enrich

> Learn how to enrich company records using domains, profile URLs, names, or IDs, including multi-company requests and exact matching.

**Use this when** you already know the company and want its full profile — for research, scoring, personalization, or diligence.

The Company Enrich API takes an identifier you already have — a website
domain, a profile URL, a company name, or a Crustdata company ID — and
returns a detailed company profile with headcount, funding, industry, hiring,
and more. The same endpoint supports both single-company lookups and
multi-company requests.

Every request goes to the same endpoint:

```
POST https://api.crustdata.com/company/enrich
```

<Note>
  Replace `YOUR_API_KEY` in each example with your actual API key. All
  requests require the `x-api-version: 2025-11-01` header.
</Note>

## Rate limits and pricing

<Note>
  **Current platform behavior** — not specified in the OpenAPI contract:
</Note>

<Callout icon="coins" color="#5345e4">
  <strong>Pricing:</strong> <code>2 credits per record</code>.
</Callout>

* **Rate limit:** 15 requests per minute.

If you only need lightweight discovery, start with
[Company Search](/company-docs/search), then enrich the companies you want in
full detail.

***

## Your first enrichment: look up a company by domain

The simplest enrichment takes a website domain and returns matching company
profiles. Pass the domain in the `domains` array.

<CodeGroup>
  ```bash Request theme={"theme":"vitesse-black"}
  curl --request POST \
    --url https://api.crustdata.com/company/enrich \
    --header 'authorization: Bearer YOUR_API_KEY' \
    --header 'content-type: application/json' \
    --header 'x-api-version: 2025-11-01' \
    --data '{
      "domains": ["retool.com"]
    }'
  ```

  ```json Response theme={"theme":"vitesse-black"}
  [
      {
          "matched_on": "retool.com",
          "match_type": "domain",
          "matches": [
              {
                  "confidence_score": 1.0,
                  "company_data": {
                      "crustdata_company_id": 633593,
                      "basic_info": {
                          "name": "Retool",
                          "primary_domain": "retool.com",
                          "website": "https://retool.com/",
                          "description": "Build internal software better with AI...",
                          "company_type": "Privately Held",
                          "year_founded": "2017-01-01",
                          "employee_count_range": "201-500",
                          "markets": ["PRIVATE"],
                          "industries": [
                              "Software Development",
                              "Technology, Information and Internet"
                          ]
                      }
                  }
              }
          ]
      }
  ]
  ```
</CodeGroup>

<Note>Response trimmed for clarity.</Note>

<Tip>
  The `year_founded` field is returned as a string. The format may be a full
  date (e.g., `2017-01-01`) or a year string (e.g., `2017`) depending on the
  data source.
</Tip>

### Understanding the response

The Enrich API returns a **top-level array** — one entry per identifier you
submitted. Each entry has three fields:

* **`matched_on`** — the identifier you submitted (the domain, URL, name, or ID).
* **`match_type`** — which identifier type was used. Possible values: `domain`, `name`, `crustdata_company_id`, `professional_network_profile_url`.
* **`matches`** — an array of candidate companies. Each match includes a `confidence_score` and the full `company_data` object.

Domain lookups may return multiple matches if the domain is ambiguous. The
highest `confidence_score` indicates the best match. Use `exact_match: true`
to restrict results to companies whose `primary_domain` exactly matches your
input (see below).

### How to interpret results

* **Multiple matches:** If `matches` contains more than one entry, check `confidence_score` — the highest score is the best match. Use `primary_domain` to verify.
* **Empty `matches` array:** The identifier did not match any company. Check for typos or try a different identifier type.
* **`confidence_score`:** Higher is better. A score of `1.0` is common for
  direct identifier lookups such as profile URLs or company IDs.

### What is inside `company_data`?

The enriched `company_data` object contains the following sections:

| Section            | Key fields                                                                                                                                           | Description                       |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| `basic_info`       | `name`, `primary_domain`, `website`, `professional_network_url`, `year_founded`, `description`, `company_type`, `employee_count_range`, `industries` | Core identity and classification  |
| `headcount`        | `total`, `by_role_absolute`, `by_role_percent`, `by_region_absolute`, `growth_percent`                                                               | Employee footprint and growth     |
| `funding`          | `total_investment_usd`, `last_round_amount_usd`, `last_fundraise_date`, `last_round_type`, `investors`                                               | Funding and investor data         |
| `locations`        | `hq_country`, `hq_state`, `hq_city`, `headquarters`                                                                                                  | Headquarters location             |
| `taxonomy`         | `categories`, `professional_network_industry`, `professional_network_specialities`                                                                   | Industry and classification data  |
| `revenue`          | `estimated` (`lower_bound_usd`, `upper_bound_usd`), `public_markets`, `acquisition_status`                                                           | Revenue estimates and market data |
| `hiring`           | `openings_count`, `openings_growth_percent`, `recent_titles_csv`                                                                                     | Hiring demand and open roles      |
| `followers`        | `count`, `mom_percent`, `qoq_percent`, `yoy_percent`                                                                                                 | Audience and follower metrics     |
| `seo`              | `total_organic_results`, `monthly_organic_clicks`, `monthly_google_ads_budget`                                                                       | Search visibility metrics         |
| `competitors`      | `company_ids`, `websites`                                                                                                                            | Competitor data                   |
| `social_profiles`  | `twitter_url` and other external profile links                                                                                                       | External profiles and links       |
| `web_traffic`      | `domain_traffic` (`monthly_visitors`, traffic sources)                                                                                               | Website traffic and sources       |
| `employee_reviews` | `overall_rating`, `culture_and_values_rating`, `work_life_balance_rating`, `review_count`                                                            | Employee review data              |
| `people`           | `decision_makers`, `founders`, `cxos`                                                                                                                | Key people at the company         |
| `news`             | `article_url`, `article_title`, `article_publish_date`                                                                                               | Recent news articles              |
| `software_reviews` | `review_count`, `average_rating`                                                                                                                     | Software review metrics           |
| `status`           | `state` (`enriching`, `not_found`)                                                                                                                   | Enrichment processing status      |

***

## Enrich by profile URL

If you have a company profile URL, pass it in
`professional_network_profile_urls`. This gives you a direct match.

<CodeGroup>
  ```bash Request theme={"theme":"vitesse-black"}
  curl --request POST \
    --url https://api.crustdata.com/company/enrich \
    --header 'authorization: Bearer YOUR_API_KEY' \
    --header 'content-type: application/json' \
    --header 'x-api-version: 2025-11-01' \
    --data '{
      "professional_network_profile_urls": [
        "https://www.linkedin.com/company/serverobotics"
      ]
    }'
  ```

  ```json Response theme={"theme":"vitesse-black"}
  [
      {
          "matched_on": "https://www.linkedin.com/company/serverobotics",
          "match_type": "professional_network_profile_url",
          "matches": [
              {
                  "confidence_score": 1.0,
                  "company_data": {
                      "crustdata_company_id": 628895,
                      "basic_info": {
                          "name": "Serve Robotics",
                          "primary_domain": "serverobotics.com",
                          "website": "https://www.serverobotics.com/",
                          "company_type": "Public Company",
                          "year_founded": "2021-01-01",
                          "employee_count_range": "51-200",
                          "markets": ["PRIVATE", "NASDAQ"],
                          "industries": [
                              "Technology, Information and Internet",
                              "Technology, Information and Media"
                          ]
                      }
                  }
              }
          ]
      }
  ]
  ```
</CodeGroup>

<Note>Response trimmed for clarity.</Note>

Profile URL lookups are direct matches — they typically return a single match
with high confidence.

***

## Enrich by company name

You can also enrich by company name. This is useful when you only have a name from a form submission or event badge scan.

<CodeGroup>
  ```bash Request theme={"theme":"vitesse-black"}
  curl --request POST \
    --url https://api.crustdata.com/company/enrich \
    --header 'authorization: Bearer YOUR_API_KEY' \
    --header 'content-type: application/json' \
    --header 'x-api-version: 2025-11-01' \
    --data '{
      "names": ["Retool"]
    }'
  ```
</CodeGroup>

Name-based enrichment may return multiple candidates. Check `confidence_score` and `primary_domain` to pick the right match.

***

## Enrich by company ID

If you already have a Crustdata company ID (from a previous search call), pass it in `crustdata_company_ids` for an exact lookup.

<CodeGroup>
  ```bash Request theme={"theme":"vitesse-black"}
  curl --request POST \
    --url https://api.crustdata.com/company/enrich \
    --header 'authorization: Bearer YOUR_API_KEY' \
    --header 'content-type: application/json' \
    --header 'x-api-version: 2025-11-01' \
    --data '{
      "crustdata_company_ids": [633593]
    }'
  ```
</CodeGroup>

Company ID lookups typically return a single exact match, making this the most precise enrichment method.

***

## Use exact match for stricter domain matching

By default, domain-based enrichment can return multiple candidates.
Set `exact_match: true` to restrict results to companies whose
`primary_domain` exactly matches your input.

<CodeGroup>
  ```bash Request theme={"theme":"vitesse-black"}
  curl --request POST \
    --url https://api.crustdata.com/company/enrich \
    --header 'authorization: Bearer YOUR_API_KEY' \
    --header 'content-type: application/json' \
    --header 'x-api-version: 2025-11-01' \
    --data '{
      "domains": ["cashfree.com"],
      "exact_match": true
    }'
  ```

  ```json Response theme={"theme":"vitesse-black"}
  [
      {
          "matched_on": "cashfree.com",
          "match_type": "domain",
          "matches": [
              {
                  "confidence_score": 15.0,
                  "company_data": {
                      "basic_info": {
                          "name": "Cashfree Payments",
                          "primary_domain": "cashfree.com"
                      }
                  }
              },
              {
                  "confidence_score": 4.0,
                  "company_data": {
                      "basic_info": {
                          "name": "Cashfree Tech",
                          "primary_domain": "cashfree.com"
                      }
                  }
              }
          ]
      }
  ]
  ```
</CodeGroup>

<Note>Response trimmed for clarity.</Note>

With `exact_match: true`, results are limited to records whose
`primary_domain` exactly matches your input. You may still receive multiple
matches when more than one company record shares that same domain.

***

## Enrich multiple companies in one request

The same endpoint supports multiple identifiers in a single request, so
multi-company enrich stays on this page rather than as a separate API.

<CodeGroup>
  ```bash Request theme={"theme":"vitesse-black"}
  curl --request POST \
    --url https://api.crustdata.com/company/enrich \
    --header 'authorization: Bearer YOUR_API_KEY' \
    --header 'content-type: application/json' \
    --header 'x-api-version: 2025-11-01' \
    --data '{
      "crustdata_company_ids": [633593, 628895]
    }'
  ```
</CodeGroup>

### Multi-company enrich tips

* Submit **one identifier type** per request. Mixing identifier types (e.g., sending both `domains` and `names`) is not supported.
* Each entry in the response corresponds to the input at the same position, so you can match results back to your input list by index.
* If some identifiers fail to match, their `matches` array will be empty, but the request still succeeds for the others.

***

## Choosing the right identifier

Each identifier type has trade-offs in precision and convenience.

|                     | Domain                              | Profile URL            | Company Name        | Company ID                              |
| ------------------- | ----------------------------------- | ---------------------- | ------------------- | --------------------------------------- |
| **Precision**       | High                                | Highest                | Medium              | Highest                                 |
| **Best for**        | CRM cleanup, inbound leads          | Known company profiles | Fuzzy matching      | Internal pipelines and search follow-up |
| **Typical matches** | One or more exact-domain candidates | 1                      | Multiple candidates | 1                                       |

***

## Common workflow: Search then Enrich

The most powerful pattern combines [Company Search](/company-docs/search) with Company Enrich. Search finds companies matching your criteria; Enrich gets the full profile for each match.

**Step 1:** Search for well-funded software companies.

```bash theme={"theme":"vitesse-black"}
curl --request POST \
  --url https://api.crustdata.com/company/search \
  --header 'authorization: Bearer YOUR_API_KEY' \
  --header 'content-type: application/json' \
  --header 'x-api-version: 2025-11-01' \
  --data '{
    "filters": {
      "op": "and",
      "conditions": [
        {
          "field": "basic_info.industries",
          "type": "in",
          "value": ["Software Development"]
        },
        {
          "field": "funding.total_investment_usd",
          "type": ">",
          "value": 10000000
        }
      ]
    },
    "limit": 5,
    "fields": ["crustdata_company_id", "basic_info.name", "basic_info.primary_domain"]
  }'
```

**Step 2:** Take the `crustdata_company_id` values from the search results and pass them in `crustdata_company_ids` to enrich.

```bash theme={"theme":"vitesse-black"}
curl --request POST \
  --url https://api.crustdata.com/company/enrich \
  --header 'authorization: Bearer YOUR_API_KEY' \
  --header 'content-type: application/json' \
  --header 'x-api-version: 2025-11-01' \
  --data '{
    "crustdata_company_ids": [633593, 628895]
  }'
```

This two-step pattern is the foundation for sales, research, and investment
workflows. Search narrows the universe; Enrich fills in the details. Because
`crustdata_company_ids` is an array, the same endpoint works for one company
or many companies.

***

## Request parameter reference

| Parameter                           | Type       | Required                             | Default | Description                                       |
| ----------------------------------- | ---------- | ------------------------------------ | ------- | ------------------------------------------------- |
| `domains`                           | string\[]  | Exactly one identifier type required | —       | Website domains to enrich.                        |
| `professional_network_profile_urls` | string\[]  | Exactly one identifier type required | —       | Company profile URLs to enrich.                   |
| `names`                             | string\[]  | Exactly one identifier type required | —       | Company names to enrich.                          |
| `crustdata_company_ids`             | integer\[] | Exactly one identifier type required | —       | Crustdata company IDs to enrich.                  |
| `fields`                            | string\[]  | No                                   | All     | Specific field groups to include in the response. |
| `exact_match`                       | boolean    | No                                   | `null`  | Set to `true` to force exact domain matching.     |

<Note>
  **Current platform behavior:** Submit exactly one identifier type per
  request.
</Note>

### Valid `fields` values

Use the `fields` parameter to limit which sections are returned in `company_data`. If `fields` is omitted, all sections are returned.

| Field group        | What it returns                                                           |
| ------------------ | ------------------------------------------------------------------------- |
| `basic_info`       | Company name, domain, website, profile URL, industry, type, year founded  |
| `headcount`        | Employee count, role/region breakdowns, growth metrics                    |
| `funding`          | Total funding, last round details, investor list                          |
| `locations`        | HQ country, state, city, full headquarters address                        |
| `taxonomy`         | Industry, category, and speciality fields                                 |
| `revenue`          | Revenue estimates (lower/upper bound), public markets, acquisition status |
| `hiring`           | Open job count, hiring growth rate, recent job titles                     |
| `followers`        | Follower count, month-over-month/quarter/year growth                      |
| `seo`              | Organic search results, monthly organic clicks, Google Ads budget         |
| `competitors`      | Competitor company IDs and websites                                       |
| `social_profiles`  | External profile links                                                    |
| `web_traffic`      | Monthly visitors, traffic source breakdown                                |
| `employee_reviews` | Overall, culture, and work-life balance ratings                           |
| `people`           | Decision makers, founders, C-level executives                             |
| `news`             | Recent article URLs, titles, and publish dates                            |
| `software_reviews` | Review count and average rating                                           |
| `status`           | Enrichment processing state (enriching, not found)                        |

## Response fields reference

The response is a top-level array. Each item in the array contains:

| Field                        | Type   | Description                                                                  |
| ---------------------------- | ------ | ---------------------------------------------------------------------------- |
| `matched_on`                 | string | The input identifier you submitted                                           |
| `match_type`                 | string | `domain`, `name`, `crustdata_company_id`, `professional_network_profile_url` |
| `matches`                    | array  | Array of candidate matches (may be empty for no-match)                       |
| `matches[].confidence_score` | number | How confident the match is. Higher is better.                                |
| `matches[].company_data`     | object | Full enriched company profile (see table above)                              |

***

## Validation rules

<Note>
  These rules reflect current platform behavior. See the [API
  reference](/openapi-specs/2025-11-01/introduction) for the formal OpenAPI
  contract.
</Note>

| Rule                            | Behavior                                                                                                                               |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| One identifier type per request | Submit `domains`, `names`, `crustdata_company_ids`, or `professional_network_profile_urls` — not a mix. Mixing types is not supported. |
| `fields` is optional            | Omitting returns all sections. Pass section group names to reduce payload.                                                             |
| `exact_match` is optional       | Default is `null` (auto-detect). Set `true` for strict domain-only matching.                                                           |
| Multi-company requests          | You can submit multiple values in one identifier array. Each is matched independently.                                                 |

## Errors

### No-match behavior

When enriching, each identifier is matched independently:

* **Full match:** All identifiers match — each array entry has populated `matches`.
* **Partial match:** Some identifiers match and others do not. Matched identifiers have `company_data`; unmatched identifiers return an empty `matches: []` array.
* **No match:** All identifiers fail to match. Current platform behavior returns `200 OK` with empty `matches: []` for each array entry.

<Note>
  The OpenAPI spec also defines a `404` response for this endpoint. Current
  platform behavior returns `200` with empty `matches`, but integrations
  should handle both `200` empty-match and `404` cases.
</Note>

```json No match — 200 with empty matches theme={"theme":"vitesse-black"}
[
    {
        "matched_on": "nonexistent-domain.com",
        "match_type": "domain",
        "matches": []
    }
]
```

***

## API reference summary

| Detail       | Value                                                                                                                                        |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Endpoint** | `POST /company/enrich`                                                                                                                       |
| **Auth**     | Bearer token + `x-api-version: 2025-11-01`                                                                                                   |
| **Request**  | One identifier type: `domains`, `names`, `crustdata_company_ids`, or `professional_network_profile_urls`. Optional: `fields`, `exact_match`. |
| **Response** | Top-level array: `[{ matched_on, match_type, matches: [{ confidence_score, company_data }] }]`                                               |
| **No match** | `200` with empty `matches: []` for unmatched identifiers. The OpenAPI spec also defines `404`; handle both.                                  |
| **Errors**   | `400` (bad request), `401` (bad auth), `403` (permission/credits), `404` (per spec), `500` (server error)                                    |

See the [full API reference](/openapi-specs/2025-11-01/introduction) for the complete OpenAPI schema.

***

## What to do next

* **Search for companies** — use [Company Search](/company-docs/search) to find companies by industry, funding, headcount, and more.
* **Discover filter values** — use [Autocomplete](/company-docs/autocomplete) to find valid values before building search filters.
* **See more examples** — browse [company examples](/company-docs/examples) for ready-to-copy patterns.
> ## Documentation Index
> Fetch the complete documentation index at: https://docs.crustdata.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Company Enrich

> Learn how to enrich company records using domains, profile URLs, names, or IDs, including multi-company requests and exact matching.

**Use this when** you already know the company and want its full profile — for research, scoring, personalization, or diligence.

The Company Enrich API takes an identifier you already have — a website
domain, a profile URL, a company name, or a Crustdata company ID — and
returns a detailed company profile with headcount, funding, industry, hiring,
and more. The same endpoint supports both single-company lookups and
multi-company requests.

Every request goes to the same endpoint:

```
POST https://api.crustdata.com/company/enrich
```

<Note>
  Replace `YOUR_API_KEY` in each example with your actual API key. All
  requests require the `x-api-version: 2025-11-01` header.
</Note>

## Rate limits and pricing

<Note>
  **Current platform behavior** — not specified in the OpenAPI contract:
</Note>

<Callout icon="coins" color="#5345e4">
  <strong>Pricing:</strong> <code>2 credits per record</code>.
</Callout>

* **Rate limit:** 15 requests per minute.

If you only need lightweight discovery, start with
[Company Search](/company-docs/search), then enrich the companies you want in
full detail.

***

## Your first enrichment: look up a company by domain

The simplest enrichment takes a website domain and returns matching company
profiles. Pass the domain in the `domains` array.

<CodeGroup>
  ```bash Request theme={"theme":"vitesse-black"}
  curl --request POST \
    --url https://api.crustdata.com/company/enrich \
    --header 'authorization: Bearer YOUR_API_KEY' \
    --header 'content-type: application/json' \
    --header 'x-api-version: 2025-11-01' \
    --data '{
      "domains": ["retool.com"]
    }'
  ```

  ```json Response theme={"theme":"vitesse-black"}
  [
      {
          "matched_on": "retool.com",
          "match_type": "domain",
          "matches": [
              {
                  "confidence_score": 1.0,
                  "company_data": {
                      "crustdata_company_id": 633593,
                      "basic_info": {
                          "name": "Retool",
                          "primary_domain": "retool.com",
                          "website": "https://retool.com/",
                          "description": "Build internal software better with AI...",
                          "company_type": "Privately Held",
                          "year_founded": "2017-01-01",
                          "employee_count_range": "201-500",
                          "markets": ["PRIVATE"],
                          "industries": [
                              "Software Development",
                              "Technology, Information and Internet"
                          ]
                      }
                  }
              }
          ]
      }
  ]
  ```
</CodeGroup>

<Note>Response trimmed for clarity.</Note>

<Tip>
  The `year_founded` field is returned as a string. The format may be a full
  date (e.g., `2017-01-01`) or a year string (e.g., `2017`) depending on the
  data source.
</Tip>

### Understanding the response

The Enrich API returns a **top-level array** — one entry per identifier you
submitted. Each entry has three fields:

* **`matched_on`** — the identifier you submitted (the domain, URL, name, or ID).
* **`match_type`** — which identifier type was used. Possible values: `domain`, `name`, `crustdata_company_id`, `professional_network_profile_url`.
* **`matches`** — an array of candidate companies. Each match includes a `confidence_score` and the full `company_data` object.

Domain lookups may return multiple matches if the domain is ambiguous. The
highest `confidence_score` indicates the best match. Use `exact_match: true`
to restrict results to companies whose `primary_domain` exactly matches your
input (see below).

### How to interpret results

* **Multiple matches:** If `matches` contains more than one entry, check `confidence_score` — the highest score is the best match. Use `primary_domain` to verify.
* **Empty `matches` array:** The identifier did not match any company. Check for typos or try a different identifier type.
* **`confidence_score`:** Higher is better. A score of `1.0` is common for
  direct identifier lookups such as profile URLs or company IDs.

### What is inside `company_data`?

The enriched `company_data` object contains the following sections:

| Section            | Key fields                                                                                                                                           | Description                       |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| `basic_info`       | `name`, `primary_domain`, `website`, `professional_network_url`, `year_founded`, `description`, `company_type`, `employee_count_range`, `industries` | Core identity and classification  |
| `headcount`        | `total`, `by_role_absolute`, `by_role_percent`, `by_region_absolute`, `growth_percent`                                                               | Employee footprint and growth     |
| `funding`          | `total_investment_usd`, `last_round_amount_usd`, `last_fundraise_date`, `last_round_type`, `investors`                                               | Funding and investor data         |
| `locations`        | `hq_country`, `hq_state`, `hq_city`, `headquarters`                                                                                                  | Headquarters location             |
| `taxonomy`         | `categories`, `professional_network_industry`, `professional_network_specialities`                                                                   | Industry and classification data  |
| `revenue`          | `estimated` (`lower_bound_usd`, `upper_bound_usd`), `public_markets`, `acquisition_status`                                                           | Revenue estimates and market data |
| `hiring`           | `openings_count`, `openings_growth_percent`, `recent_titles_csv`                                                                                     | Hiring demand and open roles      |
| `followers`        | `count`, `mom_percent`, `qoq_percent`, `yoy_percent`                                                                                                 | Audience and follower metrics     |
| `seo`              | `total_organic_results`, `monthly_organic_clicks`, `monthly_google_ads_budget`                                                                       | Search visibility metrics         |
| `competitors`      | `company_ids`, `websites`                                                                                                                            | Competitor data                   |
| `social_profiles`  | `twitter_url` and other external profile links                                                                                                       | External profiles and links       |
| `web_traffic`      | `domain_traffic` (`monthly_visitors`, traffic sources)                                                                                               | Website traffic and sources       |
| `employee_reviews` | `overall_rating`, `culture_and_values_rating`, `work_life_balance_rating`, `review_count`                                                            | Employee review data              |
| `people`           | `decision_makers`, `founders`, `cxos`                                                                                                                | Key people at the company         |
| `news`             | `article_url`, `article_title`, `article_publish_date`                                                                                               | Recent news articles              |
| `software_reviews` | `review_count`, `average_rating`                                                                                                                     | Software review metrics           |
| `status`           | `state` (`enriching`, `not_found`)                                                                                                                   | Enrichment processing status      |

***

## Enrich by profile URL

If you have a company profile URL, pass it in
`professional_network_profile_urls`. This gives you a direct match.

<CodeGroup>
  ```bash Request theme={"theme":"vitesse-black"}
  curl --request POST \
    --url https://api.crustdata.com/company/enrich \
    --header 'authorization: Bearer YOUR_API_KEY' \
    --header 'content-type: application/json' \
    --header 'x-api-version: 2025-11-01' \
    --data '{
      "professional_network_profile_urls": [
        "https://www.linkedin.com/company/serverobotics"
      ]
    }'
  ```

  ```json Response theme={"theme":"vitesse-black"}
  [
      {
          "matched_on": "https://www.linkedin.com/company/serverobotics",
          "match_type": "professional_network_profile_url",
          "matches": [
              {
                  "confidence_score": 1.0,
                  "company_data": {
                      "crustdata_company_id": 628895,
                      "basic_info": {
                          "name": "Serve Robotics",
                          "primary_domain": "serverobotics.com",
                          "website": "https://www.serverobotics.com/",
                          "company_type": "Public Company",
                          "year_founded": "2021-01-01",
                          "employee_count_range": "51-200",
                          "markets": ["PRIVATE", "NASDAQ"],
                          "industries": [
                              "Technology, Information and Internet",
                              "Technology, Information and Media"
                          ]
                      }
                  }
              }
          ]
      }
  ]
  ```
</CodeGroup>

<Note>Response trimmed for clarity.</Note>

Profile URL lookups are direct matches — they typically return a single match
with high confidence.

***

## Enrich by company name

You can also enrich by company name. This is useful when you only have a name from a form submission or event badge scan.

<CodeGroup>
  ```bash Request theme={"theme":"vitesse-black"}
  curl --request POST \
    --url https://api.crustdata.com/company/enrich \
    --header 'authorization: Bearer YOUR_API_KEY' \
    --header 'content-type: application/json' \
    --header 'x-api-version: 2025-11-01' \
    --data '{
      "names": ["Retool"]
    }'
  ```
</CodeGroup>

Name-based enrichment may return multiple candidates. Check `confidence_score` and `primary_domain` to pick the right match.

***

## Enrich by company ID

If you already have a Crustdata company ID (from a previous search call), pass it in `crustdata_company_ids` for an exact lookup.

<CodeGroup>
  ```bash Request theme={"theme":"vitesse-black"}
  curl --request POST \
    --url https://api.crustdata.com/company/enrich \
    --header 'authorization: Bearer YOUR_API_KEY' \
    --header 'content-type: application/json' \
    --header 'x-api-version: 2025-11-01' \
    --data '{
      "crustdata_company_ids": [633593]
    }'
  ```
</CodeGroup>

Company ID lookups typically return a single exact match, making this the most precise enrichment method.

***

## Use exact match for stricter domain matching

By default, domain-based enrichment can return multiple candidates.
Set `exact_match: true` to restrict results to companies whose
`primary_domain` exactly matches your input.

<CodeGroup>
  ```bash Request theme={"theme":"vitesse-black"}
  curl --request POST \
    --url https://api.crustdata.com/company/enrich \
    --header 'authorization: Bearer YOUR_API_KEY' \
    --header 'content-type: application/json' \
    --header 'x-api-version: 2025-11-01' \
    --data '{
      "domains": ["cashfree.com"],
      "exact_match": true
    }'
  ```

  ```json Response theme={"theme":"vitesse-black"}
  [
      {
          "matched_on": "cashfree.com",
          "match_type": "domain",
          "matches": [
              {
                  "confidence_score": 15.0,
                  "company_data": {
                      "basic_info": {
                          "name": "Cashfree Payments",
                          "primary_domain": "cashfree.com"
                      }
                  }
              },
              {
                  "confidence_score": 4.0,
                  "company_data": {
                      "basic_info": {
                          "name": "Cashfree Tech",
                          "primary_domain": "cashfree.com"
                      }
                  }
              }
          ]
      }
  ]
  ```
</CodeGroup>

<Note>Response trimmed for clarity.</Note>

With `exact_match: true`, results are limited to records whose
`primary_domain` exactly matches your input. You may still receive multiple
matches when more than one company record shares that same domain.

***

## Enrich multiple companies in one request

The same endpoint supports multiple identifiers in a single request, so
multi-company enrich stays on this page rather than as a separate API.

<CodeGroup>
  ```bash Request theme={"theme":"vitesse-black"}
  curl --request POST \
    --url https://api.crustdata.com/company/enrich \
    --header 'authorization: Bearer YOUR_API_KEY' \
    --header 'content-type: application/json' \
    --header 'x-api-version: 2025-11-01' \
    --data '{
      "crustdata_company_ids": [633593, 628895]
    }'
  ```
</CodeGroup>

### Multi-company enrich tips

* Submit **one identifier type** per request. Mixing identifier types (e.g., sending both `domains` and `names`) is not supported.
* Each entry in the response corresponds to the input at the same position, so you can match results back to your input list by index.
* If some identifiers fail to match, their `matches` array will be empty, but the request still succeeds for the others.

***

## Choosing the right identifier

Each identifier type has trade-offs in precision and convenience.

|                     | Domain                              | Profile URL            | Company Name        | Company ID                              |
| ------------------- | ----------------------------------- | ---------------------- | ------------------- | --------------------------------------- |
| **Precision**       | High                                | Highest                | Medium              | Highest                                 |
| **Best for**        | CRM cleanup, inbound leads          | Known company profiles | Fuzzy matching      | Internal pipelines and search follow-up |
| **Typical matches** | One or more exact-domain candidates | 1                      | Multiple candidates | 1                                       |

***

## Common workflow: Search then Enrich

The most powerful pattern combines [Company Search](/company-docs/search) with Company Enrich. Search finds companies matching your criteria; Enrich gets the full profile for each match.

**Step 1:** Search for well-funded software companies.

```bash theme={"theme":"vitesse-black"}
curl --request POST \
  --url https://api.crustdata.com/company/search \
  --header 'authorization: Bearer YOUR_API_KEY' \
  --header 'content-type: application/json' \
  --header 'x-api-version: 2025-11-01' \
  --data '{
    "filters": {
      "op": "and",
      "conditions": [
        {
          "field": "basic_info.industries",
          "type": "in",
          "value": ["Software Development"]
        },
        {
          "field": "funding.total_investment_usd",
          "type": ">",
          "value": 10000000
        }
      ]
    },
    "limit": 5,
    "fields": ["crustdata_company_id", "basic_info.name", "basic_info.primary_domain"]
  }'
```

**Step 2:** Take the `crustdata_company_id` values from the search results and pass them in `crustdata_company_ids` to enrich.

```bash theme={"theme":"vitesse-black"}
curl --request POST \
  --url https://api.crustdata.com/company/enrich \
  --header 'authorization: Bearer YOUR_API_KEY' \
  --header 'content-type: application/json' \
  --header 'x-api-version: 2025-11-01' \
  --data '{
    "crustdata_company_ids": [633593, 628895]
  }'
```

This two-step pattern is the foundation for sales, research, and investment
workflows. Search narrows the universe; Enrich fills in the details. Because
`crustdata_company_ids` is an array, the same endpoint works for one company
or many companies.

***

## Request parameter reference

| Parameter                           | Type       | Required                             | Default | Description                                       |
| ----------------------------------- | ---------- | ------------------------------------ | ------- | ------------------------------------------------- |
| `domains`                           | string\[]  | Exactly one identifier type required | —       | Website domains to enrich.                        |
| `professional_network_profile_urls` | string\[]  | Exactly one identifier type required | —       | Company profile URLs to enrich.                   |
| `names`                             | string\[]  | Exactly one identifier type required | —       | Company names to enrich.                          |
| `crustdata_company_ids`             | integer\[] | Exactly one identifier type required | —       | Crustdata company IDs to enrich.                  |
| `fields`                            | string\[]  | No                                   | All     | Specific field groups to include in the response. |
| `exact_match`                       | boolean    | No                                   | `null`  | Set to `true` to force exact domain matching.     |

<Note>
  **Current platform behavior:** Submit exactly one identifier type per
  request.
</Note>

### Valid `fields` values

Use the `fields` parameter to limit which sections are returned in `company_data`. If `fields` is omitted, all sections are returned.

| Field group        | What it returns                                                           |
| ------------------ | ------------------------------------------------------------------------- |
| `basic_info`       | Company name, domain, website, profile URL, industry, type, year founded  |
| `headcount`        | Employee count, role/region breakdowns, growth metrics                    |
| `funding`          | Total funding, last round details, investor list                          |
| `locations`        | HQ country, state, city, full headquarters address                        |
| `taxonomy`         | Industry, category, and speciality fields                                 |
| `revenue`          | Revenue estimates (lower/upper bound), public markets, acquisition status |
| `hiring`           | Open job count, hiring growth rate, recent job titles                     |
| `followers`        | Follower count, month-over-month/quarter/year growth                      |
| `seo`              | Organic search results, monthly organic clicks, Google Ads budget         |
| `competitors`      | Competitor company IDs and websites                                       |
| `social_profiles`  | External profile links                                                    |
| `web_traffic`      | Monthly visitors, traffic source breakdown                                |
| `employee_reviews` | Overall, culture, and work-life balance ratings                           |
| `people`           | Decision makers, founders, C-level executives                             |
| `news`             | Recent article URLs, titles, and publish dates                            |
| `software_reviews` | Review count and average rating                                           |
| `status`           | Enrichment processing state (enriching, not found)                        |

## Response fields reference

The response is a top-level array. Each item in the array contains:

| Field                        | Type   | Description                                                                  |
| ---------------------------- | ------ | ---------------------------------------------------------------------------- |
| `matched_on`                 | string | The input identifier you submitted                                           |
| `match_type`                 | string | `domain`, `name`, `crustdata_company_id`, `professional_network_profile_url` |
| `matches`                    | array  | Array of candidate matches (may be empty for no-match)                       |
| `matches[].confidence_score` | number | How confident the match is. Higher is better.                                |
| `matches[].company_data`     | object | Full enriched company profile (see table above)                              |

***

## Validation rules

<Note>
  These rules reflect current platform behavior. See the [API
  reference](/openapi-specs/2025-11-01/introduction) for the formal OpenAPI
  contract.
</Note>

| Rule                            | Behavior                                                                                                                               |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| One identifier type per request | Submit `domains`, `names`, `crustdata_company_ids`, or `professional_network_profile_urls` — not a mix. Mixing types is not supported. |
| `fields` is optional            | Omitting returns all sections. Pass section group names to reduce payload.                                                             |
| `exact_match` is optional       | Default is `null` (auto-detect). Set `true` for strict domain-only matching.                                                           |
| Multi-company requests          | You can submit multiple values in one identifier array. Each is matched independently.                                                 |

## Errors

### No-match behavior

When enriching, each identifier is matched independently:

* **Full match:** All identifiers match — each array entry has populated `matches`.
* **Partial match:** Some identifiers match and others do not. Matched identifiers have `company_data`; unmatched identifiers return an empty `matches: []` array.
* **No match:** All identifiers fail to match. Current platform behavior returns `200 OK` with empty `matches: []` for each array entry.

<Note>
  The OpenAPI spec also defines a `404` response for this endpoint. Current
  platform behavior returns `200` with empty `matches`, but integrations
  should handle both `200` empty-match and `404` cases.
</Note>

```json No match — 200 with empty matches theme={"theme":"vitesse-black"}
[
    {
        "matched_on": "nonexistent-domain.com",
        "match_type": "domain",
        "matches": []
    }
]
```

***

## API reference summary

| Detail       | Value                                                                                                                                        |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Endpoint** | `POST /company/enrich`                                                                                                                       |
| **Auth**     | Bearer token + `x-api-version: 2025-11-01`                                                                                                   |
| **Request**  | One identifier type: `domains`, `names`, `crustdata_company_ids`, or `professional_network_profile_urls`. Optional: `fields`, `exact_match`. |
| **Response** | Top-level array: `[{ matched_on, match_type, matches: [{ confidence_score, company_data }] }]`                                               |
| **No match** | `200` with empty `matches: []` for unmatched identifiers. The OpenAPI spec also defines `404`; handle both.                                  |
| **Errors**   | `400` (bad request), `401` (bad auth), `403` (permission/credits), `404` (per spec), `500` (server error)                                    |

See the [full API reference](/openapi-specs/2025-11-01/introduction) for the complete OpenAPI schema.

***

## What to do next

* **Search for companies** — use [Company Search](/company-docs/search) to find companies by industry, funding, headcount, and more.
* **Discover filter values** — use [Autocomplete](/company-docs/autocomplete) to find valid values before building search filters.
* **See more examples** — browse [company examples](/company-docs/examples) for ready-to-copy patterns.
> ## Documentation Index
> Fetch the complete documentation index at: https://docs.crustdata.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Company Autocomplete

> Learn how to discover valid field values for Company Search filters using the Company Autocomplete API.

**Use this when** you need to discover valid filter values before building a Company Search query — for example, finding the exact industry label or country code the API expects.

The Company Autocomplete API helps you discover the exact field values the indexed Company Search API expects. Use it before you build filters for industries, geographies, company types, funding stages, and more.

Every request goes to the same endpoint:

```
POST https://api.crustdata.com/company/search/autocomplete
```

<Note>
  Replace `YOUR_API_KEY` in each example with your actual API key. All
  requests require the `x-api-version: 2025-11-01` header.
</Note>

<Callout icon="gift" color="#16a34a">
  <strong>Pricing:</strong> <code>Free</code>.
</Callout>

***

## When to use autocomplete

Use this endpoint when you want to:

* Build filter dropdowns or typeahead inputs in your product.
* Validate the exact values a Company Search filter expects.
* Explore the dataset vocabulary for a field before writing search queries.

***

## Your first autocomplete request: discover industry values

Start with the field you want to query and a partial search string. Here, `tech` returns matching values from `basic_info.industries`.

<CodeGroup>
  ```bash Request theme={"theme":"vitesse-black"}
  curl --request POST \
  	--url https://api.crustdata.com/company/search/autocomplete \
  	--header 'authorization: Bearer YOUR_API_KEY' \
  	--header 'content-type: application/json' \
  	--header 'x-api-version: 2025-11-01' \
  	--data '{
  		"field": "basic_info.industries",
  		"query": "tech",
  		"limit": 5
  	}'
  ```

  ```json Response theme={"theme":"vitesse-black"}
  {
      "suggestions": [
          { "value": "Technology, Information and Media" },
          { "value": "Technology, Information and Internet" },
          { "value": "Information Technology & Services" },
          { "value": "Biotechnology Research" },
          { "value": "Technical and Vocational Training" }
      ]
  }
  ```
</CodeGroup>

### Understanding the response

Autocomplete returns an object with one key:

* **`suggestions`** — an array of matching values, sorted by relevance. Each suggestion contains:
  * **`value`** — the exact field value to reuse in a Company Search filter.

Use the returned `value` exactly as-is in your next search request. This avoids empty results caused by typos, casing differences, or unsupported variants.

When `query` is non-empty, suggestions are ranked by match relevance. When `query` is an empty string, suggestions are ranked by frequency.

### Request fields

| Field     | Type    | Required | Description                                                                                                                                  |
| --------- | ------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `field`   | string  | Yes      | Searchable company field to autocomplete, such as `basic_info.industries`, `taxonomy.professional_network_industry`, or `locations.country`. |
| `query`   | string  | Yes      | Partial text to match. Use `""` to get the most common values.                                                                               |
| `limit`   | integer | No       | Maximum suggestions to return. Default: `20`. Max: `100`.                                                                                    |
| `filters` | object  | No       | Optional condition or nested `and`/`or` group to narrow the suggestion pool.                                                                 |

***

## Autocomplete company names

Use `basic_info.name` to surface company names matching a partial string.

<CodeGroup>
  ```bash Request theme={"theme":"vitesse-black"}
  curl --request POST \
  	--url https://api.crustdata.com/company/search/autocomplete \
  	--header 'authorization: Bearer YOUR_API_KEY' \
  	--header 'content-type: application/json' \
  	--header 'x-api-version: 2025-11-01' \
  	--data '{
  		"field": "basic_info.name",
  		"query": "hub",
  		"limit": 5
  	}'
  ```

  ```json Response theme={"theme":"vitesse-black"}
  {
      "suggestions": [
          { "value": "Hubble (hubblenow.com)" },
          { "value": "HUB2i | Hub Business Innovation" },
          { "value": "Hubba Hubba" },
          { "value": "Hubba Hubba Antiques" },
          { "value": "Hubba Hubba Revue" }
      ]
  }
  ```
</CodeGroup>

***

## Get the most common values for a field

Use an empty string for `query` when you want the most frequent values instead of a text match. This is useful when you are exploring a field for the first time.

<CodeGroup>
  ```bash Request theme={"theme":"vitesse-black"}
  curl --request POST \
  	--url https://api.crustdata.com/company/search/autocomplete \
  	--header 'authorization: Bearer YOUR_API_KEY' \
  	--header 'content-type: application/json' \
  	--header 'x-api-version: 2025-11-01' \
  	--data '{
  		"field": "locations.country",
  		"query": "",
  		"limit": 10
  	}'
  ```

  ```json Response theme={"theme":"vitesse-black"}
  {
      "suggestions": [
          { "value": "USA" },
          { "value": "" },
          { "value": "GBR" },
          { "value": "IND" },
          { "value": "FRA" },
          { "value": "BRA" },
          { "value": "DEU" },
          { "value": "ESP" },
          { "value": "CHN" },
          { "value": "CAN" }
      ]
  }
  ```
</CodeGroup>

Suggestions are ranked by frequency, so you can quickly see the most common values in the dataset.

***

## Narrow suggestions with filters

Autocomplete can scope results to a subset of companies. The `filters` field accepts either:

* a single condition with `field`, `type`, and `value`
* a logical group with `op` and `conditions`

This example returns industry suggestions only for US-based companies.

<CodeGroup>
  ```bash Request theme={"theme":"vitesse-black"}
  curl --request POST \
  	--url https://api.crustdata.com/company/search/autocomplete \
  	--header 'authorization: Bearer YOUR_API_KEY' \
  	--header 'content-type: application/json' \
  	--header 'x-api-version: 2025-11-01' \
  	--data '{
  		"field": "basic_info.industries",
  		"query": "",
  		"limit": 5,
  		"filters": {
  			"field": "locations.country",
  			"type": "=",
  			"value": "USA"
  		}
  	}'
  ```

  ```json Response theme={"theme":"vitesse-black"}
  {
      "suggestions": [
          { "value": "Professional Services" },
          { "value": "" },
          { "value": "Manufacturing" },
          { "value": "Technology, Information and Media" },
          { "value": "Hospitals and Health Care" }
      ]
  }
  ```
</CodeGroup>

<Tip>
  Use indexed values in `filters`. For example, `locations.country` uses
  ISO-3 codes such as `USA`, `GBR`, and `CAN`.
</Tip>

You can also use nested `and`/`or` groups. Filter values can be strings, numbers, or booleans, and array values can contain strings or numbers — pass numeric values as numbers rather than strings where the underlying field is numeric.

```bash theme={"theme":"vitesse-black"}
curl --request POST \
  --url https://api.crustdata.com/company/search/autocomplete \
  --header 'authorization: Bearer YOUR_API_KEY' \
  --header 'content-type: application/json' \
  --header 'x-api-version: 2025-11-01' \
  --data '{
    "field": "taxonomy.professional_network_industry",
    "query": "",
    "limit": 5,
    "filters": {
      "op": "and",
      "conditions": [
        { "field": "locations.country", "type": "=", "value": "USA" },
        { "field": "headcount.latest_count", "type": ">", "value": 100 }
      ]
    }
  }'
```

### Supported filter operators

`=`, `!=`, `<`, `=<`, `>`, `=>`, `in`, `not_in`, `contains`.

### Common fields to autocomplete

| Field                                    | Why you would use it                                                       |
| ---------------------------------------- | -------------------------------------------------------------------------- |
| `basic_info.industries`                  | Find exact industry labels before building industry filters.               |
| `basic_info.name`                        | Surface company names matching a partial string.                           |
| `taxonomy.professional_network_industry` | Match primary industry values used in company search.                      |
| `locations.country`                      | Discover country values used by the indexed dataset.                       |
| `basic_info.company_type`                | Explore company type labels used in the dataset.                           |
| `funding.last_round_type`                | Find valid funding stage labels before filtering by recent financing data. |
| `headcount.latest_count`                 | Explore employee-count buckets used by autocomplete filters.               |
| `followers.latest_count`                 | Explore follower-count buckets used by autocomplete filters.               |

For the full set of supported fields, see the `field` parameter on the [API reference](/openapi-specs/2025-11-01/introduction).

***

## Use autocomplete with Company Search

A common workflow looks like this:

1. Call Autocomplete with a partial query.
2. Copy the exact `value` from the response.
3. Use that value in [Company Search](/company-docs/search).

For example, if autocomplete returns `Technology, Information and Media`, use that exact string in a search filter instead of guessing another variant.

***

## Common errors and edge cases

If no values match your query, the API returns an empty array:

```json theme={"theme":"vitesse-black"}
{
    "suggestions": []
}
```

If you send an unsupported field name, the API returns a `400` with the list of valid fields:

```json theme={"theme":"vitesse-black"}
{
    "error": {
        "type": "invalid_request",
        "message": "Field 'invalid_field' is not valid for autocomplete. Available fields are: basic_info.company_type, basic_info.employee_count_range, basic_info.industries, basic_info.markets, basic_info.name, basic_info.primary_domain, ...",
        "metadata": []
    }
}
```

If that happens, double-check the field path against the supported list and use a field that is available in the indexed Company Search schema.

***

## API reference summary

| Detail              | Value                                                             |
| ------------------- | ----------------------------------------------------------------- |
| **Endpoint**        | `POST /company/search/autocomplete`                               |
| **Auth**            | Bearer token + `x-api-version: 2025-11-01`                        |
| **Required params** | `field`, `query`                                                  |
| **Optional params** | `limit` (default: 20, max: 100), `filters`                        |
| **Response**        | `{ "suggestions": [{ "value": "..." }] }`                         |
| **Empty result**    | `200` with `"suggestions": []`                                    |
| **Errors**          | `400` (unsupported field), `401` (bad auth), `500` (server error) |

For pricing, see [Pricing](/general/pricing). For rate-limit guidance, see
[Rate limits](/general/rate-limits).

See the [full API reference](/openapi-specs/2025-11-01/introduction) for the complete OpenAPI schema.

***

## What to do next

* **[Company Search](/company-docs/search)** — use the discovered value in a structured company search.
* **[Company Enrich](/company-docs/enrichment)** — enrich a company after you find it.
* **[Company examples](/company-docs/examples)** — browse ready-to-copy request patterns.
> ## Documentation Index
> Fetch the complete documentation index at: https://docs.crustdata.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Company Examples

> End-to-end Company API workflow examples with requests, responses, extraction steps, and failure handling.

Use this page for complete, ready-to-copy workflow examples that chain multiple Company API calls together. Each workflow shows the request, the expected response, what to extract, and how to handle failures.

For individual endpoint examples, see:

* [Search examples](/company-docs/search#your-first-search-find-a-company-by-domain)
* [Autocomplete examples](/company-docs/autocomplete#your-first-autocomplete-request-discover-industry-values)
* [Enrich examples](/company-docs/enrichment#your-first-enrichment-look-up-a-company-by-domain)
* [Identify examples](/company-docs/identify#identify-by-domain)

***

## Workflow 1: Autocomplete → Search → Enrich

**Goal:** Find US-based software companies and get full profiles for the top matches.

**Why this workflow:** You do not know the exact industry value the Search API expects. Autocomplete discovers it, Search finds matching companies, and Enrich fills in the details.

### Step 1: Discover valid industry values

<CodeGroup>
  ```bash Request theme={"theme":"vitesse-black"}
  curl --request POST \
    --url https://api.crustdata.com/company/search/autocomplete \
    --header 'authorization: Bearer YOUR_API_KEY' \
    --header 'content-type: application/json' \
    --header 'x-api-version: 2025-11-01' \
    --data '{"field": "basic_info.industries", "query": "software", "limit": 3}'
  ```

  ```json Response theme={"theme":"vitesse-black"}
  {
      "suggestions": [
          { "value": "Software Development", "document_count": 1543210 },
          { "value": "Computer Software", "document_count": 234567 },
          { "value": "Software as a Service (SaaS)", "document_count": 98765 }
      ]
  }
  ```
</CodeGroup>

**Extract:** Take `suggestions[0].value` → `"Software Development"`. Use this exact string in your Search filter.

**If empty:** If `suggestions` is `[]`, your query did not match any indexed values. Try a broader term (e.g., `"tech"` instead of `"software engineering"`).

### Step 2: Search for matching companies

<CodeGroup>
  ```bash Request theme={"theme":"vitesse-black"}
  curl --request POST \
    --url https://api.crustdata.com/company/search \
    --header 'authorization: Bearer YOUR_API_KEY' \
    --header 'content-type: application/json' \
    --header 'x-api-version: 2025-11-01' \
    --data '{
      "filters": {
        "op": "and",
        "conditions": [
          {"field": "basic_info.industries", "type": "in", "value": ["Software Development"]},
          {"field": "locations.hq_country", "type": "=", "value": "USA"}
        ]
      },
      "sorts": [{"column": "headcount.total", "order": "desc"}],
      "limit": 3,
      "fields": ["crustdata_company_id", "basic_info.name", "basic_info.primary_domain", "headcount.total"]
    }'
  ```

  ```json Response theme={"theme":"vitesse-black"}
  {
      "companies": [
          {
              "crustdata_company_id": 12345,
              "basic_info": { "name": "Acme Corp", "primary_domain": "acme.com" },
              "headcount": { "total": 8500 }
          },
          {
              "crustdata_company_id": 67890,
              "basic_info": { "name": "Retool", "primary_domain": "retool.com" },
              "headcount": { "total": 450 }
          },
          {
              "crustdata_company_id": 628895,
              "basic_info": {
                  "name": "Serve Robotics",
                  "primary_domain": "serverobotics.com"
              },
              "headcount": { "total": 120 }
          }
      ],
      "next_cursor": "H4sIAJj5zGkC...",
      "total_count": 217318
  }
  ```
</CodeGroup>

**Extract:** Take `companies[].crustdata_company_id` values → `[12345, 67890, 628895]`. Pass these to Enrich.

**If empty:** If `companies` is `[]`, no companies matched your filters. Broaden your conditions or use [Autocomplete](/company-docs/autocomplete) to check that your filter values are valid.

**To get more results:** Pass `next_cursor` as `cursor` in the next request. Stop paginating when `next_cursor` is `null`.

### Step 3: Enrich the top matches

<CodeGroup>
  ```bash Request theme={"theme":"vitesse-black"}
  curl --request POST \
    --url https://api.crustdata.com/company/enrich \
    --header 'authorization: Bearer YOUR_API_KEY' \
    --header 'content-type: application/json' \
    --header 'x-api-version: 2025-11-01' \
    --data '{
      "crustdata_company_ids": [12345, 67890, 628895],
      "fields": ["basic_info", "headcount", "funding", "hiring"]
    }'
  ```

  ```json Response theme={"theme":"vitesse-black"}
  {
      "results": [
          {
              "matched_on": "12345",
              "match_type": "crustdata_company_id",
              "matches": [
                  {
                      "confidence_score": 1.0,
                      "company_data": {
                          "basic_info": {
                              "name": "Acme Corp",
                              "primary_domain": "acme.com",
                              "company_type": "Privately Held",
                              "year_founded": "2015-01-01",
                              "industries": ["Software Development"]
                          },
                          "headcount": { "total": 8500 },
                          "funding": {
                              "total_investment_usd": 250000000,
                              "last_round_type": "series_d"
                          },
                          "hiring": { "openings_count": 42 }
                      }
                  }
              ]
          }
      ]
  }
  ```
</CodeGroup>

**Extract:** Each item in `results` corresponds to one input ID. Access the profile via `results[i].matches[0].company_data`.

**If a match is empty:** If `matches` is `[]` for an identifier, that company was not found. The request still succeeds (`200 OK`) for the other identifiers.

***

## Workflow 2: Inbound domain → Identify → Search for similar companies

**Goal:** An inbound lead arrives from `retool.com`. Find similar companies for prospecting.

**Why this workflow:** [Identify](/company-docs/identify) resolves the domain to a company record, then Search finds similar companies based on the identified company's industry and size.

### Step 1: Identify the inbound company

<CodeGroup>
  ```bash Request theme={"theme":"vitesse-black"}
  curl --request POST \
    --url https://api.crustdata.com/company/identify \
    --header 'authorization: Bearer YOUR_API_KEY' \
    --header 'content-type: application/json' \
    --header 'x-api-version: 2025-11-01' \
    --data '{"domains": ["retool.com"]}'
  ```

  ```json Response theme={"theme":"vitesse-black"}
  {
      "results": [
          {
              "matched_on": "retool.com",
              "match_type": "domain",
              "matches": [
                  {
                      "confidence_score": 1.0,
                      "company_data": {
                          "crustdata_company_id": 633593,
                          "basic_info": {
                              "name": "Retool",
                              "primary_domain": "retool.com",
                              "employee_count_range": "201-500",
                              "industries": ["Software Development"]
                          }
                      }
                  }
              ]
          }
      ]
  }
  ```
</CodeGroup>

**Extract:** Take `results[0].matches[0].company_data.basic_info.industries[0]` → `"Software Development"` and `employee_count_range` → `"201-500"`.

### Step 2: Search for similar companies

<CodeGroup>
  ```bash Request theme={"theme":"vitesse-black"}
  curl --request POST \
    --url https://api.crustdata.com/company/search \
    --header 'authorization: Bearer YOUR_API_KEY' \
    --header 'content-type: application/json' \
    --header 'x-api-version: 2025-11-01' \
    --data '{
      "filters": {
        "op": "and",
        "conditions": [
          {"field": "basic_info.industries", "type": "in", "value": ["Software Development"]},
          {"field": "headcount.total", "type": ">", "value": 200},
          {"field": "headcount.total", "type": "<", "value": 1000}
        ]
      },
      "sorts": [{"column": "headcount.total", "order": "desc"}],
      "limit": 10,
      "fields": ["crustdata_company_id", "basic_info.name", "basic_info.primary_domain", "headcount.total"]
    }'
  ```

  ```json Response theme={"theme":"vitesse-black"}
  {
      "companies": [
          {
              "crustdata_company_id": 67890,
              "basic_info": { "name": "Retool", "primary_domain": "retool.com" },
              "headcount": { "total": 450 }
          },
          {
              "crustdata_company_id": 12345,
              "basic_info": { "name": "Notion", "primary_domain": "notion.so" },
              "headcount": { "total": 800 }
          }
      ],
      "next_cursor": "H4sIAM_5zGkC...",
      "total_count": 1543
  }
  ```
</CodeGroup>

**Extract:** Take `companies[].crustdata_company_id` values and pass them to [Enrich](/company-docs/enrichment) for full profiles of promising matches.

**If empty:** If `companies` is `[]`, broaden your filters (e.g., wider headcount range or more industries). Use [Autocomplete](/company-docs/autocomplete) to verify valid filter values.

***

## Error handling patterns

All Company API endpoints return structured errors. Here are the patterns to handle:

### Invalid request (400)

<CodeGroup>
  ```json Search — invalid field name theme={"theme":"vitesse-black"}
  {
      "error": {
          "type": "invalid_request",
          "message": "Unsupported columns in conditions: ['nonexistent_field']",
          "metadata": []
      }
  }
  ```

  ```json Enrich — missing identifier theme={"theme":"vitesse-black"}
  {
      "error": {
          "type": "invalid_request",
          "message": "Exactly one identifier must be provided: crustdata_company_ids, names, domains, or professional_network_profile_urls",
          "metadata": []
      }
  }
  ```

  ```json Autocomplete — invalid field theme={"theme":"vitesse-black"}
  {
      "error": {
          "type": "invalid_request",
          "message": "Field 'invalid_field' is not valid for autocomplete. Available fields are: basic_info.company_type, basic_info.industries, ...",
          "metadata": []
      }
  }
  ```
</CodeGroup>

**Action:** Fix the request. Do not retry `400` errors — they indicate a malformed request.

### Invalid API key (401)

```json theme={"theme":"vitesse-black"}
{ "message": "Invalid API key in request" }
```

**Action:** Check your API key. The `401` response uses a different shape than other errors.

### No match (Enrich/Identify)

When no company matches, `matches` is empty but the request succeeds:

```json theme={"theme":"vitesse-black"}
{
    "results": [
        {
            "matched_on": "nonexistent-domain.com",
            "match_type": "domain",
            "matches": []
        }
    ]
}
```

**Action:** Try a different identifier type or check for typos. Do not retry — the company may not be in the database.

<Note>
  The OpenAPI spec also defines `404` for Enrich and Identify. Current
  platform behavior returns `200` with empty `matches`. Handle both.
</Note>

### Partial batch failure (Enrich)

When enriching multiple identifiers, some may match and others may not. The request succeeds with `200`:

```json theme={"theme":"vitesse-black"}
{
    "results": [
        {
            "matched_on": "hubspot.com",
            "match_type": "domain",
            "matches": [
                {
                    "confidence_score": 1.0,
                    "company_data": {
                        "basic_info": {
                            "name": "HubSpot",
                            "primary_domain": "hubspot.com"
                        }
                    }
                }
            ]
        },
        {
            "matched_on": "nonexistent-domain.com",
            "match_type": "domain",
            "matches": []
        }
    ]
}
```

**Action:** Iterate over `results`. For each entry, check `matches.length > 0` before accessing `company_data`. Log or retry unmatched identifiers separately.

### Server error (500)

```json theme={"theme":"vitesse-black"}
{
    "error": {
        "type": "internal_error",
        "message": "An unexpected error occurred",
        "metadata": []
    }
}
```

**Action:** Retry with exponential backoff: wait 1s, then 2s, then 4s. Stop after 3 retries. If the error persists, contact support.

### Retry decision table

| Status     | Retry? | Action                           |
| ---------- | ------ | -------------------------------- |
| `400`      | No     | Fix the request                  |
| `401`      | No     | Check API key                    |
| `403`      | No     | Check permissions or credits     |
| `404`      | No     | Try different identifier         |
| `500`      | Yes    | Exponential backoff (1s, 2s, 4s) |
| Rate limit | Yes    | Wait 60 seconds, then retry      |

***

## Workflow 3: Paginated search with stable sorting

**Goal:** Page through all mid-size US software companies using cursor-based pagination.

**Why this workflow:** Large result sets require pagination. Always include `sorts` for stable ordering across pages.

<CodeGroup>
  ```bash First page theme={"theme":"vitesse-black"}
  curl --request POST \
    --url https://api.crustdata.com/company/search \
    --header 'authorization: Bearer YOUR_API_KEY' \
    --header 'content-type: application/json' \
    --header 'x-api-version: 2025-11-01' \
    --data '{
      "filters": {
        "op": "and",
        "conditions": [
          {"field": "basic_info.industries", "type": "in", "value": ["Software Development"]},
          {"field": "headcount.total", "type": ">", "value": 200},
          {"field": "headcount.total", "type": "<", "value": 1000},
          {"field": "locations.hq_country", "type": "=", "value": "USA"}
        ]
      },
      "sorts": [{"column": "crustdata_company_id", "order": "asc"}],
      "limit": 100,
      "fields": ["crustdata_company_id", "basic_info.name", "basic_info.primary_domain"]
    }'
  ```

  ```bash Next page (use next_cursor) theme={"theme":"vitesse-black"}
  curl --request POST \
    --url https://api.crustdata.com/company/search \
    --header 'authorization: Bearer YOUR_API_KEY' \
    --header 'content-type: application/json' \
    --header 'x-api-version: 2025-11-01' \
    --data '{
      "filters": {
        "op": "and",
        "conditions": [
          {"field": "basic_info.industries", "type": "in", "value": ["Software Development"]},
          {"field": "headcount.total", "type": ">", "value": 200},
          {"field": "headcount.total", "type": "<", "value": 1000},
          {"field": "locations.hq_country", "type": "=", "value": "USA"}
        ]
      },
      "sorts": [{"column": "crustdata_company_id", "order": "asc"}],
      "limit": 100,
      "cursor": "H4sIAJj5zGkC_xXMMQ7CMAxA0...",
      "fields": ["crustdata_company_id", "basic_info.name", "basic_info.primary_domain"]
    }'
  ```
</CodeGroup>

**Pagination loop logic:**

1. Send the first request without `cursor`.
2. Extract `next_cursor` from the response.
3. If `next_cursor` is `null`, stop — you have all results.
4. Otherwise, pass `next_cursor` as `cursor` in the next request. Keep `filters`, `sorts`, `limit`, and `fields` the same.
5. Repeat until `next_cursor` is `null`.

<Warning>
  Always include `sorts` when paginating. Without `sorts`, result ordering is
  not guaranteed and pages may contain duplicates or gaps.
</Warning>
