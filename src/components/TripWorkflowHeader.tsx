import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ALL_REGIONS, WorldRegion } from '../data/destinations';
import { detectUserLocation } from '../utils/locationService';
import {
  MapPin,
  Navigation,
  Search,
  Sparkles,
  Crosshair,
  Building,
  Plane,
  Train,
  X,
  Calendar,
  Wallet,
  Plus,
  Minus,
  Check,
  ChevronDown,
} from 'lucide-react';

interface TripWorkflowHeaderProps {
  startingLocation: { name: string; latitude: number; longitude: number };
  onSelectStartingLocation: (loc: { name: string; latitude: number; longitude: number }) => void;
  selectedRegion: WorldRegion | null;
  onSelectRegion: (region: WorldRegion) => void;
  itemsInPlanCount: number;
  totalEstimatedCost: number;
  onOpenItinerary: () => void;
  onFocusStartingPointOnMap?: () => void;
  tripDurationDays?: number;
  onUpdateDurationDays?: (days: number) => void;
  customBudgetAmount?: number;
  onUpdateBudgetAmount?: (amt: number | undefined) => void;
  onClearItinerary?: () => void;
  onAutoFillPlan?: () => void;
}

// Popular starting points across major transport hubs for 1-click selection
const QUICK_STARTING_HUBS = [
  { name: 'Hyderabad Secunderabad', lat: 17.4339, lon: 78.5042, type: 'train' },
  { name: 'Bengaluru Majestic', lat: 12.9778, lon: 77.5714, type: 'train' },
  { name: 'Mumbai CSMT Station', lat: 18.9402, lon: 72.8356, type: 'train' },
  { name: 'New Delhi CP Hub', lat: 28.6315, lon: 77.2167, type: 'city' },
  { name: 'Visakhapatnam Station', lat: 17.7214, lon: 83.2926, type: 'train' },
  { name: 'Vijayawada Central Junction', lat: 16.5179, lon: 80.6196, type: 'train' },
  { name: 'Chennai Central Station', lat: 13.0827, lon: 80.2707, type: 'train' },
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
  onClearItinerary,
  onAutoFillPlan,
}) => {
  const { t, currencySymbol } = useLanguage();

  // Search states for Origin
  const [isEditingOrigin, setIsEditingOrigin] = useState(false);
  const [originSearchQuery, setOriginSearchQuery] = useState('');
  const [originSuggestions, setOriginSuggestions] = useState<any[]>([]);
  const [isOriginSearching, setIsOriginSearching] = useState(false);
  const [isLocatingGps, setIsLocatingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [detectedLocationSource, setDetectedLocationSource] = useState<string | null>(null);

  // Search states for Destination
  const [isSelectingDestination, setIsSelectingDestination] = useState(false);
  const [destSearchQuery, setDestSearchQuery] = useState('');
  const [isSearchingCustomCity, setIsSearchingCustomCity] = useState(false);

  const originInputRef = useRef<HTMLInputElement>(null);
  const originFlyoutRef = useRef<HTMLDivElement>(null);
  const destFlyoutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditingOrigin && originInputRef.current) {
      originInputRef.current.focus();
    }
  }, [isEditingOrigin]);

  // Click outside listener for flyouts
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (originFlyoutRef.current && !originFlyoutRef.current.contains(event.target as Node)) {
        setIsEditingOrigin(false);
      }
      if (destFlyoutRef.current && !destFlyoutRef.current.contains(event.target as Node)) {
        setIsSelectingDestination(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // Multi-tier reliable GPS & IP location detection handler
  const handleUseCurrentGps = async () => {
    setIsLocatingGps(true);
    setGpsError(null);

    try {
      const loc = await detectUserLocation();
      onSelectStartingLocation({
        name: loc.name,
        latitude: loc.latitude,
        longitude: loc.longitude,
      });
      setDetectedLocationSource(loc.source);
      setIsEditingOrigin(false);
      if (onFocusStartingPointOnMap) {
        onFocusStartingPointOnMap();
      }
    } catch (err: any) {
      console.warn('Location detection error:', err);
      setGpsError('Could not detect location. Please type your city in the search box below.');
    } finally {
      setIsLocatingGps(false);
    }
  };

  // Filtered regions for Destination selection
  const filteredRegions = ALL_REGIONS.filter(
    (r) =>
      r.name.toLowerCase().includes(destSearchQuery.toLowerCase()) ||
      r.state.toLowerCase().includes(destSearchQuery.toLowerCase()) ||
      (r.country && r.country.toLowerCase().includes(destSearchQuery.toLowerCase()))
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.04)] mb-6">
      <div className="p-4 sm:p-5">
        {/* Top Header Row: Clean Context & Plan Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block">
              Trip Command Center
            </span>
            <h2 className="font-display text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              Plan Your Journey
            </h2>
          </div>

          {/* Quick Plan Stats / Cart & Self-Planning Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenItinerary}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('addedToPlan', 'Active Plan')}:</span>
              <span className="font-mono font-bold text-indigo-200">
                {itemsInPlanCount} {itemsInPlanCount === 1 ? 'spot' : 'spots'}
              </span>
              {totalEstimatedCost > 0 && (
                <>
                  <span className="text-slate-500">·</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {currencySymbol}{totalEstimatedCost.toLocaleString()}
                  </span>
                </>
              )}
            </button>

            {itemsInPlanCount > 0 && onClearItinerary && (
              <button
                type="button"
                onClick={onClearItinerary}
                title="Clear all places to plan your route from scratch"
                className="px-3 py-1.5 text-xs font-semibold text-rose-700 hover:text-rose-800 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer border border-rose-200/80"
              >
                Clear
              </button>
            )}

            {itemsInPlanCount === 0 && onAutoFillPlan && selectedRegion && (
              <button
                type="button"
                onClick={onAutoFillPlan}
                title="Auto-fill an AI recommended itinerary"
                className="px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:text-indigo-800 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer border border-indigo-200/80 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Auto-Suggest</span>
              </button>
            )}
          </div>
        </div>

        {/* Unified 4-Segment Travel Planner Strip */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-4">
          {/* Segment 1: Origin / Starting Hub */}
          <div className="relative" ref={originFlyoutRef}>
            <div
              onClick={() => setIsEditingOrigin(!isEditingOrigin)}
              className={`p-3 rounded-xl border transition-all cursor-pointer group ${
                isEditingOrigin
                  ? 'border-indigo-600 ring-2 ring-indigo-600/10 bg-indigo-50/20'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                <span className="flex items-center gap-1 text-emerald-700">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>1. Starting From (Origin)</span>
                </span>
                <span className="text-[10px] text-indigo-600 group-hover:underline">
                  {isEditingOrigin ? 'Close' : 'Change'}
                </span>
              </div>
              <div className="font-bold text-slate-900 text-sm truncate flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="truncate">{startingLocation.name}</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5 truncate flex items-center gap-1.5">
                <span>{startingLocation.latitude.toFixed(3)}°N, {startingLocation.longitude.toFixed(3)}°E</span>
                {detectedLocationSource && (
                  <span className="text-[9px] text-emerald-600 font-sans font-semibold">· GPS / IP Synced</span>
                )}
              </div>
            </div>

            {/* Origin Dropdown / Search Modal */}
            {isEditingOrigin && (
              <div className="absolute left-0 top-full mt-2 w-full sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 p-3.5 z-40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    Set Your Starting Position:
                  </span>
                  <button
                    onClick={() => {
                      setIsEditingOrigin(false);
                      setGpsError(null);
                    }}
                    className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Instant GPS with Multi-Tier Fallback */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleUseCurrentGps}
                    disabled={isLocatingGps}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Navigation className={`w-3.5 h-3.5 ${isLocatingGps ? 'animate-spin' : ''}`} />
                    <span>{isLocatingGps ? 'Detecting via GPS / IP...' : 'Detect My Exact Location'}</span>
                  </button>

                  {onFocusStartingPointOnMap && (
                    <button
                      onClick={() => {
                        onFocusStartingPointOnMap();
                        setIsEditingOrigin(false);
                      }}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1"
                      title="Zoom to pin on map"
                    >
                      <Crosshair className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Map</span>
                    </button>
                  )}
                </div>

                {gpsError && (
                  <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-snug">
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
                    placeholder="Search city, station, airport (e.g. Hyderabad, Mumbai, Delhi)..."
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
                </div>

                {/* Autocomplete Suggestions */}
                {originSuggestions.length > 0 && (
                  <div className="border border-slate-200 rounded-lg max-h-40 overflow-y-auto divide-y divide-slate-100 bg-white shadow-xs">
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
                        className="w-full text-left p-2.5 hover:bg-indigo-50 text-xs transition-colors cursor-pointer flex items-start gap-2"
                      >
                        <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate">{loc.name}</div>
                          <div className="text-[10px] text-slate-500 truncate">{loc.fullName}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* 1-Click Starting Hubs */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Quick Major Departure Hubs:
                  </div>
                  <div className="flex flex-wrap gap-1">
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
                        className="px-2 py-1 text-[11px] bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded-md transition-colors cursor-pointer flex items-center gap-1"
                      >
                        {hub.type === 'plane' && <Plane className="w-3 h-3 text-sky-600" />}
                        {hub.type === 'train' && <Train className="w-3 h-3 text-indigo-600" />}
                        {hub.type === 'city' && <Building className="w-3 h-3 text-slate-600" />}
                        <span>{hub.name.split('(')[0].trim()}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Segment 2: Destination City / Region (Manual Selection - No Default Forced) */}
          <div className="relative" ref={destFlyoutRef}>
            <div
              onClick={() => setIsSelectingDestination(!isSelectingDestination)}
              className={`p-3 rounded-xl border transition-all cursor-pointer group ${
                !selectedRegion
                  ? 'border-indigo-500 bg-indigo-50/40 ring-2 ring-indigo-500/20'
                  : isSelectingDestination
                  ? 'border-indigo-600 ring-2 ring-indigo-600/10 bg-indigo-50/20'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                <span className="flex items-center gap-1 text-indigo-700">
                  <Navigation className="w-3.5 h-3.5" />
                  <span>2. Destination Hub</span>
                </span>
                <span className="text-[10px] text-indigo-600 font-bold group-hover:underline">
                  {!selectedRegion ? 'Select City' : isSelectingDestination ? 'Close' : 'Switch'}
                </span>
              </div>

              {selectedRegion ? (
                <>
                  <div className="font-bold text-slate-900 text-sm truncate flex items-center justify-between">
                    <span className="truncate">{selectedRegion.name}</span>
                    <span className="text-[11px] font-mono font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded">
                      {selectedRegion.destinations.length} spots
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">
                    {selectedRegion.state}
                    {selectedRegion.country ? `, ${selectedRegion.country}` : ''}
                  </div>
                </>
              ) : (
                <>
                  <div className="font-bold text-indigo-900 text-sm truncate flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping shrink-0" />
                    <span>Choose Destination</span>
                  </div>
                  <div className="text-[11px] text-indigo-600 font-medium truncate mt-0.5">
                    Tap to pick Goa, Mumbai, Paris, etc.
                  </div>
                </>
              )}
            </div>

            {/* Destination Selection Dropdown */}
            {isSelectingDestination && (
              <div className="absolute left-0 top-full mt-2 w-full sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 p-3.5 z-40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    Select Destination City / Circuit:
                  </span>
                  <button
                    onClick={() => setIsSelectingDestination(false)}
                    className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={destSearchQuery}
                    onChange={(e) => setDestSearchQuery(e.target.value)}
                    placeholder="Search city (Goa, Jaipur, Paris, Mumbai, Tokyo)..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                  />
                </div>

                {/* Gemini AI Custom Destination Synthesizer */}
                {destSearchQuery.trim() && (
                  <div className="p-2.5 bg-indigo-50/80 border border-indigo-200/80 rounded-lg flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-indigo-950 truncate">
                        Discover "{destSearchQuery}"
                      </div>
                      <div className="text-[10px] text-indigo-600">
                        Synthesize popular spots with Google Gemini AI
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
                      className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                    >
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      <span>{isSearchingCustomCity ? 'Searching...' : 'Explore via AI'}</span>
                    </button>
                  </div>
                )}

                {/* Regions List */}
                <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-lg">
                  {filteredRegions.map((region) => (
                    <button
                      key={region.id}
                      onClick={() => {
                        onSelectRegion(region);
                        setIsSelectingDestination(false);
                        setDestSearchQuery('');
                      }}
                      className={`w-full text-left p-2.5 hover:bg-slate-50 text-xs transition-colors cursor-pointer flex items-center justify-between ${
                        selectedRegion?.id === region.id ? 'bg-indigo-50/70 font-bold text-indigo-950' : 'text-slate-800'
                      }`}
                    >
                      <div>
                        <div className="font-semibold">{region.name}</div>
                        <div className="text-[10px] text-slate-500">
                          {region.state}{region.country ? `, ${region.country}` : ''}
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded font-semibold">
                        {region.destinations.length} spots
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Segment 3: Days Planner */}
          <div className="p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 transition-all">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              <span className="flex items-center gap-1 text-slate-700">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                <span>3. Trip Duration</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">1–30 Days</span>
            </div>

            <div className="flex items-center justify-between mt-1">
              <div className="font-bold text-slate-900 text-sm font-mono">
                {tripDurationDays || 1} {(tripDurationDays || 1) === 1 ? 'Day' : 'Days'}
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onUpdateDurationDays && onUpdateDurationDays(Math.max(1, (tripDurationDays || 1) - 1))}
                  className="w-7 h-7 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  title="Decrease days"
                >
                  <Minus className="w-3 h-3" />
                </button>

                <button
                  type="button"
                  onClick={() => onUpdateDurationDays && onUpdateDurationDays(Math.min(30, (tripDurationDays || 1) + 1))}
                  className="w-7 h-7 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  title="Increase days"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Multi-day itinerary schedule
            </div>
          </div>

          {/* Segment 4: Target Budget */}
          <div className="p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 transition-all">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              <span className="flex items-center gap-1 text-slate-700">
                <Wallet className="w-3.5 h-3.5 text-indigo-600" />
                <span>4. Target Budget</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Optional</span>
            </div>

            <div className="flex items-center gap-1.5 mt-1">
              <div className="relative flex-1">
                <span className="absolute left-2.5 top-1.5 text-xs font-bold text-slate-400 font-mono">
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
                  placeholder="Set budget..."
                  className="w-full pl-6 pr-2 py-1 text-xs font-bold font-mono text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {[3000, 5000, 10000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => onUpdateBudgetAmount && onUpdateBudgetAmount(amt)}
                    className={`px-1.5 py-1 text-[10px] font-mono rounded-md transition-colors cursor-pointer ${
                      customBudgetAmount === amt
                        ? 'bg-slate-900 text-white font-bold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {amt / 1000}k
                  </button>
                ))}
              </div>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Live AI cost alerts
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
