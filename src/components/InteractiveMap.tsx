import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Destination, RouteCalculationResult } from '../types/travel';
import { Navigation, Maximize2, Layers } from 'lucide-react';

interface InteractiveMapProps {
  destinations: Destination[];
  selectedDestination?: Destination | null;
  onSelectDestination: (dest: Destination) => void;
  activeRoute?: RouteCalculationResult | null;
  originLocation: { name: string; latitude: number; longitude: number };
  onAddToItinerary?: (dest: Destination) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  destinations,
  selectedDestination,
  onSelectDestination,
  activeRoute,
  originLocation,
  onAddToItinerary,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return; // already initialized

    // Center on Vijayawada by default
    const map = L.map(mapContainerRef.current, {
      center: [originLocation.latitude, originLocation.longitude],
      zoom: 13,
      zoomControl: false,
    });

    // Add standard OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Zoom controls on top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    // Fix possible container rendering bug
    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Markers
  useEffect(() => {
    const map = mapRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    // 1. Add Origin Marker
    const originIcon = L.divIcon({
      className: 'custom-origin-marker',
      html: `
        <div style="background-color: #2563eb; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(37,99,235,0.4); border: 2.5px solid white;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });

    const originMarker = L.marker([originLocation.latitude, originLocation.longitude], {
      icon: originIcon,
      zIndexOffset: 1000,
    }).addTo(markersLayer);

    originMarker.bindPopup(`
      <div style="font-family: inherit; font-size: 13px;">
        <strong style="color: #1e293b; display: block; margin-bottom: 2px;">Starting Point / Origin</strong>
        <span style="color: #64748b; font-size: 12px;">${originLocation.name}</span>
      </div>
    `);

    // 2. Add Destination Markers
    const getCategoryColor = (category: string) => {
      switch (category) {
        case 'Heritage & Temples':
          return '#d97706'; // amber
        case 'Caves & Architecture':
          return '#7c3aed'; // violet
        case 'Nature & Islands':
          return '#059669'; // emerald
        case 'Culture & Museums':
          return '#4f46e5'; // indigo
        case 'Food & Cuisine':
          return '#e11d48'; // rose
        default:
          return '#0284c7'; // sky
      }
    };

    destinations.forEach((dest) => {
      const isSelected = selectedDestination?.id === dest.id;
      const color = getCategoryColor(dest.category);

      const markerHtml = `
        <div style="
          background-color: ${isSelected ? '#0f172a' : color};
          width: ${isSelected ? '38px' : '30px'};
          height: ${isSelected ? '38px' : '30px'};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(0,0,0,0.25);
          border: 2px solid white;
          cursor: pointer;
          transition: transform 0.15s ease;
        ">
          <svg width="${isSelected ? '20' : '16'}" height="${isSelected ? '20' : '16'}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
      `;

      const markerIcon = L.divIcon({
        className: 'custom-destination-marker',
        html: markerHtml,
        iconSize: [isSelected ? 38 : 30, isSelected ? 38 : 30],
        iconAnchor: [isSelected ? 19 : 15, isSelected ? 19 : 15],
      });

      const marker = L.marker([dest.latitude, dest.longitude], {
        icon: markerIcon,
        zIndexOffset: isSelected ? 500 : 100,
      }).addTo(markersLayer);

      marker.on('click', () => {
        onSelectDestination(dest);
      });

      // Construct popup with thumbnail and action button
      const popupContent = `
        <div style="width: 220px; font-family: inherit;">
          ${
            dest.imageUrl
              ? `<img src="${dest.imageUrl}" alt="${dest.name}" style="width: 100%; height: 96px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" />`
              : ''
          }
          <div style="font-size: 11px; color: ${color}; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px;">
            ${dest.category}
          </div>
          <h4 style="font-size: 13px; font-weight: 700; color: #0f172a; margin: 0 0 4px 0; line-height: 1.3;">
            ${dest.name}
          </h4>
          <div style="display: flex; align-items: center; gap: 6px; font-size: 11px; color: #64748b; margin-bottom: 8px;">
            <span>★ ${dest.rating}</span>
            <span>·</span>
            <span>${dest.feeINR === 0 ? 'Free Entry' : `₹${dest.feeINR}`}</span>
            <span>·</span>
            <span>${dest.estimatedDurationMin}m</span>
          </div>
          <p style="font-size: 11px; color: #475569; margin: 0 0 8px 0; line-height: 1.35; max-height: 48px; overflow: hidden;">
            ${dest.shortDescription}
          </p>
          <div style="display: flex; gap: 6px;">
            <button id="btn-popup-select-${dest.id}" style="
              flex: 1;
              background-color: #0f172a;
              color: white;
              border: none;
              border-radius: 6px;
              padding: 5px 8px;
              font-size: 11px;
              font-weight: 600;
              cursor: pointer;
            ">
              View Route
            </button>
            <button id="btn-popup-add-${dest.id}" style="
              background-color: #f1f5f9;
              color: #334155;
              border: 1px solid #cbd5e1;
              border-radius: 6px;
              padding: 5px 8px;
              font-size: 11px;
              font-weight: 600;
              cursor: pointer;
            ">
              + Plan
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('popupopen', () => {
        const btnSelect = document.getElementById(`btn-popup-select-${dest.id}`);
        const btnAdd = document.getElementById(`btn-popup-add-${dest.id}`);
        if (btnSelect) {
          btnSelect.onclick = () => onSelectDestination(dest);
        }
        if (btnAdd && onAddToItinerary) {
          btnAdd.onclick = () => onAddToItinerary(dest);
        }
      });
    });
  }, [destinations, selectedDestination, originLocation]);

