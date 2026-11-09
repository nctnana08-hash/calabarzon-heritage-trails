import type { Destination } from "./destinations";
import { PROVINCE_CODES, getCategoryMeta, seedFromId } from "./sulyap-theme";

export type ArtMotif =
  "retablo" | "fresco" | "sculpture" | "manuscript" | "vessel" | "arch" | "petroglyph" | "natural";

export type ArtPiece360 = {
  id: string;
  title: string;
  filTitle: string;
  artistOrMaker: string;
  period: string;
  medium: string;
  dimensions: string;
  bearing: number; // 0..359 degrees around the 360° horizon
  pitch: number; // -20..+25 degrees vertical elevation
  zone: string;
  motif: ArtMotif;
  details: string;
  conservationNote: string;
};

/**
 * Curated 360° Art Pieces, Architectural Masterworks & Cultural Relics
 * for all 19 seeded CALABARZON heritage destinations.
 */
export const DESTINATION_ART_360: Record<string, ArtPiece360[]> = {
  "aguinaldo-shrine": [
    {
      id: "ART-CAV-01A",
      title: "Inang Pilipinas Allegorical Ceiling Relief",
      filTitle: "Alegorya ng Inang Pilipinas sa Kisame",
      artistOrMaker: "Caviteño Master Woodcarvers (Commissioned by Gen. Emilio Aguinaldo)",
      period: "c. 1920 · American Colonial Renovation",
      medium: "Hand-carved polychrome Philippine hardwood (Narra & Molave)",
      dimensions: "4.2 m × 2.8 m ceiling medallion",
      bearing: 20,
      pitch: 18,
      zone: "Grand Hall (Sala Mayor) — North Ceiling Vault",
      motif: "fresco",
      details:
        "Dominating the ceiling of the Grand Hall, this high-relief wooden carving portrays Mother Philippines holding the eight-rayed sun flag alongside symbols of agriculture, revolutionary arms, and the winged Spirit of Liberty.",
      conservationNote:
        "Preserved under NHCP curatorial climate monitoring; original paint layers stabilized.",
    },
    {
      id: "ART-CAV-01B",
      title: "1898 Independence Proclamation Balcony & Flagstaff",
      filTitle: "Balkonahe ng Kalayaan at Sabitan ng Watawat",
      artistOrMaker: "General Emilio Aguinaldo (Architectural Design)",
      period: "1898 / 1919 Tower Addition",
      medium: "Turned Molave balusters, wrought-iron grillwork, and Capiz shell transoms",
      dimensions: "6.5 m façade span",
      bearing: 110,
      pitch: 6,
      zone: "Front Façade — East Wing Proyeksyon",
      motif: "arch",
      details:
        "Added during the post-revolutionary expansion to commemorate the front window where the Act of Independence was read on June 12, 1898, featuring carved Katipunan and Magdalo sun emblems.",
      conservationNote: "Restored ahead of the Philippine Centennial in 1998.",
    },
    {
      id: "ART-CAV-01C",
      title: "Relief Map of the Republic in the Dining Hall Ceiling",
      filTitle: " Inukit na Mapa ng Pilipinas sa Komedor",
      artistOrMaker: "Kawit Artisans Guild",
      period: "c. 1921",
      medium: "Carved and gilded wood bas-relief on coffered ceiling",
      dimensions: "3.1 m × 1.9 m",
      bearing: 200,
      pitch: 15,
      zone: "Comedor (State Dining Room) — South Sector",
      motif: "fresco",
      details:
        "A geographical bas-relief map of the Philippine archipelago carved directly into the dining room ceiling, highlighting Cavite in crimson and gold as the cradle of the First Philippine Republic.",
      conservationNote: "Intact original carving; illuminated for museum visitors.",
    },
    {
      id: "ART-CAV-01D",
      title: "Camagon Secret Passage Desk & Revolutionary Reliquary",
      filTitle: "Mesang Camagon na may Lihim na Lagusan",
      artistOrMaker: "Master Cabinetmakers of Cavite",
      period: "Late 19th Century (c. 1896)",
      medium: "Polished Camagon (Philippine Ebony) and bone inlay",
      dimensions: "1.4 m × 0.85 m × 0.78 m",
      bearing: 290,
      pitch: -6,
      zone: "Presidential Study — West Chamber",
      motif: "manuscript",
      details:
        "An ornate writing desk concealing a hinged floor panel and escape tunnel used during the revolutionary years, accompanied by original brass inkwells and campaign dispatches.",
      conservationNote: "Displayed behind protective museum barriers on the second floor.",
    },
  ],

  "bonifacio-trial-house": [
    {
      id: "ART-CAV-02A",
      title: "Life-Size Bronze & Resin Tableau of the 1897 Court-Martial",
      filTitle: "Eksena ng Paglilitis sa Magkapatid na Bonifacio",
      artistOrMaker: "NHCP Historical Exhibition Studio",
      period: "2014 Museum Modernization (depicting May 1897)",
      medium: "Cast sculptural figures, period textiles, and antique cane furniture",
      dimensions: "5.0 m × 3.8 m room installation",
      bearing: 30,
      pitch: 0,
      zone: "Upper Sala — North Tribunal Area",
      motif: "sculpture",
      details:
        "A dramatic sculptural installation recreating the Council of War presided over by Gen. Mariano Noriel, showing Supremo Andres Bonifacio and his brother Procopio testifying beside Gregoria de Jesus.",
      conservationNote: "Permanent centerpiece of the NHCP Museo ng Paglilitis.",
    },
    {
      id: "ART-CAV-02B",
      title: "Katipunan 'KKK' Blood Compact &Kartilya Mural Wall",
      filTitle: "Mural ng Sanduguan at Kartilya ng Katipunan",
      artistOrMaker: "Contemporary Cavite Heritage Painters",
      period: "Late 20th Century",
      medium: "Acrylic and sepia glaze on archival panel",
      dimensions: "3.4 m × 2.1 m",
      bearing: 120,
      pitch: 4,
      zone: "Gallery I — East Wall",
      motif: "fresco",
      details:
        "Depicts the sacred initiation rites of the Katipunan alongside calligraphic excerpts from Emilio Jacinto's Kartilya and Bonifacio's poem 'Pag-ibig sa Tinubuang Lupa'.",
      conservationNote: "Climate-controlled gallery display.",
    },
    {
      id: "ART-CAV-02C",
      title: "1889 Calado Fretwork & Capiz Sliding Ventanillas",
      filTitle: "Calado at Dungawang Capiz ng Bahay-na-Bato",
      artistOrMaker: "Teodorico Reyes Workshop (Maragondon)",
      period: "1889 · Late Spanish Colonial",
      medium: "Pierced hardwood calado transoms and translucent Placuna placenta shells",
      dimensions: "0.9 m × 2.4 m transoms",
      bearing: 210,
      pitch: 12,
      zone: "South Street Façade — Upper Story",
      motif: "arch",
      details:
        "Delicate floral wood-lattice transoms (calado) above the interior partitions allow cross-ventilation while casting geometric shadow patterns across the wide hardwood floorboards.",
      conservationNote: "Restored using traditional mortise-and-tenon joinery.",
    },
    {
      id: "ART-CAV-02D",
      title: "Facsimile Folio of the Tejeros & Naic Military Documents",
      filTitle: "Mga Kasulatan ng Kumbensiyon sa Tejeros at Naic",
      artistOrMaker: "Revolutionary Scribes of Cavite",
      period: "March–May 1897",
      medium: "Iron-gall ink manuscript facsimiles on laid rag paper",
      dimensions: "32 cm × 22 cm folios",
      bearing: 300,
      pitch: -8,
      zone: "Archival Case — West Reading Alcove",
      motif: "manuscript",
      details:
        "Illuminated vitrine displaying the Acta de Tejeros and the original trial transcripts signed by the military tribunal in Maragondon.",
      conservationNote: "UV-filtered glass vitrine.",
    },
  ],

  "fort-san-felipe": [
    {
      id: "ART-CAV-03A",
      title: "1609 Ashlar Bastion Curtain Wall & Royal Coat of Arms",
      filTitle: "Pader na Adobe at Maharlikang Sagisag ng Espanya",
      artistOrMaker: "Spanish Royal Corps of Military Engineers & Tagalog Masons",
      period: "1609–1616 · Early Spanish Colonial",
      medium: "Hand-quarried volcanic tuff (adobe) blocks and lime mortar",
      dimensions: "9.0 m high ramparts",
      bearing: 15,
      pitch: 10,
      zone: "North Seaward Bastion",
      motif: "arch",
      details:
        "Massive dressed-stone ramparts that protected the Manila-Acapulco Galleon shipyards of Cavite Puerto against Dutch and Moro fleets, bearing weathered heraldic stone carvings.",
      conservationNote: "Maintained within the Philippine Navy compound.",
    },
    {
      id: "ART-CAV-03B",
      title: "18th-Century Bronze Culverin & Naval Artillery Battery",
      filTitle: "Kanyong Tanso ng Daungang Pandigma",
      artistOrMaker: "Royal Foundry of Manila & Cavite Arsenal",
      period: "c. 1760 · Bourbon Era",
      medium: "Cast bronze barrel with dolphin lifting handles on hardwood naval carriage",
      dimensions: "2.9 m barrel length",
      bearing: 105,
      pitch: 0,
      zone: "East Rampart Embrasure",
      motif: "sculpture",
      details:
        "Original muzzle-loading coastal defense cannon overlooking Cañacao Bay, cast with the royal cipher and floral breech ornamentation.",
      conservationNote: "Protected with anti-corrosion microcrystalline wax.",
    },
    {
      id: "ART-CAV-03C",
      title: "1872 Cavite Mutiny & GOMBURZA Martyrs Memorial Plaque",
      filTitle: "Bantayog ng Pag-aalsa sa Kabite ng 1872",
      artistOrMaker: "National Historical Institute Sculptors",
      period: "1972 Centennial Marker",
      medium: "Cast bronze historical relief on granite pedestal",
      dimensions: "1.8 m × 1.2 m",
      bearing: 195,
      pitch: -2,
      zone: "Central Plaza de Armas — South Sector",
      motif: "manuscript",
      details:
        "Commemorates Sergeant Fernando La Madrid and the 200 Filipino soldiers and arsenal workers whose January 20, 1872 uprising led to the martyrdom of Fathers Gomez, Burgos, and Zamora.",
      conservationNote: "Outdoor bronze relief in excellent condition.",
    },
    {
      id: "ART-CAV-03D",
      title: "Manila-Acapulco Galleon Hull Scale Model & Astrolabe",
      filTitle: "Modelo ng Galyon ng Maynila at Acapulco",
      artistOrMaker: "Philippine Naval Museum Guild",
      period: "20th-Century Curatorial Reconstruction",
      medium: "Hand-rigged Molave, brass fittings, and linen sails",
      dimensions: "1.6 m × 1.3 m",
      bearing: 285,
      pitch: -4,
      zone: "Naval History Pavilion — West Gallery",
      motif: "vessel",
      details:
        "Detailed scale replica of a 17th-century Manila Galleon built at the Cavite royal shipyard (Ribera de Cavite), complete with stern lantern carvings.",
      conservationNote: "Exhibited in a sealed acrylic case.",
    },
  ],

  "museo-de-la-salle": [
    {
      id: "ART-CAV-04A",
      title: "19th-Century Bihis-Santo (Ivory & Silver Vestmented Image)",
      filTitle: "antigong Imahen ng Santo na Garing at Pilak",
      artistOrMaker: "Spanish-Filipino Santero Workshop",
      period: "c. 1870 · Late Spanish Colonial",
      medium:
        "Carved ivory head and hands, repoussé silver halo (tres potencias), gold-thread velvet",
      dimensions: "95 cm height including virina",
      bearing: 25,
      pitch: 2,
      zone: "Oratorio (Family Prayer Room) — North Wing",
      motif: "retablo",
      details:
        "A devotional image housed beneath a blown-glass dome (virina), showcasing the refined gold-bullion embroidery (burda) and silverwork patronized by 19th-century ilustrado families.",
      conservationNote: "Kept in low-lux, humidity-stabilized display.",
    },
    {
      id: "ART-CAV-04B",
      title: "Inlaid Baliuag & Batangas AhTay Four-Poster Bed (Kama)",
      filTitle: "Kama na may Kalabasa at Inukit na Kahoy",
      artistOrMaker: "Workshop of Eduardo AhTay / Tagalog Cabinetmakers",
      period: "c. 1885",
      medium: "Carved Narra and Kamagong with bone inlay and woven solihiya cane",
      dimensions: "2.3 m × 1.8 m × 2.5 m",
      bearing: 115,
      pitch: 0,
      zone: "Cuarto Principal (Master Bedroom) — East Gallery",
      motif: "arch",
      details:
        "Features an intricately pierced crown tester (langit-langitan) carved with tropical fruit garlands, squash (kalabasa) finials, and airy solihiya cane webbing suited to the Philippine tropics.",
      conservationNote: "Museum-grade conservation polish.",
    },
    {
      id: "ART-CAV-04C",
      title: "Gilded Arana Chandelier & Vienna Bentwood Salon Suite",
      filTitle: "Aranya na Kristal at Muwebles ng Sala",
      artistOrMaker: "Bohemian Glassmakers & Thonet / Manila Workshops",
      period: "c. 1890",
      medium: "Cut lead crystal prisms, brass armatures, and steam-bent beechwood",
      dimensions: "1.4 m drop chandelier",
      bearing: 205,
      pitch: 16,
      zone: "Caida & Sala Mayor — South Center",
      motif: "fresco",
      details:
        "Illustrates the cosmopolitan taste of Southern Luzon gentry after the opening of the Suez Canal in 1869, blending European crystal lighting with Tagalog spatial hospitality.",
      conservationNote: "Fully wired with low-heat LED conservation bulbs.",
    },
    {
      id: "ART-CAV-04D",
      title: "Pajonera & Platera (Carved Silverware & Porcelain Sideboard)",
      filTitle: "Platera at Koleksyon ng Porselanang Kraak",
      artistOrMaker: "Laguna & Batangas Master Joiners",
      period: "Late 19th Century",
      medium: "Narra wood with keyhole bone escutcheons and Ming/Qing export porcelain",
      dimensions: "1.9 m × 1.5 m × 0.55 m",
      bearing: 295,
      pitch: -4,
      zone: "Comedor (Dining Hall) — West Wall",
      motif: "vessel",
      details:
        "Displays blue-and-white trade ceramics, silverbetel nut boxes (buyeras), and hand-blown glass dulces jars used during town fiestas.",
      conservationNote: "Secured with seismic museum mounts.",
    },
  ],

  "rizal-shrine": [
    {
      id: "ART-LAG-05A",
      title: "Young Jose Rizal's Clay & Wax Sculptural Sketches",
      filTitle: "Mga Lilok na Luwad ng Batang si Jose Rizal",
      artistOrMaker: "Dr. Jose Protacio Rizal",
      period: "c. 1868–1877 (Replicas & Period Artifacts)",
      medium: "Modeled terracotta clay and beeswax miniatures",
      dimensions: "18 cm to 28 cm height",
      bearing: 15,
      pitch: -4,
      zone: "Ground Floor Exhibition Gallery — North Vitrine",
      motif: "sculpture",
      details:
        "Showcases Rizal's precocious gift for modeling animals, portrait busts, and allegorical figures in Calamba clay before his studies at the Ateneo Municipal and Madrid.",
      conservationNote: "Displayed in hermetically sealed NHCP display cases.",
    },
    {
      id: "ART-LAG-05B",
      title: "'Sa Aking Mga Kabata' & 'Un Recuerdo A Mi Pueblo' Holograph Wall",
      filTitle: "Tanghalan ng mga Tula sa Calamba",
      artistOrMaker: "Dr. Jose Rizal / NHCP Curatorial Design",
      period: "1869–1876 Literary Period",
      medium: "Illuminated calligraphic panels and period inkwell artifacts",
      dimensions: "3.6 m × 2.2 m",
      bearing: 105,
      pitch: 4,
      zone: "Literary Gallery — East Wing",
      motif: "manuscript",
      details:
        "Celebrates Rizal's tender memories of Laguna de Bay, Mount Makiling, and the town of Calamba that shaped his lifelong devotion to Philippine nationhood.",
      conservationNote: "Interactive audio-visual and text installation.",
    },
    {
      id: "ART-LAG-05C",
      title: "The Mercado Family Library & Spanish Nocturnal Oil Lamp",
      filTitle: "Aklatan ng Pamilya Mercado at Lamparang Langis",
      artistOrMaker: "19th-Century Manila & European Artisans",
      period: "c. 1865 · Spanish Colonial",
      medium: "Narra bookcases, leather-bound volumes, and brass coconut-oil quinque lamp",
      dimensions: "2.8 m wall elevation",
      bearing: 195,
      pitch: 2,
      zone: "Upper Story Study — South Room",
      motif: "vessel",
      details:
        "Recreates the private library of over 1,000 volumes owned by Francisco Mercado and Teodora Alonso, where the story of the Moth and the Flame (Ang Gamugamo at ang Lampara) was told to young Pepe.",
      conservationNote: "Restored by Architect Juan Nakpil in 1950 and maintained by NHCP.",
    },
    {
      id: "ART-LAG-05D",
      title: "1861 Garden Well (Balon) & Boyhood Bronze Monument",
      filTitle: "Matandang Balon at Rebulto ng Batang Rizal",
      artistOrMaker: "National Artist Guillermo Tolentino / NHCP Sculptors",
      period: "1861 Well / 1950s Bronze Sculpture",
      medium: "Original volcanic adobe stonework and cast bronze figure",
      dimensions: "1.6 m statue beside 2.1 m stone well",
      bearing: 285,
      pitch: -2,
      zone: "Rear Courtyard Garden — West Lawn",
      motif: "sculpture",
      details:
        "The surviving original wishing well from the 1861 Mercado residence stands beside a bronze sculpture of the seven-year-old Rizal with his dog Usman.",
      conservationNote: "Open-air courtyard monument; cleaned annually every June 19.",
    },
  ],

  "nagcarlan-underground-cemetery": [
    {
      id: "ART-LAG-06A",
      title: "1845 Baroque Brick & Coral-Stone Cemetery Gate",
      filTitle: "Tarangkahang Laryo at Batong-Koral ng Campo Santo",
      artistOrMaker: "Fray Vicente Velloc, OFM & Nagcarlan Master Masons",
      period: "1845 · Spanish Colonial",
      medium: "Kiln-fired clay bricks (ladrillo), adobe, and lime-sand mortar",
      dimensions: "5.5 m arch height",
      bearing: 10,
      pitch: 12,
      zone: "Main Entrance — North Axis",
      motif: "arch",
      details:
        "A undulating scalloped brick wall crowned by wrought-iron crosses and pilasters that leads visitors along a stone walkway toward the octagonal funerary chapel.",
      conservationNote: "Structural masonry consolidated by the NHCP.",
    },
    {
      id: "ART-LAG-06B",
      title: "Octagonal Chapel Retablo & Memento Mori Epigraph",
      filTitle: "Altar ng Kapilya at Inskripsyon sa Kamatayan",
      artistOrMaker: "Laguna Franciscan Artisans",
      period: "c. 1845",
      medium: "Carved wood altar, polychrome crucifix, and hand-painted Spanish tablet",
      dimensions: "4.2 m altar elevation",
      bearing: 100,
      pitch: 4,
      zone: "Upper Funerary Chapel — East Apse",
      motif: "retablo",
      details:
        "Features the poetic Spanish inscription above the crypt stairs: 'Go forth, mortal man, full of life today; tomorrow you shall find yourself in this very crypt.'",
      conservationNote: "Protected beneath the restored tiled dome.",
    },
    {
      id: "ART-LAG-06C",
      title: "Subterranean Crypt Vaults & Hand-Painted Ceramic Tiles",
      filTitle: "Ilalim na Kripta at Azulejos na Baldosa",
      artistOrMaker: "Fray Vicente Velloc Workshop",
      period: "1845",
      medium: "Vaulted brick masonry and blue-and-white glazed ceramic tiles",
      dimensions: "15 steps below ground; 36 underground niches",
      bearing: 190,
      pitch: -14,
      zone: "Underground Crypt — South Chamber",
      motif: "fresco",
      details:
        "Fifteen feet beneath the chapel lawn, this cool, vaulted brick chamber served both as an elite burial crypt and as a clandestine meeting hall for Laguna Katipuneros in 1896.",
      conservationNote: "Monitored for subterranean humidity and ground-water seepage.",
    },
    {
      id: "ART-LAG-06D",
      title: "240 Above-Ground Brick Nichos & Wrought-Iron Finials",
      filTitle: "Mga Nitso sa Pader ng Campo Santo",
      artistOrMaker: "Nagcarlan Stonecutters & Blacksmiths",
      period: "1845–1898",
      medium: "Layered red brick, carved marble epitaphs, and forged iron crosses",
      dimensions: "Circular perimeter wall",
      bearing: 280,
      pitch: 2,
      zone: "West Perimeter Wall",
      motif: "sculpture",
      details:
        "Concentric tiers of arched burial niches built directly into the octagonal perimeter walls, displaying 19th-century Tagalog and Spanish calligraphic gravestones.",
      conservationNote:
        "Declared a National Historical Landmark under Presidential Decree No. 260.",
    },
  ],

  "pagsanjan-falls": [
    {
      id: "ART-LAG-07A",
      title: "1890 Real Puerta de Pagsanjan (Historic Stone Arch Gate)",
      filTitle: "Arko Real ng Pagsanjan (1890)",
      artistOrMaker: "Fray Cipriano Bac & Pagsanjan Guild of Masons",
      period: "1878–1880 · Late Spanish Colonial",
      medium: "Carved volcanic tuff (adobe) with Castilian Royal Lion reliefs",
      dimensions: "8.5 m height × 10 m span",
      bearing: 25,
      pitch: 14,
      zone: "Town Approach to the River Gorge — West Portal",
      motif: "arch",
      details:
        "Standing at the gateway to Pagsanjan, this triple-arched stone portal is crowned by the Royal Coat of Arms of Spain guarded by two carved stone lions.",
      conservationNote: "Preserved as a National Cultural Treasure landmark of Pagsanjan.",
    },
    {
      id: "ART-LAG-07B",
      title: "Hand-Hewn Dugout Banca & Bangkero Paddle Craft",
      filTitle: "ukit na Bangka ng Pamamangka sa Agos",
      artistOrMaker: "Master Boatbuilders of Cavinti & Pagsanjan",
      period: "Living Intangible Craft Tradition",
      medium: "Carved hardwood hull, marine fiberglass reinforcement, and bamboo poles",
      dimensions: "5.2 m length × 0.7 m beam",
      bearing: 115,
      pitch: -8,
      zone: "Bumbungan & Balanac River Confluence",
      motif: "vessel",
      details:
        "Engineered specifically to thread narrow basalt boulders and whitewater rapids during the 'Shooting the Rapids' ascent crafted by generations of licensed bangkeros.",
      conservationNote: "Active living heritage craft.",
    },
    {
      id: "ART-LAG-07C",
      title: "100-Meter Volcanic Basalt Gorge & Hanging Liana Tapestry",
      filTitle: "Bangin ng Bumbungan at Talon ng Magdapio",
      artistOrMaker: "Natural Geomorphology of Mount Banahaw Watershed",
      period: "Pleistocene Volcanic Formation",
      medium: "Columnar basalt cliffs, travertine moss, and cascading river water",
      dimensions: "91 m (300 ft) main waterfall drop",
      bearing: 205,
      pitch: 20,
      zone: "Main Cataract Basin — Cavinti Gorge",
      motif: "natural",
      details:
        "A dramatic three-tiered amphitheater of sheer volcanic rock draped in wild orchids, ferns, and mist where the Magdapio (Pagsanjan) Falls plunges into a deep emerald pool.",
      conservationNote: "Protected within the Pagsanjan Gorge National Park.",
    },
    {
      id: "ART-LAG-07D",
      title: "Devil's Cave Acoustic Rock Chamber Behind the Water Veil",
      filTitle: "Kuweba sa Likod ng Bagsak ng Tubig",
      artistOrMaker: "Hydraulic Erosion Formation",
      period: "Natural Geological Feature",
      medium: "Water-sculpted volcanic cavern and bamboo raft",
      dimensions: "18 m cavern width behind the falls",
      bearing: 295,
      pitch: 0,
      zone: "Inner Cavern Behind the Main Curtain",
      motif: "natural",
      details:
        "Reached via bamboo raft pulled through the thundering curtain of water, this natural rock grotto frames a 360-degree view through the backlit cascade.",
      conservationNote: "Accessible via guided bamboo raft inspection.",
    },
  ],

  "mount-makiling": [
    {
      id: "ART-LAG-08A",
      title: "Mariang Makiling Folkloric Sculpture & Forest Shrine",
      filTitle: "Dambana at Imahen ni Mariang Makiling",
      artistOrMaker: "UPLB & Los Baños Sculptors",
      period: "20th-Century Tagalog Mythological Art",
      medium: "Cast stone and bronze patina amidst dipterocarp forest",
      dimensions: "2.4 m figure height",
      bearing: 30,
      pitch: 6,
      zone: "Makiling Botanic Gardens — North Trailhead",
      motif: "sculpture",
      details:
        "Honors the benevolent diwata (guardian spirit) of the mountain whose reclining silhouette is visible along the summit ridge and whose legend was immortalized by Dr. Jose Rizal.",
      conservationNote: "Maintained by the UPLB Makiling Center for Mountain Ecosystems.",
    },
    {
      id: "ART-LAG-08B",
      title: "Boiling Mud Pots & Sulfuric Fumarole Cauldron (Flat Rocks)",
      filTitle: "Kumukulong Putik at Bulkanikong Singaw",
      artistOrMaker: "Geothermal Activity of Mount Makiling",
      period: "Quaternary Dormant Stratovolcano",
      medium: "Kaolin thermal clay, sulfur crystals, and volcanic boulders",
      dimensions: "45 m geothermal clearing",
      bearing: 120,
      pitch: -6,
      zone: "Mudspring Sector — East Slope",
      motif: "natural",
      details:
        "Natural bubbling craters of mineral-rich gray clay and steam vents that demonstrate Mount Makiling's geothermal heart and inspired centuries of Tagalog folklore.",
      conservationNote: "Fenced viewing boardwalk for visitor safety.",
    },
    {
      id: "ART-LAG-08C",
      title: "Rafflesia & Medinilla Botanical Illustration Plates",
      filTitle: "Ilustrasyong Botanikal ng Rafflesia at Kapa-Kapa",
      artistOrMaker: "UPLB Herbarium Scientific Illustrators",
      period: "1910–Present",
      medium: "Archival watercolor and ink plates on botanical vellum",
      dimensions: "45 cm × 32 cm plates",
      bearing: 210,
      pitch: 0,
      zone: "Forestry Museum & Herbarium — South Wing",
      motif: "fresco",
      details:
        "Documents Mount Makiling's extraordinary endemism—holding more woody plant species than the entire continental United States—including the rare Rafflesia lagascae and Medinilla magnifica.",
      conservationNote: "Archived in the ASEAN Heritage Park Interpretive Center.",
    },
    {
      id: "ART-LAG-08D",
      title: "Peak 2 Mossy Cloud Forest Canopy & Epiphyte Arch",
      filTitle: "Gubat-Ulap sa Ikalawang Taluktok",
      artistOrMaker: "Montane Cloud Forest Ecosystem",
      period: "Ancient Old-Growth Forest (1,090 MASL)",
      medium: "Gnarled mossy trunks, pitcher plants (Nepenthes), and wild orchids",
      dimensions: "1,090 meters above sea level",
      bearing: 300,
      pitch: 18,
      zone: "Summit Ridge — West Look-Out",
      motif: "natural",
      details:
        "At the summit ridge, cool mists from Laguna de Bay nourish a living sculpture gallery of moss-draped trees, tree ferns, and aerial roots.",
      conservationNote: "Strictly regulated trail access under Republic Act No. 6967.",
    },
  ],

  "paete-church": [
    {
      id: "ART-LAG-09A",
      title: "'San Cristobal' Mural Painting on Wood Panels (1850)",
      filTitle: "higanteng Pintura ni San Cristobal sa Kahoy",
      artistOrMaker: "Jose Luciano Dans (Master Painter of Paete)",
      period: "c. 1850 · Spanish Colonial",
      medium: "Earth pigments and organic tempera on joined hardwood planks",
      dimensions: "4.8 m × 2.6 m",
      bearing: 15,
      pitch: 12,
      zone: "North Nave Wall (Left of Entrance)",
      motif: "fresco",
      details:
        "One of two monumental paintings of St. Christopher carrying the Christ Child across the river; this earlier wooden panel version features distinctly Tagalog facial features and lush Laguna river flora.",
      conservationNote: "Declared a National Cultural Treasure by the National Museum.",
    },
    {
      id: "ART-LAG-09B",
      title: "'Langit, Lupa at Impugerno' (Heaven, Earth, and Hell) Mural",
      filTitle: "Mural ng Langit, Lupa at Impiyerno",
      artistOrMaker: "Jose Luciano Dans",
      period: "c. 1850",
      medium: "Natural mineral pigments on canvas over wood support",
      dimensions: "5.2 m × 3.4 m",
      bearing: 105,
      pitch: 14,
      zone: "South Nave Wall",
      motif: "fresco",
      details:
        "A masterpiece of 19th-century Philippine liturgical painting arranged in three cosmic tiers: the Blessed Trinity and choirs of saints above, theSeven Sacraments and mortal life in the middle, and the jaws of Leviathan below.",
      conservationNote: "Conserved by the National Museum of the Philippines.",
    },
    {
      id: "ART-LAG-09C",
      title: "Gilded Baroque Retablo Mayor of Santiago Apostol",
      filTitle: "Retablo Mayor ni Santiago Apostol sa Kabisera",
      artistOrMaker: "Master Paete Woodcarvers (Ukit-Paete Guild)",
      period: "18th–19th Century",
      medium: "Polychrome and gold-leafed Molave and Narra with Solomonic columns",
      dimensions: "11.5 m height × 7.8 m width",
      bearing: 195,
      pitch: 10,
      zone: "Main Sanctuary (Presbiterio) — East Apse",
      motif: "retablo",
      details:
        "The high altar showcases Paete's world-renowned sculptural mastery (from 'paet', meaning chisel), crowned by an equestrian relief of St. James the Great (Santiago Matamoros).",
      conservationNote: "Active liturgical altar under parish and NCCA care.",
    },
    {
      id: "ART-LAG-09D",
      title: "1717 Carved Adobe Façade Relief of St. James on Horseback",
      filTitle: "Ukit sa Batong-Adobe ng Harapan ng Simbahan",
      artistOrMaker: "Franciscan Builders & Paete Stonecutters",
      period: "1717 (Rebuilt after 1880 Earthquake)",
      medium: "Chiseled volcanic tuff (adobe) bas-relief",
      dimensions: "14 m pediment width",
      bearing: 285,
      pitch: 16,
      zone: "Exterior West Pediment",
      motif: "arch",
      details:
        "Even the stone façade of Paete Church is treated like a woodblock carving, teeming with floral scrolls, cherubim, and a central stone relief of St. James in battle.",
      conservationNote: "Weathered volcanic stone monitored for seismic stability.",
    },
  ],

  "taal-basilica": [
    {
      id: "ART-BTG-10A",
      title: "24-Meter Doric & Corinthian Double-Tiered Stone Façade",
      filTitle: "Dambuhalang Harapan ng Basilika ng Taal",
      artistOrMaker: "Architect Luciano Oliver & Fray Marcos Anton, OSA",
      period: "1856–1865 · Neoclassical Revival",
      medium: "Dressed coral stone, volcanic adobe, and lime plaster",
      dimensions: "96 m church length × 45 m width (Largest in Asia)",
      bearing: 0,
      pitch: 18,
      zone: "West Plaza Façade",
      motif: "arch",
      details:
        "Rising above the heritage hill of Taal, the colossal façade pairs paired classical columns with arched portals and a panoramic bell tower overlooking Balayan Bay.",
      conservationNote: "Restored after the 2017 Batangas earthquakes and 2020 Taal eruption.",
    },
    {
      id: "ART-BTG-10B",
      title: "Silver-Clad High Altar Tabernacle & Retablo of St. Martin of Tours",
      filTitle: "Pilak na Tabernakulo at Retablo ni San Martin ng Tours",
      artistOrMaker: "Batangas & Manila Ecclesiastical Silversmiths",
      period: "Late 19th Century",
      medium: "Repoussé sterling silver, gilded hardwood, and marble",
      dimensions: "14.0 m sanctuary height",
      bearing: 90,
      pitch: 8,
      zone: "Main Chancel — East Sanctuary",
      motif: "retablo",
      details:
        "Standing beneath the towering transept dome, the grand Neoclassical retablo houses the image of St. Martin of Tours dividing his cloak for a beggar.",
      conservationNote: "Declared a National Historical Landmark under PD No. 375.",
    },
    {
      id: "ART-BTG-10C",
      title: "1603 miraculous Image of Our Lady of Caysasay (Venerated Shrine Icon)",
      filTitle: "Milagrosang Imahen ng Birhen ng Caysasay",
      artistOrMaker: "17th-Century Chinese-Filipino Artisan (Found by Juan Maningcad in 1603)",
      period: "1603 · Early Spanish Period",
      medium: "Carved hardwood (27 cm) in gold-and-jeweled canonical coronation regalia",
      dimensions: "27 cm statue within 2.2 m gilded baldacchino",
      bearing: 180,
      pitch: 4,
      zone: "North Transept Devotional Altar",
      motif: "sculpture",
      details:
        "Fished from the Pansipit River in 1603, this revered Marian image alternates residence between the Caysasay Sanctuary and Taal Basilica.",
      conservationNote: "Canonically crowned in 1954; guarded in a bulletproof reliquary.",
    },
    {
      id: "ART-BTG-10D",
      title: "Trompe-l'œil Coffered Barrel Vault Ceiling Frescoes",
      filTitle: "Pinturang Trompe-l'œil sa Kisame ng Nave",
      artistOrMaker: "19th-Century Escuela de Dibujo Disciples",
      period: "c. 1875",
      medium: "Distemper and oil illusionistic painting on galvanized iron & wood ceiling",
      dimensions: "88 m nave span",
      bearing: 270,
      pitch: 24,
      zone: "Central Nave Vault",
      motif: "fresco",
      details:
        "Three-dimensional optical illusion paintings along the ceiling vaults simulate deep stone coffers, rosettes, and evangelical medallions.",
      conservationNote: "Cleaned and stabilized during post-seismic restoration.",
    },
  ],

  "taal-heritage-town": [
    {
      id: "ART-BTG-11A",
      title: "1898 Original Hand-Sewn Philippine Flag Archive (Museo Apacible)",
      filTitle: "Mga Relikya ng Watawat nina Marcela Agoncillo",
      artistOrMaker: "Marcela Mariño Agoncillo, Lorenza Agoncillo & Delfina Herbosa",
      period: "1898 · Revolutionary Era",
      medium: "Fine silk, gold metallic embroidery thread, and archival textiles",
      dimensions: "2.1 m × 1.1 m display case",
      bearing: 20,
      pitch: 0,
      zone: "Marcela Agoncillo Historical Landmark — North Sala",
      motif: "manuscript",
      details:
        "Commemorates the ancestral bahay-na-bato of Marcela Agoncillo, 'Mother of the Philippine Flag,' displaying period sewing implements, family portraits, and flag textile studies.",
      conservationNote: "Managed by the National Historical Commission of the Philippines.",
    },
    {
      id: "ART-BTG-11B",
      title: "Piña-Jusi Callado Barong Tagalog & Tamburin Filigree Jewelry",
      filTitle: "Burda ng Barong sa Piña at Gintong Tamburin",
      artistOrMaker: "Taal Master Embroiderers & Goldsmiths",
      period: "19th Century to Present",
      medium: "Hand-scraped pineapple leaf fibers (piña) and 18k gold filigree beads",
      dimensions: "Full ceremonial ensemble",
      bearing: 110,
      pitch: -2,
      zone: "Villa Tortuga & Galleria Taal — East Room",
      motif: "vessel",
      details:
        "Showcases Taal's delicate 'calado' pulled-thread embroidery alongside antique Batangas gold rosaries (tamburin) and butterfly-sleeved terno bodices.",
      conservationNote: "Exhibited in acid-free textile mounts.",
    },
    {
      id: "ART-BTG-11C",
      title: "19th-Century Albumen Prints & Daguerreotype Camera Collection",
      filTitle: "Koleksyon ng Antigong Kamera at Larawang Sepia",
      artistOrMaker: "Manny Inumerable Collection (Galleria Taal)",
      period: "1850s–1940s",
      medium: "Mahogany bellows cameras, brass lenses, and silver-gelatin prints",
      dimensions: "Over 100 antique cameras and historical prints",
      bearing: 200,
      pitch: 2,
      zone: "Galleria Taal — South Photography Wing",
      motif: "manuscript",
      details:
        "One of Southeast Asia's premier vintage camera museums housed in a 19th-century ancestral home, preserving original photographs of the Philippine Revolution and colonial Manila.",
      conservationNote: "Dehumidified optical cabinets.",
    },
    {
      id: "ART-BTG-11D",
      title: "Art Deco & Victorian Calado Facades of Calle Marcela Agoncillo",
      filTitle: "Hilera ng mga Bahay-na-Bato sa Calle Agoncillo",
      artistOrMaker: "Don Leon Apacible & Goco Family Builders",
      period: "1870–1930",
      medium: "Coral stone ground floors, Narra upper stories, and Art Deco stained glass",
      dimensions: "400-meter streetscape",
      bearing: 290,
      pitch: 10,
      zone: "Poblacion Heritage Street — West Vista",
      motif: "arch",
      details:
        "A living architectural corridor where Spanish-colonial ventanillas meet 1920s Art Deco geometric stained-glass transoms and wrought-iron balconies.",
      conservationNote: "Protected under the Taal Heritage Zone Municipal Ordinance.",
    },
  ],

  "mabini-shrine-tanauan": [
    {
      id: "ART-BTG-12A",
      title: "Bronze Monument of Apolinario Mabini ('The Sublime Paralytic')",
      filTitle: "Bantayog na Tanso ni Apolinario Mabini",
      artistOrMaker: "National Historical Commission Sculptors",
      period: "Mid-20th Century",
      medium: "Cast bronze figure on marble and granite plinth",
      dimensions: "3.2 m monument height",
      bearing: 15,
      pitch: 8,
      zone: "Central Memorial Plaza — North Axis",
      motif: "sculpture",
      details:
        "Portrays Apolinario Mabini seated in contemplative resolve as Prime Minister and Minister of Foreign Affairs of the First Philippine Republic.",
      conservationNote: "Surrounding the marble crypt containing Mabini's mortal remains.",
    },
    {
      id: "ART-BTG-12B",
      title: "'El Verdadero Decálogo' (The True Decalogue) Illuminated Manuscript",
      filTitle: "Ang Tunay na Sampung Utos ni Mabini",
      artistOrMaker: "Apolinario Mabini",
      period: "June 1898",
      medium: "Holograph manuscript facsimile, brass spectacles, and fountain pen",
      dimensions: "40 cm × 28 cm folio",
      bearing: 105,
      pitch: -4,
      zone: "Gallery II (Brains of the Revolution) — East Vitrine",
      motif: "manuscript",
      details:
        "Displays Mabini's philosophical blueprint for civic virtue, constitutional democracy, and national sovereignty written during the birth of the Republic.",
      conservationNote: "Housed in the modernized NHCP holographic museum.",
    },
    {
      id: "ART-BTG-12C",
      title: "Original Rattan Invalid Chair & Bamboo Hammock (Duyan)",
      filTitle: "Silyang Yantok at Duyan ni Mabini",
      artistOrMaker: "Batangas Cane Weavers",
      period: "c. 1898–1901",
      medium: "Bent rattan frame, woven solihiya seat, and hardwood carrying poles",
      dimensions: "1.1 m × 0.7 m × 1.05 m",
      bearing: 195,
      pitch: -2,
      zone: "Personal Relics Rotunda — South Display",
      motif: "vessel",
      details:
        "Artefactual testimony to how revolutionary soldiers carried the paralyzed statesman across mountains from Laguna to Cavite and northern Luzon.",
      conservationNote: "Preserved in a climate-controlled glass enclosure.",
    },
    {
      id: "ART-BTG-12D",
      title: "Reconstructed 1864 Nipa & Bamboo Birthplace Bahay-Kubo",
      filTitle: "Bahay-Kubo kung saan Isinilang si Mabini",
      artistOrMaker: "Tanauan Traditional Vernacular Builders",
      period: "1864 Vernacular Reconstruction",
      medium: "Cogon thatch roof, split-bamboo (sawali) walls, and bamboo slat floors",
      dimensions: "5.5 m × 4.5 m",
      bearing: 285,
      pitch: 4,
      zone: "Shrine Grounds — West Garden",
      motif: "arch",
      details:
        "Stands on the humble Talaga homestead where Dionisia Maranan gave birth to Apolinario Mabini on July 23, 1864.",
      conservationNote: "Thatch and bamboo periodically renewed by NHCP artisans.",
    },
  ],

  "taal-volcano": [
    {
      id: "ART-BTG-13A",
      title: "Volcano Island (Pulo) & Main Crater Caldera Panorama",
      filTitle: "Tanawin ng Bulkang Taal at Lawa ng Bombon",
      artistOrMaker: "Prehistoric Caldera Collapse & Phreatomagmatic Activity",
      period: "140,000 BCE to Present (2020 Eruption Morphology)",
      medium: "Volcanic tuff cone, crater lake waters, and ash-blanketed ridges",
      dimensions: "25 km × 30 km Taal Lake caldera",
      bearing: 0,
      pitch: -4,
      zone: "Central Lake Horizon — North-East Viewpoint",
      motif: "natural",
      details:
        "Famous worldwide for its 'island within a lake on an island within a lake on an island' geography, framed by the steep escarpment of Tagaytay Ridge.",
      conservationNote: "Monitored 24/7 by PHIVOLCS seismic and gas-emission stations.",
    },
    {
      id: "ART-BTG-13B",
      title: "Binintiang Malaki ('Big Leg') Pyroclastic Cone",
      filTitle: "Kono ng Binintiang Malaki (1707–1715)",
      artistOrMaker: "1707 & 1715 Eruptive Vents",
      period: "Early 18th Century Geological Formation",
      medium: "Stratified scoria, volcanic bombs, and basaltic tuff",
      dimensions: "263 meters above lake level",
      bearing: 90,
      pitch: 4,
      zone: "Northwest Tip of Volcano Island",
      motif: "natural",
      details:
        "The iconic symmetrical volcanic cone visible from Tagaytay that formed during violent 18th-century eruptions and appears on Philippine banknotes and landscape paintings.",
      conservationNote: "Permanent Danger Zone (PDZ) geological feature.",
    },
    {
      id: "ART-BTG-13C",
      title: "1754 Submerged Ruins of Old Taal, Lipa, Tanauan & Sala",
      filTitle: "Lumubog na mga Lumang Bayan ng 1754",
      artistOrMaker: "18th-Century Augustinian Builders (Submerged Archaeological Site)",
      period: "1754 Great Plinian Eruption",
      medium: "Submerged coral-stone church walls beneath Lake Bombon",
      dimensions: "Underwater archaeological sector",
      bearing: 180,
      pitch: -12,
      zone: "Lakeshore Shallows — South-East Basin",
      motif: "arch",
      details:
        "Following the 200-day eruption of 1754, the original lakeside towns of Taal, Tanauan, Sala, and Lipa were buried in ash and submerged, prompting their relocation to higher ground.",
      conservationNote: "Surveyed by National Museum underwater archaeologists.",
    },
    {
      id: "ART-BTG-13D",
      title: "Tawilis (Sardinella tawilis) & Lake Bombon Endemic Ecology",
      filTitle: "Sardinella Tawilis ng Lawa ng Taal",
      artistOrMaker: "Freshwater Evolution in Isolated Caldera Lake",
      period: "Post-Caldera Isolation",
      medium: "Living endemic freshwater sardine and traditional paraw outrigger boats",
      dimensions: "Lake-wide ecological sanctuary",
      bearing: 270,
      pitch: -8,
      zone: "Talisay & Laurel Lakeshore — West Sector",
      motif: "vessel",
      details:
        "As the old saltwater bay was sealed off from Balayan Bay by volcanic eruptions, marine sardines adapted into the world's only freshwater sardine species, Sardinella tawilis.",
      conservationNote: "Protected under the Taal Volcano Protected Landscape (TVPL).",
    },
  ],

  "angono-petroglyphs": [
    {
      id: "ART-RIZ-14A",
      title: "127 Engraved Neolithic Anthropomorphic & Zoomorphic Figures",
      filTitle: "127 Inukit na Pigura ng Tao at Hayop sa Bato",
      artistOrMaker: "Late Neolithic Indigenous Artisans of Luzon",
      period: "c. 2000 BCE · Late Neolithic Period (Over 3,000 Years Old)",
      medium: "Incised grooves on a volcanic tuff (ignimbrite) rock shelter wall",
      dimensions: "63 m wide × 8 m deep × 5 m high rock shelter",
      bearing: 15,
      pitch: 4,
      zone: "Central Rock Shelter Wall — North-East Face",
      motif: "petroglyph",
      details:
        "Discovered in 1965 by National Artist Carlos 'Botong' Francisco, these 127 stick-like human, frog, and lizard figures are the oldest known work of prehistoric rock art in the Philippines.",
      conservationNote:
        "Presidential Decree No. 260 National Cultural Treasure; UNESCO Tentative List.",
    },
    {
      id: "ART-RIZ-14B",
      title: "Central 'Healer & Fertility' Vulva/Frog Symbolic Cluster",
      filTitle: "Sentral na Ukit ng Ritwal sa Pagpapagaling",
      artistOrMaker: "Prehistoric Shamanic Rock Carvers",
      period: "c. 2000 BCE",
      medium: "Deeply pecked and abraded stone incisions (up to 10 cm deep)",
      dimensions: "2.4 m × 1.5 m central panel",
      bearing: 105,
      pitch: 2,
      zone: "Sanctuary Focal Alcove — Center Wall",
      motif: "petroglyph",
      details:
        "Archaeologists interpret the raised-arm figures with flexed knees as sympathetic healing rituals performed to transfer sickness from a child to the living rock wall.",
      conservationNote: "Monitored by the National Museum against lichen and erosion.",
    },
    {
      id: "ART-RIZ-14C",
      title: "Neolithic Polished Stone Adzes, Obsidian Flakes & Earthenware",
      filTitle: "Mga Kasangkapang Bato at Palayok sa Yungib",
      artistOrMaker: "Prehistoric Inhabitants of the Angono-Binangonan Ridge",
      period: "c. 2000–1000 BCE",
      medium: "Chert flakes, basalt adze blades, obsidian, and red-slipped pottery shards",
      dimensions: "4 cm to 14 cm stone tools",
      bearing: 195,
      pitch: -8,
      zone: "National Museum Site Pavilion — South Vitrine",
      motif: "vessel",
      details:
        "Excavated from the floor of the rock shelter during the 1965 National Museum expedition led by Alfredo Evangelista, proving how the engravings were pecked using harder stone tools.",
      conservationNote: "Exhibited in the on-site National Museum mini-gallery.",
    },
    {
      id: "ART-RIZ-14D",
      title: "Carlos 'Botong' Francisco 1965 Discovery Sketch & Bronze Marker",
      filTitle: "Guhit ng Pagtuklas ni Botong Francisco (1965)",
      artistOrMaker: "National Artist Carlos 'Botong' Francisco",
      period: "March 1965",
      medium: "Field sketchbook facsimile and bronze commemorative plaque",
      dimensions: "1.2 m × 0.9 m interpretive pedestal",
      bearing: 285,
      pitch: 0,
      zone: "Viewing Deck — West Observation Rail",
      motif: "manuscript",
      details:
        "Documents the Boy Scouts camping trip during which Angono's famed muralist noticed the ancient carvings hidden beneath vines and immediately alerted the National Museum.",
      conservationNote: "Positioned along the elevated wooden viewing deck.",
    },
  ],

  "pinto-art-museum": [
    {
      id: "ART-RIZ-15A",
      title: "'Karnabal' Social Realist Mural & Salingpusa Collective Works",
      filTitle: "Malaking Mural ng Salingpusa sa Unang Galeriya",
      artistOrMaker: "Salingpusa Art Collective (Elmer Borlongan, Mark Justiniani, et al.)",
      period: "1992–Present · Philippine Contemporary Art",
      medium: "Oil and acrylic on multipanel canvas",
      dimensions: "7.2 m × 3.0 m monumental canvas",
      bearing: 20,
      pitch: 6,
      zone: "Gallery 1 — Main Mediterranean Hall",
      motif: "fresco",
      details:
        "A seminal collective painting created in Antipolo by the young artists of Salingpusa, blending social commentary, Philippine carnival imagery, and expressive figurative painting.",
      conservationNote: "Housed in Dr. Joven Cuanang's Silangan Gardens collection.",
    },
    {
      id: "ART-RIZ-15B",
      title: "Wire & Found-Object Kinetic Sculptures in the Open Courtyard",
      filTitle: "Mga Iskulturang Bakal sa Bukas na Hardin",
      artistOrMaker: "Contemporary Filipino Sculptors",
      period: "2000s–2020s",
      medium: "Welded steel, brass mesh, molave driftwood, and volcanic stone",
      dimensions: "2.5 m to 4.0 m height",
      bearing: 110,
      pitch: 4,
      zone: "Upper Sculpture Terrace — East Garden",
      motif: "sculpture",
      details:
        "Framed against whitewashed stucco arches and Antipolo's skyline view of Manila Bay, these open-air sculptures create a dialogue between tropical botany and contemporary form.",
      conservationNote: "Treated with outdoor UV and weather-resistant sealants.",
    },
    {
      id: "ART-RIZ-15C",
      title: "Gallery 6 Mixed-Media Installation & Bamboo Forest Pavilion",
      filTitle: "Instalasyong Kontemporaryo at Pabilyon ng Kawayan",
      artistOrMaker: "Various Contemporary Filipino Visual Artists",
      period: "2010–Present",
      medium: "Mixed media, neon, textile, and indigenous natural fibers",
      dimensions: "Full pavilion installation",
      bearing: 200,
      pitch: 2,
      zone: "Gallery 6 — South Hilltop Wing",
      motif: "arch",
      details:
        "Follows Pinto's signature open-air museum philosophy ('pinto' meaning door), where breezeways and sun-drenched courtyards dissolve the boundary between gallery and garden.",
      conservationNote: "Rotating contemporary exhibition space.",
    },
    {
      id: "ART-RIZ-15D",
      title: "Museum of Indigenous Art: Bulul Granary Gods & Mindanao Okir",
      filTitle: "Tanghalan ng Katutubong Sining: Bulul at Okir",
      artistOrMaker: "Ifugao, Kalinga, and Maranao Master Artisans",
      period: "19th–20th Century Ethnographic Masterworks",
      medium: "Carved Narra wood with ritual patina, brass kulintang, and handwoven ikat",
      dimensions: "60 cm to 180 cm sculptures",
      bearing: 290,
      pitch: 0,
      zone: "Indigenous Art Wing — West Pavilion",
      motif: "sculpture",
      details:
        "Connects contemporary Philippine art to its pre-colonial roots through Cordillera rice deities (bulul), Maranao panolong beam carvings, and T'boli t'nalak textiles.",
      conservationNote: "Curated in climate-protected ethnographic halls.",
    },
  ],

  "antipolo-cathedral": [
    {
      id: "ART-RIZ-16A",
      title: "1626 Carved Hardwood Image of Our Lady of Peace and Good Voyage",
      filTitle: "Milagrosang Imahen ng Birhen ng Kapayapaan at Mabuting Paglalakbay",
      artistOrMaker: "17th-Century Mexican Sculptor (Brought by Gov.-Gen. Juan Niño de Tabora)",
      period: "1626 · Acapulco-Manila Galleon Era",
      medium: "Carved dark Mexican hardwood (estofado), solid silver staff, and jeweled mantle",
      dimensions: "1.4 m statue height inside elevated glass retablo",
      bearing: 0,
      pitch: 12,
      zone: "Main Sanctuary Altar — Center Dome",
      motif: "sculpture",
      details:
        "Venerated fornearly four centuries after crossing the Pacific Ocean eight times aboard the Manila-Acapulco Galleons without a single shipwreck; canonically crowned in 1926.",
      conservationNote:
        "Elevated in a secure, climate-controlled glass camber above the high altar.",
    },
    {
      id: "ART-RIZ-16B",
      title: "Gilded Retablo Mayor & Galleon Voyage Bronze Reliefs",
      filTitle: "Ginintuang Retablo at Reliyebe ng Paglalayag ng Galyon",
      artistOrMaker: "Architect Jose L. de Ocampo & Liturgical Sculptors",
      period: "1954 Post-War Reconstruction / 2023 International Shrine Elevation",
      medium: "Gilded bronze, Italian marble, and carved wood",
      dimensions: "12.0 m sanctuary backdrop",
      bearing: 90,
      pitch: 6,
      zone: "Chancel Apse — East Sanctuary",
      motif: "retablo",
      details:
        "Depicts the historical crossings of the galleon El Almirante and the construction of the original Antipolo hilltop church by Tagalog converts.",
      conservationNote: "Vatican-decreed First International Shrine in Southeast Asia (2023).",
    },
    {
      id: "ART-RIZ-16C",
      title: "Circular Stained-Glass Clerestory Windows of the Marian Apparitions",
      filTitle: "Makukulay na Salaming Bintana ng Katedral",
      artistOrMaker: "Philippine Liturgical Stained-Glass Studio",
      period: "Late 20th Century",
      medium: "Mouth-blown leaded stained glass set in radial concrete ribs",
      dimensions: "3.2 m diameter rose panels",
      bearing: 180,
      pitch: 22,
      zone: "Circular Rotunda Dome — Upper Ring",
      motif: "fresco",
      details:
        "Floods the circular cathedral floor with jewel-toned light illustrating the Maytime 'Ahunan' pilgrimage and the miracles of the Virgin of Antipolo.",
      conservationNote: "Protected by exterior storm glazing.",
    },
    {
      id: "ART-RIZ-16D",
      title: "Pilgrim Blessing Court & Carillon Bell Tower",
      filTitle: "Patyo ng Pagbabasbas ng mga Manlalakbay",
      artistOrMaker: "Diocese of Antipolo Liturgical Architects",
      period: "1954–2023",
      medium: "Travertine stone colonnade and cast bronze bells",
      dimensions: "28 m bell tower height",
      bearing: 270,
      pitch: 10,
      zone: "West Forecourt & Blessing Plaza",
      motif: "arch",
      details:
        "The historic gathering plaza where millions of pilgrims and motorists receive blessings for safe travel, continuing the 17th-century galleon tradition.",
      conservationNote: "Active pilgrimage plaza.",
    },
  ],

  "natalio-enriquez-house": [
    {
      id: "ART-QUE-17A",
      title: "1931 Art Nouveau & Beaux-Arts Façade by Andres Luna de San Pedro",
      filTitle: "Disenyong Beaux-Arts ni Andres Luna de San Pedro",
      artistOrMaker: "Architect Andres Luna de San Pedro (Son of Painter Juan Luna)",
      period: "1931 · American Commonwealth Era",
      medium: "Reinforced concrete, ornamental cast-stone garlands, and wrought iron",
      dimensions: "22 m street frontage",
      bearing: 15,
      pitch: 14,
      zone: "Main Exterior Façade — Sariaya Poblacion",
      motif: "arch",
      details:
        "Built for coconut planter and Governor Natalio Enriquez, this mansion exemplifies the golden age of Sariaya's copra wealth, designed by the Paris-trained son of Juan Luna.",
      conservationNote: "Declared an NHCP Heritage House in 2008.",
    },
    {
      id: "ART-QUE-17B",
      title: "Machuca Encaustic Cement Tile Carpets & Grand Staircase",
      filTitle: " sahig na Baldosa Machuca at Hagdanang Narra",
      artistOrMaker: "Machuca Tile Factory (Manila) & Quezon Master Joiners",
      period: "1931",
      medium: "Hand-poured hydraulic pigment tiles and turned red Narra balusters",
      dimensions: "8.5 m × 6.0 m reception hall",
      bearing: 105,
      pitch: -8,
      zone: "Zaguan & Caida — East Reception Hall",
      motif: "fresco",
      details:
        "Original geometric Mediterranean-style cement tiles form colorful 'tile rugs' bordered by sweeping hardwood stairs where President Manuel L. Quezon once ascended.",
      conservationNote: "Original 1931 Machuca tiles preserved in situ.",
    },
    {
      id: "ART-QUE-17C",
      title: "Painted Canvas & Wood Ceiling Medallions of the Grand Ballroom",
      filTitle: "Pinintang Kisame ng bulwagang Sayawan",
      artistOrMaker: "Manila & Tayabas Decorative Painters",
      period: "c. 1931–1938",
      medium: "Oil on canvas marouflaged to wood ceiling panels with gilded moldings",
      dimensions: "11.0 m × 6.5 m salon",
      bearing: 195,
      pitch: 20,
      zone: "Second-Floor Ballroom — South Wing",
      motif: "fresco",
      details:
        "Adorned with pastel floral garlands, musical motifs, and crystal chandeliers crafted for grand Tayabas balls before World War II.",
      conservationNote: "Carefully conserved by the Enriquez-Rodriguez family.",
    },
    {
      id: "ART-QUE-17D",
      title: "Stained-Glass Fanlights & Pierced Floral Calado Partitions",
      filTitle: "Bintanang Stained-Glass at Calado na Bulaklakin",
      artistOrMaker: "Krause / Manila Glass Artisans & Sariaya Carvers",
      period: "1931",
      medium: "Colored Belgian glass, lead cames, and hand-fretted Tindalo wood",
      dimensions: "3.2 m interior archway spans",
      bearing: 285,
      pitch: 8,
      zone: "Comedor & West Veranda",
      motif: "retablo",
      details:
        "Filters the intense tropical sunlight of Mount Banahaw's foothills into amber, emerald, and ruby hues across the dining hall.",
      conservationNote: "Intact original 1931 glasswork.",
    },
  ],

  "villa-escudero": [
    {
      id: "ART-QUE-18A",
      title: "22-Karat Gold-Leaf & Silver Processional Carrozas",
      filTitle: "Mga Karosa ng Mahal na Araw na Pilak at Ginto",
      artistOrMaker: "Manila, Laguna & Pampanga Ecclesiastical Silversmiths",
      period: "18th–19th Century",
      medium: "Repoussé sterling silver, gold leaf over Molave, and ivory-faced santos",
      dimensions: "Up to 4.5 m length × 3.2 m height",
      bearing: 25,
      pitch: 4,
      zone: "Escudero Private Museum — Main Nave Hall",
      motif: "retablo",
      details:
        "Housed inside the iconic pink replica church museum, these ornate Holy Week processional carriages feature hand-hammered silver panels and antique candle globes (guardabrisas).",
      conservationNote: "Maintained by the Escudero Foundation curatorial staff.",
    },
    {
      id: "ART-QUE-18B",
      title: "Pre-Colonial Celadon, Martaban Jars &Ming Trade Porcelain",
      filTitle: "Koleksyon ng Sinaunang Banga at Porselanang Tsino",
      artistOrMaker: "Song, Yuan, and Ming Dynasty Kilns / Philippine Archaeological Finds",
      period: "12th–17th Century",
      medium: "High-fired stoneware, celadon glaze, and cobalt blue-and-white porcelain",
      dimensions: "Over 200 ceramic vessels",
      bearing: 115,
      pitch: -2,
      zone: "Archaeological Mezzanine — East Gallery",
      motif: "vessel",
      details:
        "Collected over a century by Don Arsenio and Doña Rosario Adap Escudero, documenting Southern Luzon's extensive maritime trade with China and mainland Southeast Asia.",
      conservationNote: "Cataloged with the National Museum of the Philippines.",
    },
    {
      id: "ART-QUE-18C",
      title: "1929 Labasin Hydroelectric Dam & Spillway Masonry",
      filTitle: "Prinsipyo ng Inhenyeriya ng Labasin Dam (1929)",
      artistOrMaker: "Don Arsenio Escudero (Agricultural & Industrial Engineer)",
      period: "1929 · Early Philippine Industrial Heritage",
      medium: "Gravity-arch stone and concrete dam with natural spring spillover",
      dimensions: "60 m spillway width",
      bearing: 205,
      pitch: -6,
      zone: "Labasin Lake & Waterfall — South Sector",
      motif: "arch",
      details:
        "The Philippines' first working private hydroelectric plant, built in 1929 to power the estate's desiccated coconut factory and today the site of the famed waterfall dining tables.",
      conservationNote: "Operating historic waterworks landmark.",
    },
    {
      id: "ART-QUE-18D",
      title: "Philippine Ethnographic Attire, Kris Blades & Colonial Altar Pieces",
      filTitle: "Tanghalan ng Katutubong Kasuotan at Sandata",
      artistOrMaker: "Indigenous & Colonial Artisans Across the Archipelago",
      period: "18th–20th Century",
      medium: "Damascened steel blades, mother-of-pearl inlay, and handwoven textiles",
      dimensions: "Multi-case gallery wing",
      bearing: 295,
      pitch: 2,
      zone: "Ethnographic & Historical Wing — West Gallery",
      motif: "sculpture",
      details:
        "Brings together Moro kris and kampilan swords with ivory pommels, Cordillera shields, and gilded retablos rescued from war-damaged churches.",
      conservationNote: "Climate-monitored private museum wing.",
    },
  ],

  "mount-banahaw": [
    {
      id: "ART-QUE-19A",
      title: "'Santong Jacob' & 'Sta. Lucia' Sacred Spring Puwesto Shrines",
      filTitle: "Banal na Puwesto ng Sta. Lucia at Santong Jacob",
      artistOrMaker: "Ciudad Mistica de Dios & Tagalog Pilgrim Communities",
      period: "1841 (Hermano Pule Era) to Present",
      medium: "Volcanic river boulders, natural cold springs, and folk devotional altars",
      dimensions: "Twin 15-meter waterfalls and rock pools",
      bearing: 10,
      pitch: -4,
      zone: "Lower Footpath — Barangay Sta. Lucia (Dolores)",
      motif: "natural",
      details:
        "The entry 'puwesto' (sacred station) where pilgrims bathe in icy volcanic spring water believed to cleanse the spirit before ascending the 'New Jerusalem' of Mount Banahaw.",
      conservationNote: "Protected spiritual and ecological zone.",
    },
    {
      id: "ART-QUE-19B",
      title: "Kuweba ng Diyos Ama (Cave of God the Father) & Votive Sanctuary",
      filTitle: "Kuweba ng Diyos Ama at Dambana ng Kandila",
      artistOrMaker: "Natural Volcanic Cavern & Folk Religious Caretakers",
      period: "19th–21st Century Living Tradition",
      medium: "Andesite volcanic cavern, stalagmites, and beeswax votive altars",
      dimensions: "18 m cavern depth",
      bearing: 100,
      pitch: 0,
      zone: "Mid-Slope Sanctuary — East Ridge",
      motif: "petroglyph",
      details:
        "A natural rock cathedral where pilgrims chant Tagalog prayers (dalit) and light candles beneath stone formations revered as sacred footprints and thrones.",
      conservationNote: "Regulated under PAMB conservation guidelines.",
    },
    {
      id: "ART-QUE-19C",
      title: "Hermano Pule (Apolinario de la Cruz) 1841 Cofradía Memorial",
      filTitle: "Alaala ni Hermano Pule at ng Cofradía de San José",
      artistOrMaker: "Quezon Historical Council & NHCP",
      period: "1841 Historical Commemoration",
      medium: "Carved stone monument and anting-anting folk iconography",
      dimensions: "2.8 m memorial stele",
      bearing: 190,
      pitch: 6,
      zone: "Tayabas–Dolores Heritage Trail — South Sector",
      motif: "sculpture",
      details:
        "Honors Apolinario de la Cruz (Hermano Pule), who founded the indigenous Cofradía de San José on the slopes of Mount Banahaw in pursuit of religious freedom and equality.",
      conservationNote: "Recognized national historical commemoration site.",
    },
    {
      id: "ART-QUE-19D",
      title: "Durungawan Summit Rim (2,170 MASL) & Crater Caldera Vista",
      filTitle: "Taluktok ng Durungawan (2,170 Metro)",
      artistOrMaker: "Mount Banahaw Stratovolcano Complex",
      period: "Holocene Volcanic Caldera",
      medium: "Montane cloud forest, dwarf bamboo, and 600-meter-deep breached crater",
      dimensions: "2,170 meters above sea level (Highest peak in CALABARZON)",
      bearing: 280,
      pitch: 22,
      zone: "Upper Summit Caldera Rim — West Overlook",
      motif: "natural",
      details:
        "The highest point in Region IV-A, looking down into the dramatic breached crater canyon and across Tayabas Bay, Laguna de Bay, and Mount San Cristobal.",
      conservationNote: "Protected under Republic Act No. 9847 (2009).",
    },
  ],
};

