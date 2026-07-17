import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, Check } from 'lucide-react';
import { getCroppedImg } from '../lib/imageUtils';

export interface ImageCropperModalProps {
  imageSrc: string;
  onCropComplete: (croppedBase64: string) => void;
  onClose: () => void;
  aspectRatio?: number;
  circularCrop?: boolean;
}

export function ImageCropperModal({
  imageSrc,
  onCropComplete,
  onClose,
  aspectRatio,
  circularCrop = false,
}: ImageCropperModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropCompleteCallback = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    setIsProcessing(true);
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(croppedImage);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#111111] border border-white/10 p-6 rounded-2xl w-full max-w-lg shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-white uppercase tracking-widest">Crop Image</h2>
          <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="relative w-full h-64 bg-black rounded-lg overflow-hidden mb-6">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            cropShape={circularCrop ? 'round' : 'rect'}
            onCropChange={setCrop}
            onCropComplete={onCropCompleteCallback}
            onZoomChange={setZoom}
          />
        </div>

        <div className="mb-6">
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="Zoom"
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg font-black uppercase text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isProcessing}
            className="flex items-center gap-2 px-6 py-2.5 bg-moux-cyan text-black rounded-lg font-black uppercase tracking-widest text-sm hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-moux-cyan/30 transition-all disabled:opacity-50"
          >
            {isProcessing ? 'Processing...' : (
              <>
                <Check className="w-4 h-4" /> Apply
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
