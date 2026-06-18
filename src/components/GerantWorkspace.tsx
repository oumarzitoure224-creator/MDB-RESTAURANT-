import React, { useState } from "react";
import { 
  ChefHat, 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  Check, 
  PlusCircle, 
  DollarSign, 
  MessageSquare, 
  Send, 
  Flame, 
  Image as ImageIcon, 
  Eye, 
  ListFilter,
  TrendingUp,
  Coins
} from "lucide-react";
import { Order, Account, ChatMessage, GlobalStaffMessage } from "../types";
import { Restaurant, Dish } from "../data";

interface GerantWorkspaceProps {
  currentAccount: Account;
  orders: Order[];
  restaurants: Restaurant[];
  chatMessages: ChatMessage[];
  globalStaffMessages: GlobalStaffMessage[];
  onUpdateOrderStatus: (id: string, newStats: Order['status']) => void;
  onSendChatMessage: (orderId: string, senderRole: 'client' | 'livreur' | 'gerant' | 'admin' | 'system', text: string) => void;
  onSendGlobalStaffMessage: (senderId: string, senderName: string, senderRole: Account['role'], text: string, recipientRole?: string) => void;
  onAddDish: (restaurantId: string, newDish: Dish) => void;
  onModifyDish: (restaurantId: string, dishId: string, updatedPrice: number, updatedImage: string) => void;
  triggerToast: (msg: string) => void;
}

