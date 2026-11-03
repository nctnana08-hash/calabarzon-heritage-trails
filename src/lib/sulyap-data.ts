import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, PROVINCES, type Destination } from "./destinations";
import { getCategoryMeta } from "./sulyap-theme";

export type QuizQuestion = {
  q: string;
  options: [string, string, string, string];
  answer: number;
  explanation: string;
};

export type SulyapEnrichment = {
  history: string;
  significance: string;
  sources: string;
  images: string[];
  quiz?: QuizQuestion[];
};

export type DestinationProgress = {
  dest_id: string;
  slug: string;
  toured: number; // 0 or 1
  best: number;
  total: number;
  attempts: number;
  last: number;
};

/**
 * M3: Fact-checked primary-source content (NHCP, National Museum of the Philippines,
 * DOT Region IV-A, CBCP, UNESCO, LGU records) for all CALABARZON heritage destinations.
 * Every site has 4 multiple-choice questions with 4 unique options, varied correct
 * answer indices (0..3), and an explanation shown after answering.
 */
export const SEED_ENRICHMENT: Record<string, SulyapEnrichment> = {
  "aguinaldo-shrine": {
    history:
      "Built in 1845 from wood and thatch and reconstructed in 1849 as a bahay-na-bato, the ancestral home of General Emilio Aguinaldo in Kawit was expanded in the 1920s with a symbolic tower and balcony. On June 12, 1898, the Act of the Declaration of Independence was read here by Ambrosio Rianzares Bautista, the Philippine national flag sewn in Hong Kong was unfurled before the public, and Julian Felipe's Marcha Nacional Filipina was played for the first time.",
    significance:
      "Declared a National Shrine on June 18, 1964 through Republic Act No. 4039, the mansion brings together the birth of the Philippine flag, the national anthem, and the First Philippine Republic in one historic setting.",
    sources:
      "National Historical Commission of the Philippines (NHCP), Museo ni Emilio Aguinaldo; Republic Act No. 4039 (1964).",
    images: [],
    quiz: [
      {
        q: "On what date was Philippine independence proclaimed at the Aguinaldo Shrine?",
        options: ["June 12, 1898", "July 4, 1946", "August 23, 1896", "December 30, 1896"],
        answer: 0,
        explanation:
          "General Emilio Aguinaldo proclaimed Philippine independence from Spain in Kawit, Cavite on June 12, 1898.",
      },
      {
        q: "In which municipality of Cavite does the Aguinaldo Shrine stand?",
        options: ["Imus", "Kawit", "Silang", "Maragondon"],
        answer: 1,
        explanation:
          "The shrine is located along Tirona Highway in Kawit (historically known as Cavite el Viejo), Cavite.",
      },
      {
        q: "Who composed the Marcha Nacional Filipina first played during the 1898 proclamation?",
        options: ["Lucio San Pedro", "Nicanor Abelardo", "Julian Felipe", "Jose Palma"],
        answer: 2,
        explanation:
          "Caviteño composer Julian Felipe composed the Marcha Filipina Magdalo (later Marcha Nacional Filipina), performed by the San Francisco de Malabon band.",
      },
      {
        q: "Who read the Act of the Declaration of Independence at the shrine on June 12, 1898?",
        options: [
          "Apolinario Mabini",
          "Andres Bonifacio",
          "Pedro Paterno",
          "Ambrosio Rianzares Bautista",
        ],
        answer: 3,
        explanation:
          "Ambrosio Rianzares Bautista authored and read the Spanish-language Acta de la proclamación de independencia del pueblo Filipino.",
      },
    ],
  },
  "bonifacio-trial-house": {
    history:
      "Constructed in 1889 by Teodorico Reyes in Maragondon, Cavite, this bahay-na-bato became the venue for the court-martial of Katipunan Supremo Andres Bonifacio and his brother Procopio from May 4 to May 5, 1897, following the political rift after the Tejeros Convention.",
    significance:
      "Now managed by the National Historical Commission of the Philippines as the Museo ng Paglilitis ni Andres Bonifacio, the house prompts critical reflection on unity, revolutionary leadership, and the birth pains of the Philippine nation.",
    sources:
      "National Historical Commission of the Philippines (NHCP), Museo ng Paglilitis ni Andres Bonifacio (Maragondon, Cavite).",
    images: [],
    quiz: [
      {
        q: "In which Cavite town is the Bonifacio Trial House located?",
        options: ["Maragondon", "Kawit", "Dasmariñas", "Bacoor"],
        answer: 0,
        explanation:
          "The house stands in Barangay Poblacion 1-A in the highland town of Maragondon, Cavite.",
      },
      {
        q: "In what year was Andres Bonifacio tried in this house?",
        options: ["1892", "1897", "1899", "1901"],
        answer: 1,
        explanation:
          "The court-martial of Andres and Procopio Bonifacio took place in May 1897 during the Philippine Revolution.",
      },
      {
        q: "Which revolutionary organization did Andres Bonifacio co-found and lead as Supremo?",
        options: ["La Solidaridad", "La Liga Filipina", "Katipunan (KKK)", "Magdalo Council"],
        answer: 2,
        explanation:
          "Andres Bonifacio was a founder and Supremo of the Kataastaasan, Kagalanggalangang Katipunan ng mga Anak ng Bayan (KKK).",
      },
      {
        q: "What architectural style characterizes the Bonifacio Trial House?",
        options: ["Art Deco", "Brutalist", "Neoclassical", "Bahay-na-bato"],
        answer: 3,
        explanation:
          "Built in 1889, the residence is a classic Spanish-era bahay-na-bato with a stone ground floor and wooden upper story.",
      },
    ],
  },
  "fort-san-felipe": {
    history:
      "Built by Spanish authorities between 1609 and 1616 in Cavite Puerto (now Cavite City), Fort San Felipe guarded the Manila-Acapulco galleon shipyard and naval arsenal. On January 20, 1872, Filipino soldiers and arsenal workers staged the Cavite Mutiny here, which colonial authorities used as a pretext to execute the secular priests Mariano Gomez, Jose Burgos, and Jacinto Zamora (GomBurZa).",
    significance:
      "The 1872 Cavite Mutiny and the martyrdom of GomBurZa awakened Filipino national consciousness and directly inspired Jose Rizal to write El Filibusterismo.",
    sources:
      "National Historical Commission of the Philippines (NHCP) Historical Marker, Fort San Felipe; Philippine Navy Museum.",
    images: [],
    quiz: [
      {
        q: "What pivotal uprising took place at Fort San Felipe on January 20, 1872?",
        options: ["Cavite Mutiny", "Cry of Pugad Lawin", "Battle of Alapan", "Siege of Baler"],
        answer: 0,
        explanation:
          "Filipino workers and troops at the Cavite arsenal rose up in the 1872 Cavite Mutiny after their tribute exemptions were revoked.",
      },
      {
        q: "Which collective name refers to the three priests executed in the aftermath of the 1872 mutiny?",
        options: ["Triumvirate", "GomBurZa", "Ilustrados", "Katipuneros"],
        answer: 1,
        explanation:
          "Fathers Mariano Gomez, Jose Burgos, and Jacinto Zamora are remembered together as GomBurZa.",
      },
      {
        q: "Jose Rizal dedicated which novel to the memory of the three martyred priests?",
        options: [
          "Noli Me Tangere",
          "Mi Ultimo Adios",
          "El Filibusterismo",
          "Sucesos de las Islas Filipinas",
        ],
        answer: 2,
        explanation:
          "Rizal dedicated his second novel, El Filibusterismo (1891), to the memory of Fathers Gomez, Burgos, and Zamora.",
      },
      {
        q: "In which century was Fort San Felipe constructed to protect the Spanish naval yard?",
        options: ["15th century", "18th century", "19th century", "17th century"],
        answer: 3,
        explanation: "Construction of the stone fortress began in 1609 in the early 17th century.",
      },
    ],
  },
  "museo-de-la-salle": {
    history:
      "Inaugurated in 2000 on the campus of De La Salle University-Dasmariñas in Cavite, Museo De La Salle is a cultural and lifestyle museum modeled after a 19th-century Spanish colonial bahay-na-bato.",
    significance:
      "It preserves heirloom furniture, religious imagery, porcelain, and personal accessories that illustrate the domestic customs, craftsmanship, and social history of 19th-century Filipino families.",
    sources:
      "Museo De La Salle, De La Salle University-Dasmariñas (DLSU-D); National Commission for Culture and the Arts (NCCA) Museum Directory.",
    images: [],
    quiz: [
      {
        q: "On which university campus in Dasmariñas, Cavite is Museo De La Salle located?",
        options: [
          "De La Salle University-Dasmariñas",
          "Cavite State University",
          "University of the Philippines Los Baños",
          "Southern Luzon State University",
        ],
        answer: 0,
        explanation:
          "Museo De La Salle sits inside the De La Salle University-Dasmariñas campus in Cavite.",
      },
      {
        q: "What historical period's domestic lifestyle does Museo De La Salle primarily showcase?",
        options: [
          "Pre-colonial Barangay period",
          "19th-century Spanish colonial era",
          "Post-World War II reconstruction",
          "Contemporary digital art",
        ],
        answer: 1,
        explanation:
          "Its galleries recreate the rooms and collections of a 19th-century Philippine bahay-na-bato.",
      },
      {
        q: "Which traditional Filipino house type inspired the architecture of Museo De La Salle?",
        options: ["Torogan", "Ivatan stone house", "Bahay-na-bato", "Ifugao bale"],
        answer: 2,
        explanation:
          "The museum is built in the bahay-na-bato style with stone arches downstairs and hardwood rooms with capiz windows upstairs.",
      },
      {
        q: "In which province is Museo De La Salle found?",
        options: ["Laguna", "Batangas", "Rizal", "Cavite"],
        answer: 3,
        explanation: "Dasmariñas City is located in the province of Cavite.",
      },
    ],
  },
  "rizal-shrine": {
    history:
      "Located on P. Burgos Street in Calamba, Laguna, this Spanish-colonial bahay-na-bato stands on the site where Dr. Jose Rizal was born on June 19, 1861 to Francisco Mercado and Teodora Alonso. After the original house was destroyed in World War II, Architect Juan Nakpil supervised its faithful reconstruction in 1950 using public donations from Filipino schoolchildren.",
    significance:
      "Rizal's childhood in Calamba shaped his love of learning, nature, and justice. His novels Noli Me Tangere and El Filibusterismo exposed colonial abuses and inspired the Philippine struggle for freedom.",
    sources:
      "National Historical Commission of the Philippines (NHCP), Museo ni Jose Rizal Calamba; Executive Order No. 145 (1948).",
    images: [],
    quiz: [
      {
        q: "In what year was national hero Dr. Jose Rizal born in Calamba, Laguna?",
        options: ["1861", "1872", "1896", "1898"],
        answer: 0,
        explanation:
          "Jose Protacio Rizal Mercado y Alonso Realonda was born in Calamba on June 19, 1861.",
      },
      {
        q: "Which of these is a celebrated novel written by Jose Rizal?",
        options: ["Florante at Laura", "Noli Me Tangere", "Ibong Adarna", "Banaag at Sikat"],
        answer: 1,
        explanation:
          "Noli Me Tangere (1887) and El Filibusterismo (1891) are Rizal's two landmark novels.",
      },
      {
        q: "Which National Artist for Architecture supervised the 1950 reconstruction of the Rizal Shrine?",
        options: ["Leandro Locsin", "Pablo Antonio", "Juan Nakpil", "Ildefonso Santos"],
        answer: 2,
        explanation:
          "Architect Juan Nakpil led the reconstruction of the Mercado-Rizal home on its original foundation in 1950.",
      },
      {
        q: "In which city of Laguna is the Rizal Shrine located?",
        options: ["Pagsanjan", "Santa Cruz", "San Pablo", "Calamba"],
        answer: 3,
        explanation: "The Rizal Shrine stands in Poblacion, Calamba City, Laguna.",
      },
    ],
  },
  "nagcarlan-underground-cemetery": {
    history:
      "Built in 1845 in Nagcarlan, Laguna under Franciscan friar Fr. Vicente Velloc, this octagonal walled cemetery features an elevated brick church with an underground crypt containing 36 burial niches. In 1896, the subterranean chamber served as a secret meeting place for Laguna Katipuneros planning operations against Spanish rule.",
    significance:
      "Declared a National Historical Landmark through Presidential Decree No. 260 in 1973, it is the only underground cemetery of its kind in the Philippines and a testament to both 19th-century funerary architecture and revolutionary history.",
    sources:
      "National Historical Commission of the Philippines (NHCP), Museo sa Ilalim ng Lupa ng Nagcarlan; Presidential Decree No. 260 (1973).",
    images: [],
    quiz: [
      {
        q: "In what year was the Nagcarlan Underground Cemetery built under Fr. Vicente Velloc?",
        options: ["1845", "1754", "1898", "1920"],
        answer: 0,
        explanation:
          "Franciscan missionary Fr. Vicente Velloc directed the construction of the cemetery and underground crypt in 1845.",
      },
      {
        q: "Who used the underground crypt as a secret meeting place during the 1896 Revolution?",
        options: [
          "Spanish galleon sailors",
          "Katipunan revolutionaries",
          "American teachers",
          "Japanese pilots",
        ],
        answer: 1,
        explanation:
          "Revolutionary leaders in Laguna met secretly inside the subterranean crypt during the Philippine Revolution.",
      },
      {
        q: "Which religious order supervised the building of the Nagcarlan cemetery?",
        options: ["Jesuits", "Dominicans", "Franciscans", "Recollects"],
        answer: 2,
        explanation:
          "Fr. Vicente Velloc belonged to the Order of Friars Minor (Franciscans), who administered many towns in Laguna.",
      },
      {
        q: "What makes the Nagcarlan cemetery unique in the Philippines?",
        options: [
          "It floats on a crater lake",
          "It is carved into a volcano",
          "It is made entirely of bamboo",
          "It is the only underground cemetery in the country",
        ],
        answer: 3,
        explanation:
          "It is recognized as the only historic underground cemetery in the Philippines.",
      },
    ],
  },
  "pagsanjan-falls": {
    history:
      "Locally known as Magdapio Falls and located within the municipality of Cavinti (historically accessed via Pagsanjan), the waterfall drops down a steep three-tiered canyon carved by the Bumbungan and Balanac rivers. Pagsanjan served as the provincial capital of Laguna from 1688 to 1858, and the gorge was declared a National Park on March 29, 1939 by Proclamation No. 392.",
    significance:
      "Beyond its geological beauty, Pagsanjan Falls highlights living community heritage: skilled bangkeros (boatmen) maneuver wooden canoes up the rapids in a tradition known as 'shooting the rapids,' sustaining local families for generations.",
    sources:
      "Department of Environment and Natural Resources (DENR) — Pagsanjan Gorge National Park (Proclamation No. 392, s. 1939); DOT Region IV-A.",
    images: [],
    quiz: [
      {
        q: "What is the indigenous and local name for Pagsanjan Falls?",
        options: ["Magdapio Falls", "Hinulugang Taktak", "Maria Cristina Falls", "Daranak Falls"],
        answer: 0,
        explanation:
          "Pagsanjan Falls is also called Magdapio Falls, located within Cavinti and accessed through the Pagsanjan Gorge.",
      },
      {
        q: "How do visitors traditionally travel up the river canyon to reach the main falls?",
        options: [
          "By cable car over the canopy",
          "By wooden banca guided by skilled boatmen",
          "By underground railway",
          "By horse-drawn carriage",
        ],
        answer: 1,
        explanation:
          "Local boatmen (bangkeros) guide visitors in wooden bancas upstream through canyon rapids and boulders.",
      },
      {
        q: "Pagsanjan served as the capital of which province from 1688 to 1858?",
        options: ["Cavite", "Rizal", "Laguna", "Quezon"],
        answer: 2,
        explanation:
          "Pagsanjan was the historic provincial capital of Laguna for 170 years before Santa Cruz became the capital.",
      },
      {
        q: "In which adjacent municipality does the main waterfall drop of Magdapio Falls actually lie?",
        options: ["Calamba", "Biñan", "Los Baños", "Cavinti"],
        answer: 3,
        explanation:
          "While boat tours depart from Pagsanjan, the main falls lie within the municipality of Cavinti, Laguna.",
      },
    ],
  },
  "lake-sampaloc": {
    history:
      "Lake Sampaloc was formed by a prehistoric phreatomagmatic volcanic eruption that created a shallow crater (maar) in the San Pablo Volcanic Field. Situated right behind San Pablo City hall, it is the largest of the city's Seven Lakes (Pitong Lawa).",
    significance:
      "The lake is an ecological and cultural anchor for San Pablo City, supporting aquaculture, lakeside livelihoods, and public environmental education around volcanic maar ecosystems.",
    sources:
      "Laguna Lake Development Authority (LLDA) — Seven Crater Lakes of San Pablo Profile; PHIVOLCS San Pablo Volcanic Field.",
    images: [],
    quiz: [
      {
        q: "How many crater lakes make up the famous 'Pitong Lawa' of San Pablo City?",
        options: ["Seven", "Three", "Five", "Twelve"],
        answer: 0,
        explanation:
          "San Pablo City is known as the City of Seven Lakes: Sampaloc, Bunot, Calibato, Palakpakin, Pandin, Yambo, and Muhikap.",
      },
      {
        q: "What type of volcanic crater formed Lake Sampaloc?",
        options: ["Glacial fjord", "Volcanic maar crater", "Tectonic trench", "Coral atoll"],
        answer: 1,
        explanation:
          "Lake Sampaloc is a volcanic maar—a low-relief crater caused by groundwater coming into contact with hot magma.",
      },
      {
        q: "Which city in Laguna is home to Lake Sampaloc?",
        options: ["Santa Rosa", "Cabuyao", "San Pablo City", "San Pedro"],
        answer: 2,
        explanation: "Lake Sampaloc is located in the heart of San Pablo City, Laguna.",
      },
      {
        q: "How does Lake Sampaloc rank in size among the crater lakes of San Pablo?",
        options: ["Smallest", "Deepest", "Highest in elevation", "Largest by surface area"],
        answer: 3,
        explanation:
          "Covering roughly 104 hectares, Lake Sampaloc is the largest of San Pablo's seven crater lakes.",
      },
    ],
  },
  "taal-basilica": {
    history:
      "After the catastrophic 1754 eruption of Taal Volcano destroyed the old town of Taal along the lakeshore (now San Nicolas), townspeople relocated to higher ground. Construction of the present stone church began in 1856 under Augustinian friar Fr. Marcos Anton and Spanish architect Luciano Oliver, and was completed in 1878.",
    significance:
      "Measuring 88.6 meters long and 48 meters wide, the Minor Basilica of St. Martin of Tours is recognized as the largest Catholic church in Asia and anchors the preserved ancestral streetscape of Taal Heritage Town. It was declared a National Historical Landmark via Presidential Decree No. 375 in 1974.",
    sources:
      "National Historical Commission of the Philippines (NHCP), Presidential Decree No. 375 (1974); Archdiocese of Lipa.",
    images: [],
    quiz: [
      {
        q: "Who is the patron saint of the Taal Basilica?",
        options: [
          "St. Martin of Tours",
          "St. Michael the Archangel",
          "St. Isidore the Laborer",
          "St. Augustine",
        ],
        answer: 0,
        explanation:
          "The church is officially the Minor Basilica of St. Martin of Tours in Taal, Batangas.",
      },
      {
        q: "Which volcano's 1754 eruption forced the town of Taal to move to its present hilltop site?",
        options: ["Mount Mayon", "Taal Volcano", "Mount Pinatubo", "Mount Banahaw"],
        answer: 1,
        explanation:
          "The 1754 eruption of Taal Volcano buried the original lakeshore settlement, prompting the transfer to present-day Taal.",
      },
      {
        q: "Which Spanish architect designed the grand mid-19th-century Taal Basilica?",
        options: ["Juan Hervas", "Antonio Toledo", "Luciano Oliver", "Felix Roxas"],
        answer: 2,
        explanation:
          "Spanish civil architect Luciano Oliver designed the basilica, whose construction began in 1856.",
      },
      {
        q: "What notable distinction does the Taal Basilica hold among Catholic churches in Asia?",
        options: [
          "Oldest wooden chapel",
          "Smallest parish church",
          "Only underground church",
          "Largest Catholic church in Asia",
        ],
        answer: 3,
        explanation:
          "At nearly 89 meters long and 48 meters wide, Taal Basilica is widely recognized as the largest Catholic church in Asia.",
      },
    ],
  },
  "taal-volcano": {
    history:
      "Taal Volcano in Batangas sits within Taal Lake, which fills a vast prehistoric caldera formed by explosive eruptions between 140,000 and 5,380 BP. With 38 recorded historical eruptions since 1572—including major events in 1754, 1911, 1965, and 2020—it has continually reshaped the landscape and towns of Batangas.",
    significance:
      "Protected as the Taal Volcano Protected Landscape under Proclamation No. 923 (1996), it is one of the Philippines' most closely monitored volcanoes (a Decade Volcano) and home to endemic aquatic species such as the freshwater sardine tawilis (Sardinella tawilis).",
    sources:
      "Philippine Institute of Volcanology and Seismology (PHIVOLCS) — Taal Volcano Profile; DENR Proclamation No. 923 (1996).",
    images: [],
    quiz: [
      {
        q: "Which endemic freshwater sardine is found naturally only in Taal Lake?",
        options: ["Tawilis", "Bangus", "Tilapia", "Sinarapan"],
        answer: 0,
        explanation:
          "Sardinella tawilis is the world's only known strictly freshwater sardine, native to Taal Lake.",
      },
      {
        q: "What geological feature describes Taal Lake, which surrounds Volcano Island?",
        options: ["River delta", "Volcanic caldera lake", "Glacial valley", "Limestone sinkhole"],
        answer: 1,
        explanation:
          "Taal Lake occupies a large prehistoric volcanic caldera created by ancient explosive eruptions.",
      },
      {
        q: "In which province are Taal Volcano and Taal Lake located?",
        options: ["Quezon", "Rizal", "Batangas", "Laguna"],
        answer: 2,
        explanation:
          "Taal Volcano and Taal Lake are situated in the province of Batangas (often viewed from Tagaytay ridge in Cavite).",
      },
      {
        q: "Which government agency monitors the seismic and volcanic activity of Taal Volcano?",
        options: ["PAGASA", "NAMRIA", "NHCP", "PHIVOLCS"],
        answer: 3,
        explanation:
          "The Philippine Institute of Volcanology and Seismology (PHIVOLCS) monitors Taal Volcano.",
      },
    ],
  },
  "mabini-shrine": {
    history:
      "Located in Barangay Talaga, Tanauan City, Batangas, the Museo ni Apolinario Mabini stands on the birthplace of Apolinario Mabini (born July 23, 1864). Despite losing the use of his legs to polio in 1896, Mabini served as General Aguinaldo's chief adviser, drafted constitutional ordinances, and became the First Philippine Republic's first Prime Minister and Secretary of Foreign Affairs.",
    significance:
      "Honored as the 'Sublime Paralytic' (Dakilang Lumpo) and 'Brain of the Revolution' (Utak ng Himagsikan), Mabini proved that intellect, integrity, and moral courage are the true foundations of nationhood.",
    sources:
      "National Historical Commission of the Philippines (NHCP), Museo ni Apolinario Mabini — Tanauan, Batangas.",
    images: [],
    quiz: [
      {
        q: "What title is bestowed on Apolinario Mabini for his intellectual leadership in 1898?",
        options: [
          "Brain of the Revolution (Utak ng Himagsikan)",
          "Brain of the Katipunan",
          "Father of the Philippine Army",
          "Great Plebeian",
        ],
        answer: 0,
        explanation:
          "Apolinario Mabini is revered as the 'Brain of the Revolution' and the 'Sublime Paralytic.'",
      },
      {
        q: "In which city of Batangas was Apolinario Mabini born?",
        options: ["Lipa City", "Tanauan City", "Batangas City", "Calaca"],
        answer: 1,
        explanation: "Mabini was born on July 23, 1864 in Barangay Talaga, Tanauan, Batangas.",
      },
      {
        q: "What cabinet post did Mabini hold in the First Philippine Republic?",
        options: [
          "Secretary of War",
          "Secretary of Finance",
          "President of the Cabinet and Secretary of Foreign Affairs",
          "Chief Justice",
        ],
        answer: 2,
        explanation:
          "Mabini headed the cabinet (Prime Minister) and served as the first Secretary of Foreign Affairs.",
      },
      {
        q: "Which foundational political document did Apolinario Mabini write during the revolution?",
        options: [
          "Kartilya ng Katipunan",
          "La Solidaridad",
          "Noli Me Tangere",
          "The True Decalogue (Ang Tunay na Sampung Utos)",
        ],
        answer: 3,
        explanation:
          "Mabini authored El Verdadero Decálogo (The True Decalogue) and the Constitutional Program of the Philippine Republic.",
      },
    ],
  },
  "marcela-agoncillo-museum": {
    history:
      "This late-18th-century ancestral house in Taal, Batangas belonged to the family of Marcela Mariño Agoncillo (born June 24, 1859). While living in exile at 535 Morrison Hill Road in Hong Kong in May 1898, Doña Marcela, her seven-year-old daughter Lorenza, and Jose Rizal's niece Delfina Herbosa de Natividad hand-sewed the first official Philippine flag.",
    significance:
      "Preserved by the NHCP as the Museo nina Marcela Mariño at Felipe Agoncillo, the home honors the women and diplomats of Batangas whose artistry and diplomacy gave the republic its national symbol.",
    sources:
      "National Historical Commission of the Philippines (NHCP), Museo nina Marcela Mariño at Felipe Agoncillo (Taal, Batangas).",
    images: [],
    quiz: [
      {
        q: "Where was Marcela Agoncillo living in exile when she sewed the first Philippine flag in 1898?",
        options: ["Hong Kong", "Madrid", "Tokyo", "Singapore"],
        answer: 0,
        explanation:
          "Marcela Agoncillo sewed the flag in May 1898 while the Agoncillo family was in exile in Hong Kong.",
      },
      {
        q: "Who were the two companions who helped Marcela Agoncillo sew the first Philippine flag?",
        options: [
          "Gregoria de Jesus and Melchora Aquino",
          "Lorenza Agoncillo and Delfina Herbosa de Natividad",
          "Gabriela Silang and Teresa Magbanua",
          "Trinidad Tecson and Josefa Llanes Escoda",
        ],
        answer: 1,
        explanation:
          "Her young daughter Lorenza Agoncillo and Rizal's niece Delfina Herbosa de Natividad assisted her in sewing the flag.",
      },
      {
        q: "What role did Marcela's husband, Don Felipe Agoncillo, serve for the First Philippine Republic?",
        options: [
          "Naval Commander",
          "Provincial Governor",
          "First Filipino diplomat plenipotentiary",
          "Archbishop of Manila",
        ],
        answer: 2,
        explanation:
          "Felipe Agoncillo was the First Philippine Republic's chief diplomat, representing the country in Paris and Washington.",
      },
      {
        q: "In which heritage town of Batangas is the Marcela Agoncillo Museum located?",
        options: ["Bauan", "Nasugbu", "San Juan", "Taal"],
        answer: 3,
        explanation:
          "The ancestral house stands on Marcela Agoncillo Street in Taal Heritage Town, Batangas.",
      },
    ],
  },
  "antipolo-cathedral": {
    history:
      "Originally established by Franciscan missionaries in 1578 and later administered by the Jesuits, the Antipolo church enshrines the 17th-century carved wooden image of Nuestra Señora de la Paz y Buen Viaje (Our Lady of Peace and Good Voyage), brought from Acapulco, Mexico by Governor-General Juan Niño de Tabora in 1626. Rebuilt after World War II to a design by Architect Jose L. de Ocampo, it was declared the first International Shrine in Southeast Asia by the Vatican in 2023.",
    significance:
      "For centuries, the image blessed Manila-Acapulco galleon voyages and inspired the Maytime 'Ahunan' pilgrimage to the hills of Antipolo, blending religious devotion, travel folklore, and Rizal province identity.",
    sources:
      "Catholic Bishops' Conference of the Philippines (CBCP); Vatican Dicastery for Evangelization Decree (2023); Diocese of Antipolo.",
    images: [],
    quiz: [
      {
        q: "In what year was the image of Our Lady of Peace and Good Voyage brought to the Philippines from Mexico?",
        options: ["1626", "1521", "1762", "1898"],
        answer: 0,
        explanation:
          "Governor-General Juan Niño de Tabora brought the Marian image aboard the galleon El Almirante from Acapulco in 1626.",
      },
      {
        q: "During which month is the traditional pilgrimage season ('Maytime pilgrimage') to Antipolo celebrated?",
        options: ["January", "May", "August", "November"],
        answer: 1,
        explanation:
          "May is the traditional pilgrimage month when thousands walk or travel up to Antipolo to honor the Virgin.",
      },
      {
        q: "What historic recognition did the Vatican grant Antipolo Cathedral in 2023?",
        options: [
          "Papal Palace",
          "Monastery of the East",
          "First International Shrine in Southeast Asia",
          "Patriarchal Basilica",
        ],
        answer: 2,
        explanation:
          "The Vatican elevated the National Shrine of Our Lady of Peace and Good Voyage to an International Shrine in 2023.",
      },
      {
        q: "Antipolo City serves as the capital of which CALABARZON province?",
        options: ["Cavite", "Laguna", "Quezon", "Rizal"],
        answer: 3,
        explanation: "Antipolo City is the provincial capital of Rizal.",
      },
    ],
  },
  "angono-petroglyphs": {
    history:
      "Carved into a shallow volcanic tuff rock shelter standing on the boundary of Angono and Binangonan, Rizal, the 127 human and animal figures date back to the late Neolithic period (around 3000 BC). They were reported in March 1965 by National Artist for Visual Arts Carlos 'Botong' Francisco during a Boy Scouts field trip and investigated by the National Museum of the Philippines.",
    significance:
      "Declared a National Cultural Treasure under Presidential Decree No. 260 in 1973 and listed on the World Monuments Watch, the petroglyphs represent the oldest known prehistoric rock art in the Philippines.",
    sources:
      "National Museum of the Philippines — Angono-Binangonan Petroglyphs Site Museum; Presidential Decree No. 260 (1973).",
    images: [],
    quiz: [
      {
        q: "Who discovered and reported the Angono Petroglyphs in 1965?",
        options: [
          "Carlos 'Botong' Francisco",
          "Fernando Amorsolo",
          "Juan Luna",
          "Guillermo Tolentino",
        ],
        answer: 0,
        explanation:
          "National Artist Carlos 'Botong' Francisco of Angono discovered the rock shelter in March 1965.",
      },
      {
        q: "How many prehistoric human and animal figures are engraved on the rock wall?",
        options: ["27", "127", "327", "527"],
        answer: 1,
        explanation:
          "Archaeologists documented 127 distinct symbolic figures etched into the volcanic tuff wall.",
      },
      {
        q: "The Angono-Binangonan Petroglyphs are recognized as the ___ known work of art in the Philippines.",
        options: ["newest", "tallest", "oldest", "most colorful"],
        answer: 2,
        explanation:
          "Dating back to the late Neolithic period, the petroglyphs are the oldest known rock art in the country.",
      },
      {
        q: "Which national cultural agency manages the Angono-Binangonan Petroglyphs site museum?",
        options: [
          "Department of Trade and Industry",
          "PAGASA",
          "PHIVOLCS",
          "National Museum of the Philippines",
        ],
        answer: 3,
        explanation:
          "The National Museum of the Philippines maintains the site museum, viewing deck, and conservation program.",
      },
    ],
  },
  "hinulugang-taktak": {
    history:
      "Located along the Taktak River in Antipolo City, Rizal, this 21-meter waterfall gained its name ('where the bell was dropped') from a 16th-century town legend in which residents asked the parish priest to cast a piercingly loud church bell into the river basin. Declared a Recreation Area in 1952 (RA 697), a National Shrine in 1990 (RA 6964), and a Protected Landscape under the NIPAS Act in 2000 (Proclamation No. 412), it was rehabilitated and reopened for public eco-tourism.",
    significance:
      "Celebrated in the classic Filipino folk song 'Tayo na sa Antipolo' by German San Jose, Hinulugang Taktak represents the intertwining of Tagalog folklore, music, and urban watershed rehabilitation.",
    sources:
      "DENR CALABARZON — Hinulugang Taktak Protected Landscape (Proclamation No. 412, s. 2000); Republic Act No. 6964 (1990).",
    images: [],
    quiz: [
      {
        q: "According to local Antipolo legend, what object was dropped into the falls, giving 'Hinulugang Taktak' its name?",
        options: ["A loud church bell", "A golden crown", "A Spanish cannon", "A stone anchor"],
        answer: 0,
        explanation:
          "Town folklore recounts that an unbearably loud church bell ('taktak') was dropped ('hinulugan') into the waterfall basin.",
      },
      {
        q: "In which city of Rizal province is Hinulugang Taktak located?",
        options: ["Tanay", "Antipolo City", "Morong", "Cainta"],
        answer: 1,
        explanation:
          "Hinulugang Taktak Protected Landscape is located along Taktak Road in Antipolo City, Rizal.",
      },
      {
        q: "Which classic Filipino folk song invites listeners to bathe at Hinulugang Taktak in May?",
        options: [
          "Bahay Kubo",
          "Leron Leron Sinta",
          "Tayo na sa Antipolo",
          "Atin Cu Pung Singsing",
        ],
        answer: 2,
        explanation:
          "'Tayo na sa Antipolo, at doo'y maligo tayo, sa batis na kung tawagin ay Hi-hi-hinulugang Taktak' immortalized the falls.",
      },
      {
        q: "What environmental classification does Hinulugang Taktak hold under Proclamation No. 412 (2000)?",
        options: [
          "Commercial Mining Zone",
          "Marine Sanctuary",
          "Industrial Freeport",
          "Protected Landscape",
        ],
        answer: 3,
        explanation:
          "It is designated as the Hinulugang Taktak Protected Landscape under the National Integrated Protected Areas System (NIPAS).",
      },
    ],
  },
  "kamay-ni-hesus": {
    history:
      "Founded in 2002 in Barangay Tinamnan, Lucban, Quezon under healing priest Fr. Joey Faller, the five-hectare Kamay ni Hesus Shrine sits on the foothills of Mount Banahaw and features a 305-step grotto trail leading up to a 50-foot statue of the Ascending Christ.",
    significance:
      "Alongside Lucban's centuries-old Pahiyas harvest festival (celebrated every May 15 in honor of San Isidro Labrador with colorful leaf-shaped rice wafers called kiping), Kamay ni Hesus makes Lucban one of Quezon's premier faith and cultural destinations.",
    sources: "DOT Region IV-A Pilgrimage Sites Directory; Municipality of Lucban Tourism Office.",
    images: [],
    quiz: [
      {
        q: "In which municipality of Quezon province is the Kamay ni Hesus Shrine located?",
        options: ["Lucban", "Tayabas", "Sariaya", "Lucena"],
        answer: 0,
        explanation:
          "Kamay ni Hesus stands in the cool highland town of Lucban, Quezon, at the foot of Mount Banahaw.",
      },
      {
        q: "Approximately how tall is the statue of the Ascending Christ atop the shrine's hill?",
        options: ["15 feet", "50 feet", "120 feet", "200 feet"],
        answer: 1,
        explanation:
          "A 50-foot white statue of the Ascending Christ crowns the hilltop above the 300+ grotto steps.",
      },
      {
        q: "Which colorful harvest festival is celebrated in Lucban every May 15 in honor of San Isidro Labrador?",
        options: [
          "Sinulog Festival",
          "Panagbenga Festival",
          "Pahiyas Festival",
          "Kadayawan Festival",
        ],
        answer: 2,
        explanation:
          "Lucban celebrates the Pahiyas Festival every May 15, decorating house fronts with harvest produce and colorful kiping.",
      },
      {
        q: "What are the leaf-shaped, brightly dyed rice wafers hung on Lucban houses during Pahiyas called?",
        options: ["Bibingka", "Suman", "Espasol", "Kiping"],
        answer: 3,
        explanation:
          "Kiping are translucent, leaf-shaped rice-paste wafers dyed in vivid colors that symbolize Lucban's harvest thanksgiving.",
      },
    ],
  },
  "villa-sariaya": {
    history:
      "Designed in 1922 by eminent Filipino architect Juan Nakpil (later named the first National Artist for Architecture) for Don Natalio Enriquez and Doña Susana Gala, the Natalio Enriquez Mansion (popularly called Villa Sariaya) in Sariaya, Quezon showcases early 20th-century Art Nouveau and Beaux-Arts details blended with traditional Filipino architecture.",
    significance:
      "Declared a Heritage House by the National Historical Commission of the Philippines in 2008, it exemplifies the golden age of Quezon's coconut-era ancestral mansions along the old Manila-South Road.",
    sources:
      "National Historical Commission of the Philippines (NHCP) Registry of Heritage Houses (2008); Municipality of Sariaya Heritage Council.",
    images: [],
    quiz: [
      {
        q: "In which town of Quezon province is the Natalio Enriquez ancestral mansion (Villa Sariaya) located?",
        options: ["Sariaya", "Gumaca", "Atimonan", "Infanta"],
        answer: 0,
        explanation:
          "The mansion stands along the national highway in the heritage town of Sariaya, Quezon.",
      },
      {
        q: "Which pioneering National Artist for Architecture designed the 1922 Enriquez Mansion in Sariaya?",
        options: ["Cesar Concio", "Juan Nakpil", "Francisco Mañosa", "Jose Maria Zaragoza"],
        answer: 1,
        explanation:
          "Juan Nakpil, who became the Philippines' first National Artist for Architecture in 1973, designed the mansion.",
      },
      {
        q: "Which agricultural crop fueled the early-20th-century economic boom that built Sariaya's grand mansions?",
        options: ["Tobacco", "Abaca", "Coconut (copra)", "Wheat"],
        answer: 2,
        explanation:
          "Prosperity from Quezon's vast coconut plantations (copra trade) funded the ornate ancestral houses of Sariaya.",
      },
      {
        q: "What official recognition did the National Historical Commission grant the mansion in 2008?",
        options: [
          "National Botanical Garden",
          "Archaeological Reserve",
          "Military Fortress",
          "Declared Heritage House",
        ],
        answer: 3,
        explanation: "The NHCP unveiled a marker declaring it a Heritage House in 2008.",
      },
    ],
  },
  "villa-escudero": {
    history:
      "Founded in 1872 by Don Placido Escudero and Doña Claudia Marasigan in Tiaong, Quezon (straddling the boundary with San Pablo, Laguna), Villa Escudero began as a sugarcane plantation before converting to a self-sustaining coconut estate in the early 1900s. Don Arsenio Escudero built the country's first working hydroelectric plant at Labasin Dam in 1929 to power the desiccated coconut factory.",
    significance:
      " opened to the public in 1981, its classic pink church-façade estate museum holds one of the largest private collections of religious santos, ethnographic attire, pre-colonial ceramics, and natural history specimens in Southern Luzon.",
    sources:
      "Villa Escudero Plantations and Resort Archives (Tiaong, Quezon); DOT Region IV-A Agri-Tourism & Museum Directory.",
    images: [],
    quiz: [
      {
        q: "In what year was the Escudero plantation estate originally established?",
        options: ["1872", "1945", "1611", "1981"],
        answer: 0,
        explanation:
          "Don Placido Escudero and Doña Claudia Marasigan established the plantation in 1872.",
      },
      {
        q: "What engineering milestone did Don Arsenio Escudero build at Labasin Dam in 1929?",
        options: [
          "A suspension railway",
          "A hydroelectric power plant for the coconut factory",
          "A desalination tower",
          "A wind turbine array",
        ],
        answer: 1,
        explanation:
          "Labasin Dam was built in 1929 to run a hydroelectric plant powering the estate's desiccated coconut factory.",
      },
      {
        q: "What unique dining experience lies at the spillover of Labasin Dam?",
        options: [
          "Treetop canopy dining",
          "Floating barge banquet",
          "Waterfall restaurant with flowing spring water at your feet",
          "Underground cave dining",
        ],
        answer: 2,
        explanation:
          "Visitors dine at bamboo tables set directly in the clear, shallow waters flowing down the Labasin waterfall.",
      },
      {
        q: "In which town of Quezon province is Villa Escudero situated?",
        options: ["Real", "Mauban", "Candelaria", "Tiaong"],
        answer: 3,
        explanation:
          "Villa Escudero is located in Tiaong, Quezon, along the border with San Pablo City, Laguna.",
      },
    ],
  },
  "mount-banahaw": {
    history:
      "Rising to 2,170 meters above sea level along the boundary of Quezon and Laguna provinces, Mount Banahaw is a three-peaked active complex volcano and vital watershed. Since the Spanish colonial era—including the 1841 religious movement of Apolinario de la Cruz (Hermano Pule)—the mountain's caves, waterfalls, and rocky ridges ('puwestos') have been revered as a 'New Jerusalem' by Filipino folk religious groups and pilgrims.",
    significance:
      "Protected under Republic Act No. 9847 (2009) as the Mounts Banahaw–San Cristobal Protected Landscape, it safeguards montane rainforest biodiversity alongside centuries-old Tagalog spiritual traditions.",
    sources:
      "Republic Act No. 9847 (2009) — Mounts Banahaw-San Cristobal Protected Landscape Act; DENR Protected Areas Management Board.",
    images: [],
    quiz: [
      {
        q: "Which two CALABARZON provinces share the slopes of Mount Banahaw?",
        options: [
          "Quezon and Laguna",
          "Cavite and Batangas",
          "Rizal and Cavite",
          "Batangas and Rizal",
        ],
        answer: 0,
        explanation:
          "Mount Banahaw straddles the boundary between the provinces of Quezon (Dolores, Sariaya, Tayabas, Lucban) and Laguna (Majayjay, Liliw, Nagcarlan, San Pablo).",
      },
      {
        q: "What are the sacred natural shrines—springs, caves, and boulders—visited by pilgrims on Mount Banahaw called?",
        options: ["Baluarte", "Puwestos", "Parola", "Kuta"],
        answer: 1,
        explanation:
          "Pilgrims follow a spiritual circuit of natural shrines known as 'puwestos' (such as Santa Lucia Falls and Kuweba ng Diyos Ama).",
      },
      {
        q: "Which 19th-century Tayabas religious leader founded the Cofradía de San José near Mount Banahaw?",
        options: [
          "Diego Silang",
          "Francisco Dagohoy",
          "Apolinario de la Cruz (Hermano Pule)",
          "Macario Sakay",
        ],
        answer: 2,
        explanation:
          "Apolinario de la Cruz, known as Hermano Pule, led the Cofradía de San José in Tayabas (now Quezon) in 1841.",
      },
      {
        q: "Which law established the Mounts Banahaw–San Cristobal Protected Landscape in 2009?",
        options: [
          "Republic Act No. 1425",
          "Republic Act No. 7160",
          "Republic Act No. 8371",
          "Republic Act No. 9847",
        ],
        answer: 3,
        explanation:
          "Republic Act No. 9847, enacted in 2009, declared Mounts Banahaw and San Cristobal a Protected Landscape.",
      },
    ],
  },
};

