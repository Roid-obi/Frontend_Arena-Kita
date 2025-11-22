# Dummy Data for ArenaKita

Folder: `data/dummy/`

Files (JSON arrays) provided:

- `users.json` — sample users (passwords are hashed placeholders). Profile images point to `picsum.photos`.
- `owners.json` — venue owners (passwords are hashed placeholders).
- `venues.json` — venues linked to `owners` via `owner_id`.
- `venue_photos.json` — photos linked to `venues` via `venue_id` (now using `picsum.photos`).
- `fields.json` — fields linked to `venues` via `venue_id`; `status` uses `AVAILABLE` or `MAINTENANCE` (field photos use `picsum.photos`).
- `pricing_schemes.json` — pricing options linked to `fields` via `field_id` (duration in minutes).
- `bookings.json` — bookings refer to `users` and `pricing_schemes`.
- `transactions.json` — payment records referencing `bookings`.

Notes:
- Timestamps use ISO 8601 strings. Times use `HH:MM:SS` for `opening_time`/`start_time`/`end_time`.
- Prices are numbers (decimal). Adjust types as needed when seeding your DB.
- Replace the placeholder hashed passwords with real hashed values when creating real users.

Images:
- Dummy image URLs in `users.json`, `venue_photos.json`, and `fields.json` now point to `https://picsum.photos` (free placeholder images suitable for development/testing).
- These external image URLs are convenient for development but may be rate-limited or change over time; for stable production use, host assets yourself or bundle them in the project.

Usage examples:

Import JSON in Node/TS:

```ts
import users from '../../data/dummy/users.json';
```

Or seed into SQL DB by transforming these JSON objects into INSERT statements.

License / Source:
- Images: `picsum.photos` (public placeholder service). Check their site for usage details.
