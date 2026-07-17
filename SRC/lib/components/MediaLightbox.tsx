import React, { useState, useEffect, useRef } from "react";
import { X, Download, ZoomIn, ZoomOut, RotateCcw, Play, Pause, Volume2, VolumeX, Repeat } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface MediaLightboxProps {
  isOpen: boolean;
  src: string;
  onClose: () => void;
}

export function MediaLightbox({ isOpen, src, onClose }: MediaLightboxProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isGifPlaying, setIsGifPlaying] = useState(false);
  const [hasCapturedGifFrame, setHasCapturedGifFrame] = useState(false);

  // States for custom video player controls
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isVideoLooping, setIsVideoLooping] = useState(true);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoControlsVisible, setVideoControlsVisible] = useState(true);
  
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Determine media category
  const isVideo = src.toLowerCase().match(/\.(mp4|webm|ogg|quicktime|mov)/) || src.includes("video/");
  // Standard check to differentiate GIF vs static Image
  const isGif = src.toLowerCase().includes(".gif") || src.includes("giphy");
  const isImage = !isVideo && !isGif;

  // Reset viewport zoom stats and customized variables on resource change/open
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
      // Design intent: GIF starts playing by default when opened in lightbox for immersive view
      setIsGifPlaying(true);
      setHasCapturedGifFrame(false);

      // Reset video variables
      setIsVideoPlaying(true);
      setIsVideoMuted(false);
      setIsVideoLooping(true);
      setVideoCurrentTime(0);
      setVideoDuration(0);
      setVideoControlsVisible(true);
    }
  }, [isOpen, src]);

  // Autohide Controls after 2 seconds of continuous playback
  useEffect(() => {
    if (!isOpen || !isVideo) return;
    if (!videoControlsVisible || !isVideoPlaying) return;

    const timer = setTimeout(() => {
      setVideoControlsVisible(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [videoControlsVisible, isVideoPlaying, videoCurrentTime, isOpen, isVideo]);

  const handleVideoMouseMove = () => {
    if (!videoControlsVisible) {
      setVideoControlsVisible(true);
    }
  };

  const toggleVideoControls = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest(".video-controls-pnl")) {
      return;
    }
    setVideoControlsVisible(prev => !prev);
  };

  const formatVideoTime = (secs: number) => {
    if (isNaN(secs)) return "0:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // GIF Capture/Freeze engine inside lightbox
  const captureGifFrame = () => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;

    if (img.complete && img.naturalWidth > 0) {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        try {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          setHasCapturedGifFrame(true);
        } catch (e) {
          console.warn("Lightbox failed to draw cross-origin GIF canvas frame:", e);
        }
      }
    }
  };

  const toggleGifPlayPause = () => {
    if (isGifPlaying) {
      captureGifFrame();
      setIsGifPlaying(false);
    } else {
      setIsGifPlaying(true);
    }
  };

  if (!isOpen || !src) return null;

  if (isVideo || isGif) {
    return (
      <div className="fixed inset-0 z-[99999] bg-black flex items-center justify-center select-none animate-fade-in font-sans">
        {/* Click on background to close */}
        <div className="absolute inset-0 bg-black cursor-zoom-out" onClick={onClose} />
        
        {/* Minimal Escape floating trigger */}
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all cursor-pointer border border-white/10 active:scale-95 z-30"
          title="Close Playback"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cinematic Media Layer */}
        <div className="relative max-w-full max-h-screen p-4 flex items-center justify-center z-10 pointer-events-auto">
          {isVideo ? (
            <div 
              id="video-player-root"
              className="w-full max-w-4xl aspect-[16/10] sm:aspect-[16/9] bg-black overflow-hidden rounded-[24px] relative group"
              onClick={toggleVideoControls}
              onMouseMove={handleVideoMouseMove}
            >
              <video 
                ref={videoRef}
                src={src} 
                className="w-full h-full object-contain"
                autoPlay 
                playsInline
                muted={isVideoMuted}
                loop={isVideoLooping}
                onPlay={() => setIsVideoPlaying(true)}
                onPause={() => setIsVideoPlaying(false)}
                onTimeUpdate={() => {
                  if (videoRef.current) {
                    setVideoCurrentTime(videoRef.current.currentTime);
                  }
                }}
                onDurationChange={() => {
                  if (videoRef.current) {
                    setVideoDuration(videoRef.current.duration);
                  }
                }}
              />

              {/* Custom Cinematic Media Controls Overlay */}
              <AnimatePresence>
                {videoControlsVisible && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/40 flex flex-col justify-between p-6 video-controls-pnl z-20 pointer-events-auto"
                  >
                    {/* Top utility row */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-white/50 font-mono tracking-widest uppercase">
                        Cinematic Playback
                      </span>
                      <div className="flex items-center gap-2">
                        {/* Loop Toggle Indicator */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsVideoLooping(!isVideoLooping);
                          }}
                          className={`p-2 rounded-xl transition-all border ${
                            isVideoLooping 
                              ? "bg-moux-cyan/25 text-moux-cyan border-moux-cyan/40" 
                              : "bg-white/5 text-white/60 border-white/10 hover:text-white"
                          }`}
                          title={isVideoLooping ? "Loop Enabled" : "Loop Disabled"}
                        >
                          <Repeat className="w-4 h-4" />
                        </button>

                        {/* Audio Muted Selector */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsVideoMuted(!isVideoMuted);
                          }}
                          className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:text-white transition-all hover:bg-white/10"
                          title={isVideoMuted ? "Unmute Audio" : "Mute Audio"}
                        >
                          {isVideoMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-moux-cyan" />}
                        </button>
                      </div>
                    </div>

                    {/* Highly Animated Play/Pause Center Trigger */}
                    <div className="flex items-center justify-center">
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (videoRef.current) {
                            if (isVideoPlaying) {
                              videoRef.current.pause();
                            } else {
                              videoRef.current.play();
                            }
                          }
                        }}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.85, rotate: 15 }}
                        transition={{ type: "spring", stiffness: 400, damping: 12 }}
                        className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-2xl hover:bg-black/80 transition-colors cursor-pointer"
                      >
                        {isVideoPlaying ? (
                          <Pause className="w-7 h-7 fill-current" />
                        ) : (
                          <Play className="w-7 h-7 fill-current ml-1" />
                        )}
                      </motion.button>
                    </div>

                    {/* Sleek Progress Seekbar & Dynamic Timestamp counter */}
                    <div className="flex items-center gap-3 w-full bg-black/40 backdrop-blur-sm p-3 rounded-2xl border border-white/5">
                      <input
                        type="range"
                        min="0"
                        max={videoDuration || 100}
                        step="0.05"
                        value={videoCurrentTime}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          e.stopPropagation();
                          if (videoRef.current) {
                            videoRef.current.currentTime = parseFloat(e.target.value);
                            setVideoCurrentTime(parseFloat(e.target.value));
                          }
                        }}
                        className="flex-1 accent-moux-cyan h-0.5 bg-white/20 rounded-lg appearance-none cursor-pointer focus:outline-none"
                      />
                      <span className="text-[11px] text-white/90 font-mono font-medium tracking-tighter whitespace-nowrap">
                        {formatVideoTime(videoCurrentTime)} / {formatVideoTime(videoDuration)}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="relative max-w-full max-h-[90vh] flex items-center justify-center">
              <img
                ref={imgRef}
                src={src}
                alt="Interactive GIF Loop"
                onLoad={() => {
                  if (!isGifPlaying && !hasCapturedGifFrame) {
                    captureGifFrame();
                  }
                }}
                className={`max-w-full max-h-[90vh] object-contain rounded-xl select-none ${
                  isGifPlaying || !hasCapturedGifFrame ? "opacity-100 block" : "opacity-0 pointer-events-none absolute"
                }`}
                crossOrigin="anonymous"
              />
              <canvas
                ref={canvasRef}
                className={`max-w-full max-h-[90vh] object-contain rounded-xl select-none ${
                  !isGifPlaying && hasCapturedGifFrame ? "opacity-100 block" : "opacity-0 pointer-events-none absolute"
                }`}
              />

              {/* Pause behavior toggle for GIFs */}
              <div
                onClick={toggleGifPlayPause}
                className="absolute inset-0 flex items-center justify-center cursor-pointer group"
              >
                {!isGifPlaying && (
                  <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/55 shadow-2xl opacity-100">
                    <Pause className="w-6 h-6 fill-current" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Zoom manipulation controllers
  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.5, 4));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.5, 0.5));
  const handleZoomReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Drag listeners
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Pinch-to-zoom simulation using touch actions
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - position.x, y: e.touches[0].clientY - position.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      });
    }
  };

  // Dynamic binary downloader for standard images only
  const handleDownload = async () => {
    if (!isImage) return;
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      const ext = src.toLowerCase().includes(".jpeg") || src.toLowerCase().includes(".jpg") ? "jpg" : "png";
      link.download = `moux_galleria_${Date.now()}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (e) {
      // Fallback redirect download
      const link = document.createElement("a");
      link.href = src;
      link.target = "_blank";
      link.setAttribute("download", "moux_download");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-black/98 sm:bg-black/95 flex flex-col justify-between select-none animate-fade-in font-sans">
      {/* Upper Navigation Header Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0a0a0d]/90 backdrop-blur-md z-20">
        <div className="flex flex-col">
          <span className="text-gray-500 text-[9px] font-mono tracking-widest font-extrabold uppercase">
            {isVideo ? "Cinematic Theater" : isGif ? "Dynamic Stream" : "High-Fidelity Canvas"}
          </span>
          <h1 className="text-white font-black text-sm sm:text-base tracking-tight uppercase">
            Lightbox Viewport
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Action Row for zoom controls on static high res images */}
          {isImage && (
            <div className="hidden sm:flex items-center gap-1.5 p-1 bg-white/5 border border-white/10 rounded-xl">
              <button 
                onClick={handleZoomIn}
                className="p-1 px-2 hover:bg-white/10 text-white rounded-lg text-xs font-mono flex items-center gap-1 cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={handleZoomOut}
                className="p-1 px-2 hover:bg-white/10 text-white rounded-lg text-xs font-mono flex items-center gap-1 cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={handleZoomReset}
                className="p-1 px-2 hover:bg-white/10 text-white rounded-lg text-xs font-mono flex items-center gap-1 cursor-pointer"
                title="Reset Frame"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Close Lightbox Trigger */}
          <button 
            onClick={onClose} 
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all cursor-pointer border border-white/10 active:scale-95"
            title="Return to Feed"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Interactive Viewing Stage Area */}
      <div 
        className="flex-1 flex items-center justify-center p-4 overflow-hidden relative"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
      >
        {isVideo ? (
          <div className="w-full max-w-4xl aspect-[16/10] sm:aspect-[16/9] bg-[#121212] overflow-hidden border border-white/10 rounded-[24px] shadow-2xl relative">
            <video 
              src={src} 
              className="w-full h-full object-contain"
              controls 
              autoPlay 
              playsInline
            />
          </div>
        ) : isGif ? (
          <div className="relative max-w-full max-h-[80vh] flex items-center justify-center">
            {/* Real Looping GIF */}
            <img
              ref={imgRef}
              src={src}
              alt="Interactive GIF Timeline"
              onLoad={() => {
                if (!isGifPlaying && !hasCapturedGifFrame) {
                  captureGifFrame();
                }
              }}
              className={`max-w-full max-h-[80vh] object-contain rounded-xl select-none ${
                isGifPlaying || !hasCapturedGifFrame ? "opacity-100 block" : "opacity-0 pointer-events-none absolute"
              }`}
              crossOrigin="anonymous"
            />
            {/* Frozen captured Frame Canvas */}
            <canvas
              ref={canvasRef}
              className={`max-w-full max-h-[80vh] object-contain rounded-xl select-none ${
                !isGifPlaying && hasCapturedGifFrame ? "opacity-100 block" : "opacity-0 pointer-events-none absolute"
              }`}
            />

            {/* Floating Manual play/pause overlay in centers for instant freeze */}
            <div
              onClick={toggleGifPlayPause}
              className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer group"
            >
              <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/90 shadow-2xl transition-all duration-300 scale-95 group-hover:scale-105 group-hover:text-white">
                {isGifPlaying ? (
                  <Play className="w-6 h-6 fill-current ml-1" />
                ) : (
                  <Pause className="w-6 h-6 fill-current" />
                )}
              </div>
            </div>
            
            {/* Show pause icon constantly if strictly paused and not hovered, to indicate paused state */}
            {!isGifPlaying && (
              <div
                onClick={toggleGifPlayPause}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/90 shadow-2xl opacity-100">
                  <Pause className="w-6 h-6 fill-current" />
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Standard High Res image with full drag/scale parameters */
          <div 
            className={`transition-transform duration-100 ease-out flex items-center justify-center ${
              isDragging ? "cursor-grabbing" : "cursor-grab"
            }`}
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUpOrLeave}
          >
            <img
              src={src}
              alt="Expanded High Resolution Workspace Asset"
              className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-[0_30px_70px_rgba(0,0,0,0.9)] border border-white/5 pointer-events-none"
            />
          </div>
        )}
      </div>

      {/* Footer controls and download triggers */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-white/5 bg-[#060608]/90 backdrop-blur-md z-20">
        <div className="flex flex-col max-w-[70%]">
          <span className="text-gray-500 text-[10px] font-mono uppercase tracking-tight">Active Source Link</span>
          <span className="text-gray-400 text-xs truncate max-w-sm font-mono mt-0.5">{src}</span>
        </div>

        {/* Minimal floating download icon only visible on Images! */}
        {isImage ? (
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 p-2.5 px-4 rounded-xl bg-moux-cyan text-black hover:bg-moux-cyan/90 transition-all active:scale-95 cursor-pointer font-extrabold text-xs uppercase shadow-lg shadow-moux-cyan/15 hover:shadow-moux-cyan/25"
            title="Save raw image to local device gallery"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Save to Gallery</span>
          </button>
        ) : (
          /* Locked indicator badge preventing downloads of loops and clips */
          <div className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-500 text-[10px] uppercase font-mono tracking-wider font-extrabold">
            Download Restricted
          </div>
        )}
      </div>
    </div>
  );
}
