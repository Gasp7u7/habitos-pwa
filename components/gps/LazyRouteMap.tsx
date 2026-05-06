'use client';
import { useState, useEffect, useRef, ReactNode } from 'react';

interface LazyRouteMapProps {
  children: ReactNode;
  height?: string;
}

export default function LazyRouteMap({ children, height = "h-48" }: LazyRouteMapProps) {
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect(); // Una vez cargado, se queda
        }
      },
      { threshold: 0.1, rootMargin: '100px' } // Cargar un poco antes de que entre
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={`w-full ${height} bg-gray-100 relative overflow-hidden`}>
      {isInView ? children : (
        <div className="absolute inset-0 flex items-center justify-center">
           <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
