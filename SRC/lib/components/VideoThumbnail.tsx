import React, { useState, useEffect, useRef } from "react";
import { Play, Pause } from "lucide-react";

interface VideoThumbnailProps {
  src: string;
  className?: string;
}

export function VideoThumbnail({ src, className }: VideoThumbnailProps) {
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!src) return;
    setThumbnail(null);
    setLoadError(false);

    const video = document.createElement("video");
    video.src = src;
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.playsInline = true;
    video.currentTime = 0.5; // seek past first frame for a proper visual frame

    const handleCanPlay = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 360;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
          setThumbnail(dataUrl);
        } else {
          setLoadError(true);
        }
      } catch (e) {
        console.warn("Security/CORS restriction blocked canvas extraction, applying beautiful vector illustration:", e);
        setLoadError(true);
      }
      // cleanup listeners
      video.removeEventListener("canplay", handleCanPlay);
    };

    const handleError = () => {
      setLoadError(true);
      video.removeEventListener("error", handleError);
    };

    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("error", handleError);
    video.load();

    return () => {
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("error", handleError);
    };
  }, [src]);

  if (thumbnail && !loadError) {
    return (
      <img
        src={thumbnail}
        alt="Video Thumbnail Preview"
        className={className}
      />
    );
  }

  // Fallback beautiful, dark slate modern layout matching #121212 aesthetic
  return (
    <div className="w-full h-full min-h-[160px] bg-[#121212] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Abstract geometric shapes behind */}
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-moux-cyan/5 to-transparent pointer-events-none" />
      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-2.5">
        <Pause className="w-6 h-6 text-gray-500" />
      </div>
    </div>
  );
}
