import React, { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingBag, MapPin, CreditCard, ChevronDown, Check, Download, ArrowRight, ShieldCheck, Mail, MessageSquare, Phone, X, AlertCircle } from "lucide-react";
import { Dish, Commune } from "../data";
import { GPSCoords, OrderItem, Order, ChatMessage, Account } from "../types";

interface ClientWorkspaceProps {
  currentAccount: Account | null;
  cart: { dish: Dish; quantity: number }[];
  communes: Commune[];
  selectedCommune: Commune;
  paymentProvider: "wave" | "orange" | "mtn" | "cash";
  simulatedMobileNumber: string;
  deliveryAddress: string;
  orders: Order[];
  chatMessages: ChatMessage[];
  orangeMoneyNumber: string;
  mtnMoneyNumber: string;
  waveMoneyNumber: string;
  onSetSelectedCommune: (commune: Commune) => void;
  onSetPaymentProvider: (provider: "wave" | "orange" | "mtn" | "cash") => void;
  onSetSimulatedMobileNumber: (num: string) => void;
  onSetDeliveryAddress: (addr: string) => void;
  onAddToCart: (dish: Dish) => void;
  onRemoveFromCart: (dishId: string) => void;
  onClearCart: (msg?: string) => void;
  onSubmitOrder: (newOrder: Order) => void;
  onSendChatMessage: (orderId: string, senderRole: 'client' | 'livreur' | 'gerant' | 'admin' | 'system', text: string) => void;
  onDeductReferralCredit?: (accountId: string, amount: number) => void;
  triggerToast: (msg: string) => void;
}

