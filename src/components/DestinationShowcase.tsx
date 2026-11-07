import React, { useState } from 'react';
import { WorldRegion, ALL_REGIONS } from '../data/destinations';
import { Search, Sparkles, MapPin, ChevronRight, Globe, Compass } from 'lucide-react';

interface DestinationShowcaseProps {
  onSelectRegion: (region: WorldRegion) => void;
  onSearchCustomCity: (query: string) => void;
  isSearching: boolean;
}

export const REGION_COVER_IMAGES: Record<string, string> = {
  'goa': 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
  'hyderabad': 'https://images.unsplash.com/photo-1609137144822-0d33e536136e?auto=format&fit=crop&w=800&q=80',
  'mumbai': 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80',
  'jaipur': 'https://images.unsplash.com/photo-1603228254119-e6a4d095dc59?auto=format&fit=crop&w=800&q=80',
  'delhi': 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80',
  'agra': 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
  'visakhapatnam': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  'bengaluru': 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80',
  'paris': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
  'tokyo': 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
  'dubai': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
  'rome': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80',
  'london': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80',
  'vijayawada': '/images/travelmate_kanakadurga_temple_1793036233893.jpg',
};

export const DestinationShowcase: React.FC<DestinationShowcaseProps> = ({
  onSelectRegion,
  onSearchCustomCity,
  isSearching,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'india' | 'international'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const displayedRegions = ALL_REGIONS.filter((region) => {
    // Type filter
    if (filterType === 'india' && region.isInternational) return false;
    if (filterType === 'international' && !region.isInternational) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        region.name.toLowerCase().includes(q) ||
        region.state.toLowerCase().includes(q) ||
        (region.country && region.country.toLowerCase().includes(q)) ||
        region.tagline.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Check if it matches an existing region
    const match = ALL_REGIONS.find(
      (r) =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        searchQuery.toLowerCase().includes(r.name.toLowerCase())
    );
    if (match) {
      onSelectRegion(match);
    } else {
      onSearchCustomCity(searchQuery.trim());
    }
  };

  return (
    <div className="space-y-6">
      {/* Editorial Destination Showcase Hero Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-[0_4px_30px_-4px_rgba(15,23,42,0.04)]">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Manual Destination Selection
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
            Where would you like to travel?
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed max-w-2xl">
            Choose a destination hub below to explore authentic places, live weather intelligence, and machine learning traffic speeds—or search any custom city worldwide.
          </p>
        </div>

        {/* Global AI Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mt-6 max-w-xl flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search any destination worldwide (e.g. Goa, Paris, Tokyo, Mumbai, Jaipur)..."
              className="w-full bg-slate-50 border border-slate-200/90 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all placeholder:text-slate-400"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{isSearching ? 'Discovering...' : 'Explore via AI'}</span>
          </button>
        </form>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 mt-6 pt-5 border-t border-slate-100 flex-wrap">
          <span className="text-xs font-semibold text-slate-400 mr-1">Filter Hubs:</span>
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              filterType === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            All Destinations ({ALL_REGIONS.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('india')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              filterType === 'india'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            India Circuits
          </button>
          <button
            type="button"
            onClick={() => setFilterType('international')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              filterType === 'international'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            International Hubs
          </button>
        </div>

        {/* Curated Destinations Grid */}
        <div className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {displayedRegions.map((region) => {
              const coverImg =
                REGION_COVER_IMAGES[region.id] ||
                region.destinations[0]?.imageUrl ||
                '/images/travelmate_hero_vijayawada_1793036232221.jpg';

              return (
                <div
                  key={region.id}
                  onClick={() => onSelectRegion(region)}
                  className="group relative bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 overflow-hidden shadow-xs hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition-all duration-300 cursor-pointer flex flex-col justify-between"
                >
                  <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={coverImg}
                      alt={region.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />

                    <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md text-white border border-white/20 px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-semibold">
                      {region.destinations.length} spots
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-white pointer-events-none">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-white/80">
                        {region.state}
                        {region.country ? `, ${region.country}` : ''}
                      </div>
                      <h4 className="font-display text-lg font-extrabold tracking-tight text-white leading-tight mt-0.5">
                        {region.name}
                      </h4>
                    </div>
                  </div>

                  <div className="p-3.5 flex items-center justify-between bg-white border-t border-slate-100">
                    <p className="text-[11px] text-slate-500 line-clamp-1 pr-2">
                      {region.tagline}
                    </p>
                    <span className="text-xs font-semibold text-indigo-600 group-hover:text-indigo-800 shrink-0 flex items-center gap-0.5">
                      Explore <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {displayedRegions.length === 0 && (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200">
              <Compass className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <h4 className="font-display font-bold text-slate-800 text-sm">
                No preset circuit found for "{searchQuery}"
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Click "Explore via AI" above to discover popular places with Google Gemini AI.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
