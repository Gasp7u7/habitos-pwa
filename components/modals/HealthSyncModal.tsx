'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Smartphone, Watch, CheckCircle2, AlertCircle, RefreshCw, Heart } from 'lucide-react';
import { HealthService } from '@/lib/services/healthService';
import { cn } from '@/lib/utils';

interface HealthSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HealthSyncModal({ isOpen, onClose }: HealthSyncModalProps) {
  const [status, setStatus] = useState<'idle' | 'checking' | 'syncing' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    setIsNative(HealthService.isNative());
  }, []);

  const handleConnect = async () => {
    setStatus('checking');
    const granted = await HealthService.requestPermissions();
    
    if (granted) {
      handleSync();
    } else {
      setStatus('error');
      setErrorMsg('No se otorgaron permisos de salud. Revisa la configuración de tu teléfono.');
    }
  };

  const handleSync = async () => {
    setStatus('syncing');
    try {
      const data = await HealthService.syncTodayData();
      if (data) {
        setStatus('success');
        // El HealthService ya se encarga de los logs o el store si lo configuramos
      } else {
        setStatus('error');
        setErrorMsg('No se pudieron obtener datos del dispositivo.');
      }
    } catch (e) {
      setStatus('error');
      setErrorMsg('Error inesperado durante la sincronización.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80]"
          />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white rounded-t-[32px] p-8 z-[90] shadow-2xl flex flex-col"
          >
            <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto mb-8" />
            
            <div className="text-center mb-8">
               <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-4 text-blue-500 relative">
                  <Heart size={32} className="fill-blue-500" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center">
                    <Watch size={16} className="text-gray-900" />
                  </div>
               </div>
               <h2 className="text-2xl font-bold text-gray-900">Salud Nativa</h2>
               <p className="text-sm text-gray-400 mt-2 font-medium">Conecta tus pasos y entrenamientos directamente desde tu reloj.</p>
            </div>

            <div className="space-y-4 mb-8">
               {!isNative ? (
                 <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl flex gap-3">
                    <Smartphone size={20} className="text-orange-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-orange-800 leading-relaxed font-medium">
                      Esta función requiere que la app esté instalada como **App Nativa**. Instálala desde el menú "Compartir" de tu navegador.
                    </p>
                 </div>
               ) : (
                 <div className="bg-gray-50 p-5 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                       <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Estado</span>
                       {status === 'success' ? (
                         <div className="flex items-center gap-1.5 text-green-600">
                           <CheckCircle2 size={16} />
                           <span className="text-xs font-bold">Conectado</span>
                         </div>
                       ) : (
                         <span className="text-xs font-bold text-gray-900 uppercase">Desconectado</span>
                       )}
                    </div>
                    
                    {status === 'error' && (
                       <div className="flex items-center gap-2 text-red-500 text-xs font-bold bg-red-50 p-3 rounded-xl">
                          <AlertCircle size={16} />
                          {errorMsg}
                       </div>
                    )}
                 </div>
               )}
            </div>

            <div className="flex flex-col gap-3">
               <button 
                 onClick={handleConnect}
                 disabled={!isNative || status === 'syncing' || status === 'checking'}
                 className="w-full bg-gray-900 text-white rounded-2xl py-4 font-bold flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
               >
                 {(status === 'syncing' || status === 'checking') ? (
                    <RefreshCw size={20} className="animate-spin" />
                 ) : (
                    <Watch size={20} />
                 )}
                 {status === 'success' ? 'Sincronizar ahora' : 'Vincular Apple Health / Google Fit'}
               </button>
               
               <button onClick={onClose} className="w-full text-gray-400 font-bold py-3 text-sm active:scale-95">
                 Cerrar
               </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
