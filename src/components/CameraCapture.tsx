import { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, X } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (base64Image: string) => void;
  onClose: () => void;
  mode: 'selfie_with_dni' | 'dni_front';
}

export default function CameraCapture({ onCapture, onClose, mode }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  const startCamera = async () => {
    setLoading(true);
    setError(null);
    stopCamera();

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setLoading(false);
        };
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setError("No se pudo acceder a la cámara. Por favor asegúrate de otorgar permisos o utiliza la subida de archivos.");
      setLoading(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const handleCapture = () => {
    if (!videoRef.current) return;

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      
      // Keep aspect ratio
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Mirror horizontally if using user-facing camera to match mirrored video element
        if (facingMode === 'user') {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        
        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to base64 jpeg
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        onCapture(dataUrl);
        stopCamera();
      }
    } catch (err) {
      console.error("Failed to capture image:", err);
      setError("Fallo al capturar foto.");
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-4">
          <div className="flex items-center gap-2 text-white">
            <Camera className="h-5 w-5 text-emerald-500 animate-pulse" />
            <h3 className="font-semibold text-sm sm:text-base">
              {mode === 'selfie_with_dni' ? 'Capturar Selfie + DNI' : 'Capturar Frente de DNI'}
            </h3>
          </div>
          <button 
            onClick={() => { stopCamera(); onClose(); }} 
            className="rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Video Area / Guides */}
        <div className="relative aspect-[4/3] bg-black flex items-center justify-center">
          {loading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-slate-950 text-slate-400">
              <RefreshCw className="h-8 w-8 animate-spin text-emerald-500" />
              <p className="text-xs">Iniciando cámara...</p>
            </div>
          )}

          {error ? (
            <div className="absolute inset-x-0 mx-6 p-4 rounded-xl bg-red-950/40 border border-red-900/50 text-red-100 text-center text-xs space-y-2">
              <p>{error}</p>
              <button 
                onClick={startCamera} 
                className="px-3 py-1.5 bg-red-800 rounded-lg hover:bg-red-700 font-medium transition-all"
              >
                Reintentar Cámara
              </button>
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : 'scale-x-1'}`} // mirror view only for user camera
            />
          )}

          {/* Overlays / Guides */}
          {!loading && !error && (
            <div className="absolute inset-0 pointer-events-none select-none">
              {mode === 'selfie_with_dni' ? (
                <>
                  {/* Selfie frame - Oval in the center/left */}
                  <div className="absolute inset-y-[15%] left-[10%] w-[45%] h-[70%] border-4 border-dashed border-emerald-500 rounded-[50%_50%_45%_45%] flex items-center justify-center">
                    <span className="text-[10px] bg-slate-950/80 px-2 py-0.5 rounded-full text-emerald-400 font-medium uppercase font-sans">Ubica tu Rostro</span>
                  </div>
                  
                  {/* DNI on the RIGHT side of the image (viewer's perspective) */}
                  <div className="absolute right-[8%] top-[25%] w-[33%] aspect-[1.58/1] border-4 border-dashed border-sky-400 rounded-xl flex flex-col items-center justify-center p-1 bg-sky-500/10">
                    <span className="text-[9px] bg-slate-950/80 px-1.5 py-0.5 rounded text-sky-300 font-medium font-sans text-center leading-tight uppercase">Sostén tu DNI Aquí</span>
                  </div>
                  
                  {/* Orientation Reminder banner */}
                  <div className="absolute bottom-3 inset-x-0 flex justify-center">
                    <p className="text-[10px] text-center bg-slate-950/95 text-yellow-300 px-3 py-1 rounded-full font-medium border border-yellow-500/30 max-w-[90%]">
                      ⚠️ ¡REGLA CRÍTICA! El DNI debe estar a tu DERECHA en la cámara
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {/* DNI Front Guide - Centered large box */}
                  <div className="absolute inset-[15%] border-4 border-dashed border-emerald-500 rounded-2xl flex flex-col items-center justify-center bg-emerald-500/5">
                    <div className="w-16 h-12 border-2 border-slate-500 opacity-35 rounded mb-2"></div>
                    <span className="text-[10px] bg-slate-950/80 px-2 py-1 rounded-full text-emerald-400 font-semibold uppercase tracking-wider">Alinea el frente del DNI</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex justify-between items-center bg-slate-950 border-t border-slate-800 p-4">
          <button
            onClick={toggleCamera}
            disabled={loading || !!error}
            className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:pointer-events-none transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            Cambiar Cámara
          </button>

          <button
            onClick={handleCapture}
            disabled={loading || !!error}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm disabled:opacity-50 disabled:pointer-events-none shadow-[0_4px_12px_rgba(16,185,129,0.3)] hover:scale-[1.02] transform transition-all"
          >
            <Camera className="h-4 w-4" />
            Tomar Foto
          </button>
        </div>
      </div>
    </div>
  );
}
