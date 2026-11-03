create table public.destinations (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text not null default '',
  address text not null default '',
  province text not null,
  category text not null,
  image_path text,
  latitude double precision,
  longitude double precision,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint destinations_province_check check (province in ('Cavite','Laguna','Batangas','Rizal','Quezon'))
);

grant select, insert, update, delete on public.destinations to anon, authenticated;
grant all on public.destinations to service_role;

alter table public.destinations enable row level security;

create policy "Destinations are publicly readable"
  on public.destinations for select using (true);
create policy "Anyone can add destinations"
  on public.destinations for insert with check (true);
create policy "Anyone can update destinations"
  on public.destinations for update using (true);
create policy "Anyone can delete destinations"
  on public.destinations for delete using (true);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger destinations_set_updated_at
  before update on public.destinations
  for each row execute function public.set_updated_at();

-- Storage: destination-images bucket (created via tool) — Phase 1 allows public uploads
create policy "Public read destination images"
  on storage.objects for select using (bucket_id = 'destination-images');
create policy "Public upload destination images"
  on storage.objects for insert with check (bucket_id = 'destination-images');
create policy "Public update destination images"
  on storage.objects for update using (bucket_id = 'destination-images');
create policy "Public delete destination images"
  on storage.objects for delete using (bucket_id = 'destination-images');

