import React, { useState, useEffect } from "react";
import { X, Search } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

const TRENDING_QUERIES = ["Awkward", "Ew", "Angry", "Surprise", "Happy", "Sad", "Laughing"];

const MOCK_GIFS = [
  "https://media.giphy.com/media/l41lPVMmb30JO72WA/giphy.gif",
  "https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif",
  "https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif",
  "https://media.giphy.com/media/26ufdipQqUpiX5T8I/giphy.gif",
  "https://media.giphy.com/media/3o6ozh46EBu2oCE2g8/giphy.gif",
  "https://media.giphy.com/media/l0HlRnAWXxn0MhKLK/giphy.gif",
  "https://media.giphy.com/media/xT0BKL21U5nnlW4m6k/giphy.gif",
  "https://media.giphy.com/media/d2lcHJTG5Tscg/giphy.gif",
  "https://media.giphy.com/media/8vQSQ3cNXuDny/giphy.gif",
  "https://media.giphy.com/media/T1WqKkLYCbC12/giphy.gif",
  "https://media.giphy.com/media/Y4zPj5zzfJk0y4E72v/giphy.gif",
  "https://media.giphy.com/media/26n6WywJyh39n1pSp/giphy.gif"
];

interface GifBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  isLight?: boolean;
}

const GIPHY_API_KEY = (import.meta as any).env.VITE_GIPHY_API_KEY || "GlVGYHqc3SyCEGpoJCzkIg1T9A1Fq3eF"; // Fallback to public beta key

export function GifBottomSheet({ isOpen, onClose, onSelect, isLight }: GifBottomSheetProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [gifs, setGifs] = useState<string[]>([]);
  
  const fetchGifs = async (query: string) => {
    setLoading(true);
    try {
      const endpoint = query.trim() 
        ? `/api/giphy?q=${encodeURIComponent(query)}`
        : `/api/giphy`;
      
      const res = await fetch(endpoint);
      const data = await res.json();
      if (data && data.data) {
        setGifs(data.data.map((g: any) => g.images.downsized.url));
      } else {
        setGifs(MOCK_GIFS);
      }
    } catch(e) {
      setGifs(MOCK_GIFS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchGifs(searchQuery);
    } else {
      setSearchQuery("");
      setGifs([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const timer = setTimeout(() => {
        if(isOpen) {
             fetchGifs(searchQuery);
        }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleQueryClick = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={cn(
              "fixed bottom-0 left-0 right-0 h-[75vh] z-[101] flex flex-col rounded-t-3xl overflow-hidden shadow-2xl border-t border-white/10",
              isLight ? "bg-white" : "bg-[#111111]"
            )}
          >
            {/* Handle Bar */}
            <div className="w-full flex justify-center py-3">
              <div className="w-12 h-1.5 rounded-full bg-gray-500/30" />
            </div>

            {/* Header / Search */}
            <div className="px-4 pb-4 border-b border-gray-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className={cn(
                  "flex-1 flex items-center px-4 py-2.5 rounded-2xl border",
                  isLight ? "bg-gray-100 border-gray-200" : "bg-black/50 border-white/10"
                )}>
                  <Search className="w-5 h-5 text-gray-500 mr-2" />
                  <input
                    type="text"
                    placeholder="Search GIFs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none w-full text-base placeholder:text-gray-500"
                    style={{ color: isLight ? "#000" : "#fff" }}
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="ml-2">
                      <X className="w-4 h-4 text-gray-500 hover:text-gray-300" />
                    </button>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className={cn(
                    "p-2 rounded-full",
                    isLight ? "hover:bg-gray-200" : "hover:bg-white/10 text-white"
                  )}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Trending Queries */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {TRENDING_QUERIES.map(q => (
                  <button
                    key={q}
                    onClick={() => handleQueryClick(q)}
                    className={cn(
                      "whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors border",
                      isLight 
                        ? searchQuery === q ? "bg-black text-white border-black" : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                        : searchQuery === q ? "bg-white text-black border-white" : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10"
                    )}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-2 no-scrollbar">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="w-8 h-8 border-4 border-[#0BEA7A] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="columns-2 md:columns-3 gap-2 space-y-2">
                  {gifs.map((url, i) => (
                    <div 
                      key={i}
                      onClick={() => onSelect(url)}
                      className="break-inside-avoid relative rounded-xl overflow-hidden cursor-pointer group mb-2"
                    >
                      <img 
                        src={url || undefined} 
                        alt="GIF" 
                        loading="lazy" 
                        className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300 bg-gray-800"
                        style={{ minHeight: '120px' }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
