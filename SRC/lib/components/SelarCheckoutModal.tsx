import React, { useState } from "react";
import { X, ShieldCheck, Zap, Check, Lock, Award, Sparkles, CreditCard, Gift, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

interface SelarCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  isLight: boolean;
  onBalanceUpdated: (newBalance: number) => void;
  onProfileUpdated?: (updates: any) => void;
  showToast: (msg: string, type: "success" | "error" | "info") => void;
}

const STANDALONE_TIERS = [
  {
    id: "pro_monthly",
    name: "Pro Status",
    priceUsdMonthly: 7.90,
    priceUsdYearly: 79.90,
    isPro: true,
    badge: "Basic verified identifier",
    perks: [
      "Access to 2 standard image file prompt uploads within MouxBot terminal sessions",
      "Pro designation badge on profile",
      "Priority global feed visibility"
    ]
  },
  {
    id: "pro_plus_monthly",
    name: "Pro Plus Status",
    priceUsdMonthly: 11.90,
    priceUsdYearly: 119.90,
    isPro: true,
    isProPlus: true,
    badge: "Advanced capabilities",
    perks: [
      "Access to expanded district channels",
      "All Pro Elite privileges included",
      "High-priority profile highlight feed rendering"
    ]
  },
  {
    id: "veteran_monthly",
    name: "Veteran Status",
    priceUsdMonthly: 14.90,
    priceUsdYearly: 149.90,
    isVeteran: true,
    badge: "Maximum access limits",
    perks: [
      "Unlock the inline cursive 'm' Grok-style timeline post analyzer functionality",
      "3 image file prompt uploads for stable diffusion generation",
      "Permanent full access to MouxBot Terminal"
    ]
  }
];

const CURRENCY_PACKS = [
  {
    id: "pack_starter",
    name: "Starter Supply Pack",
    priceUsd: 4.99,
    credits: 5000,
    badge: "Basic Pack",
    description: "Ideal for licensing entry-level marketplace gear."
  },
  {
    id: "pack_vanguard",
    name: "Tactical Vanguard Pack",
    priceUsd: 19.99,
    credits: 25000,
    badge: "Most Popular",
    description: "Sufficient to equip high-frequency trading assets."
  },
  {
    id: "pack_syndicate",
    name: "Corporate Syndicate Vault",
    priceUsd: 69.99,
    credits: 100000,
    badge: "Mega-Corp",
    description: "Complete database dominance with massive liquid reserves."
  }
];

