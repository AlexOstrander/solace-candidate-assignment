# Discussion

## What I focused on

1. **Fixing correctness and anti-patterns**
   - Removed direct DOM access in the React page and moved that behavior into state.
   - Fixed a runtime bug where `.includes` was called on a numeric `yearsOfExperience` field.
   - Added proper typing for advocates and cleaned up table markup and keys.

2. **Improving the patient-facing UI/UX**
   - Rebuilt the advocates page using Tailwind into a card-based layout with a clear search region and results table.
   - Added loading, error, and empty states so users always know what’s happening.
   - Rendered specialties as pills and tightened typography and spacing for better scannability.

3. **Making the backend ready for scale**
   - Added search and pagination to `/api/advocates` so the client only ever sees a single page of results.
   - Implemented an in-memory fallback for local dev when `DATABASE_URL` isn’t configured, while keeping the same API shape.
   - Hardened `/api/seed` to no-op safely when a database is not present.

## If I had more time

- Add structured filters (city, degree, specialties) alongside free-text search.
- Introduce advocate detail pages with richer information (bio, modalities, languages).
- Add debounced search and skeleton loading states for a smoother feel.
- For large production datasets, introduce DB indexes and possibly a dedicated search engine for full-text and fuzzy matching.
