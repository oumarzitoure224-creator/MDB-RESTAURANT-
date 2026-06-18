export interface Dish {
  id: string;
  name: string;
  description: string;
  price: number; // in FCFA
  image: string; // URL / placeholder name
  spiciness: 0 | 1 | 2 | 3;
}

export interface Restaurant {
  id: string;
  name: string;
  specialty: string;
  commune: string;
  rating: number;
  deliveryTime: string;
  canopyStyle: 'mango' | 'plantain' | 'chili' | 'terracotta';
  accentColor: string;
  textColor: string;
  bgLight: string;
  dishes: Dish[];
  image?: string;
}

export interface Commune {
  name: string;
  deliveryFee: number; // in FCFA
  baseTime: number; // in minutes
}

// Famous Cameroonian neighborhoods (Douala & Yaoundé)
export const COMMUNES: Commune[] = [
  { name: "Yaoundé: Bastos (Quartier Chic)", deliveryFee: 500, baseTime: 15 },
  { name: "Yaoundé: Essos (Chaud & Populaire)", deliveryFee: 700, baseTime: 20 },
  { name: "Yaoundé: Tsinga", deliveryFee: 650, baseTime: 18 },
  { name: "Yaoundé: Omnisports", deliveryFee: 600, baseTime: 16 },
  { name: "Yaoundé: Mvan (Gare Routière)", deliveryFee: 900, baseTime: 30 },
  { name: "Douala: Akwa (Centre Commercial)", deliveryFee: 600, baseTime: 18 },
  { name: "Douala: Bonapriso (Résidentiel)", deliveryFee: 700, baseTime: 22 },
  { name: "Douala: Deido (Quartier Historique)", deliveryFee: 650, baseTime: 20 },
  { name: "Douala: Bonamoussadi", deliveryFee: 950, baseTime: 35 },
  { name: "Douala: Bali", deliveryFee: 600, baseTime: 18 },
  { name: "Bafoussam: Carrefour Shell", deliveryFee: 400, baseTime: 12 },
  { name: "Garoua: Houda-Mbori", deliveryFee: 450, baseTime: 15 },
  { name: "Maroua: Boulevard du Renouveau", deliveryFee: 500, baseTime: 16 },
  { name: "Bamenda: Commercial Avenue", deliveryFee: 450, baseTime: 15 },
  { name: "Buea: Molyko (Cité Universitaire)", deliveryFee: 400, baseTime: 14 },
  { name: "Limbe: Down Beach", deliveryFee: 550, baseTime: 18 },
  { name: "Kribi: New Town", deliveryFee: 600, baseTime: 15 }
];

