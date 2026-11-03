import React, { useState } from 'react';
import { WorldRegion, ALL_REGIONS, INDIAN_REGIONS, GLOBAL_REGIONS } from '../data/destinations';
import { MapPin, Search, ChevronDown, LocateFixed, Globe, Sparkles, Navigation } from 'lucide-react';

interface RegionSelectorProps {
  currentRegionId: string;
  currentOriginName: string;
  onSelectRegion: (region: WorldRegion) => void;
  onSelectCustomLocation: (location: { name: string; latitude: number; longitude: number; isCurrentLocation?: boolean }) => void;
}

export const RegionSelector: React.FC<RegionSelectorProps> = ({
  currentRegionId,
  currentOriginName,
  onSelectRegion,
  onSelectCustomLocation,
}) => {
  const [customSearchQuery, setCustomSearchQuery] = useState('');
  const [geocodedResults, setGeocodedResults] = useState<any[]>([]);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLocatingUser, setIsLocatingUser] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [activeTabGroup, setActiveTabGroup] = useState<'global' | 'india'>('global');

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocatingUser(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Reverse geocode to get human-readable location name
          const resp = await fetch(`/api/geocode/reverse?latitude=${latitude}&longitude=${longitude}`);
          const data = await resp.json();
          const placeName = data.name || `My Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;

          onSelectCustomLocation({
            name: placeName,
            latitude,
            longitude,
            isCurrentLocation: true,
          });
        } catch (err) {
          console.warn('Reverse geocode error:', err);
          onSelectCustomLocation({
            name: `My GPS Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
            latitude,
            longitude,
            isCurrentLocation: true,
          });
        } finally {
          setIsLocatingUser(false);
          setShowDropdown(false);
        }
      },
      (error) => {
        setIsLocatingUser(false);
        let errorMsg = 'Could not access device location.';
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'Location permission was denied. You can search any city manually below.';
        } else if (error.code === error.TIMEOUT) {
          errorMsg = 'Location detection timed out. Please try again or search manually.';
        }
        setLocationError(errorMsg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  };

  const handleGeocodeSearch = async (queryText: string) => {
    setCustomSearchQuery(queryText);
    if (!queryText.trim() || queryText.trim().length < 2) {
      setGeocodedResults([]);
      return;
    }

    setIsGeocoding(true);
    try {
      const resp = await fetch(`/api/geocode?q=${encodeURIComponent(queryText.trim())}`);
      const data = await resp.json();
      if (resp.ok && data.success) {
        setGeocodedResults(data.locations);
      }
    } catch (err) {
      console.warn('Geocode search error:', err);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handlePickCustom = (loc: any) => {
    onSelectCustomLocation({
      name: loc.name,
      latitude: loc.latitude,
      longitude: loc.longitude,
    });
    setCustomSearchQuery('');
    setGeocodedResults([]);
    setShowDropdown(false);
  };

  const currentRegion = ALL_REGIONS.find((r) => r.id === currentRegionId);
  const isCustomOrGPS = currentRegionId === 'custom' || !currentRegion;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Active Region Display */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center shrink-0">
            {isCustomOrGPS ? <Navigation className="w-4 h-4 text-emerald-600 animate-pulse" /> : <Globe className="w-4 h-4" />}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-900">
                Starting Origin: {currentRegion ? `${currentRegion.name}, ${currentRegion.state}` : currentOriginName}
              </span>
              <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 font-mono px-1.5 py-0.2 rounded font-semibold flex items-center gap-1">
                <Globe className="w-3 h-3" />
                Worldwide Enabled
              </span>
              {isCustomOrGPS && currentOriginName.toLowerCase().includes('location') && (
                <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono px-1.5 py-0.2 rounded font-semibold">
                  GPS Active
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              {currentRegion ? currentRegion.tagline : `Custom worldwide coordinates set as journey origin`}
            </p>
          </div>
        </div>

        {/* Action Controls: Use Current Location & City Quick-Selectors */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Direct "Use My Current Location" Button */}
          <button
            onClick={handleGetCurrentLocation}
            disabled={isLocatingUser}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 whitespace-nowrap shadow-xs ${
              isLocatingUser
                ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 hover:border-emerald-700'
            }`}
            title="Detect GPS coordinates from your device and start journey from here"
          >
            <LocateFixed className={`w-3.5 h-3.5 ${isLocatingUser ? 'animate-spin' : ''}`} />
            <span>{isLocatingUser ? 'Detecting Location...' : 'Use My Current Location'}</span>
          </button>

          {/* Quick Hubs Carousel (Paris, Tokyo, New York, London, Dubai, Vijayawada) */}
          <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none max-w-xs sm:max-w-md">
            {[
              GLOBAL_REGIONS.find((r) => r.id === 'paris')!,
              GLOBAL_REGIONS.find((r) => r.id === 'tokyo')!,
              GLOBAL_REGIONS.find((r) => r.id === 'london')!,
              GLOBAL_REGIONS.find((r) => r.id === 'newyork')!,
              GLOBAL_REGIONS.find((r) => r.id === 'dubai')!,
              INDIAN_REGIONS.find((r) => r.id === 'vijayawada')!,
            ].filter(Boolean).map((region) => {
              const isSelected = currentRegionId === region.id;
              return (
                <button
                  key={region.id}
                  onClick={() => onSelectRegion(region)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                    isSelected
                      ? 'bg-slate-900 text-white font-semibold shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {region.name}
                </button>
              );
            })}
          </div>

          {/* Worldwide Search & All Hubs Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap border border-slate-200"
            >
              <span>Worldwide Search</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 top-full mt-1.5 w-80 sm:w-96 bg-white rounded-xl border border-slate-200 shadow-xl p-3.5 z-40 space-y-3">
                {/* 1. GPS Quick Action inside menu */}
                <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-emerald-950 block">Start From Your Exact Spot</span>
                    <span className="text-[10px] text-emerald-700">Detect device GPS coordinates</span>
                  </div>
                  <button
                    onClick={handleGetCurrentLocation}
                    disabled={isLocatingUser}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold rounded-md flex items-center gap-1 transition-colors"
                  >
                    <LocateFixed className="w-3 h-3" />
                    <span>{isLocatingUser ? 'Locating...' : 'Locate Me'}</span>
                  </button>
                </div>

                {locationError && (
                  <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
                    {locationError}
                  </p>
                )}

                {/* 2. Search Any Worldwide City or Address */}
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                    Search ANY Address, City or Landmark Worldwide
                  </span>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={customSearchQuery}
                      onChange={(e) => handleGeocodeSearch(e.target.value)}
                      placeholder="e.g. Eiffel Tower, Shinjuku Tokyo, Times Square NY, Rome, Goa..."
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md pl-8 pr-2 py-1.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {isGeocoding && (
                    <div className="text-[10px] text-slate-400 mt-1 pl-1">
                      Searching global coordinates...
                    </div>
                  )}

                  {geocodedResults.length > 0 && (
                    <div className="mt-1.5 max-h-40 overflow-y-auto space-y-1 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                      {geocodedResults.map((loc, i) => (
                        <button
                          key={i}
                          onClick={() => handlePickCustom(loc)}
                          className="w-full text-left p-1.5 rounded hover:bg-indigo-50 text-[11px] text-slate-800 transition-colors block"
                        >
                          <div className="font-semibold text-slate-900">{loc.name}</div>
                          <div className="text-[10px] text-slate-500 truncate">{loc.fullName}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. Grouped Hub Tabs: Global Cities vs Indian Destinations */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1 mb-2 bg-slate-100 p-0.5 rounded-lg">
                    <button
                      onClick={() => setActiveTabGroup('global')}
                      className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all ${
                        activeTabGroup === 'global' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Global Metros
                    </button>
                    <button
                      onClick={() => setActiveTabGroup('india')}
                      className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all ${
                        activeTabGroup === 'india' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      India Hubs
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-1 max-h-44 overflow-y-auto pr-1">
                    {(activeTabGroup === 'global' ? GLOBAL_REGIONS : INDIAN_REGIONS).map((r) => (
                      <button
                        key={r.id}
                        onClick={() => {
                          onSelectRegion(r);
                          setShowDropdown(false);
                        }}
                        className={`text-left px-2 py-1.5 text-xs rounded transition-colors ${
                          currentRegionId === r.id
                            ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="font-medium text-slate-900 truncate">{r.name}</div>
                        <div className="text-[10px] text-slate-500 truncate">{r.state}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

