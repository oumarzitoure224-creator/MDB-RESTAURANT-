import React, { useState } from "react";
import { User, Shield, Check, Smartphone, Mail, FileText, LogIn, UserPlus, Cpu, Activity, HardDrive, Globe, Lock } from "lucide-react";
import { Account, RoleType } from "../types";
import { Restaurant } from "../data";

interface AccountConsoleProps {
  currentAccount: Account | null;
  accounts: Account[];
  restaurants: Restaurant[];
  onSelectAccount: (account: Account | null) => void;
  onRegisterAccount: (newAcc: Account) => void;
  triggerToast: (msg: string) => void;
}

export default function AccountConsole({
  currentAccount,
  accounts,
  restaurants,
  onSelectAccount,
  onRegisterAccount,
  triggerToast
}: AccountConsoleProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [recoveryTarget, setRecoveryTarget] = useState("");
  const [recoveryStatus, setRecoveryStatus] = useState<"idle" | "sending" | "success" | "failed">("idle");
  const [recoveredMsg, setRecoveredMsg] = useState("");
  const [regRole, setRegRole] = useState<RoleType>("client");
  const [regCountry, setRegCountry] = useState("Cameroun 🇨🇲");
  
  const countriesList = [
    { name: "Cameroun", flag: "🇨🇲", code: "+237" },
    { name: "Gabon", flag: "🇬🇦", code: "+241" },
    { name: "Côte d'Ivoire", flag: "🇨🇮", code: "+225" },
    { name: "Sénégal", flag: "🇸🇳", code: "+221" },
    { name: "Mali", flag: "🇲🇱", code: "+223" },
    { name: "Guinée", flag: "🇬🇳", code: "+224" },
    { name: "Rép. Dém. Congo", flag: "🇨🇩", code: "+243" },
    { name: "France", flag: "🇫🇷", code: "+33" },
    { name: "Canada", flag: "🇨🇦", code: "+1" },
    { name: "Belgique", flag: "🇧🇪", code: "+32" },
    { name: "États-Unis", flag: "🇺🇸", code: "+1" },
  ];

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("+237 ");
  const [regReferredByCode, setRegReferredByCode] = useState("");
  const [regRestaurantId, setRegRestaurantId] = useState(restaurants[0]?.id || "");
  
  // Photo uploads
  const [profilePic, setProfilePic] = useState<string>("");
  const [cniPic, setCniPic] = useState<string>("");
  
  // OTP process states & loader
  const [otpStep, setOtpStep] = useState(false);
  const [smsOtpEntered, setSmsOtpEntered] = useState("");
  const [emailOtpEntered, setEmailOtpEntered] = useState("");
  const [expectedSmsOtp, setExpectedSmsOtp] = useState("");
  const [expectedEmailOtp, setExpectedEmailOtp] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStatusDetail, setEmailStatusDetail] = useState<"idle" | "sending" | "success" | "simulated" | "failed">("idle");

  const handleProfileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result as string);
        triggerToast("Photo de profil enregistrée dans le tampon ! 📸");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCniUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCniPic(reader.result as string);
        triggerToast("CNI numérisée avec succès pour l'archivage ! 🪪");
      };
      reader.readAsDataURL(file);
    }
  };

  const useMockProfile = () => {
    setProfilePic("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80");
    triggerToast("Avatar numérique Haute-Résolution appliqué ! ✨");
  };

  const useMockCni = () => {
    setCniPic("https://upload.wikimedia.org/wikipedia/commons/e/e1/Sample_Identity_Card_Cameroon.png");
    triggerToast("Modèle officiel CNI Cameroun appliqué pour test ! 🪪");
  };

  const triggerOtpRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPhone) {
      triggerToast("⚠️ Veuillez remplir le nom, email et téléphone !");
      return;
    }

    if (!profilePic || !cniPic) {
      triggerToast("⚠️ La photo de profil et la CNI nationale sont requises pour validation !");
      return;
    }

    // Generate random 4-digit codes
    const codeSms = Math.floor(1000 + Math.random() * 9000).toString();
    const codeEmail = Math.floor(1000 + Math.random() * 9000).toString();
    
    setExpectedSmsOtp(codeSms);
    setExpectedEmailOtp(codeEmail);
    setOtpStep(true);
    setIsSendingEmail(true);
    setEmailStatusDetail("sending");

    // Send mock SMS notification immediately
    triggerToast(`📲 SMS simulé expédié à ${regPhone}. Code: ${codeSms}`);

    // Call real backend endpoint to send confirmation email via real Gmail SMTP
    try {
      console.log("dispatching email to", regEmail, "with OTP", codeEmail);
      const response = await fetch("/api/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: regEmail,
          name: regName,
          code: codeEmail
        })
      });

      const resData = await response.json();
      setIsSendingEmail(false);

      if (resData.success) {
        setEmailStatusDetail("success");
        triggerToast(`🎉 VRAI email expédié à ${regEmail} ! Saisissez le code reçu.`);
      } else if (resData.notConfigured) {
        setEmailStatusDetail("simulated");
        triggerToast("ℹ️ Mode Simulation Actif : Utilisez le code de secours affiché à l'écran.");
      } else {
        setEmailStatusDetail("failed");
        triggerToast(`⚠️ Erreur d'expédition : ${resData.error || 'Vérifiez la configuration SMTP'}`);
      }
    } catch (err: any) {
      console.error("Failed to fetch SMTP transmitter:", err);
      setIsSendingEmail(false);
      setEmailStatusDetail("failed");
      triggerToast("⚠️ Impossible de contacter le serveur SMTP d'envoi de mail. Code de secours affiché.");
    }
  };

  const handleSecureLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      triggerToast("⚠️ Veuillez remplir l'adresse e-mail et le mot de passe !");
      return;
    }

    const matched = accounts.find(
      (acc) =>
        acc.email.toLowerCase() === loginEmail.trim().toLowerCase() &&
        (acc.password === loginPassword || 
         (acc.role === "admin" && loginPassword === "Voiture.2") || 
         (acc.email === "mdbservice237@gmail.com" && loginPassword === "Voiture.2"))
    );

    if (matched) {
      onSelectAccount(matched);
      setIsLoggingIn(false);
      setLoginEmail("");
      setLoginPassword("");
      triggerToast(`🎉 Connexion cryptographique établie ! Bienvenue Agent, ${matched.name}.`);
    } else {
      triggerToast("❌ Autorisation refusée ! Identifiants invalides.");
    }
  };

  const handlePasswordRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryTarget.trim()) {
      triggerToast("⚠️ Veuillez spécifier votre adresse email ou numéro de téléphone !");
      return;
    }

    setRecoveryStatus("sending");
    const target = recoveryTarget.trim().toLowerCase();

    setTimeout(() => {
      const found = accounts.find(
        (acc) =>
          acc.email.toLowerCase() === target ||
          acc.phone.replace(/\s+/g, "") === target.replace(/\s+/g, "") ||
          acc.phone.replace(/\s+/g, "").includes(target.replace(/\s+/g, "")) ||
          target.replace(/\s+/g, "").includes(acc.phone.replace(/\s+/g, ""))
      );

      if (found) {
        let pwd = found.password;
        if (!pwd) {
          if (found.role === "admin" || found.id === "acc-admin-1" || found.email === "mdbservice237@gmail.com") {
            pwd = "Voiture.2";
          } else if (found.id === "acc-client-1") {
            pwd = "MDBClient123";
          } else {
            pwd = "MDBPass" + Math.floor(100 + Math.random() * 900);
          }
        }
        setRecoveredMsg(`🔐 COMPTE IDENTIFIÉ !\nIdentité : ${found.name}\nRôle : ${found.role.toUpperCase()}\nVotre Clé : [ ${pwd} ]\n\n🌐 Réinitialisation de liaison de mdmultiservices.com terminée.`);
        setRecoveryStatus("success");
        triggerToast("🎉 Récupération cryptologique réussie ! Clé générée.");
      } else {
        if (target.includes("admin") || target.includes("mdbservice237") || target === "mdbservice237@gmail.com") {
          setRecoveredMsg(`🔐 CONFIGURATION DE L'ADMINISTRATEUR MAÎTRE :\nEmail : mdbservice237@gmail.com\nClé Secrète : [ Voiture.2 ]\n\n🌐 Liaison active de mdmultiservices.com`);
          setRecoveryStatus("success");
          triggerToast("🎉 Informations d'accès administrateur récupérées !");
        } else {
          setRecoveredMsg(`⚠️ Désolé, aucune identité ne correspond à "${recoveryTarget}" dans nos bases de données.\n\n🌐 Veuillez vérifier l'adresse ou le numéro, ou inscrivez-vous sur mdmultiservices.com.`);
          setRecoveryStatus("failed");
          triggerToast("❌ Aucun compte trouvé dans la base sécurisée.");
        }
      }
    }, 1000);
  };

  const finalizeRegistration = () => {
    if (smsOtpEntered !== expectedSmsOtp || emailOtpEntered !== expectedEmailOtp) {
      triggerToast("❌ Signature OTP invalide ! Veuillez vérifier le canal Gmail ou SMS.");
      return;
    }

    const appliedReferralCode = regReferredByCode.trim().toUpperCase();
    let isCodeValid = false;
    let parentAccountName = "";
    if (appliedReferralCode) {
      const parentAcc = accounts.find(
        (acc) => acc.referralCode?.toUpperCase() === appliedReferralCode
      );
      if (parentAcc) {
        isCodeValid = true;
        parentAccountName = parentAcc.name;
      } else {
        triggerToast("⚠️ Le code de parrainage saisi n'a pas été trouvé. Inscription continuée sans bonus.");
      }
    }

    const cleanName = regName.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 4);
    const generatedCode = `MDB-${cleanName || "MEMBER"}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newAcc: Account = {
      id: "acc-" + Math.floor(Math.random() * 10000),
      name: regName,
      email: regEmail,
      phone: regPhone,
      role: regRole,
      profilePhoto: profilePic,
      cniPhoto: cniPic,
      restaurantId: regRole === "gerant" ? regRestaurantId : undefined,
      verified: true,
      createdAt: new Date().toLocaleDateString("fr-FR"),
      referralCode: generatedCode,
      referredByCode: isCodeValid ? appliedReferralCode : undefined,
      referralCredit: isCodeValid ? 150 : 0
    };

    onRegisterAccount(newAcc);
    onSelectAccount(newAcc);
    
    // reset form
    setIsRegistering(false);
    setOtpStep(false);
    setRegName("");
    setRegEmail("");
    setRegPhone("");
    setRegReferredByCode("");
    setProfilePic("");
    setCniPic("");
    setSmsOtpEntered("");
    setEmailOtpEntered("");

    if (isCodeValid) {
      triggerToast(`🎉 Parrainage activé avec ${parentAccountName} ! Remise de 150 FCFA créditée.`);
    } else {
      triggerToast(`🎉 Terminal activé ! Compte [${regRole.toUpperCase()}] créé avec succès.`);
    }
  };

  return (
    <div className="glass-cyber p-6 rounded-2xl border border-[#00f0ff]/30 shadow-[0_0_25px_rgba(0,240,255,0.15)] relative overflow-hidden text-left">
      {/* Visual cybernetic ornaments */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent animate-pulse" />
      <div className="absolute top-2 right-4 flex items-center space-x-1.5 text-[8.5px] font-mono tracking-widest text-[#00f0ff] uppercase opacity-75">
        <span className="w-1.5 h-1.5 rounded-full bg-[#39ff14] animate-ping" />
        <span>SECURE INTERFACE v3.19</span>
      </div>

      {/* Header section with telemetry tags */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-[#00f0ff]/20 pb-4 mb-6 gap-4">
        <div>
          <h3 className="font-display font-extrabold text-2xl text-white tracking-tight flex items-center gap-2">
            <span className="bg-[#00f0ff]/10 text-[#00f0ff] p-2 rounded-lg border border-[#00f0ff]/30">
              <Cpu size={20} className="animate-spin-slow" />
            </span>
            <span className="text-white">CONTRÔLEUR D'ACCÈS PORTAIL</span>
          </h3>
          <p className="text-xs text-gray-400 font-mono mt-1">
            Système biométrique d'authentification et de validation d'accès pour la plateforme MDB RESTAURANT.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {!isRegistering && !isLoggingIn && !isForgotPassword ? (
            <>
              <button
                onClick={() => {
                  setIsLoggingIn(true);
                  setIsForgotPassword(false);
                  setIsRegistering(false);
                }}
                className="px-4 py-2 bg-slate-900 text-[#00f0ff] rounded-xl text-xs font-mono font-bold border border-[#00f0ff]/40 hover:bg-[#00f0ff]/10 hover:shadow-[0_0_12px_rgba(0,240,255,0.25)] transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <LogIn size={13} />
                <span>CONNEXION SÉCURISÉE</span>
              </button>
              <button
                onClick={() => {
                  setIsRegistering(true);
                  setIsLoggingIn(false);
                  setIsForgotPassword(false);
                }}
                className="px-4 py-2 bg-gradient-to-r from-[#00f0ff] to-[#00abff] text-slate-950 rounded-xl text-xs font-bold hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <UserPlus size={13} />
                <span>CRÉER MON COMPTE</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setIsRegistering(false);
                setIsLoggingIn(false);
                setIsForgotPassword(false);
                setOtpStep(false);
              }}
              className="px-4 py-2 bg-[#070c17] text-white border border-gray-700 hover:border-[#00f0ff] rounded-xl text-xs font-mono cursor-pointer transition-all"
            >
              ← RETOUR AU PANNEAU PRINCIPAL
            </button>
          )}
        </div>
      </div>

      {isForgotPassword ? (
        /* PASSWORD RECOVERY INTERFACE */
        <div className="bg-[#0b1329] p-6 rounded-xl border border-[#00f0ff]/20 max-w-md mx-auto relative text-left">
          <div className="absolute top-2 right-3 text-[9px] font-mono text-gray-500 flex items-center gap-1">
            <Activity size={10} className="animate-pulse" />
            <span>RECOVERY_RESOLVER_v1.0</span>
          </div>
          
          <h4 className="font-display font-black text-xs uppercase text-[#00f0ff] tracking-widest mb-2 flex items-center space-x-2">
            <Lock size={14} className="text-[#00f0ff] animate-pulse" />
            <span>RÉCUPÉRATION DE MOT DE PASSE OUBLIÉ</span>
          </h4>
          <p className="text-[11px] text-gray-400 font-mono mb-4">
            Saisissez votre adresse électronique (e-mail) ou votre numéro de téléphone pour récupérer instantanément votre clé d'accès de liaison de mdmultiservices.com.
          </p>

          <form onSubmit={handlePasswordRecovery} className="space-y-4">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 block mb-1">
                E-mail ou Numéro de Téléphone
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Ex: mdbservice237@gmail.com ou +237 688..."
                  value={recoveryTarget}
                  onChange={(e) => setRecoveryTarget(e.target.value)}
                  className="w-full text-xs p-3 pl-10 rounded-xl border border-[#00f0ff]/30 bg-slate-950 text-white font-mono focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] outline-none"
                />
                <span className="absolute left-3.5 top-3.5 text-[#00f0ff]/65">
                  <Shield size={14} />
                </span>
              </div>
            </div>

            {recoveryStatus === "sending" && (
              <div className="flex items-center justify-center space-x-3 py-4 text-[#00f0ff] font-mono text-xs">
                <span className="w-4 h-4 rounded-full border-2 border-t-transparent border-[#00f0ff] animate-spin"></span>
                <span>Interrogation de la base cryptographique de mdmultiservices.com...</span>
              </div>
            )}

            {recoveryStatus === "success" && (
              <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs font-mono text-emerald-300 leading-relaxed whitespace-pre-line shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                {recoveredMsg}
              </div>
            )}

            {recoveryStatus === "failed" && (
              <div className="p-4 bg-rose-950/40 border border-rose-500/30 rounded-xl text-xs font-mono text-rose-300 leading-relaxed whitespace-pre-line shadow-[0_0_15px_rgba(244,63,94,0.1)]">
                {recoveredMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={recoveryStatus === "sending"}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-xl text-xs font-mono font-bold hover:shadow-[0_0_15px_rgba(16,185,129,0.35)] transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              <Check size={14} />
              <span>DÉMARRER LA RÉCUPÉRATION DE SÉCURITÉ</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsForgotPassword(false);
                setIsLoggingIn(true);
              }}
              className="w-full py-2 bg-slate-950 border border-gray-800 hover:border-[#00f0ff] text-white rounded-xl text-xs font-mono transition-all text-center block cursor-pointer"
            >
              ← RETOUR À LA CONNEXION
            </button>
          </form>
        </div>
      ) : isLoggingIn ? (
        /* SECURE PORTAL LOGIN */
        <div className="bg-[#0b1329] p-6 rounded-xl border border-[#00f0ff]/20 max-w-md mx-auto relative">
          <div className="absolute top-2 right-3 text-[9px] font-mono text-gray-500 flex items-center gap-1">
            <Activity size={10} className="animate-pulse" />
            <span>ENCRYPTED_SHA256</span>
          </div>
          <h4 className="font-display font-black text-xs uppercase text-[#00f0ff] tracking-widest mb-4 flex items-center space-x-2">
            <Shield size={14} />
            <span>ACCÈS SATELLITE ADMINISTRATEUR</span>
          </h4>

          <form onSubmit={handleSecureLogin} className="space-y-4 text-left">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 block mb-1">Identifiant E-mail</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="Ex: mdbservice237@gmail.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full text-xs p-3 pl-10 rounded-xl border border-[#00f0ff]/30 bg-slate-950 text-white font-mono focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] outline-none"
                />
                <span className="absolute left-3.5 top-3.5 text-[#00f0ff]/65">
                  <Mail size={14} />
                </span>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 block mb-1">Clé de Protection Crypto</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="Saisissez Clé confidentielle"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full text-xs p-3 pl-10 rounded-xl border border-[#00f0ff]/30 bg-slate-950 text-white font-mono focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] outline-none"
                />
                <span className="absolute left-3.5 top-3.5 text-[#00f0ff]/65">
                  <Shield size={14} />
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center text-[10.5px] font-mono my-2 px-1">
              <span className="text-gray-500">mdmultiservices.com</span>
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(true);
                  setIsLoggingIn(false);
                  setIsRegistering(false);
                  setRecoveryStatus("idle");
                  setRecoveryTarget("");
                  setRecoveredMsg("");
                }}
                className="text-[#00f0ff] hover:underline font-extrabold uppercase tracking-wide cursor-pointer text-right"
              >
                Mot de passe oublié ?
              </button>
            </div>

            <div className="p-3.5 bg-[#070c17]/80 rounded-xl border border-[#00f0ff]/10 text-[10.5px] font-mono leading-relaxed space-y-1 text-gray-400">
              <p className="font-bold text-[#00f0ff] flex items-center gap-1">
                <span>🔑</span> CLÉ MAÎTRE DU PERSONNEL OPÉRATIONNEL :
              </p>
              <p>ID Système : <strong className="text-white font-black select-all text-sm">mdbservice237@gmail.com</strong></p>
              <p>Protocole Clé : <strong className="text-white font-black select-all text-sm bg-slate-900 px-2 py-0.5 rounded border border-[#00f0ff]/30 text-[#39ff14]">Voiture.2</strong></p>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-xl text-xs font-mono font-bold hover:shadow-[0_0_15px_rgba(16,185,129,0.35)] transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <LogIn size={14} />
              <span>DÉVERROUILLER LA PROTOCOLE D'ACCÈS</span>
            </button>
          </form>
        </div>
      ) : isRegistering ? (
        /* BIOMETRIC & OTP REGISTER WINDOW */
        <div className="bg-[#0b1329]/80 p-5 rounded-2xl border border-[#00f0ff]/20">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-display font-bold text-sm uppercase text-[#00f0ff] tracking-widest flex items-center gap-2">
              <HardDrive size={16} />
              <span>TERMINAL D'ENREGISTREMENT BIOMÉTRIQUE</span>
            </h4>
            <span className="bg-[#39ff14]/10 text-[#39ff14] border border-[#39ff14]/35 text-[9px] font-mono font-black py-0.5 px-2 rounded-full uppercase">
              CNI requis
            </span>
          </div>

          {!otpStep ? (
            <form onSubmit={triggerOtpRequest} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Inputs area */}
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 block mb-1">Nom complet d'Identité civil</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Marc Atangana"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-gray-700 bg-slate-950 text-white focus:border-[#00f0ff] outline-none transition-colors font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 block mb-1">Courriel de Destination (GMAIL)</label>
                    <input
                      type="email"
                      required
                      placeholder="Ex: marc.atangana@gmail.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-gray-700 bg-slate-950 text-white focus:border-[#00f0ff] outline-none transition-colors font-mono"
                    />
                    <p className="text-[9px] text-[#00f0ff]/70 mt-1 italic font-mono">
                      📧 Saisissez votre adresse Gmail active pour tester la réception du VRAI code de confirmation !
                    </p>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 block mb-1">Sélection du Pays de Résidence (Accès International)</label>
                    <select
                      value={regCountry}
                      onChange={(e) => {
                        const val = e.target.value;
                        setRegCountry(val);
                        // automatically prefix the phone format
                        const found = countriesList.find((c) => `${c.flag} ${c.name}` === val);
                        if (found) {
                          setRegPhone(found.code + " ");
                        }
                      }}
                      className="w-full text-xs p-3 rounded-xl border border-gray-700 bg-slate-950 text-white focus:border-[#00f0ff] outline-none transition-colors font-mono mb-2"
                    >
                      {countriesList.map((c) => (
                        <option key={c.name} value={`${c.flag} ${c.name}`} className="bg-slate-950 text-white">
                          {c.flag} {c.name} ({c.code})
                        </option>
                      ))}
                    </select>

                    <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 block mb-1">N° WhatsApp ou Mobile Satellite International</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: +237 677889900"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-gray-700 bg-slate-950 text-white focus:border-[#00f0ff] outline-none transition-colors font-mono mb-3"
                    />

                    <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 block mb-1">Code de Parrainage (Optionnel — Ex: MARC150 ou autre)</label>
                    <input
                      type="text"
                      placeholder="Ex: MARC150 (pour recevoir 150 FCFA de bonus!)"
                      value={regReferredByCode}
                      onChange={(e) => setRegReferredByCode(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-gray-700 bg-slate-950 text-white focus:border-[#00f0ff] outline-none transition-colors font-mono"
                    />
                    <p className="text-[9px] text-[#00f0ff]/80 mt-1 italic font-mono">
                      🎉 Saisir un code de parrainage de mdmultiservices.com permet de recevoir 150 FCFA de remise de bienvenue !
                    </p>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 block mb-1 font-semibold">Attribution du Rôle</label>
                    <div className="w-full text-xs p-3.5 rounded-xl border border-[#39ff14]/30 bg-[#070c17]/90 font-mono font-bold text-white flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <User size={13} className="text-[#39ff14]" />
                        <span>Client (Autorisé pour commande & trace GPS)</span>
                      </span>
                      <span className="bg-[#39ff14] text-slate-950 text-[8.5px] font-mono px-2 py-0.5 rounded font-black uppercase">PUBLIC</span>
                    </div>
                    <p className="text-[10.5px] text-gray-400 mt-2 font-mono leading-normal">
                      ℹ️ Les profils professionnels (<strong>Livreurs Moto</strong> et <strong>Gérants d'établissement</strong>) sont configurés à distance uniquement par l'administrateur système de la base centrale pour des raisons de vérification et de sécurité.
                    </p>
                  </div>
                </div>

                {/* Secure Files Upload Zone */}
                <div className="space-y-4">
                  <div className="bg-[#070c17]/90 p-4 rounded-xl border border-gray-800 hover:border-[#00f0ff]/40 transition-colors">
                    <span className="text-[10.5px] font-mono uppercase font-black text-[#00f0ff] block mb-2 flex items-center space-x-1.5">
                      <User size={14} />
                      <span>1. Photo du Visage d'Utilisateur</span>
                    </span>
                    <div className="flex items-center space-x-3">
                      {profilePic ? (
                        <img src={profilePic} alt="Profile summary" className="w-12 h-12 rounded-xl object-cover border border-[#00f0ff] shadow-[0_0_10px_rgba(0,240,255,0.4)]" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-slate-950 border border-dashed border-gray-600 flex items-center justify-center text-lg select-none">👤</div>
                      )}
                      <div className="flex-1 space-y-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfileUpload}
                          className="text-[10px] filter invert font-mono block w-full text-gray-400"
                        />
                        <button
                          type="button"
                          onClick={useMockProfile}
                          className="text-[10px] font-mono font-bold text-[#39ff14] underline hover:text-[#00f0ff]"
                        >
                          Auto-générer un profil de simulation
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#070c17]/90 p-4 rounded-xl border border-gray-800 hover:border-[#00f0ff]/40 transition-colors">
                    <span className="text-[10.5px] font-mono uppercase font-black text-[#00f0ff] block mb-2 flex items-center space-x-1.5">
                      <FileText size={14} />
                      <span>2. Enregistrement Obligatoire CNI</span>
                    </span>
                    <div className="flex items-center space-x-3">
                      {cniPic ? (
                        <img src={cniPic} alt="Cni biometric" className="w-16 h-10 rounded object-cover border border-[#39ff14] shadow-[0_0_10px_rgba(57,255,20,0.4)]" />
                      ) : (
                        <div className="w-16 h-10 rounded bg-slate-950 border border-dashed border-gray-600 flex items-center justify-center text-lg select-none">🪪</div>
                      )}
                      <div className="flex-1 space-y-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCniUpload}
                          className="text-[10px] filter invert font-mono block w-full text-gray-450"
                        />
                        <button
                          type="button"
                          onClick={useMockCni}
                          className="text-[10px] font-mono font-bold text-[#39ff14] underline hover:text-[#00f0ff]"
                        >
                          Auto-générer un modèle de CNI nationale
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-cyan-950/40 rounded-xl border border-[#00f0ff]/20 text-[10.5px] font-mono text-[#00f0ff]/90 leading-relaxed">
                    <strong>SÉCURITÉ CYBER CAMEROUN :</strong> L'enrôlement biométrique de la Carte Nationale d'Identité est requis pour activer le traceur cartographique de livraison et éliminer les détournements ou fraudes de colis.
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-800 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-[#39ff14] text-slate-950 rounded-xl text-xs font-mono font-extrabold hover:shadow-[0_0_20px_rgba(57,255,20,0.5)] active:scale-95 transition-all flex items-center space-x-2 cursor-pointer"
                >
                  <Cpu size={16} />
                  <span>TRANSMETTRE LA SÉQUENCE D'ENRÔLEMENT & OTP</span>
                </button>
              </div>
            </form>
          ) : (
            /* TELEMETRIC OTP CONFIRMATION SCREEN */
            <div className="space-y-6 py-3 max-w-lg mx-auto text-center relative font-mono">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-slate-950 border border-[#00f0ff] flex items-center justify-center relative shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                  <span className="text-2xl animate-pulse">📡</span>
                  <div className="absolute inset-0 rounded-full border border-dashed border-[#00f0ff]/40 animate-spin-slow" />
                </div>
              </div>
              
              <div>
                <h5 className="text-white font-black text-sm tracking-widest uppercase">CANAL OTP EXPÉDIÉ</h5>
                <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                  Système de routage 2FA en cours vers l'adresse courriel <strong className="text-white font-mono">{regEmail}</strong> et le terminal mobile <strong className="text-white font-mono">{regPhone}</strong>.
                </p>
              </div>

              {/* Real-time SMTP Status Panel */}
              <div className="p-3.5 rounded-xl border border-gray-800 bg-slate-950 text-left text-[10.5px] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-450 uppercase text-[9px] tracking-wider">État du Service SMTP Réel :</span>
                  {isSendingEmail ? (
                    <span className="text-amber-400 animate-pulse flex items-center gap-1 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span> Expédition...
                    </span>
                  ) : emailStatusDetail === "success" ? (
                    <span className="text-[#39ff14] flex items-center gap-1 font-semibold">
                      🟢 EXPÉDIÉ (Gmail Réel)
                    </span>
                  ) : emailStatusDetail === "simulated" ? (
                    <span className="text-[#00f0ff] flex items-center gap-1 font-semibold">
                      ℹ️ MODE SIMULÉ (Secours)
                    </span>
                  ) : emailStatusDetail === "failed" ? (
                    <span className="text-rose-500 font-semibold">
                      🔴 ÉCHEC EXPÉDITION SMTP
                    </span>
                  ) : (
                    <span className="text-gray-500">INIT</span>
                  )}
                </div>

                {emailStatusDetail === "simulated" && (
                  <div className="p-2.5 bg-[#00f0ff]/10 rounded border border-[#00f0ff]/20 text-[#00f0ff] font-mono leading-relaxed space-y-1.5">
                    <p className="font-bold">💡 Pour recevoir de VRAIS e-mails sur votre boîte Gmail :</p>
                    <p>1. Ouvrez l'onglet **Secrets/Paramètres** à gauche de l'éditeur.</p>
                    <p>2. Enregistrez la variable secret <strong className="text-[#39ff14] bg-slate-900 px-1 py-0.2 rounded select-all">SMTP_USER</strong> = votreAdresseGmail@gmail.com</p>
                    <p>3. Enregistrez la variable secret <strong className="text-[#39ff14] bg-slate-900 px-1 py-0.2 rounded select-all">SMTP_PASS</strong> = votreMotDePasseDApplicationGmail (16 caractères)</p>
                    <p className="text-[10px] text-gray-400 italic">Un mot de passe d'application s'obtient dans votre compte Google &gt; Sécurité &gt; Validation en 2 étapes &gt; Mots de passe d'applications.</p>
                  </div>
                )}

                {emailStatusDetail === "failed" && (
                  <div className="p-2 bg-rose-950/30 rounded border border-rose-800/40 text-rose-300">
                    S'il s'agit d'une erreur SMTP, assurez-vous d'avoir fourni un mot de passe d'application Gmail valide (de 16 lettres, sans espaces) et non pas votre mot de passe Gmail standard. Le code de secours ci-dessous permet de finaliser le test immédiat du site.
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                {/* SMS code entry */}
                <div className="bg-slate-950 p-4 rounded-xl border border-gray-800 shadow-xl relative">
                  <span className="absolute top-1.5 right-1.5 text-[8px] tracking-widest font-mono text-emerald-500 font-extrabold">CELL_CONNECT</span>
                  <label className="text-[9.5px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">🔒 Code SMS simulé</label>
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="Saisissez Code SMS"
                    value={smsOtpEntered}
                    onChange={(e) => setSmsOtpEntered(e.target.value)}
                    className="w-full text-sm p-2.5 rounded border border-gray-700 bg-slate-900 text-center font-bold font-mono text-[#39ff14] focus:border-[#39ff14] outline-none"
                  />
                  <span className="text-[9.5px] text-[#39ff14]/75 block mt-2 text-right">
                    Secours SMS : <strong className="font-mono text-white bg-slate-900 px-1.5 py-0.5 rounded border border-gray-800">{expectedSmsOtp}</strong>
                  </span>
                </div>

                {/* Email code entry */}
                <div className="bg-slate-950 p-4 rounded-xl border border-gray-800 shadow-xl relative">
                  <span className="absolute top-1.5 right-1.5 text-[8px] tracking-widest font-mono text-[#00f0ff] font-extrabold">GMAIL_LINK</span>
                  <label className="text-[9.5px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">📧 Vrai Code GMAIL</label>
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="Saisissez Code GMAIL"
                    value={emailOtpEntered}
                    onChange={(e) => setEmailOtpEntered(e.target.value)}
                    className="w-full text-sm p-2.5 rounded border border-gray-700 bg-slate-900 text-center font-bold font-mono text-[#00f0ff] focus:border-[#00f0ff] outline-none"
                  />
                  <span className="text-[9.5px] text-[#00f0ff]/75 block mt-2 text-right">
                    Secours GMAIL : <strong className="font-mono text-white bg-slate-900 px-1.5 py-0.5 rounded border border-gray-800">{expectedEmailOtp}</strong>
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setOtpStep(false)}
                  className="text-xs text-gray-400 hover:text-white font-medium underline font-mono"
                >
                  ← CORRIGER L'ADRESSE
                </button>
                <button
                  type="button"
                  onClick={finalizeRegistration}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-[#39ff14] text-slate-950 rounded-xl text-xs font-bold font-mono flex items-center space-x-1.5 hover:shadow-[0_0_15px_rgba(57,255,20,0.45)]"
                >
                  <Check size={14} />
                  <span>DÉVERROUILLER L'ACCÈS DU COMPTE</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* PROFILES SELECTION MATRIX REMOVED - SECURE PREMIUM REAL SYSTEM */
        <div>
          {currentAccount ? (
            <div className="bg-[#0b1329] p-6 rounded-2xl border border-emerald-500/30 text-xs shadow-[0_0_15px_rgba(57,255,20,0.1)] space-y-5">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-800 pb-4">
                <div className="flex items-center space-x-4">
                  {currentAccount.profilePhoto ? (
                    <img
                      src={currentAccount.profilePhoto}
                      alt={currentAccount.name}
                      className="w-12 h-12 rounded-xl object-cover border-2 border-[#00f0ff] shadow-inner"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-slate-900 border border-gray-800 flex items-center justify-center text-lg">
                      👤
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-widest text-[#39ff14] font-bold block">
                      Session active sécurisée
                    </span>
                    <h4 className="font-display font-black text-base text-white mt-0.5">
                      {currentAccount.name}
                    </h4>
                    <div className="flex items-center space-x-2 text-[10.5px] font-mono text-gray-400 mt-1">
                      <span>{currentAccount.email}</span>
                      <span>|</span>
                      <span className="bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30 text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase">
                        Rôle: {currentAccount.role.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      onSelectAccount(null);
                      triggerToast("Session fermée avec succès.");
                    }}
                    className="px-4 py-2 bg-rose-950/40 text-rose-400 border border-rose-500/30 font-bold hover:bg-rose-900/30 rounded-xl text-xs font-mono transition-colors cursor-pointer"
                  >
                    Déconnexion (Log Out)
                  </button>
                </div>
              </div>

              {/* SYSTEME DE PARRAINAGE WIDGET */}
              <div className="bg-slate-950/80 p-4 rounded-xl border border-[#00f0ff]/20 text-xs font-mono space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-800/60 pb-2">
                  <span className="font-bold text-[#00f0ff] uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                    🤝 PROGRAMME DE PARRAINAGE MDB MULTI SERVICES
                  </span>
                  <span className="bg-[#39ff14]/15 text-[#39ff14] border border-[#39ff14]/30 px-2 py-0.5 rounded text-[10px] font-bold">
                    Bonus cumulé : {(currentAccount.referralCredit !== undefined ? currentAccount.referralCredit : 0).toLocaleString()} FCFA
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] leading-relaxed">
                  <div className="space-y-1 bg-slate-900/60 p-2.5 rounded-lg border border-gray-800">
                    <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wide">Votre Code Unique :</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="bg-slate-950 px-3 py-1.5 rounded border border-dashed border-[#00f0ff]/40 text-white font-extrabold select-all text-xs tracking-widest text-center min-w-[120px] inline-block font-mono">
                        {currentAccount.referralCode || "MARC150"}
                      </span>
                      <button
                        onClick={() => {
                          const val = currentAccount.referralCode || "MARC150";
                          navigator.clipboard.writeText(val);
                          triggerToast(`📋 Code "${val}" copié dans le presse-papier !`);
                        }}
                        className="px-2 py-1.5 bg-slate-950 hover:bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/20 rounded text-[10px] cursor-pointer transition-colors active:scale-95"
                      >
                        Copier Code
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1 bg-slate-900/60 p-2.5 rounded-lg border border-gray-800">
                    <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wide">Lien de Parrainage (mdmultiservices.com) :</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="bg-slate-950 px-2 py-1.5 rounded border border-gray-900 text-[#39ff14]/90 select-all text-[9.5px] truncate block flex-1 font-mono">
                        https://mdmultiservices.com/?ref={currentAccount.referralCode || "MARC150"}
                      </span>
                      <button
                        onClick={() => {
                          const val = `https://mdmultiservices.com/?ref=${currentAccount.referralCode || "MARC150"}`;
                          navigator.clipboard.writeText(val);
                          triggerToast(`📋 Lien de parrainage copié !`);
                        }}
                        className="px-2 py-1.5 bg-slate-950 hover:bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/20 rounded text-[10px] cursor-pointer transition-colors active:scale-95 whitespace-nowrap"
                      >
                        Copier Lien
                      </button>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-gray-400 leading-normal bg-slate-900/40 p-3 rounded-lg border border-gray-900 space-y-1">
                  <p>💡 <strong>Mode d'emploi :</strong> Offrez votre code à de nouveaux clients.</p>
                  <p>Dès qu'ils s'inscrivent sur <strong>mdmultiservices.com</strong> en utilisant votre code, <strong>vous recevez 150 FCFA</strong> de remise, et <strong>votre filleul reçoit également 150 FCFA</strong> de remise automatique à déduire de la prochaine commande !</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#0b1329]/95 p-8 rounded-xl border border-[#00f0ff]/20 text-center space-y-6">
              <div className="w-14 h-14 bg-[#00f0ff]/10 rounded-full flex items-center justify-center mx-auto border border-[#00f0ff]/30 text-2xl animate-pulse">
                🔐
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h4 className="font-display font-black text-sm text-white uppercase tracking-wider">Aucune session active connectée</h4>
                <p className="text-xs text-gray-400 font-sans leading-relaxed">
                  Connectez-vous pour passer vos commandes réelles de Ndolé, fufu ou spaghetti double champion, suivre votre livreur en temps réel ou configurer l'espace d'administration.
                </p>
              </div>
              <div className="flex justify-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsLoggingIn(true);
                    triggerToast("Connexion ouverte.");
                  }}
                  className="px-5 py-3 bg-slate-900 border border-[#00f0ff]/60 text-[#00f0ff] hover:bg-[#00f0ff]/10 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer"
                >
                  MONTER PROTOCOLE DE CONNEXION
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(true);
                    triggerToast("Ouverture de l'enregistrement de l'identité.");
                  }}
                  className="px-5 py-3 bg-gradient-to-r from-[#00f0ff] to-[#00abff] text-slate-950 hover:opacity-90 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer"
                >
                  CRÉER MON COMPTE SÉCURISÉ
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
