'use client';
import { useState, useEffect } from 'react';


export default function GpsPermissionState({ onReady }: { onReady: () => void }) {
  const [status, setStatus] = useState<'checking' | 'granted' | 'denied' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let mounted = true;
    
    if (!('geolocation' in navigator)) {
      if (mounted) {
        // eslint-disable-next-line
        setStatus('error');
        setErrorMessage('GPS no disponible en este dispositivo');
      }
      return;
    }

    navigator.permissions.query({ name: 'geolocation' }).then((result) => {
      if (!mounted) return;
      if (result.state === 'granted') {
        setStatus('granted');
        onReady();
      } else if (result.state === 'denied') {
        setStatus('denied');
      } else {
        setStatus('granted'); 
        onReady();
      }

      result.onchange = () => {
        if (!mounted) return;
        if (result.state === 'granted') {
          setStatus('granted');
          onReady();
        } else if (result.state === 'denied') {
          setStatus('denied');
        }
      };
    }).catch(() => {
      if (!mounted) return;
      setStatus('granted');
      onReady();
    });
    
    return () => { mounted = false };
  }, [onReady]);

  if (status === 'checking') return null;

  if (status === 'denied') {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-start gap-3 mb-6">
        <i className="f7-icons text-xl shrink-0 mt-0.5">location_slash_fill</i>
        <div>
          <h3 className="font-bold text-sm">Permiso denegado</h3>
          <p className="text-xs">Para registrar tu ruta debes habilitar el GPS en la configuración de tu navegador.</p>
        </div>
      </div>
    );
  }
  
  if (status === 'error') {
     return (
      <div className="bg-orange-50 text-orange-700 p-4 rounded-xl flex items-start gap-3 mb-6">
        <i className="f7-icons text-xl shrink-0 mt-0.5">exclamationmark_triangle_fill</i>
        <div>
          <h3 className="font-bold text-sm">Error GPS</h3>
          <p className="text-xs">{errorMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-3 mb-6">
      <i className="f7-icons text-xl">placemark_fill</i>
      <span className="font-bold text-sm">GPS listo para registrar tu ruta</span>
    </div>
  );
}
