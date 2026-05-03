'use client';
import { useEffect, useRef } from 'react';
// import maplibregl from 'maplibre-gl';
// import 'maplibre-gl/dist/maplibre-gl.css';

interface RouteMapProps {
  geojson: any; // GeoJSON.Feature<GeoJSON.LineString>
  bounds?: [[number, number], [number, number]];
  startPoint?: [number, number];
  endPoint?: [number, number];
}

export default function RouteMap({ geojson, bounds, startPoint, endPoint }: RouteMapProps) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500 text-sm">
      Maplibre temporary disabled
    </div>
  );
}