  // Update Route Polyline
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }

    if (activeRoute && activeRoute.routeGeometry && activeRoute.routeGeometry.length > 0) {
      // Pick color based on congestion
      let routeColor = '#10b981'; // emerald for low
      if (activeRoute.trafficCongestionLevel === 'Moderate') routeColor = '#f59e0b'; // amber
      if (activeRoute.trafficCongestionLevel === 'Heavy' || activeRoute.trafficCongestionLevel === 'Severe') routeColor = '#ef4444'; // red

      const polyline = L.polyline(activeRoute.routeGeometry, {
        color: routeColor,
        weight: 5,
        opacity: 0.85,
        lineJoin: 'round',
      }).addTo(map);

      polyline.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; line-height: 1.4;">
          <strong style="color: #0f172a; display: block; margin-bottom: 4px;">Active Route</strong>
          <div>Distance: <strong>${activeRoute.distanceKm} km</strong></div>
          <div>Base Duration: <strong>${activeRoute.baseDurationMin} mins</strong></div>
          <div>Traffic-Adjusted: <strong style="color: ${routeColor};">${activeRoute.trafficAdjustedDurationMin} mins</strong></div>
          <div style="color: #64748b; font-size: 11px; margin-top: 4px;">
            ${activeRoute.trafficSource}
          </div>
        </div>
      `);

      routeLayerRef.current = polyline;

      // Fit map bounds to encompass the entire route
      map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
    }
  }, [activeRoute]);

  // Fly to selected destination if changed
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedDestination) return;

    map.flyTo([selectedDestination.latitude, selectedDestination.longitude], 14, {
      duration: 1.2,
    });
  }, [selectedDestination]);

  const handleRecenter = () => {
    if (mapRef.current) {
      mapRef.current.flyTo([originLocation.latitude, originLocation.longitude], 13);
    }
  };

  const handleFitAll = () => {
    if (mapRef.current && destinations.length > 0) {
      const bounds = L.latLngBounds([
        [originLocation.latitude, originLocation.longitude],
        ...destinations.map((d) => [d.latitude, d.longitude] as [number, number]),
      ]);
      mapRef.current.fitBounds(bounds, { padding: [40, 40] });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-xs">
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Floating Map Controls & Category Legend */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
        <div className="bg-white/95 backdrop-blur-xs p-2 rounded-lg border border-slate-200 shadow-xs flex items-center gap-1.5">
          <button
            onClick={handleRecenter}
            className="p-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            title="Center on Starting Origin"
          >
            <Navigation className="w-4 h-4 text-blue-600" />
          </button>
          <button
            onClick={handleFitAll}
            className="p-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            title="Fit All Attractions"
          >
            <Maximize2 className="w-4 h-4 text-slate-700" />
          </button>
        </div>
      </div>

      {/* Category Color Legend (SRS NFR-31 compliant: pairing colors with clean text) */}
      <div className="absolute bottom-3 left-3 z-20 bg-white/95 backdrop-blur-xs px-3 py-2 rounded-lg border border-slate-200 shadow-xs text-xs">
        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
          Map Legend
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-slate-700">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
            <span>Temples & Shrines</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <span>Nature & Islands</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
            <span>Caves & Heritage</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span>Starting Origin</span>
          </div>
        </div>
      </div>

      {/* Route Traffic Legend if Route is Active */}
      {activeRoute && (
        <div className="absolute bottom-3 right-3 z-20 bg-white/95 backdrop-blur-xs px-3 py-2 rounded-lg border border-slate-200 shadow-xs text-xs">
          <div className="font-semibold text-slate-800 flex items-center justify-between gap-4 mb-1">
            <span>Route Traffic Status</span>
            <span
              className={`font-semibold font-mono ${
                activeRoute.trafficCongestionLevel === 'Low'
                  ? 'text-emerald-700'
                  : activeRoute.trafficCongestionLevel === 'Moderate'
                  ? 'text-amber-700'
                  : 'text-red-700'
              }`}
            >
              {activeRoute.trafficCongestionLevel} Congestion
            </span>
          </div>
          <div className="text-slate-600 font-mono text-[11px]">
            {activeRoute.distanceKm} km · {activeRoute.trafficAdjustedDurationMin} mins
            {activeRoute.trafficDelayMin > 0 && ` (+${activeRoute.trafficDelayMin}m delay)`}
          </div>
        </div>
      )}
    </div>
  );
};