/**
 * Fallback seed destinations matching the 19 rows in 0000_create_destinations.sql
 * so that tests or offline environments always have the full CALABARZON dataset.
 */
export const FALLBACK_DESTINATIONS: Destination[] = [
  {
    id: "seed-aguinaldo-shrine",
    slug: "aguinaldo-shrine",
    name: "Aguinaldo Shrine (Museo ni Emilio Aguinaldo)",
    description:
      "The ancestral home of General Emilio Aguinaldo, first President of the Philippines, and the site where Philippine independence was proclaimed on June 12, 1898.",
    address: "Tirona Highway, Kawit",
    province: "Cavite",
    category: "Historical Shrines",
    image_path: "aguinaldo-shrine.jpg",
    latitude: 14.479,
    longitude: 120.899,
    featured: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "seed-bonifacio-trial-house",
    slug: "bonifacio-trial-house",
    name: "Bonifacio Trial House",
    description:
      "The restored bahay-na-bato where Andres Bonifacio, founder of the Katipunan, was tried in 1897 during the revolution's Tejeros Convention aftermath.",
    address: "Col. Riel Street, Barangay Poblacion 1-A, Maragondon",
    province: "Cavite",
    category: "Historical Shrines",
    image_path: "bonifacio-trial-house.jpg",
    latitude: 14.2723,
    longitude: 120.7373,
    featured: false,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "seed-fort-san-felipe",
    slug: "fort-san-felipe",
    name: "Fort San Felipe",
    description:
      "A Spanish colonial fortress completed in 1609 that guarded the old naval yard of Cavite Puerto and witnessed the 1872 Cavite Mutiny.",
    address: "Cavite City",
    province: "Cavite",
    category: "Historical Shrines",
    image_path: "fort-san-felipe.jpg",
    latitude: 14.49,
    longitude: 120.894,
    featured: false,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "seed-museo-de-la-salle",
    slug: "museo-de-la-salle",
    name: "Museo De La Salle",
    description:
      "A lifestyle museum on the De La Salle University-Dasmariñas campus that recreates the world of the 19th-century Philippine bahay-na-bato.",
    address: "De La Salle University-Dasmariñas, Dasmariñas",
    province: "Cavite",
    category: "Museums",
    image_path: "museo-de-la-salle.jpg",
    latitude: 14.322,
    longitude: 120.958,
    featured: false,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "seed-rizal-shrine",
    slug: "rizal-shrine",
    name: "Rizal Shrine",
    description:
      "A reconstructed Spanish-colonial house on the exact site where Dr. Jose Rizal, the national hero, was born on June 19, 1861.",
    address: "P. Burgos Street, Calamba",
    province: "Laguna",
    category: "Historical Shrines",
    image_path: "rizal-shrine.jpg",
    latitude: 14.2115,
    longitude: 121.1614,
    featured: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "seed-nagcarlan-underground-cemetery",
    slug: "nagcarlan-underground-cemetery",
    name: "Nagcarlan Underground Cemetery",
    description:
      "Built in 1845 under Franciscan priest Vicente Velloc, this is the only underground cemetery in the Philippines and a declared National Historical Landmark.",
    address: "National Highway, Nagcarlan",
    province: "Laguna",
    category: "Religious Landmarks",
    image_path: "nagcarlan-underground-cemetery.jpg",
    latitude: 14.197,
    longitude: 121.4055,
    featured: false,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "seed-pagsanjan-falls",
    slug: "pagsanjan-falls",
    name: "Pagsanjan Falls (Magdapio Falls)",
    description:
      "One of the most famous waterfalls in the Philippines, reached by a thrilling banca ride guided by skilled boatmen through the Pagsanjan Gorge.",
    address: "Cavinti",
    province: "Laguna",
    category: "Natural Heritage",
    image_path: "pagsanjan-falls.jpg",
    latitude: 14.423,
    longitude: 121.452,
    featured: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "seed-lake-sampaloc",
    slug: "lake-sampaloc",
    name: "Lake Sampaloc",
    description:
      "The largest of the seven crater lakes of San Pablo City, formed within the caldera of ancient volcanic maars.",
    address: "San Pablo City",
    province: "Laguna",
    category: "Natural Heritage",
    image_path: "lake-sampaloc.jpg",
    latitude: 14.103,
    longitude: 121.318,
    featured: false,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "seed-taal-basilica",
    slug: "taal-basilica",
    name: "Minor Basilica of Saint Martin of Tours",
    description:
      "The largest Catholic church in Asia, this towering basilica of Taal town was completed in 1878 and stands as a masterpiece of Filipino-Spanish colonial architecture.",
    address: "Taal Heritage Town, Taal",
    province: "Batangas",
    category: "Religious Landmarks",
    image_path: "taal-basilica.jpg",
    latitude: 13.879,
    longitude: 120.929,
    featured: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "seed-taal-volcano",
    slug: "taal-volcano",
    name: "Taal Volcano",
    description:
      "One of the world's smallest and most active volcanoes, famous for its unique geology: an island within a lake inside a prehistoric caldera.",
    address: "Talisay and Taal lake area",
    province: "Batangas",
    category: "Natural Heritage",
    image_path: "taal-volcano.jpg",
    latitude: 13.996,
    longitude: 120.993,
    featured: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "seed-mabini-shrine",
    slug: "mabini-shrine",
    name: "Museo ni Apolinario Mabini",
    description:
      "The national shrine honoring Apolinario Mabini, the 'Sublime Paralytic' and Brain of the Philippine Revolution, in his hometown of Tanauan.",
    address: "Barangay Poblacion, Tanauan City",
    province: "Batangas",
    category: "Museums",
    image_path: "mabini-shrine.jpg",
    latitude: 14.086,
    longitude: 121.149,
    featured: false,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "seed-marcela-agoncillo-museum",
    slug: "marcela-agoncillo-museum",
    name: "Marcela Agoncillo Museum",
    description:
      "The ancestral home of Marcela Mariño de Agoncillo of Taal, who sewed the first Philippine flag in Hong Kong in 1898.",
    address: "Marcela Agoncillo Street, Taal",
    province: "Batangas",
    category: "Museums",
    image_path: "marcela-agoncillo-museum.jpg",
    latitude: 13.88,
    longitude: 120.926,
    featured: false,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "seed-antipolo-cathedral",
    slug: "antipolo-cathedral",
    name: "Antipolo Cathedral (Our Lady of Peace and Good Voyage)",
    description:
      "The international shrine of Our Lady of Peace and Good Voyage, home to the 1626 Marian image brought from Acapulco, Mexico.",
    address: "Poblacion, Antipolo City",
    province: "Rizal",
    category: "Religious Landmarks",
    image_path: "antipolo-cathedral.jpg",
    latitude: 14.586,
    longitude: 121.176,
    featured: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "seed-angono-petroglyphs",
    slug: "angono-petroglyphs",
    name: "Angono Petroglyphs",
    description:
      "The oldest known work of art in the Philippines: 127 carved human and animal figures etched into a volcanic tuff rock shelter.",
    address: "Botong Francisco Avenue, Binangonan",
    province: "Rizal",
    category: "Historical Shrines",
    image_path: "angono-petroglyphs.jpg",
    latitude: 14.521,
    longitude: 121.195,
    featured: false,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "seed-hinulugang-taktak",
    slug: "hinulugang-taktak",
    name: "Hinulugang Taktak",
    description:
      "A protected landscape and historic waterfall in Antipolo celebrated in Tagalog folklore and music.",
    address: "Taktak Road, Antipolo City",
    province: "Rizal",
    category: "Natural Heritage",
    image_path: "hinulugang-taktak.jpg",
    latitude: 14.606,
    longitude: 121.177,
    featured: false,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "seed-kamay-ni-hesus",
    slug: "kamay-ni-hesus",
    name: "Kamay ni Hesus Shrine",
    description:
      "A hillside pilgrimage site in Lucban featuring a 50-foot statue of the Ascending Christ and celebrating Lucban's living heritage.",
    address: "Brgy. Ibabang Palale, Lucban",
    province: "Quezon",
    category: "Religious Landmarks",
    image_path: "kamay-ni-hesus.jpg",
    latitude: 14.117,
    longitude: 121.556,
    featured: false,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "seed-villa-sariaya",
    slug: "villa-sariaya",
    name: "Villa Sariaya",
    description:
      "A 1922 ancestral mansion designed by Architect Juan Nakpil in Sariaya, Quezon and declared a Heritage House by the NHCP.",
    address: "A. Bonifacio Street, Sariaya",
    province: "Quezon",
    category: "Historical Shrines",
    image_path: "villa-sariaya.jpg",
    latitude: 13.961,
    longitude: 121.513,
    featured: false,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "seed-villa-escudero",
    slug: "villa-escudero",
    name: "Villa Escudero Plantation and Museum",
    description:
      "A historic coconut plantation and museum established in 1872 in Tiaong, Quezon, preserving ecclesiastical art and rural heritage.",
    address: "Tiaong",
    province: "Quezon",
    category: "Museums",
    image_path: "villa-escudero.jpg",
    latitude: 14.046,
    longitude: 121.275,
    featured: false,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "seed-mount-banahaw",
    slug: "mount-banahaw",
    name: "Mount Banahaw",
    description:
      "A sacred mountain straddling Quezon and Laguna, revered as a spiritual pilgrimage landscape and protected montane rainforest.",
    address: "Dolores and Lucban area",
    province: "Quezon",
    category: "Natural Heritage",
    image_path: "mount-banahaw.jpg",
    latitude: 14.14,
    longitude: 121.5,
    featured: false,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
];

// ---- Local Storage Persistence for Progress & Custom Destination Metadata ----
const PROGRESS_KEY = "sulyap_progress_v1";
const CUSTOM_META_KEY = "sulyap_custom_meta_v1";
const CHANGE_EVENT = "sulyap-store-change";

let memoryProgress: Record<string, DestinationProgress> = {};
let memoryMeta: Record<string, Partial<SulyapEnrichment>> = {};

function hasStorage(): boolean {
  try {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
  } catch {
    return false;
  }
}

function readProgressMap(): Record<string, DestinationProgress> {
  if (!hasStorage()) return memoryProgress;
  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY);
    if (!raw) return memoryProgress;
    const parsed = JSON.parse(raw) as Record<string, DestinationProgress>;
    memoryProgress = parsed;
    return parsed;
  } catch {
    return memoryProgress;
  }
}