export default function GerantWorkspace({
  currentAccount,
  orders,
  restaurants,
  chatMessages,
  globalStaffMessages,
  onUpdateOrderStatus,
  onSendChatMessage,
  onSendGlobalStaffMessage,
  onAddDish,
  onModifyDish,
  triggerToast
}: GerantWorkspaceProps) {
  // Find which cafeteria this manager operates. Default to first if none linked.
  const linkedRestaurantId = currentAccount.restaurantId || "cafet-champion";
  const restaurantObj = restaurants.find((r) => r.id === linkedRestaurantId);
  const restaurantName = restaurantObj ? restaurantObj.name : "Cafétéria Locale";

  const [activeTab, setActiveTab] = useState<'orders' | 'publish' | 'prices'>('orders');

  // Form states for publishing a new dish
  const [newDishName, setNewDishName] = useState("");
  const [newDishDesc, setNewDishDesc] = useState("");
  const [newDishPrice, setNewDishPrice] = useState("");
  const [newDishSpicy, setNewDishSpicy] = useState<0 | 1 | 2 | 3>(1);
  const [newDishImage, setNewDishImage] = useState("");

  // Quick image presets for Cameroonian cuisine
  const imagePresets = [
    { label: "Spaghetti", url: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500&auto=format&fit=crop&q=60" },
    { label: "Soya Sauté", url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60" },
    { label: "Ndolé Chaud", url: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=500&auto=format&fit=crop&q=60" },
    { label: "Poisson Bar Braisé", url: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500&auto=format&fit=crop&q=60" },
    { label: "Beignets Traditionnels", url: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=500&auto=format&fit=crop&q=60" }
  ];

  // Price editor state
  const [pricingUpdates, setPricingUpdates] = useState<{[dishId: string]: number}>({});

  // Chat message state
  const [chatInputs, setChatInputs] = useState<{[orderId: string]: string}>({});
  const [openChatOrderId, setOpenChatOrderId] = useState<string | null>(null);
  const [gerantStaffMsgInput, setGerantStaffMsgInput] = useState("");

  // Filter orders aimed at this specific restaurant
  const myOrders = orders.filter((o) => o.restaurantId === linkedRestaurantId);

  // Daily statistics for delivered orders (journée en cours)
  const deliveredOrders = myOrders.filter((o) => o.status === "delivered");
  const totalRevenue = deliveredOrders.reduce((sum, o) => sum + o.total, 0);
  const totalItemsCount = deliveredOrders.reduce((sum, o) => sum + o.items.reduce((acc, it) => acc + it.quantity, 0), 0);
  
  // Breakdown by payment provider
  const revenueMtn = deliveredOrders.filter(o => o.paymentMethod === 'mtn').reduce((sum, o) => sum + o.total, 0);
  const revenueOrange = deliveredOrders.filter(o => o.paymentMethod === 'orange').reduce((sum, o) => sum + o.total, 0);
  const revenueWave = deliveredOrders.filter(o => o.paymentMethod === 'wave').reduce((sum, o) => sum + o.total, 0);
  const revenueCash = deliveredOrders.filter(o => o.paymentMethod === 'cash').reduce((sum, o) => sum + o.total, 0);

  // Inprogress orders
  const activeOrdersCount = myOrders.filter((o) => o.status !== "delivered").length;

  const startPreparing = (orderId: string) => {
    onUpdateOrderStatus(orderId, "preparing");
    triggerToast("🍳 Commande marquée en cours de préparation dans vos marmites !");
  };

  const markReady = (orderId: string) => {
    onUpdateOrderStatus(orderId, "ready");
    triggerToast("📦 Commande préparée ! Alerte motard lancée automatiquement.");
  };

  const handlePostDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDishName || !newDishDesc || !newDishPrice) {
      triggerToast("⚠️ Échec : Veuillez remplir le nom, la description et le prix du plat.");
      return;
    }

    const priceNum = parseInt(newDishPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      triggerToast("⚠️ Échec : Veuillez indiquer un prix supérieur à 0 FCFA.");
      return;
    }

    // fallback image if none provided
    const imageUrl = newDishImage.trim() || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60";

    const customDish: Dish = {
      id: "dish-" + Math.floor(Math.random() * 1000000),
      name: newDishName,
      description: newDishDesc,
      price: priceNum,
      image: imageUrl,
      spiciness: newDishSpicy
    };

    onAddDish(linkedRestaurantId, customDish);
    triggerToast(`🎉 Plat publié avec succès ! "${newDishName}" est désormais disponible à la commande.`);
    
    // Reset Form
    setNewDishName("");
    setNewDishDesc("");
    setNewDishPrice("");
    setNewDishSpicy(1);
    setNewDishImage("");
    setActiveTab("prices"); // Switch to overview to show the dish
  };

  const handleModifyPriceSubmit = (dishId: string) => {
    const newPriceValue = pricingUpdates[dishId];
    if (newPriceValue === undefined || isNaN(newPriceValue) || newPriceValue <= 0) {
      triggerToast("⚠️ Veuillez insérer un prix valide supérieur à 0 FCFA !");
      return;
    }

    const currentDish = restaurantObj?.dishes.find(d => d.id === dishId);
    if (!currentDish) return;

    onModifyDish(linkedRestaurantId, dishId, newPriceValue, currentDish.image);
    triggerToast(`💸 Tarif de "${currentDish.name}" mis à jour : ${newPriceValue.toLocaleString()} FCFA !`);
    
    // clear local input state
    setPricingUpdates(prev => {
      const copy = { ...prev };
      delete copy[dishId];
      return copy;
    });
  };

  const handleSendChat = (e: React.FormEvent, orderId: string) => {
    e.preventDefault();
    const txt = chatInputs[orderId];
    if (!txt || !txt.trim()) return;

    onSendChatMessage(orderId, "gerant", txt.trim());
    triggerToast("📩 Message transmis au client via internet !");
    
    // Reset input
    setChatInputs(prev => ({ ...prev, [orderId]: "" }));

    // Auto simulated customer translation responsive answer
    setTimeout(() => {
      onSendChatMessage(
        orderId, 
        "client", 
        "Merci beaucoup cher Gérant ! Je surveille l'arrivée du motard pour me régaler."
      );
      triggerToast("📩 Nouveau message reçu du client en réponse !");
    }, 2500);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border-2 border-brand-dark shadow-[6px_6px_0px_0px_rgba(26,20,16,1)] space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-brand-dark/10 pb-4 gap-2">
        <div>
          <span className="text-[10px] font-mono tracking-widest font-black text-brand-mango uppercase block">
            ESPACE COMMANDE, TARIFS & CUISINE
          </span>
          <h2 className="font-display font-black text-2xl text-brand-dark flex items-center space-x-2">
            <ChefHat size={26} className="text-brand-mango animate-bounce" />
            <span>Maître Gérant : {restaurantName}</span>
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Pilotez votre maquis : publiez de nouveaux délices, fixez les prix et communiquez directement par SMS/Chat web avec vos clients.
          </p>
        </div>
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl px-3.5 py-1.5 text-xs font-semibold">
          Compte : <strong>{currentAccount.name}</strong>
        </div>
      </div>

      {/* CHIPPED DAILY TURNOVER DASHBOARD (TABLEAU DE BORD JOURNALIER) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4.5 bg-brand-cream/10 rounded-2xl border-2 border-brand-dark">
        {/* CA Card */}
        <div className="bg-white p-4 rounded-xl border border-brand-dark/10 space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-wider font-extrabold text-gray-400 uppercase">Chiffre d'Affaires Garanti</span>
              <span className="text-[9px] px-2 py-0.5 rounded bg-green-50 border border-green-200 text-[#6B8E4E] font-black uppercase font-mono">Journée</span>
            </div>
            <div className="mt-2 flex items-baseline space-x-1">
              <span className="text-xl font-mono font-black text-[#6B8E4E]">{totalRevenue.toLocaleString()}</span>
              <span className="text-xs font-black text-brand-dark">FCFA</span>
            </div>
            <p className="text-[10px] text-gray-500 font-sans italic mt-1">Accumulé sur les commandes marquées "Livré ✓"</p>
          </div>
          
          {/* Breakdown mini badges */}
          <div className="pt-2.5 border-t border-gray-100 grid grid-cols-2 gap-1 text-[9px] font-mono font-bold">
            <div className="text-orange-600 bg-orange-50 border border-orange-100 rounded p-1 truncate text-center">
              🍊 Orange : {revenueOrange.toLocaleString()} F
            </div>
            <div className="text-amber-600 bg-amber-50 border border-amber-100 rounded p-1 truncate text-center">
              💳 MoMo : {revenueMtn.toLocaleString()} F
            </div>
            <div className="text-blue-600 bg-blue-50 border border-blue-100 rounded p-1 truncate text-center">
              📲 Wave : {revenueWave.toLocaleString()} F
            </div>
            <div className="text-[#6B8E4E] bg-emerald-50 border border-emerald-100 rounded p-1 truncate text-center">
              💵 Cash : {revenueCash.toLocaleString()} F
            </div>
          </div>
        </div>

        {/* Deliveries Stats Card */}
        <div className="bg-white p-4 rounded-xl border border-brand-dark/10 space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-wider font-extrabold text-gray-400 uppercase">Activité Logistique</span>
              <TrendingUp size={14} className="text-brand-mango" />
            </div>
            <div className="mt-2 flex items-baseline space-x-1.5">
              <span className="text-xl font-mono font-black text-brand-dark">{deliveredOrders.length}</span>
              <span className="text-xs font-bold text-gray-500">Livraison(s) Terminée(s)</span>
            </div>
            <p className="text-[10px] text-gray-500 font-sans leading-relaxed mt-1">
              Nombre de clients camerounais s'étant régalés aujourd'hui avec vos spécialités.
            </p>
          </div>
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-700">
            <span className="font-semibold text-brand-dark">Friction d'ingrédients :</span>
            <span className="font-mono font-black text-brand-mango">{totalItemsCount} portions</span>
          </div>
        </div>

        {/* Ongoing / Active Flow Card */}
        <div className="bg-white p-4 rounded-xl border border-brand-dark/10 space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-wider font-extrabold text-gray-400 uppercase">Marmites & Casseroles</span>
              <Coins size={14} className="text-blue-500" />
            </div>
            <div className="mt-2 flex items-baseline space-x-1.5">
              <span className="text-xl font-mono font-black text-blue-600">{activeOrdersCount}</span>
              <span className="text-xs font-bold text-gray-500">Commande(s) Actives</span>
            </div>
            <p className="text-[10px] text-gray-500 font-sans leading-relaxed mt-1">
              Bons non livrés nécessitant l'attention urgente de vos fourneaux ou l'arrivée des motards.
            </p>
          </div>
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[10px]">
            <span className="font-semibold text-brand-dark">Urgence préparation :</span>
            <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase ${activeOrdersCount > 0 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-500'}`}>
              {activeOrdersCount > 2 ? '⚠️ Forte' : activeOrdersCount > 0 ? 'Moyen' : 'Calme ✓'}
            </span>
          </div>
        </div>
      </div>

      {/* HORIZONTAL WORKSPACE NAVIGATION TABS */}
      <div className="flex flex-wrap gap-2 border-b border-brand-dark/10 pb-3">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 border-2 ${
            activeTab === 'orders'
              ? 'bg-brand-dark text-white border-brand-dark'
              : 'bg-white text-gray-650 hover:bg-brand-cream border-transparent'
          }`}
        >
          <ShoppingBag size={14} />
          <span>Bons de commandes reçus ({myOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('publish')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 border-2 ${
            activeTab === 'publish'
              ? 'bg-brand-dark text-white border-brand-dark'
              : 'bg-white text-gray-650 hover:bg-brand-cream border-transparent'
          }`}
        >
          <PlusCircle size={14} />
          <span>➕ Publier un Nouveau Menu</span>
        </button>

        <button
          onClick={() => setActiveTab('prices')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 border-2 ${
            activeTab === 'prices'
              ? 'bg-brand-dark text-white border-brand-dark'
              : 'bg-white text-gray-650 hover:bg-brand-cream border-transparent'
          }`}
        >
          <DollarSign size={14} />
          <span>💰 Fixer les Prix & Carte disponible ({restaurantObj?.dishes.length || 0})</span>
        </button>
      </div>

      {/* TABContent 1: LOGGED ONLINE ORDERS IN THE SYSTEM */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-brand-cream/20 p-3 rounded-lg text-xs border border-brand-dark/10">
            <span className="text-gray-500 font-medium">Bons de préparation actifs transmis par les clients connectés :</span>
            <span className="font-bold text-brand-mango font-mono">En ligne 🟢</span>
          </div>

          {myOrders.length === 0 ? (
            <div className="py-12 bg-brand-cream/30 text-center rounded-xl border border-dashed border-brand-dark/15 space-y-3">
              <span className="text-4xl block">🥣</span>
              <p className="text-xs font-bold text-gray-400">Aucune commande reçue aujourd'hui pour votre étal.</p>
              <p className="text-[10px] text-gray-400 font-mono">Incarnez un rôle <strong className="text-brand-mango">Client</strong>, composez un panier et passez commande !</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {myOrders.map((o) => {
                // status design setup
                let statusBg = "bg-gray-100 text-gray-700";
                let statusLabel = "En attente";
                if (o.status === "preparing") {
                  statusBg = "bg-blue-50 text-blue-800 border border-blue-200 font-bold";
                  statusLabel = "En préparation 🍳";
                } else if (o.status === "ready") {
                  statusBg = "bg-yellow-50 text-yellow-800 font-bold border border-yellow-250 animate-pulse";
                  statusLabel = "Prête, attend motard 📦";
                } else if (o.status === "delivering") {
                  statusBg = "bg-purple-105 text-purple-850 font-bold";
                  statusLabel = "En livraison moto 🏍️";
                } else if (o.status === "delivered") {
                  statusBg = "bg-green-105 text-green-800 font-extrabold";
                  statusLabel = "🟢 Livré ✓";
                }

                const sMessages = chatMessages.filter(m => m.orderId === o.id);

                return (
                  <div 
                    key={o.id} 
                    className="bg-brand-cream/5 p-5 rounded-2xl border-2 border-brand-dark hover:shadow-[4px_4px_0px_0px_rgba(26,20,16,1)] transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Top status */}
                      <div className="flex justify-between items-start mb-3 border-b border-brand-dark/10 pb-2">
                        <div>
                          <span className="font-mono text-[9px] text-gray-400 font-bold">Commande : {o.createdAt}</span>
                          <h4 className="font-bold text-xs font-mono text-brand-mango">{o.id}</h4>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${statusBg}`}>
                          {statusLabel}
                        </span>
                      </div>

                      {/* Client Destination & details */}
                      <div className="space-y-1 bg-white p-3 rounded-xl border border-brand-dark/10 mb-3">
                        <span className="text-[9px] font-bold text-gray-400 block tracking-widest font-mono uppercase">Destinataire</span>
                        <p className="text-xs font-black text-brand-dark">{o.clientName}</p>
                        <p className="text-[11px] text-gray-500 font-mono">{o.clientPhone}</p>
                        <p className="text-[10px] text-[#6B8E4E] font-bold truncate">📍 Localisation GPS : {o.clientCoords.label}</p>
                      </div>

                      {/* Dishes requested */}
                      <div className="space-y-2 py-2">
                        <span className="text-[9px] font-bold text-gray-400 block font-mono uppercase">Plats à concocter</span>
                        <ul className="space-y-1">
                          {o.items.map((it, idx) => (
                            <li key={idx} className="flex justify-between text-xs font-bold text-brand-dark">
                              <span>{it.dish.name} <span className="text-brand-mango">×{it.quantity}</span></span>
                              <span className="font-mono text-gray-400">{ (it.dish.price * it.quantity).toLocaleString() } F</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="border-t border-brand-dark/10 pt-3 mt-3 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono text-gray-400">Total payé</span>
                        <div className="text-right">
                          <span className="text-xs font-extrabold text-[#6B8E4E] block">{o.total.toLocaleString()} FCFA</span>
                          {o.tip && o.tip > 0 ? (
                            <span className="text-[9px] text-[#6B8E4E] font-mono block">dont Pourboire: {o.tip.toLocaleString()} F</span>
                          ) : null}
                        </div>
                      </div>

                      {/* WORKSPACE ACTIONS CONTROLS */}
                      {o.status === "pending" && (
                        <button
                          onClick={() => startPreparing(o.id)}
                          className="w-full py-2 bg-[#6B8E4E] text-white hover:bg-brand-dark rounded-xl text-xs font-bold border-2 border-brand-dark transition-all text-center shadow-[2px_2px_0px_0px_rgba(26,20,16,1)]"
                        >
                          🍳 Lancer la préparation en Cuisine
                        </button>
                      )}

                      {o.status === "preparing" && (
                        <button
                          onClick={() => markReady(o.id)}
                          className="w-full py-2 bg-brand-mango text-white hover:bg-brand-dark rounded-xl text-xs font-bold border-2 border-brand-dark transition-all text-center shadow-[2px_2px_0px_0px_rgba(26,20,16,1)]"
                        >
                          📦 Commande Prête ! Appeler Moto-Livreur 🏍️
                        </button>
                      )}

                      {/* LIVE WEB INTERNET CHAT BETWEEN CLIENT & GÉRANT */}
                      <div className="bg-white p-3 rounded-xl border border-brand-dark/10 space-y-2.5">
                        <div className="flex justify-between items-center pb-1 border-b border-gray-100">
                          <span className="text-[9.5px] font-black text-brand-dark flex items-center space-x-1 uppercase">
                            <MessageSquare size={11} className="text-brand-mango" />
                            <span>Contacter le Client ({sMessages.length} SMS)</span>
                          </span>
                          <button
                            onClick={() => setOpenChatOrderId(openChatOrderId === o.id ? null : o.id)}
                            className="text-[9px] font-bold text-brand-mango hover:underline"
                          >
                            {openChatOrderId === o.id ? "Masquer ▲" : "Écrire ▼"}
                          </button>
                        </div>

                        {openChatOrderId === o.id && (
                          <div className="space-y-2">
                            <div className="h-32 overflow-y-auto p-2 bg-gray-50 rounded border border-gray-150 space-y-1.5 messages-box">
                              {sMessages.length === 0 ? (
                                <p className="text-[9px] text-gray-400 text-center py-6 italic leading-normal">
                                  Aucun message échangé. Écrivez au client pour planifier la cuisson ou le rassurer.
                                </p>
                              ) : (
                                sMessages.map((m) => {
                                  const isMe = m.senderRole === "gerant";
                                  const isClient = m.senderRole === "client";
                                  const senderName = isMe ? "Moi (Gérant)" : isClient ? "Client" : "Livreur 🏍️";
                                  
                                  return (
                                    <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                      <div className={`p-1.5 px-2.5 rounded-lg max-w-[85%] text-[11px] ${
                                        isMe ? 'bg-amber-100 text-amber-950 border border-amber-300 rounded-tr-none' : 'bg-gray-100 text-brand-dark rounded-tl-none'
                                      }`}>
                                        <span className="text-[8px] font-bold text-gray-400 block mb-0.5">{senderName}</span>
                                        <p className="leading-snug">{m.text}</p>
                                      </div>
                                      <span className="text-[7.5px] text-gray-400 mt-0.5">{m.timestamp}</span>
                                    </div>
                                  );
                                })
                              )}
                            </div>

                            <form onSubmit={(e) => handleSendChat(e, o.id)} className="flex items-center space-x-1.5">
                              <input
                                type="text"
                                value={chatInputs[o.id] || ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setChatInputs(prev => ({ ...prev, [o.id]: val }));
                                }}
                                placeholder="Message direct (Ex: Votre plat frit est presque prêt...)"
                                className="flex-1 text-xs p-1.5 border border-brand-dark rounded bg-white"
                              />
                              <button
                                type="submit"
                                className="bg-[#6B8E4E] hover:bg-brand-dark text-white p-1.5 rounded font-bold border border-brand-dark flex items-center justify-center"
                              >
                                <Send size={12} />
                              </button>
                            </form>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TABContent 2: PUBLISHING NEW MENU (POST NEW DISHES) */}
      {activeTab === 'publish' && (
        <form onSubmit={handlePostDish} className="bg-brand-cream/10 p-5 rounded-2xl border-2 border-brand-dark space-y-4">
          <div className="border-b border-brand-dark/10 pb-2.5">
            <h3 className="font-display font-black text-base text-brand-dark flex items-center space-x-1.5">
              <PlusCircle size={18} className="text-brand-mango" />
              <span>Publier un Nouveau Plat de Cuisine</span>
            </h3>
            <p className="text-[11px] text-gray-400">Le plat sera instantanément publié pour les clients parcourant la carte de {restaurantName}.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Input Left */}
            <div className="space-y-3.5">
              <div>
                <label className="text-[11px] font-black text-gray-600 block mb-1 uppercase font-mono">Nom du Plat *</label>
                <input
                  type="text"
                  required
                  value={newDishName}
                  onChange={(e) => setNewDishName(e.target.value)}
                  placeholder="Ex: Sanga Traditionnel Crémeux, Folong aux Crevettes"
                  className="w-full text-xs p-2.5 rounded-lg border-2 border-brand-dark bg-white font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-black text-gray-600 block mb-1 uppercase font-mono">Description des aromates / ingrédients *</label>
                <textarea
                  required
                  rows={3}
                  value={newDishDesc}
                  onChange={(e) => setNewDishDesc(e.target.value)}
                  placeholder="Ex: Élaboré à base de maïs jeune doucement écrasé, de feuilles d'épinards folong sauvages fraîches, mijoté doucement à l'huile de palme..."
                  className="w-full text-xs p-2.5 rounded-lg border-2 border-brand-dark bg-white leading-normal"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-black text-gray-600 block mb-1 uppercase font-mono">Prix Fixé (FCFA) *</label>
                  <input
                    type="number"
                    required
                    value={newDishPrice}
                    onChange={(e) => setNewDishPrice(e.target.value)}
                    placeholder="Ex: 2500"
                    className="w-full text-xs p-2.5 rounded-lg border-2 border-brand-dark bg-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black text-gray-600 block mb-1 uppercase font-mono">Niveau de Piment</label>
                  <select
                    value={newDishSpicy}
                    onChange={(e) => setNewDishSpicy(parseInt(e.target.value) as 0 | 1 | 2 | 3)}
                    className="w-full text-xs p-2.5 rounded-lg border-2 border-brand-dark bg-white font-bold"
                  >
                    <option value={0}>Doux (Aucun piment) - 0</option>
                    <option value={1}>Modéré (Léger frisson) - 1🌶️</option>
                    <option value={2}>Piquant (Chaud) - 2🌶️🌶️</option>
                    <option value={3}>Kankankan (Extrême) - 3🌶️🌶️🌶️</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Input Right (Image Selector & Presets) */}
            <div className="space-y-3.5">
              <div>
                <label className="text-[11px] font-black text-gray-600 block mb-1 uppercase font-mono">Image Adresse URL du repas (Optionnel)</label>
                <input
                  type="text"
                  value={newDishImage}
                  onChange={(e) => setNewDishImage(e.target.value)}
                  placeholder="Ex: https://images.unsplash.com/photo-..."
                  className="w-full text-xs p-2.5 rounded-lg border-2 border-brand-dark bg-white font-mono"
                />
              </div>

              <div className="p-3 bg-white rounded-xl border border-brand-dark/10">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wide block mb-2 font-semibold">⚡ Suggestions de photos gastronomiques :</span>
                <div className="flex flex-wrap gap-1.5">
                  {imagePresets.map((preset, pidx) => (
                    <button
                      key={pidx}
                      type="button"
                      onClick={() => {
                        setNewDishImage(preset.url);
                        triggerToast(`Photo sélectionnée pour : ${preset.label} ! 📸`);
                      }}
                      className={`text-[10px] px-2.5 py-1 rounded-lg border font-bold transition-all ${
                        newDishImage === preset.url 
                          ? 'bg-brand-mango text-white border-brand-dark' 
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-250'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Real-time Preview */}
              <div className="p-3 bg-brand-cream/25 rounded-xl border border-brand-dark/10 flex items-center space-x-3">
                <img
                  src={newDishImage || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop&q=80"}
                  alt="Aperçu plat"
                  className="w-14 h-14 rounded-lg object-cover border border-brand-dark"
                />
                <div>
                  <span className="text-[9px] font-bold text-gray-400 font-mono block">APERÇU DU MENU</span>
                  <p className="text-xs font-extrabold text-brand-dark">{newDishName || "Saisir le nom..."}</p>
                  <p className="text-xs font-bold text-[#6B8E4E] font-mono">{newDishPrice ? parseInt(newDishPrice).toLocaleString() : "0"} FCFA</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 text-right">
            <button
              type="submit"
              className="py-3 px-8 bg-[#6B8E4E] text-white hover:bg-brand-dark font-display font-black text-xs uppercase rounded-xl border-2 border-brand-dark shadow-[4px_4px_0px_0px_rgba(26,20,16,1)] transition-transform hover:translate-y-[-1px]"
            >
              🚀 Mettre en vente directe (Publier)
            </button>
          </div>
        </form>
      )}

      {/* TABContent 3: SET AND FIX EXISTING PRICES AND DELETE DISHES */}
      {activeTab === 'prices' && (
        <div className="space-y-4">
          <div className="border-b border-brand-dark/10 pb-2.5">
            <h3 className="font-display font-black text-base text-brand-dark flex items-center space-x-1.5">
              <DollarSign size={18} className="text-[#6B8E4E]" />
              <span>Fixation des Prix de la Carte</span>
            </h3>
            <p className="text-[11px] text-gray-400">Ajustez les prix de vente en FCFA selon le coût des ingrédients au marché.</p>
          </div>

          {!restaurantObj || restaurantObj.dishes.length === 0 ? (
            <p className="text-xs text-center text-gray-400">Aucun plat configuré.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {restaurantObj.dishes.map((dish) => {
                const currentDraftPrice = pricingUpdates[dish.id];
                const inputVal = currentDraftPrice !== undefined ? currentDraftPrice : dish.price;

                return (
                  <div key={dish.id} className="bg-white p-4 rounded-xl border-2 border-brand-dark flex flex-col justify-between space-y-4">
                    <div className="flex space-x-3">
                      <img
                        src={dish.image}
                        alt={dish.name}
                        className="w-14 h-14 rounded-lg object-cover border-2 border-brand-dark shadow-inner"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs text-brand-dark truncate">{dish.name}</h4>
                        <p className="text-[10px] text-gray-400 line-clamp-2 h-7">{dish.description}</p>
                        <span className="inline-flex items-center space-x-1 text-[9px] text-red-600 bg-red-50 px-1 py-0.5 rounded font-bold font-mono">
                          <Flame size={9} />
                          <span>Piment : {dish.spiciness}</span>
                        </span>
                      </div>
                    </div>

                    {/* Quick input pricing */}
                    <div className="bg-brand-cream/20 p-2.5 rounded-lg border border-brand-dark/10 space-y-2">
                      <div className="flex justify-between items-center text-[10px] text-gray-500 font-bold">
                        <span>Prix courant : {dish.price.toLocaleString()} F</span>
                        {currentDraftPrice !== undefined && (
                          <span className="text-brand-mango">Modifié</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <input
                          type="number"
                          value={inputVal}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            setPricingUpdates(prev => ({ ...prev, [dish.id]: val }));
                          }}
                          className="w-full text-xs p-1.5 rounded border-2 border-brand-dark bg-white font-mono font-black text-brand-dark"
                        />
                        <button
                          onClick={() => handleModifyPriceSubmit(dish.id)}
                          className="px-2.5 py-1.5 bg-[#6B8E4E] text-white hover:bg-brand-dark rounded text-[10px] font-black border border-brand-dark"
                        >
                          Fixer
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* RADIOPHONIC WALKIE TALKIE WIDGET FOR INTER-STAFF & GERANT COMMUNICATION */}
      <div className="bg-slate-900 text-white rounded-2xl border-2 border-brand-dark p-5.5 space-y-4 shadow-lg mt-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-brand-mango text-[8px] font-black text-black font-mono px-3.5 py-1 uppercase tracking-wider rounded-bl-xl animate-pulse">
          📻 Radio UHF Inter-Services
        </div>
        
        <div>
          <span className="text-[9px] font-black tracking-widest text-[#6B8E4E] uppercase block font-mono">
            Réseau Inter-Rôles (Administrateur, Gérants & Livreurs)
          </span>
          <h3 className="font-display font-black text-sm flex items-center space-x-1.5 text-white">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
            <span>Canal Radio du Personnel MDB</span>
          </h3>
          <p className="text-[10.5px] text-gray-400 leading-normal mt-1">
            Échangez avec l'Administrateur central et les livreurs motards pour coordonner les casseroles et la livraison.
          </p>
        </div>

        {/* Radio Message History Feed */}
        <div className="p-3 bg-slate-950 rounded-xl border border-white/10 h-36 overflow-y-auto space-y-1.5 messages-box font-mono text-[10.5px]">
          {globalStaffMessages.length === 0 ? (
            <p className="text-gray-500 italic text-center py-6">Fréquence UHF claire. Aucun signal radio.</p>
          ) : (
            globalStaffMessages.map((msg) => {
              let roleBadge = "bg-amber-500/20 text-brand-mango border border-brand-mango/30";
              if (msg.senderRole === "admin") {
                roleBadge = "bg-red-500/20 text-red-150 border border-red-500/30 font-black";
              } else if (msg.senderRole === "livreur") {
                roleBadge = "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
              }

              const isMe = msg.senderId === currentAccount.id;

              return (
                <div key={msg.id} className="p-2 rounded-lg bg-[#1E222B] border border-white/5 leading-relaxed">
                  <div className="flex justify-between items-center text-[8.5px] mb-0.5">
                    <span className="font-bold text-gray-200">
                      {isMe ? "🎙️ Moi (" + currentAccount.name + ")" : msg.senderName}
                    </span>
                    <div className="flex items-center space-x-1.5">
                      <span className={`px-1 py-0.2 rounded text-[7px] uppercase font-bold ${roleBadge}`}>
                        {msg.senderRole}
                      </span>
                      <span className="text-gray-500">{msg.timestamp}</span>
                    </div>
                  </div>
                  <p className="text-gray-350 font-sans text-xs">{msg.text}</p>
                </div>
              );
            })
          )}
        </div>

        {/* Custom Send Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!gerantStaffMsgInput.trim()) return;
            onSendGlobalStaffMessage(
              currentAccount.id,
              currentAccount.name,
              "gerant",
              gerantStaffMsgInput.trim()
            );
            setGerantStaffMsgInput("");
            triggerToast("Radio Personnel 🎙️: Signal envoyé à l'équipe !");
          }}
          className="flex space-x-2 pt-1"
        >
          <input
            type="text"
            placeholder="Émettre une instruction ou saluer l'équipe..."
            value={gerantStaffMsgInput}
            onChange={(e) => setGerantStaffMsgInput(e.target.value)}
            className="flex-1 bg-slate-950 text-white placeholder-gray-500 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-mango"
          />
          <button
            type="submit"
            className="bg-brand-mango hover:bg-amber-600 text-white p-2 px-3.5 rounded-xl border border-brand-dark flex items-center justify-center transition text-xs font-bold"
          >
            <span>Transmettre</span>
          </button>
        </form>
      </div>

    </div>
  );
}
