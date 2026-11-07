import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Destination, RouteCalculationResult } from '../types/travel';
import {
  Navigation,
  Maximize2,
  LocateFixed,
  MapPin,
  Route,
  Crosshair,
  Check,
  Compass,
} from 'lucide-react';

interface InteractiveMapProps {
  destinations: Destination[];
  selectedDestination?: Destination | null;
  onSelectDestination: (dest: Destination) => void;
  activeRoute?: RouteCalculationResult | null;
  originLocation: { name: string; latitude: number; longitude: number };
  onAddToItinerary?: (dest: Destination) => void;
  onSetUserLocation?: (loc: { name: string; latitude: number; longitude: number; isCurrentLocation?: boolean }) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  destinations,
  selectedDestination,
  onSelectDestination,
  activeRoute,
  originLocation,
  onAddToItinerary,
  onSetUserLocation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const originMarkerRef = useRef<L.Marker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);

  const [isLocating, setIsLocating] = useState(false);
  const [isClickToSetStartMode, setIsClickToSetStartMode] = useState(false);
  const [mapStatusMessage, setMapStatusMessage] = useState<string | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [originLocation.latitude, originLocation.longitude],
      zoom: 14,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
    }).addTo(map);

    L.control.zoom({ position: 'topright' }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    // Handle map clicks to set starting location when enabled
    map.on('click', async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      // If user enabled click-to-set-start or explicitly clicks
      if (onSetUserLocation) {
        try {
          const resp = await fetch(`/api/geocode/reverse?latitude=${lat}&longitude=${lng}`);
          const data = await resp.json();
          const placeName = data.name || `Custom Starting Point (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
          onSetUserLocation({
            name: placeName,
            latitude: lat,
            longitude: lng,
            isCurrentLocation: false,
          });
          setMapStatusMessage(`📍 Starting point set to: ${placeName.split(',')[0]}`);
          setTimeout(() => setMapStatusMessage(null), 4000);
        } catch {
          onSetUserLocation({
            name: `Starting Point (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
            latitude: lat,
            longitude: lng,
            isCurrentLocation: false,
          });
        }
      }
    });

    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update cursor style when click-to-set mode changes
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;
    if (isClickToSetStartMode) {
      container.style.cursor = 'crosshair';
      setMapStatusMessage('👉 Tap anywhere on the map to set your Starting Position');
    } else {
      container.style.cursor = '';
    }
  }, [isClickToSetStartMode]);

  // Smoothly focus on Starting Position whenever origin coordinates change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.flyTo([originLocation.latitude, originLocation.longitude], 15, {
      duration: 1.2,
    });

    // Pulse accuracy circle
    if (accuracyCircleRef.current) {
      map.removeLayer(accuracyCircleRef.current);
    }

    const circle = L.circle([originLocation.latitude, originLocation.longitude], {
      radius: 120,
      color: '#10b981',
      fillColor: '#10b981',
      fillOpacity: 0.15,
      weight: 1.5,
      dashArray: '4, 4',
    }).addTo(map);

    accuracyCircleRef.current = circle;
  }, [originLocation.latitude, originLocation.longitude]);

  // Render Markers (Starting Point with Glowing Halo & Draggability + Destinations)
  useEffect(() => {
    const map = mapRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    // 1. High-Precision Starting Position Marker
    const isGPS =
      originLocation.name.toLowerCase().includes('location') ||
      originLocation.name.toLowerCase().includes('gps') ||
      originLocation.name.toLowerCase().includes('current');

    const primaryColor = isGPS ? '#059669' : '#4f46e5';

    const originIcon = L.divIcon({
      className: 'custom-starting-marker',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px;">
          <!-- Sonar radar wave -->
          <div style="
            position: absolute;
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background: ${primaryColor};
            opacity: 0.35;
            animation: radar-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
          "></div>
          
          <!-- Core marker disc -->
          <div style="
            background: ${primaryColor};
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 14px rgba(0,0,0,0.35);
            border: 3px solid white;
            position: relative;
            z-index: 10;
            cursor: grab;
          ">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="3 11 22 2 13 21 11 13 3 11"/>
            </svg>
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    const originMarker = L.marker([originLocation.latitude, originLocation.longitude], {
      icon: originIcon,
      zIndexOffset: 2000,
      draggable: true,
      title: 'Starting Position (Drag to move or adjust)',
    }).addTo(markersLayer);

    originMarkerRef.current = originMarker;

    // Permanent, unmistakable Floating Label Tooltip
    originMarker.bindTooltip(
      `<div style="font-family: system-ui, sans-serif; font-size: 11px; font-weight: 700; color: #0f172a; white-space: nowrap; display: flex; align-items: center; gap: 4px;">
        <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: ${primaryColor};"></span>
        <span>STARTING POSITION</span>
      </div>`,
      {
        permanent: true,
        direction: 'top',
        offset: [0, -18],
        className: 'starting-point-permanent-tooltip',
      }
    );

    // Rich Interactive Popup
    const popupHtml = `
      <div style="font-family: system-ui, sans-serif; font-size: 12px; line-height: 1.4; min-width: 200px;">
        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
          <span style="background: ${primaryColor}; color: white; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">
            ${isGPS ? '📍 DEVICE GPS' : '🚩 TRIP ORIGIN'}
          </span>
          <span style="color: #10b981; font-size: 11px; font-weight: 600;">Active Starting Point</span>
        </div>
        <div style="font-weight: 700; font-size: 13px; color: #0f172a; margin-bottom: 2px;">
          ${originLocation.name}
        </div>
        <div style="color: #64748b; font-size: 11px; font-family: monospace; margin-bottom: 6px;">
          ${originLocation.latitude.toFixed(5)}°, ${originLocation.longitude.toFixed(5)}°
        </div>
        <div style="font-size: 11px; color: #475569; background: #f8fafc; padding: 6px; border-radius: 6px; border: 1px solid #e2e8f0;">
          💡 <em>Tip: You can drag this pin or tap anywhere on the map to change your exact start point.</em>
        </div>
      </div>
    `;

    originMarker.bindPopup(popupHtml);

    // Handle marker drag-and-drop to reposition start point
    originMarker.on('dragend', async (e: any) => {
      const marker = e.target;
      const position = marker.getLatLng();
      const lat = position.lat;
      const lon = position.lng;

      if (accuracyCircleRef.current) {
        accuracyCircleRef.current.setLatLng([lat, lon]);
      }

      if (onSetUserLocation) {
        try {
          const resp = await fetch(`/api/geocode/reverse?latitude=${lat}&longitude=${lon}`);
          const data = await resp.json();
          const placeName = data.name || `Selected Pin (${lat.toFixed(4)}, ${lon.toFixed(4)})`;
          onSetUserLocation({
            name: placeName,
            latitude: lat,
            longitude: lon,
            isCurrentLocation: false,
          });
          setMapStatusMessage(`📍 Starting point repositioned to: ${placeName.split(',')[0]}`);
          setTimeout(() => setMapStatusMessage(null), 3500);
        } catch {
          onSetUserLocation({
            name: `Starting Point (${lat.toFixed(4)}, ${lon.toFixed(4)})`,
            latitude: lat,
            longitude: lon,
            isCurrentLocation: false,
          });
        }
      }
    });

    // 2. Add Destination Markers
    const getCategoryColor = (category: string) => {
      switch (category) {
        case 'Heritage & Temples':
          return '#b45309';
        case 'Caves & Architecture':
          return '#7e22ce';
        case 'Nature & Islands':
          return '#059669';
        case 'Culture & Museums':
          return '#2563eb';
        case 'Food & Cuisine':
          return '#e11d48';
        default:
          return '#0f172a';
      }
    };

    destinations.forEach((dest) => {
      const isSelected = selectedDestination?.id === dest.id;
      const color = getCategoryColor(dest.category);

      const destIcon = L.divIcon({
        className: 'custom-destination-marker',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center;">
            ${
              isSelected
                ? '<div style="position: absolute; width: 38px; height: 38px; border-radius: 50%; background: #4f46e5; opacity: 0.3; animation: pulse 2s infinite;"></div>'
                : ''
            }
            <div style="
              background-color: ${isSelected ? '#4f46e5' : color};
              width: ${isSelected ? '30px' : '24px'};
              height: ${isSelected ? '30px' : '24px'};
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 2px 8px rgba(0,0,0,0.25);
              border: 2px solid white;
              transition: all 0.2s ease;
            ">
              <span style="color: white; font-size: ${isSelected ? '12px' : '10px'}; font-weight: bold;">
                ★
              </span>
            </div>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      const marker = L.marker([dest.latitude, dest.longitude], {
        icon: destIcon,
        zIndexOffset: isSelected ? 1500 : 500,
      }).addTo(markersLayer);

      const popupContent = `
        <div style="font-family: system-ui, sans-serif; font-size: 12px; line-height: 1.4; min-width: 210px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2px;">
            <span style="font-size: 10px; font-weight: 700; color: ${color}; text-transform: uppercase;">
              ${dest.category}
            </span>
            <span style="font-weight: 700; color: #4f46e5;">★ ${dest.rating}</span>
          </div>
          <h4 style="margin: 0 0 4px 0; font-size: 13px; font-weight: 700; color: #0f172a;">
            ${dest.name}
          </h4>
          <p style="margin: 0 0 6px 0; font-size: 11px; color: #64748b; line-height: 1.3;">
            ${dest.shortDescription}
          </p>
          <div style="margin-bottom: 8px; font-size: 11px; color: #334155; font-weight: 600;">
            Entry Fee: ${dest.feeINR === 0 ? 'Free' : `₹${dest.feeINR}`} · Duration: ${dest.estimatedDurationMin}m
          </div>
          <div style="display: flex; gap: 6px;">
            <button id="btn-popup-select-${dest.id}" style="
              flex: 1;
              background-color: #0f172a;
              color: white;
              border: none;
              border-radius: 6px;
              padding: 6px 8px;
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
              padding: 6px 8px;
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
      let routeColor = '#10b981';
      if (activeRoute.trafficCongestionLevel === 'Moderate') routeColor = '#f59e0b';
      if (activeRoute.trafficCongestionLevel === 'Heavy' || activeRoute.trafficCongestionLevel === 'Severe') {
        routeColor = '#ef4444';
      }

      const polyline = L.polyline(activeRoute.routeGeometry, {
        color: routeColor,
        weight: 5,
        opacity: 0.85,
        lineJoin: 'round',
      }).addTo(map);

      polyline.bindPopup(`
        <div style="font-family: system-ui, sans-serif; font-size: 12px; line-height: 1.4;">
          <strong style="color: #0f172a; display: block; margin-bottom: 4px;">Active Journey Route</strong>
          <div>Distance: <strong>${activeRoute.distanceKm} km</strong></div>
          <div>Traffic-Adjusted Time: <strong style="color: ${routeColor};">${activeRoute.trafficAdjustedDurationMin} mins</strong></div>
          <div style="color: #64748b; font-size: 11px; margin-top: 4px;">
            ${activeRoute.trafficSource}
          </div>
        </div>
      `);

      routeLayerRef.current = polyline;
    }
  }, [activeRoute]);

  // Quick Action: Center on Starting Position at High Precision
  const handleCenterOnOrigin = () => {
    if (mapRef.current) {
      mapRef.current.flyTo([originLocation.latitude, originLocation.longitude], 16, {
        duration: 1.2,
      });
      if (originMarkerRef.current) {
        originMarkerRef.current.openPopup();
      }
    }
  };

  // Quick Action: Fit Entire Route (Origin + Destination)
  const handleFitRouteOrAll = () => {
    const map = mapRef.current;
    if (!map) return;

    if (routeLayerRef.current) {
      map.fitBounds(routeLayerRef.current.getBounds(), { padding: [50, 50] });
    } else if (destinations.length > 0) {
      const bounds = L.latLngBounds([
        [originLocation.latitude, originLocation.longitude],
        ...destinations.map((d) => [d.latitude, d.longitude] as [number, number]),
      ]);
      map.fitBounds(bounds, { padding: [45, 45] });
    }
  };

  // Device GPS Locate Me
  const handleMapLocateMe = () => {
    if (!navigator.geolocation) {
      setMapStatusMessage('Geolocation is not supported by your browser.');
      setTimeout(() => setMapStatusMessage(null), 4000);
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        if (mapRef.current) {
          mapRef.current.flyTo([latitude, longitude], 16, { duration: 1.2 });
        }

        if (onSetUserLocation) {
          try {
            const resp = await fetch(`/api/geocode/reverse?latitude=${latitude}&longitude=${longitude}`);
            const data = await resp.json();
            const placeName = data.name || `My Current GPS (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
            onSetUserLocation({
              name: placeName,
              latitude,
              longitude,
              isCurrentLocation: true,
            });
            setMapStatusMessage(`📍 Located: ${placeName.split(',')[0]}`);
            setTimeout(() => setMapStatusMessage(null), 4000);
          } catch {
            onSetUserLocation({
              name: `My GPS Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
              latitude,
              longitude,
              isCurrentLocation: true,
            });
          }
        }
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  return (
    <div className="relative w-full h-full min-h-[480px] rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-100 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.06)]">
      {/* Map DOM Container */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Embedded CSS for animations and permanent tooltips */}
      <style>{`
        @keyframes radar-ping {
          0% { transform: scale(0.6); opacity: 0.8; }
          75%, 100% { transform: scale(2.2); opacity: 0; }
        }
        .starting-point-permanent-tooltip {
          background-color: white !important;
          border: 1.5px solid #4f46e5 !important;
          border-radius: 6px !important;
          padding: 2px 7px !important;
          box-shadow: 0 4px 10px rgba(0,0,0,0.18) !important;
        }
        .starting-point-permanent-tooltip:before {
          border-top-color: #4f46e5 !important;
        }
      `}</style>

      {/* Top Left Floating Bar: Instant Location Controls */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-2 max-w-[280px]">
        <div className="bg-white/95 backdrop-blur-md p-1.5 rounded-xl border border-slate-200 shadow-md flex items-center gap-1">
          {/* 1. Center on Starting Point Button */}
          <button
            onClick={handleCenterOnOrigin}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-800 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
            title="Focus and zoom right into your exact Starting Position"
          >
            <Navigation className="w-3.5 h-3.5 text-indigo-600 fill-indigo-600" />
            <span>Find Start Pin</span>
          </button>

          <span className="w-px h-4 bg-slate-200" />

          {/* 2. Locate Device GPS */}
          <button
            onClick={handleMapLocateMe}
            disabled={isLocating}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              isLocating
                ? 'text-emerald-700 bg-emerald-50'
                : 'text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50'
            }`}
            title="Locate my physical device via GPS"
          >
            <LocateFixed className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Locating...' : 'GPS Me'}</span>
          </button>

          <span className="w-px h-4 bg-slate-200" />

          {/* 3. Fit Route / Entire Circuit */}
          <button
            onClick={handleFitRouteOrAll}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Fit Entire Journey Route"
          >
            <Maximize2 className="w-3.5 h-3.5 text-slate-700" />
          </button>
        </div>

        {/* Click-to-set starting point toggle badge */}
        <button
          onClick={() => setIsClickToSetStartMode(!isClickToSetStartMode)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border shadow-xs transition-all flex items-center gap-1.5 cursor-pointer text-left ${
            isClickToSetStartMode
              ? 'bg-amber-500 text-slate-950 border-amber-600 font-bold'
              : 'bg-white/95 backdrop-blur-md text-slate-700 hover:text-indigo-600 border-slate-200'
          }`}
        >
          <Crosshair className="w-3.5 h-3.5 shrink-0" />
          <span>{isClickToSetStartMode ? 'Tap map to place Start Pin' : 'Tap Map to Set Start'}</span>
        </button>

        {/* Temporary Status Toast Notification on Map */}
        {mapStatusMessage && (
          <div className="bg-slate-900 text-white text-[11px] font-medium px-3 py-1.5 rounded-lg shadow-md animate-in fade-in duration-200">
            {mapStatusMessage}
          </div>
        )}
      </div>

      {/* Starting Position Status Chip at Top Right (below zoom controls) */}
      <div className="absolute top-14 right-3 z-20 hidden sm:block">
        <button
          onClick={handleCenterOnOrigin}
          className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs text-xs flex items-center gap-2 hover:border-indigo-400 transition-colors cursor-pointer text-left max-w-xs"
          title="Click to jump to your Starting Position on map"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
          <div className="truncate">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Start Position</span>
            <span className="font-semibold text-slate-800 text-[11px] truncate block">
              {originLocation.name}
            </span>
          </div>
        </button>
      </div>

      {/* Category Legend & Drag Tip at Bottom Left */}
      <div className="absolute bottom-3 left-3 z-20 bg-white/95 backdrop-blur-xs px-3 py-2 rounded-lg border border-slate-200 shadow-xs text-xs max-w-xs">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          <span>Map Highlights</span>
          <span className="text-[10px] text-indigo-600 font-normal">Drag pin to reposition</span>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-slate-600 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <span className="font-medium text-slate-800">Start (You Are Here)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
            <span>Temples & Shrines</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
            <span>Caves & Monoliths</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span>Culture & Islands</span>
          </div>
        </div>
      </div>

      {/* Route Traffic Status Box at Bottom Right */}
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
          <div className="mt-1.5 pt-1.5 border-t border-slate-200/80 flex items-center justify-between gap-3 text-[11px] font-mono">
            <span className="text-slate-800">
              <span className="text-[10px] bg-slate-900 text-white px-1 py-0.2 rounded font-bold mr-1">UBER</span>
              ~₹{Math.max(75, Math.round(45 + activeRoute.distanceKm * 14.5 + activeRoute.trafficAdjustedDurationMin * 1.5 + 18))}
            </span>
            <span className="text-amber-900">
              <span className="text-[10px] bg-amber-400 text-slate-950 px-1 py-0.2 rounded font-bold mr-1">RAPIDO</span>
              ~₹{Math.max(25, Math.round(20 + Math.max(0, activeRoute.distanceKm - 1.5) * 9 + 4))}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