export function SelarCheckoutModal({
  isOpen,
  onClose,
  currentUser,
  isLight,
  onBalanceUpdated,
  onProfileUpdated,
  showToast
}: SelarCheckoutModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [shopTab, setShopTab] = useState<"premium" | "credits">("premium");

  if (!isOpen) return null;

  const cardBg = isLight ? "bg-white text-black" : "bg-[#0c0c0c] text-white";
  const borderCol = isLight ? "border-gray-200" : "border-white/10";
  const inputBg = isLight ? "bg-gray-100 border-gray-200" : "bg-black border-white/10";

  // Simulate premium tier upgrade clearance activation code
  const handleUpgradeTier = async (tier: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      showToast("Authentication signature is required.", "error");
      return;
    }
    setIsProcessing(true);
    setProcessStep(`Upgrading to ${tier.name}...`);
    
    try {
      const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
      await wait(1200);

      const { updateProfile } = await import("../firebase");
      const updates: any = {};
      
      if (tier.isVeteran) {
        updates.is_veteran = true;
        updates.is_pro_plus = false;
        updates.is_pro = true;
        updates.is_verified = true;
      } else if (tier.isProPlus) {
        updates.is_pro_plus = true;
        updates.is_veteran = false;
        updates.is_pro = true;
        updates.is_verified = true;
      } else {
        updates.is_pro = true;
        updates.is_pro_plus = false;
        updates.is_veteran = false;
        updates.is_verified = true;
      }

      await updateProfile(currentUser.uid, updates);
      if (onProfileUpdated) {
        onProfileUpdated(updates);
      }
      
      showToast(`${tier.name} activated successfully! Premium clearance updated.`, "success");
      onClose();
    } catch (err: any) {
      showToast(err.message || "Clearance activation failed.", "error");
    } finally {
      setIsProcessing(false);
      setProcessStep("");
    }
  };

  // Simulate buying horizontal currency packs
  const handleBuyCurrencyPack = async (pack: typeof CURRENCY_PACKS[0], e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      showToast("Authentication signature is required.", "error");
      return;
    }
    setIsProcessing(true);
    setProcessStep(`Processing purchase for ${pack.name}...`);

    try {
      const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
      await wait(1000);

      const { updateProfile } = await import("../firebase");
      const currentBalance = currentUser.mouxBalance || 0;
      const newBalance = currentBalance + pack.credits;

      await updateProfile(currentUser.uid, { mouxBalance: newBalance });
      onBalanceUpdated(newBalance);

      showToast(`Purchase Confirmed! +M̶ ${pack.credits.toLocaleString()} credited successfully.`, "success");
    } catch (err: any) {
      showToast(err.message || "Transaction authorization exception.", "error");
    } finally {
      setIsProcessing(false);
      setProcessStep("");
    }
  };

  // Redeem Promo Clearances
  const handleRedeemPromo = async () => {
    if (!promoCode.trim()) {
      showToast("Please enter a beta/promo clearance code.", "error");
      return;
    }
    const cleanCode = promoCode.trim().toUpperCase();
    setIsProcessing(true);
    setProcessStep("Verifying promo clearance code...");

    try {
      const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
      await wait(900);

      if (cleanCode === "MX500CR9") {
        const { updateProfile } = await import("../firebase");
        const currentBalance = currentUser.mouxBalance || 0;
        const newBalance = currentBalance + 500;
        const updates = {
          mouxBalance: newBalance
        };
        await updateProfile(currentUser.uid, updates);
        if (onProfileUpdated) onProfileUpdated(updates);
        onBalanceUpdated(newBalance);

        showToast("+ M̶ 500 added to your account.", "success");
        setPromoCode("");
        onClose();
      } else if (cleanCode === "MOUXALPHA" || cleanCode === "MOUXLEGEND") {
        const { updateProfile } = await import("../firebase");
        const updates = {
          is_veteran: true,
          is_pro: true,
          is_verified: true,
          mouxBalance: (currentUser.mouxBalance || 0) + 50000
        };
        await updateProfile(currentUser.uid, updates);
        if (onProfileUpdated) onProfileUpdated(updates);
        onBalanceUpdated(updates.mouxBalance);

        showToast("ALPHA CLEARANCE AUTHORIZED! Veteran Node Unlocked, +M̶ 50,000 granted.", "success");
        setPromoCode("");
        onClose();
      } else if (cleanCode === "MOUXPRO") {
        const { updateProfile } = await import("../firebase");
        const updates = {
          is_pro: true,
          is_verified: true,
          mouxBalance: (currentUser.mouxBalance || 0) + 15000
        };
        await updateProfile(currentUser.uid, updates);
        if (onProfileUpdated) onProfileUpdated(updates);
        onBalanceUpdated(updates.mouxBalance);

        showToast("PRO CLEARANCE AUTHORIZED! Elite Credentials Unlocked, +M̶ 15,000 granted.", "success");
        setPromoCode("");
        onClose();
      } else {
        showToast("Access code identity signature rejected.", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Bypass handshake rejected.", "error");
    } finally {
      setIsProcessing(false);
      setProcessStep("");
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[1001] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          className={cn(
            "w-full max-w-4xl rounded-2xl overflow-hidden border shadow-2xl relative flex flex-col max-h-[92vh]",
            cardBg,
            borderCol
          )}
        >
          {/* Header Console */}
          <div className="flex items-center justify-between p-5 border-b border-white/5 bg-black/40">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-moux-cyan/15 text-moux-cyan">
                <ShieldCheck className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider leading-none text-white font-mono">
                  MOUX PREMIUM CORE // PORTAL
                </h3>
                <span className="text-[9px] text-gray-500 font-mono tracking-wider uppercase mt-1.5 block">
                  Upgrade clearance tiers & claim native M̶ liquid assets securely
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-4.5 h-4.5 text-gray-400 hover:text-white" />
            </button>
          </div>

          {/* Loader Processing Gate */}
          {isProcessing && (
            <div className="absolute inset-0 bg-black/98 z-50 flex flex-col justify-center items-center p-8 text-center space-y-4 font-mono">
              <Zap className="w-8 h-8 text-moux-cyan animate-bounce" />
              <div className="space-y-1">
                <p className="text-white text-xs font-bold tracking-widest uppercase">Verifying transaction</p>
                <p className="text-[10px] text-gray-400 italic animate-pulse">{processStep}</p>
              </div>
            </div>
          )}

          {/* Symmetrical Flat Grid Product Console */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Tab Switcher to fully isolate Credits Dashboard / M Currency from Premium Subscription */}
            <div className="flex bg-black/40 border border-white/10 rounded-full p-1 relative z-10 w-max mx-auto mb-6">
              <button
                onClick={() => setShopTab("premium")}
                className={cn(
                  "px-6 py-1.5 text-[10px] font-black tracking-widest uppercase transition-all rounded-full cursor-pointer",
                  shopTab === "premium" ? "bg-moux-cyan text-black font-extrabold" : "text-gray-400 hover:text-white"
                )}
              >
                Premium Clearance Shop
              </button>
              <button
                onClick={() => setShopTab("credits")}
                className={cn(
                  "px-6 py-1.5 text-[10px] font-black tracking-widest uppercase transition-all rounded-full cursor-pointer",
                  shopTab === "credits" ? "bg-green-500 text-black font-extrabold" : "text-gray-400 hover:text-white"
                )}
              >
                M Currency Portal
              </button>
            </div>

            {shopTab === "premium" && (
              <>
                {/* Section A: Dedicated Standalone Clearance Tiers and Upgrades in vertical stack */}
                <div className="space-y-4">
                  <div className="flex flex-col items-center justify-center space-y-3 pb-4">
                    <span className="text-[10px] font-bold text-moux-cyan uppercase tracking-widest font-mono">
                      Select Subscription Alignment Block
                    </span>
                    
                    {/* Billing Cycle Toggle */}
                    <div className="flex bg-black/40 border border-white/10 rounded-full p-1 relative z-10 w-max">
                      <button
                        onClick={() => setBillingCycle("monthly")}
                        className={cn(
                          "px-6 py-1.5 text-[10px] font-black tracking-widest uppercase transition-all rounded-full cursor-pointer",
                          billingCycle === "monthly" ? "bg-white text-black font-extrabold" : "text-gray-400 hover:text-white"
                        )}
                      >
                        Monthly Billing
                      </button>
                      <button
                        onClick={() => setBillingCycle("yearly")}
                        className={cn(
                          "px-6 py-1.5 text-[10px] font-black tracking-widest uppercase transition-all rounded-full flex items-center gap-1.5 cursor-pointer",
                          billingCycle === "yearly" ? "bg-white text-black font-extrabold" : "text-gray-400 hover:text-white"
                        )}
                      >
                        Yearly Billing
                        <span className="bg-moux-cyan text-black px-1.5 py-0.5 rounded-full text-[8.5px] leading-none shrink-0 font-black">-15%</span>
                      </button>
                    </div>
                  </div>

                  {/* Vertical Stack List */}
                  <div className="space-y-4">
                {STANDALONE_TIERS.map((tier) => {
                  const price = billingCycle === "monthly" ? tier.priceUsdMonthly : tier.priceUsdYearly;
                  
                  return (
                    <div
                      key={tier.id}
                      className="border border-white/5 bg-white/[0.015] p-5 rounded-2xl flex flex-col md:flex-row md:items-center md:max-w-none gap-5 transition-all hover:bg-white/[0.03] hover:border-white/10 relative font-mono text-left"
                    >
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-black uppercase tracking-wider text-white">
                            {tier.name}
                          </h4>
                          
                          {/* Inline Starburst SVGs immediately to the right of the tier title text string */}
                          {tier.id.startsWith("pro_plus") ? (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 inline-block shrink-0" fill="none">
                              <style>
                                {`
                                  .moux-pulse-modal-${tier.id} {
                                    transform-origin: center;
                                    animation: mouxBreathingModal-${tier.id} 2s infinite ease-in-out;
                                  }
                                  @keyframes mouxBreathingModal-${tier.id} {
                                    0% { transform: scale(1); }
                                    50% { transform: scale(1.08); }
                                    100% { transform: scale(1); }
                                  }
                                `}
                              </style>
                              <g className={`moux-pulse-modal-${tier.id}`}>
                                <path d="M12 2L14.8 5.7L19.2 4.8L18.8 9.3L22 12L18.8 14.7L19.2 19.2L14.8 18.3L12 22L9.2 18.3L4.8 19.2L5.2 14.7L2 12L5.2 9.3L4.8 4.8L9.2 5.7L12 2Z" fill="#7C4DFF"/>
                                <path d="M8.5 12.5L10.5 14.5L15.5 9.5" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </g>
                            </svg>
                          ) : tier.id.startsWith("veteran") ? (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 inline-block shrink-0" fill="none">
                              <defs>
                                <linearGradient id={`shimmerGradModal-${tier.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                  <stop offset="0%" stopColor="#FFD700" />
                                  <stop offset="50%" stopColor="#FFFFFF" />
                                  <stop offset="100%" stopColor="#FFD700" />
                                </linearGradient>
                                <style>
                                  {`
                                    .moux-shimmer-modal-${tier.id} {
                                      animation: goldSweepModal-${tier.id} 2.5s infinite linear;
                                      background-size: 200% 100%;
                                    }
                                    @keyframes goldSweepModal-${tier.id} {
                                      0% { opacity: 0.85; filter: drop-shadow(0 0 1px #FFD700); }
                                      50% { opacity: 1; filter: drop-shadow(0 0 4px #FFFFFF); }
                                      100% { opacity: 0.85; filter: drop-shadow(0 0 1px #FFD700); }
                                    }
                                  `}
                                </style>
                              </defs>
                              <g className={`moux-shimmer-modal-${tier.id}`}>
                                <path d="M12 2L14.8 5.7L19.2 4.8L18.8 9.3L22 12L18.8 14.7L19.2 19.2L14.8 18.3L12 22L9.2 18.3L4.8 19.2L5.2 14.7L2 12L5.2 9.3L4.8 4.8L9.2 5.7L12 2Z" fill={`url(#shimmerGradModal-${tier.id})`}/>
                                <path d="M8.5 12.5L10.5 14.5L15.5 9.5" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </g>
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 inline-block shrink-0" fill="none">
                              <path d="M12 2L14.8 5.7L19.2 4.8L18.8 9.3L22 12L18.8 14.7L19.2 19.2L14.8 18.3L12 22L9.2 18.3L4.8 19.2L5.2 14.7L2 12L5.2 9.3L4.8 4.8L9.2 5.7L12 2Z" fill="#1DA1F2"/>
                              <path d="M8.5 12.5L10.5 14.5L15.5 9.5" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                          
                          {tier.badge && (
                            <span className="text-[8px] bg-white/5 border border-white/10 text-gray-400 px-2 py-0.5 rounded font-black uppercase tracking-widest shrink-0 ml-auto md:ml-0">
                              {tier.badge}
                            </span>
                          )}
                        </div>

                        {/* Price String */}
                        <div className="flex items-baseline gap-1 pt-1">
                          <span className="text-xl font-black text-white">${price.toFixed(2)} USD</span>
                          <span className="text-[10px] text-gray-500 font-sans">/ {billingCycle === "monthly" ? "monthly" : "yearly"}</span>
                        </div>

                        {/* Perks - Checklist */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-white/5">
                          {tier.perks.map((perk, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-[10px] text-gray-400 font-sans leading-normal">
                              <Check className="w-3.5 h-3.5 text-moux-cyan shrink-0 mt-0.5" />
                              <span>{perk}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Upgrade trigger button */}
                      <div className="shrink-0 pt-2 md:pt-0 w-full md:w-auto">
                        <button
                          type="button"
                          onClick={(e) => handleUpgradeTier(tier, e)}
                          className="w-full md:w-44 py-2.5 px-6 bg-white hover:bg-white/90 text-black rounded-lg text-xs font-black tracking-widest uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-white/5"
                        >
                          <Zap className="w-4 h-4 text-black fill-current" />
                          Upgrade Now
                        </button>
                      </div>
                    </div>
                  );
                })}
                  </div>
                </div>
              </>
            )}

            {shopTab === "credits" && (
              /* Section B: Dedicated M̶ Currency Top-up packs */
              <div className="space-y-4 pt-4">
                <div className="space-y-1 text-center pb-4">
                  <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest font-mono">
                    [LIQ_FUNDS] Standalone M̶ Currency Supply Packs
                  </p>
                  <p className="text-[11px] text-gray-500 font-sans max-w-xl mx-auto">
                    Acquire native capital reserves instantly. Fully formatted credit injections credited directly to your active token profile.
                  </p>
                </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {CURRENCY_PACKS.map((pack) => {
                  return (
                    <div
                      key={pack.id}
                      className="border border-white/5 bg-white/[0.015] p-5 rounded-xl flex flex-col justify-between transition-all hover:bg-white/[0.03] hover:border-white/10 relative font-mono text-left"
                    >
                      <span className="absolute top-4 right-4 text-[7px] bg-green-500/10 border border-green-500/20 text-green-500 px-2 py-0.5 rounded-none font-bold uppercase tracking-wider">
                        {pack.badge}
                      </span>

                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5 pb-2 border-b border-white/5">
                          <CreditCard className="w-3.5 h-3.5 text-green-500" />
                          {pack.name}
                        </h4>

                        <div className="flex items-baseline gap-1 py-3 my-1 border-b border-white/5">
                          <span className="text-lg font-black text-green-500">M̶ {pack.credits.toLocaleString()}</span>
                          <span className="ml-2 text-[10px] text-gray-500 font-bold font-sans">(${pack.priceUsd.toFixed(2)})</span>
                        </div>

                        <p className="text-[9.5px] text-gray-400 font-sans leading-relaxed pt-2">
                          {pack.description}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleBuyCurrencyPack(pack, e)}
                        className="w-full mt-4 py-2 bg-green-950/10 hover:bg-green-900/20 border border-green-500/10 hover:border-green-500/30 text-green-500 rounded-md text-[9px] font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        Buy Pack
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {shopTab === "premium" && (
            /* Section C: Redeem Promo clearances (clean text input) */
            <div className="border border-white/5 p-4 bg-black/40 rounded-xl font-mono text-left space-y-2 mt-4">
              <span className="text-[9px] font-black text-moux-cyan block tracking-widest uppercase flex items-center gap-1.5">
                <Gift className="w-3.5 h-3.5" /> REDEEM PROMO / BETA CODE
              </span>
              <div className="flex gap-2 pt-1 font-sans">
                <input
                  type="text"
                  placeholder="ENTER ACCESS OR ALIGNMENT CODE..."
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 bg-black border border-white/10 text-white px-3.5 py-2 rounded-lg text-xs placeholder:text-gray-700 uppercase focus:outline-none focus:border-moux-cyan/40 font-mono tracking-wider"
                />
                <button
                  type="button"
                  onClick={handleRedeemPromo}
                  className="px-5 py-2 bg-moux-cyan text-black font-extrabold text-xs uppercase hover:bg-moux-cyan/90 transition-all cursor-pointer rounded-lg font-sans"
                >
                  Redeem
                </button>
              </div>
            </div>
          )}
          </div>

          {/* Secure Footer Bar */}
          <div className="p-4 bg-black/40 border-t border-white/5 flex items-center justify-between font-mono text-[8.5px] text-gray-500">
            <span className="flex items-center gap-1.5 uppercase">
              <Lock className="w-3 h-3 text-[#0d9488]" /> PCI-DSS Gateway Compliant Direct Link Integration
            </span>
            <span>Secure Clearance Mode Enabled</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
