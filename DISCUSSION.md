# Solace Candidate Assignment – Discussion

## What I changed

### 1. Fixed bugs and React anti-patterns

- **Removed direct DOM manipulation** (`document.getElementById("search-term")`) and replaced it with React state (`displayedSearchTerm`) so the UI remains declarative and easier to reason about.
- **Fixed a runtime bug** where `yearsOfExperience.includes(searchTerm)` was being called on a numeric field. This would throw when running a search. Filtering is now done safely using string conversion and/or database queries.
- **Improved type safety** by introducing an explicit `Advocate` type and using it in React state. This plays nicely with the existing strict TypeScript configuration.
- Added `key` props to mapped rows and specialties to avoid React warnings and ensure efficient reconciliation.
- Corrected table semantics (added a `tr` within `thead`) for valid HTML and better accessibility.

### 2. UI/UX improvements

- Replaced ad hoc inline styles with **Tailwind-based** layout and styling:
  - A full-width, responsive layout with a centered content container.
  - A search “card” with clear hierarchy and emphasis on the primary action.
  - A styled, scrollable results table with sticky headers and subtle hover states.
- Added **loading**, **empty**, and **error** states so users always know what is happening:
  - “Loading advocates…” while data is being fetched.
  - “No advocates found” when a search returns no results.
  - A friendly error message if the API fails.
- Improved accessibility:
  - Semantic form markup (`label` tied to `input` via `htmlFor`/`id`).
  - Clear focus states (`focus:ring` / `focus:outline-none`) for keyboard users.
  - More descriptive copy and placeholders to guide prospective patients (e.g. examples of queries they can type).
- Re-styled specialties as **pills/badges**, making it easier for patients to visually scan for relevant areas of expertise at a glance.

### 3. Backend & performance improvements

- Updated `/api/advocates` to support **query + pagination** via `q`, `page`, and `pageSize` query parameters.
- The API now:
  - Returns only the relevant slice of advocates instead of the entire dataset.
  - Returns `total`, `page`, and `pageSize` so the client can render pagination controls.
  - Uses case-insensitive matching across `first_name`, `last_name`, `city`, `degree`, `specialties`, and `years_of_experience`.
- Implemented a **graceful fallback**: when `DATABASE_URL` is not set, the route uses the static `advocateData` in memory, but still applies filtering and pagination. This makes local development easy while still modeling production behavior.

### 4. How this scales to hundreds of thousands of advocates

At a scale of 100k+ advocates, the main bottlenecks are:

1. Sending too much data to the client.
2. Running expensive filtering in JavaScript on the client.

The updated design addresses this by:

- Doing **search and pagination on the server** and returning only one page at a time.
- Allowing the frontend to request specific pages instead of loading everything at once.
- Keeping the UI responsive by displaying the most relevant subset of data rather than a giant table.

With a real Postgres instance, I would additionally:

- Add **B-tree indexes** on frequently filtered columns:
  - `last_name`
  - `city`
  - potentially `degree` and `years_of_experience`
- Add a **GIN index on `specialties` (jsonb)** to accelerate searches over the specialties array.
- Consider a **tsvector column + full-text index** if Solace product requirements call for more advanced search (e.g., matching on free-text notes or long bios).
- If search becomes very complex or needs fuzzy matching, evaluate a dedicated search engine (e.g., Meilisearch, OpenSearch) behind a thin API.

### 5. If I had more time

Given additional time, I’d focus on:

- **Richer filtering**:
  - Explicit filters for city, degree, remote vs in-person availability, insurance, etc.
  - Multi-select filters for specialties.
- **Better IA for patients**:
  - A card view that highlights a few “headline” advocates, with an optional table view for power users.
  - Advocate detail pages with more context (bio, modalities, languages).
- **Performance & UX polish**:
  - Debounced search input so the API isn’t called on every keypress.
  - Skeleton loading states instead of text-based loading indicators.
  - Pre-fetching the next page of results as patients approach the end of a list.
- **Production hardening**:
  - End-to-end tests around search behavior.
  - Monitoring and logging around slow queries and error rates on the `/api/advocates` endpoint.
  - Rate limiting or minimal auth checks depending on how public the directory is intended to be.

Overall, the goal of these changes is to make the experience fast, predictable, and calming for prospective patients while keeping the internals ready to scale as Solace’s advocate network grows.

Thanks,
Alex
