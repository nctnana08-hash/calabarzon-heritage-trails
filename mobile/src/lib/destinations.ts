export type NativeDestination = {
  id: string;
  name: string;
  slug: string;
  province: "Cavite" | "Laguna" | "Batangas" | "Rizal" | "Quezon";
  category: "Historical Shrines" | "Churches & Belfries" | "Museums & Arts" | "Natural Wonders";
  address: string;
  latitude: number;
  longitude: number;
  description: string;
  imageUrl: string;
  panoramaUrl: string;
  history: string;
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
  };
};

export const CALABARZON_NATIVE_DESTINATIONS: NativeDestination[] = [
  {
    id: "1",
    name: "Aguinaldo Shrine",
    slug: "aguinaldo-shrine",
    province: "Cavite",
    category: "Historical Shrines",
    address: "Kawit, Cavite",
    latitude: 14.4449,
    longitude: 120.9037,
    description:
      "The ancestral home where Philippine Independence was proclaimed from the historic balcony on June 12, 1898.",
    imageUrl:
      "https://images.unsplash.com/photo-1590059390047-66a982186711?auto=format&fit=crop&w=1200&q=80",
    panoramaUrl: "/panoramas/calabarzon-grand-pavilion-16k.jpg",
    history:
      "General Emilio Aguinaldo declared Philippine independence from the window of this residence in Kawit. The mansion features secret compartments, vintage furnishings, and a spacious garden.",
    quiz: {
      question: "In what year was Philippine Independence proclaimed from the Kawit balcony?",
      options: ["1896", "1898", "1901", "1946"],
      correctIndex: 1,
    },
  },
  {
    id: "2",
    name: "Rizal Shrine Calamba",
    slug: "rizal-shrine-calamba",
    province: "Laguna",
    category: "Historical Shrines",
    address: "Calamba, Laguna",
    latitude: 14.2137,
    longitude: 121.1661,
    description:
      "A replica of the ancestral two-story Spanish colonial bahay na bato where national hero Dr. José Rizal was born in 1861.",
    imageUrl:
      "https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?auto=format&fit=crop&w=1200&q=80",
    panoramaUrl: "/panoramas/calabarzon-heritage-salon-12k.jpg",
    history:
      "Dr. José Rizal spent his early childhood in this home with his large family, learning his first alphabet and stories under the guidance of Doña Teodora Alonso.",
    quiz: {
      question: "Who was José Rizal's first teacher at this Calamba ancestral home?",
      options: [
        "His brother Paciano",
        "His mother Teodora Alonso",
        "Father Rufino Collantes",
        "Maestro Celestino",
      ],
      correctIndex: 1,
    },
  },
  {
    id: "3",
    name: "Taal Heritage Town & Basilica",
    slug: "taal-heritage-town",
    province: "Batangas",
    category: "Churches & Belfries",
    address: "Taal, Batangas",
    latitude: 13.8812,
    longitude: 120.9238,
    description:
      "Home to the Minor Basilica of St. Martin of Tours, considered the largest Catholic church in Asia.",
    imageUrl:
      "https://images.unsplash.com/photo-1548625361-125032a3f78a?auto=format&fit=crop&w=1200&q=80",
    panoramaUrl: "/panoramas/museum-rotunda-360.jpg",
    history:
      "Built on an elevated ridge overlooking Balayan Bay, the basilica spans 88 meters long and 48 meters wide, embodying grand neoclassical and baroque architecture.",
    quiz: {
      question: "Which saint is the Taal Minor Basilica dedicated to?",
      options: ["St. Martin of Tours", "St. John the Baptist", "St. Augustine", "St. Peter"],
      correctIndex: 0,
    },
  },
  {
    id: "4",
    name: "Pinto Art Museum",
    slug: "pinto-art-museum",
    province: "Rizal",
    category: "Museums & Arts",
    address: "Antipolo, Rizal",
    latitude: 14.5826,
    longitude: 121.1643,
    description:
      "Mission-style garden galleries featuring vibrant contemporary Filipino paintings, installations, and sculptures.",
    imageUrl:
      "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=1200&q=80",
    panoramaUrl: "/panoramas/museum-gallery-hall-360.webp",
    history:
      "Founded by Dr. Joven Cuanang to showcase cutting-edge contemporary Philippine art across undulating white stucco pavilions and lush botanical gardens.",
    quiz: {
      question: "What does the Tagalog word 'Pintô' translate to?",
      options: ["Window", "Door / Gateway", "Canvas", "Mountain"],
      correctIndex: 1,
    },
  },
  {
    id: "5",
    name: "Kamay ni Hesus Healing Shrine",
    slug: "kamay-ni-hesus",
    province: "Quezon",
    category: "Historical Shrines",
    address: "Lucban, Quezon",
    latitude: 14.1167,
    longitude: 121.5542,
    description:
      "Pilgrimage destination situated at the base of Mount Banahaw featuring a 50-foot Ascending Christ statue.",
    imageUrl:
      "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1200&q=80",
    panoramaUrl: "/panoramas/calabarzon-upstairs-mezzanine-12k.jpg",
    history:
      "Pilgrims climb 300 steps through the life-sized Stations of the Cross toward the summit, enjoying panoramic vistas of Lucban and Mount Banahaw.",
    quiz: {
      question: "At the foot of which sacred mountain is Kamay ni Hesus located?",
      options: ["Mount Makiling", "Mount Banahaw", "Mount Batulao", "Mount Cristobal"],
      correctIndex: 1,
    },
  },
];
