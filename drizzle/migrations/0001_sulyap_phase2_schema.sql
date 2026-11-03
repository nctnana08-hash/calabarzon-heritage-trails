-- ============================================================================
-- SULYAP PHASE 2 & HARDENING MIGRATION FOR LOVABLE CLOUD (SUPABASE)
-- Paste this entire script into the Lovable Cloud / Supabase SQL Editor and Run.
-- Everything is idempotent (safe to run multiple times).
-- ============================================================================

-- 1. Add Phase 2 Sulyap columns to public.destinations
alter table public.destinations
  add column if not exists history text not null default '',
  add column if not exists significance text not null default '',
  add column if not exists sources text not null default '',
  add column if not exists gallery_urls jsonb not null default '[]'::jsonb;

-- 2. Create public.destination_questions table for per-place quizzes (with explanations)
create table if not exists public.destination_questions (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid references public.destinations(id) on delete cascade,
  destination_slug text not null,
  question text not null,
  options jsonb not null,
  answer smallint not null check (answer >= 0 and answer <= 3),
  explanation text not null default '',
  sort_order smallint not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_destination_questions_slug
  on public.destination_questions(destination_slug);

grant select, insert, update, delete on public.destination_questions to anon, authenticated;
grant all on public.destination_questions to service_role;

alter table public.destination_questions enable row level security;

drop policy if exists "Questions are publicly readable" on public.destination_questions;
create policy "Questions are publicly readable"
  on public.destination_questions for select using (true);

drop policy if exists "Anyone can insert questions" on public.destination_questions;
create policy "Anyone can insert questions"
  on public.destination_questions for insert with check (true);

drop policy if exists "Anyone can update questions" on public.destination_questions;
create policy "Anyone can update questions"
  on public.destination_questions for update using (true);

drop policy if exists "Anyone can delete questions" on public.destination_questions;
create policy "Anyone can delete questions"
  on public.destination_questions for delete using (true);

-- 3. Create public.visitor_progress table for Pasaporte stamps & quiz scores
create table if not exists public.visitor_progress (
  visitor_id text not null,
  destination_id uuid references public.destinations(id) on delete cascade,
  destination_slug text not null,
  toured boolean not null default false,
  best integer not null default 0,
  total integer not null default 0,
  attempts integer not null default 0,
  last integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (visitor_id, destination_slug)
);

grant select, insert, update, delete on public.visitor_progress to anon, authenticated;
grant all on public.visitor_progress to service_role;

alter table public.visitor_progress enable row level security;

drop policy if exists "Progress is publicly readable" on public.visitor_progress;
create policy "Progress is publicly readable"
  on public.visitor_progress for select using (true);

drop policy if exists "Anyone can insert progress" on public.visitor_progress;
create policy "Anyone can insert progress"
  on public.visitor_progress for insert with check (true);

drop policy if exists "Anyone can update progress" on public.visitor_progress;
create policy "Anyone can update progress"
  on public.visitor_progress for update using (true);

drop policy if exists "Anyone can delete progress" on public.visitor_progress;
create policy "Anyone can delete progress"
  on public.visitor_progress for delete using (true);

-- 4. Populate verified History (Kasaysayan), Significance (Kahalagahan), and Sources (Mga Sanggunian)
update public.destinations set
  history = 'Built in 1845 from wood and thatch and reconstructed in 1849 as a bahay-na-bato, the ancestral home of General Emilio Aguinaldo in Kawit was expanded in the 1920s with a symbolic tower and balcony. On June 12, 1898, the Act of the Declaration of Independence was read here by Ambrosio Rianzares Bautista, the Philippine national flag sewn in Hong Kong was unfurled before the public, and Julian Felipe''s Marcha Nacional Filipina was played for the first time.',
  significance = 'Declared a National Shrine on June 18, 1964 through Republic Act No. 4039, the mansion brings together the birth of the Philippine flag, the national anthem, and the First Philippine Republic in one historic setting.',
  sources = 'National Historical Commission of the Philippines (NHCP), Museo ni Emilio Aguinaldo; Republic Act No. 4039 (1964).'
where slug = 'aguinaldo-shrine';

update public.destinations set
  history = 'Constructed in 1889 by Teodorico Reyes in Maragondon, Cavite, this bahay-na-bato became the venue for the court-martial of Katipunan Supremo Andres Bonifacio and his brother Procopio from May 4 to May 5, 1897, following the political rift after the Tejeros Convention.',
  significance = 'Now managed by the National Historical Commission of the Philippines as the Museo ng Paglilitis ni Andres Bonifacio, the house prompts critical reflection on unity, revolutionary leadership, and the birth pains of the Philippine nation.',
  sources = 'National Historical Commission of the Philippines (NHCP), Museo ng Paglilitis ni Andres Bonifacio (Maragondon, Cavite).'
where slug = 'bonifacio-trial-house';

update public.destinations set
  history = 'Built by Spanish authorities between 1609 and 1616 in Cavite Puerto (now Cavite City), Fort San Felipe guarded the Manila-Acapulco galleon shipyard and naval arsenal. On January 20, 1872, Filipino soldiers and arsenal workers staged the Cavite Mutiny here, which colonial authorities used as a pretext to execute the secular priests Mariano Gomez, Jose Burgos, and Jacinto Zamora (GomBurZa).',
  significance = 'The 1872 Cavite Mutiny and the martyrdom of GomBurZa awakened Filipino national consciousness and directly inspired Jose Rizal to write El Filibusterismo.',
  sources = 'National Historical Commission of the Philippines (NHCP) Historical Marker, Fort San Felipe; Philippine Navy Museum.'
where slug = 'fort-san-felipe';

update public.destinations set
  history = 'Inaugurated in 2000 on the campus of De La Salle University-Dasmariñas in Cavite, Museo De La Salle is a cultural and lifestyle museum modeled after a 19th-century Spanish colonial bahay-na-bato.',
  significance = 'It preserves heirloom furniture, religious imagery, porcelain, and personal accessories that illustrate the domestic customs, craftsmanship, and social history of 19th-century Filipino families.',
  sources = 'Museo De La Salle, De La Salle University-Dasmariñas (DLSU-D); National Commission for Culture and the Arts (NCCA) Museum Directory.'
where slug = 'museo-de-la-salle';

update public.destinations set
  history = 'Located on P. Burgos Street in Calamba, Laguna, this Spanish-colonial bahay-na-bato stands on the site where Dr. Jose Rizal was born on June 19, 1861 to Francisco Mercado and Teodora Alonso. After the original house was destroyed in World War II, Architect Juan Nakpil supervised its faithful reconstruction in 1950 using public donations from Filipino schoolchildren.',
  significance = 'Rizal''s childhood in Calamba shaped his love of learning, nature, and justice. His novels Noli Me Tangere and El Filibusterismo exposed colonial abuses and inspired the Philippine struggle for freedom.',
  sources = 'National Historical Commission of the Philippines (NHCP), Museo ni Jose Rizal Calamba; Executive Order No. 145 (1948).'
where slug = 'rizal-shrine';

update public.destinations set
  history = 'Built in 1845 in Nagcarlan, Laguna under Franciscan friar Fr. Vicente Velloc, this octagonal walled cemetery features an elevated brick church with an underground crypt containing 36 burial niches. In 1896, the subterranean chamber served as a secret meeting place for Laguna Katipuneros planning operations against Spanish rule.',
  significance = 'Declared a National Historical Landmark through Presidential Decree No. 260 in 1973, it is the only underground cemetery of its kind in the Philippines and a testament to both 19th-century funerary architecture and revolutionary history.',
  sources = 'National Historical Commission of the Philippines (NHCP), Museo sa Ilalim ng Lupa ng Nagcarlan; Presidential Decree No. 260 (1973).'
where slug = 'nagcarlan-underground-cemetery';

update public.destinations set
  history = 'Locally known as Magdapio Falls and located within the municipality of Cavinti (historically accessed via Pagsanjan), the waterfall drops down a steep three-tiered canyon carved by the Bumbungan and Balanac rivers. Pagsanjan served as the provincial capital of Laguna from 1688 to 1858, and the gorge was declared a National Park on March 29, 1939 by Proclamation No. 392.',
  significance = 'Beyond its geological beauty, Pagsanjan Falls highlights living community heritage: skilled bangkeros (boatmen) maneuver wooden canoes up the rapids in a tradition known as ''shooting the rapids,'' sustaining local families for generations.',
  sources = 'Department of Environment and Natural Resources (DENR) — Pagsanjan Gorge National Park (Proclamation No. 392, s. 1939); DOT Region IV-A.'
where slug = 'pagsanjan-falls';

update public.destinations set
  history = 'Lake Sampaloc was formed by a prehistoric phreatomagmatic volcanic eruption that created a shallow crater (maar) in the San Pablo Volcanic Field. Situated right behind San Pablo City hall, it is the largest of the city''s Seven Lakes (Pitong Lawa).',
  significance = 'The lake is an ecological and cultural anchor for San Pablo City, supporting aquaculture, lakeside livelihoods, and public environmental education around volcanic maar ecosystems.',
  sources = 'Laguna Lake Development Authority (LLDA) — Seven Crater Lakes of San Pablo Profile; PHIVOLCS San Pablo Volcanic Field.'
where slug = 'lake-sampaloc';

update public.destinations set
  history = 'After the catastrophic 1754 eruption of Taal Volcano destroyed the old town of Taal along the lakeshore (now San Nicolas), townspeople relocated to higher ground. Construction of the present stone church began in 1856 under Augustinian friar Fr. Marcos Anton and Spanish architect Luciano Oliver, and was completed in 1878.',
  significance = 'Measuring 88.6 meters long and 48 meters wide, the Minor Basilica of St. Martin of Tours is recognized as the largest Catholic church in Asia and anchors the preserved ancestral streetscape of Taal Heritage Town. It was declared a National Historical Landmark via Presidential Decree No. 375 in 1974.',
  sources = 'National Historical Commission of the Philippines (NHCP), Presidential Decree No. 375 (1974); Archdiocese of Lipa.'
where slug = 'taal-basilica';

update public.destinations set
  history = 'Taal Volcano in Batangas sits within Taal Lake, which fills a vast prehistoric caldera formed by explosive eruptions between 140,000 and 5,380 BP. With 38 recorded historical eruptions since 1572—including major events in 1754, 1911, 1965, and 2020—it has continually reshaped the landscape and towns of Batangas.',
  significance = 'Protected as the Taal Volcano Protected Landscape under Proclamation No. 923 (1996), it is one of the Philippines'' most closely monitored volcanoes (a Decade Volcano) and home to endemic aquatic species such as the freshwater sardine tawilis (Sardinella tawilis).',
  sources = 'Philippine Institute of Volcanology and Seismology (PHIVOLCS) — Taal Volcano Profile; DENR Proclamation No. 923 (1996).'
where slug = 'taal-volcano';

update public.destinations set
  history = 'Located in Barangay Talaga, Tanauan City, Batangas, the Museo ni Apolinario Mabini stands on the birthplace of Apolinario Mabini (born July 23, 1864). Despite losing the use of his legs to polio in 1896, Mabini served as General Aguinaldo''s chief adviser, drafted constitutional ordinances, and became the First Philippine Republic''s first Prime Minister and Secretary of Foreign Affairs.',
  significance = 'Honored as the ''Sublime Paralytic'' (Dakilang Lumpo) and ''Brain of the Revolution'' (Utak ng Himagsikan), Mabini proved that intellect, integrity, and moral courage are the true foundations of nationhood.',
  sources = 'National Historical Commission of the Philippines (NHCP), Museo ni Apolinario Mabini — Tanauan, Batangas.'
where slug = 'mabini-shrine';

update public.destinations set
  history = 'This late-18th-century ancestral house in Taal, Batangas belonged to the family of Marcela Mariño Agoncillo (born June 24, 1859). While living in exile at 535 Morrison Hill Road in Hong Kong in May 1898, Doña Marcela, her seven-year-old daughter Lorenza, and Jose Rizal''s niece Delfina Herbosa de Natividad hand-sewed the first official Philippine flag.',
  significance = 'Preserved by the NHCP as the Museo nina Marcela Mariño at Felipe Agoncillo, the home honors the women and diplomats of Batangas whose artistry and diplomacy gave the republic its national symbol.',
  sources = 'National Historical Commission of the Philippines (NHCP), Museo nina Marcela Mariño at Felipe Agoncillo (Taal, Batangas).'
where slug = 'marcela-agoncillo-museum';

update public.destinations set
  history = 'Originally established by Franciscan missionaries in 1578 and later administered by the Jesuits, the Antipolo church enshrines the 17th-century carved wooden image of Nuestra Señora de la Paz y Buen Viaje (Our Lady of Peace and Good Voyage), brought from Acapulco, Mexico by Governor-General Juan Niño de Tabora in 1626. Rebuilt after World War II to a design by Architect Jose L. de Ocampo, it was declared the first International Shrine in Southeast Asia by the Vatican in 2023.',
  significance = 'For centuries, the image blessed Manila-Acapulco galleon voyages and inspired the Maytime ''Ahunan'' pilgrimage to the hills of Antipolo, blending religious devotion, travel folklore, and Rizal province identity.',
  sources = 'Catholic Bishops'' Conference of the Philippines (CBCP); Vatican Dicastery for Evangelization Decree (2023); Diocese of Antipolo.'
where slug = 'antipolo-cathedral';

update public.destinations set
  history = 'Carved into a shallow volcanic tuff rock shelter standing on the boundary of Angono and Binangonan, Rizal, the 127 human and animal figures date back to the late Neolithic period (around 3000 BC). They were reported in March 1965 by National Artist for Visual Arts Carlos ''Botong'' Francisco during a Boy Scouts field trip and investigated by the National Museum of the Philippines.',
  significance = 'Declared a National Cultural Treasure under Presidential Decree No. 260 in 1973 and listed on the World Monuments Watch, the petroglyphs represent the oldest known prehistoric rock art in the Philippines.',
  sources = 'National Museum of the Philippines — Angono-Binangonan Petroglyphs Site Museum; Presidential Decree No. 260 (1973).'
where slug = 'angono-petroglyphs';

update public.destinations set
  history = 'Located along the Taktak River in Antipolo City, Rizal, this 21-meter waterfall gained its name (''where the bell was dropped'') from a 16th-century town legend in which residents asked the parish priest to cast a piercingly loud church bell into the river basin. Declared a Recreation Area in 1952 (RA 697), a National Shrine in 1990 (RA 6964), and a Protected Landscape under the NIPAS Act in 2000 (Proclamation No. 412), it was rehabilitated and reopened for public eco-tourism.',
  significance = 'Celebrated in the classic Filipino folk song ''Tayo na sa Antipolo'' by German San Jose, Hinulugang Taktak represents the intertwining of Tagalog folklore, music, and urban watershed rehabilitation.',
  sources = 'DENR CALABARZON — Hinulugang Taktak Protected Landscape (Proclamation No. 412, s. 2000); Republic Act No. 6964 (1990).'
where slug = 'hinulugang-taktak';

update public.destinations set
  history = 'Founded in 2002 in Barangay Tinamnan, Lucban, Quezon under healing priest Fr. Joey Faller, the five-hectare Kamay ni Hesus Shrine sits on the foothills of Mount Banahaw and features a 305-step grotto trail leading up to a 50-foot statue of the Ascending Christ.',
  significance = 'Alongside Lucban''s centuries-old Pahiyas harvest festival (celebrated every May 15 in honor of San Isidro Labrador with colorful leaf-shaped rice wafers called kiping), Kamay ni Hesus makes Lucban one of Quezon''s premier faith and cultural destinations.',
  sources = 'DOT Region IV-A Pilgrimage Sites Directory; Municipality of Lucban Tourism Office.'
where slug = 'kamay-ni-hesus';

update public.destinations set
  history = 'Designed in 1922 by eminent Filipino architect Juan Nakpil (later named the first National Artist for Architecture) for Don Natalio Enriquez and Doña Susana Gala, the Natalio Enriquez Mansion (popularly called Villa Sariaya) in Sariaya, Quezon showcases early 20th-century Art Nouveau and Beaux-Arts details blended with traditional Filipino architecture.',
  significance = 'Declared a Heritage House by the National Historical Commission of the Philippines in 2008, it exemplifies the golden age of Quezon''s coconut-era ancestral mansions along the old Manila-South Road.',
  sources = 'National Historical Commission of the Philippines (NHCP) Registry of Heritage Houses (2008); Municipality of Sariaya Heritage Council.'
where slug = 'villa-sariaya';

update public.destinations set
  history = 'Founded in 1872 by Don Placido Escudero and Doña Claudia Marasigan in Tiaong, Quezon (straddling the boundary with San Pablo, Laguna), Villa Escudero began as a sugarcane plantation before converting to a self-sustaining coconut estate in the early 1900s. Don Arsenio Escudero built the country''s first working hydroelectric plant at Labasin Dam in 1929 to power the desiccated coconut factory.',
  significance = 'Opened to the public in 1981, its classic pink church-façade estate museum holds one of the largest private collections of religious santos, ethnographic attire, pre-colonial ceramics, and natural history specimens in Southern Luzon.',
  sources = 'Villa Escudero Plantations and Resort Archives (Tiaong, Quezon); DOT Region IV-A Agri-Tourism & Museum Directory.'
where slug = 'villa-escudero';

update public.destinations set
  history = 'Rising to 2,170 meters above sea level along the boundary of Quezon and Laguna provinces, Mount Banahaw is a three-peaked active complex volcano and vital watershed. Since the Spanish colonial era—including the 1841 religious movement of Apolinario de la Cruz (Hermano Pule)—the mountain''s caves, waterfalls, and rocky ridges (''puwestos'') have been revered as a ''New Jerusalem'' by Filipino folk religious groups and pilgrims.',
  significance = 'Protected under Republic Act No. 9847 (2009) as the Mounts Banahaw–San Cristobal Protected Landscape, it safeguards montane rainforest biodiversity alongside centuries-old Tagalog spiritual traditions.',
  sources = 'Republic Act No. 9847 (2009) — Mounts Banahaw-San Cristobal Protected Landscape Act; DENR Protected Areas Management Board.'
where slug = 'mount-banahaw';
