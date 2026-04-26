import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Itinerary } from '../lib/gemini';
import { MapPin } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';

interface MapViewProps {
  itinerary: Itinerary;
  isRtl?: boolean;
}

// Custom Premium Marker
const createCustomIcon = () => {
  const iconHtml = renderToStaticMarkup(
    <div className="relative flex items-center justify-center">
      <div className="absolute w-8 h-8 bg-accent/20 rounded-full animate-ping" />
      <div className="relative bg-accent text-bg p-1.5 rounded-full border-2 border-bg shadow-xl scale-110">
        <MapPin size={14} strokeWidth={3} />
      </div>
    </div>
  );

  return L.divIcon({
    html: iconHtml,
    className: 'custom-map-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

const RecenterMap = ({ points }: { points: [number, number][] }) => {
  const map = useMap();
  useEffect(() => {
    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [points, map]);
  return null;
};

const MapView: React.FC<MapViewProps> = ({ itinerary, isRtl }) => {
  const allItems = itinerary.days.flatMap(day => day.items);
  const points = allItems
    .filter(item => item.lat && item.lng)
    .map(item => [item.lat, item.lng] as [number, number]);

  if (points.length === 0) return null;

  const customIcon = createCustomIcon();

  return (
    <div className="w-full h-[600px] rounded-3xl overflow-hidden border border-border bg-card/30 relative shadow-2xl group">
      <MapContainer
        center={points[0]}
        zoom={13}
        scrollWheelZoom={false}
        className="w-full h-full grayscale-[0.8] invert-[0.9] hue-rotate-[180deg] brightness-[0.8]"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {allItems.map((item, idx) => (
          item.lat && item.lng && (
            <Marker 
              key={`${idx}-${item.lat}`} 
              position={[item.lat, item.lng]} 
              icon={customIcon}
            >
              <Popup className="premium-popup">
                <div className={`p-2 text-bg ${isRtl ? 'text-right' : 'text-left'}`}>
                  <h4 className="font-serif font-bold text-lg mb-1">{item.activity}</h4>
                  <p className="text-xs font-sans text-stone-600">{item.location}</p>
                </div>
              </Popup>
            </Marker>
          )
        ))}
        <RecenterMap points={points} />
      </MapContainer>
      
      {/* Overlay to indicate it's an interactive map */}
      <div className="absolute top-6 left-6 z-[1000] bg-bg/80 backdrop-blur-md px-4 py-2 rounded-full border border-border text-[10px] uppercase tracking-[2px] text-accent font-bold shadow-xl">
        {itinerary.destination} • Journey Map
      </div>
    </div>
  );
};

export default MapView;
