import React, { useState } from 'react';
import { Destination, ScoredDestination } from '../types/travel';
import { MapPin, Clock, IndianRupee, Navigation, Plus, Check, ChevronDown, ChevronUp, Sun, ShieldCheck } from 'lucide-react';

interface DestinationCardProps {
  destination: Destination;
  scoredData?: ScoredDestination;
  isSelected?: boolean;
  onSelect: () => void;
  onCalculateRoute: () => void;
  onAddToItinerary: () => void;
  isInItinerary?: boolean;
}

export const DestinationCard: React.FC<DestinationCardProps> = ({
  destination,
  scoredData,
  isSelected = false,
  onSelect,
  onCalculateRoute,
  onAddToItinerary,
  isInItinerary = false,
}) => {
  const [showScoreBreakdown, setShowScoreBreakdown] = useState(false);

  const formatReviewCount = (num: number) => {
    return num >= 1000 ? `${(num / 1000).toFixed(1)}k` : num.toString();
  };

  return (
    <div
      className={`group bg-white rounded-xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
        isSelected
          ? 'border-indigo-600 ring-2 ring-indigo-600/20 shadow-md'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
      }`}
    >
      <div>
        {/* Photo Container */}
        <div className="relative h-44 w-full bg-slate-100 overflow-hidden cursor-pointer" onClick={onSelect}>
          {destination.imageUrl ? (
            <img
              src={destination.imageUrl}
              alt={destination.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
              <MapPin className="w-8 h-8" />
            </div>
          )}

          {/* Scored Destination Pill-Free Overlay Score */}
          {scoredData && (
            <div className="absolute top-2.5 right-2.5 bg-slate-900/90 backdrop-blur-xs text-white px-2.5 py-1 rounded-md text-xs font-mono font-bold flex items-center gap-1 shadow-xs">
              <span className="text-emerald-400">★</span>
              <span>{scoredData.scores.finalScore}</span>
              <span className="text-slate-400 font-normal">/100</span>
            </div>
          )}

          {/* Outdoor / Indoor Weather Indicator */}
          <div className="absolute bottom-2.5 left-2.5 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded text-[11px] font-medium text-slate-700 shadow-xs flex items-center gap-1">
            <Sun className="w-3 h-3 text-amber-500" />
            <span>{destination.isOutdoor ? 'Outdoor Site' : 'Indoor Facility'}</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4">
          {/* Unboxed Metadata Line (frontend-design zero-pill discipline) */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5 flex-wrap">
            <span className="font-semibold text-indigo-700">{destination.category}</span>
            <span aria-hidden="true">·</span>
            <span>★ {destination.rating} ({formatReviewCount(destination.reviewsCount)})</span>
            <span aria-hidden="true">·</span>
            <span>{destination.estimatedDurationMin} mins</span>
          </div>

          {/* Destination Name */}
          <h3
            onClick={onSelect}
            className="text-base font-bold text-slate-900 leading-snug cursor-pointer hover:text-indigo-600 transition-colors"
          >
            {destination.name}
          </h3>

          <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
            {destination.shortDescription}
          </p>

          {/* Key Quick Facts */}
          <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Entry Fee</span>
              <span className="font-medium text-slate-900">
                {destination.feeINR === 0 ? 'Free Admission' : `₹${destination.feeINR} per person`}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Hours</span>
              <span className="font-medium text-slate-900 truncate block" title={destination.openingHours}>
                {destination.openingHours}
              </span>
            </div>
          </div>

          {/* Recommendation Scoring Explanation (FR-15) */}
          {scoredData && (
            <div className="mt-3 p-2.5 bg-slate-50 rounded-lg border border-slate-150 text-xs">
              <div className="flex items-center justify-between text-slate-800 font-medium">
                <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
                  Why Recommended
                </span>
                <button
                  type="button"
                  onClick={() => setShowScoreBreakdown(!showScoreBreakdown)}
                  className="text-indigo-600 text-[11px] hover:underline flex items-center gap-0.5"
                >
                  <span>Score Breakdown</span>
                  {showScoreBreakdown ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>

              <p className="text-slate-600 text-[11px] mt-1 leading-normal">
                {scoredData.explanation}
              </p>

              {showScoreBreakdown && (
                <div className="mt-2.5 pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Preference:</span>
                    <span className="font-semibold text-slate-800">{scoredData.scores.preferenceMatch}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Budget:</span>
                    <span className="font-semibold text-slate-800">{scoredData.scores.budgetSuitability}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Travel Time:</span>
                    <span className="font-semibold text-slate-800">{scoredData.scores.travelTimeSuitability}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Weather:</span>
                    <span className="font-semibold text-slate-800">{scoredData.scores.weatherSuitability}/100</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Card Action Buttons */}
      <div className="p-4 pt-0 border-t border-slate-100 flex items-center gap-2 mt-2">
        <button
          type="button"
          onClick={onCalculateRoute}
          className="flex-1 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5"
          title="Calculate route and traffic conditions from origin"
        >
          <Navigation className="w-3.5 h-3.5 text-blue-600" />
          <span>Route & Traffic</span>
        </button>

        <button
          type="button"
          onClick={onAddToItinerary}
          className={`py-1.5 px-3 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
            isInItinerary
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
          }`}
          title="Add destination to active itinerary plan"
        >
          {isInItinerary ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>In Plan</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
