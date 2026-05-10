# Recipe Catalog

A full-stack recipe catalog built with Next.js 15 (App Router), Supabase (Postgres + Storage), and Vercel.

## Features

- **Public catalog** — photo grid / searchable list with full-text search and tag/category filters
- **Recipe pages** — full recipe detail with ingredients, step-by-step instructions, and print layout
- **Admin area** — passphrase-gated add/edit/delete with image upload and URL import (schema.org/Recipe JSON-LD)

---

## Quick start

### 1. Clone and install

```bash
git clone <your-repo>
cd recipe-catalog
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Open the **SQL Editor** and run the full contents of [`supabase/schema.sql`](supabase/schema.sql)
3. Open **Storage** → **New bucket**:
   - Name: `recipe-images`
   - Public: ✅ enabled
   - File size limit: 5 MB
   - Allowed MIME types: `image/jpeg, image/png, image/webp, image/gif`

### 3. Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

```env
# Supabase (Settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Editor gate — the passphrase to access /admin
EDITOR_SECRET=your-chosen-passphrase

# iron-session encryption — must be at least 32 characters
SESSION_SECRET=a-random-string-of-at-least-32-characters
```

**Get your Supabase keys:** Project dashboard → Settings → API → Project API keys

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Usage

| Route | Description |
|---|---|
| `/` | Public recipe catalog with search and filters |
| `/recipe/[slug]` | Individual recipe page (printable) |
| `/admin/login` | Enter your `EDITOR_SECRET` passphrase |
| `/admin/add` | Add a new recipe |
| `/admin/edit/[slug]` | Edit or delete an existing recipe |

### URL import

On the Add/Edit recipe page, paste a URL from a schema.org-compatible recipe site (BBC Good Food, AllRecipes, Epicurious, etc.) and click **Import**. The title, description, ingredients, steps, and photo will be pre-filled if a Recipe schema is found. Instagram URLs are blocked (unsupported).

---

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push this repo to GitHub
2. Import the repo on [vercel.com](https://vercel.com)
3. Add environment variables in **Settings → Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `EDITOR_SECRET`
   - `SESSION_SECRET` (at least 32 chars)
4. Deploy

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Database | Supabase (Postgres) |
| File storage | Supabase Storage |
| Auth | iron-session (encrypted cookie) |
| Styling | Tailwind CSS |
| Fonts | Playfair Display + Inter (via next/font) |
| Recipe import | cheerio (JSON-LD parsing) |
| Deployment | Vercel |

---

## Project structure

```
app/
  page.tsx                 # Catalog (/)
  recipe/[slug]/page.tsx   # Recipe detail
  admin/                   # Editor area (gated)
  api/                     # API routes
components/
  catalog/                 # Catalog UI
  recipe/                  # Recipe detail UI
  admin/                   # Admin forms
  ui/                      # Shared primitives
lib/
  supabase/                # Supabase clients (browser/server/service)
  session.ts               # iron-session helper
  utils.ts                 # slugify, truncate, formatDate
types/index.ts             # TypeScript interfaces
supabase/schema.sql        # Database schema + seed data
middleware.ts              # Admin route protection
```

---

## Database schema

See [`supabase/schema.sql`](supabase/schema.sql) for the full schema with comments.

Tables: `recipes`, `tags`, `categories`, `recipe_tags`, `recipe_categories`

Full-text search is powered by a generated `tsvector` column and the `search_recipes` Postgres function.