function writeProgressMap(map: Record<string, DestinationProgress>): void {
  memoryProgress = map;
  if (hasStorage()) {
    try {
      window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(map));
      window.dispatchEvent(new Event(CHANGE_EVENT));
    } catch {
      // Ignore quota errors in private browsing
    }
  }
}

function readMetaMap(): Record<string, Partial<SulyapEnrichment>> {
  if (!hasStorage()) return memoryMeta;
  try {
    const raw = window.localStorage.getItem(CUSTOM_META_KEY);
    if (!raw) return memoryMeta;
    const parsed = JSON.parse(raw) as Record<string, Partial<SulyapEnrichment>>;
    memoryMeta = parsed;
    return parsed;
  } catch {
    return memoryMeta;
  }
}

function writeMetaMap(map: Record<string, Partial<SulyapEnrichment>>): void {
  memoryMeta = map;
  if (hasStorage()) {
    try {
      window.localStorage.setItem(CUSTOM_META_KEY, JSON.stringify(map));
      window.dispatchEvent(new Event(CHANGE_EVENT));
    } catch {
      // Ignore quota errors
    }
  }
}

export function getEnrichment(
  destination: Pick<
    Destination,
    | "id"
    | "slug"
    | "name"
    | "description"
    | "province"
    | "category"
    | "history"
    | "significance"
    | "sources"
    | "gallery_urls"
  >,
): SulyapEnrichment {
  const customMap = readMetaMap();
  const custom = customMap[destination.slug] || customMap[destination.id] || {};
  const seed = SEED_ENRICHMENT[destination.slug];
  const dbGallery = Array.isArray(destination.gallery_urls)
    ? destination.gallery_urls.filter((u): u is string => typeof u === "string" && u.length > 0)
    : [];

  return {
    history:
      custom.history?.trim() ||
      destination.history?.trim() ||
      seed?.history ||
      `${destination.name} is an important cultural landmark in ${destination.province}, Region IV-A (CALABARZON). ${destination.description}`,
    significance:
      custom.significance?.trim() ||
      destination.significance?.trim() ||
      seed?.significance ||
      `As part of ${destination.province}'s ${getCategoryMeta(destination.category).fil.toLowerCase()} (${destination.category}) heritage, ${destination.name} helps students connect local community history with national identity.`,
    sources:
      custom.sources?.trim() ||
      destination.sources?.trim() ||
      seed?.sources ||
      `Department of Tourism Region IV-A (CALABARZON) Cultural Mapping Registry; ${destination.province} Provincial Tourism Office.`,
    images:
      custom.images && custom.images.length > 0
        ? custom.images
        : dbGallery.length > 0
          ? dbGallery
          : (seed?.images ?? []),
    quiz: custom.quiz && custom.quiz.length > 0 ? custom.quiz : seed?.quiz,
  };
}

