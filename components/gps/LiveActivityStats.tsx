'use client';

interface LiveStatsProps {
  elapsedSeconds: number;
  distanceMeters: number;
}

export default function LiveActivityStats({ elapsedSeconds, distanceMeters }: LiveStatsProps) {
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getPaceStr = () => {
    if (distanceMeters === 0 || elapsedSeconds === 0) return "--:--";
    const kms = distanceMeters / 1000;
    const paceSeconds = Math.round(elapsedSeconds / kms);
    if (paceSeconds > 3600) return "--:--";
    
    const m = Math.floor(paceSeconds / 60);
    const s = paceSeconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getSpeedStr = () => {
     if (distanceMeters === 0 || elapsedSeconds === 0) return "0.0";
     const kms = distanceMeters / 1000;
     const hours = elapsedSeconds / 3600;
     return (kms / hours).toFixed(1);
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center">
      <div className="text-[5rem] font-bold leading-none tracking-tighter mb-12 drop-shadow-lg tabular-nums">
        {formatTime(elapsedSeconds)}
      </div>
      
      <div className="bg-black/40 backdrop-blur-md rounded-[32px] p-6 grid grid-cols-2 w-full gap-8 border border-white/10 relative mt-4">
        <div className="text-center">
          <span className="block text-4xl font-bold mb-1">{(distanceMeters / 1000).toFixed(2)}</span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Kilómetros</span>
        </div>
        <div className="text-center">
          <span className="block text-4xl font-bold mb-1">{getPaceStr()}</span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ritmo (/km)</span>
        </div>
        
        <div className="text-center col-span-2 border-t border-white/10 pt-4 mt-2">
            <span className="block text-2xl font-bold mb-1">{getSpeedStr()} <span className="text-sm font-medium text-gray-400">km/h</span></span>
        </div>
      </div>
    </div>
  );
}
