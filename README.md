# Ask Hossameldin

An anonymous Q&A wall — think ask.fm, built from scratch. Anyone can send an
anonymous question via a link (no login required); only the owner can answer
or moderate; answered questions show up publicly on the wall.

## Stack

- **Next.js 16** (App Router) + TypeScript + Tailwind CSS v4
- **Postgres** via Drizzle ORM + `pg` (works with local Postgres, Vercel
  Postgres, Neon, Supabase, or any standard Postgres connection string)
- **jose** for signed session cookies (single-admin auth, no third-party auth provider)
- No CAPTCHA dependency — abuse is mitigated with DB-backed rate limiting, a
  honeypot field, a submission-timing check, and basic spam heuristics
  (see [Security](#security) below).

## Local setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Create a Postgres database.** Easiest path: create a free
   [Neon](https://neon.tech) database (or add the "Vercel Postgres" /
   "Neon" integration once your project is imported into Vercel) and copy
   its connection string.

3. **Create your local env file.** Copy `env.example.txt` to `.env.local`
   and fill in `DATABASE_URL`.

4. **Generate your admin credentials.** This hashes your chosen admin
   password (never stored in plaintext) and generates the two signing
   secrets in one step:

   ```bash
   npm run setup-env -- "your-strong-admin-password"
   ```

   Paste the three printed lines (`ADMIN_PASSWORD_HASH`, `SESSION_SECRET`,
   `IP_HASH_SECRET`) into `.env.local`.

5. **Run the database migration:**

   ```bash
   npm run db:generate   # generates SQL from lib/db/schema.ts (already committed under /drizzle)
   npm run db:migrate    # applies it to DATABASE_URL
   ```

6. **Start the dev server:**

   ```bash
   npm run dev
   ```

   - Public wall: [http://localhost:3000](http://localhost:3000)
   - Admin login: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

## Deploying to Vercel

1. Push this repo to GitHub and import it into Vercel.
2. Add a Postgres database to the project (Vercel Storage tab → Postgres,
   which is Neon-backed) — this sets `DATABASE_URL` automatically. If you
   provisioned your own Neon database instead, add `DATABASE_URL` manually
   in Project Settings → Environment Variables — use the **pooled**
   connection string (PgBouncer) since Vercel functions are serverless and
   each request may open a new connection.
3. Add `ADMIN_PASSWORD_HASH`, `SESSION_SECRET`, and `IP_HASH_SECRET`
   (from `npm run setup-env`) as environment variables in Vercel.
4. Run `npm run db:migrate` once (locally, pointed at the production
   `DATABASE_URL`, or via `vercel env pull` first) to create the tables.
5. Deploy. Share the deployed URL (e.g. from your portfolio) — visitors can
   ask questions with no login, and you moderate/answer at `/admin`.

## How it works

- **Public wall** (`/`) shows only *answered* questions, newest first, with
  cursor-based pagination.
- **Ask a question** — a floating button opens a modal; anonymous
  submissions are capped at 1500 characters and go in as `pending`.
- **Admin dashboard** (`/admin`) — protected by a single admin password —
  lets you answer (which publishes it to the wall), reject, or permanently
  delete a question, across Pending / Answered / Rejected tabs.

## Security

- **No PII retained.** Submitter IP addresses are never stored — only a
  salted SHA-256 hash (`IP_HASH_SECRET`), used solely for rate limiting.
- **Rate limiting** is DB-backed (no extra infra required): 5 questions per
  15 minutes and 20 per day per IP hash; 10 admin login attempts per 15
  minutes per IP hash.
- **Bot mitigation without a CAPTCHA:** a hidden honeypot field, a
  minimum-time-on-form check, and heuristics that flag excessive links,
  character-repeat spam, and ALL-CAPS shouting.
- **Auth:** admin password is hashed with `scrypt` (never stored in
  plaintext); sessions are signed JWTs in an `httpOnly`, `Secure`,
  `SameSite=Lax` cookie — verified both in `middleware.ts` and again inside
  each admin API route (defense in depth).
- **Headers:** a strict, nonce-based `Content-Security-Policy`, plus
  `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy`, and a locked-down `Permissions-Policy`, applied in
  `middleware.ts` to every response.
- **Input handling:** all input validated server-side with `zod` and
  length-capped (1500 chars for questions, 3000 for answers) regardless of
  what the client sends; control characters are stripped; React escapes all
  rendered output, so stored content is never interpreted as HTML.
- **SQL injection:** not applicable — all queries go through Drizzle's
  parameterized query builder, no raw string interpolation.

## Project layout

```
app/
  page.tsx                    Public wall (server-rendered first page)
  admin/                       Admin login + moderation dashboard
  api/questions/               Public submit + list endpoints
  api/admin/                   Protected moderation endpoints
components/                    UI: wall, ask modal, admin dashboard, icons
lib/
  db/                          Drizzle schema + client
  auth/                        Password hashing + session JWTs
  security/                    IP hashing, rate limiting, content sanitization
middleware.ts                  CSP/security headers + admin route protection
scripts/setup-env.ts           One-shot admin password + secrets generator
```
