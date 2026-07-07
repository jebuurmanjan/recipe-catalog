-- ============================================================
-- Recipe Catalog — Supabase schema
-- Run in the Supabase SQL Editor (project dashboard › SQL Editor)
-- ============================================================

-- Enable pgcrypto for gen_random_uuid()
create extension if not exists "pgcrypto";

-- ── Core tables ──────────────────────────────────────────────

create table if not exists recipes (
  id           uuid        primary key default gen_random_uuid(),
  title        text        not null,
  slug         text        unique not null,
  description  text,
  ingredients  jsonb       not null default '[]',   -- string[]
  steps        jsonb       not null default '[]',   -- string[]
  image_url    text,
  source_url   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists tags (
  id    uuid primary key default gen_random_uuid(),
  name  text unique not null
);

create table if not exists categories (
  id    uuid primary key default gen_random_uuid(),
  name  text not null,
  type  text not null,  -- 'cuisine' | 'diet' | 'occasion' | 'effort'
  constraint categories_type_check
    check (type in ('cuisine', 'diet', 'occasion', 'effort'))
);

create table if not exists recipe_tags (
  recipe_id  uuid not null references recipes(id) on delete cascade,
  tag_id     uuid not null references tags(id)    on delete cascade,
  primary key (recipe_id, tag_id)
);

create table if not exists recipe_categories (
  recipe_id   uuid not null references recipes(id)    on delete cascade,
  category_id uuid not null references categories(id) on delete cascade,
  primary key (recipe_id, category_id)
);

-- ── Full-text search column ──────────────────────────────────
-- Generated column — automatically updated on insert/update

alter table recipes
  add column if not exists search_vector tsvector
  generated always as (
    to_tsvector('english',
      coalesce(title, '') || ' ' || coalesce(description, '')
    )
  ) stored;

create index if not exists recipes_search_vector_idx
  on recipes using gin(search_vector);

-- ── Performance indexes ──────────────────────────────────────

create index if not exists recipe_tags_recipe_id       on recipe_tags(recipe_id);
create index if not exists recipe_tags_tag_id          on recipe_tags(tag_id);
create index if not exists recipe_categories_recipe_id on recipe_categories(recipe_id);
create index if not exists recipe_categories_cat_id    on recipe_categories(category_id);
create index if not exists recipes_slug_idx            on recipes(slug);
create index if not exists categories_type_idx         on categories(type);

-- ── updated_at trigger ───────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists recipes_updated_at on recipes;
create trigger recipes_updated_at
  before update on recipes
  for each row execute function set_updated_at();

-- ── Full-text search RPC ─────────────────────────────────────

create or replace function public.search_recipes(query text)
returns setof public.recipes
language sql stable
set search_path = ''
as $$
  select *
  from public.recipes
  where search_vector @@ websearch_to_tsquery('english', query)
  order by ts_rank(search_vector, websearch_to_tsquery('english', query)) desc;
$$;

-- ── Row Level Security ───────────────────────────────────────
-- Public read; writes are done exclusively via the service role key
-- (bypasses RLS) through Next.js API routes.

alter table recipes         enable row level security;
alter table tags            enable row level security;
alter table categories      enable row level security;
alter table recipe_tags     enable row level security;
alter table recipe_categories enable row level security;

-- Public read policies
create policy "Public read recipes"
  on recipes for select using (true);

create policy "Public read tags"
  on tags for select using (true);

create policy "Public read categories"
  on categories for select using (true);

create policy "Public read recipe_tags"
  on recipe_tags for select using (true);

create policy "Public read recipe_categories"
  on recipe_categories for select using (true);

alter table collections        enable row level security;
alter table collection_recipes enable row level security;

-- Collections are private — only the owner can read via anon key.
-- (Service role bypasses RLS automatically for share pages & API routes.)
create policy "Owner reads own collections"
  on collections for select
  using (auth.uid() = user_id);

create policy "Owner reads own collection_recipes"
  on collection_recipes for select
  using (
    exists (
      select 1 from collections
      where collections.id = collection_recipes.collection_id
        and collections.user_id = auth.uid()
    )
  );

-- ── Seed data: category labels ───────────────────────────────

insert into categories (name, type) values
  -- Cuisine
  ('Italian',          'cuisine'),
  ('Asian',            'cuisine'),
  ('Mexican',          'cuisine'),
  ('French',           'cuisine'),
  ('Middle Eastern',   'cuisine'),
  ('American',         'cuisine'),
  ('Mediterranean',    'cuisine'),
  -- Diet
  ('Vegan',            'diet'),
  ('Vegetarian',       'diet'),
  ('Gluten-Free',      'diet'),
  ('Dairy-Free',       'diet'),
  ('Low-Carb',         'diet'),
  -- Occasion
  ('Weeknight',        'occasion'),
  ('Weekend',          'occasion'),
  ('Party',            'occasion'),
  ('Meal Prep',        'occasion'),
  ('Holiday',          'occasion'),
  -- Effort
  ('Quick',            'effort'),
  ('Medium',           'effort'),
  ('Involved',         'effort')
on conflict do nothing;

-- ── Instagram integration ────────────────────────────────────
-- Stores encrypted session cookies for saved-folder sync.
-- All access is owner-only; service role bypasses RLS for API routes.

create table if not exists instagram_settings (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  session_id  text        not null,
  ds_user_id  text        not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id)
);

alter table instagram_settings enable row level security;

create policy "Owner only"
  on instagram_settings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger instagram_settings_updated_at
  before update on instagram_settings
  for each row execute function public.set_updated_at();

-- ── Supabase Storage ─────────────────────────────────────────
-- Create the bucket via dashboard (Storage › New bucket) or CLI:
--
--   supabase storage create recipe-images --public
--
-- Settings:
--   Bucket name:  recipe-images
--   Public:       true
--   File size limit: 5242880 (5 MB)
--   Allowed MIME types: image/jpeg, image/png, image/webp, image/gif
