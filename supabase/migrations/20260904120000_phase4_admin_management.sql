-- ==========================================================
-- ARTISANCONNECT: PHASE 4 ADMIN & PLATFORM MANAGEMENT MIGRATION
-- ==========================================================

-- 1. Extend public.profiles with account status & suspension fields
alter table public.profiles
  add column if not exists status text not null default 'active' check (status in ('active', 'suspended')),
  add column if not exists suspension_reason text,
  add column if not exists suspended_at timestamptz;

create index if not exists idx_profiles_status on public.profiles(status);

-- 2. Extend public.artisan_profiles with verification audit fields & rejected status
alter table public.artisan_profiles
  drop constraint if exists artisan_profiles_verification_status_check;

alter table public.artisan_profiles
  add constraint artisan_profiles_verification_status_check
  check (verification_status in ('unverified', 'pending', 'verified', 'rejected'));

alter table public.artisan_profiles
  add column if not exists verification_notes text,
  add column if not exists verification_requested_at timestamptz,
  add column if not exists verification_reviewed_at timestamptz,
  add column if not exists verification_reviewed_by uuid references public.profiles(id) on delete set null;

-- 3. Extend public.services with moderation status and audit fields
alter table public.services
  add column if not exists moderation_status text not null default 'active' check (moderation_status in ('active', 'hidden', 'under_review')),
  add column if not exists moderation_reason text,
  add column if not exists moderated_at timestamptz,
  add column if not exists moderated_by uuid references public.profiles(id) on delete set null;

create index if not exists idx_services_moderation_status on public.services(moderation_status);

-- 4. Create public.reports table
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles(id) on delete cascade not null,
  reported_user_id uuid references public.profiles(id) on delete set null,
  service_id uuid references public.services(id) on delete set null,
  request_id uuid references public.service_requests(id) on delete set null,
  reason text not null,
  description text not null,
  status text not null default 'open' check (status in ('open', 'under_review', 'resolved', 'dismissed')),
  admin_notes text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  constraint reports_target_check check (
    reported_user_id is not null or service_id is not null or request_id is not null
  )
);

create index if not exists idx_reports_reporter_id on public.reports(reporter_id);
create index if not exists idx_reports_reported_user_id on public.reports(reported_user_id);
create index if not exists idx_reports_service_id on public.reports(service_id);
create index if not exists idx_reports_request_id on public.reports(request_id);
create index if not exists idx_reports_status on public.reports(status);
create index if not exists idx_reports_created_at on public.reports(created_at desc);

-- 5. Extend public.notifications type constraint
alter table public.notifications
  drop constraint if exists notifications_type_check;

alter table public.notifications
  add constraint notifications_type_check check (
    type in (
      'new_request',
      'request_accepted',
      'request_declined',
      'request_cancelled',
      'request_completed',
      'new_review',
      'verification_submitted',
      'verification_approved',
      'verification_rejected',
      'report_submitted',
      'report_resolved',
      'account_suspended'
    )
  );

-- 6. Enable RLS on reports table
alter table public.reports enable row level security;

-- 7. Reports RLS Policies
drop policy if exists "Users and Admins can view reports" on public.reports;
create policy "Users and Admins can view reports"
  on public.reports for select
  using (
    reporter_id = auth.uid() or exists (
      select 1 from public.profiles where id = auth.uid() and role = 'admin'
    )
  );

drop policy if exists "Authenticated users can submit reports" on public.reports;
create policy "Authenticated users can submit reports"
  on public.reports for insert
  with check (reporter_id = auth.uid());

drop policy if exists "Admins can update reports" on public.reports;
create policy "Admins can update reports"
  on public.reports for update
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  )
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- 8. Profiles RLS Policies: Allow Admins to update user status
drop policy if exists "Admins can update profiles" on public.profiles;
create policy "Admins can update profiles"
  on public.profiles for update
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  )
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- 9. Artisan Profiles RLS: Allow Admins to update verification status & notes
drop policy if exists "Admins can update artisan profiles" on public.artisan_profiles;
create policy "Admins can update artisan profiles"
  on public.artisan_profiles for update
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  )
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- 10. Services RLS: Block artisans from updating hidden services; Allow Admins full moderation
drop policy if exists "Artisans can update their own services" on public.services;
drop policy if exists "Artisans can update non-hidden services or Admins can moderate" on public.services;
create policy "Artisans can update non-hidden services or Admins can moderate"
  on public.services for update
  using (
    (
      artisan_id in (select id from public.artisan_profiles where user_id = auth.uid())
      and moderation_status != 'hidden'
    )
    or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  )
  with check (
    (
      artisan_id in (select id from public.artisan_profiles where user_id = auth.uid())
      and moderation_status != 'hidden'
    )
    or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- 11. Least-privilege Grants
grant select, insert, update on table public.reports to authenticated;
grant select on table public.reports to anon;
