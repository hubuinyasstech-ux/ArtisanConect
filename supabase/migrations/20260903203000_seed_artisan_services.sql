-- ==========================================================
-- SEED INITIAL SERVICES FOR REGISTERED ARTISANS
-- ==========================================================

-- 1. Starter plumbing services for Adisa Kabiru
insert into public.services (artisan_id, title, category, price, location, description, is_active)
select 
  '52d1388c-0d8a-41e8-bc33-d1f4f693b692'::uuid,
  'Emergency Pipe Leak & Burst Repair',
  'Plumbing',
  5000,
  'Osogbo, Osun State',
  'Rapid diagnostic and sealing of leaking pipes, burst water conduits, and drainage overflow.',
  true
where exists (
  select 1 from public.artisan_profiles where id = '52d1388c-0d8a-41e8-bc33-d1f4f693b692'::uuid
) and not exists (
  select 1 from public.services where artisan_id = '52d1388c-0d8a-41e8-bc33-d1f4f693b692'::uuid and title = 'Emergency Pipe Leak & Burst Repair'
);

insert into public.services (artisan_id, title, category, price, location, description, is_active)
select 
  '52d1388c-0d8a-41e8-bc33-d1f4f693b692'::uuid,
  'Bathroom Fixture, Basin & Tank Fitting',
  'Plumbing',
  15000,
  'Osogbo, Osun State',
  'Installation and maintenance of toilet seats, water heaters, wash basins, and overhead PVC water storage tanks.',
  true
where exists (
  select 1 from public.artisan_profiles where id = '52d1388c-0d8a-41e8-bc33-d1f4f693b692'::uuid
) and not exists (
  select 1 from public.services where artisan_id = '52d1388c-0d8a-41e8-bc33-d1f4f693b692'::uuid and title = 'Bathroom Fixture, Basin & Tank Fitting'
);