// Cameroonian Cafeterias & Restaurants with real culinary pride!
export const RESTAURANTS: Restaurant[] = [
  {
    id: "cafet-champion",
    name: "La Cafétéria du Grand Nord (Chez Abbo)",
    specialty: "Spaghetti-Omelette Champion & Soya",
    commune: "Yaoundé Bastos",
    rating: 4.9,
    deliveryTime: "15-20 min",
    canopyStyle: "mango",
    accentColor: "#E8762C", // Warm orange
    textColor: "#1A1410",
    bgLight: "#FAF3EB",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=75",
    dishes: [
      {
        id: "cam-dish-1",
        name: "L'Omelette-Spaghetti 'Double Champion'",
        description: "L'incontournable des cafétérias camerounaises : 3 œufs battus avec oignons et piments, frits et chargés sur un lit de spaghettis mijotés, le tout inséré dans une demi-baguette croustillante badigeonnée de mayonnaise.",
        price: 1500,
        image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500&auto=format&fit=crop&q=60",
        spiciness: 1
      },
      {
        id: "cam-dish-2",
        name: "Pain Soya Spécial Kankankan",
        description: "Pain croustillant chargé de brochettes de soya (bœuf tendre grillé au feu de bois), assaisonné de piment sec Kankankan (épice traditionnelle du Nord Cameroun), d'oignons crus et de tomates.",
        price: 1800,
        image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60",
        spiciness: 2
      },
      {
        id: "cam-dish-3",
        name: "Bouillie de Maïs Sucrée & Beignets Chauds",
        description: "Le petit-déjeuner national ! Un bol onctueux de bouillie de maïs fermenté parfumée au citron, servie avec 6 beignets de farine levée dorés et croustillants.",
        price: 800,
        image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=500&auto=format&fit=crop&q=60",
        spiciness: 0
      }
    ]
  },
  {
    id: "tantie-ndole",
    name: "Chez Tantie Ndolé & Fils",
    specialty: "Ndolé Royal & Poissons du Littoral",
    commune: "Douala Deido",
    rating: 4.8,
    deliveryTime: "25-30 min",
    canopyStyle: "chili",
    accentColor: "#6B8E4E", // Plantain green
    textColor: "#FFF",
    bgLight: "#FAF5EF",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=75",
    dishes: [
      {
        id: "cam-dish-4",
        name: "Ndolé Crevettes & Viande Royal",
        description: "Plat légendaire camerounais composé de feuilles de ndolé lavées, d'arachides fraîches écrasées, de morceaux de viande de bœuf tendre et de grosses crevettes sautées, parfumé à l'huile de palme et oignons. Servi avec plantains frits.",
        price: 4500,
        image: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=500&auto=format&fit=crop&q=60",
        spiciness: 1
      },
      {
        id: "cam-dish-5",
        name: "Poisson Braisé du Mboa (Bar)",
        description: "Poisson bar frais de kribi entier mariné longuement dans des épices locales (djansang, pébé, ail, gingembre), braisé sur la grille de charbon de bois. Servi avec bobolo, miondo et piment vert.",
        price: 5000,
        image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500&auto=format&fit=crop&q=60",
        spiciness: 2
      },
      {
        id: "cam-dish-6",
        name: "Eru de Limbé au Waterfufu",
        description: "Feuilles d'eru hachées finement, cuites avec du waterleaf frais, de l'huile de palme rouge généreuse, du poisson fumé et du kanda (peau de bœuf). Servi chaud avec son accompagnement de fufu de manioc.",
        price: 3500,
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60",
        spiciness: 2
      }
    ]
  },
  {
    id: "buffet-bamileke",
    name: "Le Resto Bamiléké des Hauts-Plateaux",
    specialty: "Taro Achou & Spécialités Grassfields",
    commune: "Yaoundé Essos",
    rating: 4.7,
    deliveryTime: "20-30 min",
    canopyStyle: "terracotta",
    accentColor: "#9C4E35", // Terracotta
    textColor: "#FFF",
    bgLight: "#FAEDE8",
    image: "https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=800&auto=format&fit=crop&q=75",
    dishes: [
      {
        id: "cam-dish-7",
        name: "Achou de l'Ouest Authentique",
        description: "Délicieux taro pilé blanc et lisse, disposé en couronne avec, au centre, sa magnifique sauce jaune onctueuse à base d'huile de palme rouge, de sel gemme calciné et d'épices d'Afrique centrale. Servi avec tripes.",
        price: 3500,
        image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=500&auto=format&fit=crop&q=60",
        spiciness: 1
      },
      {
        id: "cam-dish-8",
        name: "Koki Traditionnel au Karité",
        description: "Gâteau de haricots cornille décortiqués et écrasés, émulsionnés à l'huile de palme tiède et cuit dans d'épaisses feuilles de bananiers sauvages à la vapeur. Accompagné de plantains vapeur ou de patates douces.",
        price: 2500,
        image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&auto=format&fit=crop&q=60",
        spiciness: 1
      },
      {
        id: "cam-dish-9",
        name: "Kondré de Porc aux Plantains",
        description: "Ragoût majestueux de l'Ouest Cameroun de bananes plantains entières mijotées avec du porc fumé gras, riche en condiments indigènes (épices kondré, tsié, ail, oignons) qui créent une sauce brune envoûtante.",
        price: 4000,
        image: "https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=500&auto=format&fit=crop&q=60",
        spiciness: 1
      }
    ]
  }
];

export const TESTIMONIALS = [
  {
    id: 1,
    name: "Marc Atangana",
    role: "Client fidèle — Yaoundé Bastos",
    comment: "Commander le vrai Spaghetti Omelette Champion comme au quartier Essos mais directement livré à température idéale chez moi à Bastos, c'est formidable ! Je paye via MTN MoMo en un clic ou en espèces, le suivi du livreur est excellent.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
  },
  {
    id: 2,
    name: "Cédric Foko",
    role: "Livreur Moto MDB — Douala",
    comment: "Notre application livreur nous permet de voir toutes les commandes en attente d'Akwa ou Bonapriso. Dès que je prends une course, je peux envoyer mes coordonnées GPS et communiquer direct par SMS ou appel interne avec le client !",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80"
  },
  {
    id: 3,
    name: "Tantie Solange",
    role: "Propriétaire du Resto Bamiléké",
    comment: "Grâce à l'espace gérant MDB, mon équipe voit instantanément les commandes reçues avec les détails du taro Achou ou du koki. Nous validons d'un clic, le livreur arrive à moto pendant que le koki est encore fumant.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
  }
];

export const FAQS = [
  {
    question: "Comment commander sur MDB Cameroun ?",
    answer: "Parcourez nos célèbres cafétérias de Yaoundé et Douala, composez votre panier, envoyez votre localisation GPS en un clic et choisissez votre mode de paiement : Mobile Money (MTN / Orange), Wave, ou Paiement en espèces (Cash à la livraison) !"
  },
  {
    question: "Quels sont les modes de paiement camerounais acceptés ?",
    answer: "Nous sommes fiers d'intégrer le paiement par MTN Mobile Money (MoMo), Orange Money, Wave Cameroun, ainsi que le paiement en espèces lors de la remise physique du repas par le livreur."
  },
  {
    question: "Comment mon compte est-il sécurisé et validé ?",
    answer: "Pour lutter contre la fraude et garantir une expérience de confiance, chaque inscription de client, livreur ou gérant nécessite l'import d'une photo de profil, d'une photo de votre Carte Nationale d'Identité (CNI) et d'un code OTP de confirmation envoyé par SMS et Email."
  },
  {
    question: "Puis-je suivre le livreur à moto en direct ?",
    answer: "Absolument ! Notre simulateur et notre application de livraison affichent la progression de la course en temps réel, de la préparation des beignets/spaghettis, de la prise en charge par le livreur, jusqu'au pas de votre porte."
  }
];
