-- Dynamic 360 tours, administrator authorization, and private panorama storage.
-- Bootstrap the first administrator after applying this migration with a trusted
-- SQL/service-role session:
-- insert into public.sulyap_admins (user_id) values ('<auth.users id>');

create table if not exists public.sulyap_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.sulyap_admins enable row level security;

create or replace function public.is_sulyap_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.sulyap_admins where user_id = auth.uid()
  );
$$;

revoke all on function public.is_sulyap_admin() from public;
grant execute on function public.is_sulyap_admin() to anon, authenticated;

drop policy if exists "Administrators can read administrator assignments" on public.sulyap_admins;
create policy "Administrators can read administrator assignments"
  on public.sulyap_admins for select to authenticated
  using (public.is_sulyap_admin());

drop policy if exists "Administrators can add administrator assignments" on public.sulyap_admins;
create policy "Administrators can add administrator assignments"
  on public.sulyap_admins for insert to authenticated
  with check (public.is_sulyap_admin());

drop policy if exists "Administrators can remove administrator assignments" on public.sulyap_admins;
create policy "Administrators can remove administrator assignments"
  on public.sulyap_admins for delete to authenticated
  using (public.is_sulyap_admin());

create table if not exists public.panorama_tours (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid references public.destinations(id) on delete set null,
  destination_slug text not null references public.destinations(slug) on delete cascade,
  title text not null,
  description text not null default '',
  cover_image_path text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists panorama_tours_dest_slug_idx
  on public.panorama_tours (destination_slug, status);

create table if not exists public.panorama_scenes (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid not null references public.panorama_tours(id) on delete cascade,
  title text not null,
  location_label text not null default '',
  original_image_path text not null,
  preview_image_path text,
  tile_configuration jsonb not null default '{}'::jsonb,
  initial_view jsonb not null default '{"hlookat":0,"vlookat":0,"fov":80}'::jsonb,
  display_order integer not null default 0,
  status text not null default 'draft' check (status in ('active', 'draft', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists panorama_scenes_tour_id_idx
  on public.panorama_scenes (tour_id, display_order);

create table if not exists public.panorama_hotspots (
  id uuid primary key default gen_random_uuid(),
  scene_id uuid not null references public.panorama_scenes(id) on delete cascade,
  hotspot_type text not null default 'art'
    check (hotspot_type in ('art', 'door', 'stairs-up', 'stairs-down', 'info', 'path')),
  title text not null,
  subtitle text not null default '',
  bearing numeric not null default 0 check (bearing >= -180 and bearing <= 180),
  pitch numeric not null default 0 check (pitch >= -90 and pitch <= 90),
  target_scene_id uuid references public.panorama_scenes(id) on delete set null,
  display_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists panorama_hotspots_scene_id_idx
  on public.panorama_hotspots (scene_id, display_order);

create table if not exists public.panorama_artworks (
  id uuid primary key default gen_random_uuid(),
  scene_id uuid not null references public.panorama_scenes(id) on delete cascade,
  hotspot_id uuid unique references public.panorama_hotspots(id) on delete cascade,
  title text not null,
  filipino_title text not null default '',
  artist text not null default '',
  historical_period text not null default '',
  medium text not null default '',
  dimensions text not null default '',
  description text not null default '',
  historical_significance text not null default '',
  conservation_notes text not null default '',
  image_path text,
  display_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists panorama_artworks_scene_id_idx
  on public.panorama_artworks (scene_id, display_order);

alter table public.panorama_tours enable row level security;
alter table public.panorama_scenes enable row level security;
alter table public.panorama_hotspots enable row level security;
alter table public.panorama_artworks enable row level security;

drop policy if exists "Panorama tours are publicly readable" on public.panorama_tours;
drop policy if exists "Published panorama tours are publicly readable" on public.panorama_tours;
create policy "Published panorama tours are publicly readable"
  on public.panorama_tours for select to anon, authenticated
  using (status = 'published' or public.is_sulyap_admin());

drop policy if exists "Panorama scenes are publicly readable" on public.panorama_scenes;
drop policy if exists "Published panorama scenes are publicly readable" on public.panorama_scenes;
create policy "Published panorama scenes are publicly readable"
  on public.panorama_scenes for select to anon, authenticated
  using (
    public.is_sulyap_admin() or (
      status = 'active' and exists (
        select 1 from public.panorama_tours t
        where t.id = tour_id and t.status = 'published'
      )
    )
  );

drop policy if exists "Panorama hotspots are publicly readable" on public.panorama_hotspots;
drop policy if exists "Published panorama hotspots are publicly readable" on public.panorama_hotspots;
create policy "Published panorama hotspots are publicly readable"
  on public.panorama_hotspots for select to anon, authenticated
  using (
    public.is_sulyap_admin() or exists (
      select 1 from public.panorama_scenes s
      join public.panorama_tours t on t.id = s.tour_id
      where s.id = scene_id and s.status = 'active' and t.status = 'published'
    )
  );

drop policy if exists "Panorama artworks are publicly readable" on public.panorama_artworks;
drop policy if exists "Published panorama artworks are publicly readable" on public.panorama_artworks;
create policy "Published panorama artworks are publicly readable"
  on public.panorama_artworks for select to anon, authenticated
  using (
    public.is_sulyap_admin() or (
      status = 'published' and exists (
        select 1 from public.panorama_scenes s
        join public.panorama_tours t on t.id = s.tour_id
        where s.id = scene_id and s.status = 'active' and t.status = 'published'
      )
    )
  );

drop policy if exists "Authorized administrators can manage panorama tours" on public.panorama_tours;
create policy "Administrators can manage panorama tours"
  on public.panorama_tours for all to authenticated
  using (public.is_sulyap_admin())
  with check (public.is_sulyap_admin() and created_by = auth.uid());

drop policy if exists "Authorized administrators can manage panorama scenes" on public.panorama_scenes;
create policy "Administrators can manage panorama scenes"
  on public.panorama_scenes for all to authenticated
  using (public.is_sulyap_admin()) with check (public.is_sulyap_admin());

drop policy if exists "Authorized administrators can manage panorama hotspots" on public.panorama_hotspots;
create policy "Administrators can manage panorama hotspots"
  on public.panorama_hotspots for all to authenticated
  using (public.is_sulyap_admin()) with check (public.is_sulyap_admin());

drop policy if exists "Authorized administrators can manage panorama artworks" on public.panorama_artworks;
create policy "Administrators can manage panorama artworks"
  on public.panorama_artworks for all to authenticated
  using (public.is_sulyap_admin()) with check (public.is_sulyap_admin());

grant select on public.panorama_tours, public.panorama_scenes,
  public.panorama_hotspots, public.panorama_artworks to anon, authenticated;
grant insert, update, delete on public.panorama_tours, public.panorama_scenes,
  public.panorama_hotspots, public.panorama_artworks to authenticated;

-- End the classroom prototype's anonymous content writes.
drop policy if exists "Anyone can add destinations" on public.destinations;
drop policy if exists "Anyone can update destinations" on public.destinations;
drop policy if exists "Anyone can delete destinations" on public.destinations;
drop policy if exists "Administrators can insert destinations" on public.destinations;
drop policy if exists "Administrators can update destinations" on public.destinations;
drop policy if exists "Administrators can delete destinations" on public.destinations;
create policy "Administrators can insert destinations" on public.destinations
  for insert to authenticated with check (public.is_sulyap_admin());
create policy "Administrators can update destinations" on public.destinations
  for update to authenticated using (public.is_sulyap_admin()) with check (public.is_sulyap_admin());
create policy "Administrators can delete destinations" on public.destinations
  for delete to authenticated using (public.is_sulyap_admin());

-- Lock down the optional classroom quiz table when it exists. The optional
-- legacy art-piece table is intentionally not referenced by this migration.
do $$
begin
  if to_regclass('public.destination_questions') is not null then
    execute 'drop policy if exists "Anyone can insert questions" on public.destination_questions';
    execute 'drop policy if exists "Anyone can update questions" on public.destination_questions';
    execute 'drop policy if exists "Anyone can delete questions" on public.destination_questions';
    execute 'drop policy if exists "Administrators can insert questions" on public.destination_questions';
    execute 'drop policy if exists "Administrators can update questions" on public.destination_questions';
    execute 'drop policy if exists "Administrators can delete questions" on public.destination_questions';
    execute 'create policy "Administrators can insert questions" on public.destination_questions for insert to authenticated with check (public.is_sulyap_admin())';
    execute 'create policy "Administrators can update questions" on public.destination_questions for update to authenticated using (public.is_sulyap_admin()) with check (public.is_sulyap_admin())';
    execute 'create policy "Administrators can delete questions" on public.destination_questions for delete to authenticated using (public.is_sulyap_admin())';
  end if;
end
$$;

drop policy if exists "Public upload destination images" on storage.objects;
drop policy if exists "Public update destination images" on storage.objects;
drop policy if exists "Public delete destination images" on storage.objects;
drop policy if exists "Administrators can upload destination images" on storage.objects;
drop policy if exists "Administrators can update destination images" on storage.objects;
drop policy if exists "Administrators can delete destination images" on storage.objects;
create policy "Administrators can upload destination images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'destination-images' and public.is_sulyap_admin());
create policy "Administrators can update destination images" on storage.objects
  for update to authenticated
  using (bucket_id = 'destination-images' and public.is_sulyap_admin())
  with check (bucket_id = 'destination-images' and public.is_sulyap_admin());
create policy "Administrators can delete destination images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'destination-images' and public.is_sulyap_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'panorama-assets',
  'panorama-assets',
  false,
  52428800,
  array['image/jpeg', 'image/webp', 'image/png']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Panorama assets are readable" on storage.objects;
create policy "Panorama assets are readable" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'panorama-assets');

drop policy if exists "Administrators can upload panorama assets" on storage.objects;
create policy "Administrators can upload panorama assets" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'panorama-assets' and public.is_sulyap_admin());

drop policy if exists "Administrators can update panorama assets" on storage.objects;
create policy "Administrators can update panorama assets" on storage.objects
  for update to authenticated
  using (bucket_id = 'panorama-assets' and public.is_sulyap_admin())
  with check (bucket_id = 'panorama-assets' and public.is_sulyap_admin());

drop policy if exists "Administrators can delete panorama assets" on storage.objects;
create policy "Administrators can delete panorama assets" on storage.objects
  for delete to authenticated
  using (bucket_id = 'panorama-assets' and public.is_sulyap_admin());
