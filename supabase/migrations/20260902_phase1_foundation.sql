-- ==========================================================
-- ARTISANCONNECT: PHASE 1 FOUNDATION MIGRATION
-- ==========================================================

-- 1. Enable required extensions
create extension if not exists "uuid-ossp";

-- 2. Create public.profiles table
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text not null,
  email text not null,
  phone text,
  role text not null check (role in ('customer', 'artisan', 'admin')),
  avatar_url text,
  location text default 'Osogbo, Osun State',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Add indexes for fast lookups
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_email on public.profiles(email);

-- 3. Create public.categories table
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  slug text unique not null,
  description text,
  icon text,
  is_active boolean default true not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_categories_slug on public.categories(slug);
create index if not exists idx_categories_is_active on public.categories(is_active);

-- 4. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.categories enable row level security;

-- ==========================================================
-- ROW LEVEL SECURITY POLICIES
-- ==========================================================

-- PROFILES POLICIES
-- 1. Anyone (public or authenticated) can view profiles
drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
create policy "Public profiles are viewable by everyone." 
  on public.profiles for select 
  using (true);

-- 2. Users can insert their own profile
drop policy if exists "Users can insert their own profile." on public.profiles;
create policy "Users can insert their own profile." 
  on public.profiles for insert 
  with check (auth.uid() = id);

-- 3. Users can update their own profile, but cannot elevate themselves to admin if not already admin
drop policy if exists "Users can update their own profile." on public.profiles;
create policy "Users can update their own profile." 
  on public.profiles for update 
  using (auth.uid() = id)
  with check (
    auth.uid() = id 
    and (
      role = (select role from public.profiles where id = auth.uid()) 
      or (select role from public.profiles where id = auth.uid()) = 'admin'
    )
  );

-- CATEGORIES POLICIES
-- 1. Public can view active categories
drop policy if exists "Active categories are viewable by everyone." on public.categories;
create policy "Active categories are viewable by everyone." 
  on public.categories for select 
  using (is_active = true);

-- 2. Admins can manage categories
drop policy if exists "Admins can manage categories." on public.categories;
create policy "Admins can manage categories." 
  on public.categories for all 
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- ==========================================================
-- AUTOMATIC PROFILE TRIGGER ON AUTH SIGNUP
-- ==========================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  user_role text;
begin
  -- Validate role from raw_user_meta_data; default to 'customer' if absent or unauthorized
  user_role := coalesce(new.raw_user_meta_data->>'role', 'customer');
  if user_role not in ('customer', 'artisan') then
    user_role := 'customer';
  end if;

  insert into public.profiles (id, full_name, email, phone, role, location)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.email, ''),
    new.raw_user_meta_data->>'phone',
    user_role,
    coalesce(new.raw_user_meta_data->>'location', 'Osogbo, Osun State')
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    email = excluded.email,
    phone = coalesce(excluded.phone, profiles.phone),
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ==========================================================
-- SEED INITIAL CATEGORIES
-- ==========================================================

insert into public.categories (name, slug, description, icon) values
  ('Plumbing', 'plumbing', 'Pipes, leaks, drainage, borehole and bathroom installations', 'Wrench'),
  ('Electrical', 'electrical', 'Wiring, inverter setup, appliances, and power troubleshooting', 'Zap'),
  ('Carpentry', 'carpentry', 'Furniture making, roofing, doors, cabinets, and woodwork repairs', 'Hammer'),
  ('Painting', 'painting', 'Interior & exterior wall painting, screeding, and decorative finishes', 'Paintbrush'),
  ('Cleaning', 'cleaning', 'Residential, post-construction, and commercial deep cleaning', 'Sparkles')
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  updated_at = now();
