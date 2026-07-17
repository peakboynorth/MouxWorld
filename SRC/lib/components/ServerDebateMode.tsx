import React, { useState } from "react";
import { cn } from "../lib/utils";
import { Scale, Users, Timer, Play, X, Key } from "lucide-react";
import { motion } from "motion/react";

export function ServerDebateMode({ currentUser, isLight, onClose }: any) {
  const [topic, setTopic] = useState("");
  const [isCreator, setIsCreator] = useState(false);
  const [debateCreated, setDebateCreated] = useState(false);
  const [mySide, setMySide] = useState<"for" | "against" | null>(null);
  const [started, setStarted] = useState(false);
  
  const [participants, setParticipants] = useState([
    { name: "Wanderer-1", side: "for" },
    { name: "Scholar", side: "against" }
  ]);

  const textMain = isLight ? "text-gray-900" : "text-white";
  const bgCard = isLight ? "bg-white border-gray-200" : "bg-black/40 border-white/10";

  return (
    <div className={cn("flex flex-col h-full", bgCard, "border-l")}>
      <header className="p-4 border-b border-white/10 flex items-center justify-between">
        <h3 className={cn("font-black uppercase tracking-tighter flex items-center gap-2", textMain)}>
          <Scale className="w-5 h-5 text-moux-cyan" />
          Server Debate Arena
        </h3>
        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 flex flex-col">
          {!debateCreated ? (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                 <h4 className={cn("text-sm font-bold uppercase", textMain)}>Propose a Debate</h4>
                 <input 
                   value={topic}
                   onChange={e => setTopic(e.target.value)}
                   className={cn("w-full p-3 rounded-xl border focus:border-moux-cyan outline-none", isLight ? "bg-gray-100 border-gray-200 text-black" : "bg-black border-white/10 text-white")}
                   placeholder="e.g., Moux Economy Should Be Global"
                 />
                 <div className="flex gap-4">
                     <button onClick={() => setMySide("for")} className={cn("flex-1 p-3 rounded-xl border font-bold uppercase disabled:opacity-50", mySide === "for" ? "bg-moux-cyan text-black" : (isLight ? "bg-white text-black" : "bg-black text-white border-white/10"))}>For</button>
                     <button onClick={() => setMySide("against")} className={cn("flex-1 p-3 rounded-xl border font-bold uppercase disabled:opacity-50", mySide === "against" ? "bg-red-500 text-white" : (isLight ? "bg-white text-black" : "bg-black text-white border-white/10"))}>Against</button>
                 </div>
                 <button 
                  onClick={() => {
                      if(!topic || !mySide) return;
                      setIsCreator(true);
                      setDebateCreated(true);
                      setParticipants([{ name: currentUser?.displayName || "You", side: mySide }]);
                  }}
                  disabled={!topic || !mySide}
                  className="w-full bg-white text-black p-3 font-black uppercase rounded-xl hover:bg-white/90">
                     Initialize Arena
                 </button>
             </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col space-y-6">
                <div className="text-center space-y-2">
                    <span className="text-xs uppercase font-black text-moux-cyan tracking-widest">Active Topic</span>
                    <h2 className={cn("text-2xl font-black italic", textMain)}>{topic}</h2>
                </div>

                <div className="grid grid-cols-2 gap-4 flex-1">
                     <div className="border border-white/10 rounded-2xl p-4 flex flex-col">
                         <h4 className="text-moux-cyan font-black uppercase text-sm mb-4">The Advocates (For)</h4>
                         <div className="flex-1 space-y-2">
                             {participants.filter(p => p.side === 'for').map((p, i) => (
                                 <div key={i} className="bg-white/5 p-2 rounded-lg text-sm text-gray-300 font-mono flex items-center gap-2">
                                    <Users className="w-3 h-3"/> {p.name}
                                 </div>
                             ))}
                         </div>
                         {!started && mySide !== "for" && (
                            <button onClick={() => {
                                setMySide("for");
                                setParticipants([...participants.filter(p => p.name !== currentUser?.displayName), { name: currentUser?.displayName || "You", side: "for" }]);
                            }} className="mt-4 w-full p-2 rounded-lg border border-moux-cyan text-moux-cyan text-xs font-bold uppercase hover:bg-moux-cyan hover:text-black transition-colors">Switch to For</button>
                         )}
                     </div>

                     <div className="border border-white/10 rounded-2xl p-4 flex flex-col">
                         <h4 className="text-red-500 font-black uppercase text-sm mb-4">The Opposition (Against)</h4>
                         <div className="flex-1 space-y-2">
                             {participants.filter(p => p.side === 'against').map((p, i) => (
                                 <div key={i} className="bg-white/5 p-2 rounded-lg text-sm text-gray-300 font-mono flex items-center gap-2">
                                    <Users className="w-3 h-3"/> {p.name}
                                 </div>
                             ))}
                         </div>
                         {!started && mySide !== "against" && (
                            <button onClick={() => {
                                setMySide("against");
                                setParticipants([...participants.filter(p => p.name !== currentUser?.displayName), { name: currentUser?.displayName || "You", side: "against" }]);
                            }} className="mt-4 w-full p-2 rounded-lg border border-red-500 text-red-500 text-xs font-bold uppercase hover:bg-red-500 hover:text-white transition-colors">Switch to Against</button>
                         )}
                     </div>
                </div>

                {isCreator && !started && (
                    <div className="p-4 bg-moux-cyan/10 rounded-2xl border border-moux-cyan/20 space-y-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-moux-cyan font-bold flex items-center gap-2"><Key className="w-4 h-4"/> Creator Controls</span>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setStarted(true)} className="flex-1 bg-moux-cyan text-black font-black uppercase text-sm p-3 rounded-xl flex items-center justify-center gap-2 hover:bg-moux-cyan/90 transition-all">
                                <Play className="w-4 h-4" /> Start Debate
                            </button>
                            <button className="px-4 border border-moux-cyan/30 text-moux-cyan rounded-xl hover:bg-moux-cyan/10">
                                <Timer className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {started && (
                    <div className="text-center p-4 bg-white/5 rounded-2xl border border-white/10 animate-pulse">
                         <p className="text-moux-cyan font-mono text-sm tracking-widest uppercase mb-1">Debate is Live</p>
                         <p className="text-xs text-gray-400">Speak through the debate channels or voice rooms.</p>
                    </div>
                )}
            </motion.div>
          )}
      </div>
    </div>
  );
}
