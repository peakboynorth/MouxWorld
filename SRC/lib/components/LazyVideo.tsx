import React, { useRef, useState, useEffect, VideoHTMLAttributes } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { VideoThumbnail } from './VideoThumbnail';

interface LazyVideoProps extends VideoHTMLAttributes<HTMLVideoElement> {
  containerClassName?: string;
  className?: string;
  src?: string;
  onMediaClick?: (src: string) => void;
}

export function LazyVideo({ src, className, containerClassName, onMediaClick, ...props }: LazyVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  // Setup IntersectionObserver to detect when video enters viewport for high priority loading
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      onClick={() => onMediaClick && onMediaClick(src || "")}
      className={cn(
        "relative overflow-hidden flex bg-[#121212] justify-center items-center w-full aspect-[16/10] sm:aspect-[16/9] rounded-[24px] group border border-white/5 transition-all duration-300 shadow-2xl hover:shadow-cyan-950/20 hover:border-moux-cyan/20 cursor-pointer",
        containerClassName
      )}
    >
      {/* Default State - Always show static VideoThumbnail in timeline per design requirement */}
      <div className="absolute inset-0 w-full h-full">
        {src && (
          <VideoThumbnail 
            src={src} 
            className="w-full h-full object-cover rounded-[24px] transition-transform duration-500 group-hover:scale-[1.02]" 
          />
        )}
        
        {/* Immersive Pause Trigger Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/45 transition-colors duration-300">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/50 shadow-2xl transition-all duration-300 scale-100 group-hover:scale-110 group-hover:text-white group-hover:border-white/20">
              <Pause className="w-7 h-7 fill-current" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
