import React, { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import {
  ShoppingBag,
  ChefHat,
  Truck,
  MapPin,
  CheckCircle2,
  Star,
  Menu,
  X,
  Sparkles,
  ArrowRight,
  Clock,
  ShieldCheck,
  Download,
  ChevronDown,
  Mic,
  MicOff,
  Globe,
  Settings,
  Save
} from "lucide-react";

import { RESTAURANTS, COMMUNES, TESTIMONIALS, FAQS, Restaurant, Dish, Commune } from "./data";
import { Account, Order, ChatMessage, GlobalStaffMessage, RoleType } from "./types";
import WeatherWidget from "./components/WeatherWidget";
import { TRANSLATIONS } from "./translations";

/**
 * Returns opening status and formatted hours for traditional stall simulation.
 */
export const getRestaurantStatus = (restoId: string, hour: number) => {
  let openH = 8;
  let closeH = 21;
  let scheduleText = "08h00 - 21h00";

  if (restoId === "cafet-champion") {
    openH = 6;
    closeH = 22;
    scheduleText = "06h00 - 22h00";
  } else if (restoId === "tantie-ndole") {
    openH = 11;
    closeH = 22;
    scheduleText = "11h00 - 22h00";
  } else if (restoId === "buffet-bamileke") {
    openH = 8;
    closeH = 18;
    scheduleText = "08h00 - 18h00";
  }

  const isOpen = hour >= openH && hour < closeH;
  return { isOpen, openH, closeH, scheduleText };
};

/**
 * Calculates preparation & delivery load metrics based on the food stall's busy hours.
 */
export const getEstimatedWaitTimeAndLoad = (restoId: string, hour: number, isOpen: boolean) => {
  if (!isOpen) {
    return {
      minutes: "-",
      loadText: "Fermé",
      loadClass: "bg-gray-100 text-gray-400 border-gray-200",
      progressWidth: "0%",
      progressColor: "bg-gray-200",
      description: "Le maquis n'accueille pas de commandes actuellement."
    };
  }

  // Peak Hours check (lunch 12h-14h or dinner 19h-21h)
  const isPeak = (hour >= 12 && hour <= 14) || (hour >= 19 && hour <= 21);

  let minutes = "15 - 20 min";
  let loadText = "Normal";
  let loadClass = "bg-[#FAF6F0] text-amber-700 border-amber-200";
  let progressWidth = "50%";
  let progressColor = "bg-amber-400";
  let description = "Affluence moyenne. Préparation fluide.";

  if (restoId === "cafet-champion") {
    if (isPeak) {
      minutes = "15 - 20 min";
      loadText = "Coup de Feu 🔥";
      loadClass = "bg-amber-50 text-amber-700 border-amber-200";
      progressWidth = "65%";
      progressColor = "bg-amber-500";
      description = "Petite attente liée au rush des omelettes !";
    } else {
      minutes = "8 - 12 min";
      loadText = "Vitesse Éclair ⚡";
      loadClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
      progressWidth = "20%";
      progressColor = "bg-emerald-500";
      description = "Cafétéria calme. Cuisson immédiate de vos œufs.";
    }
  } else if (restoId === "tantie-ndole") {
    if (isPeak) {
      minutes = "35 - 45 min";
      loadText = "Saturé ⚠️";
      loadClass = "bg-rose-50 text-rose-700 border-rose-200";
      progressWidth = "95%";
      progressColor = "bg-rose-500";
      description = "Grande affluence sur le Ndolé frais de Tantie.";
    } else {
      minutes = "20 - 25 min";
      loadText = "Mijotage 🥣";
      loadClass = "bg-sky-50 text-sky-700 border-sky-200";
      progressWidth = "40%";
      progressColor = "bg-sky-500";
      description = "Mijotage traditionnel fait à la minute.";
    }
  } else if (restoId === "buffet-bamileke") {
    if (isPeak) {
      minutes = "25 - 30 min";
      loadText = "Rush Buffet 🔥";
      loadClass = "bg-amber-50 text-amber-700 border-amber-200";
      progressWidth = "75%";
      progressColor = "bg-amber-500";
      description = "Les marmites de koki & kondré se vident vite !";
    } else {
      minutes = "12 - 18 min";
      loadText = "Fluide 🟢";
      loadClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
      progressWidth = "30%";
      progressColor = "bg-emerald-500";
      description = "Buffet chaud toujours approvisionné et prêt.";
    }
  }

  return { minutes, loadText, loadClass, progressWidth, progressColor, description };
};

// Extracted UI Sub-components
import AccountConsole from "./components/AccountConsole";
import ClientWorkspace from "./components/ClientWorkspace";
import LivreurWorkspace from "./components/LivreurWorkspace";
import GerantWorkspace from "./components/GerantWorkspace";
import AdminWorkspace from "./components/AdminWorkspace";

export default function App() {
  // Language selection and translation states
  const [currentLang, setCurrentLang] = useState<"fr" | "en">(() => {
    return (localStorage.getItem("mdb_lang") as "fr" | "en") || "fr";
  });
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("mdb_lang", currentLang);
  }, [currentLang]);

  const t = TRANSLATIONS[currentLang];

  // Custom brand / logo identity state
  const [customBrandName, setCustomBrandName] = useState(() => {
    return localStorage.getItem("mdb_custom_brand_name") || "MDB RESTAURANT DELIVERY";
  });
  const [customBrandSubtitle, setCustomBrandSubtitle] = useState(() => {
    return localStorage.getItem("mdb_custom_brand_subtitle") || "★ Votre Maquis dans la Poche ★";
  });
  const [customBrandIcon, setCustomBrandIcon] = useState(() => {
    return localStorage.getItem("mdb_custom_brand_icon") || "🍲";
  });

  // Payment transfer phone numbers editable by admin
  const [orangeMoneyNumber, setOrangeMoneyNumber] = useState(() => {
    return localStorage.getItem("mdb_pay_orange") || "+237 688 84 91 00";
  });
  const [mtnMoneyNumber, setMtnMoneyNumber] = useState(() => {
    return localStorage.getItem("mdb_pay_mtn") || "+237 677 88 99 00";
  });
  const [waveMoneyNumber, setWaveMoneyNumber] = useState(() => {
    return localStorage.getItem("mdb_pay_wave") || "+237 655 44 33 22";
  });

  // Contact coordinates editable by admin
  const [contactWhatsApp, setContactWhatsApp] = useState(() => {
    return localStorage.getItem("mdb_contact_whatsapp") || "+237 677 88 99 00";
  });
  const [contactFacebook, setContactFacebook] = useState(() => {
    return localStorage.getItem("mdb_contact_facebook") || "https://facebook.com/mdbrestaurant";
  });
  const [contactEmail, setContactEmail] = useState(() => {
    return localStorage.getItem("mdb_contact_email") || "contact@mdbrestaurant.com";
  });

  // Mobile drawer visibility toggles
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Logo selection list
  const logoOptions = [
    { id: "marmite", label: "Marmite Festive 🍲", icon: "🍲", subtitle: "★ Le bon goût du Mboa ★", color: "from-[#E8762C] to-[#AF4E12]", textPrefix: "MDB", textSuffix: "Multi Services" },
    { id: "moto", label: "Livreur Gazelle 🏍️", icon: "🏍️", subtitle: "★ Chaud & Ultra-Rapide ★", color: "from-[#6B8E4E] to-[#455D31]", textPrefix: "MDB", textSuffix: "Gazelle" },
    { id: "piment", label: "Piment Ndjansang 🌶️", icon: "🌶️", subtitle: "★ Le Ndolé pimenté de Deido ★", color: "from-red-600 to-red-800", textPrefix: "MDB", textSuffix: "Pimenté" },
    { id: "mango", label: "Prunelle de Douala 🥭", icon: "🥭", subtitle: "★ Douceur & Partage ★", color: "from-[#F1932C] to-[#C36C12]", textPrefix: "MDB", textSuffix: "Tropiques" }
  ];
  const [selectedLogo, setSelectedLogo] = useState(logoOptions[0]);

  // General Toast notifications
  const [showNotification, setShowNotification] = useState<string | null>(null);
  const triggerToast = (message: string) => {
    setShowNotification(message);
    setTimeout(() => {
      setShowNotification(null);
    }, 4050);
  };

  // State hold for data (allows Admin live editing of menus & prices to propagate!)
  const [restaurants, setRestaurants] = useState<Restaurant[]>(() => {
    const saved = localStorage.getItem("mdb_cam_restaurants");
    return saved ? JSON.parse(saved) : RESTAURANTS;
  });

  const [communes] = useState<Commune[]>(COMMUNES);

  // Directory of accounts (Preloaded with sample characters to make testing instant!)
  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem("mdb_cam_accounts");
    let list = saved ? JSON.parse(saved) : [];

    const defaultAdmin: Account = {
      id: "acc-admin-1",
      name: "Administrateur MDB",
      email: "mdbservice237@gmail.com",
      password: "Voiture.2",
      phone: "+237 688849100",
      role: "admin",
      profilePhoto: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
      cniPhoto: "https://upload.wikimedia.org/wikipedia/commons/e/e1/Sample_Identity_Card_Cameroon.png",
      verified: true,
      createdAt: "15/06/2026"
    };

    if (list.length === 0) {
      list = [
        {
          ...defaultAdmin,
          referralCode: "ADMIN237",
          referralCredit: 0
        },
        {
          id: "acc-client-1",
          name: "Marc Atangana",
          email: "marc.atangana@mboa.cm",
          phone: "+237 677889900",
          role: "client",
          profilePhoto: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80",
          cniPhoto: "https://upload.wikimedia.org/wikipedia/commons/e/e1/Sample_Identity_Card_Cameroon.png",
          verified: true,
          createdAt: "16/06/2026",
          referralCode: "MARC150",
          referralCredit: 150 // Referred client demo credit
        },
        {
          id: "acc-livreur-1",
          name: "Cédric Foko",
          email: "cedric.foko@mboa.cm",
          phone: "+237 699112233",
          role: "livreur",
          profilePhoto: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80",
          cniPhoto: "https://upload.wikimedia.org/wikipedia/commons/e/e1/Sample_Identity_Card_Cameroon.png",
          verified: true,
          createdAt: "16/06/2026",
          referralCode: "FOKO150",
          referralCredit: 0
        },
        {
          id: "acc-gerant-1",
          name: "Tantie Ndolé Solange",
          email: "solange.ndole@mboa.cm",
          phone: "+237 655443322",
          role: "gerant",
          profilePhoto: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80",
          cniPhoto: "https://upload.wikimedia.org/wikipedia/commons/e/e1/Sample_Identity_Card_Cameroon.png",
          restaurantId: "tantie-ndole",
          verified: true,
          createdAt: "16/06/2026",
          referralCode: "TANTIE150",
          referralCredit: 0
        }
      ];
    } else {
      list = list.map((acc: Account) => {
        if (acc.role === "admin" || acc.id === "acc-admin-1") {
          return {
            ...acc,
            name: "Administrateur MDB",
            email: "mdbservice237@gmail.com",
            password: "Voiture.2",
            referralCode: acc.referralCode || "ADMIN237",
            referralCredit: acc.referralCredit !== undefined ? acc.referralCredit : 0
          };
        }
        if (!acc.referralCode) {
          const clean = acc.name.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 4);
          const rand = acc.id === "acc-client-1" ? "150" : Math.floor(1000 + Math.random() * 9000).toString();
          acc.referralCode = acc.id === "acc-client-1" ? "MARC150" : `MDB-${clean || "MEMBER"}-${rand}`;
        }
        if (acc.referralCredit === undefined) {
          acc.referralCredit = acc.id === "acc-client-1" ? 150 : 0;
        }
        return acc;
      });
      if (!list.some((acc: Account) => acc.id === "acc-admin-1")) {
        list.unshift({
          ...defaultAdmin,
          referralCode: "ADMIN237",
          referralCredit: 0
        });
      }
    }
    return list;
  });

  // Current Logged-in Account. Starts as Admin for testing or null (visitor)
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null);

  // Active Client order simulator cart state
  const [cart, setCart] = useState<{ dish: Dish; quantity: number }[]>([]);

  // Checkout parameter selections
  const [selectedCommune, setSelectedCommune] = useState<Commune>(communes[0]);
  const [paymentProvider, setPaymentProvider] = useState<"wave" | "orange" | "mtn" | "cash">("mtn");
  const [simulatedMobileNumber, setSimulatedMobileNumber] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");

  // Global ledger of orders logged in the platform
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem("mdb_cam_orders");
    if (saved) return JSON.parse(saved);

    // Bootstrap demo orders
    return [
      {
        id: "MDB-ORDER-4182",
        clientId: "acc-client-1",
        clientName: "Marc Atangana",
        clientPhone: "+237 677889900",
        clientCoords: { lat: 3.8687, lng: 11.5204, label: "Yaoundé Bastos" },
        restaurantId: "cafet-champion",
        restaurantName: "La Cafétéria du Grand Nord (Chez Abbo)",
        items: [
          {
            dish: RESTAURANTS[0].dishes[0],
            quantity: 2
          }
        ],
        subtotal: 3000,
        deliveryFee: 500,
        total: 3500,
        paymentMethod: "mtn" as const,
        status: "delivered" as const,
        livreurId: "acc-livreur-1",
        livreurName: "Cédric Foko",
        createdAt: "10:30"
      }
    ];
  });

  // Dual communication instant SMS chat messages directory
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem("mdb_cam_chats");
    return saved ? JSON.parse(saved) : [];
  });

  // Global Staff Messages for inter-riders, inter-managers, and admin communications
  const [globalStaffMessages, setGlobalStaffMessages] = useState<GlobalStaffMessage[]>(() => {
    const saved = localStorage.getItem("mdb_global_staff_msgs");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "staff-1",
        senderId: "cedric-foko",
        senderName: "Cédric Foko",
        senderRole: "livreur",
        recipientRole: "livreurs",
        text: "🚨 Les gars, y'a un gros embouteillage vers le Carrefour Bastos. Contournez par Tsinga !",
        timestamp: "10:35"
      },
      {
        id: "staff-2",
        senderId: "solange-ndole",
        senderName: "Tantie Ndolé Solange",
        senderRole: "gerant",
        recipientRole: "all-staff",
        text: "👨‍🍳 Bonjour à tous les livreurs ! Le Ndolé Royal est chaud et empaqueté en cuisine, venez récupérer.",
        timestamp: "10:48"
      },
      {
        id: "staff-3",
        senderId: "admin-super",
        senderName: "Super Admin MDB",
        senderRole: "admin",
        recipientRole: "all-staff",
        text: "⚡ RAPPEL DE SÉCURITÉ : Assurez-vous que chaque client valide son OTP fictif et que ses coordonnées soient bien enregistrées pour la traçabilité.",
        timestamp: "11:02"
      }
    ];
  });

  // Save changes states to localStorage on mutation
  useEffect(() => {
    localStorage.setItem("mdb_cam_restaurants", JSON.stringify(restaurants));
  }, [restaurants]);

  useEffect(() => {
    localStorage.setItem("mdb_cam_accounts", JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem("mdb_cam_orders", JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem("mdb_cam_chats", JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    localStorage.setItem("mdb_global_staff_msgs", JSON.stringify(globalStaffMessages));
  }, [globalStaffMessages]);

  useEffect(() => {
    localStorage.setItem("mdb_custom_brand_name", customBrandName);
  }, [customBrandName]);

  useEffect(() => {
    localStorage.setItem("mdb_custom_brand_subtitle", customBrandSubtitle);
  }, [customBrandSubtitle]);

  useEffect(() => {
    localStorage.setItem("mdb_custom_brand_icon", customBrandIcon);
  }, [customBrandIcon]);

  useEffect(() => {
    localStorage.setItem("mdb_pay_orange", orangeMoneyNumber);
  }, [orangeMoneyNumber]);

  useEffect(() => {
    localStorage.setItem("mdb_pay_mtn", mtnMoneyNumber);
  }, [mtnMoneyNumber]);

  useEffect(() => {
    localStorage.setItem("mdb_pay_wave", waveMoneyNumber);
  }, [waveMoneyNumber]);

  useEffect(() => {
    localStorage.setItem("mdb_contact_whatsapp", contactWhatsApp);
  }, [contactWhatsApp]);

  useEffect(() => {
    localStorage.setItem("mdb_contact_facebook", contactFacebook);
  }, [contactFacebook]);

  useEffect(() => {
    localStorage.setItem("mdb_contact_email", contactEmail);
  }, [contactEmail]);

  // Automated Background Order Simulation with real-time status change toast alerts
  useEffect(() => {
    const simulationInterval = setInterval(() => {
      setOrders((currentOrders) => {
        let changed = false;
        const updated = currentOrders.map((order) => {
          // Process orders that are not already finalized
          if (order.status === "pending") {
            changed = true;
            // Delay notification slightly so it doesn't conflict with state synchronization
            setTimeout(() => {
              triggerToast(`👨🏾‍🍳 Votre commande ${order.id} a été ACCEPTÉE par ${order.restaurantName} ! Début de la préparation...`);
            }, 100);
            return { ...order, status: "preparing" };
          } else if (order.status === "preparing") {
            changed = true;
            setTimeout(() => {
              triggerToast(`🍲 Commande ${order.id} PRÊTE ! Transmission au service de livraison express...`);
            }, 100);
            return { ...order, status: "ready" };
          } else if (order.status === "ready") {
            changed = true;
            setTimeout(() => {
              triggerToast(`🏍️ Livreur en approche ! Un motard express a récupéré votre commande ${order.id} !`);
            }, 100);
            return { 
              ...order, 
              status: "delivering",
              livreurId: "acc-livreur-1",
              livreurName: "Foko (Moto Express)"
            };
          } else if (order.status === "delivering") {
            changed = true;
            setTimeout(() => {
              triggerToast(`🎉 Commande ${order.id} LIVRÉE avec succès ! Bon appétit de la part de Maquis de Bord ! 🤩`);
            }, 100);
            return { ...order, status: "delivered" };
          }
          return order;
        });
        return changed ? updated : currentOrders;
      });
    }, 15000); // Trigger a transition state every 15 seconds for reactive simulations

    return () => clearInterval(simulationInterval);
  }, [triggerToast]);

  // Set checkout mobile phone on account mount
  useEffect(() => {
    if (currentAccount) {
      setSimulatedMobileNumber(currentAccount.phone);
      if (currentAccount.role === "client") {
        setDeliveryAddress(`Yaoundé Bastos, à proximité de la résidence ${currentAccount.name}`);
      }
    } else {
      setSimulatedMobileNumber("");
      setDeliveryAddress("");
    }
  }, [currentAccount]);

  // Food explorer filter query parameters
  const [menuSearchQuery, setMenuSearchQuery] = useState("");
  const [menuSelectedCategory, setMenuSelectedCategory] = useState("all"); // "all" | "spag" | "trad" | "boisson"
  const [restaurantFilter, setRestaurantFilter] = useState("all");
  const [isLoadingMenu, setIsLoadingMenu] = useState(false);

  useEffect(() => {
    setIsLoadingMenu(true);
    const timer = setTimeout(() => {
      setIsLoadingMenu(false);
    }, 450); // 450ms simulation window for visual loading skeleton feedback
    return () => clearTimeout(timer);
  }, [menuSearchQuery, menuSelectedCategory, restaurantFilter]);
  
  // Fictional hour state for real-time schedule testing of the food stalls
  const [fictionalHour, setFictionalHour] = useState<number>(() => {
    return new Date().getHours();
  });

  // Web Speech API Voice Search helper elements
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceSupported(false);
    }
  }, []);

  const startVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      triggerToast("La recherche vocale n'est pas supportée par votre navigateur actuel (recommandé: Chrome ou Safari). 🎙️");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "fr-FR"; // Perfect for French-speaking Cameroonian dishes (Ndolé, beignets, omelette)

      recognition.onstart = () => {
        setIsVoiceListening(true);
        triggerToast("🎙️ Micro activé : parlez maintenant ! Dites ex: 'ndolé', 'beignets', 'cafétéria'...");
      };

      recognition.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        if (transcript) {
          // Remove trailing dots or specific words if any, clean up
          const cleanTranscript = transcript.trim().replace(/\.$/, "");
          setMenuSearchQuery(cleanTranscript);
          triggerToast(`🔍 Recherche filtrée sur : "${cleanTranscript}"`);
        }
      };

      recognition.onerror = (err: any) => {
        console.error("Speech recognition error:", err.error);
        if (err.error === 'not-allowed') {
          triggerToast("⚠️ Permission d'accès au microphone refusée par le navigateur.");
        } else {
          triggerToast("🎙️ Impossible de reconnaître votre voix. Veuillez réessayer !");
        }
        setIsVoiceListening(false);
      };

      recognition.onend = () => {
        setIsVoiceListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      setIsVoiceListening(false);
    }
  };

  // FAQs interactive state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Cart operations
  const addToCart = (dish: Dish) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.dish.id === dish.id);
      if (existing) {
        return prev.map((item) =>
          item.dish.id === dish.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { dish, quantity: 1 }];
    });
    triggerToast(`Ajouté au panier : ${dish.name} (+1) 🍲`);
  };

  const removeFromCart = (dishId: string) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.dish.id === dishId);
      if (!existing) return prev;
      if (existing.quantity === 1) {
        return prev.filter((item) => item.dish.id !== dishId);
      }
      return prev.map((item) =>
        item.dish.id === dishId ? { ...item, quantity: item.quantity - 1 } : item
      );
    });
  };

  const clearCart = (customMsg?: string) => {
    setCart([]);
    if (customMsg) triggerToast(customMsg);
  };

  // Callback triggers for administrative updates (Menu edits)
  const modifyDishDetails = (restoId: string, dishId: string, updatedPrice: number, updatedImage: string) => {
    setRestaurants((prevList) =>
      prevList.map((resto) => {
        if (resto.id === restoId) {
          return {
            ...resto,
            dishes: resto.dishes.map((dish) =>
              dish.id === dishId ? { ...dish, price: updatedPrice, image: updatedImage } : dish
            )
          };
        }
        return resto;
      })
    );
  };

  const modifyRestaurantDetails = (restoId: string, updatedName: string, updatedSpecialty: string, updatedImage: string) => {
    setRestaurants((prevList) =>
      prevList.map((resto) => {
        if (resto.id === restoId) {
          return {
            ...resto,
            name: updatedName,
            specialty: updatedSpecialty,
            image: updatedImage
          };
        }
        return resto;
      })
    );
  };

  const handleAddNewDish = (restaurantId: string, newDish: Dish) => {
    setRestaurants((prevList) =>
      prevList.map((resto) => {
        if (resto.id === restaurantId) {
          return {
            ...resto,
            dishes: [...resto.dishes, newDish]
          };
        }
        return resto;
      })
    );
  };

  const registerNewAccount = (newAcc: Account) => {
    // Generate referral code for the new account if it doesn't have one
    if (!newAcc.referralCode) {
      const clean = newAcc.name.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 4);
      const random = Math.floor(1000 + Math.random() * 9000);
      newAcc.referralCode = `MDB-${clean || "MEMBER"}-${random}`;
    }
    if (newAcc.referralCredit === undefined) {
      newAcc.referralCredit = newAcc.referredByCode ? 150 : 0;
    }

    setAccounts((prev) => {
      let updated = prev.map((acc) => {
        // If this is the sponsor, update their referral credit balance with +150 FCFA
        if (newAcc.referredByCode && acc.referralCode?.toUpperCase() === newAcc.referredByCode.toUpperCase()) {
          const currentCredit = acc.referralCredit || 0;
          setTimeout(() => {
            triggerToast(`🎉 Parrainage MDB : Le compte de parrain ${acc.name} reçoit une remise de 150 FCFA !`);
          }, 400);
          return {
            ...acc,
            referralCredit: currentCredit + 150
          };
        }
        return acc;
      });

      return [...updated, newAcc];
    });
  };

  const handleDeductReferralCredit = (accountId: string, amount: number) => {
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === accountId) {
          const currentCredit = acc.referralCredit || 0;
          return {
            ...acc,
            referralCredit: Math.max(0, currentCredit - amount)
          };
        }
        return acc;
      })
    );
    setCurrentAccount((current) => {
      if (current && current.id === accountId) {
        const currentCredit = current.referralCredit || 0;
        return {
          ...current,
          referralCredit: Math.max(0, currentCredit - amount)
        };
      }
      return current;
    });
  };

  const submitNewOrder = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
  };

  const handleUpdateOrderStatus = (orderId: string, newStats: Order['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStats } : o))
    );
  };

  const handleAcceptOrder = (orderId: string, livreurId: string, livreurName: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, livreurId, livreurName, status: "delivering" } : o
      )
    );
  };

  const handleSendChatMessage = (orderId: string, senderRole: 'client' | 'livreur' | 'gerant' | 'admin' | 'system', text: string) => {
    const newMsg: ChatMessage = {
      id: "msg-" + Math.random().toString(36).substr(2, 9),
      orderId,
      senderRole,
      text,
      timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    };
    setChatMessages((prev) => [...prev, newMsg]);
  };

  const handleSendGlobalStaffMessage = (
    senderId: string,
    senderName: string,
    senderRole: RoleType,
    text: string,
    recipientRole?: GlobalStaffMessage['recipientRole']
  ) => {
    const newMsg: GlobalStaffMessage = {
      id: "staff-msg-" + Math.random().toString(36).substr(2, 9),
      senderId,
      senderName,
      senderRole,
      recipientRole,
      text,
      timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    };
    setGlobalStaffMessages((prev) => [...prev, newMsg]);
  };

  // Cross-restaurant filter calculation
  const filteredDishesList = useMemo(() => {
    const allDishes: (Dish & { restoName: string; restoId: string })[] = [];
    restaurants.forEach((r) => {
      r.dishes.forEach((d) => {
        allDishes.push({
          ...d,
          restoName: r.name,
          restoId: r.id
        });
      });
    });

    return allDishes.filter((d) => {
      const matchesSearch =
        d.name.toLowerCase().includes(menuSearchQuery.toLowerCase()) ||
        d.description.toLowerCase().includes(menuSearchQuery.toLowerCase()) ||
        d.restoName.toLowerCase().includes(menuSearchQuery.toLowerCase());

      let matchesCategory = true;
      if (menuSelectedCategory === "spag") {
        matchesCategory = d.name.toLowerCase().includes("spaghetti") || d.name.toLowerCase().includes("omelette") || d.name.toLowerCase().includes("pain");
      } else if (menuSelectedCategory === "trad") {
        matchesCategory = d.name.toLowerCase().includes("ndolé") || d.name.toLowerCase().includes("eru") || d.name.toLowerCase().includes("achou") || d.name.toLowerCase().includes("koki") || d.name.toLowerCase().includes("kondré");
      } else if (menuSelectedCategory === "boisson") {
        matchesCategory = d.name.toLowerCase().includes("bouillie") || d.name.toLowerCase().includes("jus") || d.name.toLowerCase().includes("bière");
      }

      const matchesResto = restaurantFilter === "all" || d.restoId === restaurantFilter;

      return matchesSearch && matchesCategory && matchesResto;
    });
  }, [restaurants, menuSearchQuery, menuSelectedCategory, restaurantFilter]);

  return (
    <div className="min-h-screen font-sans bg-brand-cream text-brand-dark selection:bg-brand-mango selection:text-white transition-colors duration-300">
      
      {/* Dynamic Floating Toast Notification */}
      {showNotification && (
        <div id="toast-wrapper" className="fixed bottom-6 right-6 z-50 bg-brand-dark text-brand-cream px-6 py-4 rounded-xl shadow-2xl border-l-4 border-brand-mango flex items-center space-x-3 max-w-sm animate-bounce">
          <span className="text-xl">🌶️</span>
          <p className="text-sm font-medium">{showNotification}</p>
        </div>
      )}

      {/* HEADER / NAVIGATION */}
      <header className="sticky top-0 z-40 bg-brand-cream/95 backdrop-blur-md border-b border-brand-dark/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          <div className="flex items-center space-x-3">
            <div id="app-logo" className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${selectedLogo.color} flex items-center justify-center text-white font-extrabold text-2xl shadow-md rotate-[-3deg] border-2 border-brand-dark transition-all duration-300 overflow-hidden`}>
              {customBrandIcon.startsWith("http") || customBrandIcon.startsWith("data:image/") ? (
                <img src={customBrandIcon} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                customBrandIcon
              )}
            </div>
            <div>
              <span className="font-display font-[950] text-xl tracking-tight text-brand-dark block text-left">
                {customBrandName.split(" ")[0]} <span className="text-brand-mango">{customBrandName.split(" ").slice(1).join(" ") || "Services"}</span>
              </span>
              <span className="text-[10px] font-mono tracking-widest text-[#6B8E4E] uppercase block font-semibold text-left">
                {customBrandSubtitle}
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-6 text-sm font-semibold text-brand-dark/80">
            <a href="#grand-menu-commande-food" className="text-brand-mango hover:text-brand-dark transition-colors flex items-center space-x-1 font-bold">
              <span>{t.menuTitle}</span>
            </a>
            <a href="#etals-marketplace" className="hover:text-brand-mango transition-colors">{t.stallsTitle}</a>
            <a href="#client-order-terminal" className="hover:text-brand-mango transition-colors flex items-center space-x-1">
              <span>{t.workspaceTitle}</span>
            </a>
            <a href="#comment-ca-marche" className="hover:text-brand-mango transition-colors">{t.howItWorks}</a>
            <a href="#temoignages" className="hover:text-brand-mango transition-colors">{t.testimonialsTitle}</a>
          </nav>

          <div className="hidden md:flex items-center space-x-3">
            {/* Quick Language Toggle Button */}
            <button 
              onClick={() => {
                const alternate = currentLang === "fr" ? "en" : "fr";
                setCurrentLang(alternate);
                triggerToast(alternate === "en" ? "🇬🇧 Platform language configured to English!" : "🇫🇷 Langue de la plateforme réglée sur Français !");
              }}
              className="px-2.5 py-1.5 hover:bg-brand-dark/5 rounded-xl border-2 border-brand-dark flex items-center space-x-1 text-xs font-black font-mono cursor-pointer transition-all hover:scale-[1.05]"
              title="Changer de Langue / Toggle Language"
            >
              <Globe size={13} className="text-brand-mango" />
              <span>{currentLang === "fr" ? "FR 🇫🇷" : "EN 🇬🇧"}</span>
            </button>

            {/* General App Settings Modal Toggler */}
            <button 
              onClick={() => setSettingsOpen(true)}
              className="p-1.5 hover:bg-brand-dark/5 rounded-xl border-2 border-brand-dark text-brand-dark hover:text-brand-mango transition-all duration-300 cursor-pointer hover:rotate-45"
              title={t.settingsButton}
            >
              <Settings size={15} />
            </button>

            <div className="text-right">
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#6B8E4E]/10 text-[#6B8E4E] border border-[#6B8E4E]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6B8E4E] animate-pulse"></span>
                <span>{t.activeInCameroon}</span>
              </span>
            </div>
            <a 
              href="#client-order-terminal" 
              className="px-4 py-2 bg-brand-dark text-brand-cream hover:bg-brand-mango hover:text-white rounded-xl text-xs font-black transition-all duration-300 border-2 border-brand-dark shadow-[2px_2px_0px_0px_rgba(26,20,16,1)] font-mono"
            >
              {t.accountsPortal}
            </a>
          </div>

          <div className="md:hidden flex items-center space-x-2">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="p-2 text-brand-dark hover:text-brand-mango transition-colors focus:outline-none"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>

        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-brand-cream border-t border-brand-dark/10 px-4 pt-4 pb-6 space-y-2.5 shadow-lg">
            <a href="#grand-menu-commande-food" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 hover:bg-brand-mango/10 rounded font-bold">🍽️ Menus Camerounais</a>
            <a href="#etals-marketplace" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 hover:bg-brand-mango/10 rounded font-medium">🛍️ Les Étals</a>
            <a href="#client-order-terminal" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 bg-brand-mango/10 text-brand-mango rounded font-bold">🔐 Espace Workspace Comptes</a>
            <a href="#comment-ca-marche" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 hover:bg-brand-mango/10 rounded font-medium">📋 Comment ça marche ?</a>
          </div>
        )}
      </header>

      {/* BRANDING LOGO SWITCH PANEL */}
      <div className="bg-brand-cream border-b border-brand-dark/15 py-3 shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-gray-600">
            <span>🛠️ <strong>Secteur de Marque :</strong> Customisez l'identité de marque MDB :</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {logoOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  setSelectedLogo(opt);
                  setCustomBrandName(opt.textPrefix + " " + opt.textSuffix);
                  setCustomBrandSubtitle(opt.subtitle);
                  setCustomBrandIcon(opt.icon);
                  triggerToast(`Identité visuelle de marque changée pour : ${opt.label} !`);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 border-2 ${
                  selectedLogo.id === opt.id
                    ? 'bg-brand-mango text-white border-brand-dark shadow-[2px_2px_0px_0px_rgba(26,20,16,1)]'
                    : 'bg-white text-brand-dark border-brand-dark/15'
                }`}
              >
                <span>{opt.icon}</span>
                <span>{opt.label.split(" ")[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* WEATHER & TIME CYBERNETIC PANEL */}
      <div className="bg-brand-cream py-1 border-b border-brand-dark/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <WeatherWidget />
        </div>
      </div>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:py-20 border-b border-brand-dark/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 bg-[#6B8E4E]/10 text-[#6B8E4E] px-4 py-1.5 rounded-full text-xs font-bold border border-[#6B8E4E]/20">
                <span>🇨🇲</span>
                <span>{currentLang === "fr" ? "Tradition & Confort Camerounais" : "Cameroonian Tradition & Comfort"}</span>
              </div>

              <h1 className="font-display font-[900] text-4xl sm:text-5xl lg:text-5xl leading-tight text-brand-dark">
                {currentLang === "fr" ? (
                  <>Le vrai goût du Pays : <span className="text-brand-mango">Omelette Spaghetti</span>, Ndolé & poissons braisés !</>
                ) : (
                  <>The real taste of home: <span className="text-brand-mango">Spaghetti & Egg</span>, Royal Ndolé & grilled fish!</>
                )}
              </h1>

              <p className="text-sm sm:text-base text-brand-dark/80 max-w-xl leading-relaxed">
                {currentLang === "fr" ? (
                  <>Retrouvez les cartes réelles des célèbres cafétérias de <strong className="text-brand-dark font-black">Yaoundé</strong> et <strong className="text-brand-dark font-black">Douala</strong>. Payez virtuellement de manière sécurisée en MTN MoMo, Orange Money ou Espèces à la livraison, avec transmission immédiate de votre facture par SMS & Gmail !</>
                ) : (
                  <>Discover the authentic menus of famous cafeterias in <strong className="text-brand-dark font-black">Yaoundé</strong> and <strong className="text-brand-dark font-black">Douala</strong>. Pay securely online via MTN MoMo, Orange Money, or Cash on Delivery (COD) with instant bills delivered via SMS & Gmail!</>
                )}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <a href="#grand-menu-commande-food" className="w-full sm:w-auto px-6 py-3.5 bg-brand-mango text-white hover:bg-brand-dark rounded-xl font-bold text-xs sm:text-sm text-center border-2 border-brand-dark shadow-[4px_4px_0px_0px_rgba(26,20,16,1)]">
                  {currentLang === "fr" ? "🍽️ Voir la carte des Menus" : "🍽️ View Menu Cards"}
                </a>
                <a href="#client-order-terminal" className="w-full sm:w-auto px-6 py-3.5 bg-white text-brand-dark rounded-xl font-bold text-xs sm:text-sm text-center border-2 border-brand-dark">
                  {currentLang === "fr" ? "🔐 Ouvrir mon Espace Comptes" : "🔐 Access My Workspace Accounts"}
                </a>
              </div>
            </div>

            {/* Simulated Mobile Mockup Showcase */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="w-[300px] bg-brand-dark rounded-[38px] p-3 border-4 border-[#1A1410] shadow-[10px_10px_0px_0px_rgba(26,20,16,1)]">
                <div className="bg-white rounded-[28px] overflow-hidden min-h-[440px] flex flex-col justify-between p-3.5 relative">
                  <div className="w-24 h-4.5 bg-brand-dark mx-auto rounded-b-lg flex items-center justify-center space-x-1">
                    <div className="w-1 h-1 rounded-full bg-brand-cream/30"></div>
                  </div>

                  <div className="space-y-3.5 my-4 flex-1">
                    <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg border">
                      <span className="text-[10px] font-bold">📍 Yaoundé Bastos</span>
                      <span className="text-[9px] bg-amber-400 text-brand-dark px-1.5 py-0.2 rounded font-black font-mono">MTN MOMO</span>
                    </div>

                    <div className="bg-brand-cream/40 p-3 rounded-xl border border-brand-dark/10 space-y-1 text-center">
                      <span className="text-xl block">🍳🍲</span>
                      <h4 className="font-bold text-xs text-brand-dark">Omelette Spaghetti Champion</h4>
                      <p className="text-[11px] text-gray-400 font-bold">1 500 FCFA</p>
                    </div>

                    <div className="p-2.5 bg-[#6B8E4E]/10 rounded-lg text-[10px] text-[#6B8E4E] border border-[#6B8E4E]/20">
                      <strong>Livreur "Cédric" en route à moto</strong>
                      <p className="text-[9px] text-gray-500">Sac isotherme scellé</p>
                    </div>
                  </div>

                  <a href="#client-order-terminal" className="w-full py-2.5 bg-[#E8762C] hover:bg-brand-dark text-[#FFF] text-center rounded-xl text-xs font-black border border-brand-dark font-mono">
                    TESTER L'EXPÉRIENCE EN DIRECT
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* THE LIVE MENU STUDIO & LISTING (Live Rates edited by Admin propagate here!) */}
      <section id="grand-menu-commande-food" className="py-16 bg-brand-cream relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-brand-mango text-xs font-mono font-black uppercase tracking-widest block">
              🇨🇲 EXPLOREZ LES CARTES DE NOS MEILLEURES CAFÉTÉRIAS 🇨🇲
            </span>
            <h2 className="font-display font-[900] text-3xl sm:text-4xl text-brand-dark">
              La Grande Carte des Menus <span className="text-brand-mango">Camerounais</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              Parcourez les spécialités locales. Si l'Administrateur met à jour les tarifs ou les clichés dans son espace, les modifications se répercutent en temps réel !
            </p>
          </div>

          {/* Filters controls */}
          <div className="border-4 border-brand-dark bg-white p-5 rounded-2xl shadow-[4px_4px_0px_0px_rgba(26,20,16,1)] space-y-4">
            
            {/* SEARCH ROW WITH VOICE SEARCH INTEGRATION */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-brand-dark/10 pb-4">
              <div className="flex-1 relative flex items-center">
                <input
                  type="text"
                  value={menuSearchQuery}
                  onChange={(e) => setMenuSearchQuery(e.target.value)}
                  placeholder="🔍 Rechercher un plat, une cafétéria, des beignets, omelettes..."
                  className="w-full pl-4 pr-24 py-2 text-xs font-bold rounded-xl border-2 border-brand-dark bg-brand-cream/10 focus:outline-none focus:bg-white transition-colors placeholder:text-gray-400"
                />
                
                {menuSearchQuery && (
                  <button
                    onClick={() => {
                      setMenuSearchQuery("");
                      triggerToast("Filtre de recherche réinitialisé ! 🧹");
                    }}
                    className="absolute right-14 text-[10px] text-gray-400 hover:text-brand-dark font-black select-none pointer-events-auto cursor-pointer"
                    type="button"
                  >
                    Effacer
                  </button>
                )}

                {/* Voice Search web recognition button */}
                <button
                  type="button"
                  onClick={startVoiceSearch}
                  className={`absolute right-1.5 p-1.5 rounded-lg border border-brand-dark flex items-center justify-center cursor-pointer transition-all ${
                    isVoiceListening 
                      ? "bg-red-500 text-white animate-pulse shadow-[1px_1px_0px_rgba(26,20,16,1)]" 
                      : "bg-[#E8762C] text-white hover:bg-brand-dark"
                  }`}
                  title="Recherche vocale (Speech-to-Text)"
                >
                  {isVoiceListening ? (
                    <MicOff size={14} className="animate-bounce" />
                  ) : (
                    <Mic size={14} />
                  )}
                </button>
              </div>

              {/* Status display when listening */}
              {isVoiceListening && (
                <div className="flex items-center space-x-2 bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl self-start md:self-auto animate-pulse flex-shrink-0">
                  <span className="w-2 h-2 rounded-full bg-red-500 block"></span>
                  <span className="text-[10px] text-red-600 font-bold font-mono">Microphone actif. Énoncez un mot !</span>
                </div>
              )}
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex flex-wrap gap-1.5 items-center w-full md:w-auto">
                <button
                  onClick={() => setMenuSelectedCategory("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    menuSelectedCategory === "all" ? 'bg-brand-mango text-white border border-brand-dark shadow-[1px_1px_0px_rgba(26,20,16,1)]' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Tout le Menu
                </button>
                <button
                  onClick={() => setMenuSelectedCategory("spag")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    menuSelectedCategory === "spag" ? 'bg-brand-mango text-white border border-brand-dark shadow-[1px_1px_0px_rgba(26,20,16,1)]' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Cafétéria Spagh/Omelettes
                </button>
                <button
                  onClick={() => setMenuSelectedCategory("trad")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    menuSelectedCategory === "trad" ? 'bg-brand-mango text-white border border-brand-dark shadow-[1px_1px_0px_rgba(26,20,16,1)]' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Grands Plats Traditionnels (Ndolé, Eru)
                </button>
                <button
                  onClick={() => setMenuSelectedCategory("boisson")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    menuSelectedCategory === "boisson" ? 'bg-brand-mango text-white border border-brand-dark shadow-[1px_1px_0px_rgba(26,20,16,1)]' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Bouillies & Boissons
                </button>
              </div>

              {/* Cafeteria filter */}
              <div className="w-full md:w-auto flex items-center space-x-2">
                <span className="text-xs font-bold text-gray-400 font-mono uppercase">Cafétéria:</span>
                <select
                  value={restaurantFilter}
                  onChange={(e) => setRestaurantFilter(e.target.value)}
                  className="p-1.5 text-xs bg-white rounded-lg border-2 border-brand-dark"
                >
                  <option value="all">Toutes</option>
                  {restaurants.map((res) => (
                    <option key={res.id} value={res.id}>{res.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Grid display of dishes with Add To Cart buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {isLoadingMenu ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <motion.div
                  key={`skeleton-card-${idx}`}
                  initial={{ opacity: 0.35 }}
                  animate={{ opacity: [0.35, 0.85, 0.35] }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: idx * 0.1,
                  }}
                  className="bg-white rounded-2xl border-2 border-brand-dark overflow-hidden shadow-[4px_4px_0px_0px_rgba(26,20,16,1)] flex flex-col justify-between min-h-[385px]"
                >
                  <div>
                    {/* Image Skeleton */}
                    <div className="h-44 bg-gray-200 border-b-2 border-brand-dark relative overflow-hidden">
                      {/* Brand Badge Simulation */}
                      <div className="absolute top-2.5 right-2.5 bg-gray-300 w-16 h-4.5 rounded font-mono"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#F2EBE1]/30 to-transparent animate-shimmer" style={{ backgroundSize: "200% 100%" }}></div>
                    </div>
                    {/* Content Skeleton */}
                    <div className="p-4 space-y-3.5">
                      <div className="h-5 bg-gray-200 rounded-md w-3/4"></div>
                      <div className="space-y-2 pt-1">
                        <div className="h-3 bg-gray-200 rounded-md w-full"></div>
                        <div className="h-3 bg-gray-200 rounded-md w-11/12"></div>
                        <div className="h-3 bg-gray-200 rounded-md w-1/2"></div>
                      </div>
                      <div className="h-3 bg-gray-200 rounded-md w-1/3 mt-2"></div>
                    </div>
                  </div>
                  {/* Action Bar Skeleton */}
                  <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="h-5 bg-gray-200 rounded-md w-24"></div>
                    <div className="h-8.5 bg-gray-300 rounded-lg w-32"></div>
                  </div>
                </motion.div>
              ))
            ) : filteredDishesList.length === 0 ? (
              <div className="col-span-full py-12 text-center text-gray-500 text-sm font-bold bg-[#F2EBE1]/40 rounded-xl border border-brand-dark/10">
                🍽️ Aucun plat ne correspond à vos critères de recherche.
              </div>
            ) : (
              filteredDishesList.map((dish) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  key={dish.id} 
                  className="bg-white rounded-2xl border-2 border-brand-dark overflow-hidden shadow-[4px_4px_0px_0px_rgba(26,20,16,1)] hover:translate-y-[-4px] hover:shadow-[6px_6px_0px_0px_rgba(26,20,16,1)] duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="h-44 relative overflow-hidden border-b-2 border-brand-dark">
                      <img src={dish.image} alt={dish.name} className="w-full h-full object-cover" />
                      <span className="absolute top-2.5 right-2.5 bg-brand-dark text-white text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase">
                        {dish.restoName.split(" ")[1] || "Mboa"}
                      </span>
                    </div>
                    
                    <div className="p-4 space-y-2">
                      <h4 className="font-bold text-sm text-brand-dark">{dish.name}</h4>
                      <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-3">{dish.description}</p>
                      <p className="text-xs font-black text-[#6B8E4E] font-mono">
                        🌶️ Épices niveau : {dish.spiciness}/3
                      </p>
                    </div>
                  </div>

                  <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="font-mono text-base font-black text-[#6B8E4E]">
                      {dish.price.toLocaleString()} FCFA
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      onClick={() => addToCart(dish)}
                      className="px-3.5 py-1.5 bg-[#E8762C] text-[#FFF] hover:bg-brand-dark text-xs font-bold rounded-lg border-2 border-brand-dark transition-all cursor-pointer shadow-sm"
                    >
                      + Ajouter au Panier
                    </motion.button>
                  </div>
                </motion.div>
              ))
            )}
          </div>

        </div>
      </section>

      {/* CHOOSE ETALS SECTION (Aesthetic awning stalls representing traditional Cameroonian stands) */}
      <section id="etals-marketplace" className="py-16 bg-[#F2EBE1] border-t-2 border-b-2 border-brand-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[#6B8E4E] text-xs font-extrabold uppercase tracking-widest block">
              🛍️ LE MARCHÉ LOGISTIQUE DE YAOUNDÉ & DOUALA 🛍️
            </span>
            <h2 className="font-display font-black text-3xl text-brand-dark">
              Visitez les Étals de nos <span className="text-brand-mango">Restaurants</span>
            </h2>
            <p className="text-xs text-gray-500">
              Commandez de l'Achou à Yaoundé Essos ou du Ndolé de Deido. Nos livreurs disposent de grands sacs thermiques scellés.
            </p>
          </div>

          {/* HORLOGE ET CONTRÔLE DE L'HEURE FICTIVE INTÉGRÉ EN HAUT DU MARCHÉ */}
          <div className="max-w-xl mx-auto bg-white p-4 rounded-2xl border-2 border-brand-dark shadow-[4px_4px_0px_0px_rgba(26,20,16,1)] space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-black text-[#E8762C] uppercase tracking-wider block">🕰️ CRÉNEAU HORAIRE SIMULÉ</span>
                <span className="text-xs font-bold text-gray-500 leading-snug block">
                  Ajustez l'heure fictive pour voir si les étals sont ouverts ou fermés en temps réel !
                </span>
              </div>
              <div className="bg-brand-dark text-white px-4 py-2 rounded-xl text-center border-2 border-brand-mango flex items-center space-x-2 flex-shrink-0 shadow-[2px_2px_0px_rgba(26,20,16,1)]">
                <span className="text-xs font-mono text-brand-mango font-black uppercase">Simulateur :</span>
                <span className="font-mono text-xs font-black text-[#6B8E4E]">{fictionalHour.toString().padStart(2, '0')}h00</span>
              </div>
            </div>

            {/* Slider Range */}
            <div className="flex items-center space-x-3.5">
              <span className="text-[10px] font-mono font-bold text-gray-400">0h</span>
              <input
                type="range"
                min="0"
                max="23"
                value={fictionalHour}
                onChange={(e) => setFictionalHour(parseInt(e.target.value, 10))}
                className="flex-1 accent-brand-mango h-2 bg-gray-200 rounded-lg cursor-pointer border border-brand-dark/10"
              />
              <span className="text-[10px] font-mono font-bold text-gray-400">23h</span>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-5 gap-1.5 pt-1">
              {[
                { label: "Matin (08h)", value: 8 },
                { label: "Midi (13h)", value: 13 },
                { label: "Tard (17h)", value: 17 },
                { label: "Soir (20h)", value: 20 },
                { label: "Nuit (23h)", value: 23 },
              ].map((p) => {
                const isSelected = fictionalHour === p.value;
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => {
                      setFictionalHour(p.value);
                      triggerToast(`Heure fictive ajustée à ${p.value}h00 ! 🕰️`);
                    }}
                    className={`py-1 text-[9px] font-black rounded-lg transition-all border cursor-pointer ${
                      isSelected
                        ? "bg-brand-mango text-white border-brand-dark shadow-[1.5px_1.5px_0px_rgba(26,20,16,1)] font-extrabold"
                        : "bg-gray-50 text-brand-dark border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {restaurants.map((resto) => (
              <motion.div 
                key={resto.id} 
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 350, damping: 20 }}
                className="bg-white rounded-t-3xl rounded-b-xl border-2 border-brand-dark shadow-[4px_4px_0px_0px_rgba(26,20,16,1)] overflow-hidden flex flex-col justify-between cyber-card-glow-hover"
              >
                {/* Awning Canvas Strips representing market stalls */}
                <div className="h-8 relative flex overflow-hidden border-b-2 border-brand-dark">
                  <div className="absolute inset-0 flex">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                      <div 
                        key={i} 
                        className={`flex-1 h-full ${i % 2 === 0 ? 'bg-white' : 'bg-brand-mango'}`} 
                      />
                    ))}
                  </div>
                  <div className="absolute bottom-0 left-0 w-full flex">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                      <div 
                        key={i} 
                        className={`flex-1 h-1.5 rounded-b-full ${i % 2 === 0 ? 'bg-brand-mango' : 'bg-white'}`} 
                      />
                    ))}
                  </div>
                </div>

                {resto.image && (
                  <div className="h-32 w-full overflow-hidden border-b-2 border-brand-dark relative">
                    <img 
                      src={resto.image} 
                      alt={resto.name} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 bg-[#6B8E4E] text-white text-[9.5px] font-mono px-2 py-0.5 rounded font-black uppercase shadow-md">
                      🏍️ {resto.deliveryTime}
                    </div>
                  </div>
                )}

                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center space-x-1 text-xs text-amber-500 font-bold">
                        <Star size={12} fill="currentColor" />
                        <span>{resto.rating} ({resto.commune})</span>
                      </span>

                      {/* STATUT DYNAMIQUE OUVERT / FERMÉ DE L'ÉTAL */}
                      {(() => {
                        const { isOpen } = getRestaurantStatus(resto.id, fictionalHour);
                        return (
                          <span className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border transition-all ${
                            isOpen 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : 'bg-gray-100 text-gray-500 border-gray-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                            <span>{isOpen ? 'Ouvert' : 'Fermé'}</span>
                          </span>
                        );
                      })()}
                    </div>

                    <h4 className="font-display font-black text-lg text-brand-dark leading-none">{resto.name}</h4>
                    <p className="text-[11px] text-gray-400 font-bold leading-tight">{resto.specialty}</p>

                    {/* HORAIRES ACCOMPAGNATEURS */}
                    {(() => {
                      const { isOpen, scheduleText } = getRestaurantStatus(resto.id, fictionalHour);
                      return (
                        <div className="flex items-center space-x-1 text-[9.5px] font-mono font-bold text-gray-500 pt-0.5">
                          <span>⏰ Service : {scheduleText}</span>
                          <span className={isOpen ? 'text-emerald-600' : 'text-gray-400'}>•</span>
                          <span className={isOpen ? 'text-emerald-600' : 'text-gray-400'}>
                            {isOpen ? 'Service Actif ✓' : 'Fermé 💤'}
                          </span>
                        </div>
                      );
                    })()}

                    {/* ESTIMATED WAIT TIME & QUEUE BACKLOG COMPONENT */}
                    {(() => {
                      const { isOpen } = getRestaurantStatus(resto.id, fictionalHour);
                      const { minutes, loadText, loadClass, progressWidth, progressColor, description } = getEstimatedWaitTimeAndLoad(resto.id, fictionalHour, isOpen);

                      return (
                        <div className="mt-3.5 bg-brand-cream/50 p-3 rounded-2xl border-2 border-brand-dark space-y-2.5 shadow-[2px_2px_0px_rgba(26,20,16,1)]">
                          <div className="flex items-center justify-between">
                            <span className="text-[9.5px] uppercase font-mono tracking-wider font-extrabold text-gray-500 flex items-center gap-1">
                              ⏱️ Temps de Prep'
                            </span>
                            <span className={`text-[8.5px] font-mono font-black uppercase px-2 py-0.5 rounded border transition-colors ${loadClass}`}>
                              {loadText}
                            </span>
                          </div>

                          <div className="flex items-baseline space-x-1">
                            <span className="text-xl font-display font-black text-brand-dark leading-none">
                              {minutes}
                            </span>
                            {isOpen && (
                              <span className="text-[10px] font-bold text-gray-400 font-mono">est.</span>
                            )}
                          </div>

                          {/* Progress bar and text helper */}
                          {isOpen ? (
                            <div className="space-y-1.5">
                              <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden border border-brand-dark/10">
                                <div 
                                  style={{ width: progressWidth }} 
                                  className={`h-full ${progressColor} transition-all duration-500`}
                                />
                              </div>
                              <p className="text-[9.5px] text-gray-500 font-bold leading-tight flex items-center gap-1">
                                <span>🗣️</span> <span className="italic">{description}</span>
                              </p>
                            </div>
                          ) : (
                            <p className="text-[9.5px] text-gray-450 font-bold leading-snug">
                              💤 Les fourneaux sont éteints. Revenez pendant les heures de service !
                            </p>
                          )}
                        </div>
                      );
                    })()}

                    <div className="border-t border-dashed border-gray-150 pt-2 mt-2">
                      <p className="text-[9px] uppercase font-mono tracking-wider font-bold text-gray-400">🔥 Recommandations :</p>
                      <ul className="space-y-1">
                        {resto.dishes.map((d) => (
                          <li key={d.id} className="text-xs flex justify-between">
                            <span className="truncate">{d.name}</span>
                            <span className="font-mono font-bold text-[#6B8E4E]">{d.price} F</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <a 
                    href="#grand-menu-commande-food" 
                    className="w-full py-2 bg-brand-cream hover:bg-brand-mango text-brand-dark hover:text-white rounded border-2 border-brand-dark text-center text-xs font-bold block"
                  >
                    Voir l'Étal complet
                  </a>
                </div>

              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* THE CONSOLE HUB INTERACTION: REGISTER, CHOOSE ROLES, DISPATCH WORKSPACES */}
      <section id="client-order-terminal" className="py-16 bg-brand-dark relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-brand-mango text-xs font-mono font-black uppercase tracking-widest block bg-white/5 py-1 px-4 rounded-full inline-block">
              🔐 ACCÈS SÉCURISÉ & ESPACES PROFESSIONNELS MULTI-ROLES 🔐
            </span>
            <h2 className="font-display font-[920] text-3xl sm:text-4xl text-white">
              Espace Interactive <span className="text-brand-mango">Multi-Rôles MDB</span>
            </h2>
            <p className="text-xs sm:text-sm text-brand-cream/70">
              Inscrivez-vous en Client, ou connectez-vous comme Gérant, Livreur ou Administrateur. Ouvrez les formulaires, testez toutes les interfaces de coordination !
            </p>
          </div>

          {/* Core Login/Registration & OTP Code confirmations Console */}
          <AccountConsole
            currentAccount={currentAccount}
            accounts={accounts}
            restaurants={restaurants}
            onSelectAccount={setCurrentAccount}
            onRegisterAccount={registerNewAccount}
            triggerToast={triggerToast}
          />

          {/* DYNAMIC WORKSPACES ACCORDING TO ROLE TYPE */}
          <div className="pt-6">
            
            {/* 1. VISITOR / GUEST SCREEN (Non-authenticated workspace) */}
            {currentAccount === null && (
              <div className="bg-white p-8 rounded-2xl border-2 border-brand-dark text-center space-y-4">
                <span className="text-5xl">🧭</span>
                <h3 className="font-display font-black text-xl text-brand-dark">Prêt à tester l'application ?</h3>
                <p className="text-xs text-gray-500 max-w-lg mx-auto leading-normal">
                  Veuillez cliquer sur un profil actif ci-dessus (par exemple : le <strong>Client Marc</strong> pour passer votre commande, le <strong>Gérant Tantie Ndolé</strong> pour allumer le feu de cuisine, le <strong>Livreur Cédric</strong> pour démarrer la moto, ou l'<strong>Administrateur</strong> pour réguler les prix).
                </p>
              </div>
            )}

            {/* 2. CLIENT WORKSPACE */}
            {currentAccount && currentAccount.role === "client" && (
              <ClientWorkspace
                currentAccount={currentAccount}
                cart={cart}
                communes={communes}
                selectedCommune={selectedCommune}
                paymentProvider={paymentProvider}
                simulatedMobileNumber={simulatedMobileNumber}
                deliveryAddress={deliveryAddress}
                orders={orders}
                chatMessages={chatMessages}
                orangeMoneyNumber={orangeMoneyNumber}
                mtnMoneyNumber={mtnMoneyNumber}
                waveMoneyNumber={waveMoneyNumber}
                onSetSelectedCommune={setSelectedCommune}
                onSetPaymentProvider={setPaymentProvider}
                onSetSimulatedMobileNumber={setSimulatedMobileNumber}
                onSetDeliveryAddress={setDeliveryAddress}
                onAddToCart={addToCart}
                onRemoveFromCart={removeFromCart}
                onClearCart={clearCart}
                onSubmitOrder={submitNewOrder}
                onSendChatMessage={handleSendChatMessage}
                onDeductReferralCredit={handleDeductReferralCredit}
                triggerToast={triggerToast}
              />
            )}

            {/* 3. LIVREUR WORKSPACE */}
            {currentAccount && currentAccount.role === "livreur" && (
              <LivreurWorkspace
                currentAccount={currentAccount}
                orders={orders}
                chatMessages={chatMessages}
                globalStaffMessages={globalStaffMessages}
                onAcceptOrder={handleAcceptOrder}
                onUpdateOrderStatus={handleUpdateOrderStatus}
                onSendChatMessage={handleSendChatMessage}
                onSendGlobalStaffMessage={handleSendGlobalStaffMessage}
                triggerToast={triggerToast}
              />
            )}

            {/* 4. GÉRANT WORKSPACE */}
            {currentAccount && currentAccount.role === "gerant" && (
              <GerantWorkspace
                currentAccount={currentAccount}
                orders={orders}
                restaurants={restaurants}
                chatMessages={chatMessages}
                globalStaffMessages={globalStaffMessages}
                onUpdateOrderStatus={handleUpdateOrderStatus}
                onSendChatMessage={handleSendChatMessage}
                onSendGlobalStaffMessage={handleSendGlobalStaffMessage}
                onAddDish={handleAddNewDish}
                onModifyDish={modifyDishDetails}
                triggerToast={triggerToast}
              />
            )}

            {/* 5. ADMINISTRATEUR WORKSPACE */}
            {currentAccount && currentAccount.role === "admin" && (
              <AdminWorkspace
                currentAccount={currentAccount}
                orders={orders}
                restaurants={restaurants}
                accounts={accounts}
                globalStaffMessages={globalStaffMessages}
                customBrandName={customBrandName}
                customBrandSubtitle={customBrandSubtitle}
                customBrandIcon={customBrandIcon}
                orangeMoneyNumber={orangeMoneyNumber}
                mtnMoneyNumber={mtnMoneyNumber}
                waveMoneyNumber={waveMoneyNumber}
                contactWhatsApp={contactWhatsApp}
                contactFacebook={contactFacebook}
                contactEmail={contactEmail}
                onSetCustomBrandName={setCustomBrandName}
                onSetCustomBrandSubtitle={setCustomBrandSubtitle}
                onSetCustomBrandIcon={setCustomBrandIcon}
                onSetOrangeMoneyNumber={setOrangeMoneyNumber}
                onSetMtnMoneyNumber={setMtnMoneyNumber}
                onSetWaveMoneyNumber={setWaveMoneyNumber}
                onSetContactWhatsApp={setContactWhatsApp}
                onSetContactFacebook={setContactFacebook}
                onSetContactEmail={setContactEmail}
                onModifyDish={modifyDishDetails}
                onModifyRestaurant={modifyRestaurantDetails}
                onRegisterStaff={registerNewAccount}
                onSendGlobalStaffMessage={handleSendGlobalStaffMessage}
                triggerToast={triggerToast}
              />
            )}

          </div>

        </div>
      </section>

      {/* THREE STEPS BLOCK: COMMENT ÇA MARCHE */}
      <section id="comment-ca-marche" className="py-16 bg-brand-cream relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <span className="text-[#6B8E4E] text-xs font-bold uppercase tracking-widest block">🛵 Expérience Simplifiée 🛵</span>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-brand-dark">Votre repas du Pays en <span className="text-brand-mango">3 Étapes simples</span></h2>
            <p className="text-xs sm:text-sm text-gray-500">MDB a supprimé tout tracas logistique au Cameroun.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs relative">
            <div className="hidden md:block absolute top-1/3 left-1/4 right-1/4 h-0.5 border-t border-dashed border-brand-dark z-0"></div>

            <div className="bg-white p-5 rounded-2xl border-2 border-brand-dark shadow-[4px_4px_0px_0px_rgba(26,20,16,1)] relative z-10 space-y-3">
              <span className="w-10 h-10 rounded-xl bg-[#E8762C] hover:bg-brand-dark text-white font-black text-sm flex items-center justify-center border-2 border-brand-dark">1</span>
              <h3 className="font-display font-extrabold text-[#1A1410] text-sm">Sélectionnez la Cafétéria</h3>
              <p className="text-gray-500 leading-relaxed">Parcourez les étals de nos partenaires : du koki vapeur du grand ouest au poisson bar fraichement préparé aux épices locales.</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border-2 border-brand-dark shadow-[4px_4px_0px_0px_rgba(26,20,16,1)] relative z-10 space-y-3">
              <span className="w-10 h-10 rounded-xl bg-[#6B8E4E] text-white font-black text-sm flex items-center justify-center border-2 border-brand-dark">2</span>
              <h3 className="font-display font-extrabold text-[#1A1410] text-sm">Déposez GPS & OTP</h3>
              <p className="text-gray-500 leading-relaxed">Entrez vos coordonnées GPS en un clic pour que le motard vous trouve facilement, puis réglez en Cash (Express) ou Mobile Money.</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border-2 border-brand-dark shadow-[4px_4px_0px_0px_rgba(26,20,16,1)] relative z-10 space-y-3">
              <span className="w-10 h-10 rounded-xl bg-brand-dark text-white font-black text-sm flex items-center justify-center border-2 border-brand-dark">3</span>
              <h3 className="font-display font-extrabold text-[#1A1410] text-sm">Savourez chaud !</h3>
              <p className="text-gray-500 leading-relaxed">Suivez par satellite la moto et recevez instantanément la facture d'acquittement PDF transmise via Gmail et SMS.</p>
            </div>
          </div>

        </div>
      </section>

      {/* RATING & REVIEWS */}
      <section id="temoignages" className="py-16 bg-[#F2EBE1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-brand-mango text-xs font-mono font-black uppercase tracking-widest block font-bold">★ L'OPINION DES CLIENTS ★</span>
            <h2 className="font-display font-black text-3xl text-brand-dark">L'avis de la Famille Camerounaise</h2>
            <p className="text-xs text-gray-400">Pourquoi MDB est le service de livraison le plus apprécié par les habitants.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.id} className="bg-white p-5 rounded-xl border-2 border-brand-dark shadow-[3px_3px_0px_0px_rgba(26,20,16,1)] flex flex-col justify-between">
                <p className="text-xs sm:text-xs text-gray-500 italic leading-relaxed">"{t.comment}"</p>
                
                <div className="flex items-center space-x-3 pt-4 mt-4 border-t">
                  <span className="text-2xl">{t.avatar}</span>
                  <div>
                    <span className="font-extrabold text-xs block text-brand-dark">{t.name}</span>
                    <span className="text-[10px] text-gray-400 block">{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-16 bg-brand-dark text-brand-cream relative border-t-2 border-brand-dark">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center space-y-3">
            <span className="text-brand-mango text-xs font-bold uppercase tracking-widest block bg-white/5 py-1 px-4 rounded-full inline-block font-mono">ASSISTANCE & REASSURANCE</span>
            <h2 className="font-display font-[900] text-3xl text-white">Foire aux Questions (MDB Cameroun)</h2>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full text-left p-5 flex justify-between items-center font-bold text-xs sm:text-sm text-white hover:text-brand-mango transition-colors"
                  >
                    <span>{faq.question}</span>
                    <span className={`transform transition-transform text-brand-mango ${isOpen ? 'rotate-180' : ''}`}>
                      <ChevronDown size={16} />
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-brand-cream/80 border-t border-white/5 bg-white/[0.01]">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* CONTACT SECTION (WhatsApp, Facebook, Email) */}
      <section id="contact-nous" className="py-12 bg-[#1E1915] text-white border-t-2 border-brand-dark/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left items-center">
            <div className="space-y-2">
              <span className="text-brand-mango font-bold text-xs uppercase font-mono tracking-widest block bg-white/5 py-1 px-4 rounded-full inline-block">💬 NOUS CONTACTER</span>
              <h3 className="font-display font-[900] text-xl text-brand-cream">Service Client MDB RESTAURANT</h3>
              <p className="text-[11px] text-brand-cream/60 leading-relaxed">
                Notre assistance technique nationale est disponible 7j/7 pour vous accompagner dans vos commandes et livraisons de repas à Yaoundé et Douala.
              </p>
            </div>

            {/* Coordinates Grid */}
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6 md:pl-8">
              
              {/* WhatsApp */}
              {contactWhatsApp && (
                <a 
                  href={`https://wa.me/${contactWhatsApp.replace(/[^\d+]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 p-4 rounded-xl flex flex-col items-center text-center space-y-2.5 transition-all group scale-100 hover:scale-[1.03]"
                >
                  <div className="w-10 h-10 bg-[#25D366] rounded-full flex items-center justify-center text-white text-lg shadow-sm">
                    {/* SVG logo for WhatsApp */}
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.5-5.739-1.446L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.03-5.114-2.906-6.99C16.452 1.889 13.98 .857 11.34.857 5.914.857 1.496 5.275 1.492 10.7c-.001 1.696.446 3.354 1.295 4.809L1.75 19.86l4.42-1.159c1.467.8 2.9.2 2.9.2z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wide">WhatsApp</span>
                    <span className="text-xs font-mono font-black text-[#25D366] underline">{contactWhatsApp}</span>
                  </div>
                </a>
              )}

              {/* Facebook */}
              {contactFacebook && (
                <a 
                  href={contactFacebook}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30 p-4 rounded-xl flex flex-col items-center text-center space-y-2.5 transition-all group scale-100 hover:scale-[1.03]"
                >
                  <div className="w-10 h-10 bg-[#1877F2] rounded-full flex items-center justify-center text-white text-lg shadow-sm">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wide">Facebook</span>
                    <span className="text-xs font-mono font-black text-[#1877F2] truncate max-w-[120px] block underline">Visiter la page</span>
                  </div>
                </a>
              )}

              {/* Email */}
              {contactEmail && (
                <a 
                  href={`mailto:${contactEmail}`}
                  className="bg-[#E8762C]/10 hover:bg-[#E8762C]/20 border border-[#E8762C]/30 p-4 rounded-xl flex flex-col items-center text-center space-y-2.5 transition-all group scale-100 hover:scale-[1.03]"
                >
                  <div className="w-10 h-10 bg-[#E8762C] rounded-full flex items-center justify-center text-white text-lg shadow-sm">
                    <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                      <rect x="3" y="4" width="18" height="16" rx="2" />
                      <path d="m21 4-9 8-9-8" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wide">E-mail central</span>
                    <span className="text-[10.5px] font-mono font-bold text-[#E8762C] truncate max-w-[140px] block underline">{contactEmail}</span>
                  </div>
                </a>
              )}

            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#1A1410] text-brand-cream/60 py-12 border-t border-white/10 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-center">
          <span className="font-display font-extrabold text-white text-lg block">
            MDB <span className="text-brand-mango">RESTAURANT DELIVERY</span>
          </span>
          <p className="text-[10px] text-brand-cream/50 max-w-sm mx-auto">
            Plateforme nationale de livraison de repas de cafétérias à domicile et au bureau à Yaoundé et Douala.
          </p>
          <div className="text-[9px] text-brand-cream/40 border-t border-white/5 pt-4">
            &copy; 2026 MDB RESTAURANT DELIVERY. Tous droits réservés. L'archivage de CNI et validation OTP protège les clients et livreurs.
          </div>
        </div>
      </footer>

      {/* PROFESSIONAL MULTILINGUAL OPTIONS & SETTINGS MODAL */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-md bg-brand-cream rounded-3xl border-2 border-brand-dark shadow-[8px_8px_0px_0px_rgba(26,20,16,1)] overflow-hidden">
            <div className="bg-brand-dark text-white p-5 flex items-center justify-between">
              <span className="font-display font-[900] text-sm tracking-wider uppercase flex items-center space-x-1.5">
                <Settings size={16} className="text-brand-mango animate-spin-slow" />
                <span>{t.settingsPanelTitle}</span>
              </span>
              <button 
                onClick={() => setSettingsOpen(false)}
                className="p-1 hover:bg-white/15 rounded-lg text-brand-cream transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Language Selector block */}
              <div className="space-y-2">
                <label className="text-xs font-black text-brand-dark block uppercase tracking-wide flex items-center space-x-1.5">
                  <Globe size={14} className="text-[#6B8E4E]" />
                  <span>{t.selectLanguage}</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentLang("fr");
                      triggerToast("🇫🇷 Langue réglée sur Français !");
                    }}
                    className={`p-4 rounded-2xl border-2 font-bold text-xs flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                      currentLang === "fr" 
                        ? "bg-brand-dark text-white border-brand-dark shadow-sm" 
                        : "bg-white text-gray-600 border-gray-200 hover:border-brand-dark"
                    }`}
                  >
                    <span className="text-xl">🇫🇷</span>
                    <span>Français (FR)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCurrentLang("en");
                      triggerToast("🇬🇧 Configured to English!");
                    }}
                    className={`p-4 rounded-2xl border-2 font-bold text-xs flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                      currentLang === "en" 
                        ? "bg-brand-dark text-white border-brand-dark shadow-sm" 
                        : "bg-white text-gray-600 border-gray-200 hover:border-brand-dark"
                    }`}
                  >
                    <span className="text-xl">🇬🇧</span>
                    <span>English (EN)</span>
                  </button>
                </div>
              </div>

              {/* Status / Quick info specs */}
              <div className="bg-white p-4 rounded-2xl border border-brand-dark/10 text-[10px] text-gray-500 space-y-1">
                <span className="font-bold text-brand-dark block uppercase tracking-wider font-mono">ℹ️ INFOS SYSTÈME MDB</span>
                <p>Status: <span className="text-emerald-600 font-extrabold">• Opérationnel Cameroun</span></p>
                <p>Version: 1.4 Cyber Future</p>
                <p>Mode: Cash On Delivery & Mobile Money actif</p>
              </div>
            </div>

            <div className="p-4 bg-brand-cream/60 border-t border-brand-dark/10 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setSettingsOpen(false);
                  triggerToast("✓ " + t.settingsSaved);
                }}
                className="px-5 py-2.5 bg-brand-mango hover:bg-brand-dark text-white rounded-xl text-xs font-black shadow-md border-2 border-brand-dark cursor-pointer font-mono"
              >
                <span>Fermer / Close</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
