import React, { useState, useEffect } from 'react';
import { Destination, ScoredDestination } from '../types/travel';
import { useLanguage } from '../context/LanguageContext';
import { getDestinationImageUrl, CATEGORY_FALLBACK_IMAGES } from '../utils/destinationImages';
import { Navigation, Plus, Check, ChevronDown, ChevronUp, Sun, Sparkles, Clock, Ticket } from 'lucide-react';

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
      className={`group bg-white rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col justify-between ${
        isSelected
          ? 'border-indigo-600 ring-2 ring-indigo-600/15 shadow-md'
          : 'border-slate-200/80 hover:border-slate-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]'
      }`}
    >
      <div>
        {/* Photo Container with Gradient Scrim and Subtle Glassmorphism */}
        <div className="relative h-48 w-full bg-slate-100 overflow-hidden cursor-pointer" onClick={onSelect}>
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
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />

          {/* Elegant Scrim Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

          {/* Top Glassmorphic Badge: Score or Gemini Tag */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 pointer-events-none">
            {scoredData ? (
              <div className="bg-black/50 backdrop-blur-md text-white border border-white/20 px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1 shadow-xs">
                <span className="text-amber-400">★</span>
                <span>{scoredData.scores.finalScore}</span>
                <span className="text-white/60 font-normal text-[10px]">/100</span>
              </div>
            ) : destination.isAiDiscovered ? (
              <div className="bg-indigo-950/70 backdrop-blur-md text-indigo-100 border border-indigo-400/30 px-2 py-0.5 rounded-lg text-[10px] font-semibold flex items-center gap-1 shadow-xs">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>AI Verified</span>
              </div>
            ) : null}
          </div>

          {/* Bottom Overlay Info inside the Scrim */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white pointer-events-none">
            <div className="flex items-center gap-2 text-xs font-medium text-white/90">
              <span className="tracking-wide uppercase text-[11px] font-semibold text-white">
                {destination.category}
              </span>
              <span className="text-white/50">·</span>
              <span className="flex items-center gap-1 text-[11px] text-white/80">
                <Sun className="w-3 h-3 text-amber-400" />
                <span>{destination.isOutdoor ? 'Outdoor' : 'Indoor'}</span>
              </span>
            </div>

            <div className="text-xs font-mono font-semibold text-white/90 flex items-center gap-1">
              <Clock className="w-3 h-3 text-white/70" />
              <span>{destination.estimatedDurationMin}m</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5">
          {/* Rating & Review Counter Line (Unboxed, elegant typography) */}
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5">
            <span className="font-bold text-amber-600 flex items-center gap-0.5">
              <span>★</span>
              <span>{destination.rating}</span>
            </span>
            <span className="text-slate-400 font-mono text-[11px]">
              ({formatReviewCount(destination.reviewsCount)} reviews)
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-500 text-[11px]">{destination.bestTimeToVisit}</span>
          </div>

          {/* Destination Name */}
          <h3
            onClick={onSelect}
            className="font-display text-base font-extrabold text-slate-900 leading-snug cursor-pointer hover:text-indigo-600 transition-colors tracking-tight"
          >
            {destination.name}
          </h3>

          <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
            {destination.shortDescription}
          </p>

          {/* Gemini AI Insider Highlights */}
          {destination.aiHighlights && (
            <div className="mt-3 p-2.5 bg-slate-50 border-l-2 border-indigo-500 rounded-r-xl text-xs text-slate-700">
              <div className="flex items-start gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="leading-snug">
                  <span className="font-bold text-slate-900">Local Insight: </span>
                  <span className="text-slate-600">{destination.aiHighlights}</span>
                </div>
              </div>
            </div>
          )}

          {/* Key Facts: Entry Fee & Hours */}
          <div className="mt-3.5 pt-3 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                {t('entryFee', 'Entry Fee')}
              </span>
              <span className="font-bold text-slate-900 font-mono text-xs mt-0.5 block">
                {destination.feeINR === 0
                  ? t('freeAdmission', 'Free Admission')
                  : `${currencySymbol}${destination.feeINR} ${t('perPerson', 'per person')}`}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                {t('openingHours', 'Hours')}
              </span>
              <span className="font-medium text-slate-800 text-xs mt-0.5 block truncate" title={destination.openingHours}>
                {destination.openingHours}
              </span>
            </div>
          </div>

          {/* Transparent Scoring Details (If Scored) */}
          {scoredData && (
            <div className="mt-3 p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 text-xs">
              <div className="flex items-center justify-between text-slate-800 font-medium">
                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-600" />
                  <span>Recommendation Factor</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowScoreBreakdown(!showScoreBreakdown)}
                  className="text-indigo-600 text-[11px] font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <span>Breakdown</span>
                  {showScoreBreakdown ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>

              <p className="text-slate-600 text-[11px] mt-1 leading-relaxed">
                {scoredData.explanation}
              </p>

              {showScoreBreakdown && (
                <div className="mt-2.5 pt-2 border-t border-slate-200/80 grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Preference:</span>
                    <span className="font-bold text-slate-800">{scoredData.scores.preferenceMatch}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Budget:</span>
                    <span className="font-bold text-slate-800">{scoredData.scores.budgetSuitability}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Travel Time:</span>
                    <span className="font-bold text-slate-800">{scoredData.scores.travelTimeSuitability}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Weather:</span>
                    <span className="font-bold text-slate-800">{scoredData.scores.weatherSuitability}/100</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Ride-Hailing Quick Estimates */}
          {scoredData && scoredData.distanceFromOriginKm > 0 && (
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>Transit:</span>
              <div className="flex items-center gap-3">
                <span className="text-slate-800 font-semibold">
                  Uber ~{currencySymbol}{Math.max(75, Math.round(45 + scoredData.distanceFromOriginKm * 14.5 + scoredData.estimatedTravelTimeMin * 1.5 + 18))}
                </span>
                <span className="text-slate-800 font-semibold">
                  Rapido ~{currencySymbol}{Math.max(25, Math.round(20 + Math.max(0, scoredData.distanceFromOriginKm - 1.5) * 9 + 4))}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card Action Buttons */}
      <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 flex items-center gap-2 mt-2">
        <button
          type="button"
          onClick={onCalculateRoute}
          className="flex-1 py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-semibold rounded-xl border border-slate-200/80 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          title="Calculate route and traffic conditions from origin"
        >
          <Navigation className="w-3.5 h-3.5 text-indigo-600" />
          <span>{t('calculateRoute', 'Route & Traffic')}</span>
        </button>

        <button
          type="button"
          onClick={onAddToItinerary}
          className={`py-2 px-4 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
            isInItinerary
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-slate-900 hover:bg-slate-800 text-white'
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
              <span>{t('addToPlan', 'Add to Plan')}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
