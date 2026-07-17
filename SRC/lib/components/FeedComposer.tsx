import React, { useState, useRef } from "react";
import { cn } from "../lib/utils";
import { Globe, X, ChevronDown, ImagePlus, PieChart, MapPin, Play } from "lucide-react";
import { GifBottomSheet } from "./GifBottomSheet";
import { VideoThumbnail } from "./VideoThumbnail";

export interface FeedComposerProps {
  currentUser: any;
  isLight: boolean;
  externalMedia: any;
  onClearExternalMedia: () => void;
  onPost: (text: string, media: any, audience: string, isMature: boolean) => void;
  onOpenMediaPicker: () => void;
}

export function FeedComposer({
  currentUser,
  isLight,
  externalMedia,
  onClearExternalMedia,
  onPost,
  onOpenMediaPicker,
}: FeedComposerProps) {
  const [feedInput, setFeedInput] = useState("");
  const [internalMedia, setInternalMedia] = useState<any>(null);
  
  // Use external media by default if supplied, otherwise internal
  const feedMedia = externalMedia || internalMedia;
  
  const setFeedMedia = (media: any) => {
    if (externalMedia) {
        onClearExternalMedia();
    }
    setInternalMedia(media);
  };
  const [audience, setAudience] = useState("Everyone (Global)");
  const [showAudienceDropdown, setShowAudienceDropdown] = useState(false);
  const [isMaturePost, setIsMaturePost] = useState(false);
  const feedFileInputRef = useRef<HTMLInputElement>(null);
  const [showGifSheet, setShowGifSheet] = useState(false);

  // States for duration monitoring and simulated upload stream progress
  const [videoDurationStr, setVideoDurationStr] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Parse video duration instantly and store as format (e.g. "0:15")
  React.useEffect(() => {
    if (feedMedia && feedMedia.type === "video" && feedMedia.url) {
      setVideoDurationStr(null);
      const tempVideo = document.createElement("video");
      tempVideo.src = feedMedia.url;
      const handleLoadedMetadata = () => {
        const d = tempVideo.duration;
        if (!isNaN(d)) {
          const minutes = Math.floor(d / 60);
          const seconds = Math.floor(d % 60);
          setVideoDurationStr(`${minutes}:${seconds < 10 ? "0" : ""}${seconds}`);
        }
      };
      tempVideo.addEventListener("loadedmetadata", handleLoadedMetadata);
      tempVideo.load();
      return () => {
        tempVideo.removeEventListener("loadedmetadata", handleLoadedMetadata);
      };
    } else {
      setVideoDurationStr(null);
    }
  }, [feedMedia]);

  const textMain = isLight ? "text-black" : "text-white";
  const textMuted = isLight ? "text-gray-500" : "text-gray-400";
  const cardMain = isLight ? "bg-white" : "bg-black/40";
  const borderMain = isLight ? "border-gray-200" : "border-white/10";
  const inputMain = isLight
    ? "bg-gray-100 border-gray-200 text-black placeholder:text-gray-500"
    : "bg-black border-white/10 text-white placeholder:text-gray-600";

  const handleFeedFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        alert("File too large (max 15MB)");
        return;
      }
      let mediaType: 'image' | 'video' = 'image';
      if (file.type === "video/mp4" || file.type.startsWith("video/")) {
        mediaType = 'video';
        const url = URL.createObjectURL(file);
        setFeedMedia({ url, file, type: mediaType });
      } else if (file.type.startsWith("image/")) {
        mediaType = 'image';
        try {
          const compressedUrl = await new Promise<string>((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement("canvas");
              let width = img.width;
              let height = img.height;
              const MAX_DIMENSION = 1920;
              
              if (width > height && width > MAX_DIMENSION) {
                height *= MAX_DIMENSION / width;
                width = MAX_DIMENSION;
              } else if (height > MAX_DIMENSION) {
                width *= MAX_DIMENSION / height;
                height = MAX_DIMENSION;
              }
              
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext("2d");
              if (!ctx) {
                reject(new Error("Canvas not supported"));
                return;
              }
              ctx.drawImage(img, 0, 0, width, height);
              resolve(canvas.toDataURL((file.type === "image/png" ? "image/png" : "image/jpeg"), 0.8));
            };
            img.onerror = reject;
            img.src = URL.createObjectURL(file);
          });
          
          const rawBase64 = compressedUrl.split(',')[1];
          const bstr = atob(rawBase64);
          let n = bstr.length;
          const u8arr = new Uint8Array(n);
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
          }
          const compressedFile = new File([u8arr], file.name, { type: file.type === "image/png" ? "image/png" : "image/jpeg" });
          
          setFeedMedia({ url: compressedUrl, file: compressedFile, type: mediaType });
        } catch (e) {
          console.error("Image compression failed, falling back to original", e);
          const url = URL.createObjectURL(file);
          setFeedMedia({ url, file, type: mediaType });
        }
      }
    }
    if (feedFileInputRef.current) feedFileInputRef.current.value = "";
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploading) return;
    if ((!feedInput.trim() && !feedMedia) || currentUser?.isBanned) return;

    if (feedMedia) {
      setIsUploading(true);
      setUploadProgress(0);

      const durationMs = 1500;
      const intervalMs = 30;
      const totalSteps = durationMs / intervalMs;
      const stepValue = 100 / totalSteps;
      let curProgress = 0;

      const progressTimer = setInterval(() => {
        curProgress += stepValue;
        if (curProgress >= 100) {
          clearInterval(progressTimer);
          setUploadProgress(100);
          
          // Yield to async post submittal once simulation ends at 100% completion
          setTimeout(async () => {
            try {
              await onPost(feedInput, feedMedia, audience, isMaturePost);
              setFeedInput("");
              setFeedMedia(null);
              setIsMaturePost(false);
            } catch (err) {
              console.error("Failed to commit post:", err);
            } finally {
              setIsUploading(false);
              setUploadProgress(0);
            }
          }, 150);
        } else {
          setUploadProgress(curProgress);
        }
      }, intervalMs);
    } else {
      await onPost(feedInput, feedMedia, audience, isMaturePost);
      setFeedInput("");
      setFeedMedia(null);
      setIsMaturePost(false);
    }
  };

  return (
    <>
    <form
      onSubmit={handlePost}
      className={cn(
        "relative mb-12 p-4 md:p-6 rounded-2xl border backdrop-blur-sm shadow-xl",
        cardMain,
        borderMain,
      )}
    >
      {/* active mock linear download/upload progress overlay indicators */}
      {isUploading && (
        <div className="absolute inset-0 bg-[#0c0c0e]/95 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 z-[9999] select-none animate-fade-in">
          <div className="w-full max-w-xs flex flex-col items-center text-center">
            {/* Cursive Logo SVG for the Post Upload Loader State */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="64" height="64" fill="none" className="mb-4">
              <style>{`
                .cursive-m-path {
                  stroke: #FFFFFF;
                  stroke-width: 4.5;
                  stroke-linecap: round;
                  stroke-linejoin: round;
                  stroke-dasharray: 250;
                  stroke-dashoffset: 250;
                  animation: writeAndErase 3.5s infinite ease-in-out;
                }

                @keyframes writeAndErase {
                  0% {
                    stroke-dashoffset: 250;
                    opacity: 0;
                  }
                  5% {
                    opacity: 1;
                  }
                  45% {
                    stroke-dashoffset: 0;
                    opacity: 1;
                  }
                  65% {
                    stroke-dashoffset: 0;
                    opacity: 1;
                  }
                  85% {
                    opacity: 0;
                  }
                  100% {
                    stroke-dashoffset: 250;
                    opacity: 0;
                  }
                }
              `}</style>
              <path className="cursive-m-path" d="M 15,65 C 22,40 28,25 35,28 C 42,32 38,68 48,52 C 55,40 54,32 60,34 C 66,36 62,68 70,55 C 75,46 79,42 85,45" />
            </svg>
            <span className="text-white font-mono font-black text-xs tracking-widest uppercase mb-1">
              Broadcasting Media Frame
            </span>
            <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase mb-4">
              Streaming visual data to live database
            </span>
            <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden border border-white/5">
              <div 
                className="bg-moux-cyan h-full transition-all duration-75 ease-out rounded-full"
                style={{ width: `${Math.round(uploadProgress)}%` }}
              />
            </div>
            <span className="text-moux-cyan font-mono text-[10px] mt-2.5 font-bold tracking-tight">
              {Math.round(uploadProgress)}% COMPLETE
            </span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h4
          className={cn(
            "font-display font-bold text-sm flex items-center gap-2",
            textMain,
          )}
        >
          <Globe className="w-4 h-4 text-moux-cyan" /> Create Post
        </h4>
        { (feedInput || feedMedia) && (
          <button
            type="button"
            onClick={() => {
              setFeedInput("");
              setFeedMedia(null);
            }}
            className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 hover:text-white" />
          </button>
        )}
      </div>
      <div className="relative mb-2">
        <textarea
          value={feedInput}
          onChange={(e) => setFeedInput(e.target.value)}
          placeholder="What's happening?"
          className={cn(
            "w-full border rounded-xl p-4 focus:outline-none focus:border-moux-cyan/30 min-h-[120px] resize-none text-base outline-none cursor-text overflow-y-auto whitespace-pre-wrap break-words block",
            inputMain,
          )}
        />
      </div>
      <div className="relative mb-4">
        <button
          type="button"
          onClick={() => setShowAudienceDropdown(!showAudienceDropdown)}
          className="flex items-center gap-2 text-moux-cyan hover:bg-moux-cyan/10 px-3 py-1.5 rounded-full font-medium text-sm transition-colors border border-moux-cyan/20"
        >
          <span>{audience}</span>
          <ChevronDown className={cn("w-4 h-4 transition-transform", showAudienceDropdown && "rotate-180")} />
        </button>
        {showAudienceDropdown && (
          <div className="absolute top-full left-0 mt-2 w-64 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden py-2 z-10 font-sans">
            {["Everyone (Global)", "Server Subscribers", "Close Circle"].map(opt => (
              <button
                key={opt}
                type="button"
                className={cn("w-full text-left px-4 py-2 hover:bg-white/5 transition-colors text-sm font-medium", audience === opt ? "text-moux-cyan" : "text-white")}
                onClick={() => {
                   setAudience(opt);
                   setShowAudienceDropdown(false);
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
      {feedMedia && (
        <div className="relative mb-4 rounded-[20px] overflow-hidden border border-white/5 bg-[#121212] group max-w-sm shadow-2xl transition-all duration-300">
          {feedMedia.type === 'video' ? (
            <div className="relative w-full aspect-[16/10] bg-[#121212] overflow-hidden rounded-[20px]">
              <VideoThumbnail 
                src={feedMedia.url} 
                className="w-full h-full object-cover rounded-[20px]" 
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/35 group-hover:bg-black/50 transition-colors duration-300 pointer-events-none">
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-xl transition-all duration-300 group-hover:scale-110">
                  <Play className="w-5 h-5 fill-white ml-0.5" />
                </div>
              </div>
              {videoDurationStr && (
                <div className="absolute bottom-3.5 right-3.5 z-10 bg-black/80 backdrop-blur-md border border-white/10 rounded-full px-2.5 py-1 text-[10px] font-mono font-black text-white shadow-lg pointer-events-none tracking-tight">
                  {videoDurationStr}
                </div>
              )}
            </div>
          ) : (
            <img
              src={feedMedia.url || undefined}
              alt="Upload preview"
              className="max-h-[200px] object-cover rounded-[20px] block w-full"
            />
          )}
          <button
            type="button"
            onClick={() => setFeedMedia(null)}
            className="absolute top-3 right-3 p-1.5 bg-black/60 hover:bg-red-500 rounded-full text-white backdrop-blur transition-all opacity-0 group-hover:opacity-100 shadow-md border border-white/5 cursor-pointer hover:scale-105 active:scale-95"
            title="Remove Media"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto no-scrollbar pb-2 sm:pb-0">
          <input
            type="file"
            accept="image/*,video/mp4"
            className="hidden"
            ref={feedFileInputRef}
            onChange={handleFeedFileChange}
          />
          <button
              type="button"
              onClick={onOpenMediaPicker}
              title="Media"
              className={cn(
              "flex items-center justify-center p-2 rounded-full transition-colors border-none",
              isLight ? "hover:bg-black/10 text-black/60 hover:text-black" : "hover:bg-white/10 text-white/60 hover:text-white"
              )}
          >
              <ImagePlus className="w-5 h-5" />
          </button>
          <button
              type="button"
              onClick={() => setShowGifSheet(true)}
              title="GIF"
              className={cn(
              "flex items-center justify-center px-2 py-0.5 rounded border-2 transition-colors font-black text-xs h-7",
              isLight ? "border-black/60 text-black/60 hover:border-black hover:text-black" : "border-white/60 text-white/60 hover:border-white hover:text-white"
              )}
          >
              GIF
          </button>
          <button
              type="button"
              title="Poll"
              className={cn(
              "flex items-center justify-center p-2 rounded-full transition-colors border-none",
              isLight ? "hover:bg-black/10 text-black/60 hover:text-black" : "hover:bg-white/10 text-white/60 hover:text-white"
              )}
          >
              <PieChart className="w-5 h-5" />
          </button>
          <button
              type="button"
              title="Location"
              className={cn(
              "flex items-center justify-center p-2 rounded-full transition-colors border-none",
              isLight ? "hover:bg-black/10 text-black/60 hover:text-black" : "hover:bg-white/10 text-white/60 hover:text-white"
              )}
          >
              <MapPin className="w-5 h-5" />
          </button>
          <label
            className={cn(
              "flex items-center gap-2 cursor-pointer group p-2 rounded-full transition-all ml-1",
              isLight ? "hover:bg-black/5" : "hover:bg-white/5",
            )}
          >
            <input
              type="checkbox"
              checked={isMaturePost}
              onChange={(e) => setIsMaturePost(e.target.checked)}
              className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-moux-cyan focus:ring-moux-cyan/30"
            />
            <span
              className={cn(
                "text-[10px] font-black uppercase group-hover:text-moux-cyan transition-colors tracking-widest",
                textMuted,
              )}
            >
              NSFW
            </span>
          </label>
        </div>
        
        <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
          <div className="flex items-center justify-center w-6 h-6 border-2 border-white/20 rounded-full">
              <span className="text-[8px] text-white/40">{feedInput.length > 0 ? feedInput.length : ""}</span>
          </div>
          <button
            type="submit"
            disabled={
              currentUser?.isBanned ||
              (!feedInput.trim() && !feedMedia)
            }
            className="bg-moux-cyan text-black hover:opacity-90 font-black tracking-widest uppercase flex items-center justify-center gap-2 py-2 px-6 text-sm min-h-[40px] rounded-full transition-all"
          >
            <Globe className="w-4 h-4 ml-[-4px]" /> POST
          </button>
        </div>
      </div>
    </form>
    
      <GifBottomSheet
        isOpen={showGifSheet}
        onClose={() => setShowGifSheet(false)}
        onSelect={(url) => {
          setFeedMedia({ url, file: null, type: 'image' });
          setShowGifSheet(false);
        }}
      />
    </>
  );
}
