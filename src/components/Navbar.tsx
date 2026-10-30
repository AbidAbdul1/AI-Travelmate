import React from 'react';
import { Compass, Sparkles, MapPin, Bookmark, BarChart2, Calendar, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  activeTab: 'explore' | 'recommendations' | 'itinerary' | 'assistant' | 'saved';
  setActiveTab: (tab: 'explore' | 'recommendations' | 'itinerary' | 'assistant' | 'saved') => void;
  onOpenEvaluation: () => void;
  savedTripsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenEvaluation,
  savedTripsCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('explore')}
              className="flex items-center gap-2.5 text-left focus:outline-none"
            >
              <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
                  AI-TRAVELMATE
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs text-slate-500 font-medium">
                  Vijayawada Pilot
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('explore')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'explore'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Destinations & Map
            </button>

            <button
              onClick={() => setActiveTab('recommendations')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'recommendations'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Smart Recommendations
            </button>

            <button
              onClick={() => setActiveTab('itinerary')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'itinerary'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Itinerary Planner
            </button>

            <button
              onClick={() => setActiveTab('assistant')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'assistant'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              AI Assistant
            </button>

            <button
              onClick={() => setActiveTab('saved')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'saved'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Bookmark className="w-4 h-4 text-slate-500" />
              <span>Saved Trips</span>
              {savedTripsCount > 0 && (
                <span className="text-xs bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full font-mono tabular-nums">
                  {savedTripsCount}
                </span>
              )}
            </button>
          </nav>

          {/* Zone 3: Primary Action & System Lab button */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenEvaluation}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
              title="SRS Specifications, Scoring Formula & ML Model Evaluation Metrics"
            >
              <BarChart2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>SRS & ML Diagnostics</span>
            </button>

            <button
              onClick={() => setActiveTab('recommendations')}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors whitespace-nowrap shadow-sm"
            >
              Plan Trip Now
            </button>
          </div>
        </div>
      </div>

      {/* Mobile subnavigation bar */}
      <div className="flex md:hidden overflow-x-auto px-4 py-2 bg-slate-50 border-t border-slate-200 gap-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('explore')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
            activeTab === 'explore' ? 'bg-white shadow-xs text-indigo-600 font-semibold' : 'text-slate-600'
          }`}
        >
          Destinations
        </button>
        <button
          onClick={() => setActiveTab('recommendations')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
            activeTab === 'recommendations' ? 'bg-white shadow-xs text-indigo-600 font-semibold' : 'text-slate-600'
          }`}
        >
          Recommendations
        </button>
        <button
          onClick={() => setActiveTab('itinerary')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
            activeTab === 'itinerary' ? 'bg-white shadow-xs text-indigo-600 font-semibold' : 'text-slate-600'
          }`}
        >
          Itinerary
        </button>
        <button
          onClick={() => setActiveTab('assistant')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
            activeTab === 'assistant' ? 'bg-white shadow-xs text-indigo-600 font-semibold' : 'text-slate-600'
          }`}
        >
          AI Chat
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
            activeTab === 'saved' ? 'bg-white shadow-xs text-indigo-600 font-semibold' : 'text-slate-600'
          }`}
        >
          Saved ({savedTripsCount})
        </button>
      </div>
    </header>
  );
};