/**
 * Returns the 4 360° art pieces / architectural relics for any destination.
 * If the destination is one of the 19 seeded sites, returns its curated catalog;
 * if it is a newly added custom destination, generates 4 tailored 360° heritage pieces.
 */
export function getArtPieces360(
  destination: Pick<
    Destination,
    "id" | "slug" | "name" | "province" | "category" | "address" | "description"
  >,
): ArtPiece360[] {
  const bySlug = destination.slug ? DESTINATION_ART_360[destination.slug] : undefined;
  if (bySlug && bySlug.length > 0) return bySlug;

  const cleanId = String(destination.id).replace(/^seed-/, "");
  const byId = DESTINATION_ART_360[cleanId];
  if (byId && byId.length > 0) return byId;

  const cat = getCategoryMeta(destination.category);
  const provCode = PROVINCE_CODES[destination.province] ?? "IVA";
  const seed = seedFromId(destination.slug || destination.id);
  const prefix = `ART-${provCode}-${String(seed).padStart(2, "0")}`;

  return [
    {
      id: `${prefix}A`,
      title: `Primary Architectural Façade & Marker of ${destination.name}`,
      filTitle: `Pangunahing Harapan at Pananda ng ${destination.name}`,
      artistOrMaker: `Regional Artisans of ${destination.province}`,
      period: "Historical Heritage Period",
      medium: "Traditional stone, hardwood, and cast bronze marker",
      dimensions: "Monumental site entrance",
      bearing: 20,
      pitch: 10,
      zone: `North Entrance Sector — ${destination.address}`,
      motif: "arch",
      details:
        destination.description ||
        `The primary architectural façade and official heritage marker welcoming visitors to ${destination.name} in ${destination.province}.`,
      conservationNote: `Cataloged in the Sulyap Region IV-A (${destination.province}) Registry.`,
    },
    {
      id: `${prefix}B`,
      title: `${cat.fil} Central Sanctuary & Craftsmanship Piece`,
      filTitle: `Sentral na Likhang-Sining (${cat.fil})`,
      artistOrMaker: `Master Craftsmen of ${destination.province}`,
      period: "Regional Heritage Collection",
      medium: "Hand-carved Philippine hardwood and indigenous materials",
      dimensions: "3.2 m × 2.1 m focal installation",
      bearing: 110,
      pitch: 4,
      zone: "East Gallery / Central Sanctuary",
      motif: cat.key === "Church" ? "retablo" : cat.key === "Nature" ? "natural" : "sculpture",
      details: `Represents the core ${destination.category.toLowerCase()} artistry preserved at ${destination.name}, reflecting the local material culture of ${destination.address}, ${destination.province}.`,
      conservationNote: "Maintained for public educational inspection.",
    },
    {
      id: `${prefix}C`,
      title: `Historical Chronicle & Visual Mural of ${destination.address}`,
      filTitle: `Kasaysayang Biswal ng ${destination.address}`,
      artistOrMaker: `${destination.province} Cultural Chroniclers`,
      period: "Archival Series",
      medium: "Pigment on panel and historical documentation",
      dimensions: "2.8 m × 1.6 m",
      bearing: 200,
      pitch: 6,
      zone: "South Interpretive Hall",
      motif: "fresco",
      details: `Illustrates the historical evolution of ${destination.name} and its role in the cultural identity of ${destination.province} within CALABARZON (Region IV-A).`,
      conservationNote: "Protected under local cultural mapping guidelines.",
    },
    {
      id: `${prefix}D`,
      title: `Venerated Relic & Archival Artifact Vitrine`,
      filTitle: `antigong Relikya at Kasulatan`,
      artistOrMaker: `${destination.province} Heritage Custodians`,
      period: "Period Artifact Collection",
      medium: "Mixed archival media, metal, and ceramic",
      dimensions: "1.5 m museum vitrine",
      bearing: 290,
      pitch: -4,
      zone: "West Archival Alcove",
      motif: "manuscript",
      details: `Preserves original documents, vessels, and cultural implements associated with the community history of ${destination.name}.`,
      conservationNote: "Displayed in a protective museum vitrine.",
    },
  ];
}

