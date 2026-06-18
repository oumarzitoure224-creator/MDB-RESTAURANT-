import React, { useState } from "react";
import { motion } from "motion/react";
import { Truck, MapPin, Phone, MessageSquare, Play, CheckCircle, Navigation, Radio, X, Volume2, Shield, Send } from "lucide-react";
import { Order, Account, ChatMessage, GlobalStaffMessage } from "../types";

interface LivreurWorkspaceProps {
  currentAccount: Account;
  orders: Order[];
  chatMessages: ChatMessage[];
  globalStaffMessages: GlobalStaffMessage[];
  onAcceptOrder: (orderId: string, livreurId: string, livreurName: string) => void;
  onUpdateOrderStatus: (id: string, newStats: Order['status']) => void;
  onSendChatMessage: (orderId: string, senderRole: 'client' | 'livreur' | 'gerant' | 'admin' | 'system', text: string) => void;
  onSendGlobalStaffMessage: (senderId: string, senderName: string, senderRole: Account['role'], text: string, recipientRole?: string) => void;
  triggerToast: (msg: string) => void;
}

export default function LivreurWorkspace({
  currentAccount,
  orders,
  chatMessages,
  globalStaffMessages,
  onAcceptOrder,
  onUpdateOrderStatus,
  onSendChatMessage,
  onSendGlobalStaffMessage,
  triggerToast
}: LivreurWorkspaceProps) {
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [leftPanelTab, setLeftPanelTab] = useState<'ready' | 'all'>('ready');
  
  // Chat & Phone simulation modal states
  const [chattingOrderId, setChattingOrderId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [staffMsgInput, setStaffMsgInput] = useState("");
  
  const [callingOrderId, setCallingOrderId] = useState<string | null>(null);
  const [callActiveState, setCallActiveState] = useState<'idle' | 'ringing' | 'connected'>('idle');
  const [callSeconds, setCallSeconds] = useState(0);

  // Active call countdown handle
  const [callIntervalId, setCallIntervalId] = useState<NodeJS.Timeout | null>(null);

  // Find orders that are ready or pending, and not claimed by anyone
  const availableOrders = orders.filter((o) => o.status === "ready" && !o.livreurId);

  // My current active deliveries
  const myDeliveries = orders.filter((o) => o.livreurId === currentAccount.id);

  const startPhoneCall = (orderId: string) => {
    setCallingOrderId(orderId);
    setCallActiveState("ringing");
    setCallSeconds(0);
    triggerToast("📞 Lancement de la liaison Mobile MDB... Appareil en sonnerie !");

    // Ring for 2 seconds and connect
    setTimeout(() => {
      setCallActiveState("connected");
      const interval = setInterval(() => {
        setCallSeconds((prev) => prev + 1);
      }, 1000);
      setCallIntervalId(interval);
      triggerToast("🔊 Appel connecté ! Canal audio GSM crypté actif.");
    }, 2000);
  };

  const hangUpCall = () => {
    if (callIntervalId) {
      clearInterval(callIntervalId);
      setCallIntervalId(null);
    }
    setCallingOrderId(null);
    setCallActiveState("idle");
    setCallSeconds(0);
    triggerToast("📞 Liaison vocale interrompue.");
  };

  const acceptCourse = (orderId: string) => {
    onAcceptOrder(orderId, currentAccount.id, currentAccount.name);
    onUpdateOrderStatus(orderId, "delivering");
    setActiveJobId(orderId);
    triggerToast("🏍️ Course acceptée ! Mettez votre casque et foncez à la cafétéria.");
  };

  const changeStatus = (orderId: string, nextStatus: Order['status']) => {
    onUpdateOrderStatus(orderId, nextStatus);
    if (nextStatus === "delivered") {
      triggerToast("🟢 Colis livré en mains propres au client ! Livraison validée.");
    } else {
      triggerToast(`🏍️ Statut de livraison mis à jour : ${nextStatus.toUpperCase()}`);
    }
  };

  const submitChatBubble = (e: React.FormEvent, orderId: string) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    onSendChatMessage(orderId, "livreur", chatInput);
    setChatInput("");
    triggerToast("💬 Message SMS transmis !");

    // Simulated responsive customer reply
    setTimeout(() => {
      onSendChatMessage(
        orderId, 
        "client", 
        "C'est noté mon frère ! Je t'attends devant le portail à côté de l'enseigne."
      );
      triggerToast("📩 Nouveau message reçu du client !");
    }, 2500);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border-2 border-brand-dark shadow-[6px_6px_0px_0px_rgba(26,20,16,1)] space-y-6">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-brand-dark/10 pb-4 gap-2">
        <div>
          <span className="text-[10px] font-mono tracking-widest font-black text-[#6B8E4E] uppercase block">
            Espace Motocycliste & Distribution
          </span>
          <h2 className="font-display font-black text-2xl text-brand-dark flex items-center space-x-2">
            <Truck size={26} className="text-[#6B8E4E]" />
            <span>Portail Livreur MDB</span>
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Consultez les commandes prêtes dans les cafeterias et livrez-les aux clients contre paiement.
          </p>
        </div>
        <div className="bg-green-50 border border-green-200 text-green-900 rounded-xl px-3.5 py-1.5 text-xs font-semibold">
          Livreur : <strong>{currentAccount.name}</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COMPARTMENT: AVAILABLE DELIVERIES IN LUNCHTIME */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Sub-Tabs Selector */}
          <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
            <button
              onClick={() => setLeftPanelTab('ready')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all text-center ${
                leftPanelTab === 'ready' 
                  ? 'bg-white text-brand-dark shadow-[1px_1px_2px_rgba(0,0,0,0.15)] border border-brand-dark/10' 
                  : 'text-gray-500 hover:text-brand-dark'
              }`}
            >
              Prêtes à livrer ({availableOrders.length})
            </button>
            <button
              onClick={() => setLeftPanelTab('all')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all text-center ${
                leftPanelTab === 'all' 
                  ? 'bg-white text-brand-dark shadow-[1px_1px_2px_rgba(0,0,0,0.15)] border border-brand-dark/10' 
                  : 'text-gray-500 hover:text-brand-dark'
              }`}
            >
              Toutes les Commandes ({orders.length})
            </button>
          </div>

          {leftPanelTab === 'ready' ? (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-gray-400 tracking-wider uppercase flex items-center space-x-1.5">
                  <Radio size={14} className="text-red-500 animate-ping" />
                  <span>Plats chauds prêts à livrer ({availableOrders.length})</span>
                </h3>
              </div>

              {availableOrders.length === 0 ? (
                <div className="p-8 bg-brand-cream/30 text-center rounded-xl border border-dashed border-brand-dark/15 text-xs text-gray-400 space-y-2">
                  <p className="font-bold">Aucune commande en attente.</p>
                  <p className="text-[10px]">Tentez de passer une commande en tant que <strong>Client</strong> pour voir l'alerte apparaître ici !</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {availableOrders.map((o) => (
                    <motion.div
                      key={o.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      className="bg-white p-4 rounded-xl border-2 border-brand-dark shadow-[3px_3px_0px_0px_rgba(26,20,16,1)] text-xs space-y-3"
                    >
                      <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                        <span className="font-bold text-gray-800 font-mono text-[10px]">{o.restaurantName}</span>
                        <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded font-extrabold uppercase">Prête 📦</span>
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-brand-dark flex items-center">
                          <MapPin size={12} className="mr-1 text-brand-mango" />
                          <span>Quartier : {o.clientCoords.label}</span>
                        </p>
                        <p className="text-[11px] text-gray-500">Adresse : {o.clientName} ({o.clientPhone})</p>
                        <p className="text-[11px] text-[#6B8E4E] font-bold">Valeur Cargo : {o.total.toLocaleString()} FCFA ({o.paymentMethod === 'cash' ? 'Paye en espèces 💵' : 'Déjà Payé Mobile 💳'})</p>
                        {o.tip && o.tip > 0 ? (
                          <p className="text-[11px] text-brand-mango font-black">🎁 Pourboire inclus : +{o.tip.toLocaleString()} FCFA !</p>
                        ) : null}
                      </div>
                      <button
                        onClick={() => acceptCourse(o.id)}
                        className="w-full py-2 bg-brand-mango text-white hover:bg-brand-dark font-bold text-xs rounded-lg border-2 border-brand-dark transition-all flex items-center justify-center space-x-1"
                      >
                        <Play size={12} />
                        <span>Prendre la livraison moto</span>
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 block font-semibold mb-2">Suivi complet de toutes les commandes actives du site :</span>
              {orders.length === 0 ? (
                <p className="text-xs text-gray-400 italic text-center py-6">Aucune commande enregistrée.</p>
              ) : (
                orders.map((o) => {
                  let sColor = "text-gray-400";
                  let sLabel: string = o.status;
                  if (o.status === "pending") { sColor = "text-amber-500 animate-pulse"; sLabel = "En attente cuisson"; }
                  if (o.status === "preparing") { sColor = "text-blue-550 font-bold"; sLabel = "En préparation 🍳"; }
                  if (o.status === "ready") { sColor = "text-red-500 font-black animate-pulse"; sLabel = "Prête 📦"; }
                  if (o.status === "delivering") { sColor = "text-purple-600 font-bold"; sLabel = "En chemin moto 🏍️"; }
                  if (o.status === "delivered") { sColor = "text-[#6B8E4E] font-black"; sLabel = "Livrée ✓"; }

                  return (
                    <motion.div
                      key={o.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 350, damping: 25 }}
                      className="bg-brand-cream/10 p-3 rounded-xl border border-brand-dark/15 text-xs flex flex-col justify-between space-y-2 hover:bg-brand-cream/20 transition-all"
                    >
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-brand-dark truncate">{o.restaurantName}</span>
                        <span className={`font-black uppercase text-[9px] ${sColor}`}>{sLabel}</span>
                      </div>
                      <div className="text-[10px] text-gray-500 space-y-0.5">
                        <p>Client : <strong>{o.clientName}</strong> ({o.clientPhone})</p>
                        <p className="truncate">📍 Quartier : {o.clientCoords.label}</p>
                      </div>
                      <div className="flex justify-between items-center pt-1.5 border-t border-gray-100/60 mt-1">
                        <span className="text-[10px] font-mono text-gray-400">{o.total.toLocaleString()} FCFA</span>
                        <div className="flex items-center space-x-1">
                          {o.status === "ready" && !o.livreurId && (
                            <button
                              onClick={() => acceptCourse(o.id)}
                              className="bg-brand-mango hover:bg-brand-dark text-white px-2 py-1 rounded text-[9.5px] font-bold border border-brand-dark shadow-[1px_1px_0px_rgba(0,0,0,1)]"
                            >
                              Prendre
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setChattingOrderId(o.id);
                              triggerToast(`SMS Chat ouvert pour: ${o.clientName}`);
                            }}
                            className="bg-white border border-brand-dark hover:bg-brand-cream text-brand-dark px-2 py-1 rounded text-[9.5px] font-bold"
                          >
                            Écrire SMS
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          )}

          {/* RADIOPHONIC WALKIE TALKIE WIDGET FOR INTER-MOTARDS & STAFF COMMUNICATION */}
          <div className="bg-slate-900 text-white rounded-2xl border-2 border-brand-dark p-5.5 space-y-4 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-brand-mango text-[8px] font-black text-black font-mono px-3.5 py-1 uppercase tracking-wider rounded-bl-xl animate-pulse">
              📻 Live Radio UHF
            </div>
            
            <div>
              <span className="text-[9px] font-black tracking-widest text-[#6B8E4E] uppercase block font-mono">
                Réseau Pro Cameroun libre
              </span>
              <h3 className="font-display font-black text-base flex items-center space-x-1.5 text-white">
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping"></span>
                <span>Canal Inter-Motards & Staff</span>
              </h3>
              <p className="text-[10.5px] text-gray-400 leading-normal mt-1">
                Communiquez en direct avec les autres livreurs motards du Cameroun, les gérants de cafétéria et l'administrateur de la plateforme.
              </p>
            </div>

            {/* Radio Message History Feed */}
            <div className="p-3 bg-slate-950 rounded-xl border border-white/10 h-44 overflow-y-auto space-y-2 messages-box font-mono text-[11px]">
              {globalStaffMessages.length === 0 ? (
                <p className="text-gray-500 italic text-center py-10">Fréquence UHF claire. Aucun signal radio.</p>
              ) : (
                globalStaffMessages.map((msg) => {
                  let roleBadge = "bg-amber-500/20 text-brand-mango border border-brand-mango/30";
                  if (msg.senderRole === "admin") {
                    roleBadge = "bg-red-500/20 text-red-400 border border-red-500/30";
                  } else if (msg.senderRole === "gerant") {
                    roleBadge = "bg-blue-500/20 text-blue-400 border border-blue-500/30";
                  }

                  const isMe = msg.senderId === currentAccount.id;

                  return (
                    <div key={msg.id} className={`p-2 rounded-lg border leading-relaxed bg-[#1E222B] border-white/5`}>
                      <div className="flex justify-between items-center text-[9px] mb-1">
                        <span className="font-bold text-gray-200">
                          {isMe ? "🎙️ Moi" : msg.senderName}
                        </span>
                        <div className="flex items-center space-x-1.5">
                          <span className={`px-1 py-0.2 rounded text-[7.5px] uppercase font-black ${roleBadge}`}>
                            {msg.senderRole}
                          </span>
                          <span className="text-gray-500">{msg.timestamp}</span>
                        </div>
                      </div>
                      <p className="text-gray-300 font-sans text-xs">{msg.text}</p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick precomposed quick-fire buttons for motorcyclist convenience */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-black text-gray-400 tracking-wider font-mono">⚡ ALERTE DE COURSE RAPIDE :</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { text: "🚨 Bouchon à Bastos, déviation !", icon: "🚗" },
                  { text: "⛈️ Pluie violente, je m'abrite.", icon: "⛈️" },
                  { text: "⛽ Station-service ok, je repars.", icon: "⛽" },
                  { text: "🍜 Commande en boîte, gaz à fond !", icon: "🏍️" }
                ].map((alert, aid) => (
                  <button
                    key={aid}
                    type="button"
                    onClick={() => {
                      onSendGlobalStaffMessage(
                        currentAccount.id,
                        currentAccount.name,
                        "livreur",
                        `${alert.icon} ${alert.text}`
                      );
                      triggerToast("Radio UHF 🎙️: Signal envoyé !");
                    }}
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 text-gray-200 font-bold px-2.5 py-1 rounded-lg border border-slate-700 transition"
                  >
                    {alert.text}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Send Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!staffMsgInput.trim()) return;
                onSendGlobalStaffMessage(
                  currentAccount.id,
                  currentAccount.name,
                  "livreur",
                  staffMsgInput.trim()
                );
                setStaffMsgInput("");
                triggerToast("Radio UHF 🎙️: Message envoyé sur le réseau !");
              }}
              className="flex space-x-2 pt-1"
            >
              <input
                type="text"
                placeholder="Écrire à tous les livreurs / staff..."
                value={staffMsgInput}
                onChange={(e) => setStaffMsgInput(e.target.value)}
                className="flex-1 bg-slate-950 text-white placeholder-gray-500 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-mango"
              />
              <button
                type="submit"
                className="bg-brand-mango hover:bg-amber-600 text-white p-2 px-3.5 rounded-xl border border-brand-dark flex items-center justify-center transition"
              >
                <Send size={13} />
              </button>
            </form>
          </div>

        </div>

        {/* RIGHT COMPARTMENT: MY ONGOING DELIVERIES + COMMUNICATION TOOLS */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider">
            🏍️ Vos courses actives ({myDeliveries.length}) :
          </h3>

          {myDeliveries.length === 0 ? (
            <div className="p-8 bg-gray-5 p-5 border border-dashed text-center rounded-xl text-xs text-gray-400 font-bold leading-normal">
              Vous n'avez pas de livraison en cours de transport. Cliquez à gauche pour accepter une course !
            </div>
          ) : (
            <div className="space-y-4">
              {myDeliveries.map((o) => {
                const subMsgs = chatMessages.filter((m) => m.orderId === o.id);
                return (
                  <div key={o.id} className="bg-brand-cream/10 p-5 rounded-xl border-2 border-brand-dark space-y-4">
                    
                    {/* Inner status and basic details */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-brand-dark/10 pb-3">
                      <div>
                        <span className="text-[10px] font-mono text-gray-400">Course active : <strong>{o.id}</strong></span>
                        <h4 className="font-bold text-sm text-brand-dark">{o.restaurantName} → {o.clientCoords.label}</h4>
                      </div>
                      <div className="flex items-center space-x-1">
                        {o.status === "delivering" ? (
                          <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold uppercase animate-pulse">
                            En chemin 🏍️
                          </span>
                        ) : (
                          <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase">
                            Livré ✓
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Client destination and payment terms */}
                    <div className="text-xs space-y-2 bg-white p-3.5 rounded-xl border border-brand-dark/10">
                      <p className="font-bold text-brand-dark">Destinataire : {o.clientName}</p>
                      <p className="text-gray-500">Adresse GPS : <strong className="text-brand-dark font-mono font-normal">Lat {o.clientCoords.lat.toFixed(4)}, Lng {o.clientCoords.lng.toFixed(4)}</strong></p>
                      <p className="text-gray-500">Mode de paiement du client : 
                        <span className="ml-1 px-1.5 py-0.5 bg-brand-cream text-brand-mango font-bold uppercase rounded text-[10px]">
                          {o.paymentMethod === "cash" ? "💵 Espèces / Cash" : "💳 Mobile Money/Wave"}
                        </span>
                      </p>
                      {o.tip && o.tip > 0 ? (
                        <p className="text-[11px] text-[#E8762C] font-black">🎁 Pourboire offert au Motard : +{o.tip.toLocaleString()} FCFA !</p>
                      ) : null}
                      {o.paymentMethod === "cash" && (
                        <p className="text-[#6B8E4E] font-bold">⚠️ Collecter auprès du client : {o.total.toLocaleString()} FCFA</p>
                      )}
                    </div>

                    {/* Live status adjustment controls */}
                    <div className="grid grid-cols-2 gap-3">
                      {o.status === "delivering" && (
                        <button
                          onClick={() => changeStatus(o.id, "delivered")}
                          className="py-2.5 px-4 bg-[#6B8E4E] text-white hover:bg-brand-dark font-bold text-xs rounded-xl border-2 border-brand-dark flex items-center justify-center space-x-2 shadow"
                        >
                          <CheckCircle size={14} />
                          <span>Marquer comme livré ✓</span>
                        </button>
                      )}

                      {/* CALL SIMULATION DRIVER BUTTONS */}
                      <div className="flex space-x-2 col-span-2 sm:col-span-1">
                        <button
                          onClick={() => startPhoneCall(o.id)}
                          className="flex-1 py-2.5 bg-[#1F2937] hover:bg-brand-dark text-white font-bold text-xs rounded-xl border-2 border-brand-dark flex items-center justify-center space-x-1.5"
                        >
                          <Phone size={14} />
                          <span>Appeler le Client 📞</span>
                        </button>
                        <button
                          onClick={() => setChattingOrderId(chattingOrderId === o.id ? null : o.id)}
                          className="flex-1 py-2.5 bg-white hover:bg-brand-cream text-brand-dark font-bold text-xs rounded-xl border-2 border-brand-dark flex items-center justify-center space-x-1.5 shadow"
                        >
                          <MessageSquare size={14} className="text-brand-mango" />
                          <span>Ouvrir SMS ({subMsgs.length})</span>
                        </button>
                      </div>
                    </div>

                    {/* DYNAMIC EXPANDABLE CHAT INTERFACE (Direct Messenger) */}
                    {chattingOrderId === o.id && (
                      <div className="bg-white rounded-xl border-2 border-brand-dark p-4 mt-2 space-y-3">
                        <div className="flex justify-between items-center border-b border-brand-dark/10 pb-1.5 text-xs font-bold text-brand-dark">
                          <span>SMS Chat Interne MDB — Tunnel avec le Client</span>
                          <span className="text-[9px] font-mono text-gray-500">Réseau direct sécurisé</span>
                        </div>

                        {/* Speech bubbles board */}
                        <div className="space-y-2 h-40 overflow-y-auto p-2 bg-gray-50 rounded-lg">
                          {subMsgs.length === 0 ? (
                            <p className="text-[10px] text-gray-400 text-center py-6 italic">Aucun message envoyé. Dites bonjour au client pour l'assurer que son spaghetti arrive chaud !</p>
                          ) : (
                            subMsgs.map((m) => {
                              const isLivreur = m.senderRole === "livreur";
                              return (
                                <div key={m.id} className={`flex flex-col ${isLivreur ? 'items-end' : 'items-start'}`}>
                                  <div className={`p-2 rounded-xl max-w-[85%] text-xs ${
                                    isLivreur ? 'bg-brand-mango text-white rounded-tr-none' : 'bg-brand-cream text-brand-dark rounded-tl-none'
                                  }`}>
                                    {m.text}
                                  </div>
                                  <span className="text-[8px] text-gray-400 mt-0.5">{m.timestamp}</span>
                                </div>
                              );
                            })
                          )}
                        </div>

                        <form onSubmit={(e) => submitChatBubble(e, o.id)} className="flex items-center space-x-2">
                          <input
                            type="text"
                            placeholder="Saisissez votre note de route..."
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            className="flex-1 text-xs p-2 rounded-lg border-2 border-brand-dark bg-white"
                          />
                          <button
                            type="submit"
                            className="bg-brand-mango text-white font-bold text-xs px-3.5 py-2 rounded-lg border-2 border-brand-dark"
                          >
                            Envoyer
                          </button>
                        </form>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

      {/* OVERLAY POPUP FOR LIVE INTERACTIVE PHONE CALL DIALER */}
      {callingOrderId && (
        <div className="fixed inset-0 z-50 bg-brand-dark/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1C1F26] text-white w-80 rounded-3xl border-2 border-brand-mango shadow-2xl overflow-hidden flex flex-col items-center justify-between p-6 h-[400px] relative animate-in zoom-in-95 duration-200">
            
            <div className="absolute top-4 left-4 bg-[#6B8E4E] text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase animate-pulse">
              Appel GSM MDB
            </div>

            <div className="text-center space-y-2 mt-8">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-4xl mx-auto ring-4 ring-[#6B8E4E] border border-white/20">
                📲
              </div>
              <h4 className="font-semibold text-base">
                {orders.find((o) => o.id === callingOrderId)?.clientName || "Le Client"}
              </h4>
              <p className="text-xs text-brand-cream/60">
                {orders.find((o) => o.id === callingOrderId)?.clientPhone || "+237 ..."}
              </p>
            </div>

            {/* Sound waves graphic */}
            <div className="flex items-center justify-center space-x-1.5 h-12 w-full">
              {callActiveState === "ringing" ? (
                <p className="text-xs font-mono text-brand-mango animate-pulse">Recherche réseau ... 🔊</p>
              ) : (
                <>
                  <div className="w-1 h-6 bg-[#6B8E4E] rounded-full animate-bounce duration-500"></div>
                  <div className="w-1 h-3 bg-[#6B8E4E] rounded-full animate-bounce duration-300"></div>
                  <div className="w-1 h-9 bg-[#6B8E4E] rounded-full animate-bounce duration-750"></div>
                  <div className="w-1 h-4 bg-[#6B8E4E] rounded-full animate-bounce duration-400"></div>
                  <div className="w-1 h-7 bg-[#6B8E4E] rounded-full animate-bounce duration-600"></div>
                </>
              )}
            </div>

            <div className="text-center space-y-4 w-full">
              {callActiveState === "connected" && (
                <div className="text-xs text-brand-cream/80 flex items-center justify-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
                  <span className="font-mono font-bold">Encours : {Math.floor(callSeconds / 60)}:{(callSeconds % 60).toString().padStart(2, '0')}s</span>
                </div>
              )}

              <button
                onClick={hangUpCall}
                className="w-full py-3 bg-red-600 hover:bg-red-800 text-white font-extrabold text-xs rounded-full border-2 border-brand-dark shadow-lg transition-transform hover:scale-102 flex items-center justify-center space-x-1.5"
              >
                <X size={14} />
                <span>Raccrocher l'Appel mobile</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
