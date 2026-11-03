import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ALL_REGIONS, WorldRegion } from '../data/destinations';
import {
  MapPin,
  Navigation,
  Search,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Crosshair,
  LocateFixed,
  Eye,
  Building,
  Plane,
  Train,
  X,
  Calendar,
  Wallet,
  Plus,
  Minus,
} from 'lucide-react';

interface TripWorkflowHeaderProps {
  startingLocation: { name: string; latitude: number; longitude: number };
  onSelectStartingLocation: (loc: { name: string; latitude: number; longitude: number }) => void;
  selectedRegion: WorldRegion;
  onSelectRegion: (region: WorldRegion) => void;
  itemsInPlanCount: number;
  totalEstimatedCost: number;
  onOpenItinerary: () => void;
  onFocusStartingPointOnMap?: () => void;
  tripDurationDays?: number;
  onUpdateDurationDays?: (days: number) => void;
  customBudgetAmount?: number;
  onUpdateBudgetAmount?: (amt: number | undefined) => void;
}

// Popular starting points across pilot and international hubs for 1-click selection
const QUICK_STARTING_HUBS = [
  { name: 'Vijayawada Central Junction', lat: 16.5179, lon: 80.6196, type: 'train' },
  { name: 'Vijayawada Gannavaram Airport (VGA)', lat: 16.5304, lon: 80.7968, type: 'plane' },
  { name: 'Besant Road Commercial Center', lat: 16.5161, lon: 80.6200, type: 'city' },
  { name: 'Indrakeeladri Footprint (Ghat)', lat: 16.5140, lon: 80.6090, type: 'landmark' },
  { name: 'Hyderabad Secunderabad Junction', lat: 17.4339, lon: 78.5042, type: 'train' },
  { name: 'Visakhapatnam Railway Junction', lat: 17.7214, lon: 83.2926, type: 'train' },
  { name: 'Bengaluru Majestic Bus/Train Hub', lat: 12.9778, lon: 77.5714, type: 'train' },
  { name: 'New Delhi Connaught Place', lat: 28.6315, lon: 77.2167, type: 'city' },
];

