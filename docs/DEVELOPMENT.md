# Chirpy — Development Guide

Quick reference for running and maintaining the Chirpy API during local development on **Ubuntu / WSL**.

> This guide reflects the project through the **Drizzle ORM** lesson. It documents commands already used and marks optional conveniences separately. Keep secrets out of Git.

## 1. Prerequisites

- Node.js 22+ and npm (the project has been developed with Node.js 22 via NVM).
- PostgreSQL 15+ and the `psql` CLI.
- Project dependencies installed with `npm install`.
- A local PostgreSQL database named `chirpy`.

Check your tools:

```bash
node --version
npm --version
psql --version
```

## 2. Start the application

From the project root:

```bash
npm install                 # First run, or after dependency changes
npm run dev                # Compile TypeScript and start the server
```

The current `dev` command compiles and starts the app **once**; it is not a hot-reload watcher. After changing source files, stop the process and run it again.

Expected local URL: `http://localhost:8080`.

Quick health check (in another terminal):

```bash
curl -i http://localhost:8080/api/healthz
```

## 3. PostgreSQL: start, connect, inspect

Start the local database service (usually needed after a WSL restart):

```bash
sudo service postgresql start
sudo service postgresql status
```

Connect as the local PostgreSQL administrator without putting a password in your shell history:

```bash
sudo -u postgres psql -d chirpy
```

Alternatively, if you have configured password authentication and loaded a `DATABASE_URL` environment variable into your shell:

```bash
psql "$DATABASE_URL"
```

Useful commands **inside `psql`**:

```text
\conninfo          Show the current connection
\dt                List tables
\d users           Inspect the users table and constraints
SELECT version();  Show the PostgreSQL server version
\q                 Exit psql
```

One-time database creation, **only if `chirpy` does not already exist**:

```bash
sudo -u postgres createdb chirpy
```

The existing `users` table is created through Drizzle migrations, not by manually recreating it.

## 4. Drizzle: schema and migrations

| Path | Purpose |
| --- | --- |
| `src/db/schema.ts` | TypeScript definitions of the desired database schema |
| `src/db/migrations/` | Generated SQL migrations and Drizzle metadata |
| `drizzle.config.ts` | Drizzle Kit schema, output, dialect, and connection configuration |

Current schema: `users` with UUID primary key `id`, non-null `created_at` and `updated_at`, and unique non-null `email` (`VARCHAR(256)`).

When you change `src/db/schema.ts`, use this sequence:

```bash
npx drizzle-kit generate   # Generate migration files
# Review the generated SQL before applying it.
npx drizzle-kit migrate    # Apply pending migrations to chirpy
```

Verify the result:

```bash
sudo -u postgres psql -d chirpy
```

Then run `\d users` (or inspect the table you changed) inside `psql`.

**Important:** Editing `schema.ts` alone does not change PostgreSQL. Generating a migration also does not apply it. The `migrate` step updates the actual database.

`updatedAt` uses Drizzle's `$onUpdate(() => new Date())`: updates made through Drizzle can set the timestamp, but raw SQL updates will **not** trigger that behavior automatically. It is not a PostgreSQL trigger.

### Optional npm shortcuts

If you add the following entries to the existing `scripts` object in `package.json`, you can use shorter commands. **Do not replace the entire `scripts` object.**

```json
{
  "db:generate": "drizzle-kit generate",
  "db:migrate": "drizzle-kit migrate",
  "db:studio": "drizzle-kit studio"
}
```

Then use `npm run db:generate` and `npm run db:migrate`. These shortcuts are suggestions; the `npx` commands above work without them.

## 5. Local configuration and Git safety

The Drizzle lesson temporarily uses a hard-coded connection string in `drizzle.config.ts`. **Do not commit that file while it contains a real password or other secrets.** Before committing, migrate the connection setting to an environment variable and review the diff.

A future environment-based setup could use a locally ignored `.env` and a committed `.env.example` with placeholders. This is **not assumed to be implemented yet**.

Never commit `.env`, passwords, tokens, or connection strings containing credentials. Migration files, schema definitions, and this development guide are normally safe and useful to commit.

Check staged changes before every commit:

```bash
git status
git diff --cached
```

## 6. Current HTTP endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/healthz` | Readiness check; responds `OK` |
| POST | `/api/validate_chirp` | Validate and clean a chirp body |
| GET | `/admin/metrics` | Show in-memory `/app` visit count |
| POST | `/admin/reset` | Reset the in-memory visit count |
| GET | `/app/...` | Serve static files |

Example validation request:

```bash
curl -i -X POST http://localhost:8080/api/validate_chirp \
  -H 'Content-Type: application/json' \
  -d '{"body":"Hello from Chirpy"}'
```

The chirp body must be a string and at most 140 characters. Overlong chirps produce HTTP `400` with the message `Chirp is too long. Max length is 140`. The profanity filter replaces exact, case-insensitive space-delimited matches for `kerfuffle`, `sharbert`, and `fornax` with `****`.

The `/admin` prefix is **not** authentication. The metrics counter lives in application memory and resets when the server process restarts; the PostgreSQL `users` table is persistent.

## 7. Testing and troubleshooting

Run the Boot.dev CLI tests as directed by the current lesson. No project-local test script is assumed here.

| Problem | First check |
| --- | --- |
| Server is not responding | Is `npm run dev` running? Is port `8080` free? |
| Changes do not appear | Restart `npm run dev`; it does not watch files automatically. |
| Cannot connect to PostgreSQL | `sudo service postgresql status`; verify the database name and connection credentials. |
| Schema change not visible | Did you run both `generate` and `migrate`? Inspect the generated SQL and `\d` output. |
| Drizzle connection fails | Check `drizzle.config.ts`, the URL, port `5432`, and local SSL settings (`sslmode=disable` where applicable). |

## 8. Quick daily workflow

```bash
# When starting a WSL development session:
sudo service postgresql start
npm run dev

# After a database schema change:
npx drizzle-kit generate
# Review migration SQL.
npx drizzle-kit migrate

# Before committing:
git status
git diff --cached
```

Keep this guide limited to commands and procedures actually useful during development. Put reusable technical explanations in your learning notes, not duplicate copies of project instructions.
