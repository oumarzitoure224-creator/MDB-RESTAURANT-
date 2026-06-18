export interface AppTranslations {
  menuTitle: string;
  stallsTitle: string;
  stallsSubtitle: string;
  workspaceTitle: string;
  howItWorks: string;
  testimonialsTitle: string;
  activeInCameroon: string;
  accountsPortal: string;
  heroBadge: string;
  heroHeadline: string;
  heroParagraph: string;
  orderNow: string;
  searchPlaceholder: string;
  allCommunes: string;
  filterAll: string;
  cartTitle: string;
  cartEmpty: string;
  cartTotal: string;
  paymentMethod: string;
  payCash: string;
  payOM: string;
  payMoMo: string;
  payWave: string;
  fullName: string;
  phoneLabel: string;
  deliveryAddress: string;
  confirmOrderBtn: string;
  fictionalTime: string;
  temperature: string;
  settingsButton: string;
  settingsPanelTitle: string;
  selectLanguage: string;
  settingsSaved: string;
  backToTop: string;
  roleClient: string;
  roleLivreur: string;
  roleGerant: string;
  roleAdmin: string;
}

export const TRANSLATIONS: Record<"fr" | "en", AppTranslations> = {
  fr: {
    menuTitle: "🍽️ Carte des Menus",
    stallsTitle: "Les Étals de maquis & restaurants",
    stallsSubtitle: "★ Vos cafétérias préférées livrées en express dans tout le Cameroun ★",
    workspaceTitle: "Espace Workspace 🔐",
    howItWorks: "3 Étapes simples",
    testimonialsTitle: "Avis du Pays",
    activeInCameroon: "Active au Cameroun 🇨🇲",
    accountsPortal: "Portail Comptes",
    heroBadge: "⚡ MDB RESTAURANT - LIVRAISON RAPIDE",
    heroHeadline: "Savourez la gastronomie locale chaude chez vous !",
    heroParagraph: "Commandez les meilleurs mets traditionnels camerounais (Spaghetti champion, Ndolé royal, Taro achou) validés par authentification CNI & OTP pour une sécurité absolue.",
    orderNow: "Commander maintenant 😋",
    searchPlaceholder: "Rechercher un plat, une boisson... (ex: Ndolé, spaghetti, koki)",
    allCommunes: "Toutes les Communes",
    filterAll: "Tout Afficher",
    cartTitle: "🍲 Votre Panier Local",
    cartEmpty: "Votre panier est vide. Sélectionnez des délices ci-dessus pour commencer !",
    cartTotal: "Total à payer",
    paymentMethod: "Mode de règlement",
    payCash: "Espèces (Paiement à la livraison) 💵",
    payOM: "Orange Money (Direct) 🍊",
    payMoMo: "MTN Mobile Money (Direct) 💳",
    payWave: "Wave Cameroun (Direct) 📲",
    fullName: "Votre Nom complet",
    phoneLabel: "Numéro de Téléphone (Orange, MTN, Wave...)",
    deliveryAddress: "Adresse de livraison exacte ou Commune",
    confirmOrderBtn: "✓ CONFIGURER & ENVOYER LE COURRIER DE COMMANDE",
    fictionalTime: "Heure Locale",
    temperature: "Météo Locale",
    settingsButton: "⚙️ Paramètres",
    settingsPanelTitle: "⚙️ Options & Paramètres de l'Application",
    selectLanguage: "Langue de la Plateforme / Platform Language",
    settingsSaved: "Paramètres mis à jour avec succès !",
    backToTop: "Retour en haut",
    roleClient: "Client Gourmet",
    roleLivreur: "Livreur Motard de Confiance",
    roleGerant: "Gérant de Resto",
    roleAdmin: "Super Admin MDB"
  },
  en: {
    menuTitle: "🍽️ Menu Directory",
    stallsTitle: "Maquis & Restaurant Directories",
    stallsSubtitle: "★ Your favorite eateries delivered express throughout Cameroon ★",
    workspaceTitle: "Workspace Area 🔐",
    howItWorks: "3 Simple Steps",
    testimonialsTitle: "What the Locals Say",
    activeInCameroon: "Live in Cameroon 🇨🇲",
    accountsPortal: "Accounts Portal",
    heroBadge: "⚡ MDB RESTAURANT - FAST COURIER",
    heroHeadline: "Savor the best local delicacies hot at home or work!",
    heroParagraph: "Order premier traditional Cameroonian foods (Champion Spaghetti, Royal Ndolé, Achou Taro) secured by CNI & OTP checks for maximum reliability.",
    orderNow: "Order Now 😋",
    searchPlaceholder: "Search for a dish, drink... (e.g., Ndole, spaghetti, taro)",
    allCommunes: "All Districts",
    filterAll: "View All",
    cartTitle: "🍲 Your Local Cart",
    cartEmpty: "Your cart is empty. Select mouth-watering items above to start!",
    cartTotal: "Total Amount",
    paymentMethod: "Payment Method",
    payCash: "Cash on Delivery (COD) 💵",
    payOM: "Orange Money (Direct Transfer) 🍊",
    payMoMo: "MTN Mobile Money (Direct Transfer) 💳",
    payWave: "Wave Cameroon (Direct Transfer) 📲",
    fullName: "Your Full Name",
    phoneLabel: "Phone Number (Orange, MTN, Wave...)",
    deliveryAddress: "Exact Delivery Address or District",
    confirmOrderBtn: "✓ CONFIRM & TRANSMIT DELIVERY DISPATCH",
    fictionalTime: "Local Time",
    temperature: "Local Weather",
    settingsButton: "⚙️ Settings",
    settingsPanelTitle: "⚙️ Application Options & Settings",
    selectLanguage: "Language Selection",
    settingsSaved: "Settings updated successfully!",
    backToTop: "Back to top",
    roleClient: "Gourmet Client",
    roleLivreur: "Trusted Delivery Rider",
    roleGerant: "Restaurant Owner",
    roleAdmin: "MDB Super Administrator"
  }
};