export function saveCustomMeta(slugOrId: string, meta: Partial<SulyapEnrichment>): void {
  const map = { ...readMetaMap() };
  map[slugOrId] = { ...(map[slugOrId] || {}), ...meta };
  writeMetaMap(map);
}

/**
 * Deterministic or random shuffle helper that ensures 4 unique options
 * containing the correct answer (M4.3).
 */
export function generateQuestionsForDestination(
  d: Pick<Destination, "name" | "province" | "category" | "address">,
): QuizQuestion[] {
  const catMeta = getCategoryMeta(d.category);
  const allProvinces = [...PROVINCES];
  const otherProvinces = allProvinces.filter((p) => p !== d.province).slice(0, 3);
  const provOptions = [d.province, ...otherProvinces].slice(0, 4);
  // Rotate options deterministically based on name length so correct index varies
  const rot1 = d.name.length % 4;
  const rotatedProv = [...provOptions.slice(rot1), ...provOptions.slice(0, rot1)] as [
    string,
    string,
    string,
    string,
  ];

  const allCategories = [...CATEGORIES];
  const rightCat = allCategories.includes(d.category as (typeof CATEGORIES)[number])
    ? d.category
    : catMeta.dbCategory;
  const otherCats = allCategories.filter((c) => c !== rightCat).slice(0, 3);
  const catOptions = [rightCat, ...otherCats].slice(0, 4);
  const rot2 = (d.name.length + 1) % 4;
  const rotatedCat = [...catOptions.slice(rot2), ...catOptions.slice(0, rot2)] as [
    string,
    string,
    string,
    string,
  ];

  const filLabels = [
    "Pamana (Heritage)",
    "Simbahan (Church)",
    "Museo (Museum)",
    "Kalikasan (Nature)",
  ];
  const rightFil = `${catMeta.fil} (${catMeta.key})`;
  const otherFil = filLabels.filter((f) => f !== rightFil).slice(0, 3);
  const filOptions = [rightFil, ...otherFil].slice(0, 4);
  const rot3 = (d.name.length + 2) % 4;
  const rotatedFil = [...filOptions.slice(rot3), ...filOptions.slice(0, rot3)] as [
    string,
    string,
    string,
    string,
  ];

  const regionOptions: [string, string, string, string] = [
    "Region I (Ilocos)",
    "Region III (Central Luzon)",
    "Region V (Bicol)",
    "Region IV-A (CALABARZON)",
  ];

  return [
    {
      q: `In which province of CALABARZON is ${d.name} located?`,
      options: rotatedProv,
      answer: rotatedProv.indexOf(d.province),
      explanation: `${d.name} is located in ${d.address ? `${d.address}, ` : ""}${d.province}.`,
    },
    {
      q: `Which heritage category best describes ${d.name}?`,
      options: rotatedCat,
      answer: rotatedCat.indexOf(rightCat),
      explanation: `${d.name} is classified under ${rightCat} (${catMeta.fil}).`,
    },
    {
      q: `What is the Filipino Sulyap category designation for ${d.name}?`,
      options: rotatedFil,
      answer: rotatedFil.indexOf(rightFil),
      explanation: `In Sulyap, ${rightCat} corresponds to ${rightFil}.`,
    },
    {
      q: `${d.name} in ${d.province} is part of which Philippine region?`,
      options: regionOptions,
      answer: 3,
      explanation: `Cavite, Laguna, Batangas, Rizal, and Quezon make up Region IV-A (CALABARZON).`,
    },
  ];
}

