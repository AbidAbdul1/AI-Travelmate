import React, { useState, useEffect } from 'react';
import { Destination, ScoredDestination } from '../types/travel';
import { useLanguage } from '../context/LanguageContext';
import { getDestinationImageUrl, CATEGORY_FALLBACK_IMAGES } from '../utils/destinationImages';
import { MapPin, Navigation, Plus, Check, ChevronDown, ChevronUp, Sun, Sparkles } from 'lucide-react';

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
  const { t, currencySymbol } = useLanguage();
  const [showScoreBreakdown, setShowScoreBreakdown] = useState(false);
  const [imgSrc, setImgSrc] = useState<string>(() => getDestinationImageUrl(destination));

  useEffect(() => {
    setImgSrc(getDestinationImageUrl(destination));
  }, [destination.id, destination.imageUrl]);

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
          <img
            src={imgSrc}
            alt={destination.name}
            referrerPolicy="no-referrer"
            onError={() => {
              const fallback = CATEGORY_FALLBACK_IMAGES[destination.category] || CATEGORY_FALLBACK_IMAGES['All'];
              if (imgSrc !== fallback) {
                setImgSrc(fallback);
              }
            }}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Scored Destination Score */}
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
            <span>{destination.isOutdoor ? 'Outdoor' : 'Indoor'}</span>
          </div>

          {/* Category overlay */}
          <div className="absolute top-2.5 left-2.5 bg-indigo-900/80 backdrop-blur-xs text-white px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase">
            {destination.category}
          </div>

          {/* Gemini AI Discovery Badge */}
          {destination.isAiDiscovered && !scoredData && (
            <div className="absolute top-2.5 right-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-2 py-0.5 rounded text-[10px] font-bold tracking-wide flex items-center gap-1 shadow-sm">
              <Sparkles className="w-2.5 h-2.5 text-amber-300" />
              <span>Gemini AI Verified</span>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5 flex-wrap">
            <span className="font-semibold text-indigo-700">★ {destination.rating}</span>
            <span className="text-slate-400 font-mono">({formatReviewCount(destination.reviewsCount)})</span>
            <span aria-hidden="true">·</span>
            <span>{destination.estimatedDurationMin} mins</span>
            {destination.isAiDiscovered && (
              <span className="ml-auto text-[10px] text-emerald-700 font-medium bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                Live AI Discovered
              </span>
            )}
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

          {/* Gemini AI Insider Highlights */}
          {destination.aiHighlights && (
            <div className="mt-2.5 px-2.5 py-1.5 bg-emerald-50/80 border border-emerald-200/80 rounded-lg text-[11px] text-emerald-900 flex items-start gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="leading-snug">
                <span className="font-semibold text-emerald-950">AI Tip: </span>
                <span>{destination.aiHighlights}</span>
              </div>
            </div>
          )}

          {/* Key Facts: Entry Fee & Hours */}
          <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                {t('entryFee', 'Entry Fee')}
              </span>
              <span className="font-semibold text-slate-900">
                {destination.feeINR === 0
                  ? t('freeAdmission', 'Free Admission')
                  : `${currencySymbol}${destination.feeINR} ${t('perPerson', 'per person')}`}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                {t('openingHours', 'Hours')}
              </span>
              <span className="font-medium text-slate-900 truncate block" title={destination.openingHours}>
                {destination.openingHours}
              </span>
            </div>
          </div>

          {/* Recommendation Scoring Explanation */}
          {scoredData && (
            <div className="mt-3 p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
              <div className="flex items-center justify-between text-slate-800 font-medium">
                <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-600" />
                  Why Recommended
                </span>
                <button
                  type="button"
                  onClick={() => setShowScoreBreakdown(!showScoreBreakdown)}
                  className="text-indigo-600 text-[11px] hover:underline flex items-center gap-0.5 cursor-pointer"
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

          {/* Ride-Hailing Quick Estimates */}
          {scoredData && scoredData.distanceFromOriginKm > 0 && (
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-600">
              <span className="text-slate-400">Ride-Hailing:</span>
              <div className="flex items-center gap-2.5">
                <span className="text-slate-800">
                  <span className="text-[9px] bg-slate-900 text-white px-1 py-0.2 rounded font-bold mr-1">UBER</span>
                  ~{currencySymbol}{Math.max(75, Math.round(45 + scoredData.distanceFromOriginKm * 14.5 + scoredData.estimatedTravelTimeMin * 1.5 + 18))}
                </span>
                <span className="text-amber-900 font-semibold">
                  <span className="text-[9px] bg-amber-400 text-slate-950 px-1 py-0.2 rounded font-bold mr-1">RAPIDO</span>
                  ~{currencySymbol}{Math.max(25, Math.round(20 + Math.max(0, scoredData.distanceFromOriginKm - 1.5) * 9 + 4))}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card Action Buttons */}
      <div className="p-4 pt-0 border-t border-slate-100 flex items-center gap-2 mt-2">
        <button
          type="button"
          onClick={onCalculateRoute}
          className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          title="Calculate route and traffic conditions from origin"
        >
          <Navigation className="w-3.5 h-3.5 text-blue-600" />
          <span>{t('calculateRoute', 'Route & Traffic')}</span>
        </button>

        <button
          type="button"
          onClick={onAddToItinerary}
          className={`py-2 px-3.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
            isInItinerary
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
          }`}
          title="Add destination to active itinerary plan"
        >
          {isInItinerary ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>{t('addedToPlan', 'In Plan')}</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              <span>{t('addToPlan', 'Add to My Plan')}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
