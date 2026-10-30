import React, { useState } from 'react';
import { IndianRegion, INDIAN_REGIONS } from '../data/destinations';
import { MapPin, Search, Compass, Check, ChevronDown, Sparkles } from 'lucide-react';

interface RegionSelectorProps {
  currentRegionId: string;
  currentOriginName: string;
  onSelectRegion: (region: IndianRegion) => void;
  onSelectCustomLocation: (location: { name: string; latitude: number; longitude: number }) => void;
}

export const RegionSelector: React.FC<RegionSelectorProps> = ({
  currentRegionId,
  currentOriginName,
  onSelectRegion,
  onSelectCustomLocation,
}) => {
  const [isSearchingCustom, setIsSearchingCustom] = useState(false);
  const [customSearchQuery, setCustomSearchQuery] = useState('');
  const [geocodedResults, setGeocodedResults] = useState<any[]>([]);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleGeocodeSearch = async (queryText: string) => {
    setCustomSearchQuery(queryText);
    if (!queryText.trim() || queryText.trim().length < 3) {
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
    setIsSearchingCustom(false);
    setShowDropdown(false);
  };

  const currentRegion = INDIAN_REGIONS.find((r) => r.id === currentRegionId);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Active Region Display */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">
                Active Trip Hub: {currentRegion ? `${currentRegion.name}, ${currentRegion.state}` : currentOriginName}
              </span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono px-1.5 py-0.2 rounded font-semibold">
                All-India Enabled
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              {currentRegion ? currentRegion.tagline : `Custom coordinates set in India`}
            </p>
          </div>
        </div>

        {/* Quick Indian Cities Selector */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
            {INDIAN_REGIONS.slice(0, 6).map((region) => {
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

          {/* More Cities & Custom Search Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap"
            >
              <span>More Places</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 top-full mt-1.5 w-72 bg-white rounded-xl border border-slate-200 shadow-lg p-3 z-40 space-y-3">
                {/* Custom Search in India */}
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Search ANY Town or City in India
                  </span>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={customSearchQuery}
                      onChange={(e) => handleGeocodeSearch(e.target.value)}
                      placeholder="e.g. Udaipur, Ooty, Rishikesh, Coorg, Amritsar..."
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md pl-8 pr-2 py-1.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {isGeocoding && (
                    <div className="text-[10px] text-slate-400 mt-1 pl-1">
                      Finding coordinates in India...
                    </div>
                  )}

                  {geocodedResults.length > 0 && (
                    <div className="mt-1.5 max-h-36 overflow-y-auto space-y-1 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                      {geocodedResults.map((loc, i) => (
                        <button
                          key={i}
                          onClick={() => handlePickCustom(loc)}
                          className="w-full text-left p-1.5 rounded hover:bg-indigo-50 text-[11px] text-slate-800 transition-colors block truncate"
                        >
                          <span className="font-semibold">{loc.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Additional Major Indian Regions */}
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                    Major Indian Travel Hubs
                  </span>
                  <div className="grid grid-cols-2 gap-1">
                    {INDIAN_REGIONS.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => {
                          onSelectRegion(r);
                          setShowDropdown(false);
                        }}
                        className={`text-left px-2 py-1 text-xs rounded transition-colors ${
                          currentRegionId === r.id
                            ? 'bg-indigo-50 text-indigo-700 font-semibold'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {r.name}
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