export const TripWorkflowHeader: React.FC<TripWorkflowHeaderProps> = ({
  startingLocation,
  onSelectStartingLocation,
  selectedRegion,
  onSelectRegion,
  itemsInPlanCount,
  totalEstimatedCost,
  onOpenItinerary,
  onFocusStartingPointOnMap,
  tripDurationDays = 1,
  onUpdateDurationDays,
  customBudgetAmount,
  onUpdateBudgetAmount,
}) => {
  const { t, currencySymbol } = useLanguage();

  // Search states for Origin
  const [isEditingOrigin, setIsEditingOrigin] = useState(false);
  const [originSearchQuery, setOriginSearchQuery] = useState('');
  const [originSuggestions, setOriginSuggestions] = useState<any[]>([]);
  const [isOriginSearching, setIsOriginSearching] = useState(false);
  const [isLocatingGps, setIsLocatingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Search states for Destination
  const [isSelectingDestination, setIsSelectingDestination] = useState(false);
  const [destSearchQuery, setDestSearchQuery] = useState('');
  const [isSearchingCustomCity, setIsSearchingCustomCity] = useState(false);

  const originInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingOrigin && originInputRef.current) {
      originInputRef.current.focus();
    }
  }, [isEditingOrigin]);

  // Debounced geocoding search for starting location with importance ranking
  useEffect(() => {
    if (!originSearchQuery.trim() || originSearchQuery.length < 2) {
      setOriginSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsOriginSearching(true);
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(originSearchQuery)}`);
        const data = await res.json();
        if (data.success && data.locations) {
          setOriginSuggestions(data.locations);
        }
      } catch (err) {
        console.error('Origin geocoding error:', err);
      } finally {
        setIsOriginSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [originSearchQuery]);

  // High-precision GPS Device Current Location handler
  const handleUseCurrentGps = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocatingGps(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const res = await fetch(`/api/geocode/reverse?latitude=${lat}&longitude=${lon}`);
          const data = await res.json();
          if (data.success) {
            onSelectStartingLocation({
              name: data.name || `My Current Location (${lat.toFixed(5)}, ${lon.toFixed(5)})`,
              latitude: lat,
              longitude: lon,
            });
            setIsEditingOrigin(false);
            if (onFocusStartingPointOnMap) {
              onFocusStartingPointOnMap();
            }
          }
        } catch (err) {
          console.error('Reverse geocode error:', err);
          onSelectStartingLocation({
            name: `My GPS Location (${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)})`,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
          setIsEditingOrigin(false);
        } finally {
          setIsLocatingGps(false);
        }
      },
      (err) => {
        console.warn('GPS location error:', err);
        setIsLocatingGps(false);
        if (err.code === 1) {
          setGpsError('Location permission denied. Please allow location access or search your city.');
        } else if (err.code === 2) {
          setGpsError('Location unavailable. Check network or GPS.');
        } else {
          setGpsError('Location request timed out. Please try again or search by name.');
        }
      },
      { timeout: 12000, enableHighAccuracy: true, maximumAge: 0 }
    );
  };

  // Filtered regions for Destination selection
  const filteredRegions = ALL_REGIONS.filter(
    (r) =>
      r.name.toLowerCase().includes(destSearchQuery.toLowerCase()) ||
      r.state.toLowerCase().includes(destSearchQuery.toLowerCase()) ||
      (r.country && r.country.toLowerCase().includes(destSearchQuery.toLowerCase()))
  );

  return (
    <div className="bg-white border-b border-slate-200 shadow-xs mb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Step Progress Tracker */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 overflow-x-auto scrollbar-none">
            {/* Step 1 Chip */}
            <div className="flex items-center gap-1.5 shrink-0 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md font-semibold border border-indigo-200">
              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">1</span>
              <span>{t('step1Title', 'Step 1: Starting Point')}</span>
            </div>

            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

            {/* Step 2 Chip */}
            <div className="flex items-center gap-1.5 shrink-0 bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md font-semibold">
              <span className="w-4 h-4 rounded-full bg-slate-700 text-white flex items-center justify-center text-[10px]">2</span>
              <span>{t('step2Title', 'Step 2: Destination Hub')}</span>
            </div>

            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

            {/* Step 3 Chip */}
            <div className="flex items-center gap-1.5 shrink-0 bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md font-semibold">
              <span className="w-4 h-4 rounded-full bg-slate-700 text-white flex items-center justify-center text-[10px]">3</span>
              <span>{t('step3Title', 'Step 3: Popular Places & AI Cost')}</span>
            </div>
          </div>

          {/* Quick Plan Stats / Cart */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenItinerary}
              className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 rounded-lg text-xs font-medium border border-indigo-200 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>{t('addedToPlan', 'In My Plan')}:</span>
              <span className="font-bold font-mono text-indigo-700">{itemsInPlanCount} place(s)</span>
              {totalEstimatedCost > 0 && (
                <>
                  <span className="text-indigo-300">·</span>
                  <span className="font-mono font-bold text-emerald-700">
                    {currencySymbol}{totalEstimatedCost.toLocaleString()}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 2-Step Location Selection Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* STEP 1: Starting Point Card with Enhanced Pin Focus & Search */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t('originConfirmed', 'Starting Point (Origin)')}</span>
              </span>
              <div className="flex items-center gap-2">
                {onFocusStartingPointOnMap && !isEditingOrigin && (
                  <button
                    onClick={onFocusStartingPointOnMap}
                    className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 cursor-pointer"
                    title="Focus map directly on your starting position marker"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Show on Map</span>
                  </button>
                )}
                {!isEditingOrigin && (
                  <button
                    onClick={() => setIsEditingOrigin(true)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                  >
                    {t('changeOrigin', 'Change / Search')}
                  </button>
                )}
              </div>
            </div>

            {!isEditingOrigin ? (
              <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                      <div className="text-sm font-bold text-slate-900 leading-snug">
                        {startingLocation.name}
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2 mt-1">
                      <span>Coordinates:</span>
                      <span className="bg-slate-100 px-1.5 py-0.2 rounded text-slate-700 font-semibold">
                        {startingLocation.latitude.toFixed(5)}°N, {startingLocation.longitude.toFixed(5)}°E
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col items-end gap-1">
                    <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Confirmed Start
                    </span>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="text-[11px] text-slate-500">
                    Want to adjust? Drag the green pin on the map or search above.
                  </span>
                  {onFocusStartingPointOnMap && (
                    <button
                      onClick={onFocusStartingPointOnMap}
                      className="text-indigo-600 hover:text-indigo-800 font-semibold text-[11px] flex items-center gap-1 cursor-pointer shrink-0 ml-2"
                    >
                      <LocateFixed className="w-3 h-3" />
                      <span>Zoom to Pin</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3 bg-white p-3.5 rounded-lg border border-indigo-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Find Starting Place or Use Current Device GPS:
                  </span>
                  <button
                    onClick={() => {
                      setIsEditingOrigin(false);
                      setGpsError(null);
                    }}
                    className="text-slate-400 hover:text-slate-700 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Instant GPS Button */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <button
                    onClick={handleUseCurrentGps}
                    disabled={isLocatingGps}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Navigation className={`w-3.5 h-3.5 ${isLocatingGps ? 'animate-spin' : ''}`} />
                    <span>{isLocatingGps ? 'Acquiring Street-Level GPS...' : t('useCurrentGps', 'Use My Current GPS Location')}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onFocusStartingPointOnMap) onFocusStartingPointOnMap();
                      setIsEditingOrigin(false);
                    }}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1"
                    title="Pick on map directly"
                  >
                    <Crosshair className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Pick on Map</span>
                  </button>
                </div>

                {gpsError && (
                  <div className="p-2 rounded bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-snug">
                    ⚠️ {gpsError}
                  </div>
                )}

                {/* Search Input */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    ref={originInputRef}
                    type="text"
                    value={originSearchQuery}
                    onChange={(e) => setOriginSearchQuery(e.target.value)}
                    placeholder="Search city, street, railway station, airport..."
                    className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                  />
                  {originSearchQuery && (
                    <button
                      onClick={() => {
                        setOriginSearchQuery('');
                        setOriginSuggestions([]);
                      }}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {isOriginSearching && (
                    <div className="absolute right-8 top-2.5 text-[10px] text-slate-400">
                      Searching...
                    </div>
                  )}
                </div>

                {/* Search Autocomplete Suggestions */}
                {originSuggestions.length > 0 && (
                  <div className="border border-slate-200 rounded-lg shadow-md max-h-48 overflow-y-auto divide-y divide-slate-100 bg-white">
                    {originSuggestions.map((loc, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          onSelectStartingLocation({
                            name: loc.name || loc.fullName,
                            latitude: loc.latitude,
                            longitude: loc.longitude,
                          });
                          setIsEditingOrigin(false);
                          setOriginSearchQuery('');
                          setOriginSuggestions([]);
                          if (onFocusStartingPointOnMap) {
                            onFocusStartingPointOnMap();
                          }
                        }}
                        className="w-full text-left p-2.5 hover:bg-indigo-50 text-xs transition-colors cursor-pointer flex items-start gap-2.5"
                      >
                        <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate">{loc.name}</div>
                          <div className="text-[10px] text-slate-500 truncate">{loc.fullName}</div>
                          <div className="text-[9px] font-mono text-slate-400">
                            {loc.latitude.toFixed(4)}°, {loc.longitude.toFixed(4)}° · {loc.type}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* 1-Click Quick Starting Hubs */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Popular Starting Hubs (1-Click Selection):
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_STARTING_HUBS.map((hub, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          onSelectStartingLocation({
                            name: hub.name,
                            latitude: hub.lat,
                            longitude: hub.lon,
                          });
                          setIsEditingOrigin(false);
                          if (onFocusStartingPointOnMap) {
                            onFocusStartingPointOnMap();
                          }
                        }}
                        className="px-2 py-1 text-[11px] bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded-md border border-slate-200 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        {hub.type === 'plane' && <Plane className="w-3 h-3 text-sky-600" />}
                        {hub.type === 'train' && <Train className="w-3 h-3 text-indigo-600" />}
                        {hub.type === 'city' && <Building className="w-3 h-3 text-slate-600" />}
                        {hub.type === 'landmark' && <MapPin className="w-3 h-3 text-amber-600" />}
                        <span>{hub.name.split('(')[0].trim()}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* STEP 2: Destination Selection Card */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-700 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-indigo-600" />
                <span>{t('destinationSelected', 'Destination Region / City')}</span>
              </span>
              <button
                onClick={() => setIsSelectingDestination(!isSelectingDestination)}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
              >
                {isSelectingDestination ? 'Done' : t('changeDestination', 'Change Destination')}
              </button>
            </div>

            {!isSelectingDestination ? (
              <div className="flex items-center justify-between gap-3 bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-900 truncate flex items-center gap-2">
                    <span>{selectedRegion.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-normal">
                      {selectedRegion.state}
                      {selectedRegion.country ? `, ${selectedRegion.country}` : ''}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">
                    {selectedRegion.tagline}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded border border-indigo-200 block">
                    {selectedRegion.destinations.length} Places
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-2 bg-white p-3.5 rounded-lg border border-indigo-200 shadow-sm">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={destSearchQuery}
                    onChange={(e) => setDestSearchQuery(e.target.value)}
                    placeholder={t('searchDestinationPlaceholder', 'Search destination city, state, country...')}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                  />
                </div>

                {/* Gemini Discovery Option for Any Custom Destination City */}
                {destSearchQuery.trim() && (
                  <div className="p-2.5 bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-200 rounded-lg flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-indigo-950 truncate">
                        Discover "{destSearchQuery}"
                      </div>
                      <div className="text-[10px] text-indigo-600">
                        Synthesize popular places with Google Gemini AI
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={isSearchingCustomCity}
                      onClick={async () => {
                        setIsSearchingCustomCity(true);
                        try {
                          const geoRes = await fetch(`/api/geocode?q=${encodeURIComponent(destSearchQuery)}`);
                          const geoData = await geoRes.json();
                          const topGeo = geoData?.locations?.[0];
                          const lat = topGeo ? topGeo.latitude : 15.4989;
                          const lon = topGeo ? topGeo.longitude : 73.8278;

                          const aiRes = await fetch('/api/destinations/ai-search', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ query: destSearchQuery, latitude: lat, longitude: lon }),
                          });
                          const aiData = await aiRes.json();
                          const dests = aiData.destinations || [];

                          const customRegion: WorldRegion = {
                            id: `custom-${destSearchQuery.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
                            name: topGeo?.name || destSearchQuery,
                            state: topGeo?.fullName?.split(',')[1]?.trim() || 'Custom Hub',
                            country: topGeo?.fullName?.split(',').slice(-1)[0]?.trim() || '',
                            latitude: lat,
                            longitude: lon,
                            tagline: `AI-Synthesized Popular Travel Circuit for ${destSearchQuery}`,
                            defaultOriginName: `${destSearchQuery} Central Hub`,
                            corridors: [],
                            destinations: dests,
                          };

                          onSelectRegion(customRegion);
                          setIsSelectingDestination(false);
                          setDestSearchQuery('');
                        } catch (e) {
                          console.error('Custom city AI discovery error:', e);
                        } finally {
                          setIsSearchingCustomCity(false);
                        }
                      }}
                      className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>{isSearchingCustomCity ? 'Searching...' : 'Explore via AI'}</span>
                    </button>
                  </div>
                )}

                {/* Popular Destination Fast Badges */}
                <div className="max-h-52 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-lg">
                  {filteredRegions.map((region) => (
                    <button
                      key={region.id}
                      onClick={() => {
                        onSelectRegion(region);
                        setIsSelectingDestination(false);
                        setDestSearchQuery('');
                      }}
                      className={`w-full text-left p-2.5 hover:bg-indigo-50 text-xs transition-colors cursor-pointer flex items-center justify-between ${
                        selectedRegion.id === region.id ? 'bg-indigo-50/70 font-bold text-indigo-900' : 'text-slate-800'
                      }`}
                    >
                      <div>
                        <span className="font-semibold">{region.name}</span>
                        <span className="text-[11px] text-slate-500 ml-1.5">
                          ({region.state}{region.country ? `, ${region.country}` : ''})
                        </span>
                        <div className="text-[10px] text-slate-400 line-clamp-1">{region.tagline}</div>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                        {region.destinations.length} spots
                      </span>
                    </button>
                  ))}
                  {filteredRegions.length === 0 && !isSearchingCustomCity && (
                    <div className="p-3 text-center text-xs text-slate-500">
                      No preset region found. Click 'Explore via AI' above to discover popular places with Google Gemini!
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* User Choice: Days Planner & Target Budget Fields */}
        {(onUpdateDurationDays || onUpdateBudgetAmount) && (
          <div className="mt-3.5 pt-3 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Days Planner */}
            <div className="flex items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Days Planner</span>
                </span>
                <span className="text-[11px] text-slate-500 block truncate">
                  Type trip duration (1-30 days)
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => onUpdateDurationDays && onUpdateDurationDays(Math.max(1, (tripDurationDays || 1) - 1))}
                  className="w-7 h-7 flex items-center justify-center bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-xs font-bold cursor-pointer"
                  title="Decrease days"
                >
                  <Minus className="w-3 h-3" />
                </button>

                <div className="w-14">
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={tripDurationDays || 1}
                    onChange={(e) => {
                      const val = Math.max(1, Math.min(30, Number(e.target.value) || 1));
                      if (onUpdateDurationDays) onUpdateDurationDays(val);
                    }}
                    className="w-full text-center py-1 text-xs font-bold font-mono text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => onUpdateDurationDays && onUpdateDurationDays(Math.min(30, (tripDurationDays || 1) + 1))}
                  className="w-7 h-7 flex items-center justify-center bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-xs font-bold cursor-pointer"
                  title="Increase days"
                >
                  <Plus className="w-3 h-3" />
                </button>

                <span className="text-xs font-semibold text-slate-600 font-mono">
                  {(tripDurationDays || 1) === 1 ? 'Day' : 'Days'}
                </span>
              </div>
            </div>

            {/* User Choice Target Budget */}
            <div className="flex items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                  <Wallet className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Target Budget</span>
                </span>
                <span className="text-[11px] text-slate-500 block truncate">
                  Type your budget limit
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="relative w-28">
                  <span className="absolute left-2.5 top-1.5 text-xs font-bold text-slate-500 font-mono">
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={customBudgetAmount ?? ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? undefined : Math.max(0, Number(e.target.value));
                      if (onUpdateBudgetAmount) onUpdateBudgetAmount(val);
                    }}
                    placeholder="e.g. 5000"
                    className="w-full pl-6 pr-2 py-1 text-xs font-bold font-mono text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-1">
                  {[3000, 5000, 10000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => onUpdateBudgetAmount && onUpdateBudgetAmount(amt)}
                      className={`px-1.5 py-1 text-[10px] font-mono rounded border transition-colors cursor-pointer ${
                        customBudgetAmount === amt
                          ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {amt / 1000}k
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
