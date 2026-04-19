# Account or lead discovery by events

This watch lets you discover "new" accounts or leads based on a specific event and the provided account or lead criteria.

## Use Cases

1. **Tracking Job Postings**: A recruiter wants to track job postings with "Software Engineer" in the title, located in the United States, for companies with more than 1000 employees in the Financial Services industry. They create a watch and receive webhooks whenever new job postings meet these criteria.
2. **Monitoring Funding Announcements**: A venture capital firm wants to receive notifications about new funding announcements for startups in specific industries and headcount ranges. They set up watches to receive these updates automatically.

## Event types

Currently there are 12 event types by which you can discover accounts or leads.

# Watcher Types

<details id="job-posting-with-keyword-and-location">
<summary>1. Job Posting with Keyword and Location</summary>

### Job Posting with Keyword and Location

Tracks job postings that contain certain keywords in the title or description and are posted in a specific location.

- Availability: available now
- Slug: `job-posting-with-keyword-and-location`
- Event filters:

| **Filter type**        | **Data type**     | **Description**                                                                                                                                                                                                                                                                                                                                                      |
| ---------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `REGION`               | list (max 1 item) | Specifies the location for the job posting. Example values: ["United States"]. Use [**Filters Autocomplete API**](/docs/2024-11-01/discover/auxiliary-apis/filters-autocomplete) to get valid values.<br/>Full list: [**region_values**](https://crustdata-docs-region-json.s3.us-east-2.amazonaws.com/updated_regions.json)                                         |
| `TITLE`                | list (max 1 item) | [Optional] Specifies the job title to track. Example values: ["Software Engineer"]                                                                                                                                                                                                                                                                                   |
| `DESCRIPTION`          | list (max 1 item) | [Optional] Specifies keywords that should be present in the job description. Example values: ["Backend Developer"], ["Machine Learning"].                                                                                                                                                                                                                            |
| `INDUSTRY`             | list              | [Optional] Specifies the industry of the company. Example values: ["Professional Services"], ["Financial Services"]. Use [**Filters Autocomplete API**](/docs/2024-11-01/discover/auxiliary-apis/filters-autocomplete) to get valid values.<br/>Full list: [**industry_values**](https://crustdata-docs-region-json.s3.us-east-2.amazonaws.com/industry_values.json) |
| `EXACT_KEYWORD_MATCH`  | boolean           | [Optional] When true, requires exact matches for title and description keywords. When false, allows semantic matches. Example: `{"filter_type": "EXACT_KEYWORD_MATCH"}`                                                                                                                                                                                              |
| `EXACT_INDUSTRY_MATCH` | boolean           | [Optional] When true, requires exact matches for the INDUSTRY filter and the company's industry. When false, allows semantic matches. Example: `{"filter_type": "EXACT_INDUSTRY_MATCH"}`                                                                                                                                                                             |

- Account Filters:
  - `"COMPANY_HEADCOUNT"`: Specifies the size of the company. Example values: "10,001+", "1,001-5,000". All possible values: `"1-10"`, `"11-50"`, `"51-200"`, `"201-500"`, `"501-1,000"`, `"1,001-5,000"`, `"5,001-10,000"`, `"10,001+"`
  - `"INDUSTRY"`: [Deprecated]
  - `"COMPANY_HQ_COUNTRY"`: Specifies the headquarter country of the company. Example values: ["United States"]. All possible values: [here](https://crustdata-docs-region-json.s3.us-east-2.amazonaws.com/countries.json)
- Lead Filters:
  - Not available

**Note**:

- Atleast one of `TITLE` or `DESCRIPTION` must be present.
- Refer to [Building the Company Search Criteria Filter](/docs/2024-11-01/discover/company-apis/how-to-build-company-filters) for more information about account and lead filters.
- The `EXACT_KEYWORD_MATCH` filter helps control the precision of keyword matching in job titles and descriptions.
- When both `TITLE` and `DESCRIPTION` are provided, `TITLE` is used for searching jobs and description is used only for filter if `EXACT_KEYWORD_MATCH` is present in filters.

</details>

<details id="new-funding-announcements">
<summary>2. New Funding Announcements</summary>

### New Funding Announcement

Tracks new funding announcements for companies.

- Availability: available now
- Slug: `new-funding-announcements`
- Event filters:
  | **Filter type** | **Data type** | **Description** |
  | --- | --- | --- |
  | `FUNDING_ROUND_TYPE` | list | [Optional] Specifies the types of funding rounds to track. To set no filters (track all funding round types), use an empty array. Example values: ["seed", "series_a"]. All possible values: `"pre_seed"`, `"seed"`, `"angel"`, `"series_a"`, `"series_b"`, `"series_c"`, `"series_d"`, `"series_e"`, `"series_f"`, `"series_g"`, `"series_h"`, `"series_i"`, `"series_j"`, `"series_unknown"`, `"private_equity"`, `"debt_financing"`, `"convertible_note"`, `"grant"`, `"corporate_round"`, `"equity_crowdfunding"`, `"product_crowdfunding"`, `"secondary_market"`, `"post_ipo_equity"`, `"post_ipo_debt"`, `"post_ipo_secondary"`, `"non_equity_assistance"`, `"initial_coin_offering"`, `"undisclosed"` |
- Account Filters:
  - `"COMPANY_HEADCOUNT"`: Specifies the size of the company making the funding announcement. Example values: "10,001+", "1,001-5,000". All possible values: `"1-10"`, `"11-50"`, `"51-200"`, `"201-500"`, `"501-1,000"`, `"1,001-5,000"`, `"5,001-10,000"`, `"10,001+"`
  - `"INDUSTRY"`: Specifies the industry of the company. Example values: "Professional Services", "Financial Services". Use [**Filters Autocomplete API**](/docs/2024-11-01/discover/auxiliary-apis/filters-autocomplete) to get valid values.<br/>Full list: [**industry_values**](https://crustdata-docs-region-json.s3.us-east-2.amazonaws.com/industry_values.json)
  - `"COMPANY_HQ_COUNTRY"`: Specifies the headquarter country of the company. Example values: ["United States"]. All possible values: [here](https://crustdata-docs-region-json.s3.us-east-2.amazonaws.com/countries.json)
- Lead Filters:
  - Not available

**Note**: Refer to [Building the Company Search Criteria Filter](/docs/2024-11-01/discover/company-apis/how-to-build-company-filters) for more information about account and lead filters

</details>

<details id="linkedin-post-with-keyword">
<summary>3. LinkedIn Post with Keyword</summary>

### LinkedIn Post with Keyword

Tracks LinkedIn posts that contain specified keywords.

- Availability: available now
- Slug: `linkedin-post-with-keyword`
- Event filters:

| **Filter type**                    | **Data type**      | **Description**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ---------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `KEYWORD`                          | list (max 1 item)  | Specifies the keyword you want to be present in the posts. Supports Boolean search syntax with AND, OR, NOT operators (must be uppercase), parentheses for grouping, and quoted phrases for exact matching. Example values: `["Sales"]`, `["hiring AND finance"]`, `["hiring OR growing"]`, `["hiring AND (finance OR payroll)"]`, `["hiring NOT manager"]`, `["\"product manager\" AND hiring"]`, `["\"software engineer\" AND (hiring OR recruiting) AND (python OR javascript) NOT intern"]` |
| `REACTORS` (optional)              | boolean            | Specifies if you want to fetch reactors for posts. It is a boolean filter. It doesn't require any value or type. Example: `{"filter_type": "REACTORS"}`                                                                                                                                                                                                                                                                                                                                         |
| `DETAILED_REACTOR_DATA` (optional) | boolean            | Specifies if you want to fetch all data about reactors. By defualt reactors don't have employer data, education background and summary                                                                                                                                                                                                                                                                                                                                                          |
| `ACTOR_TYPE` (optional)            | list(max length 2) | Specifies whether to fetch posts from a person or a company. Default is both. Accepted values: `"person"` and `"company"`                                                                                                                                                                                                                                                                                                                                                                       |
| `AUTHOR_TITLE` (optional)          | list               | Fetch posts authored by people whose current job title matches any of the provided values. Eg: `["CEO"]`                                                                                                                                                                                                                                                                                                                                                                                        |
| `AUTHOR_COMPANY` (optional)        | list               | Fetch posts written by people who currently work at the specified companies. You need to provide company's **LinkedinURL** Eg: `["https://www.linkedin.com/company/google/"]`                                                                                                                                                                                                                                                                                                                   |
| `AUTHOR_LOCATION` (optional)       | list (max 1 item)  | Filter posts by the author's location (person or company). Uses geographic matching to find posts from authors in the specified location. Example values: ["United States"]. Use [**Filters Autocomplete API**](/docs/2024-11-01/discover/auxiliary-apis/filters-autocomplete) to get valid values.<br/>Full list: [**region_values**](https://crustdata-docs-region-json.s3.us-east-2.amazonaws.com/updated_regions.json)                                                                      |
| `INDUSTRY`(optional)               | list               | Fetch posts authored by people or companies associated with any of the specified LinkedIn industry categories. Use [**Filters Autocomplete API**](/docs/2024-11-01/discover/auxiliary-apis/filters-autocomplete) to get valid values.<br/>Full list: [**industry_values**](https://crustdata-docs-region-json.s3.us-east-2.amazonaws.com/industry_values.json)                                                                                                                                  |
| `POST_INTENT` (optional)           | list (max 1 item)  | semantic filter on post content only. Use this to include or exclude posts that match the specified prompt. Do not use this filter for conditions related to the person or company posting                                                                                                                                                                                                                                                                                                      |
| `POST_CATEGORY` (optional)         | list               | List of categories to receive or not receive posts. The combined total across both lists must not exceed 10 categories. Example: `["Business", "Personal", "Events", "Social Commentary"]`. If a post doesn't belong to any category, it will be categorized as `Others`.                                                                                                                                                                                                                       |

- Account Filters:
  - `"COMPANY_HEADCOUNT"`: Specifies the size of the company. Example values: "10,001+", "1,001-5,000". All possible values: `"1-10"`, `"11-50"`, `"51-200"`, `"201-500"`, `"501-1,000"`, `"1,001-5,000"`, `"5,001-10,000"`, `"10,001+"`
  - `"COMPANY_HQ_COUNTRY"`: Specifies the headquarter country of the company. Example values: ["United States"]. All possible values: [here](https://crustdata-docs-region-json.s3.us-east-2.amazonaws.com/countries.json)
- Lead Filters:
  - `"PAST_COMPANY"`: Name or domain of the past employer for the person creating the post
  - `"PAST_TITLE"`: Title at any of the past jobs on LinkedIn for the person creating the post
  - `"COMPANY_HQ_COUNTRY"`: Specifies the headquarter country of the current employer of person. Example values: ["United States"]. All possible values: [here](https://crustdata-docs-region-json.s3.us-east-2.amazonaws.com/countries.json)
  - `"COMPANY_HEADCOUNT"`: Specifies the size of the current employer of person. Example values: "10,001+", "1,001-5,000". All possible values: `"1-10"`, `"11-50"`, `"51-200"`, `"201-500"`, `"501-1,000"`, `"1,001-5,000"`, `"5,001-10,000"`, `"10,001+"`

**Note**: Refer to [Building the Company Search Criteria Filter](/docs/2024-11-01/discover/company-apis/how-to-build-company-filters) and [Building the People Search Criteria Filter](/docs/2024-11-01/discover/people-apis/how-to-build-people-filters) for more information about account and lead filters.

**Deprecated Filters**: The lead filters `CURRENT_COMPANY` and `CURRENT_TITLE`, as well as the account filter `INDUSTRY`, have been deprecated as these filters are now available as Event Filters.

</details>

<details id="company-headcount-growth">
<summary>4. Company Headcount Increased by Percent</summary>

### Company Headcount Increased by Percent

Tracks when a company's headcount increases by a specified percentage over one year.

- Availability: available now
- Slug: `company-headcount-growth`
- Event filters:

| **Filter type**             | **Data type**     | **Description**                                                                                                                                                                                                                                                                                                                   |
| --------------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `COMPANY_HEADCOUNT_GROWTH`  | dict              | Specifies YoY headcount growth of the company. Example: `{"min": 10, "max": 40}`                                                                                                                                                                                                                                                  |
| `INDUSTRY`                  | list (max 1 item) | Specifies the industry of the company. Example values: ["Professional Services"]. Use [**Filters Autocomplete API**](/docs/2024-11-01/discover/auxiliary-apis/filters-autocomplete) to get valid values.<br/>Full list: [**industry_values**](https://crustdata-docs-region-json.s3.us-east-2.amazonaws.com/industry_values.json) |
| `REGION`                    | list (max 1 item) | Specifies the headquarters location of the company. Example values: ["Bangladesh"]. Use [**Filters Autocomplete API**](/docs/2024-11-01/discover/auxiliary-apis/filters-autocomplete) to get valid values.<br/>Full list: [**region_values**](https://crustdata-docs-region-json.s3.us-east-2.amazonaws.com/updated_regions.json) |
| `COMPANY_HEADCOUNT`         | list (max 1 item) | Specifies the current headcount range company. Example values: [`"1-10"`]. Valid Value from full list: `"1-10"`, `"11-50"`, `"51-200"`, `"201-500"`, `"501-1,000"`, `"1,001-5,000"`, `"5,001-10,000"`, `"10,001+"`                                                                                                                |
| `ANNUAL_REVENUE` (optional) | dict              | Specifies the company’s annual revenue. Example: `{"filter_type":"ANNUAL_REVENUE","type":"between","value":{"min":1000,"max":10000},"sub_filter":"USD"}`. It must contain min and max value and sub_filter of USD is only supported                                                                                               |

- Account Filters:
  - `"COMPANY_HEADCOUNT"`: [Deprecated]
  - `"INDUSTRY"`: [Deprecated]
  - `"COMPANY_HQ_COUNTRY"`: [Deprecated]
  - Use only event filters.

</details>

<details id="someone-starts-a-new-job">
<summary>5. Someone Starts a New Job</summary>

### Someone Starts a New Job

Tracks when a person starts a new job or position

- Availability: available now
- Slug: `person-starting-new-position`
- Event filters:

| **Filter type**                    | **Data type**     | **Description**                                                                                                                                                                                                                                                                                                                              |
| ---------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `INDUSTRY`                         | list (max 1 item) | Specifies the industry in which the person works. Example values: ["Professional Services"]. Use [**Filters Autocomplete API**](/docs/2024-11-01/discover/auxiliary-apis/filters-autocomplete) to get valid values.<br/>Full list: [**industry_values**](https://crustdata-docs-region-json.s3.us-east-2.amazonaws.com/industry_values.json) |
| `REACTORS` (optional)              | boolean           | Specifies if you want to fetch reactors for posts. It is a boolean filter. It doesn't require any value or type. Example: `{"filter_type": "REACTORS"}`                                                                                                                                                                                      |
| `DETAILED_REACTOR_DATA` (optional) | boolean           | Specifies if you want to fetch all data about reactors. By defualt reactors don't have employer data, education background and summary                                                                                                                                                                                                       |
| `AUTHOR_TITLE` (optional)          | list              | Fetch posts authored by people whose current job title matches any of the provided values. Eg: `["CEO"]`                                                                                                                                                                                                                                     |
| `AUTHOR_COMPANY` (optional)        | list              | Fetch posts written by people who currently work at the specified companies. You need to provide company's **LinkedinURL** Eg: `["https://www.linkedin.com/company/google/"]`                                                                                                                                                                |

- Lead Filters:
  - `"CURRENT_COMPANY"` [Deprecated]
  - `"PAST_COMPANY"`: Name or domain of the past employer for the person creating the post
  - `"CURRENT_TITLE"`: [Deprecated]
  - `"PAST_TITLE"`: Title at any of the past jobs on LinkedIn for the person creating the post
  - `"COMPANY_HQ_COUNTRY"`: Specifies the headquarter country of the current employer of person. Example values: ["United States"]. All possible values: [here](https://crustdata-docs-region-json.s3.us-east-2.amazonaws.com/countries.json)
  - `"COMPANY_HEADCOUNT"`: Specifies the size of the current employer of person. Example values: "10,001+", "1,001-5,000". All possible values: `"1-10"`, `"11-50"`, `"51-200"`, `"201-500"`, `"501-1,000"`, `"1,001-5,000"`, `"5,001-10,000"`, `"10,001+"`
- Account Filters:
  - Not available

**Note**: Refer to [Building the People Search Criteria Filter](/docs/2024-11-01/discover/people-apis/how-to-build-people-filters) for more information about account and lead filters

</details>

<details id="job-posting-with-location">
<summary>6. Job Posting in Location</summary>

### Job Posting in Location

Tracks job postings that contain certain keywords in the title or description and are posted in a specific location.

- Availability: available now
- Slug: `job-posting-with-location`
- Event filters:

| **Filter type** | **Data type**     | **Description**                                                                                                                                                                                                                                                                                                                                                      |
| --------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `REGION`        | list (max 1 item) | Specifies the location for the job posting. Example values: ["United States"]. Use [**Filters Autocomplete API**](/docs/2024-11-01/discover/auxiliary-apis/filters-autocomplete) to get valid values.<br/>Full list: [**region_values**](https://crustdata-docs-region-json.s3.us-east-2.amazonaws.com/updated_regions.json)                                         |
| `INDUSTRY`      | list              | [Optional] Specifies the industry of the company. Example values: ["Professional Services"], ["Financial Services"]. Use [**Filters Autocomplete API**](/docs/2024-11-01/discover/auxiliary-apis/filters-autocomplete) to get valid values.<br/>Full list: [**industry_values**](https://crustdata-docs-region-json.s3.us-east-2.amazonaws.com/industry_values.json) |

- Account Filters:
  - `"COMPANY_HEADCOUNT"`: Specifies the size of the company. Example values: "10,001+", "1,001-5,000". All possible values: `"1-10"`, `"11-50"`, `"51-200"`, `"201-500"`, `"501-1,000"`, `"1,001-5,000"`, `"5,001-10,000"`, `"10,001+"`
  - `"INDUSTRY"`: [Deprecated]
  - `"COMPANY_HQ_COUNTRY"`: Specifies the headquarter country of the company. Example values: ["United States"]. All possible values: [here](https://crustdata-docs-region-json.s3.us-east-2.amazonaws.com/countries.json)
- Lead Filters:
  - Not available

**Note**: Refer to [Building the Company Search Criteria Filter](/docs/2024-11-01/discover/company-apis/how-to-build-company-filters) for more information about account and lead filters.

</details>

<details id="company-department-headcount-in-range">
<summary>7. Company Department Headcount in Range</summary>

### Company Department Headcount in Range

Tracks headcount of a specific department of company.

- Slug: `company-department-headcount`
- Event filters:

  | **Filter type**                | **Data type**     | **Description**                                                                                                                                                                                                                                                                                                                                   |
  | ------------------------------ | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `DEPARTMENT_HEADCOUNT`         | dict              | Specifies min and max values for department headcount. `sub_filter` contains department of company. All possible values for `sub_filter`: [Click here](/examples/watcher/company-department-values.json). Example: `{ "filter_type": "DEPARTMENT_HEADCOUNT", "type": "between", "value": {"min": "10", "max": "25"}, "sub_filter": "Consulting"}` |
  | `INDUSTRY`                     | list (max 1 item) | Specifies the industry of the company. Example values: ["Professional Services"]. Use [**Filters Autocomplete API**](/docs/2024-11-01/discover/auxiliary-apis/filters-autocomplete) to get valid values.<br/>Full list: [**industry_values**](https://crustdata-docs-region-json.s3.us-east-2.amazonaws.com/industry_values.json)                 |
  | `REGION`                       | list (max 1 item) | Specifies the headquarters location of the company. Example values: ["United States"], ["India"]. Use [**Filters Autocomplete API**](/docs/2024-11-01/discover/auxiliary-apis/filters-autocomplete) to get valid values.<br/>Full list: [**region_values**](https://crustdata-docs-region-json.s3.us-east-2.amazonaws.com/updated_regions.json)   |
  | `COMPANY_HEADCOUNT` (optional) | list (max 1 item) | Specifies the current headcount range company. Example values: [`"1-10"`]. Valid Value from full list: [`"1-10"`, `"11-50"`, `"51-200"`, `"201-500"`, `"501-1,000"`, `"1,001-5,000"`, `"5,001-10,000"`, `"10,001+"`]                                                                                                                              |
  | `ANNUAL_REVENUE` (optional)    | dict              | Specifies the company’s annual revenue. Example: `{"filter_type":"ANNUAL_REVENUE","type":"between","value":{"min":1000,"max":10000},"sub_filter":"USD"}`. It must contain min and max value and sub_filter of USD is only supported                                                                                                               |

- Account Filters:
  - Not available.
- Lead Filters:
  - Not available

</details>

<details id="first-person-hired-in-company-department">
<summary>8. First Person Hired in Company Department</summary>

### First Person Hired in Company Department

Tracks companies where first person in hired in X department.

- Slug: `first-person-hired-in-company-department`
- Event filters:

  | **Filter type**             | **Data type**     | **Description**                                                                                                                                                                                                                                                                                                                      |
  | --------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
  | `COMPANY_DEPARTMENT`        | list (max 1 item) | Specifies department of the company. Example values: ["Consulting"]. All possible values: [Click here](/examples/watcher/company-department-values.json)                                                                                                                                                                             |
  | `INDUSTRY`                  | list (max 1 item) | Specifies the industry of the company. Example values: ["Financial Service"]. Use [**Filters Autocomplete API**](/docs/2024-11-01/discover/auxiliary-apis/filters-autocomplete) to get valid values.<br/>Full list: [**industry_values**](https://crustdata-docs-region-json.s3.us-east-2.amazonaws.com/industry_values.json)        |
  | `REGION`                    | list (max 1 item) | Specifies the headquarters location of the company. Example values: ["United States"]. Use [**Filters Autocomplete API**](/docs/2024-11-01/discover/auxiliary-apis/filters-autocomplete) to get valid values.<br/>Full list: [**region_values**](https://crustdata-docs-region-json.s3.us-east-2.amazonaws.com/updated_regions.json) |
  | `COMPANY_HEADCOUNT`         | list (max 1 item) | Specifies the current headcount range company. Example values: [`"1-10"`]. Valid Value from full list: `"1-10"`, `"11-50"`, `"51-200"`, `"201-500"`, `"501-1,000"`, `"1,001-5,000"`, `"5,001-10,000"`, `"10,001+"`                                                                                                                   |
  | `ANNUAL_REVENUE` (optional) | dict              | Specifies the company’s annual revenue. Example: `{"filter_type":"ANNUAL_REVENUE","type":"between","value":{"min":1000,"max":10000},"sub_filter":"USD"}`. It must contain min and max value and sub_filter of USD is only supported                                                                                                  |

- Account Filters:
  - Not available.
- Lead Filters:
  - Not available

:::info
**Note:** This watch can track a maximum of **1000 companies**. If your search exceeds this limit, the watch **won't be created**. Use **optional** **event** **filters** or adjust the **region** to refine your results.
You can use [**Company Search API**](/docs/2024-11-01/discover/company-apis/company-search-api) to get the count of companies that match your criteria. Each search costs 25 credits.
:::

</details>

<details id="first-person-hired-internationally">
<summary>9. First Person Hired Internationally</summary>

### First Person Hired Internationally

Tracks companies where first person in hired internationally.

- Slug: `first-person-hired-internationally`
- Event filters:

  | **Filter type**            | **Data type**     | **Description**                                                                                                                                                                                                                                                                                                                                 |
  | -------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `INDUSTRY`                 | list (max 1 item) | Specifies the industry of the company. Example values: ["Professional Services"]. Use [**Filters Autocomplete API**](/docs/2024-11-01/discover/auxiliary-apis/filters-autocomplete) to get valid values.<br/>Full list: [**industry_values**](https://crustdata-docs-region-json.s3.us-east-2.amazonaws.com/industry_values.json)               |
  | `REGION`                   | list (max 1 item) | Specifies the headquarters location of the company. Example values: ["United States"], ["India"]. Use [**Filters Autocomplete API**](/docs/2024-11-01/discover/auxiliary-apis/filters-autocomplete) to get valid values.<br/>Full list: [**region_values**](https://crustdata-docs-region-json.s3.us-east-2.amazonaws.com/updated_regions.json) |
  | `COMPANY_HEADCOUNT`        | list (max 1 item) | Specifies the current headcount range company. Example values: [`"1-10"`]. Valid Value from full list: `"1-10"`, `"11-50"`, `"51-200"`, `"201-500"`, `"501-1,000"`, `"1,001-5,000"`, `"5,001-10,000"`, `"10,001+"`                                                                                                                              |
  | `ANNUAL_REVENUE`(optional) | dict              | Specifies the company’s annual revenue. Example: `{"filter_type":"ANNUAL_REVENUE","type":"between","value":{"min":1000,"max":10000},"sub_filter":"USD"}`. It must contain min and max value and sub_filter of USD is only supported                                                                                                             |

- Account Filters:
  - Not available. Use Optional event filters to filter accounts with specific criteria
- Lead Filters:
  - Not available

</details>

<details id="company-employee-job-location-in-two-countries">
<summary>10. Company Employee Job Location in Two Countries</summary>

### Company Employee Job Location in Two Countries

Tracks companies where employee job location in two countries.

- Slug: `company-employee-job-location-in-two-countries`
- Event filters:

  | **Filter type**             | **Data type**     | **Description**                                                                                                                                                                                                                                                                                                                                 |
  | --------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `INDUSTRY`                  | list (max 1 item) | Specifies the industry of the company. Example values: ["Professional Services"]. Use [**Filters Autocomplete API**](/docs/2024-11-01/discover/auxiliary-apis/filters-autocomplete) to get valid values.<br/>Full list: [**industry_values**](https://crustdata-docs-region-json.s3.us-east-2.amazonaws.com/industry_values.json)               |
  | `REGION`                    | list (max 1 item) | Specifies the headquarters location of the company. Example values: ["United States"], ["India"]. Use [**Filters Autocomplete API**](/docs/2024-11-01/discover/auxiliary-apis/filters-autocomplete) to get valid values.<br/>Full list: [**region_values**](https://crustdata-docs-region-json.s3.us-east-2.amazonaws.com/updated_regions.json) |
  | `COMPANY_HEADCOUNT`         | list (max 1 item) | Specifies the current headcount range company. Example values: [`"1-10"`]. Valid Value from full list: `"1-10"`, `"11-50"`, `"51-200"`, `"201-500"`, `"501-1,000"`, `"1,001-5,000"`, `"5,001-10,000"`, `"10,001+"`                                                                                                                              |
  | `ANNUAL_REVENUE` (optional) | dict              | Specifies the company’s annual revenue. Example: `{"filter_type":"ANNUAL_REVENUE","type":"between","value":{"min":1000,"max":10000},"sub_filter":"USD"}`. It must contain min and max value and sub_filter of USD is only supported                                                                                                             |
  - Optional Event filters: These filters can be used to put other filters to narrow your search universe.

- Account Filters:
  - Not available.
- Lead Filters:
  - Not available

</details>

<details id="company-headcount-growth-over-baseline">
<summary>11. Company Headcount Growth Over Baseline</summary>

### Company Headcount Growth Over Baseline

Tracks companies where headcount growth over baseline.

- Slug: `company-headcount-growth-over-baseline`
- Event filters:

  | **Filter type**                          | **Data type**            | **Description**                                                                                                                                                                                                                                                                                                                                  |
  | ---------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
  | `REGION`                                 | list (max 1 item)        | Specifies the headquarters location of the company. Example values: ["California, United States"]. Use [**Filters Autocomplete API**](/docs/2024-11-01/discover/auxiliary-apis/filters-autocomplete) to get valid values.<br/>Full list: [**region_values**](https://crustdata-docs-region-json.s3.us-east-2.amazonaws.com/updated_regions.json) |
  | `TIMEFRAME`                              | list (max 1 item)        | Specifies the time interval for measuring growth. Example values: ["YoY"]. All possible values: ["MoM", "QoQ", "6M", "YoY", "2Y"]                                                                                                                                                                                                                |
  | `INDUSTRY`                               | list (max 1 item)        | Specifies the industry of the company. Example values: ["Software Development"]. Use [**Filters Autocomplete API**](/docs/2024-11-01/discover/auxiliary-apis/filters-autocomplete) to get valid values.<br/>Full list: [**industry_values**](https://crustdata-docs-region-json.s3.us-east-2.amazonaws.com/industry_values.json)                 |
  | `BASELINE_HEADCOUNT`                     | list of int (max 1 item) | Specifies the historical headcount value from which to measure growth. Example values: [8644]                                                                                                                                                                                                                                                    |
  | `COMPANY_HEADCOUNT_GROWTH_FROM_BASELINE` | list of int (max 1 item) | Specifies the percentage growth threshold from the baseline headcount. Example values: [10]                                                                                                                                                                                                                                                      |
  | `ANNUAL_REVENUE` (optional)              | dict                     | Specifies the company’s annual revenue. Example: `{"filter_type":"ANNUAL_REVENUE","type":"between","value":{"min":1000,"max":10000},"sub_filter":"USD"}`. It must contain min and max value and sub_filter of USD is only supported                                                                                                              |

- Account Filters:
  - Not available.
- Lead Filters:
  - Not available

</details>

<details id="person-discovery-via-filters">
<summary>12. Person Discovery via Filters</summary>

### Person Discovery via Filters

Tracks new people profiles that meet specific LinkedIn filter criteria.

- Slug: `person-discovery-via-filters`
- Event filters:
  - Primary Event Filters: There are no required filters that must have values for this watcher, but you must specify at least one filter.
  - Optional Event filters: These filters can be used to specify your search universe.
    - Example: You can use `REGION` to track people in specific geographical locations.
    - Refer to [Building the People Search Criteria Filter](/docs/2024-11-01/discover/people-apis/how-to-build-people-filters) to know more about available filters.
- Account Filters:
  - Not available.
- Lead Filters:
  - Not available. Use event filters to filter people with specific criteria

:::info
**Note:** This watch can track a maximum of **10,000 people**. If your search exceeds this limit, the watch **won't be created**. Use **optional** **event** **filters** or adjust the **region** to refine your results.
You can use [**People Search API**](/docs/2024-11-01/discover/people-apis/people-search-api) to get the count of people that match your criteria.
:::

</details>

## Example Requests

### 1. **Creating watch for job postings with a specific keyword at a specific location**

<Tabs>
  <TabItem value="request" label="Request" default>
    ```bash
        curl 'https://api.crustdata.com/watcher/watches' \
        --header 'Content-Type: application/json' \
        --header 'Accept: application/json, text/plain, */*' \
        --header 'Authorization: Token $auth_token' \
        --data-raw '{
            "event_type_slug": "job-posting-with-keyword-and-location",
            "event_filters": [
                {"filter_type": "REGION", "type": "in", "value": ["United States"]},
                {"filter_type": "TITLE", "type": "in", "value": ["Software Engineer"]},
                {"filter_type": "DESCRIPTION", "type": "in", "value": ["Backend Developer"]},
                {"filter_type": "INDUSTRY", "type": "in", "value": ["Professional Services", "Financial Services"]},
                {"filter_type": "EXACT_KEYWORD_MATCH"}
            ],
            "account_filters": [
                {"filter_type": "COMPANY_HEADCOUNT", "type": "in", "value": ["10,001+", "1,001-5,000"]},
            ],
            "notification_endpoint": "http://localhost:5000/notify",
            "frequency": 1,
            "expiration_date": "2025-01-01",
            "approximate_notification_time": 4
        }'
        ```
  </TabItem>

   <TabItem value="notification_message" label="Notification message" default>
    ```json
        [
          {
            "uid": "jobposting_linkedin_80c9b4cb7bf5823e9a0e9a400c5c20fa5a1c91c3f692c94a4da0374959832e89",
            "url": "https://www.linkedin.com/jobs/view/4208331601",
            "title": "Senior Software Engineer, Research",
            "domain": "www.linkedin.com",
            "category": "Engineering",
            "country_id": "US",
            "date_added": "2025-04-16T21:18:45+00:00",
            "description": "Circle is a fin ...",
            "company_name": "Circle",
            "company_size": "501-1000",
            "date_updated": "2025-05-13T00:00:00+00:00",
            "reposted_job": true,
            "location_text": "Greater Boston",
            "company_domain": "circle.com",
            "workplace_type": "Remote",
            "company_linkedin_id": "3509899",
            "linkedin_industries": [
                "Financial Services"
            ],
            "company_linkedin_url": "https://www.linkedin.com/company/circle-internet-financial",
            "crustdata_company_id": 629290,
            "crunchbase_categories": [
                "Banking",
                "Financial Services",
                "FinTech",
                "Apps",
                "Content Creators",
                "Communities",
                "Blockchain",
                "Cryptocurrency",
                "Content"
            ],
            "linkedin_specialities": [
                "blockchain",
                "digital currency",
                "crypto",
                "fintech",
                "consumer finance",
                "stablecoins"
            ]
        }
        ]
        ```
  </TabItem>
  </Tabs>

### 2. **Creating watch for funding announcements for companies meeting a criteria**

<Tabs>
  <TabItem  value="request" label="Request" default>
    ```bash
        curl 'https://api.crustdata.com/watcher/watches/' \
        --header 'Content-Type: application/json' \
        --header 'Authorization: Token $token' \
        --data '{
            "event_type_slug": "new-funding-announcements",
            "event_filters": [
                {"filter_type": "FUNDING_ROUND_TYPE", "type": "in", "value": ["seed", "series_a"]}
            ],
            "account_filters": [
                {
                    "filter_type": "COMPANY_HEADCOUNT",
                    "type": "in",
                    "value": [
                        "1-10", "11-50", "51-200", "201-500", "501-1,000", "1,001-5,000", "10,001+"]
                }
            ],
            "notification_endpoint": "http://localhost:5000/notify",
            "frequency": 1,
            "expiration_date": "2025-01-01",
            "approximate_notification_time": 4
        }'
        ```
  </TabItem>

  <TabItem  value="request_all_types" label="Request (All Funding Types)">
    ```bash
        curl 'https://api.crustdata.com/watcher/watches/' \
        --header 'Content-Type: application/json' \
        --header 'Authorization: Token $token' \
        --data '{
            "event_type_slug": "new-funding-announcements",
            "event_filters": [],
            "account_filters": [
                {
                    "filter_type": "COMPANY_HEADCOUNT",
                    "type": "in",
                    "value": [
                        "1-10", "11-50", "51-200", "201-500", "501-1,000", "1,001-5,000", "10,001+"]
                }
            ],
            "notification_endpoint": "http://localhost:5000/notify",
            "frequency": 1,
            "expiration_date": "2025-01-01",
            "approximate_notification_time": 4
        }'
        ```
  </TabItem>

   <TabItem value="notification_message" label="Notification message" default>
    - Notification message:

        ```bash
        {
            "uid": "funding_announcement_e14ed906b19e6ff0b34eed820e1a1f2d8be77a6da988fd74ff79d4db5cbaadfa",
            "investors": [
                {
                "name": "Polygon Labs",
                "uuid": "bbd83f03-1945-47fe-8233-667f20ab3af8",
                "investor_type": "lead",
                "crunchbase_investor_url": "https://www.crunchbase.com/organization/polygon-labs"
                }
            ],
            "round_name": "Grant - Folks Finance",
            "announced_on": "2025-06-03",
            "company_name": "Folks Finance",
            "company_size": "11-50",
            "money_raised": {
                "value": 300000,
                "currency": "USD",
                "value_usd": 300000
            },
            "company_website": "https://folks.finance/",
            "investment_type": "grant",
            "company_linkedin_id": "78074359",
            "linkedin_industries": [
                "Computer Software",
                "Financial Services",
                "Software Development"
            ],
            "company_linkedin_url": "https://www.linkedin.com/company/folksfinance",
            "crustdata_company_id": 676422,
            "crunchbase_categories": [
                "Software",
                "Financial Services",
                "FinTech",
                "Blockchain",
                "Cryptocurrency"
            ],
            "linkedin_specialities": [
                "Blockchain",
                "DeFi",
                "Crypto",
                "Crosschain",
                "Trading",
                "Lending",
                "Borrowing",
                "Staking"
            ],
            "crunchbase_company_url": "https://www.crunchbase.com/organization/folks-finance",
            "crunchbase_company_uuid": "828b6289-8986-48e0-8439-8620bdd0cc3b"
        }
        ```

  </TabItem>
</Tabs>

### 3. **Creating watch for LinkedIn posts with specific keywords**

<Tabs>
  <TabItem value="request" label="Request" default>
    ```bash
        curl 'https://api.crustdata.com/watcher/watches' \
        --header 'Content-Type: application/json' \
        --header 'Accept: application/json, text/plain, */*' \
        --header 'Accept-Language: en-US,en;q=0.9' \
        --header 'Authorization: Token $token' \
        --data '{
                    "event_type_slug": "linkedin-post-with-keyword",
                    "event_filters": [
                        {"filter_type": "KEYWORD", "type": "in", "value": ["job at hubspot"]},
                        {
                            "filter_type": "POST_INTENT",
                            "type": "in",
                            "value": [
                                "Posts about companies that are hiring or recruiting for finance, accounting, payroll, or financial operations roles. Include posts mentioning job openings for CFO, Accountant, Payroll Specialist, FP&A, or similar finance positions."
                            ]
                        }
                    ],
                    "account_filters": [
                                    {
                                        "filter_type": "COMPANY_HEADCOUNT",
                                        "type": "in",
                                        "value": ["10,001+", "1,001-5,000", "5,001-10,000", "1-10", "11-50", "51-200"]
                                    }
                    ],
                    "notification_endpoint" : "https://webhook.site/63895bf0-2c30-4b3e-be5a-36d32b9cc4bd",
                    "frequency" : 1,
                    "expiration_date": "2025-01-01",
                    "approximate_notification_time": 4,
                    "max_notifications_per_execution": 50
                    }'
        ```
  </TabItem>

   <TabItem value="notification_message" label="Notification message" default>
    - Notification message:

        ```bash
        [
            {
                "uid": "post_linkedin_7254566222799777792",
                "text": "As sponsors of this year's DORA report, we're excited to announce the 2024 report has been released! Packed with research and insights, this report explores the key factors shaping the future of software development.\n\nStay tuned over the next couple weeks for more in-depth insights from our page and the Liatrio team about what the findings mean for enterprises and how we're implementing them with clients.\n\nDownload it today 👉  https://lnkd.in/gM5r2SmD\n\n#DORA #SoftwareDevelopment #TechTrends #AI #DevEx #PlatformEngineering #hubspot jobs",
                "share_url": "https://www.linkedin.com/posts/liatrio_dora-softwaredevelopment-techtrends-activity-7254566222799777792-F3ky?utm_source=combined_share_message&utm_medium=member_desktop_web",
                "share_urn": "urn:li:share:7254566221646307329",
                "actor_name": "Liatrio",
                "actor_type": "company",
                "hyperlinks": {
                    "other_urls": [],
                    "person_linkedin_urls": [],
                    "company_linkedin_urls": []
                },
                "num_shares": 0,
                "backend_urn": "urn:li:activity:7254566222799777792",
                "date_posted": "2024-10-22",
                "company_name": "Liatrio",
                "company_domain": null,
                "total_comments": 0,
                "total_reactions": 0,
                "reactions_by_type": {},
                "company_linkedin_id": "3719674",
                "company_linkedin_url": "https://www.linkedin.com/company/liatrio"
            },
            {
            "uid": "post_linkedin_e442be60d2d3c1f30bef610576e1c20cd799bfd12ef9693ded7fd985a103313a",
            "text": "AP Reconciliation: Basic But the Ba...",
            "share_url": "https://www.linkedin.com/posts/suman-17684014a_accounting-accountspayable-reconciliation-activity-7355832327597379584-vTuY?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAAE1dkwQBrW7Rv8h84_SOnhpqwD89WcgQq1I",
            "share_urn": "urn:li:share:7355832326901129216",
            "actor_name": "Suman .",
            "actor_type": "person",
            "hyperlinks": {
                "other_urls": [],
                "person_linkedin_urls": [],
                "company_linkedin_urls": []
            },
            "num_shares": 1,
            "backend_urn": "urn:li:activity:7355832327597379584",
            "date_posted": "2025-07-29",
            "person_name": "Suman .",
            "person_title": "associate",
            "total_comments": 0,
            "person_location": "Delhi, India",
            "total_reactions": 3,
            "current_employers": [
                {
                    "end_date": null,
                    "start_date": "2024-05-01T00:00:00+00:00",
                    "employer_name": "Blyvon",
                    "employee_title": "associate",
                    "employee_location": "Gurugram, Haryana, India",
                    "employer_company_id": [
                        8086810
                    ],
                    "employee_description": "Blyvon is full service accountancy firm delivering the complete range of accounting and tax compliance services, combined with strategic commercial thinking. We are headquartered out of India with a global reach through our network.",
                    "employer_linkedin_id": "100541954"
                }
            ],
            "reactions_by_type": {
                "LIKE": 3
            },
            "person_linkedin_urn": "ACoAACQTROoBEIl9kvdTxSp22ySg0ipY_rkV8WU",
            "is_repost_without_thoughts": false,
            "person_linkedin_flagship_profile_url": "https://www.linkedin.com/in/suman-17684014a"
        }
        ]
        ```

  </TabItem>
</Tabs>

### 4. **Creating watch for LinkedIn posts with specific keywords and reactors**

<Tabs>
  <TabItem value="request" label="Request" default>
    ```bash
    curl --location 'https://api.crustdata.com/watcher/watches' \
    --header 'Content-Type: application/json' \
    --header 'Accept: application/json, text/plain, */*' \
    --header 'Accept-Language: en-US,en;q=0.9' \
    --header 'Authorization: Token auth_token' \
    --data '{
      "event_type_slug": "linkedin-post-with-keyword",
      "event_filters": [
        { "filter_type": "KEYWORD", "type": "in", "value": ["job"] },
        { "filter_type": "REACTORS"},
        { "filter_type": "DETAILED_REACTOR_DATA" },
        { "filter_type": "ACTOR_TYPE", "type": "in", "value": ["person"]},
        { "filter_type": "AUTOR_TITLE", "type": "in", "value": ["CEO"]}
      ],
      "account_filters": [
        {
          "filter_type": "COMPANY_HEADCOUNT",
          "type": "in",
          "value": ["10,001+", "1,001-5,000", "5,001-10,000", "1-10", "11-50", "51-200"]
        }
      ],
      "notification_endpoint": "https://webhook.site/77bc08d3-42f2-4830-a91e-f26ad7cd9ded",
      "frequency": 1,
      "expiration_date": "2025-06-16",
      "approximate_notification_time": 4
    }'
    ```
  </TabItem>

  <TabItem value="notification_message" label="Notification message" default>
    ```json
    [
      {
        "uid": "post_linkedin_1852412e620f6ee04e98735e6dd26248cbb001ca86ebe73a96ce9ba41e63ac02",
        "text": "I sadly wasn't tagged in ...",
        "reactors": [
          {
            "name": "Mike Hays",
            "title": "\u200bGhostwriter helping leaders achieve 70% opt-ins with a Microstory Journey\u2014a 5-day storytelling experience using the 3-Minute Story Blueprint to build trust and convert hesitant prospects into eager customers.",
            "emails": [],
            "skills": [
              "Sales Enablement Copywriting Specialist Certification"
            ],
            "pronoun": null,
            "summary": "Most businesses struggle to convert leads because....",
            "employer": [
              {
                "title": "B2B/B2C Copywriter/Ghostwriter - Lead Generation Specialist",
                "end_date": null,
                "location": "Reno, Nevada, United States",
                "rich_media": [],
                "start_date": "2014-02-01T00:00:00",
                "description": "B2B/B2C Copy ...",
                "position_id": 2214102037,
                "company_name": "Hays & Associates, Inc.",
                "company_logo_url": "https://media.licdn.com/dms/image/v2/D560BAQHh_3M6YsBksw/company-logo_400_400/B56ZWMX9HlGQAc-/0/1741816845072?e=1752710400&v=beta&t=raaA1yESisMYV3rz1UqPsJNDRQg3uDEvLBpOr4aF3jY",
                "company_linkedin_id": "106385603"
              }
            ],
            "headline": "\u200bGhostwriter helping leaders achieve 70% opt-ins with a Microstory Journey\u2014a 5-day storytelling experience using the 3-Minute Story Blueprint to build trust and convert hesitant prospects into eager customers.",
            "location": "Reno, Nevada, United States",
            "websites": [],
            "languages": [],
            "current_title": "B2B/B2C Copywriter/Ghostwriter - Lead Generation Specialist",
            "reaction_type": "LIKE",
            "twitter_handle": null,
            "additional_info": "3rd+",
            "profile_image_url": "https://media.licdn.com/dms/image/v2/D5603AQGkiuh62TiDNw/profile-displayphoto-shrink_200_200/B56ZQbT_FmH0AY-/0/1735625011855?e=1752710400&v=beta&t=E6sNvqlDv_jasaDn7lB6Pqb40DkJ9-2CwJv2I-Q2HTA",
            "num_of_connections": 4070,
            "profile_picture_url": "https://media.licdn.com/dms/image/v2/D5603AQGkiuh62TiDNw/profile-displayphoto-shrink_400_400/B56ZQbT_FmH0Ag-/0/1735625011855?e=1752710400&v=beta&t=eZtdffNiP5Lxsv7tGOGC6VAONl5MQT7Bg3WlLxzOIiM",
            "education_background": [
              {
                "end_date": null,
                "start_date": null,
                "degree_name": "Circulation Technology",
                "field_of_study": "Perfusion",
                "institute_name": "The Ohio State University",
                "institute_logo_url": "https://media.licdn.com/dms/image/v2/C4E0BAQEw433uw5btkQ/company-logo_400_400/company-logo_400_400/0/1631327096366?e=1752710400&v=beta&t=NgwOnwwb7zKq4Vlb9agn4l8sAunUSKpCU0nADu81yJE",
                "institute_linkedin_id": "3173",
                "institute_linkedin_url": "https://www.linkedin.com/school/3173/"
              }
            ],
            "flagship_profile_url": "https://www.linkedin.com/in/mikehaysmarketing",
            "linkedin_profile_url": "https://www.linkedin.com/in/ACwAAALEyE4BLYz9WuxbnszcQArdCQZfnIc9J-0",
            "linkedin_profile_urn": "ACwAAALEyE4BLYz9WuxbnszcQArdCQZfnIc9J-0",
            "linkedin_slug_or_urns": [
              "ACoAAALEyE4BKgx9dOwUkU7LkYJvben2xGNk1FE",
              "mikehaysmarketing",
              "ACwAAALEyE4BLYz9WuxbnszcQArdCQZfnIc9J-0"
            ],
            "default_position_title": "B2B/B2C Copywriter/Ghostwriter - Lead Generation Specialist",
            "query_person_linkedin_urn": "ACoAAALEyE4BKgx9dOwUkU7LkYJvben2xGNk1FE",
            "related_colleague_company_id": null,
            "default_position_is_decision_maker": false,
            "default_position_company_linkedin_id": "106385603"
          }
        ],
        "share_url": "https://www.linkedin.com/posts/ryanwilliamcollins_universities-do-little-to-support-phds-who-activity-7328889511919136768-AKW1?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAACyejkUBXm-2gd9SLezQ3EduxVPuZQM8X30",
        "share_urn": "urn:li:share:7328889510849642496",
        "actor_name": "Ryan Collins, PhD",
        "actor_type": "person",
        "hyperlinks": {
          "other_urls": [],
          "person_linkedin_urls": [],
          "company_linkedin_urls": []
        },
        "num_shares": 1,
        "backend_urn": "urn:li:activity:7328889511919136768",
        "date_posted": "2025-05-15",
        "person_name": "Ryan Collins, PhD",
        "person_title": "SEO Strategist ",
        "total_comments": 0,
        "person_location": "San Antonio, Texas, United States",
        "total_reactions": 1,
        "current_employers": [
          {
            "end_date": null,
            "start_date": "2021-12-01T00:00:00+00:00",
            "employer_name": "AfterYourPhD",
            "employee_title": "Founder ",
            "employee_location": null,
            "employer_company_id": [
              4688895
            ],
            "employee_description": "After Your PhD is a free resource for academics exploring careers outside academia. I share job-searching resources and educate PhDs and academics how to transition into fulfilling carers. Monetizing efforts include affiliate marketing and referral marketing. \nI manage the following social media accounts: \n- After Your PhD (LinkedIn) - 4800+ followers\n- After Your PhD (Twitter/X) - 300+ Followers \n- After Your PhD (Tiktok) - 100+ followers\n- After Your PhD (Facebook) - New - 10 Followers",
            "employer_linkedin_id": "80388694"
          }
        ],
        "reactions_by_type": {},
        "person_linkedin_urn": "ACoAAA3gqykBYNMRhWgdOfRQwgELC7Tm7IQoo8I",
        "is_repost_without_thoughts": false,
        "person_linkedin_flagship_profile_url": "https://www.linkedin.com/in/ryanwilliamcollins"
      }
    ]
    ```
  </TabItem>
</Tabs>

### 5. **Creating watch for companies experiencing x% YoY headcount growth increase**

<Tabs>
  <TabItem value="request" label="Request" default>
    ```bash
        curl 'http://api.crustdata.com/watcher/watches' \
        --header 'Content-Type: application/json' \
        --header 'Accept: application/json, text/plain, */*' \
        --header 'Accept-Language: en-US,en;q=0.9' \
        --header 'Authorization: Token $TOKEN' \
        --data '{
            "event_type_slug": "company-headcount-growth",
            "event_filters": [
                {"filter_type": "COMPANY_HEADCOUNT_GROWTH", "type": "between", "value": {"min": 10, "max": 40}},
                {"filter_type": "INDUSTRY", "type": "in", "value": ["Professional Services"]},
                {"filter_type": "REGION", "type": "in", "value": ["Bangladesh"]},
                {"filter_type": "COMPANY_HEADCOUNT", "type": "in", "value": ["51-200"]}
            ],
            "notification_endpoint": "http://localhost:5000/notify",
            "frequency": 1,
            "expiration_date": "2027-01-01",
            "approximate_notification_time": 4
        }'
        ```
  </TabItem>

   <TabItem value="notification_message" label="Notification message" default>
    - Notification message:

        ```bash
        {
        "uid": "sales_nav_account_search_192c5afefa46e6becb18310ce0e08bf12d0bd2a1db87a8274d0e5e00734e0653",
        "industry": "Software Development",
        "location": "Allen, Texas, United States",
        "logo_urls": {
            "100x100": "https://media.licdn.com/dms/image/v2/D560BAQHIQyX1aNHIpw/company-logo_100_100/company-logo_100_100/0/1713389190093/selsoft_inc__logo?e=1747872000&v=beta&t=JM2kMxpXbtWQ-YpEdN-BnwUQa0Np5fLDdwlnYokMD6g",
            "200x200": "https://media.licdn.com/dms/image/v2/D560BAQHIQyX1aNHIpw/company-logo_200_200/company-logo_200_200/0/1713389190093/selsoft_inc__logo?e=1747872000&v=beta&t=jAlQFigsp2UycPclP1iNoKTDzoZNbrzKKAE4CwZ6b80",
            "400x400": "https://media.licdn.com/dms/image/v2/D560BAQHIQyX1aNHIpw/company-logo_400_400/company-logo_400_400/0/1713389190093/selsoft_inc__logo?e=1747872000&v=beta&t=Jg_xBNodT-4jvPa-lH5YQXXZX6V0puZsscTj17-N2Bw"
        },
        "company_id": 1010087,
        "description": "Selsoft Inc. is a premier Information Technology (IT) consulting services provider based in Allen, Texas.\r\n\r\nWe strongly believe the future of IT is in cloud computing. Selsoft has positioned itself to provide customized IT solutions using cloud computing technology.\r\n\r\nIn addition to developing and implementing solutions using cloud computing technology, Selsoft is also engaged in providing to clients, on-site IT personnel experienced on legacy platforms. We have personnel working on location who provide IT consulting services in Telecom B/OSS domain, web, and enterprise application development. \r\n\r\nOur customized solutions comprising consulting, managed services,staff augmentation  and outsourcing services make us unique in its passion for building a strong relationship with clients.",
        "specialties": [
            "Custome cloud application development",
            "IT manager services and consulting",
            "staff augmentation  and outsourcing"
        ],
        "company_name": "Selsoft Inc",
        "company_size": null,
        "company_type": "Privately Held",
        "founded_year": 2006,
        "headquarters": {
            "country": "United States",
            "postalCode": "75002"
        },
        "revenue_range": {
            "estimatedMaxRevenue": {
            "unit": "MILLION",
            "amount": 5,
            "currencyCode": "USD"
            },
            "estimatedMinRevenue": {
            "unit": "MILLION",
            "amount": 2.5,
            "currencyCode": "USD"
            }
        },
        "employee_count": 86,
        "company_website": "http://www.selsoftinc.com",
        "company_linkedin_id": "331504",
        "company_linkedin_url": "https://www.linkedin.com/company/selsoft-inc-/",
        "employee_count_range": "11-50",
        "crunchbase_categories": [
            "Software",
            "Consulting",
            "Information Technology",
            "Business Intelligence",
            "Business Information Systems"
        ],
        "decision_makers_count": "2",
        "employee_growth_percentages": [
            {
            "timespan": "SIX_MONTHS",
            "percentage": 6
            },
            {
            "timespan": "YEAR",
            "percentage": 28
            },
            {
            "timespan": "TWO_YEAR",
            "percentage": 50
            }
        ]
        }
        ```

  </TabItem>
</Tabs>

### 6. **Creating watch for someone starting a new job/position**

<Tabs>
  <TabItem value="request" label="Request" default>
    - Request:

        ```bash
        curl 'https://api.crustdata.com/watcher/watches' \
        --header 'Content-Type: application/json' \
        --header 'Accept: application/json, text/plain, */*' \
        --header 'Accept-Language: en-US,en;q=0.9' \
        --header 'Authorization: Token auth_token' \
        --data '{
            "event_type_slug": "person-starting-new-position",
            "event_filters": [
                {"filter_type": "INDUSTRY", "type": "in", "value": ["Professional Services"]}
            ],
            "lead_filters": [
                {"filter_type": "CURRENT_COMPANY", "type": "in", "value": ["hubspot.com"]}
            ],
            "notification_endpoint": "http://localhost:5000/notify",
            "frequency": 1,
            "expiration_date": "2025-01-01",
            "approximate_notification_time": 4
        }'
        ```

  </TabItem>

   <TabItem value="notification_message" label="Notification message" default>
    - Notification message:

        ```bash
            {
            "uid": "post_linkedin_d5e862cea0aea144ccd651a76de9fde1f77a57912f08daa0d92737a2d717d7f1",
            "text": "I'm happy to share that I'm starting a new position as Implementation Manager SSB at Rippling!",
            "share_url": "https://www.linkedin.com/posts/zoyar14_im-happy-to-share-that-im-starting-a-new-activity-7336061592062578689-8t34?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAADOd86IB298IogUpGDYpAUW6oznmLkqqZ0Y",
            "share_urn": "urn:li:ugcPost:7336061591253065728",
            "actor_name": "Zoya R.",
            "actor_type": "person",
            "hyperlinks": {
                "other_urls": [],
                "person_linkedin_urls": [],
                "company_linkedin_urls": []
            },
            "num_shares": 0,
            "backend_urn": "urn:li:activity:7336061592062578689",
            "date_posted": "2025-06-04",
            "person_name": "Zoya R.",
            "person_title": "Implementation Manager SSB,Product Specialist - US Taxation and Filings ",
            "total_comments": 7,
            "person_location": "Bengaluru, Karnataka, India",
            "total_reactions": 25,
            "current_employers": [
                {
                "end_date": null,
                "start_date": "2025-06-01T00:00:00+00:00",
                "employer_name": "Rippling",
                "employee_title": "Implementation Manager SSB",
                "employee_location": "Bengaluru, Karnataka, India",
                "employer_company_id": [
                    634043
                ],
                "employee_description": null,
                "employer_linkedin_id": "17988315"
                }
            ],
            "reactions_by_type": {
                "LIKE": 17,
                "PRAISE": 7,
                "EMPATHY": 1
            },
            "person_linkedin_urn": "ACoAADknmdsB2jvOaju8LNpUFmP3QyuaJASCHbc",
            "is_repost_without_thoughts": false,
            "person_linkedin_flagship_profile_url": "https://www.linkedin.com/in/zoyar14"
            }
        ```

  </TabItem>
</Tabs>

### 7. **Creating watch for job postings at a specific location**

<Tabs>
  <TabItem value="request" label="Request" default>
    - Request:

        ```bash
        curl 'https://api.crustdata.com/watcher/watches' \
        --header 'Content-Type: application/json' \
        --header 'Accept: application/json, text/plain, */*' \
        --header 'Accept-Language: en-US,en;q=0.9' \
        --header 'Authorization: Token $TOKEN' \
        --data '{
            "event_type_slug": "job-posting-with-location",
            "event_filters": [
                {"filter_type": "REGION", "type": "in", "value": ["Bangladesh"]}
            ],
            "account_filters": [
                {
                    "filter_type": "COMPANY_HEADCOUNT",
                    "type": "in",
                    "value": ["1-10", "11-50", "51-200", "201-500", "501-1,000", "1,001-5,000", "10,001+"]
                }
            ],
            "notification_endpoint": "http://localhost:5000/notify",
            "frequency": 1,
            "expiration_date": "2025-01-01",
            "approximate_notification_time": 4
        }'
        ```

  </TabItem>

   <TabItem value="notification_message" label="Notification message" default>
    - Notification message:

    ```json
        [
          {
            "uid": "jobposting_linkedin_80c9b4cb7bf5823e9a0e9a400c5c20fa5a1c91c3f692c94a4da0374959832e89",
            "url": "https://www.linkedin.com/jobs/view/4208331601",
            "title": "Senior Software Engineer, Research",
            "domain": "www.linkedin.com",
            "category": "Engineering",
            "country_id": "US",
            "date_added": "2025-04-16T21:18:45+00:00",
            "description": "Circle is a fin ...",
            "company_name": "Circle",
            "company_size": "501-1000",
            "date_updated": "2025-05-13T00:00:00+00:00",
            "reposted_job": true,
            "location_text": "Greater Boston",
            "company_domain": "circle.com",
            "workplace_type": "Remote",
            "company_linkedin_id": "3509899",
            "linkedin_industries": [
                "Financial Services"
            ],
            "company_linkedin_url": "https://www.linkedin.com/company/circle-internet-financial",
            "crustdata_company_id": 629290,
            "crunchbase_categories": [
                "Banking",
                "Financial Services",
                "FinTech",
                "Apps",
                "Content Creators",
                "Communities",
                "Blockchain",
                "Cryptocurrency",
                "Content"
            ],
            "linkedin_specialities": [
                "blockchain",
                "digital currency",
                "crypto",
                "fintech",
                "consumer finance",
                "stablecoins"
            ]
        }
        ]
        ```

  </TabItem>
</Tabs>

### 8. **Creating watch for company department headcount in a range**

<Tabs>
  <TabItem value="request" label="Request" default>
    - Request:

        ```bash
        curl 'https://api.crustdata.com/watcher/watches' \
        --header 'Content-Type: application/json' \
        --header 'Authorization: Token $TOKEN' \
        --data '{
        "event_type_slug": "company-department-headcount",
        "event_filters": [
            {"filter_type": "DEPARTMENT_HEADCOUNT", "type": "between","value": {"min": "10", "max": "25"}, "sub_filter": "Consulting" },
            {"filter_type": "INDUSTRY", "type": "in", "value": ["Wholesale Import and Export"]},
            {"filter_type": "REGION", "type": "in", "value": ["United States"]},
            {"filter_type": "COMPANY_HEADCOUNT", "type": "in", "value": ["51-200"]}
        ],
        "notification_endpoint": "http://logsx.com/comde",
        "frequency": 1,
        "expiration_date": "2025-03-31",
        "approximate_notification_time": 4
        }'
        ```

  </TabItem>

   <TabItem value="notification_message" label="Notification message" default>
    - Notification message:

        ```bash
        {
        "uid": "sales_nav_account_search_192c5afefa46e6becb18310ce0e08bf12d0bd2a1db87a8274d0e5e00734e0653",
        "industry": "Software Development",
        "location": "Allen, Texas, United States",
        "logo_urls": {
            "100x100": "https://media.licdn.com/dms/image/v2/D560BAQHIQyX1aNHIpw/company-logo_100_100/company-logo_100_100/0/1713389190093/selsoft_inc__logo?e=1747872000&v=beta&t=JM2kMxpXbtWQ-YpEdN-BnwUQa0Np5fLDdwlnYokMD6g",
            "200x200": "https://media.licdn.com/dms/image/v2/D560BAQHIQyX1aNHIpw/company-logo_200_200/company-logo_200_200/0/1713389190093/selsoft_inc__logo?e=1747872000&v=beta&t=jAlQFigsp2UycPclP1iNoKTDzoZNbrzKKAE4CwZ6b80",
            "400x400": "https://media.licdn.com/dms/image/v2/D560BAQHIQyX1aNHIpw/company-logo_400_400/company-logo_400_400/0/1713389190093/selsoft_inc__logo?e=1747872000&v=beta&t=Jg_xBNodT-4jvPa-lH5YQXXZX6V0puZsscTj17-N2Bw"
        },
        "company_id": 1010087,
        "description": "Selsoft Inc. is a premier Information Technology (IT) consulting services provider based in Allen, Texas.\r\n\r\nWe strongly believe the future of IT is in cloud computing. Selsoft has positioned itself to provide customized IT solutions using cloud computing technology.\r\n\r\nIn addition to developing and implementing solutions using cloud computing technology, Selsoft is also engaged in providing to clients, on-site IT personnel experienced on legacy platforms. We have personnel working on location who provide IT consulting services in Telecom B/OSS domain, web, and enterprise application development. \r\n\r\nOur customized solutions comprising consulting, managed services,staff augmentation  and outsourcing services make us unique in its passion for building a strong relationship with clients.",
        "specialties": [
            "Custome cloud application development",
            "IT manager services and consulting",
            "staff augmentation  and outsourcing"
        ],
        "company_name": "Selsoft Inc",
        "company_size": null,
        "company_type": "Privately Held",
        "founded_year": 2006,
        "headquarters": {
            "country": "United States",
            "postalCode": "75002"
        },
        "revenue_range": {
            "estimatedMaxRevenue": {
            "unit": "MILLION",
            "amount": 5,
            "currencyCode": "USD"
            },
            "estimatedMinRevenue": {
            "unit": "MILLION",
            "amount": 2.5,
            "currencyCode": "USD"
            }
        },
        "employee_count": 86,
        "company_website": "http://www.selsoftinc.com",
        "company_linkedin_id": "331504",
        "company_linkedin_url": "https://www.linkedin.com/company/selsoft-inc-/",
        "employee_count_range": "11-50",
        "crunchbase_categories": [
            "Software",
            "Consulting",
            "Information Technology",
            "Business Intelligence",
            "Business Information Systems"
        ],
        "decision_makers_count": "2",
        "employee_growth_percentages": [
            {
            "timespan": "SIX_MONTHS",
            "percentage": 6
            },
            {
            "timespan": "YEAR",
            "percentage": 28
            },
            {
            "timespan": "TWO_YEAR",
            "percentage": 50
            }
        ]
        }
        ```

  </TabItem>
</Tabs>

### 9. **Creating watch for first person hired in a company department**

<Tabs>
  <TabItem value="request" label="Request" default>
    - Request:

        ```bash
        curl 'https://api.crustdata.com/watcher/watches' \
        --header 'Content-Type: application/json' \
        --header 'Accept: application/json, text/plain, */*' \
        --header 'Accept-Language: en-US,en;q=0.9' \
        --header 'Authorization: Token $TOKEN' \
        --data '{
        "event_type_slug": "first-person-hired-in-company-department",
        "event_filters": [
            {"filter_type": "COMPANY_DEPARTMENT", "type": "in",  "value": ["Consulting"]},
            {"filter_type": "INDUSTRY", "type": "in", "value": ["Wholesale Import and Export"]},
            {"filter_type": "REGION", "type": "in", "value": ["United States"]},
            {"filter_type": "COMPANY_HEADCOUNT", "type": "in", "value": ["51-200"]}
        ],
        "notification_endpoint": "http://logsx.com/comde",
        "frequency": 1,
        "expiration_date": "2025-03-31",
        "approximate_notification_time": 4
        }'
        ```

  </TabItem>

   <TabItem value="notification_message" label="Notification message" default>
    - Notification message:

        ```bash
        {
        "uid": "sales_nav_account_search_192c5afefa46e6becb18310ce0e08bf12d0bd2a1db87a8274d0e5e00734e0653",
        "industry": "Software Development",
        "location": "Allen, Texas, United States",
        "logo_urls": {
            "100x100": "https://media.licdn.com/dms/image/v2/D560BAQHIQyX1aNHIpw/company-logo_100_100/company-logo_100_100/0/1713389190093/selsoft_inc__logo?e=1747872000&v=beta&t=JM2kMxpXbtWQ-YpEdN-BnwUQa0Np5fLDdwlnYokMD6g",
            "200x200": "https://media.licdn.com/dms/image/v2/D560BAQHIQyX1aNHIpw/company-logo_200_200/company-logo_200_200/0/1713389190093/selsoft_inc__logo?e=1747872000&v=beta&t=jAlQFigsp2UycPclP1iNoKTDzoZNbrzKKAE4CwZ6b80",
            "400x400": "https://media.licdn.com/dms/image/v2/D560BAQHIQyX1aNHIpw/company-logo_400_400/company-logo_400_400/0/1713389190093/selsoft_inc__logo?e=1747872000&v=beta&t=Jg_xBNodT-4jvPa-lH5YQXXZX6V0puZsscTj17-N2Bw"
        },
        "company_id": 1010087,
        "description": "Selsoft Inc. is a premier Information Technology (IT) consulting services provider based in Allen, Texas.\r\n\r\nWe strongly believe the future of IT is in cloud computing. Selsoft has positioned itself to provide customized IT solutions using cloud computing technology.\r\n\r\nIn addition to developing and implementing solutions using cloud computing technology, Selsoft is also engaged in providing to clients, on-site IT personnel experienced on legacy platforms. We have personnel working on location who provide IT consulting services in Telecom B/OSS domain, web, and enterprise application development. \r\n\r\nOur customized solutions comprising consulting, managed services,staff augmentation  and outsourcing services make us unique in its passion for building a strong relationship with clients.",
        "specialties": [
            "Custome cloud application development",
            "IT manager services and consulting",
            "staff augmentation  and outsourcing"
        ],
        "company_name": "Selsoft Inc",
        "company_size": null,
        "company_type": "Privately Held",
        "founded_year": 2006,
        "headquarters": {
            "country": "United States",
            "postalCode": "75002"
        },
        "revenue_range": {
            "estimatedMaxRevenue": {
            "unit": "MILLION",
            "amount": 5,
            "currencyCode": "USD"
            },
            "estimatedMinRevenue": {
            "unit": "MILLION",
            "amount": 2.5,
            "currencyCode": "USD"
            }
        },
        "employee_count": 86,
        "company_website": "http://www.selsoftinc.com",
        "company_linkedin_id": "331504",
        "company_linkedin_url": "https://www.linkedin.com/company/selsoft-inc-/",
        "employee_count_range": "11-50",
        "crunchbase_categories": [
            "Software",
            "Consulting",
            "Information Technology",
            "Business Intelligence",
            "Business Information Systems"
        ],
        "decision_makers_count": "2",
        "employee_growth_percentages": [
            {
            "timespan": "SIX_MONTHS",
            "percentage": 6
            },
            {
            "timespan": "YEAR",
            "percentage": 28
            },
            {
            "timespan": "TWO_YEAR",
            "percentage": 50
            }
        ]
        }
        ```

  </TabItem>
</Tabs>

### 10. **Creating watch for first person is hired internationally (outside of primary HQ location)**

<Tabs>
  <TabItem value="request" label="Request" default>
    - Request:

        ```bash
        curl 'https://api.crustdata.com/watcher/watches' \
        --header 'Content-Type: application/json' \
        --header 'Accept: application/json, text/plain, */*' \
        --header 'Accept-Language: en-US,en;q=0.9' \
        --header 'Authorization: Token auth_token' \
        --data '
        {
        "event_type_slug": "first-person-hired-internationally",
        "event_filters": [
            {"filter_type": "COMPANY_HEADCOUNT", "type": "in","value": ["11-50"]},
            {"filter_type": "INDUSTRY", "type": "in", "value": ["Manufacturing"]},
            {"filter_type": "REGION", "type": "in", "value": ["San Francisco Bay Area"]},
        ],
        "notification_endpoint": "http://logsx.com/comde",
        "frequency": 1,
        "expiration_date": "2025-03-31",
        "approximate_notification_time": 4
        }'
        ```

  </TabItem>

   <TabItem value="notification_message" label="Notification message" default>
    - Notification message:

        ```bash
        {
        "uid": "sales_nav_account_search_b302fa0864b097e5f307ecd1fa51725e88f1ccb4512bb7212f73dfd4b5e72609",
        "industry": "Food and Beverage Manufacturing",
        "location": "San Francisco, California, United States",
        "logo_urls": {
            "100x100": "https://media.licdn.com/dms/image/v2/C4D0BAQEcPx9bLvZvnw/company-logo_100_100/company-logo_100_100/0/1646848432985?e=1749686400&v=beta&t=FZxedRBB_YcdB_oaT3bwpqbNvGWiOVa4xncjejwfd9Y",
            "200x200": "https://media.licdn.com/dms/image/v2/C4D0BAQEcPx9bLvZvnw/company-logo_200_200/company-logo_200_200/0/1646848432985?e=1749686400&v=beta&t=otd6Mkd_9VmFr4xCr8KQQAWv8T7cRWsvYU--mRqsEgQ",
            "400x400": "https://media.licdn.com/dms/image/v2/C4D0BAQEcPx9bLvZvnw/company-logo_400_400/company-logo_400_400/0/1646848432985?e=1749686400&v=beta&t=iolCcgB6hs_uC07SHQf5wJAbXTN9e_mHiecBHG4RVYc"
        },
        "company_id": 1125930,
        "description": "New generation of pet foods from plant-based meat. Support earth, animals health and welfare.",
        "specialties": null,
        "company_name": "PawCo Foods",
        "company_size": null,
        "company_type": "Self-Employed",
        "founded_year": null,
        "headquarters": {
            "city": "San Francisco",
            "country": "United States"
        },
        "revenue_range": {
            "estimatedMaxRevenue": {
            "unit": "MILLION",
            "amount": 2.5,
            "currencyCode": "USD"
            },
            "estimatedMinRevenue": {
            "unit": "MILLION",
            "amount": 1,
            "currencyCode": "USD"
            }
        },
        "employee_count": 19,
        "company_website": "mypawco.com",
        "company_linkedin_id": "79999254",
        "company_linkedin_url": "https://www.linkedin.com/company/pawco-foods/",
        "employee_count_range": "11-50",
        "crunchbase_categories": [
            "Alternative Protein",
            "Food and Beverage",
            "Pet"
        ],
        "decision_makers_count": "2",
        "employee_count_by_country": {
            "Canada": 1,
            "Germany": 1,
            "Colombia": 2,
            "United States": 14
        },
        "employee_growth_percentages": [
            {
            "timespan": "SIX_MONTHS",
            "percentage": 5
            },
            {
            "timespan": "YEAR",
            "percentage": 26
            },
            {
            "timespan": "TWO_YEAR",
            "percentage": 35
            }
        ]
        }
        ```

  </TabItem>
</Tabs>

### 11. **Creating watch for employee job location is in 2 or more countries on linkedin**

<Tabs>
  <TabItem value="request" label="Request" default>
    - Request:

        ```bash
        curl 'https://api.crustdata.com/watcher/watches' \
        --header 'Content-Type: application/json' \
        --header 'Accept: application/json, text/plain, */*' \
        --header 'Accept-Language: en-US,en;q=0.9' \
        --header 'Authorization: Token auth_token' \
        --data '
        {
        "event_type_slug": "company-employee-job-location-in-two-countries",
        "event_filters": [
        {"filter_type": "COMPANY_HEADCOUNT", "type": "in","value": ["11-50"]},
        {"filter_type": "INDUSTRY", "type": "in", "value": ["Manufacturing"]},
        {"filter_type": "REGION", "type": "in", "value": ["San Francisco Bay Area"]},
        ],
        "notification_endpoint": "http://logsx.com/comde",
        "frequency": 1,
        "expiration_date": "2025-03-31",
        "approximate_notification_time": 4
        }'
        ```

  </TabItem>

   <TabItem value="notification_message" label="Notification message" default>
    - Notification message:

        ```bash
        {
        "uid": "sales_nav_account_search_b302fa0864b097e5f307ecd1fa51725e88f1ccb4512bb7212f73dfd4b5e72609",
        "industry": "Food and Beverage Manufacturing",
        "location": "San Francisco, California, United States",
        "logo_urls": {
            "100x100": "https://media.licdn.com/dms/image/v2/C4D0BAQEcPx9bLvZvnw/company-logo_100_100/company-logo_100_100/0/1646848432985?e=1749686400&v=beta&t=FZxedRBB_YcdB_oaT3bwpqbNvGWiOVa4xncjejwfd9Y",
            "200x200": "https://media.licdn.com/dms/image/v2/C4D0BAQEcPx9bLvZvnw/company-logo_200_200/company-logo_200_200/0/1646848432985?e=1749686400&v=beta&t=otd6Mkd_9VmFr4xCr8KQQAWv8T7cRWsvYU--mRqsEgQ",
            "400x400": "https://media.licdn.com/dms/image/v2/C4D0BAQEcPx9bLvZvnw/company-logo_400_400/company-logo_400_400/0/1646848432985?e=1749686400&v=beta&t=iolCcgB6hs_uC07SHQf5wJAbXTN9e_mHiecBHG4RVYc"
        },
        "company_id": 1125930,
        "description": "New generation of pet foods from plant-based meat. Support earth, animals health and welfare.",
        "specialties": null,
        "company_name": "PawCo Foods",
        "company_size": null,
        "company_type": "Self-Employed",
        "founded_year": null,
        "headquarters": {
            "city": "San Francisco",
            "country": "United States"
        },
        "revenue_range": {
            "estimatedMaxRevenue": {
            "unit": "MILLION",
            "amount": 2.5,
            "currencyCode": "USD"
            },
            "estimatedMinRevenue": {
            "unit": "MILLION",
            "amount": 1,
            "currencyCode": "USD"
            }
        },
        "employee_count": 19,
        "company_website": "mypawco.com",
        "company_linkedin_id": "79999254",
        "company_linkedin_url": "https://www.linkedin.com/company/pawco-foods/",
        "employee_count_range": "11-50",
        "crunchbase_categories": [
            "Alternative Protein",
            "Food and Beverage",
            "Pet"
        ],
        "decision_makers_count": "2",
        "employee_count_by_country": {
            "Canada": 1,
            "Germany": 1,
            "Colombia": 2,
            "United States": 14
        },
        "employee_growth_percentages": [
            {
            "timespan": "SIX_MONTHS",
            "percentage": 5
            },
            {
            "timespan": "YEAR",
            "percentage": 26
            },
            {
            "timespan": "TWO_YEAR",
            "percentage": 35
            }
        ]
        }
        ```

  </TabItem>
</Tabs>

### 12. **Creating watch for employee count growth greater than x% above baseline Y**

<Tabs>
  <TabItem value="request" label="Request" default>
    - Request:

        ```bash
        curl 'https://api.crustdata.com/watcher/watches' \
        --header 'Authorization: Token$auth_token' \
        --data '
        {
        "event_type_slug": "company-headcount-growth-over-baseline",
        "event_filters": [
        {"filter_type": "REGION", "type": "in", "value": ["California, United States"]},
            {"filter_type": "TIMEFRAME", "type": "in", "value": ["YoY"]},
            {"filter_type": "INDUSTRY", "type": "in", "value": ["Software Development"]},
            {"filter_type":"BASELINE_HEADCOUNT", "type": "in", "value": [8644]},
            {"filter_type":"COMPANY_HEADCOUNT_GROWTH_FROM_BASELINE", "type": "in", "value": [10]}
        ],
        "notification_endpoint": "http://logsx.com/comde",
        "frequency": 1,
        "expiration_date": "2025-03-31",
        "approximate_notification_time": 4
        }'
        ```

  </TabItem>

   <TabItem value="notification_message" label="Notification message" default>
    - Notification message:

        ```bash
        {
        "uid": "sales_nav_account_search_192c5afefa46e6becb18310ce0e08bf12d0bd2a1db87a8274d0e5e00734e0653",
        "industry": "Software Development",
        "location": "Allen, Texas, United States",
        "logo_urls": {
            "100x100": "https://media.licdn.com/dms/image/v2/D560BAQHIQyX1aNHIpw/company-logo_100_100/company-logo_100_100/0/1713389190093/selsoft_inc__logo?e=1747872000&v=beta&t=JM2kMxpXbtWQ-YpEdN-BnwUQa0Np5fLDdwlnYokMD6g",
            "200x200": "https://media.licdn.com/dms/image/v2/D560BAQHIQyX1aNHIpw/company-logo_200_200/company-logo_200_200/0/1713389190093/selsoft_inc__logo?e=1747872000&v=beta&t=jAlQFigsp2UycPclP1iNoKTDzoZNbrzKKAE4CwZ6b80",
            "400x400": "https://media.licdn.com/dms/image/v2/D560BAQHIQyX1aNHIpw/company-logo_400_400/company-logo_400_400/0/1713389190093/selsoft_inc__logo?e=1747872000&v=beta&t=Jg_xBNodT-4jvPa-lH5YQXXZX6V0puZsscTj17-N2Bw"
        },
        "company_id": 1010087,
        "description": "Selsoft Inc. is a premier Information Technology (IT) consulting services provider based in Allen, Texas.\r\n\r\nWe strongly believe the future of IT is in cloud computing. Selsoft has positioned itself to provide customized IT solutions using cloud computing technology.\r\n\r\nIn addition to developing and implementing solutions using cloud computing technology, Selsoft is also engaged in providing to clients, on-site IT personnel experienced on legacy platforms. We have personnel working on location who provide IT consulting services in Telecom B/OSS domain, web, and enterprise application development. \r\n\r\nOur customized solutions comprising consulting, managed services,staff augmentation  and outsourcing services make us unique in its passion for building a strong relationship with clients.",
        "specialties": [
            "Custome cloud application development",
            "IT manager services and consulting",
            "staff augmentation  and outsourcing"
        ],
        "company_name": "Selsoft Inc",
        "company_size": null,
        "company_type": "Privately Held",
        "founded_year": 2006,
        "headquarters": {
            "country": "United States",
            "postalCode": "75002"
        },
        "revenue_range": {
            "estimatedMaxRevenue": {
            "unit": "MILLION",
            "amount": 5,
            "currencyCode": "USD"
            },
            "estimatedMinRevenue": {
            "unit": "MILLION",
            "amount": 2.5,
            "currencyCode": "USD"
            }
        },
        "employee_count": 86,
        "company_website": "http://www.selsoftinc.com",
        "company_linkedin_id": "331504",
        "company_linkedin_url": "https://www.linkedin.com/company/selsoft-inc-/",
        "employee_count_range": "11-50",
        "crunchbase_categories": [
            "Software",
            "Consulting",
            "Information Technology",
            "Business Intelligence",
            "Business Information Systems"
        ],
        "decision_makers_count": "2",
        "employee_growth_percentages": [
            {
            "timespan": "SIX_MONTHS",
            "percentage": 6
            },
            {
            "timespan": "YEAR",
            "percentage": 28
            },
            {
            "timespan": "TWO_YEAR",
            "percentage": 50
            }
        ]
        }
        ```

  </TabItem>
</Tabs>

### 13. **Creating watch for person discovery via filters**

<Tabs>
  <TabItem value="request" label="Request" default>
    - Request:

        ```bash
        curl 'https://api.crustdata.com/watcher/watches' \
        --header 'Authorization: Token $auth_token' \
        --data '{
        "event_type_slug": "person-discovery-via-filters",
        "event_filters": [
            {"filter_type":"CURRENT_TITLE", "type":"in", "value":["Co-founder", "Founder", "Chief Executive Officer"]},
            {"filter_type":"CURRENT_COMPANY", "type":"in", "value":["https://www.linkedin.com/company/stealth-startup-careers"]},
            {"filter_type":"INDUSTRY", "type":"in", "value":["Manufacturing"]},
            {"filter_type":"COMPANY_HEADCOUNT", "type":"in", "value":["11-50"]},
            {"filter_type":"REGION", "type":"in", "value":["United States"]}
        ],
        "notification_endpoint": "http://logsx.com/comde",
        "frequency": 1,
        "approximate_notification_time": 7,
        "expiration_date": "2025-03-31"
        }'
        ```

  </TabItem>

   <TabItem value="notification_message" label="Notification message" default>
    - Notification message:

        ```bash
        {
          "uid": "sales_nav_person_search_e56b770365c10adac18685843a1a5b1d899c2a10d7c3d85c9cf3ffad66e31bd4",
          "name": "Marem Merriman",
          "emails": [],
          "skills": ["Go-to-Market Strategy", "B2C and B2B Innovation", "Product Diversification", "..."],
          "pronoun": "She/Her",
          "summary": "I am a board advisor, successful business leader and globally recognized expert on generational shifts, cultural transformation and the evolving impact of technology on business and society...",
          "employer": [
            {
              "title": "Founder",
              "end_date": null,
              "location": null,
              "rich_media": [],
              "start_date": "2025-07-01T00:00:00",
              "description": "After a decade helping Board Directors and Fortune 500 CXOs navigate generational shifts while at EY...",
              "position_id": 2691661680,
              "company_name": "Stealth Startup",
              "company_logo_url": null,
              "company_linkedin_id": null
            }
          ],
          "headline": "Board Advisor. Founder & CEO. Brand Strategist. Cultural Anthropologist. Entrepreneur. Growth Catalyst. Generational Dynamics Researcher. Emerging Tech. Global B2B2C. Keynote Speaker: Generational & Societal Change.",
          "location": "United States",
          "websites": ["http://ey.com"],
          "languages": ["Japanese"],
          "current_title": "Founder",
          "fsd_profile_id": "ACoAAAAzVmoB-eBNuL6aclkOOW2l1VXCjb9xFaU",
          "twitter_handle": "MaremMerriman",
          "num_of_connections": 3148,
          "profile_picture_url": "https://media.licdn.com/dms/image/v2/D4E03AQEE6UCcuFjztw/profile-displayphoto-shrink_400_400/B4EZSlNmUyHgAg-/0/1737938593420?e=1756944000&v=beta&t=Luj89Gz0dfLIBhFWvMitOY9QEFv6gR1VlOVbrAu_UPw",
          "education_background": [
            {
              "end_date": null,
              "start_date": "2019-01-01T00:00:00",
              "degree_name": "Board of Directors Program",
              "field_of_study": "",
              "institute_name": "Harvard Business School",
              "institute_logo_url": "https://media.licdn.com/dms/image/v2/C4D0BAQF_DkXTlZVo1w/company-logo_400_400/company-logo_400_400/0/1639781479259/harvard_business_school_logo?e=1756944000&v=beta&t=N137bZ3itVPtdKnUtVrYmlMeiwkLFO2Y0XZt0gyBzOI",
              "institute_linkedin_id": "4867",
              "institute_linkedin_url": "https://www.linkedin.com/school/4867/"
            }
          ],
          "flagship_profile_url": "https://www.linkedin.com/in/maremerriman",
          "linkedin_profile_url": "https://www.linkedin.com/in/ACwAAAAzVmoBP3K14xF3ooa2XpcKl3hhYHJGrwg",
          "linkedin_profile_urn": "ACwAAAAzVmoBP3K14xF3ooa2XpcKl3hhYHJGrwg",
          "linkedin_slug_or_urns": ["maremerriman", "ACwAAAAzVmoBP3K14xF3ooa2XpcKl3hhYHJGrwg"],
          "default_position_title": "Founder",
          "query_person_linkedin_urn": "ACwAAAAzVmoBP3K14xF3ooa2XpcKl3hhYHJGrwg",
          "related_colleague_company_id": null,
          "default_position_is_decision_maker": true,
          "default_position_company_linkedin_id": null
        }
        ```

  </TabItem>
</Tabs>

**Key Points**

- **Multiple Watches**: A user can create multiple watches for different events.
- **Notification Endpoint**: Each watch requires a `notification_endpoint` where the webhook notifications will be sent as a POST request
