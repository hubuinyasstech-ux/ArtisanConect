-- ==========================================================
-- ARTISANCONNECT: PHASE 2 CORE PLATFORM FEATURES MIGRATION
-- ==========================================================

-- 1. Extend public.profiles table with bio
alter table public.profiles 
  add column if not exists bio text;

-- 2. Create public.artisan_profiles table
create table if not exists public.artisan_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade unique not null,
  business_name text not null,
  category text not null default 'Plumbing',
  years_experience integer not null default 1 check (years_experience >= 0),
  availability_status text not null default 'available' check (availability_status in ('available', 'busy', 'offline')),
  verification_status text not null default 'unverified' check (verification_status in ('unverified', 'pending', 'verified')),
  rating numeric(3,2) not null default 5.0 check (rating >= 0 and rating <= 5),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Indexes for efficient lookups & search
create index if not exists idx_artisan_profiles_user_id on public.artisan_profiles(user_id);
create index if not exists idx_artisan_profiles_category on public.artisan_profiles(category);
create index if not exists idx_artisan_profiles_availability on public.artisan_profiles(availability_status);
create index if not exists idx_artisan_profiles_verification on public.artisan_profiles(verification_status);

-- 3. Create public.services table
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  artisan_id uuid references public.artisan_profiles(id) on delete cascade not null,
  title text not null,
  description text,
  category text not null,
  price numeric not null default 0 check (price >= 0),
  location text not null default 'Osogbo, Osun State',
  is_active boolean not null default true,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_services_artisan_id on public.services(artisan_id);
create index if not exists idx_services_category on public.services(category);
create index if not exists idx_services_is_active on public.services(is_active);

-- 4. Enable Row Level Security
alter table public.artisan_profiles enable row level security;
alter table public.services enable row level security;

-- 5. Grant table permissions to authenticated and anon roles
grant select on table public.profiles to anon;

grant all on table public.artisan_profiles to authenticated;
grant select on table public.artisan_profiles to anon;

grant all on table public.services to authenticated;
grant select on table public.services to anon;

-- ==========================================================
-- ROW LEVEL SECURITY POLICIES
-- ==========================================================

-- ARTISAN PROFILES POLICIES
-- 1. Public can read artisan profiles
drop policy if exists "Artisan profiles are viewable by everyone" on public.artisan_profiles;
create policy "Artisan profiles are viewable by everyone"
  on public.artisan_profiles for select
  using (true);

-- 2. Artisans can insert their own profile
drop policy if exists "Artisans can insert their own profile" on public.artisan_profiles;
create policy "Artisans can insert their own profile"
  on public.artisan_profiles for insert
  with check (auth.uid() = user_id);

-- 3. Artisans can update their own profile
drop policy if exists "Artisans can update their own profile" on public.artisan_profiles;
create policy "Artisans can update their own profile"
  on public.artisan_profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- SERVICES POLICIES
-- 1. Public can view active services
drop policy if exists "Active services are viewable by everyone" on public.services;
create policy "Active services are viewable by everyone"
  on public.services for select
  using (is_active = true);

-- 2. Artisans can view all of their own services (active and inactive)
drop policy if exists "Artisans can view all their own services" on public.services;
create policy "Artisans can view all their own services"
  on public.services for select
  using (
    exists (
      select 1 from public.artisan_profiles
      where artisan_profiles.id = services.artisan_id
      and artisan_profiles.user_id = auth.uid()
    )
  );

-- 3. Artisans can insert services for their own artisan profile
drop policy if exists "Artisans can insert services for their own profile" on public.services;
create policy "Artisans can insert services for their own profile"
  on public.services for insert
  with check (
    exists (
      select 1 from public.artisan_profiles
      where artisan_profiles.id = services.artisan_id
      and artisan_profiles.user_id = auth.uid()
    )
  );

-- 4. Artisans can update their own services
drop policy if exists "Artisans can update their own services" on public.services;
create policy "Artisans can update their own services"
  on public.services for update
  using (
    exists (
      select 1 from public.artisan_profiles
      where artisan_profiles.id = services.artisan_id
      and artisan_profiles.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.artisan_profiles
      where artisan_profiles.id = services.artisan_id
      and artisan_profiles.user_id = auth.uid()
    )
  );

-- 5. Artisans can delete their own services
drop policy if exists "Artisans can delete their own services" on public.services;
create policy "Artisans can delete their own services"
  on public.services for delete
  using (
    exists (
      select 1 from public.artisan_profiles
      where artisan_profiles.id = services.artisan_id
      and artisan_profiles.user_id = auth.uid()
    )
  );

-- ==========================================================
-- UPDATE TRIGGER: AUTOMATIC ARTISAN PROFILE CREATION
-- ==========================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  user_role text;
  u_name text;
begin
  user_role := coalesce(new.raw_user_meta_data->>'role', 'customer');
  if user_role not in ('customer', 'artisan') then
    user_role := 'customer';
  end if;

  u_name := coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));

  insert into public.profiles (id, full_name, email, phone, role, location, bio)
  values (
    new.id,
    u_name,
    coalesce(new.email, ''),
    new.raw_user_meta_data->>'phone',
    user_role,
    coalesce(new.raw_user_meta_data->>'location', 'Osogbo, Osun State'),
    null
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    email = excluded.email,
    phone = coalesce(excluded.phone, profiles.phone),
    updated_at = now();

  -- If registered as an artisan, ensure an initial artisan_profiles row exists
  if user_role = 'artisan' then
    insert into public.artisan_profiles (user_id, business_name, category)
    values (new.id, u_name, 'Plumbing')
    on conflict (user_id) do nothing;
  end if;

  return new;
end;
$$;
