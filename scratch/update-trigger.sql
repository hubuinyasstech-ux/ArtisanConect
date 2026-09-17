CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_role text;
  u_name text;
  u_category text;
  u_business text;
  u_exp int;
BEGIN
  user_role := coalesce(new.raw_user_meta_data->>'role', 'customer');
  if user_role not in ('customer', 'artisan') then
    user_role := 'customer';
  end if;

  u_name := coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));
  u_category := coalesce(new.raw_user_meta_data->>'category', 'Plumbing');
  u_business := coalesce(new.raw_user_meta_data->>'business_name', u_name);
  u_exp := coalesce((new.raw_user_meta_data->>'years_experience')::int, 1);

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

  -- If registered as an artisan, ensure an initial artisan_profiles row exists with selected category
  if user_role = 'artisan' then
    insert into public.artisan_profiles (user_id, business_name, category, years_experience)
    values (new.id, u_business, u_category, u_exp)
    on conflict (user_id) do update set
      business_name = excluded.business_name,
      category = excluded.category,
      years_experience = excluded.years_experience,
      updated_at = now();
  end if;

  return new;
END;
$$;