insert into public.destinations (slug, name, description, address, province, category, image_path, latitude, longitude, featured) values
('aguinaldo-shrine', 'Aguinaldo Shrine (Museo ni Emilio Aguinaldo)', 'The ancestral home of General Emilio Aguinaldo, first President of the Philippines, and the site where Philippine independence was proclaimed on June 12, 1898. The landmark window on the tower is where the first Philippine flag was ceremoniously unfurled. Now a museum, it houses revolutionary-era artifacts, period furniture, and dioramas of the independence proclamation.', 'Tirona Highway, Kawit', 'Cavite', 'Historical Shrines', 'aguinaldo-shrine.jpg', 14.4790, 120.8990, true),
('bonifacio-trial-house', 'Bonifacio Trial House', 'The restored bahay-na-bato where Andres Bonifacio, founder of the Katipunan, was tried for treason in 1897 during the revolution''s Tejeros Convention aftermath. The National Historical Commission operates it as a museum featuring dioramas of the trial, Katipunan artifacts, and exhibits on Bonifacio''s life and legacy.', 'Col. Riel Street, Barangay Poblacion 1-A, Maragondon', 'Cavite', 'Historical Shrines', 'bonifacio-trial-house.jpg', 14.2723, 120.7373, false),
('fort-san-felipe', 'Fort San Felipe', 'A Spanish colonial fortress completed in 1609 that guarded the old naval yard of Cavite Puerto. It is remembered as the site of the 1872 Cavite Mutiny, a pivotal event in Philippine history that led to the execution of the martyr priests GomBurZa. The fort now hosts a Philippine Navy museum with maritime and naval exhibits.', 'Cavite City', 'Cavite', 'Historical Shrines', 'fort-san-felipe.jpg', 14.4900, 120.8940, false),
('museo-de-la-salle', 'Museo De La Salle', 'A lifestyle museum on the De La Salle University-Dasmariñas campus that recreates the elegant world of the 19th-century Philippine ilustrado. Its galleries display antique furniture, heirloom tables and cabinets, paintings, and period room settings that capture the culture of landed gentry during the Spanish colonial era.', 'De La Salle University-Dasmariñas, Dasmariñas', 'Cavite', 'Museums', 'museo-de-la-salle.jpg', 14.3220, 120.9580, false),
('rizal-shrine', 'Rizal Shrine', 'A reconstructed Spanish-colonial house on the exact site where Dr. Jose Rizal, the national hero, was born on June 19, 1861. Managed by the National Historical Commission, the shrine contains original furniture, photographs, clothing, and memorabilia tracing Rizal''s childhood, studies, and the world that shaped his writings.', 'P. Burgos Street, Calamba', 'Laguna', 'Historical Shrines', 'rizal-shrine.jpg', 14.2115, 121.1614, true),
('nagcarlan-underground-cemetery', 'Nagcarlan Underground Cemetery', 'Built in 1845 under Franciscan priest Vicente Velloc, this is the only underground cemetery in the Philippines and a declared National Historical Landmark. Beneath its chapel lie subterranean crypts reached by an arched stairway, and the grounds served as a secret meeting place for Katipunan revolutionaries in Laguna.', 'National Highway, Nagcarlan', 'Laguna', 'Religious Landmarks', 'nagcarlan-underground-cemetery.jpg', 14.1970, 121.4055, false),
('pagsanjan-falls', 'Pagsanjan Falls (Magdapio Falls)', 'One of the most famous waterfalls in the Philippines, reached by a thrilling banca ride through the narrow Pagsanjan Gorge. The three-tiered cascade drops from a height of about 90 meters into a natural swimming basin, surrounded by towering limestone cliffs and lush tropical vegetation.', 'Cavinti', 'Laguna', 'Natural Heritage', 'pagsanjan-falls.jpg', 14.4230, 121.4520, true),
('lake-sampaloc', 'Lake Sampaloc', 'The largest of the seven crater lakes of San Pablo City, formed within the caldera of ancient volcanic maars. Ringed by lakeside parks and views of Mount Banahaw, the lake supports local fishing communities and boatmen, and offers a scenic promenade popular for sunrise strolls.', 'San Pablo City', 'Laguna', 'Natural Heritage', 'lake-sampaloc.jpg', 14.1030, 121.3180, false),
('taal-basilica', 'Minor Basilica of Saint Martin of Tours', 'The largest Catholic church in Asia, this towering basilica of Taal town was completed in 1878 and stands as a masterpiece of Filipino-Spanish colonial architecture. Its coral stone and adobe walls survived major earthquakes, and its interior features a rare definition of the precious image of Our Lady of Caysasay, Taal''s venerated patron.', 'Taal Heritage Town, Taal', 'Batangas', 'Religious Landmarks', 'taal-basilica.jpg', 13.8790, 120.9290, true),
('taal-volcano', 'Taal Volcano', 'One of the world''s smallest and most active volcanoes, famous for its unique geology: an island within a lake that itself sits inside a massive prehistoric caldera. Taal''s eruptions have shaped Batangas history for centuries, and viewpoints in Tagaytay and Talisay offer breathtaking panoramic vistas of the volcanic lake.', 'Talisay and Taal lake area', 'Batangas', 'Natural Heritage', 'taal-volcano.jpg', 13.9960, 120.9930, true),
('mabini-shrine', 'Museo ni Apolinario Mabini', 'The national shrine honoring Apolinario Mabini, the "Sublime Paralytic" and brain of the Philippine Revolution, in his hometown. The museum preserves his personal belongings, writings, and the original nipa hut where he spent his final years, alongside exhibits on his role as the young republic''s first Secretary of Foreign Affairs.', 'Barangay Poblacion, Tanauan City', 'Batangas', 'Museums', 'mabini-shrine.jpg', 14.0860, 121.1490, false),
('marcela-agoncillo-museum', 'Marcela Agoncillo Museum', 'The ancestral home of Marcela Mariño de Agoncillo of Taal, who sewed the first Philippine flag together with her daughter and a family friend while in exile in Hong Kong in 1897. The National Historical Commission museum displays period furnishings, photographs, and artifacts telling the story of the flag''s creation and the Agoncillo family.', 'Marcela Agoncillo Street, Taal', 'Batangas', 'Museums', 'marcela-agoncillo-museum.jpg', 13.8800, 120.9260, false),
('antipolo-cathedral', 'Antipolo Cathedral (Our Lady of Peace and Good Voyage)', 'The international shrine of Our Lady of Peace and Good Voyage, home to a dark-skinned image of the Virgin Mary brought from Acapulco, Mexico in 1626. For centuries, devotees from across the Philippines have made the pilgrimage to Antipolo, especially during the month of May, making it the country''s most visited Marian shrine.', 'Poblacion, Antipolo City', 'Rizal', 'Religious Landmarks', 'antipolo-cathedral.jpg', 14.5860, 121.1760, true),
('angono-petroglyphs', 'Angono Petroglyphs', 'The oldest known work of art in the Philippines: 127 carved human and animal figures etched into a volcanic tuff cave wall more than 3,000 years ago. Declared a National Cultural Treasure in 1973, the site offers a glimpse into the lives and beliefs of pre-colonial Filipinos in a shaded garden setting.', 'Botong Francisco Avenue, Binangonan', 'Rizal', 'Historical Shrines', 'angono-petroglyphs.jpg', 14.5210, 121.1950, false),
('hinulugang-taktak', 'Hinulugang Taktak', 'A protected landscape and waterfall in Antipolo, long a favorite picnic and bathing spot of Manila residents escaping the summer heat. Legend links its name to the Virgin of Antipolo, to whom an unwanted bell was thrown into the falls'' waters, and the site is now a national park maintained for day visitors.', 'Taktak Road, Antipolo City', 'Rizal', 'Natural Heritage', 'hinulugang-taktak.jpg', 14.6060, 121.1770, false),
('kamay-ni-hesus', 'Kamay ni Hesus Shrine', 'A renowned hillside pilgrimage site in Lucban featuring a towering 50-foot statue of the Ascending Christ atop a hill reached by stairs lined with life-size Stations of the Cross. The shrine complex also includes the Healing Church, a Garden of Eden, and pastoral grounds that draw millions of devotees every year.', 'Brgy. Ibabang Palale, Lucban', 'Quezon', 'Religious Landmarks', 'kamay-ni-hesus.jpg', 14.1170, 121.5560, false),
('villa-sariaya', 'Villa Sariaya', 'An 18th-century bahay-na-bato built by Don Lucio Rodriguez, one of Quezon''s most prominent families, and now a declared heritage house of the National Historical Commission. The two-story stone and wood villa showcases antique furniture, capiz-shell windows, and period décor that reflect the prosperity of old Tayabas Province.', 'A. Bonifacio Street, Sariaya', 'Quezon', 'Historical Shrines', 'villa-sariaya.jpg', 13.9610, 121.5130, false),
('villa-escudero', 'Villa Escudero Plantation and Museum', 'A working coconut plantation turned heritage resort established in 1872, preserving the estate''s hacienda museum of antiquities, folk crafts, and religious art. Visitors dine at its famous waterfall restaurant, ride carabao-drawn carts, and watch cultural performances celebrating rural Filipino life.', 'Tiaong', 'Quezon', 'Museums', 'villa-escudero.jpg', 14.0460, 121.2750, false),
('mount-banahaw', 'Mount Banahaw', 'A sacred mountain straddling Quezon and Laguna, revered for centuries as a holy site by mystics, cults, and folk Catholics alike. Its forested slopes hold natural springs, caves, and pilgrimage trails such as the Kalbaryo, while the mountain''s volcanic soil and protected watershed sustain remarkable biodiversity.', 'Dolores and Lucban area', 'Quezon', 'Natural Heritage', 'mount-banahaw.jpg', 14.1400, 121.5000, false);