'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Share2, Sparkles, Map as MapIcon, Type } from 'lucide-react';
import { ActivityEntry } from '@/lib/types';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { cn } from '@/lib/utils';

interface PosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: ActivityEntry | null;
}

type Theme = 'dark-neon' | 'minimal-light' | 'topo-blue';

export default function PosterModal({ isOpen, onClose, activity }: PosterModalProps) {
  const [theme, setTheme] = useState<Theme>('dark-neon');
  const [isGenerating, setIsGenerating] = useState(false);
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isOpen || !activity || !mapContainer.current) return;

    const geojson = {
      type: 'LineString',
      coordinates: activity.route.map(p => [p.longitude, p.latitude])
    };

    if (geojson.coordinates.length < 2) return;

    // Map themes styles
    const styles: Record<Theme, any> = {
      'dark-neon': {
        version: 8,
        sources: { 'osm': { type: 'raster', tiles: ['https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png'], tileSize: 256 } },
        layers: [{ id: 'osm', type: 'raster', source: 'osm' }]
      },
      'minimal-light': {
        version: 8,
        sources: { 'osm': { type: 'raster', tiles: ['https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png'], tileSize: 256 } },
        layers: [{ id: 'osm', type: 'raster', source: 'osm' }]
      },
      'topo-blue': {
        version: 8,
        sources: { 'osm': { type: 'raster', tiles: ['https://tile.thunderforest.com/outdoors/{z}/{x}/{y}.png'], tileSize: 256 } },
        layers: [{ id: 'osm', type: 'raster', source: 'osm' }]
      }
    };

    mapRef.current = new maplibregl.Map({
      container: mapContainer.current,
      style: styles[theme],
      center: geojson.coordinates[0] as [number, number],
      zoom: 14,
      preserveDrawingBuffer: true, // Critical for canvas export
      interactive: false,
      attributionControl: false
    } as any);

    mapRef.current.on('load', () => {
      if (!mapRef.current) return;

      mapRef.current.addSource('route', {
        type: 'geojson',
        data: { type: 'Feature', properties: {}, geometry: geojson as any }
      });

      const routeColor = theme === 'dark-neon' ? '#D4F87A' : '#1a2e00';

      mapRef.current.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': routeColor,
          'line-width': 8,
          'line-opacity': 1
        }
      });

      const coords = geojson.coordinates;
      const bounds = coords.reduce((acc: any, coord: any) => [
        [Math.min(acc[0][0], coord[0]), Math.min(acc[0][1], coord[1])],
        [Math.max(acc[1][0], coord[0]), Math.max(acc[1][1], coord[1])]
      ], [[coords[0][0], coords[0][1]], [coords[0][0], coords[0][1]]]);

      mapRef.current.fitBounds(bounds as any, { padding: 80, animate: false });
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [isOpen, activity, theme]);

  const handleDownload = async () => {
    if (!mapRef.current || !activity || !canvasRef.current) return;
    setIsGenerating(true);

    const mapCanvas = mapRef.current.getCanvas();
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Set high resolution for the output
    const width = 1080;
    const height = 1350; // 4:5 aspect ratio (Instagram style)
    canvasRef.current.width = width;
    canvasRef.current.height = height;

    // 1. Draw Background
    ctx.fillStyle = theme === 'dark-neon' ? '#111' : '#fff';
    ctx.fillRect(0, 0, width, height);

    // 2. Draw Map Image
    ctx.drawImage(mapCanvas, 0, 0, width, height * 0.7);

    // 3. Draw Overlay / Stats
    const textColor = theme === 'dark-neon' ? '#fff' : '#111';
    const accentColor = theme === 'dark-neon' ? '#D4F87A' : '#1a2e00';

    ctx.fillStyle = textColor;
    ctx.font = 'bold 80px sans-serif';
    ctx.fillText(activity.type.toUpperCase(), 80, height * 0.78);

    ctx.font = '500 40px sans-serif';
    ctx.fillStyle = theme === 'dark-neon' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)';
    ctx.fillText(new Date(activity.startedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }), 80, height * 0.82);

    // Grid Stats
    ctx.fillStyle = accentColor;
    ctx.font = 'bold 100px tabular-nums';
    const dist = (activity.distanceMeters / 1000).toFixed(2);
    ctx.fillText(dist, 80, height * 0.92);
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText('KM', 80 + ctx.measureText(dist).width + 10, height * 0.92);

    ctx.fillStyle = textColor;
    ctx.font = 'bold 60px tabular-nums';
    const duration = Math.floor(activity.durationSeconds / 60) + 'm';
    ctx.fillText(duration, 500, height * 0.92);

    // Branding
    ctx.font = 'bold 40px sans-serif';
    ctx.fillStyle = accentColor;
    ctx.fillText('HÁBITOS APP', width - 350, height - 80);

    // Export
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `poster-${activity.id}.png`;
    link.href = dataUrl;
    link.click();

    setIsGenerating(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[80]"
          />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white rounded-t-[40px] z-[90] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden"
          >
            <div className="p-6 flex items-center justify-between border-b border-gray-50 flex-shrink-0">
               <div className="flex items-center gap-2">
                 <Sparkles className="text-orange-500" size={20} />
                 <h2 className="text-xl font-bold text-gray-900">Generador de Poster</h2>
               </div>
               <button onClick={onClose} className="!w-8 !h-8 !min-w-0 !p-0 !rounded-full !bg-gray-100 !flex !items-center !justify-center !text-gray-500">
                 <X size={18} />
               </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Preview Area */}
              <div className="relative aspect-[4/5] w-full max-w-[320px] mx-auto bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                 <div ref={mapContainer} className="w-full h-full" />
                 {/* CSS Overlay for preview */}
                 <div className={cn(
                   "absolute bottom-0 left-0 right-0 p-6 pt-10 bg-gradient-to-t",
                   theme === 'dark-neon' ? "from-[#111] via-[#111]/80 to-transparent text-white" : "from-white via-white/80 to-transparent text-gray-900"
                 )}>
                    <div className="text-[10px] font-bold tracking-widest uppercase opacity-60 mb-1">{activity?.type}</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black tabular-nums">{(activity!.distanceMeters / 1000).toFixed(2)}</span>
                      <span className="text-xs font-bold opacity-60">KM</span>
                    </div>
                    <div className="text-[9px] font-bold mt-4 tracking-wider opacity-40">HÁBITOS APP • {new Date().getFullYear()}</div>
                 </div>
              </div>

              {/* Theme Selector */}
              <div>
                 <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-4">Elegir Estilo</label>
                 <div className="grid grid-cols-3 gap-3">
                   {(['dark-neon', 'minimal-light', 'topo-blue'] as const).map(t => (
                     <button 
                       key={t}
                       onClick={() => setTheme(t)}
                       className={cn(
                         "p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                         theme === t ? "border-gray-900 bg-gray-50" : "border-gray-100 bg-white"
                       )}
                     >
                        <div className={cn("w-8 h-8 rounded-full", 
                          t === 'dark-neon' ? "bg-gray-900" : 
                          t === 'minimal-light' ? "bg-gray-100" : "bg-blue-100"
                        )} />
                        <span className="text-[10px] font-bold capitalize">{t.replace('-', ' ')}</span>
                     </button>
                   ))}
                 </div>
              </div>

              <div className="bg-blue-50 rounded-2xl p-4 flex gap-3 items-start">
                <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800 leading-relaxed">
                  Generaremos una imagen de 1080x1350px ideal para compartir en Instagram Stories o WhatsApp.
                </p>
              </div>

              {/* Hidden Canvas for High Res Export */}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            <div className="p-6 border-t border-gray-50 flex gap-3 flex-shrink-0">
               <button 
                 onClick={handleDownload}
                 disabled={isGenerating}
                 className="flex-1 bg-gray-900 text-white rounded-2xl py-4 font-bold flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
               >
                 {isGenerating ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Download size={20} />}
                 {isGenerating ? 'Generando...' : 'Descargar Imagen'}
               </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Info({ size, className }: { size: number, className: string }) {
  return (
    <div className={className}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
      </svg>
    </div>
  );
}
