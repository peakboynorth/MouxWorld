import React, { useState, useRef, useEffect } from "react";
import { Lock, Send, ShieldAlert, BadgeInfo, Cpu, Terminal, ArrowRight, Zap, RefreshCw, ImagePlus, X } from "lucide-react";
import { UserProfile } from "../types";
import { cn } from "../lib/utils";

// Minimalist Symmetrical Monochrome Geometric Solid 'M' Logo Design
export function MouxLogoSvg({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={cn("fill-current transition-all", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M15 85V15h14l21 34 21-34h14v70H71V40L50 74 29 40v45H15z" />
    </svg>
  );
}

interface TraderBotInterfaceProps {
  currentUser: any;
  injectedPrompt?: string | null;
  onInjectedPromptProcessed?: () => void;
  onOpenShop?: () => void;
}

export function TraderBotInterface({
  currentUser,
  injectedPrompt,
  onInjectedPromptProcessed,
  onOpenShop
}: TraderBotInterfaceProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ id: string; text: string; sender: "user" | "bot"; imageUrl?: string }[]>([
    {
      id: "welcome",
      text: "MouxBot intelligence terminal fully authenticated. System clearance validated.\nState your instruction or query, commander. I am fully responsive to inputs.",
      sender: "bot"
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Parse access levels
  const hasVeteranAccess = currentUser?.is_veteran === true || currentUser?.email === "pervercy23@gmail.com";
  const hasProPlusAccess = currentUser?.is_pro_plus === true;
  const hasProAccess = currentUser?.is_pro === true;
  const hasAccess = hasVeteranAccess || hasProPlusAccess || hasProAccess;
  
  // Pro Perks: 2 image uploads. Veteran Perks: 3 image uploads. Default client files: 1
  const maxImages = hasVeteranAccess ? 3 : (hasProPlusAccess || hasProAccess) ? 2 : 1;

  // Local state for tracking daily limited-rate quota for Pro members
  const [quotaCount, setQuotaCount] = useState(0);
  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load local quota counter for Pro users
  useEffect(() => {
    if (currentUser?.uid && hasProAccess && !hasVeteranAccess) {
      try {
        const raw = localStorage.getItem(`mouxbot_quota_${currentUser.uid}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.dateStr === todayStr) {
            setQuotaCount(parsed.count || 0);
          } else {
            setQuotaCount(0);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
  }, [currentUser, hasProAccess, hasVeteranAccess, todayStr]);

  const updateQuotaLocalStorage = (newCount: number) => {
    if (currentUser?.uid) {
      try {
        localStorage.setItem(
          `mouxbot_quota_${currentUser.uid}`,
          JSON.stringify({ dateStr: todayStr, count: newCount })
        );
        setQuotaCount(newCount);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const executePrompt = async (promptText: string) => {
    if (!promptText.trim() || loading) return;

    // Check if user is requesting a Stable Diffusion image generation
    const isImageRequest = /generate\s+image|create\s+image|draw\s+|paint\s+|stable\s+diffusion|ambient\s+image|make\s+an\s+image/i.test(promptText);
    
    if (isImageRequest) {
      // Validate subscription tier allowance - Veteran Tier or Master Admin can generate images
      const isAllowed = currentUser?.is_veteran === true || currentUser?.email === "pervercy23@gmail.com";
      
      setMessages((prev) => [...prev, { id: Date.now().toString(), text: promptText, sender: "user" }]);
      setLoading(true);

      if (!isAllowed) {
        // Wait 1 second to feel realistic
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            text: "SYSTEM ERROR // ALLOWANCE EXCEEDED: Stable Diffusion generative image compilation is reserved exclusively for Veteran Tier clearance. Your current rank does not meet the necessary authorization. Please upgrade your tier in the Premium Hub.",
            sender: "bot"
          }
        ]);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/generate_ai_image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: promptText,
            email: currentUser?.email
          })
        });

        if (!response.ok) {
          throw new Error("Generative image pipeline handshake protocol failed.");
        }

        const data = await response.json();
        if (data.success && data.image_url) {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              text: `STABLE DIFFUSION LAYER // SYNTHESIS SECURED\nImage compiled: "${promptText}"`,
              sender: "bot",
              imageUrl: data.image_url
            }
          ]);
        } else {
          throw new Error(data.error || "No graphic data block returned.");
        }
      } catch (err: any) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            text: `GENERATIVE EXCEPTION: Failed to compile image layout securely. ${err.message || String(err)}`,
            sender: "bot"
          }
        ]);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Check message quota limit if Pro (and not Veteran/Pro Plus)
    if (hasProAccess && !hasVeteranAccess) {
      if (quotaCount >= 3) {
        setMessages((prev) => [
          ...prev,
          { id: Date.now().toString(), text: promptText, sender: "user" },
          {
            id: (Date.now() + 1).toString(),
            text: "SYSTEM REFUSAL: Your free-range Pro clearance level caps at 3 prompts per 24 hours. Limit reached. Upgrade to Veteran status for unlimited live-terminal interaction.",
            sender: "bot"
          }
        ]);
        return;
      }
      updateQuotaLocalStorage(quotaCount + 1);
    }

    setMessages((prev) => [...prev, { id: Date.now().toString(), text: promptText, sender: "user" }]);
    setLoading(true);

    try {
      const response = await fetch("/api/mouxbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptText,
          history: messages.slice(1).filter((m) => !m.text.includes("[CONTEXT_INJECTION")),
          isVeteran: true,
          email: currentUser?.email
        })
      });

      if (!response.ok) {
        throw new Error("Transceiver signature handshake failed.");
      }

      const resData = await response.json();
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), text: resData.response || "No data received from Moux network.", sender: "bot" }
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), text: `TRANSCEIVER EXCEPTION: ${err.message || "Unknown error."}`, sender: "bot" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Watch for programmatically injected prompts (e.g. from Veteran World Feed contextual clicks)
  useEffect(() => {
    if (injectedPrompt && hasAccess) {
      executePrompt(injectedPrompt);
      if (onInjectedPromptProcessed) {
        onInjectedPromptProcessed();
      }
    }
  }, [injectedPrompt, hasAccess]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && selectedImages.length === 0) return;
    if (loading) return;
    const toSend = input.trim();
    setInput("");
    setSelectedImages([]);
    executePrompt(toSend || "[Attached Images]");
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      if (selectedImages.length + filesArray.length > maxImages) {
        alert(`Your current tier allows a maximum of ${maxImages} image(s) per prompt.`);
        return;
      }
      setSelectedImages((prev) => [...prev, ...filesArray]);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  
  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const remainingQuota = Math.max(0, 3 - quotaCount);

  return (
    <div className="flex-1 flex flex-col bg-black relative max-h-full min-h-0">
      {/* Premium Header Console */}
      <div className="p-5 border-b border-white/5 flex items-center justify-between bg-black/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 text-white">
            <MouxLogoSvg className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase text-white tracking-widest flex items-center gap-2">
              MOUXBOT CORE // TERMINAL
              {hasVeteranAccess ? (
                <span className="text-[8px] bg-moux-cyan text-black px-1.5 py-0.5 rounded-none font-bold tracking-widest">
                  VETERAN NODE
                </span>
              ) : hasProAccess ? (
                <span className="text-[8px] bg-amber-500 text-black px-1.5 py-0.5 rounded-none font-bold tracking-widest">
                  PRO MEMBER
                </span>
              ) : (
                <span className="text-[8px] bg-white/10 text-gray-400 px-1.5 py-0.5 rounded-none font-bold tracking-widest">
                  RESTRICTED
                </span>
              )}
            </h2>
            <p className="text-[10px] text-gray-500 font-mono tracking-wider">PREMIUM QUANTITATIVE INTELLIGENCE</p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[9px]">
          <span className={cn("w-2 h-2 rounded-full", hasAccess ? "bg-[#0d9488] animate-pulse" : "bg-red-500")}></span>
          <span className="text-gray-400">{hasAccess ? "NODE_READY" : "ACCESS_RESTRICTED"}</span>
        </div>
      </div>

      {/* Main Console Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5 relative min-h-0">
        {!hasAccess ? (
          /* Clean, Flat Locked Overlay Detail Screen */
          <div className="max-w-xl mx-auto py-12 flex flex-col items-center gap-8 animate-fade-in text-center">
            <div className="w-20 h-20 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-center relative group">
              <div className="absolute inset-0 bg-white/5 rounded-2xl blur-xl transition-all duration-500 opacity-60"></div>
              <MouxLogoSvg className="w-10 h-10 text-white relative z-10 opacity-30" />
              <Lock className="w-5 h-5 text-red-500 absolute bottom-1 right-1 bg-black p-1 rounded-full border border-red-500/30" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-black text-white uppercase tracking-widest">Terminal Locked</h3>
              <p className="text-xs text-gray-400 font-sans max-w-sm mx-auto leading-relaxed">
                MouxBot Core is locked. Upgrade to Pro or Veteran status to unlock your terminal.
              </p>
            </div>

            <button
              onClick={onOpenShop}
              className="px-6 py-3 bg-moux-cyan text-black text-xs font-black tracking-widest uppercase transition-all rounded-xl hover:brightness-110 flex items-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4" /> Upgrade Credentials
            </button>

            <div className="w-full bg-[#111111]/30 border border-white/5 rounded-2xl p-6 space-y-4 text-left">
              <h4 className="text-[10px] font-bold text-gray-400 font-mono uppercase tracking-widest border-b border-white/5 pb-2 flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-moux-cyan" />
                MouxBot Core Privileges & Criteria:
              </h4>

              <div className="space-y-4 font-mono text-xs">
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded bg-moux-cyan/10 text-moux-cyan mt-0.5">
                    <ArrowRight className="w-3 h-3" />
                  </div>
                  <div>
                    <strong className="text-white block text-[11px] uppercase tracking-wider">Continuous Generative Engine</strong>
                    <span className="text-[10px] text-gray-500">Unrestricted system intelligence and universe analytical calculations.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 rounded bg-moux-cyan/10 text-moux-cyan mt-0.5">
                    <ArrowRight className="w-3 h-3" />
                  </div>
                  <div>
                    <strong className="text-white block text-[11px] uppercase tracking-wider">Tiered Access Rates</strong>
                    <span className="text-[10px] text-gray-500">Pro clearance triggers 3 requests per 24 hours. Veteran nodes sustain limitless terminal capacity.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Live Chat Console Messages */
          <>
            {messages.map((msg) => {
              const isBot = msg.sender === "bot";
              // Format markdown highlights & signals elegantly
              let formattedText = msg.text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>');
              formattedText = formattedText.replace(/\[SIGNAL:\s*(BUY|HOLD|SELL)\]/gi, (match, p1) => {
                const color = p1.toUpperCase() === 'BUY' ? 'text-green-400 border-green-500/30 bg-green-500/10' : p1.toUpperCase() === 'SELL' ? 'text-red-400 border-red-500/30 bg-red-500/10' : 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
                return `\n\n<span class="font-bold tracking-widest uppercase border ${color} px-3 py-1.5 rounded-lg inline-block my-2 text-xs font-mono">OPINION SIGNAL: ${p1.toUpperCase()}</span>`;
              });

              return (
                <div 
                  key={msg.id} 
                  className={cn(
                    "flex w-full items-start gap-3.5 animate-fade-in", 
                    !isBot ? "justify-end" : "justify-start"
                  )}
                >
                  {isBot && (
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white flex-shrink-0">
                      <MouxLogoSvg className="w-4 h-4" />
                    </div>
                  )}

                  <div 
                    className={cn(
                      "px-4.5 py-3 rounded-2xl max-w-[80%] font-sans text-sm leading-relaxed border", 
                      !isBot 
                        ? "bg-white/5 border-white/10 text-white rounded-tr-none" 
                        : "bg-black/40 border-white/5 text-gray-200 rounded-tl-none"
                    )}
                  >
                    {isBot && (
                      <div className="flex items-center gap-1.5 mb-2 pb-1 border-b border-white/5">
                        <span className="text-[9px] text-[#0d9488] font-bold tracking-widest uppercase font-mono">MouxBot Engine</span>
                      </div>
                    )}
                    <div className="whitespace-pre-wrap text-xs md:text-sm" dangerouslySetInnerHTML={{ __html: formattedText }} />
                    {msg.imageUrl && (
                      <div className="mt-3 overflow-hidden rounded-xl border border-white/10 max-w-md bg-black/60">
                        <img 
                          src={msg.imageUrl} 
                          alt="AI Compiled Layer" 
                          className="w-full object-cover max-h-72 aspect-square rounded-xl"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex w-full justify-start items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white flex-shrink-0 animate-pulse">
                  <MouxLogoSvg className="w-4 h-4 animate-spin-slow" />
                </div>
                <div className="px-4 py-2 bg-black border border-white/5 rounded-2xl rounded-tl-none">
                  <span className="text-xs text-[#0d9488] font-mono animate-pulse flex items-center gap-2">
                    <Terminal className="w-3 h-3" />
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-moux-cyan rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-moux-cyan rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-moux-cyan rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Console */}
      {hasAccess && (
        <div className="p-4 border-t border-white/5 bg-black/40 backdrop-blur-lg">
          {selectedImages.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedImages.map((file, i) => (
                <div key={i} className="relative w-12 h-12 rounded-lg bg-white/10 border border-white/20">
                  <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover rounded-lg" />
                  <button 
                    onClick={() => removeImage(i)}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center cursor-pointer"
                  >
                    <X className="w-3 h-3 text-black" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <form onSubmit={handleSend} className="flex gap-2 items-center">
            <div className="relative">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                multiple
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-moux-cyan transition-colors cursor-pointer"
                title={`Attach Images (Max ${maxImages})`}
              >
                <ImagePlus className="w-5 h-5" />
              </button>
            </div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask MouxBot anything or request tactical telemetry..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0d9488]/40 text-white font-sans placeholder:text-gray-650"
            />
            <button 
              type="submit" 
              disabled={(!input.trim() && selectedImages.length === 0) || loading} 
              className="px-5 py-3 bg-white hover:bg-gray-200 text-black font-black text-xs tracking-widest uppercase transition-all rounded-xl disabled:opacity-30 disabled:pointer-events-none flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
          
          {hasProAccess && !hasVeteranAccess ? (
            <div className="flex items-center justify-between mt-2 px-1">
              <p className="text-[9px] text-amber-500 font-mono uppercase tracking-wider flex items-center gap-1">
                <RefreshCw className="w-3 h-3" /> Pro Rate Limit: {remainingQuota} / 3 prompts remaining
              </p>
              <button
                type="button"
                onClick={onOpenShop}
                className="text-[9px] text-moux-cyan hover:underline font-bold uppercase font-mono cursor-pointer"
              >
                Go Veteran for Unlimited Live Feed
              </button>
            </div>
          ) : (
            <p className="text-[8px] text-gray-500 font-mono mt-2 text-center uppercase tracking-wider">
              Secured M6 Decryption Node Terminal Available • Unlimited bandwidth
            </p>
          )}
        </div>
      )}
    </div>
  );
}
