import React, { useState } from "react";
import { Shield, Truck, Edit, Save, ListFilter, Users, Map, PlusCircle, Check, DollarSign, Image, Download, FileSpreadsheet, FileText } from "lucide-react";
import { Order, Account, RoleType, GlobalStaffMessage } from "../types";
import { Restaurant, Dish } from "../data";

interface AdminWorkspaceProps {
  currentAccount: Account;
  orders: Order[];
  restaurants: Restaurant[];
  accounts: Account[];
  globalStaffMessages: GlobalStaffMessage[];
  customBrandName: string;
  customBrandSubtitle: string;
  customBrandIcon: string;
  orangeMoneyNumber: string;
  mtnMoneyNumber: string;
  waveMoneyNumber: string;
  contactWhatsApp: string;
  contactFacebook: string;
  contactEmail: string;
  onSetCustomBrandName: (v: string) => void;
  onSetCustomBrandSubtitle: (v: string) => void;
  onSetCustomBrandIcon: (v: string) => void;
  onSetOrangeMoneyNumber: (v: string) => void;
  onSetMtnMoneyNumber: (v: string) => void;
  onSetWaveMoneyNumber: (v: string) => void;
  onSetContactWhatsApp: (v: string) => void;
  onSetContactFacebook: (v: string) => void;
  onSetContactEmail: (v: string) => void;
  onModifyDish: (restaurantId: string, dishId: string, updatedPrice: number, updatedImage: string) => void;
  onModifyRestaurant: (restaurantId: string, updatedName: string, updatedSpecialty: string, updatedImage: string) => void;
  onRegisterStaff: (newAcc: Account) => void;
  onSendGlobalStaffMessage: (senderId: string, senderName: string, senderRole: Account['role'], text: string, recipientRole?: string) => void;
  triggerToast: (msg: string) => void;
}

