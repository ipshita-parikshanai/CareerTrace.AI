> ## Documentation Index
> Fetch the complete documentation index at: https://docs.crustdata.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Person APIs

> Find, enrich, and analyze people with the Crustdata Person APIs.

The Person APIs help you answer practical questions about people: Who are the decision-makers at a target company? What does this person's professional background look like? Can I find people by name, title, location, or employer? Can I enrich a person from a profile URL or business email?

Start with the indexed endpoints for most workflows, then use the live endpoints when you need fresh results from the web.

| API                                       | What it does                                       | Best for                                            |
| ----------------------------------------- | -------------------------------------------------- | --------------------------------------------------- |
| [Search](/person-docs/search)             | Find people matching structured filters            | Prospecting, talent sourcing, market mapping        |
| [Enrich](/person-docs/enrichment)         | Get a detailed profile from a profile URL or email | Outreach prep, due diligence, profile building      |
| [Autocomplete](/person-docs/autocomplete) | Discover valid field values for search filters     | Building filter dropdowns, validating filter inputs |

### Enterprise live endpoints

| API                                          | What it does                              | Access      |
| -------------------------------------------- | ----------------------------------------- | ----------- |
| [Live Search 🔒](https://crustdata.com/demo) | Search people in real time from the web   | Book a demo |
| [Live Enrich 🔒](https://crustdata.com/demo) | Fetch a fresh person profile from the web | Book a demo |

## At a glance

|                     | Search                                               | Autocomplete                  | Enrich                                 |
| ------------------- | ---------------------------------------------------- | ----------------------------- | -------------------------------------- |
| **Endpoint**        | `/person/search`                                     | `/person/search/autocomplete` | `/person/enrich`                       |
| **Data source**     | Crustdata indexed                                    | Crustdata indexed             | Crustdata indexed                      |
| **Purpose**         | Find people by filters                               | Discover valid filter values  | Get full person profile                |
| **Filter syntax**   | `{ "field": "dotpath", "type": "op", "value": ... }` | Optional `filters` param      | N/A                                    |
| **Pagination**      | Cursor-based                                         | —                             | —                                      |
| **Field selection** | `fields` = dot-paths                                 | —                             | `fields` = dot-paths or section groups |
| **Error codes**     | `400`, `401`, `403`, `500`                           | `400`, `401`, `500`           | `400`, `401`, `403`, `404`, `500`      |

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

## Quickstart: enrich a person from a profile URL

The fastest way to get started is to enrich a person from their profile URL. This single request returns the full person profile from the Crustdata cache.

<CodeGroup>
  ```bash Request theme={"theme":"vitesse-black"}
  curl --request POST \
    --url https://api.crustdata.com/person/enrich \
    --header 'authorization: Bearer YOUR_API_KEY' \
    --header 'content-type: application/json' \
    --header 'x-api-version: 2025-11-01' \
    --data '{
      "professional_network_profile_urls": [
        "https://www.linkedin.com/in/abhilashchowdhary"
      ]
    }'
  ```

  ```json Response theme={"theme":"vitesse-black"}
  [
      {
          "matched_on": "https://www.linkedin.com/in/abhilashchowdhary",
          "match_type": "professional_network_profile_url",
          "matches": [
              {
                  "confidence_score": 1.0,
                  "person_data": {
                      "basic_profile": {
                          "name": "Abhilash Chowdhary",
                          "headline": "Co-founder at Crustdata (YC F24)",
                          "current_title": "Co-Founder & CEO",
                          "location": {
                              "raw": "San Francisco, California, United States"
                          }
                      }
                  }
              }
          ]
      }
  ]
  ```
</CodeGroup>

<Note>
  Response trimmed for clarity. The full response can include employment
  history, education, skills, contact data, and developer platform profiles.
</Note>

The response is an array — one entry per identifier you submitted:

* **`matched_on`** — the input you sent (for example, `https://www.linkedin.com/in/abhilashchowdhary`).
* **`match_type`** — which identifier type was used (`professional_network_profile_url` or `business_email`).
* **`confidence_score`** — how confident the match is (`1.0` = exact match).
* **`person_data`** — the full person profile, including `basic_profile`, `experience`, `education`, `skills`, `contact`, `social_handles`, and more.

***

## Which API should you start with?

| If you want to...                                           | Start with                                   |
| ----------------------------------------------------------- | -------------------------------------------- |
| Find people by name, title, company, or location            | [Search](/person-docs/search)                |
| Get full profile details for a known profile URL            | [Enrich](/person-docs/enrichment)            |
| Reverse-lookup a person from a business email               | [Enrich](/person-docs/enrichment)            |
| Discover valid filter values before building search queries | [Autocomplete](/person-docs/autocomplete)    |
| Build a list of decision-makers at target companies         | [Search](/person-docs/search)                |
| Search people in real time from the web                     | [Live Search 🔒](https://crustdata.com/demo) |
| Fetch fresh profile data from the web                       | [Live Enrich 🔒](https://crustdata.com/demo) |

## Common workflows

1. **Discovery** — Start with [Autocomplete](/person-docs/autocomplete) to find valid filter values (e.g., title variations), then [Search](/person-docs/search) to build your list, then [Enrich](/person-docs/enrichment) the top matches for full profiles.
2. **Data cleanup** — Use [Enrich](/person-docs/enrichment) with `business_emails` to resolve person profiles and fill in missing professional context from CRM imports.
3. **Lead routing** — [Enrich](/person-docs/enrichment) incoming profile URLs to get a stable person profile, then [Search](/person-docs/search) for similar people at the same company or with the same title.

***

## Error handling

All Person API endpoints return structured errors. The exact status codes vary by endpoint:

| Status | Meaning                                                        | Applies to     |
| ------ | -------------------------------------------------------------- | -------------- |
| `400`  | Invalid request (bad field, wrong operator, malformed filters) | All endpoints  |
| `401`  | Invalid or missing API key                                     | All endpoints  |
| `403`  | Permission denied or insufficient credits                      | Search, Enrich |
| `404`  | No data found (per spec)                                       | Enrich         |
| `500`  | Internal server error                                          | All endpoints  |

Error response format:

```json theme={"theme":"vitesse-black"}
{
    "error": {
        "type": "invalid_request",
        "message": "Unsupported filter field: 'current_title'. Supported fields: ['basic_profile.name', 'basic_profile.headline', ...]",
        "metadata": []
    }
}
```

For `401`, the format is simpler: `{"message": "Invalid API key in request"}`.

### No-match behavior

| Endpoint     | No matches found                   | Action                                     |
| ------------ | ---------------------------------- | ------------------------------------------ |
| Search       | `200` with empty `profiles: []`    | Broaden filters or check with Autocomplete |
| Enrich       | `200` with empty `matches: []`     | Try a different identifier type            |
| Autocomplete | `200` with empty `suggestions: []` | Try a broader query                        |

<Note>
  The OpenAPI spec defines `404` for Enrich, but current behavior typically
  returns `200` with empty `matches`. Handle both.
</Note>

### Retry guidance

| Status | Retry? | Action                           |
| ------ | ------ | -------------------------------- |
| `400`  | No     | Fix the request                  |
| `401`  | No     | Check API key                    |
| `403`  | No     | Check permissions/credits        |
| `404`  | No     | Try different identifier         |
| `500`  | Yes    | Exponential backoff (1s, 2s, 4s) |

***

## Terminology reference

These are the most common terms used across the Person APIs:

| You say         | API request field                                                   | Used in              |
| --------------- | ------------------------------------------------------------------- | -------------------- |
| Profile URL     | `professional_network_profile_urls`                                 | Enrich               |
| Business email  | `business_emails`                                                   | Enrich               |
| Person name     | `basic_profile.name` (filter field)                                 | Search, Autocomplete |
| Job title       | `experience.employment_details.current.title` (filter field)        | Search, Autocomplete |
| Current company | `experience.employment_details.current.company_name` (filter field) | Search, Autocomplete |
| Headline        | `basic_profile.headline` (filter field)                             | Search, Autocomplete |
| Location        | `basic_profile.location` (filter field)                             | Search               |

<Note>
  Search uses dot-path field names like
  `experience.employment_details.current.title`. Use Autocomplete to discover
  exact values for indexed Search filters before you build queries.
</Note>

***

## Common footguns

| Mistake                                           | Fix                                                                                         |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Using `column` in Search filters                  | The correct key is `field` (e.g., `"field": "basic_profile.name"`).                         |
| Mixing identifier types in Enrich                 | Send one type per request: either `professional_network_profile_urls` or `business_emails`. |
| Using `current_title` as a filter field in Search | Use the full dot-path: `experience.employment_details.current.title`.                       |
| Omitting `fields` in Search                       | Returns all fields per person — very large payloads. Always specify `fields` in production. |
| Expecting `results` wrapper in Enrich response    | Enrich returns a top-level array, not `{ "results": [...] }`.                               |

***

## Next steps

* [Person Search](/person-docs/search) — find people by name, title, company, location, and more with advanced filters.
* [Person Autocomplete](/person-docs/autocomplete) — discover valid filter values before building queries.
* [Person Enrich](/person-docs/enrichment) — get detailed profiles from profile URLs or business emails, with batch support.
* [Live Search 🔒](https://crustdata.com/demo) — search people in real time from the web.
* [Live Enrich 🔒](https://crustdata.com/demo) — fetch a fresh person profile from the web.
* [Person Examples](/person-docs/examples) — ready-to-copy workflow patterns.
> ## Documentation Index
> Fetch the complete documentation index at: https://docs.crustdata.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Person APIs

> Find, enrich, and analyze people with the Crustdata Person APIs.

The Person APIs help you answer practical questions about people: Who are the decision-makers at a target company? What does this person's professional background look like? Can I find people by name, title, location, or employer? Can I enrich a person from a profile URL or business email?

Start with the indexed endpoints for most workflows, then use the live endpoints when you need fresh results from the web.

| API                                       | What it does                                       | Best for                                            |
| ----------------------------------------- | -------------------------------------------------- | --------------------------------------------------- |
| [Search](/person-docs/search)             | Find people matching structured filters            | Prospecting, talent sourcing, market mapping        |
| [Enrich](/person-docs/enrichment)         | Get a detailed profile from a profile URL or email | Outreach prep, due diligence, profile building      |
| [Autocomplete](/person-docs/autocomplete) | Discover valid field values for search filters     | Building filter dropdowns, validating filter inputs |

### Enterprise live endpoints

| API                                          | What it does                              | Access      |
| -------------------------------------------- | ----------------------------------------- | ----------- |
| [Live Search 🔒](https://crustdata.com/demo) | Search people in real time from the web   | Book a demo |
| [Live Enrich 🔒](https://crustdata.com/demo) | Fetch a fresh person profile from the web | Book a demo |

## At a glance

|                     | Search                                               | Autocomplete                  | Enrich                                 |
| ------------------- | ---------------------------------------------------- | ----------------------------- | -------------------------------------- |
| **Endpoint**        | `/person/search`                                     | `/person/search/autocomplete` | `/person/enrich`                       |
| **Data source**     | Crustdata indexed                                    | Crustdata indexed             | Crustdata indexed                      |
| **Purpose**         | Find people by filters                               | Discover valid filter values  | Get full person profile                |
| **Filter syntax**   | `{ "field": "dotpath", "type": "op", "value": ... }` | Optional `filters` param      | N/A                                    |
| **Pagination**      | Cursor-based                                         | —                             | —                                      |
| **Field selection** | `fields` = dot-paths                                 | —                             | `fields` = dot-paths or section groups |
| **Error codes**     | `400`, `401`, `403`, `500`                           | `400`, `401`, `500`           | `400`, `401`, `403`, `404`, `500`      |

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

## Quickstart: enrich a person from a profile URL

The fastest way to get started is to enrich a person from their profile URL. This single request returns the full person profile from the Crustdata cache.

<CodeGroup>
  ```bash Request theme={"theme":"vitesse-black"}
  curl --request POST \
    --url https://api.crustdata.com/person/enrich \
    --header 'authorization: Bearer YOUR_API_KEY' \
    --header 'content-type: application/json' \
    --header 'x-api-version: 2025-11-01' \
    --data '{
      "professional_network_profile_urls": [
        "https://www.linkedin.com/in/abhilashchowdhary"
      ]
    }'
  ```

  ```json Response theme={"theme":"vitesse-black"}
  [
      {
          "matched_on": "https://www.linkedin.com/in/abhilashchowdhary",
          "match_type": "professional_network_profile_url",
          "matches": [
              {
                  "confidence_score": 1.0,
                  "person_data": {
                      "basic_profile": {
                          "name": "Abhilash Chowdhary",
                          "headline": "Co-founder at Crustdata (YC F24)",
                          "current_title": "Co-Founder & CEO",
                          "location": {
                              "raw": "San Francisco, California, United States"
                          }
                      }
                  }
              }
          ]
      }
  ]
  ```
</CodeGroup>

<Note>
  Response trimmed for clarity. The full response can include employment
  history, education, skills, contact data, and developer platform profiles.
</Note>

The response is an array — one entry per identifier you submitted:

* **`matched_on`** — the input you sent (for example, `https://www.linkedin.com/in/abhilashchowdhary`).
* **`match_type`** — which identifier type was used (`professional_network_profile_url` or `business_email`).
* **`confidence_score`** — how confident the match is (`1.0` = exact match).
* **`person_data`** — the full person profile, including `basic_profile`, `experience`, `education`, `skills`, `contact`, `social_handles`, and more.

***

## Which API should you start with?

| If you want to...                                           | Start with                                   |
| ----------------------------------------------------------- | -------------------------------------------- |
| Find people by name, title, company, or location            | [Search](/person-docs/search)                |
| Get full profile details for a known profile URL            | [Enrich](/person-docs/enrichment)            |
| Reverse-lookup a person from a business email               | [Enrich](/person-docs/enrichment)            |
| Discover valid filter values before building search queries | [Autocomplete](/person-docs/autocomplete)    |
| Build a list of decision-makers at target companies         | [Search](/person-docs/search)                |
| Search people in real time from the web                     | [Live Search 🔒](https://crustdata.com/demo) |
| Fetch fresh profile data from the web                       | [Live Enrich 🔒](https://crustdata.com/demo) |

## Common workflows

1. **Discovery** — Start with [Autocomplete](/person-docs/autocomplete) to find valid filter values (e.g., title variations), then [Search](/person-docs/search) to build your list, then [Enrich](/person-docs/enrichment) the top matches for full profiles.
2. **Data cleanup** — Use [Enrich](/person-docs/enrichment) with `business_emails` to resolve person profiles and fill in missing professional context from CRM imports.
3. **Lead routing** — [Enrich](/person-docs/enrichment) incoming profile URLs to get a stable person profile, then [Search](/person-docs/search) for similar people at the same company or with the same title.

***

## Error handling

All Person API endpoints return structured errors. The exact status codes vary by endpoint:

| Status | Meaning                                                        | Applies to     |
| ------ | -------------------------------------------------------------- | -------------- |
| `400`  | Invalid request (bad field, wrong operator, malformed filters) | All endpoints  |
| `401`  | Invalid or missing API key                                     | All endpoints  |
| `403`  | Permission denied or insufficient credits                      | Search, Enrich |
| `404`  | No data found (per spec)                                       | Enrich         |
| `500`  | Internal server error                                          | All endpoints  |

Error response format:

```json theme={"theme":"vitesse-black"}
{
    "error": {
        "type": "invalid_request",
        "message": "Unsupported filter field: 'current_title'. Supported fields: ['basic_profile.name', 'basic_profile.headline', ...]",
        "metadata": []
    }
}
```

For `401`, the format is simpler: `{"message": "Invalid API key in request"}`.

### No-match behavior

| Endpoint     | No matches found                   | Action                                     |
| ------------ | ---------------------------------- | ------------------------------------------ |
| Search       | `200` with empty `profiles: []`    | Broaden filters or check with Autocomplete |
| Enrich       | `200` with empty `matches: []`     | Try a different identifier type            |
| Autocomplete | `200` with empty `suggestions: []` | Try a broader query                        |

<Note>
  The OpenAPI spec defines `404` for Enrich, but current behavior typically
  returns `200` with empty `matches`. Handle both.
</Note>

### Retry guidance

| Status | Retry? | Action                           |
| ------ | ------ | -------------------------------- |
| `400`  | No     | Fix the request                  |
| `401`  | No     | Check API key                    |
| `403`  | No     | Check permissions/credits        |
| `404`  | No     | Try different identifier         |
| `500`  | Yes    | Exponential backoff (1s, 2s, 4s) |

***

## Terminology reference

These are the most common terms used across the Person APIs:

| You say         | API request field                                                   | Used in              |
| --------------- | ------------------------------------------------------------------- | -------------------- |
| Profile URL     | `professional_network_profile_urls`                                 | Enrich               |
| Business email  | `business_emails`                                                   | Enrich               |
| Person name     | `basic_profile.name` (filter field)                                 | Search, Autocomplete |
| Job title       | `experience.employment_details.current.title` (filter field)        | Search, Autocomplete |
| Current company | `experience.employment_details.current.company_name` (filter field) | Search, Autocomplete |
| Headline        | `basic_profile.headline` (filter field)                             | Search, Autocomplete |
| Location        | `basic_profile.location` (filter field)                             | Search               |

<Note>
  Search uses dot-path field names like
  `experience.employment_details.current.title`. Use Autocomplete to discover
  exact values for indexed Search filters before you build queries.
</Note>

***

## Common footguns

| Mistake                                           | Fix                                                                                         |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Using `column` in Search filters                  | The correct key is `field` (e.g., `"field": "basic_profile.name"`).                         |
| Mixing identifier types in Enrich                 | Send one type per request: either `professional_network_profile_urls` or `business_emails`. |
| Using `current_title` as a filter field in Search | Use the full dot-path: `experience.employment_details.current.title`.                       |
| Omitting `fields` in Search                       | Returns all fields per person — very large payloads. Always specify `fields` in production. |
| Expecting `results` wrapper in Enrich response    | Enrich returns a top-level array, not `{ "results": [...] }`.                               |

***

## Next steps

* [Person Search](/person-docs/search) — find people by name, title, company, location, and more with advanced filters.
* [Person Autocomplete](/person-docs/autocomplete) — discover valid filter values before building queries.
* [Person Enrich](/person-docs/enrichment) — get detailed profiles from profile URLs or business emails, with batch support.
* [Live Search 🔒](https://crustdata.com/demo) — search people in real time from the web.
* [Live Enrich 🔒](https://crustdata.com/demo) — fetch a fresh person profile from the web.
* [Person Examples](/person-docs/examples) — ready-to-copy workflow patterns.
> ## Documentation Index
> Fetch the complete documentation index at: https://docs.crustdata.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Person Search

> Learn how to search for people using the Person Search API, from simple name lookups to advanced multi-filter queries.

The Person Search API lets you find professionals by name, title, company, location, and more. This page walks you through the API step by step, starting with the simplest possible request and building up to advanced queries.

Every request goes to the same endpoint:

```
POST https://api.crustdata.com/person/search
```

<Note>
  Replace `YOUR_API_KEY` in each example with your actual API key. All
  requests require the `x-api-version: 2025-11-01` header.
</Note>

<Callout icon="coins" color="#5345e4">
  <strong>Pricing:</strong> <code>0.03 credits per result returned</code>.
</Callout>

***

## Your first search: find a person by name

The simplest search finds a person by their exact name. You pass a single filter with the `=` operator.

<CodeGroup>
  ```bash Request theme={"theme":"vitesse-black"}
  curl --request POST \
    --url https://api.crustdata.com/person/search \
    --header 'authorization: Bearer YOUR_API_KEY' \
    --header 'content-type: application/json' \
    --header 'x-api-version: 2025-11-01' \
    --data '{
      "filters": {
        "field": "basic_profile.name",
        "type": "=",
        "value": "Abhilash Chowdhary"
      },
      "limit": 1
    }'
  ```

  ```json Response theme={"theme":"vitesse-black"}
  {
      "profiles": [
          {
              "crustdata_person_id": 1068035,
              "basic_profile": {
                  "name": "Abhilash Chowdhary",
                  "headline": "Co-founder at Crustdata (YC F24) | Real-time B2B data for AI agents",
                  "location": {
                      "city": "San Francisco",
                      "state": "California",
                      "country": "United States",
                      "full_location": "San Francisco, California, United States"
                  }
              },
              "social_handles": {
                  "professional_network_identifier": {
                      "profile_url": "https://www.linkedin.com/in/abhilashchowdhary"
                  }
              },
              "experience": {
                  "employment_details": {
                      "current": [
                          {
                              "company_name": "Crustdata (YC F24)",
                              "title": "Co-Founder & CEO"
                          }
                      ],
                      "past": [
                          {
                              "company_name": "Serve Robotics",
                              "title": "Engineering Manager, Motion Planning and Controls"
                          },
                          {
                              "company_name": "Postmates by Uber",
                              "title": "Robotics Lead, Motion Planning and Controls"
                          }
                      ]
                  }
              },
              "education": {
                  "schools": [
                      {
                          "school": "Virginia Tech",
                          "degree": "Master’s Degree"
                      },
                      {
                          "school": "IIIT Hyderabad",
                          "degree": "Bachelor of Technology (B.Tech.)"
                      },
                      {
                          "school": "Y Combinator",
                          "degree": "F24 Batch"
                      }
                  ]
              }
          }
      ],
      "next_cursor": "H4sIAG6-oWkC_xXMMQrDMAxA0a...",
      "total_count": 8
  }
  ```
</CodeGroup>

<Note>Response trimmed for clarity.</Note>

### Understanding the response

Every search response has three fields:

* **`profiles`** — an array of matching people. Each profile contains identity fields, education, profile handles, and contact availability flags for the fields you requested.
* **`total_count`** — how many people match your filters across the full database. Here, 8 people named "Abhilash Chowdhary" exist.
* **`next_cursor`** — a pagination token. Pass it in the next request to get the next page of results. `null` means there are no more pages.

***

## Combine filters with `and`

Real searches need more than one criterion. Wrap multiple conditions inside an `op: "and"` group to require all of them.

This search finds Co-Founders located in San Francisco. The `(.)` operator does a regex/contains match instead of an exact match.

<CodeGroup>
  ```bash Request theme={"theme":"vitesse-black"}
  curl --request POST \
    --url https://api.crustdata.com/person/search \
    --header 'authorization: Bearer YOUR_API_KEY' \
    --header 'content-type: application/json' \
    --header 'x-api-version: 2025-11-01' \
    --data '{
      "filters": {
        "op": "and",
        "conditions": [
          {
            "field": "experience.employment_details.title",
            "type": "(.)",
            "value": "Co-Founder"
          },
          {
            "field": "basic_profile.location.full_location",
            "type": "(.)",
            "value": "San Francisco"
          }
        ]
      },
      "limit": 2
    }'
  ```

  ```json Response theme={"theme":"vitesse-black"}
  {
      "profiles": [
          {
              "crustdata_person_id": 1279,
              "basic_profile": {
                  "name": "Dipesh Garg",
                  "headline": "CEO at Truelancer | 2 Million+ Professionals",
                  "location": {
                      "full_location": "San Francisco, California, United States"
                  }
              },
              "experience": {
                  "employment_details": {
                      "current": [
                          {
                              "company_name": "Truelancer.com",
                              "title": "CEO & Founder"
                          }
                      ],
                      "past": [
                          {
                              "company_name": "MyRemoteTeam Inc",
                              "title": "Founder"
                          },
                          {
                              "company_name": "MyRemoteTeam Inc",
                              "title": "Lead Developer"
                          }
                      ]
                  }
              }
          },
          {
              "crustdata_person_id": 1356,
              "basic_profile": {
                  "name": "Mahesh Kumar",
                  "headline": "Founder and CEO at Tiger Analytics",
                  "location": {
                      "full_location": "San Francisco Bay Area"
                  }
              },
              "experience": {
                  "employment_details": {
                      "current": [
                          {
                              "company_name": "Tiger Analytics",
                              "title": "Founder and CEO"
                          }
                      ],
                      "past": [
                          {
                              "company_name": "University of Maryland College Park",
                              "title": "Assistant Professor"
                          },
                          { "company_name": "McKinsey & Company", "title": "" }
                      ]
                  }
              }
          }
      ],
      "next_cursor": "H4sIAHC-oWkC_xWMMQ7CMAwAv...",
      "total_count": 95577
  }
  ```
</CodeGroup>

<Note>Response trimmed for clarity.</Note>

The key difference from the first example: instead of a single `filters` object, you now have a group with `op: "and"` and a `conditions` array. Every condition must match for a profile to be included.

***

## Search by employer and title

This is the most common pattern for sales and recruiting: find people with a specific title at a specific company. This search finds VPs, Directors, and Heads of department at Retool.

<CodeGroup>
  ```bash Request theme={"theme":"vitesse-black"}
  curl --request POST \
    --url https://api.crustdata.com/person/search \
    --header 'authorization: Bearer YOUR_API_KEY' \
    --header 'content-type: application/json' \
    --header 'x-api-version: 2025-11-01' \
    --data '{
      "filters": {
        "op": "and",
        "conditions": [
          {
            "field": "experience.employment_details.company_name",
            "type": "in",
            "value": ["Retool"]
          },
          {
            "field": "experience.employment_details.title",
            "type": "(.)",
            "value": "VP|Director|Head of"
          }
        ]
      },
      "limit": 1
    }'
  ```

  ```json Response theme={"theme":"vitesse-black"}
  {
      "profiles": [
          {
              "crustdata_person_id": 97567,
              "basic_profile": {
                  "name": "Krithika S.",
                  "headline": "Marketing at Thrive Capital",
                  "location": {
                      "country": "United States",
                      "full_location": "United States"
                  }
              },
              "social_handles": {
                  "professional_network_identifier": {
                      "profile_url": "https://www.linkedin.com/in/krithix"
                  }
              },
              "experience": {
                  "employment_details": {
                      "current": [
                          {
                              "company_name": "Thrive Capital",
                              "title": "Executive in Residence, Marketing"
                          }
                      ],
                      "past": [
                          {
                              "company_name": "Stripe",
                              "title": "Head of Marketing"
                          },
                          { "company_name": "Retool", "title": "VP Marketing" },
                          { "company_name": "OpenAI", "title": "" },
                          { "company_name": "Google", "title": "" },
                          { "company_name": "Dropbox", "title": "" }
                      ]
                  }
              }
          }
      ],
      "next_cursor": "H4sIAJO-oWkC_xXMMQ6DMAwAw...",
      "total_count": 88
  }
  ```
</CodeGroup>

<Note>Response trimmed for clarity.</Note>

### How the operators work

There are two different operators at play here:

* **`in`** on `experience.employment_details.company_name` checks if the person has worked at any of the listed companies (current or past). Pass an array even for a single company. To search only current employers, use `experience.employment_details.current.company_name` instead.
* **`(.)`** on `experience.employment_details.title` does a regex match. The pipe `|` means "or", so `VP|Director|Head of` matches any title containing "VP", "Director", or "Head of". To search only current titles, use `experience.employment_details.current.title` instead.

The `experience.employment_details.company_name` field includes **all** employers (current and past). If you see someone whose current role is at a different company, it means they previously worked at your target company.

***

## Exclude specific titles

Sometimes you want everyone at a company *except* certain roles. Use the `not_in` operator to exclude titles.

This search finds people at OpenAI or Retool but excludes interns and students.

<CodeGroup>
  ```bash Request theme={"theme":"vitesse-black"}
  curl --request POST \
    --url https://api.crustdata.com/person/search \
    --header 'authorization: Bearer YOUR_API_KEY' \
    --header 'content-type: application/json' \
    --header 'x-api-version: 2025-11-01' \
    --data '{
      "filters": {
        "op": "and",
        "conditions": [
          {
            "field": "experience.employment_details.company_name",
            "type": "in",
            "value": ["OpenAI", "Retool"]
          },
          {
            "field": "experience.employment_details.title",
            "type": "not_in",
            "value": ["Intern", "Student"]
          }
        ]
      },
      "limit": 2
    }'
  ```
</CodeGroup>

The `not_in` operator removes any profile where one of the listed values appears in their title history. This is useful for cleaning up results in recruiting or sales workflows.

***

## Search within a geographic radius

The `geo_distance` filter finds people within a specific distance of a city. This is powerful for territory-based sales or local recruiting.

This search finds CTOs within 10 miles of San Francisco.

<CodeGroup>
  ```bash Request theme={"theme":"vitesse-black"}
  curl --request POST \
    --url https://api.crustdata.com/person/search \
    --header 'authorization: Bearer YOUR_API_KEY' \
    --header 'content-type: application/json' \
    --header 'x-api-version: 2025-11-01' \
    --data '{
      "filters": {
        "op": "and",
        "conditions": [
          {
            "field": "professional_network.location.raw",
            "type": "geo_distance",
            "value": {
              "location": "San Francisco",
              "distance": 10,
              "unit": "mi"
            }
          },
          {
            "field": "experience.employment_details.current.title",
            "type": "(.)",
            "value": "CTO|Chief Technology"
          }
        ]
      },
      "limit": 1
    }'
  ```

  ```json Response theme={"theme":"vitesse-black"}
  {
      "profiles": [
          {
              "crustdata_person_id": 1188,
              "basic_profile": {
                  "name": "Matthew Trentini",
                  "headline": "-",
                  "location": {
                      "city": "San Francisco",
                      "state": "California",
                      "country": "United States",
                      "full_location": "San Francisco Bay Area"
                  }
              },
              "social_handles": {
                  "professional_network_identifier": {
                      "profile_url": "https://www.linkedin.com/in/matthew-trentini-b339bb5"
                  }
              },
              "experience": {
                  "employment_details": {
                      "current": [
                          {
                              "company_name": "Farallon Capital Management",
                              "title": "Chief Technology Officer"
                          }
                      ],
                      "past": [
                          {
                              "company_name": "Farallon Capital Management",
                              "title": "Lead Software Engineer"
                          }
                      ]
                  }
              }
          }
      ],
      "next_cursor": "H4sIAJi-oWkC_xXMMQ7CMAxA0a...",
      "total_count": 104310
  }
  ```
</CodeGroup>

<Note>Response trimmed for clarity.</Note>

### How geo\_distance works

The `geo_distance` filter uses the `professional_network.location.raw` field. The `value` is an object with three fields:

| Field      | Required | Description                                                       |
| ---------- | -------- | ----------------------------------------------------------------- |
| `location` | Yes      | City name or region (e.g., "San Francisco", "London", "New York") |
| `distance` | Yes      | Radius from the center point                                      |
| `unit`     | No       | Distance unit: `mi`, `km`, `m`, `ft`. Defaults to `km`            |

***

## Search by country

For broader geographic targeting, filter by country directly.

<CodeGroup>
  ```bash Request theme={"theme":"vitesse-black"}
  curl --request POST \
    --url https://api.crustdata.com/person/search \
    --header 'authorization: Bearer YOUR_API_KEY' \
    --header 'content-type: application/json' \
    --header 'x-api-version: 2025-11-01' \
    --data '{
      "filters": {
        "field": "basic_profile.location.country",
        "type": "=",
        "value": "United States"
      },
      "limit": 2
    }'
  ```
</CodeGroup>

This returns all people located in the United States. With 125M+ matching profiles, you will want to combine this with title or employer filters to narrow results.

***

## Paginate through results

When your search matches more profiles than your `limit`, use cursor-based pagination to walk through all pages.

**First page:** send your normal search request.

<CodeGroup>
  ```bash First page theme={"theme":"vitesse-black"}
  curl --request POST \
    --url https://api.crustdata.com/person/search \
    --header 'authorization: Bearer YOUR_API_KEY' \
    --header 'content-type: application/json' \
    --header 'x-api-version: 2025-11-01' \
    --data '{
      "filters": {
        "field": "experience.employment_details.company_name",
        "type": "in",
        "value": ["Retool"]
      },
      "limit": 100
    }'
  ```
</CodeGroup>

**Next page:** take the `next_cursor` value from the response and pass it in your next request. Keep the same `filters` and `limit`.

<CodeGroup>
  ```bash Next page theme={"theme":"vitesse-black"}
  curl --request POST \
    --url https://api.crustdata.com/person/search \
    --header 'authorization: Bearer YOUR_API_KEY' \
    --header 'content-type: application/json' \
    --header 'x-api-version: 2025-11-01' \
    --data '{
      "filters": {
        "field": "experience.employment_details.company_name",
        "type": "in",
        "value": ["Retool"]
      },
      "limit": 100,
      "cursor": "PASTE_NEXT_CURSOR_VALUE_HERE"
    }'
  ```
</CodeGroup>

Continue until `next_cursor` is `null`, which means you have reached the last page.

<Warning>
  Always include `sorts` when paginating to ensure stable ordering across
  pages.
</Warning>

***

## Sort results

Use the `sorts` parameter to order results by a specific field. This is important for stable pagination.

<CodeGroup>
  ```bash Sort by connections (descending) theme={"theme":"vitesse-black"}
  curl --request POST \
    --url https://api.crustdata.com/person/search \
    --header 'authorization: Bearer YOUR_API_KEY' \
    --header 'content-type: application/json' \
    --header 'x-api-version: 2025-11-01' \
    --data '{
      "filters": {
        "field": "experience.employment_details.current.title",
        "type": "=",
        "value": "CEO"
      },
      "sorts": [{"field": "professional_network.connections", "order": "desc"}],
      "limit": 5,
      "fields": ["basic_profile.name", "professional_network.connections"]
    }'
  ```
</CodeGroup>

Valid sortable fields include: `crustdata_person_id`, `basic_profile.name`, `professional_network.connections`, `experience.employment_details.start_date`, `experience.employment_details.company_id`, `metadata.updated_at`.

***

## Exclude specific people from results

Use `post_processing` to remove known profiles from results. This is useful when re-running searches and you want to skip people you have already contacted.

<CodeGroup>
  ```bash Exclude specific people theme={"theme":"vitesse-black"}
  curl --request POST \
    --url https://api.crustdata.com/person/search \
    --header 'authorization: Bearer YOUR_API_KEY' \
    --header 'content-type: application/json' \
    --header 'x-api-version: 2025-11-01' \
    --data '{
      "filters": {
        "field": "experience.employment_details.title",
        "type": "(.)",
        "value": "Founder"
      },
      "limit": 5,
      "post_processing": {
        "exclude_names": ["Ali Kashani"],
        "exclude_profiles": ["https://www.linkedin.com/in/alikashani"]
      }
    }'
  ```
</CodeGroup>

You can exclude by name, by profile URL, or both.

***

## Preview mode

<Card title="Preview mode" icon="lock" href="https://crustdata.com/demo">
  Preview search is a premium feature. Book a demo to enable it for your
  account.
</Card>

If preview access is enabled for your account, use `preview: true` to get lightweight results before running a full search. Preview responses keep the same top-level shape but may return fewer profile fields.

<Note>
  **Current platform behavior:** if preview is not enabled for your account,
  the API returns `400 invalid_request` with the message `error: PersonDB
        preview feature is not available for your account.`
</Note>

<CodeGroup>
  ```bash Preview search theme={"theme":"vitesse-black"}
  curl --request POST \
    --url https://api.crustdata.com/person/search \
    --header 'authorization: Bearer YOUR_API_KEY' \
    --header 'content-type: application/json' \
    --header 'x-api-version: 2025-11-01' \
    --data '{
      "filters": {
        "field": "experience.employment_details.title",
        "type": "(.)",
        "value": "Founder"
      },
      "preview": true,
      "limit": 2
    }'
  ```
</CodeGroup>

***

## Filter operator reference

| Operator       | Meaning                   | Example use                                                           |
| -------------- | ------------------------- | --------------------------------------------------------------------- |
| `=`            | Exact match               | `basic_profile.name` = "David Hsu"                                    |
| `!=`           | Not equal                 | Exclude a specific country                                            |
| `>` / `<`      | Greater/less than         | Numeric comparisons                                                   |
| `in`           | Value is in list          | `experience.employment_details.company_name` in \["Retool", "OpenAI"] |
| `not_in`       | Value is not in list      | Exclude titles like "Intern"                                          |
| `(.)`          | Regex/contains match      | Title contains "VP\|Director"                                         |
| `geo_distance` | Within radius of location | People near San Francisco                                             |

## Searchable fields

* Some returned fields use a different filter path. For example, the returned `basic_profile.current_title` is searched with `experience.employment_details.current.title`.
* Contact availability flags such as `contact.has_business_email` are response-only convenience fields. For search filters, use `experience.employment_details.current.business_email_verified`, `experience.employment_details.past.business_email_verified`, or `experience.employment_details.business_email_verified`.
* `social_handles.professional_network_identifier.profile_url` is returned in search results but is rejected as a search filter. Use [Person Enrich](/person-docs/enrichment) for direct profile URL lookups.
* Some searchable fields, such as `certifications.*` and `honors.title`, may not appear in the response summary below.

| Field family                  | Common searchable fields                                                                                                                                                                                                                                                                                                                                                                                                                                              | Best for                                    |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Identity and bio              | `basic_profile.name`, `basic_profile.first_name`, `basic_profile.last_name`, `basic_profile.headline`, `basic_profile.summary`, `basic_profile.languages`                                                                                                                                                                                                                                                                                                             | Name, headline, and keyword lookups         |
| Location                      | `basic_profile.location.city`, `basic_profile.location.state`, `basic_profile.location.country`, `basic_profile.location.continent`, `basic_profile.location.full_location`, `professional_network.location.raw`                                                                                                                                                                                                                                                      | Geographic targeting and radius search      |
| Network metadata              | `professional_network.connections`, `professional_network.open_to_cards`, `professional_network.metadata.last_scraped_source`                                                                                                                                                                                                                                                                                                                                         | Network reach and status filters            |
| Skills                        | `skills.professional_network_skills`                                                                                                                                                                                                                                                                                                                                                                                                                                  | Skill-based prospecting                     |
| Experience across all roles   | `experience.employment_details.company_name`, `experience.employment_details.title`, `experience.employment_details.description`, `experience.employment_details.seniority_level`, `experience.employment_details.function_category`, `experience.employment_details.start_date`, `experience.employment_details.end_date`, `experience.employment_details.location`                                                                                                  | Current + past role history                 |
| Current role                  | `experience.employment_details.current.company_name`, `experience.employment_details.current.title`, `experience.employment_details.current.seniority_level`, `experience.employment_details.current.function_category`, `experience.employment_details.current.start_date`, `experience.employment_details.current.name`, `experience.employment_details.current.years_at_company_raw`                                                                               | Current-title and current-company targeting |
| Past role                     | `experience.employment_details.past.company_name`, `experience.employment_details.past.title`, `experience.employment_details.past.seniority_level`, `experience.employment_details.past.function_category`, `experience.employment_details.past.start_date`, `experience.employment_details.past.name`, `experience.employment_details.past.years_at_company_raw`                                                                                                    | Alumni and prior-role searches              |
| Company context in experience | `experience.employment_details.company_website_domain`, `experience.employment_details.company_headcount_latest`, `experience.employment_details.company_headcount_range`, `experience.employment_details.company_industries`, `experience.employment_details.company_professional_network_industry`, `experience.employment_details.company_type`, `experience.employment_details.company_headquarters_country`, `experience.employment_details.company_hq_location` | Company-based segmentation                  |
| Education                     | `education.schools.school`, `education.schools.degree`, `education.schools.field_of_study`                                                                                                                                                                                                                                                                                                                                                                            | School, degree, and field-of-study filters  |
| Certifications and honors     | `certifications.name`, `certifications.issuing_organization`, `certifications.issue_date`, `certifications.expiration_date`, `honors.title`                                                                                                                                                                                                                                                                                                                           | Credential and honors targeting             |
| Flags and recency             | `recently_changed_jobs`, `years_of_experience_raw`, `metadata.updated_at`                                                                                                                                                                                                                                                                                                                                                                                             | Recency and experience filters              |

## Response fields

Each profile in the response can include these sections, depending on `fields`. This table summarizes returned sections only. It is not a complete filter reference.

| Section                | Key fields                                                                                                      | Description                |
| ---------------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------- |
| `basic_profile`        | `name`, `headline`, `current_title`, `location`, `summary`                                                      | Identity and location      |
| `experience`           | `employment_details.current`, `employment_details.past`                                                         | Full work history          |
| `education`            | `schools`                                                                                                       | Education background       |
| `skills`               | `professional_network_skills`                                                                                   | Listed skills              |
| `contact`              | `has_business_email`, `has_personal_email`, `has_phone_number`                                                  | Contact availability flags |
| `social_handles`       | `professional_network_identifier.profile_url`, `dev_platform_identifier.profile_url`, `twitter_identifier.slug` | Available profile handles  |
| `professional_network` | `connections`, `profile_picture_permalink`                                                                      | Network metadata           |

***

## Request parameter reference

| Parameter         | Type      | Required | Default | Description                                                                                                                     |
| ----------------- | --------- | -------- | ------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `filters`         | object    | Yes      | —       | Filter condition or condition group. See [operators](#filter-operator-reference) above.                                         |
| `fields`          | string\[] | No       | All     | Dot-path fields to return (e.g., `["basic_profile.name", "experience.employment_details.current.title"]`).                      |
| `sorts`           | array     | No       | `[]`    | Sort specifications as an array of `{ field, order }` objects. Use `asc` or `desc` for `order`. Required for stable pagination. |
| `limit`           | integer   | No       | 20      | Max profiles per page (1–1000).                                                                                                 |
| `count`           | integer   | No       | —       | Alias for `limit`.                                                                                                              |
| `cursor`          | string    | No       | `null`  | Pagination cursor from previous response's `next_cursor`.                                                                       |
| `post_processing` | object    | No       | —       | `exclude_profiles` (URL array) and `exclude_names` (name array).                                                                |
| `preview`         | boolean   | No       | `false` | Premium feature — return lightweight results (faster, lower cost).                                                              |
| `return_query`    | boolean   | No       | `false` | Debug flag accepted by the API. **Current platform behavior:** the response does not include a top-level `query` field.         |

## Errors

| Status | Meaning                                                                                                          |
| ------ | ---------------------------------------------------------------------------------------------------------------- |
| `400`  | Invalid request — unsupported field, wrong operator, malformed filters, or preview not enabled for your account. |
| `401`  | Invalid or missing API key.                                                                                      |
| `403`  | Permission denied or insufficient credits.                                                                       |
| `500`  | Internal server error. Retry with exponential backoff.                                                           |

### No results

When no people match the filters, the API returns `200` with an empty `profiles` array:

```json theme={"theme":"vitesse-black"}
{
    "profiles": [],
    "next_cursor": null,
    "total_count": 0
}
```

**Action:** Broaden filters or check field values with [Autocomplete](/person-docs/autocomplete).

***

## API reference summary

| Detail         | Value                                                                            |
| -------------- | -------------------------------------------------------------------------------- |
| **Endpoint**   | `POST /person/search`                                                            |
| **Auth**       | Bearer token + `x-api-version: 2025-11-01`                                       |
| **Response**   | `{ "profiles": [...], "next_cursor": "...", "total_count": N }`                  |
| **Pagination** | Cursor-based. Pass `next_cursor` as `cursor`. Stop when `next_cursor` is `null`. |
| **Errors**     | `400`, `401`, `403`, `500`                                                       |

See the [full API reference](/openapi-specs/2025-11-01/introduction) for the complete OpenAPI schema.

***

## What to do next

* **Enrich a profile** — once you have a profile URL from search, use [Person Enrich](/person-docs/enrichment) to get the full cached profile.
* **Discover filter values** — use [Person Autocomplete](/person-docs/autocomplete) to find exact indexed values for search filters.
* **See more examples** — browse [Person Examples](/person-docs/examples) for ready-to-copy workflow patterns.
* **Read the quickstart** — see [Person APIs](/person-docs/quickstart) for a high-level guide to the core person endpoints.
* **Check the API reference** — see the [OpenAPI spec](/openapi-specs/2025-11-01/introduction) for the full schema.
> ## Documentation Index
> Fetch the complete documentation index at: https://docs.crustdata.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Person Autocomplete

> Discover valid field values for Person Search filters using the autocomplete API.

**Use this when** you need to discover exact indexed values before building a Person Search query — for filter dropdowns, input validation, dataset exploration, or guided query builders.

The Person Autocomplete API returns ranked field-value suggestions so you can feed the result straight into a [Person Search](/person-docs/search) filter without guessing at valid values.

<Warning>
  This endpoint returns **field values, not person profiles**. It also has
  **no pagination or cursor** — the `limit` parameter (max `100`) is the only
  way to control result size. For a full list of distinct values you need to
  combine Autocomplete with progressively narrower `filters` scopes. To fetch
  person records, use [Person Search](/person-docs/search) or [Person
  Enrich](/person-docs/enrichment) instead.
</Warning>

<Tip>
  **Mental model.** The top-level **`field`** is the field whose values you
  want suggested — the autocomplete target. **`filters.field`** is different:
  it's any Person Search filter field you use to narrow the population that
  autocomplete runs over. Autocomplete targets come from a fixed allowlist;
  filter fields come from the broader Person Search filter vocabulary.
</Tip>

## At a glance

| Detail          | Value                                                                                  |
| --------------- | -------------------------------------------------------------------------------------- |
| **Endpoint**    | `POST https://api.crustdata.com/person/search/autocomplete`                            |
| **Auth**        | `Authorization: Bearer YOUR_API_KEY`                                                   |
| **API version** | `x-api-version: 2025-11-01` header (required)                                          |
| **Required**    | `field` (string) · `query` (string, may be empty)                                      |
| **Optional**    | `limit` (integer, 1–100, default 20) · `filters` (single condition or condition group) |
| **Response**    | `{ "suggestions": [ { "value": string } ] }`                                           |
| **Errors**      | `400` invalid request · `401` unauthorized · `500` internal                            |
| **Pricing**     | Free — see [Pricing](/general/pricing#person-apis) for the authoritative list.         |

<Note>Replace `YOUR_API_KEY` in each example with your actual API key.</Note>

<Note>
  Default `rate-limit` is 15 requests per minute. Send an email to
  [gtm@crustdata.co](mailto:gtm@crustdata.co) to discuss higher limits if
  needed for your use case.
</Note>

### Guaranteed contract vs current behavior

Use this table to separate the parts you can build against with confidence from the observed behavior that may evolve.

| Topic                               | Kind             | What it means                                                                                                                                 |
| ----------------------------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Endpoint, HTTP method, auth headers | **Contract**     | `POST /person/search/autocomplete`, bearer auth, `x-api-version: 2025-11-01`.                                                                 |
| Request body shape                  | **Contract**     | `field` and `query` required, `limit` and `filters` optional, `filters` uses conditions / condition groups with the documented operators.     |
| Response body shape                 | **Contract**     | `{ "suggestions": [ { "value" } ] }`. Empty results return `{"suggestions": []}` with status `200`.                                           |
| Supported operators                 | **Contract**     | `=`, `!=`, `<`, `=<`, `>`, `=>`, `in`, `not_in`, `contains` — see [Supported operators](#supported-operators).                                |
| `limit` bounds and default          | **Contract**     | Minimum `1`, maximum `100`, default `20`.                                                                                                     |
| Error status codes                  | **Contract**     | `400` (invalid request), `401` (unauthorized), `500` (internal).                                                                              |
| Suggestion ranking                  | Current behavior | Suggestions are ranked by internal frequency within the (optionally filtered) population — the ranking signal is not exposed in the response. |
| Case-insensitive query matching     | Current behavior | `"vp"` and `"VP"` currently return the same suggestions.                                                                                      |
| Multi-token query loose matching    | Current behavior | A multi-word `query` may return values containing only one of the tokens.                                                                     |
| Blank-string suggestions            | Current behavior | Empty-`query` calls can return `""` as the top suggestion when a field has many empty indexed records.                                        |

***

## When to use Autocomplete vs Search

| You want to…                                           | Use                                      |
| ------------------------------------------------------ | ---------------------------------------- |
| Discover valid filter values for a field               | **Autocomplete** (this page)             |
| See the distinct values a field takes, ranked by count | **Autocomplete** with an empty `query`   |
| Return actual person profiles matching filters         | [**Person Search**](/person-docs/search) |
| Build a type-ahead dropdown for a filter UI            | **Autocomplete** with a partial `query`  |
| Build a live multi-field query that returns full rows  | [**Person Search**](/person-docs/search) |

***

## Quick start: discover job title values

Type-ahead lookup on a single field. Pass the user's partial input as `query` and cap the dropdown size with `limit`.

<CodeGroup>
  ```bash curl theme={"theme":"vitesse-black"}
  curl --request POST \
    --url https://api.crustdata.com/person/search/autocomplete \
    --header 'authorization: Bearer YOUR_API_KEY' \
    --header 'content-type: application/json' \
    --header 'x-api-version: 2025-11-01' \
    --data '{
      "field": "experience.employment_details.current.title",
      "query": "VP",
      "limit": 5
    }'
  ```

  ```python Python theme={"theme":"vitesse-black"}
  import os
  import requests

  response = requests.post(
      "https://api.crustdata.com/person/search/autocomplete",
      headers={
          "Authorization": f"Bearer {os.environ['CRUSTDATA_API_KEY']}",
          "Content-Type": "application/json",
          "x-api-version": "2025-11-01",
      },
      json={
          "field": "experience.employment_details.current.title",
          "query": "VP",
          "limit": 5,
      },
  )
  response.raise_for_status()
  suggestions = response.json()["suggestions"]
  ```

  ```javascript Node.js theme={"theme":"vitesse-black"}
  const response = await fetch(
      "https://api.crustdata.com/person/search/autocomplete",
      {
          method: "POST",
          headers: {
              Authorization: `Bearer ${process.env.CRUSTDATA_API_KEY}`,
              "Content-Type": "application/json",
              "x-api-version": "2025-11-01",
          },
          body: JSON.stringify({
              field: "experience.employment_details.current.title",
              query: "VP",
              limit: 5,
          }),
      },
  );
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const { suggestions } = await response.json();
  ```

  ```json Response theme={"theme":"vitesse-black"}
  {
      "suggestions": [
          { "value": "VP" },
          { "value": "VP of Sales" },
          { "value": "vp" },
          { "value": "VP Sales" },
          { "value": "VP Operations" }
      ]
  }
  ```
</CodeGroup>

Each suggestion includes:

* **`value`** — the exact **indexed value**: the raw string stored against `field` in Crustdata's person index. Use it verbatim as a Person Search filter value — two distinct indexed values (for example `"VP"` and `"vp"`) are different filter keys, and substituting one for the other will return different results.

Suggestions are returned ranked by internal frequency within the (optionally filtered) population. The ranking signal itself is not returned in the response.

When no values match the `query` (or no values exist within the `filters` scope), the response returns an empty array — not a 404:

```json No results theme={"theme":"vitesse-black"}
{
    "suggestions": []
}
```

***

## Get the most common values for a field

Pass an empty `query` to retrieve the top values for the field by frequency. Useful for seeding filter dropdowns or showing popular options.

<CodeGroup>
  ```bash Request theme={"theme":"vitesse-black"}
  curl --request POST \
    --url https://api.crustdata.com/person/search/autocomplete \
    --header 'authorization: Bearer YOUR_API_KEY' \
    --header 'content-type: application/json' \
    --header 'x-api-version: 2025-11-01' \
    --data '{
      "field": "experience.employment_details.current.title",
      "query": "",
      "limit": 5
    }'
  ```

  ```json Response theme={"theme":"vitesse-black"}
  {
      "suggestions": [
          { "value": "" },
          { "value": "Owner" },
          { "value": "Director" },
          { "value": "Manager" },
          { "value": "Teacher" }
      ]
  }
  ```
</CodeGroup>

<Note>
  **Current platform behavior:** empty-query autocomplete can return blank
  string values when a field has many empty indexed records. Filter those out
  in your UI if you do not want a blank option.
</Note>

***

## Narrow suggestions with filters

Scope the autocomplete to a subset of the dataset with the optional `filters` field. The suggestions are then computed against the filtered population.

`filters` accepts either a single `AutocompleteFilterCondition` or a nested `AutocompleteFilterConditionGroup` combined with `and`/`or` logic.

<Tabs>
  <Tab title="Single condition">
    Use a single `AutocompleteFilterCondition` to filter on one field — for example, top "VP" titles among current Google employees.

    <CodeGroup>
      ```bash Request theme={"theme":"vitesse-black"}
      curl --request POST \
        --url https://api.crustdata.com/person/search/autocomplete \
        --header 'authorization: Bearer YOUR_API_KEY' \
        --header 'content-type: application/json' \
        --header 'x-api-version: 2025-11-01' \
        --data '{
          "field": "experience.employment_details.current.title",
          "query": "VP",
          "limit": 5,
          "filters": {
            "field": "experience.employment_details.current.company_name",
            "type": "=",
            "value": "Google"
          }
        }'
      ```

      ```json Response theme={"theme":"vitesse-black"}
      {
          "suggestions": [
              { "value": "VP" },
              { "value": "VP of Engineering" },
              { "value": "VP Engineering" },
              { "value": "VP Sales" },
              { "value": "vp" }
          ]
      }
      ```
    </CodeGroup>
  </Tab>

  <Tab title="Condition group (AND/OR)">
    Use an `AutocompleteFilterConditionGroup` to combine multiple conditions with `op: "and"` or `op: "or"` — for example, top titles matching `"engineer"` at Google in the United States.

    <CodeGroup>
      ```bash Request theme={"theme":"vitesse-black"}
      curl --request POST \
        --url https://api.crustdata.com/person/search/autocomplete \
        --header 'authorization: Bearer YOUR_API_KEY' \
        --header 'content-type: application/json' \
        --header 'x-api-version: 2025-11-01' \
        --data '{
          "field": "experience.employment_details.current.title",
          "query": "engineer",
          "limit": 5,
          "filters": {
            "op": "and",
            "conditions": [
              {
                "field": "experience.employment_details.current.company_name",
                "type": "=",
                "value": "Google"
              },
              {
                "field": "basic_profile.location.country",
                "type": "=",
                "value": "United States"
              }
            ]
          }
        }'
      ```

      ```json Response theme={"theme":"vitesse-black"}
      {
          "suggestions": [
              { "value": "Software Engineer" },
              { "value": "Senior Software Engineer" },
              { "value": "Staff Software Engineer" },
              { "value": "Senior Staff Software Engineer" },
              { "value": "Software Engineer III" }
          ]
      }
      ```
    </CodeGroup>

    Groups can be nested — pass another `AutocompleteFilterConditionGroup` inside `conditions` to express arbitrarily complex boolean expressions.
  </Tab>

  <Tab title="Multi-value (in / not_in)">
    Use `in` or `not_in` to match any value in a list. Pass a JSON **array** for `value` — a comma-separated string will return a 400.

    Top engineer titles across the United States, United Kingdom, and Canada:

    <CodeGroup>
      ```bash Request (in) theme={"theme":"vitesse-black"}
      curl --request POST \
        --url https://api.crustdata.com/person/search/autocomplete \
        --header 'authorization: Bearer YOUR_API_KEY' \
        --header 'content-type: application/json' \
        --header 'x-api-version: 2025-11-01' \
        --data '{
          "field": "experience.employment_details.current.title",
          "query": "Engineer",
          "limit": 5,
          "filters": {
            "field": "basic_profile.location.country",
            "type": "in",
            "value": ["United States", "United Kingdom", "Canada"]
          }
        }'
      ```

      ```json Response theme={"theme":"vitesse-black"}
      {
          "suggestions": [
              { "value": "Software Engineer" },
              { "value": "Senior Software Engineer" },
              { "value": "Engineer" },
              { "value": "Project Engineer" },
              { "value": "Mechanical Engineer" }
          ]
      }
      ```
    </CodeGroup>

    Top seniority levels **excluding** the United States and United Kingdom:

    <CodeGroup>
      ```bash Request (not_in) theme={"theme":"vitesse-black"}
      curl --request POST \
        --url https://api.crustdata.com/person/search/autocomplete \
        --header 'authorization: Bearer YOUR_API_KEY' \
        --header 'content-type: application/json' \
        --header 'x-api-version: 2025-11-01' \
        --data '{
          "field": "experience.employment_details.current.seniority_level",
          "query": "",
          "limit": 5,
          "filters": {
            "field": "basic_profile.location.country",
            "type": "not_in",
            "value": ["United States", "United Kingdom"]
          }
        }'
      ```

      ```json Response theme={"theme":"vitesse-black"}
      {
          "suggestions": [
              { "value": "Entry Level" },
              { "value": "Entry Level Manager" },
              { "value": "Senior" },
              { "value": "Director" },
              { "value": "Owner / Partner" }
          ]
      }
      ```
    </CodeGroup>
  </Tab>

  <Tab title="Numeric comparison">
    Pass numeric values as JSON numbers. Filter `value` accepts string, number, integer, or boolean scalars; for `in` and `not_in`, use arrays of strings, numbers, or integers that match the underlying field's type.

    <CodeGroup>
      ```bash Request theme={"theme":"vitesse-black"}
      curl --request POST \
        --url https://api.crustdata.com/person/search/autocomplete \
        --header 'authorization: Bearer YOUR_API_KEY' \
        --header 'content-type: application/json' \
        --header 'x-api-version: 2025-11-01' \
        --data '{
          "field": "experience.employment_details.current.title",
          "query": "",
          "limit": 3,
          "filters": {
            "field": "experience.employment_details.current.company_headcount_latest",
            "type": ">",
            "value": 10000
          }
        }'
      ```

      ```json Response theme={"theme":"vitesse-black"}
      {
          "suggestions": [
              { "value": "" },
              { "value": "Software Engineer" },
              { "value": "Manager" }
          ]
      }
      ```
    </CodeGroup>
  </Tab>
</Tabs>

***

## Workflow: Autocomplete → Search

<Steps>
  <Step title="Discover the exact indexed value">
    Call autocomplete with a partial `query` to find the exact indexed value — for example, `"VP of Sales"`.
  </Step>

  <Step title="Feed the value into Person Search">
    Use the returned `value` verbatim as the filter value in a Person Search request:

    ```json theme={"theme":"vitesse-black"}
    {
        "filters": {
            "field": "experience.employment_details.current.title",
            "type": "=",
            "value": "VP of Sales"
        }
    }
    ```

    This ensures your search uses an exact indexed value instead of a guess.
  </Step>
</Steps>

See [Person Search](/person-docs/search) for the full filter grammar.

***

## Supported operators

The `type` field on every `AutocompleteFilterCondition` accepts the same operators as Person Search filters.

<Warning>
  The **greater-than-or-equal** operator is `=>` (not `>=`) and **less-than-or-equal** is `=<` (not `<=`). This is intentional — do not mistype them as the more common `<=` and `>=`.
</Warning>

| Operator   | `value` shape                              | Meaning                                                                    |
| ---------- | ------------------------------------------ | -------------------------------------------------------------------------- |
| `=`        | string, number, integer, or boolean        | Exact match — the field value equals `value`.                              |
| `!=`       | string, number, integer, or boolean        | Not equal — the field value differs from `value`.                          |
| `<`        | number or ISO date string                  | Less than — numeric or date comparison.                                    |
| `=<`       | number or ISO date string                  | Less than or equal — numeric or date comparison.                           |
| `>`        | number or ISO date string                  | Greater than — numeric or date comparison.                                 |
| `=>`       | number or ISO date string                  | Greater than or equal — numeric or date comparison.                        |
| `in`       | **array** of strings, numbers, or integers | Membership — field value matches any entry in the array.                   |
| `not_in`   | **array** of strings, numbers, or integers | Negated membership — field value matches none of the entries in the array. |
| `contains` | string                                     | Substring match — field value contains `value`.                            |

<Tip>
  Pass values with the JSON type that matches the underlying field:
  `"value": 10000` for numeric fields, `"value": true` for booleans, and
  strings for text fields. `in` and `not_in` require a JSON array — a
  comma-separated string will return a 400.
</Tip>

***

## Implementation tips for UI builders

<Tip>
  * **Debounce** autocomplete calls to avoid one request per keystroke — 150–300 ms on input idle works well for typeahead UIs.
  * **Drop blank values.** If `""` is returned as the top suggestion, remove it before rendering the dropdown.
  * **Handle casing variants carefully.** Suggestions like `"VP"` and `"vp"` are **distinct indexed values**. Only merge them into a single UI option if you intentionally want normalized grouping — and if you do, preserve the underlying raw values and expand them in the eventual Person Search filter using `in`, for example `{"type": "in", "value": ["VP", "vp"]}`. If the UI needs exact-value selection, keep them as separate options.
  * **Cap `limit`.** Most dropdowns need 5–15 options. Lower `limit` reduces payload size and gives faster responses.
  * **Cache top-values lookups.** Empty-`query` calls that seed filter dropdowns rarely change — cache them client-side or at the edge.
</Tip>

***

## Common supported fields

The top-level `field` in the request (the field whose values you want suggested) must come from a **fixed allowlist** of autocomplete-enabled dataset fields. Not every Person Search field is autocomplete-enabled.

The `filters.field` is different: it can be any dataset field that [Person Search](/person-docs/search) accepts as a filter, not only the autocomplete allowlist. So you can filter autocomplete results on a broader set of fields than you can autocomplete on directly.

<Note>
  The tables below are a **documented subset** of the autocomplete allowlist.
  They cover the fields most useful for building filter dropdowns, but they
  are **not exhaustive**. If a field you need is not listed, treat its support
  as unknown until you verify it — the safest way to confirm is to call the
  endpoint with that field and check whether you get a `400` error. See
  [Verify the live list](#verify-the-live-list) below for the debug-only live
  source.
</Note>

<Note>
  **`company_name` vs `name` for employers (current behavior).** Both
  `experience.employment_details.current.company_name` and
  `experience.employment_details.current.name` are currently accepted and
  return the current employer. Prefer `company_name` for clarity; `name` is an
  alternative spelling retained for backwards compatibility and may eventually
  be removed.
</Note>

<Tabs>
  <Tab title="Current employment">
    | Field                                                          | What it discovers               |
    | -------------------------------------------------------------- | ------------------------------- |
    | `experience.employment_details.current.title`                  | Current job titles              |
    | `experience.employment_details.current.name`                   | Current employer names          |
    | `experience.employment_details.current.seniority_level`        | Seniority level buckets         |
    | `experience.employment_details.current.function_category`      | Job function                    |
    | `experience.employment_details.current.company_industries`     | Current employer industries     |
    | `experience.employment_details.current.company_type`           | Current employer type           |
    | `experience.employment_details.current.company_hq_location`    | Current employer HQ location    |
    | `experience.employment_details.current.company_website_domain` | Current employer website domain |
  </Tab>

  <Tab title="Past employment">
    | Field                                      | What it discovers   |
    | ------------------------------------------ | ------------------- |
    | `experience.employment_details.past.title` | Past job titles     |
    | `experience.employment_details.past.name`  | Past employer names |
  </Tab>

  <Tab title="Profile & location">
    | Field                                     | What it discovers          |
    | ----------------------------------------- | -------------------------- |
    | `basic_profile.name`                      | Person names               |
    | `basic_profile.headline`                  | Profile headlines          |
    | `basic_profile.languages`                 | Spoken languages           |
    | `basic_profile.location.raw`              | Raw location strings       |
    | `basic_profile.location.city`             | Cities                     |
    | `basic_profile.location.state`            | States / regions           |
    | `basic_profile.location.country`          | Countries                  |
    | `basic_profile.location.continent`        | Continents                 |
    | `professional_network.location.city`      | Profile network cities     |
    | `professional_network.location.state`     | Profile network states     |
    | `professional_network.location.country`   | Profile network countries  |
    | `professional_network.location.continent` | Profile network continents |
  </Tab>

  <Tab title="Education, skills & more">
    | Field                                    | What it discovers        |
    | ---------------------------------------- | ------------------------ |
    | `education.schools.school`               | Schools / universities   |
    | `education.schools.degree`               | Degrees                  |
    | `education.schools.field_of_study`       | Fields of study          |
    | `skills.professional_network_skills`     | Skills                   |
    | `certifications.name`                    | Certification names      |
    | `certifications.issuing_organization`    | Certification issuers    |
    | `honors.title`                           | Honors and awards        |
    | `social_handles.twitter_identifier.slug` | X (Twitter) handle slugs |
  </Tab>
</Tabs>

### Verify the live list

<Warning>
  **Debug fallback only — do not parse this error message in production
  code.** The 400 error `message` is a human-readable debugging aid, not a
  stable API surface. Its shape, ordering, and field list can change without
  notice. Use it during development to confirm whether a specific field is
  autocomplete-enabled, then maintain your own allowlist or rely on the
  common-fields tables above.
</Warning>

Call the endpoint with a deliberately invalid `field`. The `400` response lists every currently accepted field in its error `message`:

<CodeGroup>
  ```bash Request theme={"theme":"vitesse-black"}
  curl --request POST \
    --url https://api.crustdata.com/person/search/autocomplete \
    --header 'authorization: Bearer YOUR_API_KEY' \
    --header 'content-type: application/json' \
    --header 'x-api-version: 2025-11-01' \
    --data '{
      "field": "current_title",
      "query": "",
      "limit": 1
    }'
  ```

  ```json Response (abbreviated) theme={"theme":"vitesse-black"}
  {
      "error": {
          "type": "invalid_request",
          "message": "Field 'current_title' is not valid for autocomplete. Available fields are: basic_profile.headline, basic_profile.languages, basic_profile.location, basic_profile.location.city, ..., experience.employment_details.current.function_category, experience.employment_details.current.title, ..., skills.professional_network_skills, social_handles.twitter_identifier.slug",
          "metadata": []
      }
  }
  ```
</CodeGroup>

***

## Request parameters

<Warning>
  **Operator footguns.** Use `=>` for greater-than-or-equal and `=<` for less-than-or-equal — these are **not** `>=` and `<=`. `in` / `not_in` require JSON arrays (not comma-separated strings).
</Warning>

| Parameter | Type    | Required | Description                                                                                                                                                                                                                                                                                                                                                              |
| --------- | ------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `field`   | string  | Yes      | Dataset field whose values you want suggested. Must be an **autocomplete-enabled field** — the allowlist is a subset of all Person Search fields. The [common supported fields](#common-supported-fields) tables cover the most useful subset; the full live allowlist can be verified via the [debug fallback](#verify-the-live-list). Unsupported fields return `400`. |
| `query`   | string  | Yes      | Partial text to match against indexed values. Pass `""` to retrieve the top values for the field by frequency.                                                                                                                                                                                                                                                           |
| `limit`   | integer | No       | Maximum number of suggestions to return. Minimum `1`, maximum `100`, default `20`.                                                                                                                                                                                                                                                                                       |
| `filters` | object  | No       | Optional scope for the autocomplete computation. Pass either a single `AutocompleteFilterCondition` or a nested `AutocompleteFilterConditionGroup`.                                                                                                                                                                                                                      |

### `AutocompleteFilterCondition`

| Field   | Type                                       | Required | Description                                                                                                                                                                     |
| ------- | ------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `field` | string                                     | Yes      | Dataset field to filter on. Can be any [Person Search](/person-docs/search) filter field — **this scope is broader than the autocomplete allowlist** for the top-level `field`. |
| `type`  | string (enum)                              | Yes      | One of [the supported operators](#supported-operators): `=`, `!=`, `<`, `=<`, `>`, `=>`, `in`, `not_in`, `contains`.                                                            |
| `value` | string, number, integer, boolean, or array | Yes      | Scalar for comparison operators; JSON array of strings/numbers/integers for `in` and `not_in`. Match the JSON type to the underlying field's type.                              |

### `AutocompleteFilterConditionGroup`

| Field        | Type          | Required | Description                                                                                                                    |
| ------------ | ------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `op`         | string (enum) | Yes      | `"and"` or `"or"`.                                                                                                             |
| `conditions` | array         | Yes      | One or more `AutocompleteFilterCondition` items or nested `AutocompleteFilterConditionGroup` items. Must contain at least one. |

***

## Errors

| Status | Meaning                                                                                                                                          |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `400`  | Invalid request — unsupported `field`, missing required field, a wrong `value` shape (for example a comma string for `in`), or a malformed body. |
| `401`  | Unauthorized — the `Authorization` header is missing, malformed, or contains an invalid API key.                                                 |
| `500`  | Internal server error — retry after a short delay.                                                                                               |

Note: a `query` that matches nothing is **not** an error — the endpoint returns `{"suggestions": []}` with a 200 status. Only use 4xx/5xx handling for actual request or server failures.

<CodeGroup>
  ```json 400 — Unsupported field theme={"theme":"vitesse-black"}
  {
      "error": {
          "type": "invalid_request",
          "message": "Field 'current_title' is not valid for autocomplete. Available fields are: basic_profile.headline, ..., experience.employment_details.current.function_category, experience.employment_details.current.title, ..., skills.professional_network_skills, social_handles.twitter_identifier.slug",
          "metadata": []
      }
  }
  ```

  ```json 400 — Wrong value shape for in operator theme={"theme":"vitesse-black"}
  {
      "error": {
          "type": "invalid_request",
          "message": "Failed to get autocomplete suggestions: IN operator requires list or tuple value, got: <class 'str'>",
          "metadata": []
      }
  }
  ```

  ```json 401 — Invalid API key theme={"theme":"vitesse-black"}
  {
      "message": "Invalid API key in request"
  }
  ```
</CodeGroup>

***

## What to do next

* **Search for people** — use discovered values in [Person Search](/person-docs/search).
* **Enrich matches** — use [Person Enrich](/person-docs/enrichment) to get full profiles.
* **See more examples** — browse [Person Examples](/person-docs/examples).
> ## Documentation Index
> Fetch the complete documentation index at: https://docs.crustdata.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Person Examples

> End-to-end Person API workflow examples with requests, responses, extraction steps, and failure handling.

Use this page for complete workflow examples that chain multiple Person API calls together.

For single-endpoint requests and parameter details, use these pages:

* [Person Search](/person-docs/search) — name lookup, title filters, exclusions, geographic filters, pagination, and preview mode.
* [Person Enrichment](/person-docs/enrichment) — profile URL enrichment, business email lookup, batch enrichment, refresh flags, and field selection.

***

## Workflow 1: Autocomplete → Search → Enrich

**Goal:** Find VPs of Sales at mid-size software companies and get their full profiles.

**Why this workflow:** You don't know the exact title value the Search API expects. Autocomplete discovers it, Search finds matching people, and Enrich fills in the details.

### Step 1: Discover valid title values

<CodeGroup>
  ```bash Request theme={"theme":"vitesse-black"}
  curl --request POST \
    --url https://api.crustdata.com/person/search/autocomplete \
    --header 'authorization: Bearer YOUR_API_KEY' \
    --header 'content-type: application/json' \
    --header 'x-api-version: 2025-11-01' \
    --data '{"field": "experience.employment_details.current.title", "query": "VP Sales", "limit": 3}'
  ```

  ```json Response theme={"theme":"vitesse-black"}
  {
      "suggestions": [
          { "value": "VP Sales", "document_count": 10178 },
          { "value": "VP of Sales", "document_count": 13365 },
          { "value": "VP, Sales", "document_count": 3421 }
      ]
  }
  ```
</CodeGroup>

**Extract:** Take `suggestions[0].value` → `"VP Sales"`. Use this exact string in your Search filter.

**If empty:** Try a broader query (e.g., `"VP"` instead of `"VP Sales"`).

### Step 2: Search for matching people

<CodeGroup>
  ```bash Request theme={"theme":"vitesse-black"}
  curl --request POST \
    --url https://api.crustdata.com/person/search \
    --header 'authorization: Bearer YOUR_API_KEY' \
    --header 'content-type: application/json' \
    --header 'x-api-version: 2025-11-01' \
    --data '{
      "filters": {
        "op": "and",
        "conditions": [
          {"field": "experience.employment_details.current.title", "type": "in", "value": ["VP Sales", "VP of Sales"]},
          {"field": "experience.employment_details.current.company_headcount_range", "type": "in", "value": ["51-200", "201-500"]}
        ]
      },
      "limit": 3,
      "fields": ["basic_profile.name", "experience.employment_details.current.title", "experience.employment_details.current.company_name", "social_handles.professional_network_identifier.profile_url"]
    }'
  ```

  ```json Response theme={"theme":"vitesse-black"}
  {
      "profiles": [
          {
              "basic_profile": { "name": "Jane Smith" },
              "experience": {
                  "employment_details": {
                      "current": [{ "title": "VP of Sales", "name": "Acme Corp" }]
                  }
              },
              "social_handles": {
                  "professional_network_identifier": {
                      "profile_url": "https://www.linkedin.com/in/janesmith"
                  }
              }
          }
      ],
      "next_cursor": "H4sIACIdzWkC...",
      "total_count": 15420
  }
  ```
</CodeGroup>

**Extract:** Take `social_handles.professional_network_identifier.profile_url` → `"https://www.linkedin.com/in/janesmith"`. Pass the profile URL to Enrich.

**If empty:** Broaden filters or check values with [Autocomplete](/person-docs/autocomplete).

### Step 3: Enrich the top match

<CodeGroup>
  ```bash Request theme={"theme":"vitesse-black"}
  curl --request POST \
    --url https://api.crustdata.com/person/enrich \
    --header 'authorization: Bearer YOUR_API_KEY' \
    --header 'content-type: application/json' \
    --header 'x-api-version: 2025-11-01' \
    --data '{"professional_network_profile_urls": ["https://www.linkedin.com/in/janesmith"]}'
  ```
</CodeGroup>

**Result:** Full person profile with employment history, education, skills, contact info, and more.

***

## Workflow 2: Business email → Enrich

**Goal:** An inbound lead submits a business email. Enrich it directly to get the person's full profile.

### Step 1: Enrich the email

<CodeGroup>
  ```bash Request theme={"theme":"vitesse-black"}
  curl --request POST \
    --url https://api.crustdata.com/person/enrich \
    --header 'authorization: Bearer YOUR_API_KEY' \
    --header 'content-type: application/json' \
    --header 'x-api-version: 2025-11-01' \
    --data '{"business_emails": ["abhilash@crustdata.com"]}'
  ```

  ```json Response theme={"theme":"vitesse-black"}
  [
      {
          "matched_on": "abhilash@crustdata.com",
          "match_type": "business_email",
          "matches": [
              {
                  "confidence_score": 1.0,
                  "person_data": {
                      "basic_profile": {
                          "name": "Abhilash Chowdhary",
                          "current_title": "Co-Founder & CEO"
                      }
                  }
              }
          ]
      }
  ]
  ```
</CodeGroup>

**Extract:** If `matches[0].confidence_score >= 0.8`, the person is confirmed and you already have the enrich response. Continue with any follow-up processing you need.

**If no match:** `matches` will be `[]`. The email may not be in the database. Try a different identifier or check for typos.

***

## Error handling patterns

### Invalid request (400)

```json theme={"theme":"vitesse-black"}
{
    "error": {
        "type": "invalid_request",
        "message": "Unsupported filter field: 'current_title'. Supported fields: ['basic_profile.name', 'basic_profile.headline', ...]",
        "metadata": []
    }
}
```

**Action:** Fix the request. Do not retry `400` errors.

### Invalid API key (401)

```json theme={"theme":"vitesse-black"}
{ "message": "Invalid API key in request" }
```

**Action:** Check your API key. The `401` response uses a simpler shape.

### No match (Enrich)

```json theme={"theme":"vitesse-black"}
[
    {
        "matched_on": "nonexistent@example.com",
        "match_type": "business_email",
        "matches": []
    }
]
```

**Action:** Try a different identifier or check for typos. Do not retry.

### Retry decision table

| Status | Retry? | Action                           |
| ------ | ------ | -------------------------------- |
| `400`  | No     | Fix the request                  |
| `401`  | No     | Check API key                    |
| `403`  | No     | Check permissions or credits     |
| `404`  | No     | Profile not found                |
| `500`  | Yes    | Exponential backoff (1s, 2s, 4s) |