export const ARTWORK_HD_PLATES = {
  kawit: "/panoramas/artworks/kawit-proclamation-hd.webp",
  taal: "/panoramas/artworks/taal-volcano-sunrise-hd.webp",
  paete: "/panoramas/artworks/paete-woodcarvers-hd.webp",
  pahiyas: "/panoramas/artworks/pahiyas-banahaw-hd.webp",
  rizal: "/panoramas/artworks/rizal-calamba-study-hd.webp",
  gold: "/panoramas/artworks/batangas-gold-pina-hd.webp",
  monument: "/panoramas/artworks/inang-bayan-monument-hd.webp",
  ancestral: "/panoramas/artworks/bahay-kubo-ancestral-hd.webp",
  retablo: "/panoramas/artworks/baroque-church-retablo-hd.webp",
  modernist: "/panoramas/artworks/angono-modernist-folk-hd.webp",
} as const;

/**
 * Selects a razor-sharp 1,600×1,066 Ultra-HD close-up museum plate for foreground inspection
 * when an art piece hotspot is clicked inside the 360° viewer.
 */
export function getArtPieceHdImage(
  piece: Pick<ArtPiece360, "id" | "motif" | "title">,
  province?: string,
  slug?: string,
): string {
  if (piece.motif === "retablo") return ARTWORK_HD_PLATES.retablo;
  if (piece.motif === "natural") return ARTWORK_HD_PLATES.taal;
  if (piece.motif === "manuscript") {
    return province === "Cavite" ? ARTWORK_HD_PLATES.kawit : ARTWORK_HD_PLATES.rizal;
  }
  if (piece.motif === "vessel") return ARTWORK_HD_PLATES.gold;
  if (piece.motif === "petroglyph") return ARTWORK_HD_PLATES.modernist;

  if (slug?.includes("aguinaldo") || (province === "Cavite" && piece.motif === "fresco")) {
    return ARTWORK_HD_PLATES.kawit;
  }
  if (slug?.includes("rizal-shrine")) {
    return piece.motif === "sculpture" ? ARTWORK_HD_PLATES.monument : ARTWORK_HD_PLATES.rizal;
  }
  if (slug?.includes("paete")) {
    return piece.motif === "arch" ? ARTWORK_HD_PLATES.retablo : ARTWORK_HD_PLATES.paete;
  }
  if (province === "Quezon") {
    return piece.motif === "arch" ? ARTWORK_HD_PLATES.retablo : ARTWORK_HD_PLATES.pahiyas;
  }
  if (province === "Rizal") {
    return piece.motif === "arch" ? ARTWORK_HD_PLATES.retablo : ARTWORK_HD_PLATES.modernist;
  }
  if (piece.motif === "sculpture") {
    return province === "Laguna" ? ARTWORK_HD_PLATES.paete : ARTWORK_HD_PLATES.monument;
  }
  if (piece.motif === "arch") {
    return province === "Cavite" ? ARTWORK_HD_PLATES.kawit : ARTWORK_HD_PLATES.ancestral;
  }
  return ARTWORK_HD_PLATES.pahiyas;
}