export default function AdminWorkspace({
  currentAccount,
  orders,
  restaurants,
  accounts,
  globalStaffMessages,
  customBrandName,
  customBrandSubtitle,
  customBrandIcon,
  orangeMoneyNumber,
  mtnMoneyNumber,
  waveMoneyNumber,
  contactWhatsApp,
  contactFacebook,
  contactEmail,
  onSetCustomBrandName,
  onSetCustomBrandSubtitle,
  onSetCustomBrandIcon,
  onSetOrangeMoneyNumber,
  onSetMtnMoneyNumber,
  onSetWaveMoneyNumber,
  onSetContactWhatsApp,
  onSetContactFacebook,
  onSetContactEmail,
  onModifyDish,
  onModifyRestaurant,
  onRegisterStaff,
  onSendGlobalStaffMessage,
  triggerToast
}: AdminWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<'map' | 'orders' | 'hiring' | 'menus' | 'branding' | 'staff_comms'>('map');

  // CSV Export helper for spreadsheet accounting reports
  const exportDailyLedgerCSV = () => {
    if (orders.length === 0) {
      triggerToast("⚠️ Aucune commande enregistrée pour l'export.");
      return;
    }
    
    const headers = [
      "ID Commande",
      "Heure & Date",
      "Nom Client",
      "Telephone Client",
      "Adresse GPS / Commune",
      "Cafeteria",
      "Reglement",
      "Montant (FCFA)",
      "Livreur Motard",
      "Statut actuel"
    ];
    
    const rows = orders.map(o => [
      o.id,
      o.createdAt || "",
      o.clientName.replace(/;/g, ","),
      o.clientPhone.replace(/;/g, ","),
      o.clientCoords?.label?.replace(/;/g, ",") || "",
      o.restaurantName.replace(/;/g, ","),
      o.paymentMethod.toUpperCase(),
      o.total,
      o.livreurName || "Non assigne",
      o.status.toUpperCase()
    ]);
    
    // We use Semicolon for clean opening inside modern Excel/Sheets with European/Francophone regions
    const csvRows = [headers.join(";"), ...rows.map(r => r.map(v => `"${v}"`).join(";"))];
    const csvContent = "\uFEFF" + csvRows.join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStr = new Date().toLocaleDateString("fr-FR").replace(/\//g, "-");
    link.href = url;
    link.setAttribute("download", `MDB_Export_Comptabilite_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast("📥 Historique CSV de comptabilité exporté ! Excel compatible.");
  };

  // Grand Ledger accounting document exporter (.txt/PDF ready)
  const exportDailyLedgerPDF = () => {
    if (orders.length === 0) {
      triggerToast("⚠️ Aucune commande enregistrée pour l’export.");
      return;
    }

    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const deliveredCount = orders.filter(o => o.status === "delivered").length;
    const pendingCount = orders.filter(o => o.status === "pending" || o.status === "preparing" || o.status === "delivering").length;

    const reportContent = `========================================================================
             MDB RESTAURANTS & LOGISTIC S.A. CAMEROUN
         GRAND LIVRE COMPTABLE DE TRÉSORERIE JOURNALIÈRE
========================================================================
Date d'édition : ${new Date().toLocaleDateString("fr-FR")} à ${new Date().toLocaleTimeString("fr-FR")}
Généré par     : Auditeur Général — ${currentAccount.name}
Activité       : Centralisation Nationale d'Abonnement de Services

------------------------------------------------------------------------
📊 INDICATEURS CLÉS ET CONSOLIDATION
------------------------------------------------------------------------
Volume global de Commandes : ${orders.length} Bons
Livraisons Clôturées (✓)    : ${deliveredCount}
Bons en cours d'exécution   : ${pendingCount}
Recette Totale Validée      : ${orders.filter(o => o.status === "delivered").reduce((sum, o) => sum + o.total, 0).toLocaleString()} FCFA
Chiffre d'Affaires Brut    : ${totalRevenue.toLocaleString()} FCFA

------------------------------------------------------------------------
🧾 GRAND LIVRE DES COMMANDES DU JOUR
------------------------------------------------------------------------
${orders.map((o, idx) => `[BON COMPTABLE #${idx + 1}]
ID Unique  : ${o.id}
Date/Heure : ${o.createdAt || "N/A"}
Client     : ${o.clientName} (${o.clientPhone})
Livraison  : ${o.clientCoords?.label || "Non géolocalisé"}
Point Stand: ${o.restaurantName}
Coursier   : ${o.livreurName || "Non désigné"}
Paiement   : [${o.paymentMethod.toUpperCase()}]   |  Statut : ${o.status.toUpperCase()}
Montant    : ${o.total.toLocaleString()} FCFA
Détails d'articles : ${o.items.map(it => `${it.dish.name} (x${it.quantity})`).join(", ")}
------------------------------------------------------------------------`).join("\n")}

========================================================================
                      DÉPÔT CERTIFIÉ ET ARCHIVAL
========================================================================
Document à valeur comptable certifiée conforme pour la déclaration de TVA.
Validé à distance via le réseau MDB Douala / Yaoundé.

Service Administratif Comptable Cameroun.
========================================================================`;

    const blob = new Blob([reportContent], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStr = new Date().toLocaleDateString("fr-FR").replace(/\//g, "-");
    link.href = url;
    link.setAttribute("download", `MDB_Grand_Livre_Comptable_${dateStr}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast("📥 Grand Livre .TXT d'Audit téléchargé ! Prêt à imprimer/sauvegarder.");
  };

  // Tariff editor states
  const [selectedRestoId, setSelectedRestoId] = useState(restaurants[0]?.id || "");
  const [editingDishId, setEditingDishId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState(0);
  const [editImage, setEditImage] = useState("");

  // Cafeteria editing states
  const [selectedCafeId, setSelectedCafeId] = useState(restaurants[0]?.id || "");
  const [editCafeName, setEditCafeName] = useState("");
  const [editCafeSpecialty, setEditCafeSpecialty] = useState("");
  const [editCafeImage, setEditCafeImage] = useState("");

  React.useEffect(() => {
    const selectedCafe = restaurants.find(r => r.id === selectedCafeId);
    if (selectedCafe) {
      setEditCafeName(selectedCafe.name);
      setEditCafeSpecialty(selectedCafe.specialty);
      setEditCafeImage(selectedCafe.image || "");
    }
  }, [selectedCafeId, restaurants]);

  // Staff registry states
  const [staffRole, setStaffRole] = useState<'livreur' | 'gerant'>('livreur');
  const [staffName, setStaffName] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [staffPhone, setStaffPhone] = useState("");
  const [staffRestoId, setStaffRestoId] = useState(restaurants[0]?.id || "");
  const [staffProfilePic, setStaffProfilePic] = useState("");
  const [staffCniPic, setStaffCniPic] = useState("");
  
  // Simulated OTP confirmation for newly recruited staff
  const [staffOtpStep, setStaffOtpStep] = useState(false);
  const [staffSmsCode, setStaffSmsCode] = useState("");
  const [staffMailCode, setStaffMailCode] = useState("");
  const [expSms, setExpSms] = useState("");
  const [expMail, setExpMail] = useState("");

  const handleModifyPrice = (dish: Dish) => {
    setEditingDishId(dish.id);
    setEditPrice(dish.price);
    setEditImage(dish.image);
    triggerToast(`Modification ouverte pour: ${dish.name}`);
  };

  const saveDishModifications = (restoId: string, dishId: string) => {
    if (editPrice <= 0) {
      triggerToast("⚠️ Veuillez insérer un tarif valide supérieur à 0 FCFA !");
      return;
    }
    onModifyDish(restoId, dishId, editPrice, editImage);
    setEditingDishId(null);
    triggerToast("💸 Changements de carte & tarifs enregistrés avec succès !");
  };

  const triggerStaffOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName || !staffEmail || !staffPhone) {
      triggerToast("⚠️ Veuillez remplir le nom, email et numéro mobile.");
      return;
    }

    // Set mockup pictures instantly if empty
    const pPic = staffProfilePic || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80";
    const cPic = staffCniPic || "https://upload.wikimedia.org/wikipedia/commons/e/e1/Sample_Identity_Card_Cameroon.png";
    setStaffProfilePic(pPic);
    setStaffCniPic(cPic);

    // Create confirmation keys
    const smsVal = Math.floor(1000 + Math.random() * 9000).toString();
    const mailVal = Math.floor(1000 + Math.random() * 9000).toString();
    setExpSms(smsVal);
    setExpMail(mailVal);

    setStaffOtpStep(true);
    triggerToast(`📩 OTP SMS envoyé au +237 du livreur/gérant : ${smsVal}`);
    setTimeout(() => {
      triggerToast(`📧 OTP Gmail de validation : ${mailVal}`);
    }, 1300);
  };

  const finalizeStaffRecruitment = () => {
    if (staffSmsCode !== expSms || staffMailCode !== expMail) {
      triggerToast("❌ Codes OTP de confirmation erronés ! Vérifiez les alertes.");
      return;
    }

    const newStaff: Account = {
      id: "staff-" + Math.floor(Math.random() * 10000),
      name: staffName,
      email: staffEmail,
      phone: staffPhone,
      role: staffRole,
      profilePhoto: staffProfilePic,
      cniPhoto: staffCniPic,
      restaurantId: staffRole === "gerant" ? staffRestoId : undefined,
      verified: true,
      createdAt: new Date().toLocaleDateString("fr-FR")
    };

    onRegisterStaff(newStaff);
    
    // reset onboarding state
    setStaffOtpStep(false);
    setStaffName("");
    setStaffEmail("");
    setStaffPhone("");
    setStaffProfilePic("");
    setStaffCniPic("");
    setStaffSmsCode("");
    setStaffMailCode("");

    triggerToast(`🎉 Membre d'équipe MDB [${staffRole.toUpperCase()}] engagé et validé !`);
  };

  // Mock Delivery Riders Coordinates on the Map (Satisfies rider GPS layout specs)
  // Let's get list of active riders
  const activeRiders = accounts.filter((a) => a.role === "livreur");

  // Mock GPS location data points plotted on Cameroon layout mapping
  const cityPositions = [
    { label: "Carrefour Bastos (Yaoundé)", x: 45, y: 35 },
    { label: "Rond-Point Deido (Douala)", x: 25, y: 55 },
    { label: "Boulevard Akwa (Douala)", x: 30, y: 65 },
    { label: "Axe Omnisports (Yaoundé)", x: 55, y: 40 },
    { label: "Gare Routière Mvan (Yaoundé)", x: 50, y: 80 },
    { label: "Bonamoussadi Rond-point", x: 20, y: 25 }
  ];

  return (
    <div className="bg-white p-6 rounded-2xl border-2 border-brand-dark shadow-[6px_6px_0px_0px_rgba(26,20,16,1)] space-y-6">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-brand-dark/10 pb-4 gap-2">
        <div>
          <span className="text-[10px] font-mono tracking-widest font-black text-red-650 uppercase block">
            Espace Super-Contrôle National
          </span>
          <h2 className="font-display font-black text-2xl text-brand-dark flex items-center space-x-2">
            <Shield size={26} className="text-red-650" />
            <span>Workspace : Admin Général MDB</span>
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Gérez les prix, recrutez des livreurs/gérants avec CNI, tenez le grand livre journalier et pilotez le radar de la flotte.
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-900 rounded-xl px-3.5 py-1.5 text-xs font-semibold">
          Administrateur : <strong>{currentAccount.name}</strong>
        </div>
      </div>

      {/* Tabs selectors */}
      <div className="flex flex-wrap gap-2 border-b border-gray-150 pb-3">
        <button
          onClick={() => setActiveTab('map')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 border-2 ${
            activeTab === 'map'
              ? 'bg-brand-dark text-white border-brand-dark text-white'
              : 'bg-white text-gray-700 hover:text-brand-dark border-transparent'
          }`}
        >
          <Map size={14} />
          <span>📍 Radar Flotte Moto ({activeRiders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 border-2 ${
            activeTab === 'orders'
              ? 'bg-brand-dark text-white border-brand-dark text-white'
              : 'bg-white text-gray-700 hover:text-brand-dark border-transparent'
          }`}
        >
          <DollarSign size={14} />
          <span>📋 Commandes Journalières ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('hiring')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 border-2 ${
            activeTab === 'hiring'
              ? 'bg-brand-dark text-white border-brand-dark text-white'
              : 'bg-white text-gray-700 hover:text-brand-dark border-transparent'
          }`}
        >
          <Users size={14} />
          <span>🆕 Créer un compte Employé (Staff)</span>
        </button>

        <button
          onClick={() => setActiveTab('menus')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 border-2 ${
            activeTab === 'menus'
              ? 'bg-brand-dark text-white border-brand-dark text-white'
              : 'bg-white text-gray-700 hover:text-brand-dark border-transparent'
          }`}
        >
          <Edit size={14} />
          <span>🍲 Studio Tarifs & Cartes des Menus</span>
        </button>

        <button
          onClick={() => setActiveTab('branding')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 border-2 ${
            activeTab === 'branding'
              ? 'bg-brand-dark text-white border-brand-dark text-white'
              : 'bg-white text-gray-700 hover:text-brand-dark border-transparent'
          }`}
        >
          <span>🎨 Config Logo & Identité du Site</span>
        </button>

        <button
          onClick={() => setActiveTab('staff_comms')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 border-2 ${
            activeTab === 'staff_comms'
              ? 'bg-brand-dark text-white border-brand-dark text-white'
              : 'bg-white text-gray-700 hover:text-brand-dark border-transparent'
          }`}
        >
          <span>🎙️ UHF Radio Centralisée ({globalStaffMessages.length})</span>
        </button>
      </div>

      {/* 1. MAP OF DELIVERY RIDERS FLEET (RASTER GRAPHICAL TRUCK GPS LAYOUT) */}
      {activeTab === 'map' && (
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-xl border border-brand-dark/10 flex justify-between items-center text-xs">
            <span className="text-gray-500">Carte vectorielle interactive de suivi GPS des coursiers MDB à moto :</span>
            <span className="font-bold text-[#6B8E4E]">🟢 {activeRiders.length} Livreurs tracés</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Visual SVG schematic map of Yaoundé/Douala */}
            <div className="lg:col-span-8 bg-brand-cream/40 rounded-2xl border-2 border-brand-dark h-96 relative overflow-hidden flex items-center justify-center">
              
              {/* Backdrops */}
              <div className="absolute inset-0 pattern-grid-lg opacity-10"></div>
              
              {/* Schematic cities contours */}
              <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full border border-dashed border-brand-mango/30 bg-brand-mango/5 flex items-center justify-center">
                <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-brand-mango opacity-40">Yaoundé (Centre)</span>
              </div>

              <div className="absolute bottom-1/4 right-1/4 w-36 h-36 rounded-full border border-dashed border-blue-500/25 bg-blue-500/5 flex items-center justify-center">
                <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-blue-500 opacity-40">Douala (Littoral)</span>
              </div>

              <span className="absolute bottom-4 left-4 text-[10px] font-mono text-gray-500 font-bold uppercase">Carte logistique nationale MDB</span>

              {/* Plotted Rider Map Symbols */}
              {activeRiders.map((rider, idx) => {
                const pos = cityPositions[idx % cityPositions.length];
                return (
                  <div 
                    key={rider.id}
                    className="absolute z-10 p-1 bg-brand-dark text-white rounded-xl shadow-lg border border-brand-mango flex items-center space-x-1 hover:scale-105 transition-all text-[9.5px] cursor-pointer"
                    style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                  >
                    <span className="text-xs">🏍️</span>
                    <div>
                      <span className="font-bold block text-[8px] leading-none text-brand-mango truncate w-14">{rider.name.split(" ")[0]}</span>
                      <span className="text-[7px] text-gray-300 block font-mono truncate w-14">{pos.label.split(" ")[0]}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* List side log */}
            <div className="lg:col-span-4 bg-white p-4 rounded-xl border-2 border-brand-dark space-y-3.5 h-96 overflow-y-auto">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide block">Rapporteurs logistiques :</span>
              
              <div className="space-y-3">
                {activeRiders.map((rider, idx) => {
                  const pos = cityPositions[idx % cityPositions.length];
                  return (
                    <div key={rider.id} className="bg-brand-cream/30 p-2.5 rounded-lg border border-brand-dark/10 space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-brand-dark">{rider.name}</span>
                        <span className="text-[9px] bg-green-150 text-[#6B8E4E] font-bold px-1 py-0.2 rounded uppercase">GPS Active</span>
                      </div>
                      <p className="text-[10px] text-gray-600 font-medium">Position : {pos.label}</p>
                      <p className="text-[9px] text-gray-500 font-mono italic">Transmetteur SAT ID: MDB-GPS-{rider.id.toUpperCase()}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. DAILY ACCOUNTING ORDER LEDGER (JOURNAL JOURNALIER) */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-brand-cream/15 rounded-xl border-2 border-brand-dark gap-3 text-xs">
            <div className="space-y-1">
              <span className="font-mono text-gray-400 font-extrabold text-[9px] uppercase tracking-wider block">ANALYSE DE RECETTES & CENTRALE DE COMPTABILITÉ</span>
              <div className="font-extrabold text-brand-dark">
                Recettes Brutes Prévisionnelles :{" "}
                <strong className="text-xl text-[#6B8E4E]">
                  {orders.reduce((acc, o) => acc + o.total, 0).toLocaleString()} FCFA
                </strong>
              </div>
              <div className="text-[10px] text-gray-500 font-medium">
                Encaissé Réel (Commandes Livrées ✓) : <strong className="text-[#6B8E4E]">{orders.filter(o => o.status === "delivered").reduce((acc, o) => acc + o.total, 0).toLocaleString()} FCFA</strong> • Activité : <strong className="text-brand-mango">{orders.length} Commandes au total</strong>
              </div>
            </div>

            {orders.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={exportDailyLedgerCSV}
                  className="px-3.5 py-2 bg-[#6B8E4E] text-white hover:bg-brand-dark rounded-xl text-[11px] font-bold font-mono transition-all flex items-center space-x-1.5 shadow-[2px_2px_0px_0px_rgba(26,20,16,1)] hover:translate-y-[-1px]"
                >
                  <FileSpreadsheet size={13} />
                  <span>Télécharger CSV (Excel)</span>
                </button>
                <button
                  type="button"
                  onClick={exportDailyLedgerPDF}
                  className="px-3.5 py-2 bg-brand-mango text-white hover:bg-brand-dark rounded-xl text-[11px] font-bold font-mono transition-all flex items-center space-x-1.5 shadow-[2px_2px_0px_0px_rgba(26,20,16,1)] hover:translate-y-[-1px]"
                >
                  <FileText size={13} />
                  <span>Grand Livre Comptable (PDF)</span>
                </button>
              </div>
            )}
          </div>

          {orders.length === 0 ? (
            <div className="p-12 text-center text-xs text-gray-400 border border-dashed rounded-xl">
              Aucune commande logée dans les serveurs pour l'instant.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-brand-dark/15 shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-brand-dark text-white font-black text-[10px] uppercase tracking-wider">
                    <th className="p-3">Réf Commande</th>
                    <th className="p-3">Heure/Date</th>
                    <th className="p-3">Client</th>
                    <th className="p-3">Cafétéria</th>
                    <th className="p-3">Mode Paiement</th>
                    <th className="p-3">Montant Brut</th>
                    <th className="p-3">Livreur Moto</th>
                    <th className="p-3">Statut Actuel</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150 bg-white">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-brand-cream/10 text-brand-dark">
                      <td className="p-3 font-mono font-bold text-brand-mango">{o.id}</td>
                      <td className="p-3 font-mono">{o.createdAt}</td>
                      <td className="p-3">
                        <span className="font-semibold block">{o.clientName}</span>
                        <span className="text-[10px] text-gray-400 block">{o.clientPhone}</span>
                      </td>
                      <td className="p-3 font-medium text-gray-700">{o.restaurantName}</td>
                      <td className="p-3">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-[#6B8E4E]/10 text-[#6B8E4E]">
                          {o.paymentMethod.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-extrabold">
                        <div>{o.total.toLocaleString()} F</div>
                        {o.tip && o.tip > 0 ? (
                          <div className="text-[10px] text-emerald-600 font-sans font-medium">Pourboire: {o.tip.toLocaleString()} F</div>
                        ) : null}
                      </td>
                      <td className="p-3 font-medium text-purple-800">{o.livreurName || "Non assigné"}</td>
                      <td className="p-3">
                        <span className="text-[10px] font-black uppercase text-brand-dark">{o.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 3. STAFF HIRING OFFICE (CREATOR FOR MANAGERS & RIDERS CODES) */}
      {activeTab === 'hiring' && (
        <div className="bg-brand-cream/5 p-5 rounded-2xl border-2 border-brand-dark max-w-2xl mx-auto">
          <h3 className="font-display font-black text-sm uppercase text-[#6B8E4E] pb-3 mb-4 border-b border-brand-dark/10 flex items-center space-x-1.5">
            <PlusCircle size={16} />
            <span>Onboarding et Création de profils Salariés (Recrutement)</span>
          </h3>

          {!staffOtpStep ? (
            <form onSubmit={triggerStaffOnboarding} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">Rôle Professionnel</label>
                  <select
                    value={staffRole}
                    onChange={(e) => setStaffRole(e.target.value as 'livreur' | 'gerant')}
                    className="w-full text-xs p-2.5 rounded-xl border-2 border-brand-dark bg-white font-bold"
                  >
                    <option value="livreur">Livreur à moto 🏍️ (Versement bimensuel)</option>
                    <option value="gerant">Gérant de Maquis 👩🏾‍🍳 (Propriétaire de stand)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">Nom du Salarié</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Abbo Bello"
                    value={staffName}
                    onChange={(e) => setStaffName(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border-2 border-brand-dark bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">Email Professionnel</label>
                  <input
                    type="email"
                    required
                    placeholder="Ex: abbo.bello@mboa.cm"
                    value={staffEmail}
                    onChange={(e) => setStaffEmail(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border-2 border-brand-dark bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">Mobile de Coordination</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: +237 688990011"
                    value={staffPhone}
                    onChange={(e) => setStaffPhone(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border-2 border-brand-dark bg-white"
                  />
                </div>

                {staffRole === "gerant" && (
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-gray-500 block mb-1">Cafétéria à diriger</label>
                    <select
                      value={staffRestoId}
                      onChange={(e) => setStaffRestoId(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border-2 border-brand-dark bg-white"
                    >
                      {restaurants.map((r) => (
                        <option key={r.id} value={r.id}>{r.name} ({r.commune})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-brand-dark/10 space-y-2 text-[11px] text-gray-500 leading-normal">
                <span className="font-bold text-brand-dark block">📌 Contrôle d'inscription obligatoire Cameroun :</span>
                <p>En initiant ce dépôt de candidature, la plateforme MDB va pré-générer un profil et lui assigner un code CNI fictif ainsi qu'une photo de profil d'agent. L'employé devra confirmer les OTP recus pour activer son compte.</p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-brand-mango hover:bg-brand-dark text-white font-bold text-xs rounded-xl border-2 border-brand-dark shadow-[4px_4px_0px_0px_rgba(26,20,16,1)] transition-transform active:translate-y-0 hover:translate-y-[-2px]"
                >
                  Suivant : Confirmation OTP d'enregistrement
                </button>
              </div>
            </form>
          ) : (
            /* Recruit OTP validation */
            <div className="space-y-4 text-center max-w-sm mx-auto">
              <p className="text-xs text-brand-dark leading-normal">
                Saisissez les codes d'authentification requis pour enrôler <strong>{staffName}</strong> comme <strong>{staffRole.toUpperCase()}</strong> :
              </p>

              <div className="grid grid-cols-2 gap-4 text-left">
                <div className="bg-white p-3 rounded-lg border border-brand-dark/10">
                  <span className="text-[10px] font-bold text-gray-400 block mb-1 uppercase">Code SMS</span>
                  <input
                    type="text"
                    placeholder="SMS Code"
                    value={staffSmsCode}
                    onChange={(e) => setStaffSmsCode(e.target.value)}
                    className="w-full font-mono text-center font-bold text-xs p-1.5 border border-brand-dark/30 rounded"
                  />
                  <span className="text-[9px] block text-green-600 mt-1">Mock : <strong>{expSms}</strong></span>
                </div>

                <div className="bg-white p-3 rounded-lg border border-brand-dark/10">
                  <span className="text-[10px] font-bold text-gray-400 block mb-1 uppercase">Code E-mail</span>
                  <input
                    type="text"
                    placeholder="Mail Code"
                    value={staffMailCode}
                    onChange={(e) => setStaffMailCode(e.target.value)}
                    className="w-full font-mono text-center font-bold text-xs p-1.5 border border-brand-dark/30 rounded"
                  />
                  <span className="text-[9px] block text-red-650 mt-1">Mock : <strong>{expMail}</strong></span>
                </div>
              </div>

              <div className="pt-3 flex justify-between">
                <button type="button" onClick={() => setStaffOtpStep(false)} className="text-xs underline text-gray-400">Retour</button>
                <button
                  type="button"
                  onClick={finalizeStaffRecruitment}
                  className="px-4 py-2 bg-[#6B8E4E] text-white font-bold text-xs rounded border-2 border-brand-dark"
                >
                  Engager & Activer Compte ✓
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. TARIFF & MENU EDITING SYSTEM (STUDIO TARIFS & CARTES) */}
      {activeTab === 'menus' && (
        <div className="space-y-6">
          <div className="bg-brand-orange bg-opacity-10 p-4 rounded-xl border border-[#E8762C]/20 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs gap-3">
            <div>
              <span className="font-bold text-[#E8762C] block">Direct Menu Customizer Panel :</span>
              <span className="text-gray-500">Sélectionnez une cafétéria, éditez les prix en FCFA ou configurez les images de vos repas en temps réel.</span>
            </div>
            <div>
              <select
                value={selectedRestoId}
                onChange={(e) => setSelectedRestoId(e.target.value)}
                className="p-2 bg-white rounded-lg border-2 border-brand-dark font-bold text-xs"
              >
                {restaurants.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* List of dishes for the selected restaurant */}
          {(() => {
            const currentResto = restaurants.find((r) => r.id === selectedRestoId);
            if (!currentResto) return <p className="text-xs text-gray-400">Aucune cafeteria sélectionnée</p>;

            return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {currentResto.dishes.map((dish) => {
                  const isEditing = editingDishId === dish.id;
                  return (
                    <div key={dish.id} className="bg-brand-cream/15 p-4 rounded-2xl border-2 border-brand-dark flex flex-col justify-between">
                      <div>
                        {/* Dish preview picture */}
                        <img
                          src={isEditing ? editImage : dish.image}
                          alt={dish.name}
                          className="w-full h-32 rounded-xl object-cover border-2 border-brand-dark mb-4 shadow-inner"
                        />

                        {isEditing ? (
                          <div className="space-y-3">
                            <div>
                              <label className="text-[10px] font-bold text-gray-400 block mb-1">Nom du Plat</label>
                              <p className="text-xs font-bold text-brand-dark">{dish.name}</p>
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-gray-400 block mb-1">Tarif Client (en FCFA)</label>
                              <input
                                type="number"
                                value={editPrice}
                                onChange={(e) => setEditPrice(Math.max(0, parseInt(e.target.value) || 0))}
                                className="w-full text-xs p-2 rounded-lg border-2 border-brand-dark bg-white font-mono font-bold"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-gray-500 block mb-1">Adresse Image (URL)</label>
                              <input
                                type="text"
                                value={editImage}
                                onChange={(e) => setEditImage(e.target.value)}
                                className="w-full text-xs p-2 rounded-lg border-2 border-brand-dark bg-white font-mono"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <h4 className="font-bold text-sm text-brand-dark line-clamp-1">{dish.name}</h4>
                            <p className="text-[11px] text-gray-500 line-clamp-3 leading-normal h-12">{dish.description}</p>
                            <p className="text-xs font-black text-[#6B8E4E] pt-2 font-mono">
                              Tarif Actuel : <span className="text-lg">{dish.price.toLocaleString()} FCFA</span>
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t border-brand-dark/10 mt-4">
                        {isEditing ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setEditingDishId(null)}
                              className="flex-1 py-1.5 bg-white text-gray-700 hover:text-brand-dark font-semibold text-xs rounded border border-brand-dark"
                            >
                              Annuler
                            </button>
                            <button
                              onClick={() => saveDishModifications(currentResto.id, dish.id)}
                              className="flex-1 py-1.5 bg-[#6B8E4E] text-white font-extrabold text-xs rounded border-2 border-brand-dark shadow flex items-center justify-center space-x-1"
                            >
                              <Save size={12} />
                              <span>Sauvegarder</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleModifyPrice(dish)}
                            className="w-full py-1.5 bg-white hover:bg-brand-cream text-brand-dark font-bold text-xs rounded border-2 border-brand-dark shadow flex items-center justify-center space-x-1"
                          >
                            <Edit size={12} />
                            <span>Modifier Photo / Prix</span>
                          </button>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* 5. BRANDING CUSTOMIZER TAB VIEW */}
      {activeTab === 'branding' && (
        <div className="bg-brand-cream/15 p-6 rounded-2xl border-2 border-brand-dark space-y-6">
          <div className="border-b border-brand-dark/15 pb-4">
            <h3 className="font-display font-[900] text-lg text-brand-dark">🎨 Customisation Visuelle & Logo du Site Web</h3>
            <p className="text-xs text-gray-500 mt-1">Changer instantanément le Logo, le Titre et la description de MDB et observez sa persistance magique !</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              
              {/* Dual Selector: Emoji Textbox or Local File Upload */}
              <div className="bg-white p-4 rounded-xl border border-brand-dark/15 space-y-3.5 shadow-sm">
                <span className="text-xs font-black text-gray-700 block uppercase tracking-wide font-mono">🖼️ Logo de Marque</span>
                
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-gray-500 block mb-1">OPTION A : Utiliser un Émoji ou Icône texte</label>
                    <input
                      type="text"
                      maxLength={10}
                      value={customBrandIcon.startsWith("http") || customBrandIcon.startsWith("data:image/") ? "" : customBrandIcon}
                      onChange={(e) => {
                        onSetCustomBrandIcon(e.target.value || "🍲");
                        triggerToast("Icône du logo mise à jour ! 🎨");
                      }}
                      className="w-full text-xs p-2.5 rounded-lg border-2 border-brand-dark bg-white font-bold"
                      placeholder="Ex: 🍲, 🏍️, 🌶️, 🇨🇲, 🥭..."
                    />
                  </div>

                  <div className="border-t border-dashed border-gray-200 pt-3">
                    <label className="text-[10px] font-black text-gray-500 block mb-2">OPTION B : Charger une photo depuis votre Galerie / Téléphone</label>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#E8762C] to-[#AF4E12] flex items-center justify-center text-white font-extrabold text-xl shadow-inner border-2 border-brand-dark overflow-hidden flex-shrink-0">
                        {customBrandIcon.startsWith("http") || customBrandIcon.startsWith("data:image/") ? (
                          <img src={customBrandIcon} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <span className="text-2xl">{customBrandIcon || "🍲"}</span>
                        )}
                      </div>
                      
                      <div className="flex-1 space-y-1.5ClassName">
                        <label className="cursor-pointer inline-flex items-center space-x-2 px-3 py-2 bg-brand-dark text-white rounded-lg text-xs font-bold hover:bg-brand-mango transition-all shadow-sm">
                          <Download size={12} className="rotate-180" />
                          <span>Importer une photo...</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (file.size > 1.5 * 1024 * 1024) {
                                  triggerToast("⚠️ Image trop volumineuse. Choisissez une image de moins de 1.5 Mo.");
                                  return;
                                }
                                const reader = new FileReader();
                                reader.onload = (uploadEvent) => {
                                  const base64Str = uploadEvent.target?.result as string;
                                  if (base64Str) {
                                    onSetCustomBrandIcon(base64Str);
                                    triggerToast("🚀 Nouveau logo de votre galerie appliqué avec succès !");
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                        <p className="text-[9px] text-gray-400 block leading-tight">PNG, JPG, WEBP. S'adapte en format carré.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reset button if custom picture logo is loaded */}
                {(customBrandIcon.startsWith("http") || customBrandIcon.startsWith("data:image/")) && (
                  <div className="pt-2 border-t border-gray-100 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        onSetCustomBrandIcon("🍲");
                        triggerToast("🔄 Logo réinitialisé à l'icône marmite par défaut !");
                      }}
                      className="text-[9px] text-red-600 underline font-extrabold hover:text-brand-dark transition-colors"
                    >
                      Revenir à la marmite emoji par défaut 🍲
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-black text-gray-600 block mb-1">Titre Principal de la Marque (Ex: MDB RESTAURANT DELIVERY, MDB Express)</label>
                <input
                  type="text"
                  value={customBrandName}
                  onChange={(e) => {
                    onSetCustomBrandName(e.target.value);
                    triggerToast("Nom de marque mis à jour ! ✍️");
                  }}
                  className="w-full text-xs p-3 rounded-lg border-2 border-brand-dark bg-white font-bold"
                  placeholder="Ex: MDB Fast Delivery"
                />
              </div>

              <div>
                <label className="text-xs font-black text-gray-600 block mb-1">Slogan / Sous-titre de la Marque</label>
                <input
                  type="text"
                  value={customBrandSubtitle}
                  onChange={(e) => onSetCustomBrandSubtitle(e.target.value)}
                  className="w-full text-xs p-3 rounded-lg border-2 border-brand-dark bg-white"
                  placeholder="Ex: ★ Le meilleur goût du Cameroun ★"
                />
              </div>

              {/* Grand section to edit cafeteria names and images */}
              <div className="pt-4 border-t-2 border-brand-dark/10 space-y-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-brand-dark uppercase tracking-wider flex items-center space-x-1">
                    <span>🏪 Édition des Cafétérias de la Plateforme (Noms & Clichés)</span>
                  </h4>
                  <p className="text-[10px] text-gray-500 leading-normal">
                    Sélectionnez une cafétéria ci-dessous pour modifier son nom affiché, sa spécialité culinaire et son cliché réel en direct :
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl border-2 border-brand-dark space-y-4 shadow-sm">
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 block mb-1">Sélectionner la Cafétéria à modifier</label>
                    <select
                      value={selectedCafeId}
                      onChange={(e) => setSelectedCafeId(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border-2 border-brand-dark bg-white font-bold animate-pulse"
                    >
                      {restaurants.map((r) => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 block mb-1 font-semibold text-brand-dark">Nom Réel de la Cafétéria</label>
                      <input
                        type="text"
                        value={editCafeName}
                        onChange={(e) => setEditCafeName(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-lg border-2 border-brand-dark bg-white font-bold text-brand-dark"
                        placeholder="Ex: La Nouvelle Cafétéria du Nord"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 block mb-1 font-semibold text-brand-dark">Spécialité culinaire</label>
                      <input
                        type="text"
                        value={editCafeSpecialty}
                        onChange={(e) => setEditCafeSpecialty(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-lg border border-brand-dark bg-white text-brand-dark"
                        placeholder="Ex: Spaghetti-Omelette Champion, Soya & Koki"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 block mb-1 font-semibold">URL de Cliché Réel (Unsplash, etc.)</label>
                    <div className="flex items-center space-x-3">
                      {editCafeImage ? (
                        <img 
                          src={editCafeImage} 
                          alt="Cover preview" 
                          className="w-16 h-12 rounded object-cover border-2 border-brand-dark flex-shrink-0" 
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.src = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200";
                          }}
                        />
                      ) : (
                        <div className="w-16 h-12 rounded bg-gray-100 flex items-center justify-center text-sm border">🖼️</div>
                      )}
                      
                      <div className="flex-1 space-y-1">
                        <input
                          type="text"
                          value={editCafeImage}
                          onChange={(e) => setEditCafeImage(e.target.value)}
                          className="w-full text-xs p-2 rounded-lg border border-brand-dark font-mono bg-white"
                          placeholder="Coller l'adresse URL absolue de la photo réelle de l'établissement"
                        />
                        <div className="flex items-center space-x-2">
                          <label className="cursor-pointer text-[10px] font-bold text-[#E8762C] hover:underline flex items-center space-x-1">
                            <span>📤 Importer une photo réelle...</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (loadEvent) => {
                                    const base64Str = loadEvent.target?.result as string;
                                    if (base64Str) {
                                      setEditCafeImage(base64Str);
                                      triggerToast("Photo importée avec succès !");
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        onModifyRestaurant(selectedCafeId, editCafeName, editCafeSpecialty, editCafeImage);
                        triggerToast(`💾 Modifications de la cafétéria "${editCafeName}" enregistrées avec succès !`);
                      }}
                      className="px-4 py-2.5 bg-[#E8762C] hover:bg-brand-dark text-[#FFF] rounded-xl text-xs font-bold font-mono flex items-center space-x-1.5 cursor-pointer shadow-sm border-2 border-brand-dark"
                    >
                      <Save size={13} />
                      <span>ENREGISTRER L'ÉTABLISSEMENT</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* online payment receiver configurations requested by user */}
              <div className="pt-4 border-t-2 border-brand-dark/10 space-y-3.5">
                <h4 className="text-xs font-black text-brand-dark uppercase tracking-wider flex items-center space-x-1">
                  <span>💵 Numéros de Réception des Paiements Mobile</span>
                </h4>
                <p className="text-[10px] text-gray-500 leading-normal">
                  Configurez les comptes Orange Money, MTN MoMo et Wave sur lesquels les clients effectueront leurs transferts directs lors des livraisons :
                </p>

                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-orange-600 block mb-1 uppercase font-mono">🍊 Compte Orange Money Réception</label>
                    <input
                      type="text"
                      value={orangeMoneyNumber}
                      onChange={(e) => {
                        onSetOrangeMoneyNumber(e.target.value);
                        triggerToast("Numéro Orange Money mis à jour ! 🍊");
                      }}
                      className="w-full text-xs p-2 rounded-lg border-2 border-brand-dark bg-white font-mono font-bold"
                      placeholder="Ex: +237 688 84 91 00"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-amber-600 block mb-1 uppercase font-mono">💳 Compte MTN Mobile Money (MoMo)</label>
                    <input
                      type="text"
                      value={mtnMoneyNumber}
                      onChange={(e) => {
                        onSetMtnMoneyNumber(e.target.value);
                        triggerToast("Numéro MTN MoMo mis à jour ! 💳");
                      }}
                      className="w-full text-xs p-2 rounded-lg border-2 border-brand-dark bg-white font-mono font-bold"
                      placeholder="Ex: +237 677 88 99 00"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-blue-600 block mb-1 uppercase font-mono">📲 Compte Wave Cameroun</label>
                    <input
                      type="text"
                      value={waveMoneyNumber}
                      onChange={(e) => {
                        onSetWaveMoneyNumber(e.target.value);
                        triggerToast("Numéro Wave mis à jour ! 📲");
                      }}
                      className="w-full text-xs p-2 rounded-lg border-2 border-brand-dark bg-white font-mono font-bold"
                      placeholder="Ex: +237 655 44 33 22"
                    />
                  </div>
                </div>

                {/* Coordonnées de Contact editable by Administrator */}
                <div className="pt-3 border-t border-dashed border-gray-200 space-y-3">
                  <span className="text-[10px] font-black text-brand-dark block uppercase tracking-wide font-mono">
                    👥 COORDONNÉES DE CONTACT PUBLIC (WHATSAPP, FACEBOOK, EMAIL)
                  </span>

                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="text-[10px] font-black text-[#25D366] block mb-1 uppercase font-mono">💬 Numéro WhatsApp Public</label>
                      <input
                        type="text"
                        value={contactWhatsApp}
                        onChange={(e) => {
                          onSetContactWhatsApp(e.target.value);
                          triggerToast("Coordonnée WhatsApp publique mise à jour ! 💬");
                        }}
                        className="w-full text-xs p-2.5 rounded-lg border-2 border-brand-dark bg-white font-mono font-bold"
                        placeholder="Ex: +237 677 88 99 00"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-[#1877F2] block mb-1 uppercase font-mono">👤 URL du profil Facebook</label>
                      <input
                        type="text"
                        value={contactFacebook}
                        onChange={(e) => {
                          onSetContactFacebook(e.target.value);
                          triggerToast("Coordonnée Facebook publique mise à jour ! 👤");
                        }}
                        className="w-full text-xs p-2.5 rounded-lg border-2 border-brand-dark bg-white font-mono"
                        placeholder="Ex: https://facebook.com/nomdepage"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-[#E8762C] block mb-1 uppercase font-mono">📧 Adresse E-mail Publique</label>
                      <input
                        type="text"
                        value={contactEmail}
                        onChange={(e) => {
                          onSetContactEmail(e.target.value);
                          triggerToast("Adresse e-mail publique mise à jour ! 📧");
                        }}
                        className="w-full text-xs p-2.5 rounded-lg border-2 border-brand-dark bg-white font-mono"
                        placeholder="Ex: contact@mdbrestaurant.com"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* PREVIEW WIDGET */}
            <div className="p-5 bg-white rounded-2xl border-2 border-dashed border-brand-dark/30 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 block mb-3 font-semibold">Aperçu en Direct de l'En-tête</span>
                <div className="p-4 bg-brand-cream/45 rounded-xl border-2 border-brand-dark flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#E8762C] to-[#AF4E12] flex items-center justify-center text-white font-extrabold text-2xl shadow-md border-2 border-brand-dark overflow-hidden">
                    {customBrandIcon.startsWith("http") || customBrandIcon.startsWith("data:image/") ? (
                      <img src={customBrandIcon} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      customBrandIcon || "🍲"
                    )}
                  </div>
                  <div>
                    <span className="font-display font-[950] text-lg tracking-tight text-brand-dark block text-left">
                      {customBrandName.split(" ")[0]} <span className="text-brand-mango">{customBrandName.split(" ").slice(1).join(" ") || "Services"}</span>
                    </span>
                    <span className="text-[9px] font-mono tracking-widest text-[#6B8E4E] uppercase block font-semibold text-left">
                      {customBrandSubtitle}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 text-green-800 p-3 rounded-xl border border-green-200 mt-4 text-[11px] leading-relaxed">
                ℹ️ <strong>Remarque :</strong> Les modifications de l'identité de marque sont enregistrées de façon permanente dans le stockage local ! Tous les gérants, clients et livreurs verront instantanément cette nouvelle identité de marque !
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. UHF COMMUNICATIONS DASHBOARD (ADMIN CENTRAL CONTROLLER) */}
      {activeTab === 'staff_comms' && (
        <div className="bg-slate-900 text-white rounded-2xl border-2 border-brand-dark p-6 space-y-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-red-600 text-[10px] font-black text-white font-mono px-5 py-1 uppercase tracking-widest rounded-bl-3xl animate-pulse">
            🚨 POSTE DE CONTRÔLE UHF CENTRAL
          </div>

          <div className="border-b border-white/10 pb-4">
            <span className="text-[10px] font-mono tracking-widest text-red-400 font-bold block uppercase">
              Émetteur central national MDB Services S.A.
            </span>
            <h3 className="font-display font-[950] text-xl text-white">
              Centrale Radio UHF - Communiquer avec les Gérants & Livreurs
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Émettez des directives impératives ou évaluez l'avancement des livraisons à moto de l'ensemble du territoire camerounais en direct.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Feed Left Column */}
            <div className="lg:col-span-8 space-y-4">
              <span className="text-[10px] font-mono font-bold tracking-wider text-gray-400 block uppercase">
                📜 HISTORIQUE AUDIO ET DIRECTIVES TRANSMISES ({globalStaffMessages.length}) :
              </span>

              <div className="p-4 bg-slate-950 rounded-2xl border border-white/10 h-96 overflow-y-auto space-y-3 messages-box font-mono text-xs">
                {globalStaffMessages.length === 0 ? (
                  <p className="text-gray-500 italic text-center py-20 font-sans">Aucun message sur le réseau national.</p>
                ) : (
                  globalStaffMessages.map((msg) => {
                    let roleBadge = "bg-amber-500/10 text-brand-mango border border-brand-mango/25 text-[8px]";
                    if (msg.senderRole === "admin") {
                      roleBadge = "bg-red-500/20 text-red-400 border border-red-500/30 text-[8px] font-black";
                    } else if (msg.senderRole === "livreur") {
                      roleBadge = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-[8px]";
                    } else if (msg.senderRole === "gerant") {
                      roleBadge = "bg-blue-500/10 text-blue-400 border border-blue-500/25 text-[8px]";
                    }

                    const isMe = msg.senderId === currentAccount.id;

                    return (
                      <div key={msg.id} className="p-3 rounded-xl bg-slate-900 border border-white/5 leading-relaxed space-y-1">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-bold text-gray-100 flex items-center">
                            {isMe ? "🎯 Moi (Administrateur)" : `👤 ${msg.senderName}`}
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className={`px-1 rounded-full uppercase font-black tracking-wide ${roleBadge}`}>
                              {msg.senderRole}
                            </span>
                            <span className="text-gray-500">{msg.timestamp}</span>
                          </div>
                        </div>
                        <p className="text-gray-300 font-sans text-[13px]">{msg.text}</p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Quick commands & custom Broadcast compiler right Column */}
            <div className="lg:col-span-4 space-y-5">
              <div className="bg-slate-950 p-4.5 rounded-2xl border border-white/10 space-y-3.5">
                <span className="text-[10px] font-mono tracking-wider font-extrabold text-[#6B8E4E] block uppercase">
                  📢 DIRECTIVE DE DIRECTION EN 1 CLIC :
                </span>
                
                <div className="space-y-2">
                  {[
                    { text: "⚡ COMPTABILITÉ: Veuillez centraliser vos encaissements et exporter vos bilans CSV journaliers.", icon: "📊" },
                    { text: "🚨 RAPPEL MOTO: Conduite prudente obligatoire. Pluie abondante de moussons sur tout le Cameroun !", icon: "⛈️" },
                    { text: "🍗 CUISINE: Forte demande sur le Soya et Ndolé. Gardez les marmites bien chargées !", icon: "👨‍🍳" },
                    { text: "🎉 FÉLICITATIONS: Record de chiffre d'affaires franchi ce midi ! Bravo à tous.", icon: "🏆" }
                  ].map((preset, pr_idx) => (
                    <button
                      key={pr_idx}
                      type="button"
                      onClick={() => {
                        onSendGlobalStaffMessage(
                          currentAccount.id,
                          currentAccount.name,
                          "admin",
                          preset.text
                        );
                        triggerToast("Radio centralisée 📡: Directive diffusée !");
                      }}
                      className="w-full text-left p-2.5 bg-slate-900 hover:bg-slate-800 rounded-lg text-[11px] leading-snug text-gray-200 hover:text-white transition flex items-start gap-1.5 border border-white/5"
                    >
                      <span className="text-sm mt-0.5">{preset.icon}</span>
                      <span>{preset.text}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom micro emitter */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono tracking-wider text-gray-400 block uppercase">
                  🎙️ MICROPHONE CENTRAL (DIFFUSION D'ALERTE) :
                </span>
                
                <textarea
                  id="adminGlobalInput"
                  rows={4}
                  placeholder="Saisissez un message de service sur la fréquence UHF nationale..."
                  className="w-full text-xs p-3 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 font-sans"
                />
                
                <button
                  type="button"
                  onClick={() => {
                    const textEl = document.getElementById("adminGlobalInput") as HTMLTextAreaElement;
                    if (textEl && textEl.value.trim()) {
                      onSendGlobalStaffMessage(
                        currentAccount.id,
                        currentAccount.name,
                        "admin",
                        textEl.value.trim()
                      );
                      textEl.value = "";
                      triggerToast("Radio UHF 🚨: Message officiel diffusé à toute l'équipe !");
                    } else {
                      triggerToast("⚠️ Veuillez d'abord rédiger le message.");
                    }
                  }}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-800 text-white text-xs font-black uppercase rounded-xl border border-black shadow-md transition-all"
                >
                  📡 Diffuser l'instruction officielle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
