'use client';
import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface RouteMapProps {
  geojson: any; // GeoJSON.Feature<GeoJSON.LineString>
  bounds?: [[number, number], [number, number]];
  startPoint?: [number, number];
  endPoint?: [number, number];
  isLive?: boolean;
}

export default function RouteMap({ geojson, bounds, startPoint, endPoint, isLive }: RouteMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map only once
    if (!map.current) {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: {
          version: 8,
          sources: {
            'osm': {
              type: 'raster',
              tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
              attribution: '&copy; OpenStreetMap Contributors',
            }
          },
          layers: [{ id: 'osm', type: 'raster', source: 'osm' }]
        },
        center: geojson?.coordinates?.[0] || [0, 0],
        zoom: 15
      });

      map.current.on('load', () => {
        if (!map.current) return;

        map.current.addSource('route', {
          type: 'geojson',
          data: { type: 'Feature', properties: {}, geometry: geojson }
        });

        map.current.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#D4F87A', 'line-width': 6, 'line-opacity': 0.8 }
        });
        
        updateBounds();
      });
      // Update existing source
      const source = map.current.getSource('route') as maplibregl.GeoJSONSource;
      if (source) {
        source.setData({ 
          type: 'Feature', 
          properties: {}, 
          geometry: geojson.coordinates.length >= 2 ? geojson : { type: 'Point', coordinates: [0,0] } 
        });
        updateBounds();
      }
    }

    function updateBounds() {
      if (map.current && geojson?.coordinates?.length > 0) {
        const coords = geojson.coordinates;
        
        if (isLive || coords.length === 1) {
           // Si solo hay un punto o es en vivo, centramos en el último
           map.current.easeTo({
              center: coords[coords.length - 1],
              zoom: 16
           });
           return;
        }

        if (coords.length > 1) {
           const mapBounds = coords.reduce((acc: any, coord: any) => {
             return [
               [Math.min(acc[0][0], coord[0]), Math.min(acc[0][1], coord[1])],
               [Math.max(acc[1][0], coord[0]), Math.max(acc[1][1], coord[1])]
             ];
           }, [[coords[0][0], coords[0][1]], [coords[0][0], coords[0][1]]]);
           
           map.current.fitBounds(mapBounds, { padding: 40, animate: true });
        }
      }
    }

    return () => {
      // Don't remove map on every geojson change, only on unmount
    };
  }, [geojson, isLive]);

  useEffect(() => {
    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  return <div ref={mapContainer} className="w-full h-full" />;
}
