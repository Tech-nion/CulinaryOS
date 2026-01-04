
import React, { useRef, useState, useEffect, memo } from 'react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { identifyItemFromImage } from '../services/geminiService';
import { InventoryItem } from '../types';

interface ScannerProps {
  onAdd: (item: Partial<InventoryItem>) => void;
  onClose: () => void;
}

export const Scanner: React.FC<ScannerProps> = memo(({ onAdd, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Camera Access Error:", err);
        setError("Optical sensor access denied. Please check privacy settings.");
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current || isProcessing) return;

    setIsProcessing(true);
    const context = canvasRef.current.getContext('2d');
    if (!context) return;

    // Drawing the frame
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0);

    // Get base64
    const base64 = canvasRef.current.toDataURL('image/jpeg', 0.8).split(',')[1];
    
    // AI Processing
    const result = await identifyItemFromImage(base64);
    
    if (result) {
      onAdd(result);
      onClose();
    } else {
      setError("Signature unresolved. Ensure item is centered and well-lit.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in fade-in duration-300 overflow-hidden">
      {/* HUD Elements */}
      <div className="absolute top-8 left-8 right-8 flex justify-between items-start z-[110]">
        <div className="space-y-2">
          <h2 className="text-white text-2xl font-black tracking-tight drop-shadow-lg">Neural Scan.</h2>
          <Badge className="bg-emerald-500 text-white border-none px-3 py-1 font-black text-[9px] tracking-widest animate-pulse">
            SENSORS ACTIVE
          </Badge>
        </div>
        <button 
          onClick={onClose}
          aria-label="Exit Scanner"
          className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/10"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>

      {/* Main Camera View */}
      <div className="flex-1 relative bg-slate-900">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover opacity-90"
        />
        
        {/* Scanning Reticle */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-80 h-80 border-2 border-emerald-500/30 rounded-[3rem] relative shadow-[0_0_100px_rgba(16,185,129,0.1)]">
            <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-emerald-500 rounded-tl-[1.5rem]"></div>
            <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-emerald-500 rounded-tr-[1.5rem]"></div>
            <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-emerald-500 rounded-bl-[1.5rem]"></div>
            <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-emerald-500 rounded-br-[1.5rem]"></div>
            
            <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-50 shadow-[0_0_15px_rgba(16,185,129,0.8)] animate-scan"></div>
          </div>
        </div>

        {/* Neural Processing Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-300">
            <div className="relative w-24 h-24 mb-8">
               <div className="absolute inset-0 border-4 border-emerald-500/10 rounded-full scale-125 animate-ping"></div>
               <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <h3 className="text-2xl font-black text-white mb-2">Resolving Signature...</h3>
            <p className="text-emerald-400 font-bold uppercase tracking-[0.2em] text-[10px]">Consulting Culinary Intelligence</p>
          </div>
        )}
      </div>

      {/* Capture Controls */}
      <div className="h-48 bg-slate-950 border-t border-white/5 flex flex-col items-center justify-center px-8 relative">
        {error && (
          <div className="absolute top-[-2rem] bg-rose-600 px-6 py-2 rounded-full text-white text-[10px] font-black uppercase tracking-widest shadow-xl animate-bounce">
            {error}
          </div>
        )}
        
        <div className="flex items-center gap-16">
          <button aria-label="Toggle Flash" className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-colors">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
          </button>
          
          <button 
            disabled={isProcessing}
            onClick={handleCapture}
            aria-label="Capture food item"
            className="w-24 h-24 rounded-full bg-white p-2 shadow-[0_0_50px_rgba(255,255,255,0.2)] hover:scale-110 active:scale-90 transition-all disabled:opacity-50 group"
          >
            <div className="w-full h-full rounded-full border-4 border-slate-900 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-emerald-500 group-hover:scale-150 transition-transform"></div>
            </div>
          </button>

          <button aria-label="Manual Entry" onClick={onClose} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
        </div>
        <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.3em] mt-8">Align item label within reticle for best results</p>
      </div>

      <canvas ref={canvasRef} className="hidden" />
      
      <style>{`
        @keyframes scan {
          0% { top: 10%; opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { top: 90%; opacity: 0; }
        }
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
});
