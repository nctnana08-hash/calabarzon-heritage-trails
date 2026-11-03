-- Phase 3 optional table: 360-degree Art Pieces & Architectural Relics per destination
create table if not exists public.destination_art_pieces (
  id uuid primary key default gen_random_uuid(),
  destination_slug text not null references public.destinations(slug) on delete cascade,
  catalog_code text not null unique,
  title text not null,
  fil_title text not null default '',
  artist_or_maker text not null default '',
  period text not null default '',
  medium text not null default '',
  dimensions text not null default '',
  bearing integer not null default 0 check (bearing >= 0 and bearing < 360),
  pitch integer not null default 0 check (pitch >= -90 and pitch <= 90),
  zone text not null default '',
  motif text not null default 'sculpture',
  details text not null default '',
  conservation_note text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists destination_art_pieces_slug_idx
  on public.destination_art_pieces (destination_slug);

alter table public.destination_art_pieces enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'destination_art_pieces'
      and policyname = 'Art pieces are publicly readable'
  ) then
    create policy "Art pieces are publicly readable"
      on public.destination_art_pieces for select
      to anon, authenticated
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'destination_art_pieces'
      and policyname = 'Anyone can insert art pieces in prototype'
  ) then
    create policy "Anyone can insert art pieces in prototype"
      on public.destination_art_pieces for insert
      to anon, authenticated
      with check (true);
  end if;
end $$;
