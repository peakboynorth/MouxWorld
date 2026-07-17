import React, { useRef, useState, useEffect, ImgHTMLAttributes } from 'react';
import { cn } from '../lib/utils';
import { Play, Pause } from 'lucide-react';

interface LazyGifImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  containerClassName?: string;
  src?: string;
  alt?: string;
  className?: string;
  onMediaClick?: (src: string) => void;
}

export function LazyGifImage({ src, className, containerClassName, alt, onMediaClick, ...props }: LazyGifImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Force media playback exclusively in lightbox, freeze at first frame in timeline
  const [loadMedia, setLoadMedia] = useState(false);
  const [hasCapturedFrame, setHasCapturedFrame] = useState(false);

  // 1. Lazy load vicinity checker (Observation in 300px vicinity)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const vicinityObserver = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setLoadMedia(true);
          vicinityObserver.disconnect();
        }
      },
      { rootMargin: '300px' }
    );

    vicinityObserver.observe(container);
    return () => vicinityObserver.disconnect();
  }, []);

  // Capture static image snapshot on canvas to freeze GIF playback loops forever in feed
  const captureFirstFrame = () => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;

    if (img.complete && img.naturalWidth > 0) {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        try {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          setHasCapturedFrame(true);
        } catch (e) {
          console.warn("Could not retrieve static cross-origin frame canvas snapshot:", e);
        }
      }
    }
  };

  const isGif = src?.toLowerCase().includes(".gif") || src?.includes("giphy");

  const handleImageLoad = () => {
    // Small timeout ensures we capture at least the first frame
    setTimeout(captureFirstFrame, 150);
  };

  // Logic: In the timeline, we ALWAYS show the frozen frame (canvas)
  // unless we haven't captured it yet. Active <img> is hidden to stop looping.
  const showActiveImage = !hasCapturedFrame;

  return (
    <div
      ref={containerRef}
      onClick={() => onMediaClick && onMediaClick(src || "")}
      className={cn(
        "relative overflow-hidden flex bg-black/10 justify-center items-center w-full min-h-[150px] rounded-xl group/gif transition-all duration-300 hover:shadow-xl hover:shadow-cyan-900/10",
        onMediaClick ? "cursor-pointer" : "",
        containerClassName
      )}
    >
      {loadMedia ? (
        <>
          {/* Active play animating image component - Only visible during initial frame capture or if capture fails */}
          <img
            ref={imgRef}
            src={src || undefined}
            alt={alt}
            className={cn(
              "w-full h-auto max-h-[500px] object-contain rounded-xl transition-all duration-200",
              showActiveImage ? "opacity-100" : "opacity-0 pointer-events-none absolute",
              className
            )}
            onLoad={handleImageLoad}
            crossOrigin="anonymous"
            {...props}
          />

          {/* Frozen snapshot frame canvas component shown always in timeline for zero loop overhead */}
          <canvas
            ref={canvasRef}
            className={cn(
              "w-full h-auto max-h-[500px] object-contain rounded-xl transition-all duration-200",
              !showActiveImage ? "opacity-100 block" : "opacity-0 pointer-events-none absolute",
              className
            )}
          />

          {/* Centered Pause Indicator to tell user they can tap for immersive view */}
          {!showActiveImage && isGif && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/15 group-hover/gif:bg-black/30 transition-colors">
              <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/50 shadow-2xl transition-all duration-300 scale-95 group-hover/gif:scale-105 group-hover/gif:text-white group-hover/gif:border-white/20">
                <Pause className="w-5 h-5 fill-current" />
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-white/5 animate-pulse rounded-xl" />
      )}
    </div>
  );
}
