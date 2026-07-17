import React, { useEffect, useRef } from "react";
import { X, Upload, Camera, Image as ImageIcon, Film, Info } from "lucide-react";
import { cn } from "../lib/utils";

export interface CustomMediaPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (file: File) => void;
  mode: "pfp" | "server" | "feed";
}

export function CustomMediaPicker({ isOpen, onClose, onSelect, mode }: CustomMediaPickerProps) {
  const nativeInputRef = useRef<HTMLInputElement>(null);

  // Auto-launch the native OS picker sheet as soon as the picker opens
  useEffect(() => {
    if (isOpen) {
      // Small timeout to allow the browser view transition to finish smoothly
      const timer = setTimeout(() => {
        if (nativeInputRef.current) {
          try {
            nativeInputRef.current.click();
          } catch (e) {
            console.warn("Auto-trigger of native file selector was guarded by browser policy:", e);
          }
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNativeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith("video/") && file.size > 15 * 1024 * 1024) {
         alert("Video exceeds 15MB max file size.");
         return;
      }
      if (file.type === "image/gif" && file.size > 15 * 1024 * 1024) {
         alert("GIF exceeds 15MB max file size.");
         return;
      }
      if ((mode === "pfp" || mode === "server") && file.type.startsWith("video/")) {
         alert("Videos are not allowed for this context.");
         return;
      }
      onSelect(file);
      onClose();
    }
  };

  const handleContainerClick = () => {
    if (nativeInputRef.current) {
      nativeInputRef.current.click();
    }
  };

  // Human-readable labels for the active mode
  const getModeLabel = () => {
    switch (mode) {
      case "pfp": return "Profile Picture Selection";
      case "server": return "Server Icon Selection";
      case "feed": return "New Channel Post Media";
      default: return "Media Upload";
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-[#0c0c0e] flex flex-col font-sans transition-all duration-300">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0e0e11]/80 backdrop-blur-md">
        <div className="flex flex-col">
          <span className="text-gray-500 text-[10px] font-mono tracking-widest font-bold uppercase">{getModeLabel()}</span>
          <h1 className="text-white font-black text-lg tracking-tight uppercase">Native Media Connection</h1>
        </div>
        
        <button 
          onClick={onClose} 
          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all cursor-pointer border border-white/5 active:scale-95"
          title="Cancel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Full Body Click Target Box */}
      <div className="flex-1 flex flex-col p-6 justify-center items-center">
        <div 
          onClick={handleContainerClick}
          className="w-full max-w-2xl aspect-[4/3] sm:aspect-[16/10] bg-[#111115]/50 hover:bg-[#141419]/80 border-2 border-dashed border-white/10 hover:border-moux-cyan/40 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer transition-all duration-300 p-8 text-center group relative overflow-hidden shadow-2xl"
        >
          {/* Subtle Back Glow Effect on Hover */}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-moux-cyan/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <input 
            type="file" 
            className="hidden" 
            ref={nativeInputRef} 
            onChange={handleNativeUpload} 
            accept={mode === "feed" ? "image/*,video/mp4,video/quicktime" : "image/*"} 
          />

          {/* Device Upload Symbol / Icon group */}
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-moux-cyan/30 group-hover:bg-moux-cyan/5 transition-all duration-300 relative">
              <Upload className="w-8 h-8 text-gray-400 group-hover:text-moux-cyan group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-moux-cyan rounded-xl flex items-center justify-center text-black border-2 border-[#111115] shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Camera className="w-3.5 h-3.5" />
            </div>
          </div>

          <h2 className="text-white font-black text-xl tracking-tight uppercase mb-2 group-hover:text-moux-cyan transition-colors">
            Device System Selector
          </h2>
          
          <p className="text-gray-400 text-sm max-w-sm mb-6 leading-relaxed">
            Tap anywhere in this area to trigger your phone or computer's native file explorer, photo library, or system camera.
          </p>

          {/* Quick Specifications Badges */}
          <div className="flex flex-wrap gap-2 justify-center items-center">
            <span className="px-3 py-1 bg-white/5 border border-white/5 rounded-full text-[10px] text-gray-400 font-mono flex items-center gap-1.5 uppercase">
              <ImageIcon className="w-3 h-3 text-moux-cyan" /> Images Enabled
            </span>
            {mode === "feed" ? (
              <span className="px-3 py-1 bg-white/5 border border-white/5 rounded-full text-[10px] text-gray-400 font-mono flex items-center gap-1.5 uppercase">
                <Film className="w-3 h-3 text-red-400" /> MP4 Video Enabled
              </span>
            ) : (
              <span className="px-3 py-1 bg-white/5 border border-white/5 rounded-full text-[10px] text-gray-400 font-mono flex items-center gap-1.5 uppercase">
                <Info className="w-3 h-3 text-amber-400" /> Images Only
              </span>
            )}
            <span className="px-3 py-1 bg-white/5 border border-white/5 rounded-full text-[10px] text-gray-400 font-mono uppercase">
              Max 15MB (Auto-Compress)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