export function getQuestionsForDestination(
  d: Pick<
    Destination,
    "id" | "slug" | "name" | "province" | "category" | "address" | "description"
  >,
): QuizQuestion[] {
  const enrichment = getEnrichment(d);
  if (enrichment.quiz && enrichment.quiz.length > 0) {
    return enrichment.quiz;
  }
  return generateQuestionsForDestination(d);
}

// ---- Visitor Identity & Cloud Progress Sync ----
const VISITOR_ID_KEY = "sulyap_visitor_id_v1";

export function getVisitorId(): string {
  if (!hasStorage()) return "local-visitor";
  try {
    let vid = window.localStorage.getItem(VISITOR_ID_KEY);
    if (!vid) {
      vid =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `v-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      window.localStorage.setItem(VISITOR_ID_KEY, vid);
    }
    return vid;
  } catch {
    return "local-visitor";
  }
}

function pushProgressToCloud(row: DestinationProgress): void {
  if (!hasStorage()) return;
  const visitorId = getVisitorId();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    row.dest_id,
  );
  void supabase
    .from("visitor_progress" as "destinations")
    .upsert(
      {
        visitor_id: visitorId,
        destination_id: isUuid ? row.dest_id : null,
        destination_slug: row.slug,
        toured: row.toured === 1,
        best: row.best,
        total: row.total,
        attempts: row.attempts,
        last: row.last,
        updated_at: new Date().toISOString(),
      } as never,
      { onConflict: "visitor_id,destination_slug" },
    )
    .then(() => {});
}

// ---- Progress & Passport Operations (M1.9, M2, M4.3) ----
export function listProgress(): DestinationProgress[] {
  return Object.values(readProgressMap());
}

export function getProgress(idOrSlug: string): DestinationProgress | null {
  const map = readProgressMap();
  return (
    map[idOrSlug] ||
    Object.values(map).find((p) => p.dest_id === idOrSlug || p.slug === idOrSlug) ||
    null
  );
}

export function isDestinationToured(
  d: Pick<Destination, "id" | "slug">,
  progressList?: DestinationProgress[],
): boolean {
  const list = progressList ?? listProgress();
  return list.some((p) => (p.dest_id === d.id || p.slug === d.slug) && p.toured === 1);
}

export function getDestinationProgress(
  d: Pick<Destination, "id" | "slug">,
  progressList?: DestinationProgress[],
): DestinationProgress | null {
  const list = progressList ?? listProgress();
  return list.find((p) => p.dest_id === d.id || p.slug === d.slug) ?? null;
}

export function markToured(id: string, slug: string = id): DestinationProgress {
  const map = { ...readProgressMap() };
  const key = slug || id;
  const existing = map[key] ||
    map[id] || {
      dest_id: id,
      slug: key,
      toured: 0,
      best: 0,
      total: 0,
      attempts: 0,
      last: 0,
    };
  const updated: DestinationProgress = {
    ...existing,
    dest_id: id,
    slug: key,
    toured: 1,
  };
  map[key] = updated;
  if (id !== key) delete map[id];
  writeProgressMap(map);
  pushProgressToCloud(updated);
  return updated;
}

export function saveScore(
  id: string,
  score: number,
  total: number,
  slug: string = id,
): DestinationProgress {
  const map = { ...readProgressMap() };
  const key = slug || id;
  const existing = map[key] || map[id];
  const updated: DestinationProgress = existing
    ? {
        ...existing,
        dest_id: id,
        slug: key,
        best: Math.max(existing.best, score),
        total,
        attempts: existing.attempts + 1,
        last: score,
      }
    : {
        dest_id: id,
        slug: key,
        toured: 0,
        best: score,
        total,
        attempts: 1,
        last: score,
      };
  map[key] = updated;
  if (id !== key) delete map[id];
  writeProgressMap(map);
  pushProgressToCloud(updated);
  return updated;
}

/**
 * M2.3 / M4.3: Cascade delete progress and custom metadata when a destination is removed
 * so no orphan progress rows or questions remain.
 */
export function deleteDestinationProgress(id: string, slug?: string): void {
  const progMap = { ...readProgressMap() };
  for (const [k, v] of Object.entries(progMap)) {
    if (k === id || k === slug || v.dest_id === id || (slug && v.slug === slug)) {
      delete progMap[k];
    }
  }
  writeProgressMap(progMap);

  const metaMap = { ...readMetaMap() };
  delete metaMap[id];
  if (slug) delete metaMap[slug];
  writeMetaMap(metaMap);

  if (hasStorage() && slug) {
    const visitorId = getVisitorId();
    void supabase
      .from("visitor_progress" as "destinations")
      .delete()
      .eq("visitor_id" as "id", visitorId)
      .eq("destination_slug" as "slug", slug)
      .then(() => {});
  }
}

export function resetAllProgress(): void {
  writeProgressMap({});
  if (hasStorage()) {
    const visitorId = getVisitorId();
    void supabase
      .from("visitor_progress" as "destinations")
      .delete()
      .eq("visitor_id" as "id", visitorId)
      .then(() => {});
  }
}

export function clearAllProgressForTests(): void {
  writeProgressMap({});
  writeMetaMap({});
}

let cloudSyncedOnce = false;

export function useSulyapProgress(): DestinationProgress[] {
  const [progress, setProgress] = useState<DestinationProgress[]>(() => listProgress());

  useEffect(() => {
    const sync = () => setProgress(listProgress());
    sync();

    if (!cloudSyncedOnce && hasStorage()) {
      cloudSyncedOnce = true;
      const visitorId = getVisitorId();
      void supabase
        .from("visitor_progress" as "destinations")
        .select("*")
        .eq("visitor_id" as "id", visitorId)
        .then(({ data, error }) => {
          if (error || !Array.isArray(data) || data.length === 0) return;
          const local = { ...readProgressMap() };
          let changed = false;
          for (const raw of data as unknown as Array<{
            destination_id: string | null;
            destination_slug: string;
            toured: boolean;
            best: number;
            total: number;
            attempts: number;
            last: number;
          }>) {
            const slug = raw.destination_slug;
            if (!slug) continue;
            const cur = local[slug];
            const merged: DestinationProgress = {
              dest_id: raw.destination_id || cur?.dest_id || slug,
              slug,
              toured: raw.toured || cur?.toured === 1 ? 1 : 0,
              best: Math.max(raw.best ?? 0, cur?.best ?? 0),
              total: raw.total || cur?.total || 0,
              attempts: Math.max(raw.attempts ?? 0, cur?.attempts ?? 0),
              last: raw.last ?? cur?.last ?? 0,
            };
            local[slug] = merged;
            changed = true;
          }
          if (changed) writeProgressMap(local);
        });
    }

    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return progress;
}
