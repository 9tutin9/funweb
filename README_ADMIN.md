# Admin profile status

Hidden admin at `admin.html` controls the profile card status shown on the homepage.

API
- GET `/api/profile-status` → `{ status: 'online' | 'away' | 'offline', updatedAt }`
- POST `/api/profile-status` with header `Authorization: Bearer <ADMIN_TOKEN>` and body `{ "status": "online|away|offline" }`

Environment variables
- `ADMIN_TOKEN` (required for writes)
- `GITHUB_TOKEN` with `gist` scope (optional)
- `GIST_ID` (optional, pairs with `GITHUB_TOKEN`)

Persistence
- If `GITHUB_TOKEN` and `GIST_ID` are set, status persists in the specified GitHub Gist as `profile-status.json`.
- In development, falls back to `.data/profile-status.json` (created automatically).
- If neither is available, uses in‑memory fallback (not persistent across cold starts).

Security
- The admin page is not linked anywhere. Keep the URL private and rely on the `ADMIN_TOKEN` for write operations.

Local testing
1. Set `ADMIN_TOKEN` in your environment (e.g., `export ADMIN_TOKEN=...`).
2. Run `vercel dev`.
3. Open `/admin.html`, enter your token, and switch status.
4. Reload `/` to see the updated status on the profile card.