// Interactive custom mock GPS map tracker for delivering orders
function MockLiveRouteMap({ order, triggerToast }: { order: Order; triggerToast: (msg: string) => void }) {
  const [progress, setProgress] = useState(35);
  const [isTurbo, setIsTurbo] = useState(false);
  const [hornPulse, setHornPulse] = useState(false);
  const [viewMode, setViewMode] = useState<'standard' | 'sat'>('standard');
  const [currentSpeech, setCurrentSpeech] = useState("En route ! Les spaghettis sont bien au chaud dans le caisson isotherme.");

  // Let's increment progress automatically for the delivering state animation
  useEffect(() => {
    const delay = isTurbo ? 250 : 700;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 0; // restarts at the restaurant for infinite live simulation
        }
        return prev + 2;
      });
    }, delay);

    return () => clearInterval(interval);
  }, [isTurbo]);

  const triggerHorn = () => {
    setHornPulse(true);
    triggerToast("📣 POUT-POUT ! Signal sonore envoyé ! Le motard a klaxonné pour écarter les piétons.");
    setTimeout(() => setHornPulse(false), 900);
  };

  // Interpolate coordinates
  // Resto coordinate simulated: Yaoundé Bastos Centre (3.8851, 11.5032) or Douala Akwa
  const isDouala = order.clientCoords?.label?.includes("Douala") || order.clientName.toLowerCase().includes("douala") || false;
  
  const restoLat = isDouala ? 4.0482 : 3.8851;
  const restoLng = isDouala ? 9.7021 : 11.5032;

  const destLat = order.clientCoords?.lat || (isDouala ? 4.0620 : 3.8660);
  const destLng = order.clientCoords?.lng || (isDouala ? 9.6890 : 11.5220);

  const currentLat = restoLat + (destLat - restoLat) * (progress / 100);
  const currentLng = restoLng + (destLng - restoLng) * (progress / 100);

  // Bezier movement path calculation
  const t = progress / 100;
  // Let's define the SVG path dimensions: width is 360, height is 160
  // Quadratic bezier coordinates: P0 (Start) -> P1 (Control) -> P2 (End)
  const p0 = { x: 30, y: 120 };
  const p1 = { x: 180, y: 20 };
  const p2 = { x: 320, y: 110 };

  const bikeX = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
  const bikeY = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;

  // Dynamic state message based on progress
  useEffect(() => {
    if (progress < 25) {
      setCurrentSpeech("🚦 Démarrage immédiat. Sortie rapide de la zone du restaurant.");
    } else if (progress >= 25 && progress < 50) {
      setCurrentSpeech("🏍️ Vitesse maximale sur la grande avenue. Slalom parfait entre les taxis jaunes.");
    } else if (progress >= 50 && progress < 75) {
      setCurrentSpeech("🚧 Contournement d'un ralentissement au rond-point central de la commune.");
    } else if (progress >= 75 && progress < 95) {
      setCurrentSpeech("🏡 Entrée dans votre rue. Recherche active de la plaque de concession.");
    } else {
      setCurrentSpeech("🏁 Arrivée imminente de votre motard MDB ! Soyez prêt à déguster le colis chaud.");
    }
  }, [progress]);

  return (
    <div className="bg-[#FAF3EB] p-4 rounded-xl border-2 border-brand-dark space-y-3.5 shadow-[4px_4px_0px_0px_rgba(26,20,16,1)] text-left">
      {/* Mini Title bar with Live connection indicator */}
      <div className="flex justify-between items-center bg-white px-2.5 py-1.5 rounded-lg border border-brand-dark/10">
        <div className="flex items-center space-x-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6B8E4E] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#6B8E4E]"></span>
          </span>
          <span className="text-[10px] font-mono font-black text-brand-dark tracking-wide uppercase">
            🗺️ SUIVI GPS EN DIRECT MDB CAMEROUN ({isDouala ? "Douala" : "Yaoundé"})
          </span>
        </div>
        <div className="flex items-center space-x-1.5">
          <button 
            type="button"
            onClick={() => setViewMode(v => v === 'standard' ? 'sat' : 'standard')}
            className="text-[9px] font-black uppercase font-mono px-2 py-0.5 rounded border border-brand-dark bg-gray-50 hover:bg-gray-100 cursor-pointer"
          >
            🛰️ {viewMode === 'standard' ? 'Vue Satellite' : 'Vue Standard'}
          </button>
        </div>
      </div>

      {/* Actual map box */}
      <div className={`relative h-44 rounded-xl overflow-hidden border-2 border-brand-dark transition-colors duration-500 ${
        viewMode === 'sat' ? 'bg-[#0f172a]' : 'bg-[#FAF6F0]'
      }`}>
        {/* Radar grids of GPS mapping */}
        <div className="absolute inset-0 opacity-12 pointer-events-none" style={{
          backgroundImage: "radial-gradient(circle, #E8762C 1px, transparent 1px)",
          backgroundSize: "16px 16px"
        }} />

        {/* Landmark descriptions */}
        <div className={`absolute top-4 left-24 text-[8px] font-mono font-bold select-none transition-colors ${
          viewMode === 'sat' ? 'text-slate-400' : 'text-gray-400'
        }`}>
          {isDouala ? "📍 Rond-Point Deido" : "📍 Boulevard de l'Indépendance"}
        </div>
        <div className={`absolute bottom-6 left-32 text-[8px] font-mono font-bold select-none transition-colors ${
          viewMode === 'sat' ? 'text-slate-400' : 'text-gray-400'
        }`}>
          {isDouala ? "🚦 Feux Rouges Akwa" : "🚦 Carrefour Bastos"}
        </div>
        <div className={`absolute top-8 right-16 text-[8px] font-mono font-bold select-none transition-colors ${
          viewMode === 'sat' ? 'text-slate-400' : 'text-gray-400'
        }`}>
          {isDouala ? "🏢 Bonapriso" : "📍 Palais des Congrès"}
        </div>

        {/* SVG Drawing of roads, route trajectory, start/end markers & bike */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E8762C" />
              <stop offset="100%" stopColor="#6B8E4E" />
            </linearGradient>
          </defs>

          {/* Fictional surrounding highway lines */}
          <line x1="10" y1="50" x2="350" y2="50" stroke={viewMode === 'sat' ? '#1e293b' : '#eae5da'} strokeWidth="4" />
          <line x1="50" y1="10" x2="50" y2="150" stroke={viewMode === 'sat' ? '#1e293b' : '#eae5da'} strokeWidth="4" />
          <line x1="310" y1="10" x2="310" y2="150" stroke={viewMode === 'sat' ? '#1e293b' : '#eae5da'} strokeWidth="4" />

          {/* Main Delivery curve path */}
          <path
            d={`M ${p0.x} ${p0.y} Q ${p1.x} ${p1.y}, ${p2.x} ${p2.y}`}
            fill="none"
            stroke="url(#routeGrad)"
            strokeWidth="4"
            className="opacity-40"
          />
          <path
            d={`M ${p0.x} ${p0.y} Q ${p1.x} ${p1.y}, ${p2.x} ${p2.y}`}
            fill="none"
            stroke="url(#routeGrad)"
            strokeWidth="3.5"
            strokeDasharray="6,4"
          />

          {/* Start Point (Restaurant) */}
          <circle cx={p0.x} cy={p0.y} r="8" fill="#E8762C" stroke="#1A1410" strokeWidth="2" className="animate-pulse" />
          
          {/* End Point (Client's building) */}
          <circle cx={p2.x} cy={p2.y} r="8" fill="#6B8E4E" stroke="#1A1410" strokeWidth="2" />
        </svg>

        {/* Interactive icons placed as absolute nodes on top of SVG layout */}
        <div className="absolute text-xs" style={{ left: p0.x - 12, top: p0.y - 28 }}>
          <span className="p-1 px-1.5 bg-[#FAF3EB] text-[9px] font-black rounded border border-brand-dark shadow-[1px_1px_0px_rgba(0,0,0,1)] uppercase">
            🏪 {order.restaurantName.substring(0, 10)}...
          </span>
        </div>

        <div className="absolute text-xs" style={{ left: p2.x - 14, top: p2.y - 28 }}>
          <span className="p-1 px-1.5 bg-[#FAF3EB] text-[9px] font-black rounded border border-brand-dark shadow-[1px_1px_0px_rgba(0,0,0,1)] uppercase">
            🏠 Chez Vous
          </span>
        </div>

        {/* Dynamic moving bike icon container */}
        <motion.div 
          className="absolute z-10 select-none cursor-pointer text-base"
          style={{ left: bikeX - 16, top: bikeY - 14 }}
          animate={{ scale: hornPulse ? [1, 1.4, 1] : 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Horn flash rings under rider */}
          {hornPulse && (
            <div className="absolute -inset-2 rounded-full border-2 border-brand-mango animate-ping" />
          )}

          {/* Custom cartoon popover for honking */}
          <AnimatePresence>
            {hornPulse && (
              <motion.div 
                initial={{ opacity: 0, y: -16, scale: 0.7 }}
                animate={{ opacity: 1, y: -24, scale: 1 }}
                exit={{ opacity: 0, y: -28, scale: 0.7 }}
                className="absolute left-1/2 -translate-x-1/2 pointer-events-none bg-brand-mango text-white text-[8px] font-black font-mono py-0.5 px-2 rounded-full border border-brand-dark text-center whitespace-nowrap shadow-md uppercase"
              >
                🔊 POUT-POUT !
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-brand-dark text-white p-1.5 rounded-full border border-brand-mango shadow-md text-sm flex items-center justify-center">
            🏍️
          </div>
        </motion.div>

        {/* Real-time telemetry values overlay in bottom overlay list */}
        <div className="absolute bottom-2 left-2 right-2 flex justify-between gap-1 items-center bg-brand-dark/95 text-[8.5px] font-mono py-1 px-2.5 rounded-lg border border-brand-mango text-white">
          <div className="flex items-center space-x-1 w-1/3">
            <span className="text-brand-mango">LAT:</span>
            <span className="text-white font-[550]">{currentLat.toFixed(5)}°N</span>
          </div>
          <div className="flex items-center space-x-1 w-1/3">
            <span className="text-brand-mango">LNG:</span>
            <span className="text-white font-[550]">{currentLng.toFixed(5)}°E</span>
          </div>
          <div className="flex items-center space-x-1 justify-end w-1/3">
            <span className="text-brand-mango">VITESSE:</span>
            <span className="text-white font-extrabold">{isTurbo ? "82 km/h 🚀" : "44 km/h 🛵"}</span>
          </div>
        </div>
      </div>

      {/* Trajectory Details card showing route between Restaurant and Client */}
      <div className="bg-white p-3 rounded-xl border border-brand-dark/15 space-y-2.5">
        <div className="text-[10px] uppercase font-mono font-black text-brand-dark flex items-center space-x-1 justify-between border-b pb-1">
          <span className="flex items-center space-x-1">
            <span className="text-brand-mango">📍</span>
            <span>Itinéraire de Livraison MDB :</span>
          </span>
          <span className="text-gray-400 font-normal">mdmultiservices.com</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10.5px]">
          <div className="bg-[#FAF3EB]/50 p-2 rounded-lg border border-brand-dark/5 space-y-0.5">
            <span className="text-[8px] font-mono font-black text-[#E8762C] block">🍟 POINT DE DÉPART (RESTAURANT)</span>
            <span className="font-extrabold text-brand-dark block truncate">{order.restaurantName}</span>
            <span className="text-[9px] text-gray-400 font-mono italic block">Coordonnées : {restoLat.toFixed(4)}°N, {restoLng.toFixed(4)}°E</span>
          </div>

          <div className="bg-[#FAF3EB]/50 p-2 rounded-lg border border-brand-dark/5 space-y-0.5">
            <span className="text-[8px] font-mono font-black text-[#6B8E4E] block">🏡 POINT D'ARRIVÉE (CLIENT)</span>
            <span className="font-extrabold text-brand-dark block truncate">{order.clientCoords?.label || "Votre Résidence"}</span>
            <span className="text-[9px] text-gray-400 font-mono italic block">Coordonnées : {destLat.toFixed(4)}°N, {destLng.toFixed(4)}°E</span>
          </div>
        </div>

        {/* Live Step by Step Travel Log */}
        <div className="bg-brand-dark text-white p-2 rounded-lg border border-brand-mango/30 flex flex-col sm:flex-row sm:items-center justify-between text-[10.5px] font-mono gap-1.5">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-mango opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-brand-mango"></span>
            </span>
            <span>Reste : <strong className="text-brand-mango font-black">{((100 - progress) * 0.08).toFixed(2)} km</strong></span>
          </div>
          <div className="text-[8.5px] text-brand-cream/60">
            <span>Moteur : ACTIF</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-brand-cream/60">ETA :</span>
            <span className="bg-brand-mango/20 text-brand-mango px-1.5 py-0.2 rounded font-extrabold">
              ~ {Math.max(1, Math.round((100 - progress) * 0.15))} min
            </span>
          </div>
        </div>
      </div>

      {/* Driver vocal status card */}
      <div className="bg-white p-3 rounded-xl border border-brand-dark/10 flex items-start space-x-2.5">
        <div className="text-xl">🎙️</div>
        <div className="flex-1 space-y-0.5 min-w-0">
          <p className="text-[10px] font-mono font-black text-[#E8762C] uppercase font-bold">MONITEUR DE BORD MDB (RIDER)</p>
          <p className="text-[11.5px] font-sans font-medium text-brand-dark leading-snug italic truncate">
             "{currentSpeech}"
          </p>
        </div>
      </div>

      {/* USER CONTROL CONSOLE FOR THE TRACER */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={triggerHorn}
          className="py-1.5 bg-brand-mango text-white font-black text-[9.5px] uppercase rounded-lg border-2 border-brand-dark shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-[0px_0px_0px_rgba(0,0,0,0)] transition-all cursor-pointer"
        >
          📣 Klaxonner
        </button>

        <button
          type="button"
          onClick={() => {
            setIsTurbo(!isTurbo);
            triggerToast(isTurbo ? "🏍️ Allure tranquille rétablie." : "🚀 ACCÉLÉRATEUR ENGAGÉ ! Le motard accélère pour échapper au trafic !");
          }}
          className={`py-1.5 font-black text-[9.5px] uppercase rounded-lg border-2 border-brand-dark shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-[0px_0px_0px_rgba(0,0,0,0)] transition-all cursor-pointer ${
            isTurbo ? "bg-red-500 text-white" : "bg-white text-brand-dark hover:bg-gray-50"
          }`}
        >
          🚀 {isTurbo ? "Normal 🛵" : "Gaz Turbo"}
        </button>

        <button
          type="button"
          onClick={() => {
            setProgress(0);
            triggerToast("🔄 Trajet réinitialisé à l'étal du restaurant !");
          }}
          className="py-1.5 bg-gray-50 hover:bg-gray-100 text-brand-dark font-black text-[9.5px] uppercase rounded-lg border-2 border-brand-dark shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-[0px_0px_0px_rgba(0,0,0,0)] transition-all cursor-pointer"
        >
          🔄 Reset Route
        </button>
      </div>

      {/* Progress scale */}
      <div className="flex items-center justify-between text-[9px] text-gray-400 font-mono">
        <span>Resto : 0%</span>
        <span className="text-[#6B8E4E] font-black bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-100">
          Trajet : {progress}%
        </span>
        <span>Maison : 100%</span>
      </div>
    </div>
  );
}

export default function ClientWorkspace({
  currentAccount,
  cart,
  communes,
  selectedCommune,
  paymentProvider,
  simulatedMobileNumber,
  deliveryAddress,
  orders,
  chatMessages,
  orangeMoneyNumber,
  mtnMoneyNumber,
  waveMoneyNumber,
  onSetSelectedCommune,
  onSetPaymentProvider,
  onSetSimulatedMobileNumber,
  onSetDeliveryAddress,
  onAddToCart,
  onRemoveFromCart,
  onClearCart,
  onSubmitOrder,
  onSendChatMessage,
  onDeductReferralCredit,
  triggerToast
}: ClientWorkspaceProps) {
  
  // Checkout flow states
  const [promoCode, setPromoCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [useReferralDiscount, setUseReferralDiscount] = useState(true);
  const [orderStep, setOrderStep] = useState<'idle' | 'checkout' | 'success'>('idle');

  // GPS Coordinates (Localisation)
  const [gpsCoords, setGpsCoords] = useState<GPSCoords | null>(null);
  const [capturingGps, setCapturingGps] = useState(false);

  // Communication handles
  const [activeChatOrderId, setActiveChatOrderId] = useState<string | null>(null);
  const [chatInputText, setChatInputText] = useState("");
  
  const [callingDriver, setCallingDriver] = useState<boolean>(false);
  const [callTimer, setCallTimer] = useState(0);

  // Invoices overview popup
  const [invoiceToView, setInvoiceToView] = useState<Order | null>(null);

  // Tip (Pourboire) System
  const [tipPercent, setTipPercent] = useState<number>(0);
  const [isCustomTip, setIsCustomTip] = useState<boolean>(false);
  const [customTipPercentStr, setCustomTipPercentStr] = useState<string>("");

  const effectiveTipPercent = useMemo(() => {
    if (isCustomTip) {
      const parsed = parseInt(customTipPercentStr, 10);
      return isNaN(parsed) || parsed < 0 ? 0 : parsed;
    }
    return tipPercent;
  }, [isCustomTip, customTipPercentStr, tipPercent]);

  // Cart math
  const subtotal = useMemo(() => {
    return cart.reduce((acc, c) => acc + c.dish.price * c.quantity, 0);
  }, [cart]);

  const discount = useMemo(() => {
    return discountApplied ? Math.round(subtotal * 0.15) : 0;
  }, [subtotal, discountApplied]);

  const referralDiscountAmount = useMemo(() => {
    if (currentAccount && useReferralDiscount && (currentAccount.referralCredit || 0) >= 150) {
      return 150;
    }
    return 0;
  }, [currentAccount, useReferralDiscount]);

  const deliveryFee = selectedCommune.deliveryFee;

  const tipAmount = useMemo(() => {
    return Math.round((subtotal - discount - referralDiscountAmount) * (effectiveTipPercent / 100));
  }, [subtotal, discount, referralDiscountAmount, effectiveTipPercent]);

  const total = useMemo(() => {
    return Math.max(0, subtotal - discount - referralDiscountAmount + deliveryFee + tipAmount);
  }, [subtotal, discount, referralDiscountAmount, deliveryFee, tipAmount]);

  const proformaOrder = useMemo<Order | null>(() => {
    if (cart.length === 0) return null;
    return {
      id: "MDB-DEVIS-PROFORMA",
      clientId: currentAccount ? currentAccount.id : "guest",
      clientName: currentAccount ? currentAccount.name : "Client Principal",
      clientPhone: currentAccount ? currentAccount.phone : "Aucun numéro enregistré",
      clientCoords: gpsCoords || { lat: 3.8480, lng: 11.5021, label: `${selectedCommune.name.split(" (")[0]} (Aquisition GPS requise)` },
      restaurantId: "cafet-central",
      restaurantName: "Cafétéria Centrale MDB (Yaoundé / Douala)",
      items: cart.map(i => ({ dish: i.dish, quantity: i.quantity })),
      subtotal,
      deliveryFee,
      tip: tipAmount,
      total,
      paymentMethod: paymentProvider,
      status: 'pending',
      createdAt: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    };
  }, [cart, currentAccount, gpsCoords, selectedCommune, subtotal, deliveryFee, tipAmount, total, paymentProvider]);

  const applyPromo = () => {
    const raw = promoCode.trim().toUpperCase();
    if (raw === "YAOUNDE237" || raw === "DOUALA237" || raw === "MDBNEW") {
      setDiscountApplied(true);
      triggerToast("🎉 Code Promo 15% appliqué sur vos spaghettis & beignets !");
    } else {
      triggerToast("❌ Code promo invalide. Essayez 'MDBNEW' pour tester !");
    }
  };

  // Simulate Geolocation (GPS coordinate pickup)
  const detectUserGPS = () => {
    setCapturingGps(true);
    triggerToast("📡 Acquisition du signal satellite GPS Cameroun ...");

    setTimeout(() => {
      // Pick coordinates aligned with selected commune
      let lat = 3.8687; // Yaounde
      let lng = 11.5204;
      if (selectedCommune.name.includes("Douala")) {
        lat = 4.0253;
        lng = 9.7011;
      }
      // Add minor random scatter
      lat += (Math.random() - 0.5) * 0.01;
      lng += (Math.random() - 0.5) * 0.01;

      setGpsCoords({
        lat,
        lng,
        label: `${selectedCommune.name.split(" (")[0]} (Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)})`
      });
      setCapturingGps(false);
      triggerToast("📍 Localisation récoltée avec succès par GPS ! Coordonnées transmises.");
    }, 1500);
  };

  const executeOrderCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      triggerToast("⚠️ Votre panier est vide ! Ajoutez quelques beignets ou omelettes d'abord.");
      return;
    }

    if (!gpsCoords) {
      triggerToast("📍 Veuillez impérativement envoyer votre localisation GPS pour guider le livreur !");
      return;
    }

    if (!currentAccount) {
      triggerToast("🔑 Veuillez d'abord créer ou sélectionner un compte Client dans le panneau supérieur !");
      return;
    }

    const orderId = "MDB-ORDER-" + Math.floor(1000 + Math.random() * 9000);
    const newOrder: Order = {
      id: orderId,
      clientId: currentAccount.id,
      clientName: currentAccount.name,
      clientPhone: currentAccount.phone,
      clientCoords: gpsCoords,
      restaurantId: cart[0].dish.id.includes("cam-dish-1") || cart[0].dish.id.includes("cam-dish-2") || cart[0].dish.id.includes("cam-dish-3") 
        ? "cafet-champion" 
        : cart[0].dish.id.includes("cam-dish-4") || cart[0].dish.id.includes("cam-dish-5") || cart[0].dish.id.includes("cam-dish-6") 
        ? "tantie-ndole" 
        : "buffet-bamileke",
      restaurantName: cart[0].dish.id.includes("cam-dish-1") || cart[0].dish.id.includes("cam-dish-2") || cart[0].dish.id.includes("cam-dish-3") 
        ? "La Cafétéria du Grand Nord (Chez Abbo)" 
        : cart[0].dish.id.includes("cam-dish-4") || cart[0].dish.id.includes("cam-dish-5") || cart[0].dish.id.includes("cam-dish-6") 
        ? "Chez Tantie Ndolé & Fils" 
        : "Le Resto Bamiléké des Hauts-Plateaux",
      items: cart.map(i => ({ dish: i.dish, quantity: i.quantity })),
      subtotal,
      deliveryFee,
      tip: tipAmount,
      total,
      paymentMethod: paymentProvider,
      status: 'pending',
      createdAt: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    };

    onSubmitOrder(newOrder);

    // If referral discount was applied, deduct it from account credit!
    if (referralDiscountAmount > 0 && onDeductReferralCredit) {
      onDeductReferralCredit(currentAccount.id, referralDiscountAmount);
    }

    setInvoiceToView(newOrder); // Open invoice screen instantly!
    onClearCart();
    setOrderStep('success');

    // Trigger visual feedback representing SMS & Gmail transmission
    triggerToast(`🧾 Facture générée ! Transmise par SMS au ${currentAccount.phone}`);
    setTimeout(() => {
      triggerToast(`📧 Copie de la facture transmise sur votre Gmail : ${currentAccount.email}`);
    }, 1200);
  };

  const downloadReceipt = (order: Order) => {
    const textContent = `
=========================================
  MDB RESTAURANT - FACTURE D'ACCUSÉ DE RÉCEPTION
=========================================
Réf Facture : ${order.id}
Date/Heure  : ${order.createdAt || new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
-----------------------------------------
📂 CLIENT :
Nom : ${order.clientName}
Téléphone : ${order.clientPhone}
📍 Adresse Locale : ${order.clientCoords.label}
-----------------------------------------
🍲 SPÉCIALITÉS SÉLECTIONNÉES :
${order.items.map(it => ` - ${it.dish.name} (x${it.quantity}) : ${(it.dish.price * it.quantity).toLocaleString()} FCFA`).join("\n")}
-----------------------------------------
📐 COMPTABILITÉ COMMERCIALE :
Sous-total : ${order.subtotal.toLocaleString()} FCFA
Frais Logistiques (Moto) : ${order.deliveryFee.toLocaleString()} FCFA
Pourboire (Encouragement) : ${(order.tip || 0).toLocaleString()} FCFA
TOTAL BRUT À PAYER : ${order.total.toLocaleString()} FCFA

RÉGLEMENT CHOISI : ${order.paymentMethod === 'cash' ? 'Cash à la livraison 💵' : `${order.paymentMethod.toUpperCase()} Mobile Transfer 💳`}
-----------------------------------------
📞 NUMÉROS OFFICIELS DE RÉCEPTION MOBILE (MDB S.A.) :
${order.paymentMethod === 'orange' ? `🍊 Orange Money de réception : ${orangeMoneyNumber}` : ''}
${order.paymentMethod === 'mtn' ? `💳 MTN MoMo de réception : ${mtnMoneyNumber}` : ''}
${order.paymentMethod === 'wave' ? `📲 Wave Money de réception : ${waveMoneyNumber}` : ''}
${order.paymentMethod === 'cash' ? `💵 Espèces au livreur motard lors de la remise physique` : ''}

Recommandations : Pour les transferts en ligne, veuillez mentionner la Réf ${order.id} dans l'objet du SMS de confirmation.
-----------------------------------------
MDB RESTAURANT DELIVERY S.A. Douala-Yaoundé.
=========================================
    `;
    const element = document.createElement("a");
    const file = new Blob([textContent], {type: 'text/plain;charset=utf-8'});
    element.href = URL.createObjectURL(file);
    element.download = `facture-${order.id}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    triggerToast(`📥 Facture officielle ${order.id}.txt téléchargée !`);
  };

  const startClientPhoneCall = () => {
    setCallingDriver(true);
    setCallTimer(0);
    triggerToast("📞 Liaison directe avec votre motard MDB lancée...");
    setTimeout(() => {
      const interval = setInterval(() => {
        setCallTimer(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }, 1500);
  };

  const submitClientChatMessage = (e: React.FormEvent, orderId: string) => {
    e.preventDefault();
    if (!chatInputText.trim()) return;
    onSendChatMessage(orderId, "client", chatInputText);
    setChatInputText("");
    triggerToast("💬 SMS envoyé au livreur !");

    // Mock driver reply
    setTimeout(() => {
      onSendChatMessage(
        orderId, 
        "livreur", 
        "Pas de soucis mon chef ! Je dore le poisson bar chez Tantie Solange, et j'accélère à moto."
      );
      triggerToast("🏍️ Nouveau message SMS reçu du livreur !");
    }, 2500);
  };

  // Find client orders in the platform
  const myPlatformOrders = orders.filter((o) => currentAccount && o.clientId === currentAccount.id);

  // -------------------------------------------------------------
  // MOCK SMS NOTIFICATIONS STATE & TRANSITION WATCHER EFFECT
  // -------------------------------------------------------------
  interface MockSmsAlert {
    id: string;
    orderId: string;
    sender: string;
    text: string;
    timestamp: string;
    status: 'delivering' | 'delivered';
  }

  const [activeSms, setActiveSms] = useState<MockSmsAlert[]>([]);
  const lastKnownStatusesRef = useRef<{ [orderId: string]: 'pending' | 'preparing' | 'ready' | 'delivering' | 'delivered' }>({});

  // Initialize tracking ref with initial status of active orders
  useEffect(() => {
    myPlatformOrders.forEach((o) => {
      if (!lastKnownStatusesRef.current[o.id]) {
        lastKnownStatusesRef.current[o.id] = o.status;
      }
    });
  }, []);

  // Monitor live changes
  useEffect(() => {
    const clientOrderIds = new Set(myPlatformOrders.map(o => o.id));

    myPlatformOrders.forEach((o) => {
      const prevStatus = lastKnownStatusesRef.current[o.id];
      const currentStatus = o.status;

      // Update ref status
      lastKnownStatusesRef.current[o.id] = currentStatus;

      // Monitor state updates to "delivering" or "delivered"
      if (prevStatus && prevStatus !== currentStatus && (currentStatus === 'delivering' || currentStatus === 'delivered')) {
        const timeStr = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
        const isDelivering = currentStatus === 'delivering';

        let smsText = "";
        if (isDelivering) {
          smsText = `MDB SERVICES 🏍️: Commande #${o.id.substring(0, 8)}... est EN ROUTE ! Le livreur motard a quitté le maquis à vive allure vers Yaoundé/Douala. Gardez votre téléphone à proximité !`;
        } else {
          smsText = `MDB SERVICES 🍲: Commande #${o.id.substring(0, 8)}... LIVRÉE avec succès ! Le colis chaud vous a été remis à domicile. Bon appétit ! Merci pour votre confiance.`;
        }

        const newSms: MockSmsAlert = {
          id: `${o.id}-${currentStatus}-${Date.now()}`,
          orderId: o.id,
          sender: "MDB SMS BOT",
          text: smsText,
          timestamp: timeStr,
          status: currentStatus
        };

        setActiveSms(prev => [newSms, ...prev]);

        // Auto remove in 9 seconds
        setTimeout(() => {
          setActiveSms(prev => prev.filter(n => n.id !== newSms.id));
        }, 9000);
      }
    });

    // Cleanup references of removed orders
    Object.keys(lastKnownStatusesRef.current).forEach((id) => {
      if (!clientOrderIds.has(id)) {
        delete lastKnownStatusesRef.current[id];
      }
    });
  }, [myPlatformOrders]);

  return (
    <div className="bg-white p-6 rounded-2xl border-2 border-brand-dark shadow-[6px_6px_0px_0px_rgba(26,20,16,1)] space-y-6 relative">
      
      {/* --- FLOATING MOCK SMS NOTIFICATIONS OVERLAY (iOS/Android Push Style Banner) --- */}
      <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 z-50 max-w-sm space-y-3 pointer-events-none">
        <AnimatePresence>
          {activeSms.map((sms) => (
            <motion.div
              key={sms.id}
              initial={{ opacity: 0, y: -40, scale: 0.93 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 380, damping: 22 }}
              className="bg-brand-dark text-white rounded-2xl p-4 shadow-[4px_4px_16px_rgba(26,20,16,0.3)] border-2 border-brand-mango pointer-events-auto flex items-start space-x-3.5 relative overflow-hidden"
            >
              {/* Left Color Indicator strip */}
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${sms.status === 'delivered' ? 'bg-[#6B8E4E]' : 'bg-[#E8762C]'}`} />

              <div className="bg-brand-cream/10 p-2 rounded-xl text-brand-mango flex-shrink-0">
                <MessageSquare size={16} />
              </div>
              <div className="flex-1 space-y-1 block text-left">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono font-black text-brand-mango tracking-wider block">💬 MOCK SMS • {sms.sender}</span>
                  <span className="text-[9.5px] font-mono text-gray-400 block">{sms.timestamp}</span>
                </div>
                <p className="text-[11.5px] leading-relaxed font-sans font-medium text-left text-brand-cream">
                  {sms.text}
                </p>
                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[9px] text-gray-400 italic block">Réseau: CamTel / Orange CM / MTN</span>
                  <button
                    onClick={() => {
                      setActiveSms(prev => prev.filter(n => n.id !== sms.id));
                    }}
                    className="text-[9px] text-[#E8762C] hover:underline font-black cursor-pointer bg-transparent border-0 p-0"
                  >
                    Fermer ×
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {/* Title */}
      <div className="border-b border-brand-dark/10 pb-4">
        <span className="text-[10px] font-mono tracking-widest font-black text-brand-mango uppercase block">
          Panier & Commande Directe
        </span>
        <h2 className="font-display font-black text-2xl text-brand-dark flex items-center space-x-2">
          <ShoppingBag size={24} className="text-brand-mango" />
          <span>Votre Panier de Commande MDB</span>
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Réglez en Mobile Money ou en espèces (Cash) et visualisez le coupon facture Gmail.
        </p>
      </div>

      {!currentAccount ? (
        <div className="py-12 bg-amber-50 rounded-2xl border border-dashed border-brand-dark/30 text-center text-amber-900 px-6 space-y-3">
          <span className="text-4xl block">🔑</span>
          <h4 className="font-extrabold text-sm">Session Visiteur active (Non indentifié)</h4>
          <p className="text-xs max-w-md mx-auto">
            Pour passer une commande fictive avec transmission de facture Gmail & SMS, veuillez vous inscrire ou sélectionner un profil client dans la <strong>Console Multi-Comptes MDB Cameroun</strong> ci-dessus !
          </p>
        </div>
      ) : cart.length === 0 && orderStep === 'idle' ? (
        /* Empty basket notification */
        <div className="py-12 bg-brand-cream/20 text-center rounded-2xl border border-brand-dark/10 space-y-3">
          <span className="text-4xl block font-bold">🛒</span>
          <p className="text-xs text-gray-500 font-bold">Votre panier camerounais est vide.</p>
          <a href="#grand-menu-commande-food" className="inline-block text-xs font-bold text-brand-mango hover:underline">
            ← Cliquez ici pour choisir de succulentes spécialités
          </a>
        </div>
      ) : orderStep === 'idle' ? (
        /* 1. BASKET SUMMARY SCREEN & PROMO CODES */
        <div className="space-y-4">
          <div className="space-y-2 border-b border-brand-dark/10 pb-4">
            <AnimatePresence initial={false}>
              {cart.map((item) => (
                <motion.div
                  key={item.dish.id}
                  initial={{ opacity: 0, scale: 0.85, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.85, y: -10 }}
                  transition={{ type: "spring", stiffness: 450, damping: 25 }}
                  className="flex justify-between items-center text-xs bg-brand-cream/30 p-3 rounded-xl border border-brand-dark/10"
                >
                  <div className="text-left">
                    <span className="font-extrabold text-brand-dark block text-left">{item.dish.name}</span>
                    <span className="text-[10px] text-gray-400 block font-mono text-left">PU : {item.dish.price} FCFA</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 border border-brand-dark rounded-lg bg-white overflow-hidden">
                      <button
                        onClick={() => onRemoveFromCart(item.dish.id)}
                        className="px-2 py-1 text-xs font-bold text-red-500 hover:bg-gray-100 rounded-l-md active:scale-95 transition-transform"
                      >
                        -
                      </button>
                      <motion.span 
                        key={item.quantity}
                        initial={{ scale: 1.4, color: "#E8762C" }}
                        animate={{ scale: 1, color: "#1A1410" }}
                        transition={{ duration: 0.2 }}
                        className="px-1 text-xs font-black text-brand-dark leading-none inline-block align-middle"
                      >
                        {item.quantity}
                      </motion.span>
                      <button
                        onClick={() => onAddToCart(item.dish)}
                        className="px-2 py-1 text-xs font-bold text-brand-mango hover:bg-gray-100 rounded-r-md active:scale-95 transition-transform"
                      >
                        +
                      </button>
                    </div>
                    <motion.span 
                      key={`${item.dish.id}-${item.quantity}`}
                      initial={{ scale: 1.15 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500 }}
                      className="font-mono font-black text-brand-dark text-right w-16 inline-block"
                    >
                      {(item.dish.price * item.quantity).toLocaleString()} F
                    </motion.span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Recipient Details & Commune Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-brand-dark block mb-1">Votre Quartier de livraison</label>
              <select
                value={selectedCommune.name}
                onChange={(e) => {
                  const matched = communes.find((c) => c.name === e.target.value);
                  if (matched) onSetSelectedCommune(matched);
                }}
                className="w-full text-xs p-2.5 bg-white rounded-xl border-2 border-brand-dark"
              >
                {communes.map((c) => (
                  <option key={c.name} value={c.name}>{c.name} ({c.deliveryFee} FCFA)</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-brand-dark block mb-1">Précision adresse physique</label>
              <input
                type="text"
                value={deliveryAddress}
                onChange={(e) => onSetDeliveryAddress(e.target.value)}
                className="w-full text-xs p-2.5 bg-white rounded-xl border-2 border-brand-dark"
                placeholder="Ex: Yaoundé Bastos, face à la pharmacie..."
              />
            </div>
          </div>

          {/* PROMO CODES SYSTEM */}
          <div className="bg-brand-cream/50 p-4 rounded-xl border border-brand-dark/10 flex items-center space-x-2">
            <input
              type="text"
              placeholder="Code Promo (Ex: MDBNEW)"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              className="flex-1 text-xs p-2 rounded-lg border-2 border-brand-dark bg-white"
            />
            <button
              type="button"
              onClick={applyPromo}
              className="px-4 py-2 bg-brand-dark text-white rounded-lg text-xs font-bold border border-brand-dark hover:bg-brand-mango"
            >
              Appliquer Promo
            </button>
          </div>

          {/* POURBOIRE (TIP) SYSTEM */}
          <div className="bg-white p-4 rounded-xl border border-brand-dark/10 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-brand-dark flex items-center space-x-1.5">
                <span>🧡 Encourager l'équipe locale & livreurs</span>
                <span className="text-[10px] text-gray-400 font-normal italic">(Facultatif)</span>
              </label>
              {tipAmount > 0 && (
                <span className="text-[11px] font-mono font-black text-[#6B8E4E] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                  +{tipAmount.toLocaleString()} FCFA
                </span>
              )}
            </div>
            
            <p className="text-[10.5px] text-gray-500 leading-normal">
              Ajoutez un pourboire facultatif pour récompenser la rapidité de nos motards à Yaoundé / Douala et le talent secret de nos cuisiniers !
            </p>

            <div className="grid grid-cols-5 gap-1.5">
              {[0, 5, 10, 15].map((preset) => {
                const isSelected = !isCustomTip && tipPercent === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setIsCustomTip(false);
                      setTipPercent(preset);
                      triggerToast(`Pourboire de ${preset}% appliqué ! 🧡`);
                    }}
                    className={`py-1.5 text-[10.5px] font-black rounded-lg border transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-brand-mango text-white border-brand-dark shadow-[1px_1px_0px_rgba(26,20,16,1)] font-extrabold' 
                        : 'bg-brand-cream/10 text-brand-dark border-brand-dark/10 hover:bg-brand-cream/30'
                    }`}
                  >
                    {preset === 0 ? "Aucun" : `${preset}%`}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => {
                  setIsCustomTip(true);
                  if (!customTipPercentStr) {
                    setCustomTipPercentStr("12");
                  }
                  triggerToast("Pourboire personnalisé activé !");
                }}
                className={`py-1.5 text-[10.5px] font-black rounded-lg border transition-all cursor-pointer ${
                  isCustomTip 
                    ? 'bg-brand-mango text-white border-brand-dark shadow-[1px_1px_0px_rgba(26,20,16,1)] font-extrabold' 
                    : 'bg-brand-cream/10 text-brand-dark border-brand-dark/10 hover:bg-brand-cream/30'
                }`}
              >
                Autre
              </button>
            </div>

            {isCustomTip && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="pt-1"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-[10.5px] font-bold text-gray-500">Pourcentage personnalisé :</span>
                  <div className="relative flex-1 max-w-[120px]">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={customTipPercentStr}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCustomTipPercentStr(val);
                      }}
                      className="w-full text-xs p-1.5 pr-6 bg-white rounded-lg border-2 border-brand-dark text-right font-mono font-black"
                      placeholder="Ex: 12"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-mono font-black text-gray-400">%</span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium">du sous-total</span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Parrainage check and apply */}
          {currentAccount && (currentAccount.referralCredit || 0) >= 150 && (
            <div className="bg-emerald-50 border border-emerald-200/60 p-3 rounded-xl flex items-center justify-between text-xs font-mono">
              <label className="flex items-center space-x-2.5 cursor-pointer select-none text-emerald-950 font-semibold">
                <input
                  type="checkbox"
                  checked={useReferralDiscount}
                  onChange={(e) => setUseReferralDiscount(e.target.checked)}
                  className="w-4 h-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <div>
                  <p className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                    🤝 Parrainage MDB (-150 FCFA)
                  </p>
                  <p className="text-[9px] text-emerald-600 font-normal">
                    Votre crédit de parrainage: <strong>{(currentAccount.referralCredit || 0).toLocaleString()} FCFA</strong>
                  </p>
                </div>
              </label>
              <div className="text-right">
                <span className="bg-emerald-600 text-white text-[9px] font-bold font-sans py-0.5 px-2 rounded-full uppercase">
                  Actif
                </span>
              </div>
            </div>
          )}

          {/* Math breakdown */}
          <div className="bg-gray-50 p-4 rounded-xl border border-brand-dark/10 text-xs space-y-1.5 font-bold font-mono">
            <div className="flex justify-between text-gray-400">
              <span>Sous-total aliments</span>
              <span>{subtotal.toLocaleString()} FCFA</span>
            </div>
            {discountApplied && (
              <div className="flex justify-between text-green-600 block">
                <span>Remise de fidélité (-15%)</span>
                <span>-{discount.toLocaleString()} FCFA</span>
              </div>
            )}
            {referralDiscountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 block">
                <span>Réduction parrainage MDB</span>
                <span>-{referralDiscountAmount.toLocaleString()} FCFA</span>
              </div>
            )}
            <div className="flex justify-between text-gray-400">
              <span>Frais de Moto (Quartier)</span>
              <span>{deliveryFee.toLocaleString()} FCFA</span>
            </div>
            {tipAmount > 0 && (
              <div className="flex justify-between text-[#6B8E4E] block">
                <span>Pourboire d'encouragement (+{effectiveTipPercent}%)</span>
                <span>+{tipAmount.toLocaleString()} FCFA</span>
              </div>
            )}
            <div className="flex justify-between text-brand-dark text-sm border-t border-dashed border-gray-200 pt-1.5 font-sans font-extrabold">
              <span>Total à régler</span>
              <span className="text-brand-mango font-black font-mono">{total.toLocaleString()} FCFA</span>
            </div>
          </div>

          {/* Payment Method Option */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-brand-dark block">Méthode de Paiement (Sécurisé) :</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                onClick={() => onSetPaymentProvider("wave")}
                className={`p-2.5 text-xs rounded-xl font-bold border-2 text-center transition-all ${
                  paymentProvider === "wave" ? 'bg-blue-600 text-white border-brand-dark shadow' : 'bg-white text-gray-700 border-gray-200'
                }`}
              >
                Wave 📲
              </button>
              <button
                onClick={() => onSetPaymentProvider("mtn")}
                className={`p-2.5 text-xs rounded-xl font-bold border-2 text-center transition-all ${
                  paymentProvider === "mtn" ? 'bg-amber-400 text-brand-dark border-brand-dark shadow' : 'bg-white text-gray-700 border-gray-200'
                }`}
              >
                MTN MoMo 💳
              </button>
              <button
                onClick={() => onSetPaymentProvider("orange")}
                className={`p-2.5 text-xs rounded-xl font-bold border-2 text-center transition-all ${
                  paymentProvider === "orange" ? 'bg-orange-600 text-white border-brand-dark shadow' : 'bg-white text-gray-700 border-gray-200'
                }`}
              >
                Orange Money 🍊
              </button>
              {/* Cash payment option */}
              <button
                onClick={() => onSetPaymentProvider("cash")}
                className={`p-2.5 text-xs rounded-xl font-bold border-2 text-center transition-all ${
                  paymentProvider === "cash" ? 'bg-[#6B8E4E] text-white border-brand-dark shadow' : 'bg-white text-gray-700 border-gray-200'
                }`}
              >
                Espèces à la livraison 💵
              </button>
            </div>
          </div>

          {/* Dynamic Payment Transfer Instructions Box */}
          {paymentProvider !== "cash" && (
            <div className="p-3.5 bg-[#FFFbeb] border-2 border-brand-dark rounded-xl space-y-2 animate-in fade-in duration-200 text-left">
              <div className="flex items-center space-x-2">
                <CreditCard size={16} className="text-brand-mango" />
                <span className="text-xs font-black text-brand-dark">Directives de Paiement en Ligne (Mobile Transfer) :</span>
              </div>
              <p className="text-[11px] text-gray-750 leading-normal font-sans">
                Veuillez effectuer le dépôt ou le transfert de <strong className="text-[#6B8E4E]">{total.toLocaleString()} FCFA</strong> directement vers le numéro officiel de réception configuré par l'Administrateur :
              </p>
              <div className="p-2.5 bg-white rounded-lg border border-brand-dark/15 flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-mono uppercase tracking-wider text-gray-400 block font-bold">
                    {paymentProvider === "wave" && "Compte Wave de Réception"}
                    {paymentProvider === "mtn" && "Compte MTN MoMo de Réception"}
                    {paymentProvider === "orange" && "Compte Orange Money de Réception"}
                  </span>
                  <span className="text-sm font-mono font-black text-brand-dark select-all">
                    {paymentProvider === "wave" && waveMoneyNumber}
                    {paymentProvider === "mtn" && mtnMoneyNumber}
                    {paymentProvider === "orange" && orangeMoneyNumber}
                  </span>
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded bg-[#6B8E4E]/10 border border-[#6B8E4E]/35 text-[#6B8E4E] font-bold font-mono">
                  En Attente 📡
                </span>
              </div>
              <p className="text-[9.5px] text-gray-400 font-sans italic">
                ℹ️ Une fois le transfert effectué, vous pouvez valider votre panier. Notre équipe vérifiera le reçu mobile lors de la préparation.
              </p>
            </div>
          )}

          {/* GPS COORDINATES REQUIRED SELECTOR */}
          <div className="p-4 bg-teal-50 border-2 border-teal-200 rounded-xl space-y-3">
            <span className="text-xs font-extrabold text-teal-900 block flex items-center space-x-1">
              <MapPin size={14} className="animate-bounce" />
              <span>📍 Partage Obligatoire de votre Position GPS</span>
            </span>
            <p className="text-[11px] text-teal-800 leading-normal">
              Pour des raisons de logistique et de livraison ultra-rapide à moto, le client doit envoyer sa position GPS lors de la validation.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
              <button
                type="button"
                onClick={detectUserGPS}
                disabled={capturingGps}
                className="px-4 py-2 bg-teal-600 text-white hover:bg-teal-800 rounded-xl text-xs font-bold border border-teal-800"
              >
                {capturingGps ? "Recherche satellite..." : "📍 Capturer ma Position GPS Actuelle"}
              </button>
              {gpsCoords ? (
                <div className="p-2 bg-white text-[11px] text-green-700 font-bold font-mono rounded-lg border border-green-200 flex-1">
                  📡 Coordonnées validées : {gpsCoords.lat.toFixed(5)}, {gpsCoords.lng.toFixed(5)}
                </div>
              ) : (
                <div className="p-2 bg-white text-[10px] text-red-650 italic rounded-lg border border-red-200 flex-1">
                  ⌛ Position GPS non synchronisée
                </div>
              )}
            </div>
          </div>

          {/* Dynamic Invoice display request during checkout block */}
          <div className="pt-2 pb-1 text-center bg-brand-cream/15 p-3 rounded-xl border border-[#cbd5e1]">
            <p className="text-[10px] text-gray-500 mb-2 leading-relaxed">
              🇨🇲 Souhaitez-vous générer et télécharger votre facture officielle d'achat avant de valider votre paiement MTN MoMo, Orange Money ou Wave ?
            </p>
            <button
              type="button"
              onClick={() => {
                if (!proformaOrder) {
                  triggerToast("⚠️ Votre panier est vide ! Impossible de générer la facture.");
                  return;
                }
                setInvoiceToView(proformaOrder);
                triggerToast("📋 Facture numérique générée avec succès !");
              }}
              className="w-full py-2 bg-white text-brand-dark hover:bg-brand-cream font-bold text-xs rounded-xl border border-brand-dark transition-all flex items-center justify-center space-x-1.5"
            >
              <span>📄 Voir & Télécharger la Facture (PDF/SMS)</span>
            </button>
          </div>

          <div className="pt-2">
            <button
              onClick={executeOrderCheckout}
              className="w-full py-4 bg-[#6B8E4E] hover:bg-brand-dark text-white font-black text-xs sm:text-sm uppercase rounded-xl border-2 border-brand-dark shadow-[4px_4px_0px_0px_rgba(26,20,16,1)] transition-all flex items-center justify-center space-x-1"
            >
              <span>Valider le Panier & Commander Directement</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      ) : (
        /* SUCCESS ZONE - ORDER ALIVE AND REGISTERED */
        <div className="space-y-6">
          <div className="text-center py-5 bg-green-50 rounded-2xl border-2 border-[#6B8E4E]/30 text-[#2F4F1D] text-xs space-y-3.5 shadow-md">
            <span className="text-4xl block leading-none">🎉</span>
            <div>
              <h4 className="font-extrabold text-sm mb-1 uppercase tracking-wider text-brand-dark">Votre commande est officiellement enregistrée !</h4>
              <p className="text-gray-600 font-sans">
                La commande a été transmise avec succès au gérant de la cafétéria ainsi qu'aux livreurs motards MDB de la zone.
              </p>
            </div>

            {/* Direct access to download/display final client receipt */}
            <div className="mx-4 p-3 bg-white rounded-xl border border-[#6B8E4E]/30 text-left space-y-2">
              <span className="text-[9px] font-mono uppercase tracking-wider text-[#6B8E4E] block font-black">📝 Document de Vente Associé</span>
              <p className="text-[10px] text-gray-500 leading-snug">
                Votre **Facture Digitale d'Achat** a été générée. Utilisez le bouton ci-dessous pour l'afficher à l'écran et la télécharger au format document officiel :
              </p>
              
              <div className="flex gap-2 pt-1.5">
                <button
                  onClick={() => {
                    const latestOrder = orders.find(o => o.clientId === (currentAccount?.id || "guest")) || orders[orders.length - 1];
                    if (latestOrder) {
                      setInvoiceToView(latestOrder);
                    } else {
                      triggerToast("Aucun document actif trouvé.");
                    }
                  }}
                  className="flex-1 py-1.5 px-3 bg-brand-mango hover:bg-brand-dark text-white font-bold text-[10.5px] rounded-lg border border-brand-dark flex items-center justify-center space-x-1"
                >
                  <span>📄 Ouvrir la Facture</span>
                </button>
                <button
                  onClick={() => {
                    const latestOrder = orders.find(o => o.clientId === (currentAccount?.id || "guest")) || orders[orders.length - 1];
                    if (latestOrder) {
                      downloadReceipt(latestOrder);
                    } else {
                      triggerToast("Aucun document actif trouvé.");
                    }
                  }}
                  className="flex-1 py-1.5 px-3 bg-white hover:bg-gray-100 text-brand-dark font-bold text-[10.5px] rounded-lg border border-gray-300 flex items-center justify-center space-x-1"
                >
                  <Download size={11} />
                  <span>Télécharger .TXT</span>
                </button>
              </div>
            </div>

            <div>
              <button
                onClick={() => setOrderStep("idle")}
                className="text-xs underline font-extrabold text-brand-mango hover:text-brand-dark"
              >
                ← Revenir au panier de commande
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TRACKING AND HISTORIES PANELS (Live Tracking and Receival cards) */}
      {myPlatformOrders.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-brand-dark/15">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-wide">
            🛵 Vos Commandes logées & Suivi en Direct ({myPlatformOrders.length}) :
          </h3>

          <div className="space-y-4">
            {myPlatformOrders.map((o) => {
              const oMessages = chatMessages.filter((m) => m.orderId === o.id);
              
              let stepProgress = 15;
              let barStatusLabel = "Cuisson en cuisine 🍳";
              if (o.status === "preparing") {
                stepProgress = 35;
                barStatusLabel = "Ingrédients au feu";
              } else if (o.status === "ready") {
                stepProgress = 60;
                barStatusLabel = "Colis prêt - Attente Motard";
              } else if (o.status === "delivering") {
                stepProgress = 85;
                barStatusLabel = "Motard en route à vive allure 🏍️";
              } else if (o.status === "delivered") {
                stepProgress = 100;
                barStatusLabel = "Commandes remis ! Bon appétit ! 🍲";
              }

              return (
                <div key={o.id} className="bg-brand-cream/10 p-4 rounded-xl border-2 border-brand-dark space-y-4">
                  <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-brand-dark/10">
                    <div>
                      <span className="text-[10px] font-mono block text-gray-500">Heure : {o.createdAt}</span>
                      <strong className="text-xs font-mono font-bold text-brand-dark">{o.id}</strong>
                    </div>

                    <div className="flex space-x-1.5">
                      {/* View Invoice trigger */}
                      <button
                        onClick={() => setInvoiceToView(o)}
                        className="px-2.5 py-1 bg-brand-mango text-white rounded text-[10px] font-bold border border-brand-dark hover:bg-brand-dark"
                      >
                        📬 Voir Facture (SMS/Mail)
                      </button>
                    </div>
                  </div>

                  {/* Progressive Meter line */}
                  <div className="space-y-1.5 p-3.5 bg-white rounded-xl border border-brand-dark/10">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-gray-500 flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-brand-mango animate-ping"></span>
                        <span>Étape : {barStatusLabel}</span>
                      </span>
                      <span className="text-brand-mango font-mono">{stepProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden border border-brand-dark/10">
                      <div 
                        className="h-full bg-brand-mango rounded-full transition-all duration-700"
                        style={{ width: `${stepProgress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Dynamic Interactive GPS Trajectory Map if status is delivering */}
                  {o.status === "delivering" && (
                    <MockLiveRouteMap order={o} triggerToast={triggerToast} />
                  )}

                  {/* Rider actions and chat channel if claimed */}
                  {o.livreurId && o.status !== "delivered" && (
                    <div className="bg-white p-4 rounded-xl border border-brand-dark/10 space-y-3.5">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div>
                          <p className="text-xs text-slate-500 font-bold block">Motard désigné : {o.livreurName}</p>
                          <span className="text-[9.5px] font-mono text-gray-400 block">Tracé par GPS / Support SMS & Call gratuit</span>
                        </div>

                        <div className="flex space-x-1">
                          <button
                            onClick={startClientPhoneCall}
                            className="bg-brand-dark text-white font-bold text-[10px] py-1 px-3 rounded flex items-center space-x-1.5"
                          >
                            <Phone size={10} />
                            <span>Contacter 📞</span>
                          </button>
                          <button
                            onClick={() => setActiveChatOrderId(activeChatOrderId === o.id ? null : o.id)}
                            className="bg-brand-cream text-brand-dark font-black text-[10px] py-1 px-3 rounded border border-brand-dark flex items-center space-x-1.5"
                          >
                            <MessageSquare size={10} className="text-brand-mango" />
                            <span>SMS ({oMessages.length})</span>
                          </button>
                        </div>
                      </div>

                      {/* CLIENT SMS EXPANDED BOX */}
                      {activeChatOrderId === o.id && (
                        <div className="bg-brand-cream/20 rounded-xl border border-brand-dark/10 p-3 space-y-3">
                          <div className="space-y-1.5 h-36 overflow-y-auto p-2 bg-white rounded border border-brand-dark/10">
                            {oMessages.length === 0 ? (
                              <p className="text-[10px] text-gray-400 text-center py-6 block italic">Aucun SMS historique.</p>
                            ) : (
                              oMessages.map((m) => {
                                const isMe = m.senderRole === "client";
                                return (
                                  <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                    <div className={`p-2 rounded-lg max-w-[85%] text-[11px] ${
                                      isMe ? 'bg-[#6B8E4E] text-white rounded-tr-none' : 'bg-gray-100 text-brand-dark rounded-tl-none'
                                    }`}>
                                      {m.text}
                                    </div>
                                    <span className="text-[8px] text-gray-400 mt-0.5">{m.timestamp}</span>
                                  </div>
                                );
                              })
                            )}
                          </div>
                          
                          <form onSubmit={(e) => submitClientChatMessage(e, o.id)} className="flex space-x-1">
                            <input
                              type="text"
                              value={chatInputText}
                              onChange={(e) => setChatInputText(e.target.value)}
                              placeholder="Votre SMS pour guider le livreur..."
                              className="flex-1 text-xs p-1.5 border border-brand-dark rounded bg-white focus:outline-none"
                            />
                            <button
                              type="submit"
                              className="bg-[#6B8E4E] text-white text-xs px-3 py-1.5 rounded font-bold border border-brand-dark"
                            >
                              Envoyer
                            </button>
                          </form>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* OVERLAY EXCLUSIVE INVOICE GMAIL / SMS DISPLAY POPUP */}
      {invoiceToView && (
        <div className="fixed inset-0 z-50 bg-brand-dark/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border-2 border-brand-dark max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            
            {/* Header simulation card */}
            <div className="bg-[#1A1410] text-[#F2EBE1] p-5 flex justify-between items-center border-b-2 border-brand-mango">
              <div>
                <span className="text-brand-mango text-[10px] font-mono font-bold uppercase block tracking-wider">
                  {invoiceToView.id.includes("PROFORMA") || invoiceToView.id.includes("DEVIS") ? "MDB Cameroun — Devis Proforma" : "MDB Cameroun — Facture de Vente"}
                </span>
                <h3 className="font-display font-[950] text-[#FFF] text-base leading-snug">
                  {invoiceToView.id.includes("PROFORMA") || invoiceToView.id.includes("DEVIS") ? "FACTURE PROFORMA D'ACHAT" : "FACTURE LOGISTIQUE ACQUITTEE"}
                </h3>
              </div>
              <button 
                onClick={() => setInvoiceToView(null)} 
                className="p-1 px-2.5 bg-white/5 hover:bg-white/10 rounded-lg text-[#F2EBE1]"
              >
                ✕ Fermer
              </button>
            </div>

            {/* Email header tags */}
            <div className="bg-gray-50 px-5 py-3 border-b text-[11px] font-mono leading-normal text-gray-500 space-y-1 text-left">
              <p>📯 <strong className="text-gray-750">De :</strong> notifications@mdb-multiservice.cm</p>
              <p>📨 <strong className="text-gray-750 font-bold">À :</strong> {currentAccount?.email} (Gmail)</p>
              <p>📲 <strong className="text-gray-750 font-bold">SMS :</strong> Copie transmise au {currentAccount?.phone}</p>
            </div>

            {/* Body of receipt layout with watermark stamp */}
            <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto relative bg-[#FFFBEB]/5">
              
              {/* Decorative watermark */}
              <div className="absolute right-6 top-6 select-none opacity-15 transform rotate-12 pointer-events-none">
                <div className="border-4 border-dashed border-red-600 text-red-600 font-black p-2 rounded text-center text-xs tracking-widest leading-none">
                  {invoiceToView.id.includes("PROFORMA") || invoiceToView.id.includes("DEVIS") ? (
                    <>FACTURE<br />PROFORMA</>
                  ) : (
                    <>COMMANDE<br />ENREGISTRÉE</>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center text-xs font-mono font-bold">
                <span>Réf Commande :</span>
                <span className="text-brand-mango font-bold">{invoiceToView.id}</span>
              </div>

              {/* Items bill */}
              <div className="space-y-2 border-t border-b border-dashed py-3 my-2 text-xs">
                {invoiceToView.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-center font-bold">
                    <span>{it.dish.name} <span className="text-brand-mango font-mono text-[10px]">x{it.quantity}</span></span>
                    <span className="font-mono text-gray-500">{(it.dish.price * it.quantity).toLocaleString()} FCFA</span>
                  </div>
                ))}
              </div>

              {/* Totals math */}
              {(() => {
                const tipVal = invoiceToView.tip || 0;
                const actualDiscount = invoiceToView.subtotal + invoiceToView.deliveryFee + tipVal - invoiceToView.total;
                return (
                  <div className="text-xs space-y-1 bg-brand-cream/20 p-3.5 rounded-xl border border-brand-dark/10">
                    <div className="flex justify-between text-gray-500 font-bold">
                      <span>Sous-total Aliments</span>
                      <span>{invoiceToView.subtotal.toLocaleString()} FCFA</span>
                    </div>
                    {actualDiscount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-bold">
                        <span>Remises / Crédit Parrainage</span>
                        <span>-{actualDiscount.toLocaleString()} FCFA</span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-500 font-bold">
                      <span>Frais logistique Moto</span>
                      <span>{invoiceToView.deliveryFee.toLocaleString()} FCFA</span>
                    </div>
                    {tipVal > 0 && (
                      <div className="flex justify-between text-[#6B8E4E] font-bold">
                        <span>Pourboire d'encouragement</span>
                        <span>+{tipVal.toLocaleString()} FCFA</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm text-brand-dark font-extrabold pt-2 border-t border-dashed mt-2 border-brand-dark/10">
                      <span>Total Brut Acquitté / À régler</span>
                      <span className="text-lg text-[#6B8E4E] font-mono font-black">{invoiceToView.total.toLocaleString()} FCFA</span>
                    </div>
                  </div>
                );
              })()}

              {/* Coordinates of buyer */}
              <div className="text-[10px] p-3 text-slate-500 bg-teal-50 rounded-xl border border-teal-200 leading-normal font-mono text-left">
                <span className="font-bold text-teal-900 block uppercase mb-1">Coordonnées GPS Logistiques :</span>
                <p>Latitude : {invoiceToView.clientCoords.lat.toFixed(5)}</p>
                <p>Longitude : {invoiceToView.clientCoords.lng.toFixed(5)}</p>
                <p>Termes de règlement : <strong className="text-brand-mango uppercase font-mono">{invoiceToView.paymentMethod}</strong></p>
                
                {invoiceToView.paymentMethod !== "cash" && (
                  <div className="mt-2.5 pt-2 border-t border-teal-200/50">
                    <span className="font-bold text-amber-900 block uppercase mb-0.5">⚠️ Rappel Dépôt Reçu :</span>
                    <p className="text-gray-700 leading-snug">Veuillez transférer <strong className="font-black text-[#6B8E4E]">{invoiceToView.total.toLocaleString()} FCFA</strong> vers :</p>
                    <p className="bg-white/60 p-1 rounded border border-amber-300 font-bold text-brand-dark mt-1 text-center font-mono">
                      {invoiceToView.paymentMethod === "wave" && `Wave 📲 : ${waveMoneyNumber}`}
                      {invoiceToView.paymentMethod === "mtn" && `MTN MoMo 💳 : ${mtnMoneyNumber}`}
                      {invoiceToView.paymentMethod === "orange" && `Orange Money 🍊 : ${orangeMoneyNumber}`}
                    </p>
                  </div>
                )}
              </div>

              <p className="text-[10px] text-gray-400 italic text-center leading-normal">
                MDB RESTAURANT DELIVERY S.A. Douala-Yaoundé. Les spaghettis de rue et les poissons de kribi sont transportés hermétiquement scellés.
              </p>
            </div>

            <div className="bg-gray-100 p-4 flex justify-between items-center border-t border-gray-200">
              <span className="text-[10px] font-mono text-gray-400">Généré le {new Date().toLocaleDateString("fr-FR")}</span>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    downloadReceipt(invoiceToView);
                  }}
                  className="px-4 py-2 bg-brand-mango text-white hover:bg-brand-dark rounded-xl text-xs font-bold font-mono transition-all flex items-center space-x-1"
                >
                  <Download size={11} />
                  <span>Enregistrer .TXT</span>
                </button>
                <button
                  onClick={() => setInvoiceToView(null)}
                  className="px-5 py-2 bg-brand-dark text-[#FFF] hover:bg-brand-mango rounded-xl text-xs font-bold font-mono border border-brand-dark"
                >
                  Acquitter
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* CALLING MODAL SCREEN CLIENT SIDE */}
      {callingDriver && (
        <div className="fixed inset-0 z-50 bg-brand-dark/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white w-72 rounded-3xl border border-brand-mango p-6 h-96 flex flex-col justify-between items-center text-center shadow-2xl relative">
            <span className="absolute top-4 left-4 bg-red-600 text-[9px] font-mono px-2 py-0.5 rounded uppercase font-bold text-white">Appel Vocal Direct</span>
            
            <div className="space-y-1.5 mt-8">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-3xl mx-auto border border-white/15 animate-pulse">🏍️</div>
              <h4 className="font-bold text-sm">Motard Livraison MDB</h4>
              <p className="text-[10px] text-gray-400">Canal audio crypté Cameroun</p>
            </div>

            <div className="flex items-center space-x-1.5 h-10">
              <div className="w-1 h-4 bg-brand-mango rounded-full animate-bounce duration-300"></div>
              <div className="w-1 h-7 bg-brand-mango rounded-full animate-bounce duration-500"></div>
              <div className="w-1 h-3 bg-brand-mango rounded-full animate-bounce duration-400"></div>
            </div>

            <div className="w-full space-y-3">
              <p className="text-xs text-brand-cream font-mono">En ligne : {Math.floor(callTimer / 60)}:{(callTimer % 60).toString().padStart(2, '0')}s</p>
              <button
                onClick={() => setCallingDriver(false)}
                className="w-full py-2.5 bg-red-600 hover:bg-red-800 text-white font-bold text-xs rounded-full border border-black"
              >
                Raccrocher
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
