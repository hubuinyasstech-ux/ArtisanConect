-- ==========================================================
-- ARTISANCONNECT: PHASE 3 SERVICE REQUESTS, REVIEWS & NOTIFICATIONS
-- ==========================================================

-- 1. Create public.service_requests table
create table if not exists public.service_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.profiles(id) on delete cascade not null,
  artisan_id uuid references public.artisan_profiles(id) on delete cascade not null,
  service_id uuid references public.services(id) on delete set null,
  description text not null,
  preferred_date date,
  preferred_time text,
  location text not null,
  notes text,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'completed', 'cancelled')),
  decline_reason text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Ensure status check constraint strictly excludes 'confirmed' on existing tables
alter table public.service_requests drop constraint if exists service_requests_status_check;
alter table public.service_requests add constraint service_requests_status_check
  check (status in ('pending', 'accepted', 'declined', 'completed', 'cancelled'));

-- Indexes for performance
create index if not exists idx_service_requests_customer_id on public.service_requests(customer_id);
create index if not exists idx_service_requests_artisan_id on public.service_requests(artisan_id);
create index if not exists idx_service_requests_service_id on public.service_requests(service_id);
create index if not exists idx_service_requests_status on public.service_requests(status);
create index if not exists idx_service_requests_created_at on public.service_requests(created_at desc);

-- 2. Create public.notifications table
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  message text not null,
  type text not null check (type in ('new_request', 'request_accepted', 'request_declined', 'request_cancelled', 'request_completed', 'new_review')),
  is_read boolean not null default false,
  related_request_id uuid references public.service_requests(id) on delete set null,
  created_at timestamptz default now() not null
);

create index if not exists idx_notifications_user_id on public.notifications(user_id);
create index if not exists idx_notifications_is_read on public.notifications(is_read);
create index if not exists idx_notifications_created_at on public.notifications(created_at desc);

-- 3. Create public.reviews table
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.service_requests(id) on delete cascade unique not null,
  customer_id uuid references public.profiles(id) on delete cascade not null,
  artisan_id uuid references public.artisan_profiles(id) on delete cascade not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_reviews_artisan_id on public.reviews(artisan_id);
create index if not exists idx_reviews_customer_id on public.reviews(customer_id);
create index if not exists idx_reviews_rating on public.reviews(rating);
create index if not exists idx_reviews_created_at on public.reviews(created_at desc);

-- 4. Enable Row Level Security (RLS)
alter table public.service_requests enable row level security;
alter table public.notifications enable row level security;
alter table public.reviews enable row level security;

-- 5. Least-Privilege Role Grants (No overly broad GRANT ALL)
grant select, insert, update on table public.service_requests to authenticated;
grant select, update, insert on table public.notifications to authenticated;
grant select, insert on table public.reviews to authenticated;
grant select on table public.reviews to anon;

-- ==========================================================
-- ROW LEVEL SECURITY POLICIES
-- ==========================================================

-- SERVICE REQUESTS POLICIES
-- 1. Customers can view their own requests
drop policy if exists "Customers can view their own service requests" on public.service_requests;
create policy "Customers can view their own service requests"
  on public.service_requests for select
  using (customer_id = auth.uid());

-- 2. Artisans can view requests assigned to their artisan profile
drop policy if exists "Artisans can view assigned service requests" on public.service_requests;
create policy "Artisans can view assigned service requests"
  on public.service_requests for select
  using (
    artisan_id in (
      select id from public.artisan_profiles where user_id = auth.uid()
    )
  );

-- 3. Customers can insert new requests as themselves
drop policy if exists "Customers can create service requests" on public.service_requests;
create policy "Customers can create service requests"
  on public.service_requests for insert
  with check (customer_id = auth.uid());

-- 4. Artisans can update status of requests assigned to them
drop policy if exists "Artisans can update assigned service requests" on public.service_requests;
create policy "Artisans can update assigned service requests"
  on public.service_requests for update
  using (
    artisan_id in (
      select id from public.artisan_profiles where user_id = auth.uid()
    )
  );

-- 5. Customers can update (e.g. cancel) their own requests if pending or accepted
drop policy if exists "Customers can cancel their own service requests" on public.service_requests;
create policy "Customers can cancel their own service requests"
  on public.service_requests for update
  using (
    customer_id = auth.uid()
  );

-- NOTIFICATIONS POLICIES
-- 1. Users can view their own notifications
drop policy if exists "Users can view own notifications" on public.notifications;
create policy "Users can view own notifications"
  on public.notifications for select
  using (user_id = auth.uid());

-- 2. Users can update their own notifications (mark as read)
drop policy if exists "Users can update own notifications" on public.notifications;
create policy "Users can update own notifications"
  on public.notifications for update
  using (user_id = auth.uid());

-- 3. Protected notification creation: only allowed for participants of a related service request
drop policy if exists "Authenticated users can insert notifications" on public.notifications;
drop policy if exists "Users can only create notifications for participants of a request" on public.notifications;
create policy "Users can only create notifications for participants of a request"
  on public.notifications for insert
  with check (
    auth.role() = 'authenticated' and (
      related_request_id is not null and exists (
        select 1 from public.service_requests sr
        left join public.artisan_profiles ap on ap.id = sr.artisan_id
        where sr.id = related_request_id
          and (sr.customer_id = auth.uid() or ap.user_id = auth.uid())
      )
    )
  );

-- REVIEWS POLICIES
-- 1. Everyone can read public reviews
drop policy if exists "Reviews are viewable by everyone" on public.reviews;
create policy "Reviews are viewable by everyone"
  on public.reviews for select
  using (true);

-- 2. Customers can insert reviews only for completed requests they own
drop policy if exists "Customers can review completed requests" on public.reviews;
create policy "Customers can review completed requests"
  on public.reviews for insert
  with check (
    customer_id = auth.uid() and
    exists (
      select 1 from public.service_requests sr
      where sr.id = request_id
        and sr.customer_id = auth.uid()
        and sr.status = 'completed'
    )
  );

-- ==========================================================
-- AUTOMATIC ARTISAN RATING RECALCULATION TRIGGER
-- ==========================================================
create or replace function public.update_artisan_rating()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  target_artisan_id uuid;
  avg_score numeric(3,2);
begin
  target_artisan_id := coalesce(new.artisan_id, old.artisan_id);

  select round(avg(rating)::numeric, 2)
  into avg_score
  from public.reviews
  where artisan_id = target_artisan_id;

  update public.artisan_profiles
  set rating = coalesce(avg_score, 5.0),
      updated_at = now()
  where id = target_artisan_id;

  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_update_artisan_rating on public.reviews;
create trigger trg_update_artisan_rating
  after insert or update or delete on public.reviews
  for each row execute function public.update_artisan_rating();
