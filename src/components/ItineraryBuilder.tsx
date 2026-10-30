import React, { useState } from 'react';
import { ItineraryPlan, ItineraryItem, Destination } from '../types/travel';
import {
  Calendar,
  Clock,
  MapPin,
  ArrowUp,
  ArrowDown,
  Trash2,
  Bookmark,
  Printer,
  Sparkles,
  ChevronRight,
  Sun,
  IndianRupee,
  Car,
} from 'lucide-react';

interface ItineraryBuilderProps {
  itinerary: ItineraryPlan | null;
  onUpdateItinerary: (updated: ItineraryPlan) => void;
  onSaveItinerary: () => void;
  onFocusDestination: (dest: Destination) => void;
  isSaving: boolean;
}

export const ItineraryBuilder: React.FC<ItineraryBuilderProps> = ({
  itinerary,
  onUpdateItinerary,
  onSaveItinerary,
  onFocusDestination,
  isSaving,
}) => {
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  if (!itinerary || !itinerary.days || itinerary.days.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center shadow-xs">
        <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">No Active Itinerary Plan</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
          Select destinations from the catalog or run personalized recommendations to generate your structured day-by-day travel schedule.
        </p>
      </div>
    );
  }

  const currentDay = itinerary.days[activeDayIndex] || itinerary.days[0];

  const handleMoveItem = (itemIndex: number, direction: 'up' | 'down') => {
    if (!currentDay) return;
    const items = [...currentDay.items];
    const targetIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1;

    if (targetIndex < 0 || targetIndex >= items.length) return;

    // Swap items
    const temp = items[itemIndex];
    items[itemIndex] = items[targetIndex];
    items[targetIndex] = temp;

    // Recalculate orders
    const reordered = items.map((it, idx) => ({ ...it, order: idx + 1 }));

    const updatedDays = itinerary.days.map((d, idx) =>
      idx === activeDayIndex ? { ...d, items: reordered } : d
    );

    onUpdateItinerary({
      ...itinerary,
      days: updatedDays,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleRemoveItem = (itemId: string) => {
    if (!currentDay) return;
    const updatedItems = currentDay.items
      .filter((i) => i.id !== itemId)
      .map((it, idx) => ({ ...it, order: idx + 1 }));

    const updatedDays = itinerary.days.map((d, idx) =>
      idx === activeDayIndex ? { ...d, items: updatedItems } : d
    );

    const totalCount = updatedDays.reduce((acc, d) => acc + d.items.length, 0);

    onUpdateItinerary({
      ...itinerary,
      days: updatedDays,
      totalDestinations: totalCount,
      updatedAt: new Date().toISOString(),
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
      {/* Title & Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              {itinerary.title}
            </h2>
            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
              {itinerary.totalDestinations} Stops
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
            <span>Origin: {itinerary.startingLocation.name.split('(')[0]}</span>
            <span>·</span>
            <span>Est. Entry Fees: ₹{itinerary.totalEstimatedBudgetINR}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            title="Print or export trip itinerary"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>

          <button
            onClick={onSaveItinerary}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-lg shadow-xs transition-colors"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save to My Trips'}</span>
          </button>
        </div>
      </div>

      {/* AI Itinerary Briefing if present */}
      {itinerary.aiExplanation && (
        <div className="p-3 bg-indigo-50/70 rounded-lg border border-indigo-150 text-xs text-indigo-950 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">{itinerary.aiExplanation}</p>
        </div>
      )}

      {/* Multi-Day Navigation Tabs */}
      {itinerary.days.length > 1 && (
        <div className="flex gap-1.5 p-1 bg-slate-100 rounded-lg overflow-x-auto scrollbar-none">
          {itinerary.days.map((day, idx) => (
            <button
              key={idx}
              onClick={() => setActiveDayIndex(idx)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                activeDayIndex === idx
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Day {day.dayNumber} ({day.items.length} stops)
            </button>
          ))}
        </div>
      )}

      {/* Day Overview Strip */}
      <div className="flex items-center justify-between text-xs text-slate-600 px-1 font-mono">
        <span>Day {currentDay.dayNumber} Schedule</span>
        <div className="flex items-center gap-3">
          <span>Transit: ~{currentDay.totalDistanceKm} km</span>
          <span>·</span>
          <span>Dwell + Travel: ~{Math.round(currentDay.totalDurationMin / 60)} hrs</span>
        </div>
      </div>

      {/* Ordered Timeline Items (FR-47 to FR-51) */}
      <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200 before:z-0">
        {currentDay.items.map((item, index) => {
          const isFirst = index === 0;
          const isLast = index === currentDay.items.length - 1;

          return (
            <div key={item.id} className="relative z-10 pl-8">
              {/* Timeline circle badge */}
              <div className="absolute left-1.5 top-3.5 -translate-x-1/2 w-5 h-5 rounded-full bg-slate-900 text-white font-mono text-[10px] flex items-center justify-center font-bold ring-4 ring-white">
                {item.order}
              </div>

              {/* Transit link from previous */}
              {!isFirst && item.travelTimeFromPreviousMin && (
                <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2 mb-2 pl-2">
                  <Car className="w-3 h-3 text-slate-400" />
                  <span>
                    ~{item.travelDistanceFromPreviousKm} km · {item.travelTimeFromPreviousMin} mins driving
                  </span>
                  {item.trafficLevel && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                        item.trafficLevel === 'Low'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {item.trafficLevel} Traffic
                    </span>
                  )}
                </div>
              )}

              {/* Item Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 hover:border-slate-300 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div
                    className="cursor-pointer group flex-1"
                    onClick={() => onFocusDestination(item.destination)}
                  >
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono font-bold text-indigo-700">
                        {item.timeSlot}
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-600 font-medium">
                        {item.durationMin} mins dwell
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mt-0.5">
                      {item.destination.name}
                    </h4>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                      <span>{item.destination.category}</span>
                      <span>·</span>
                      <span>
                        {item.destination.feeINR === 0 ? 'Free Entry' : `₹${item.destination.feeINR}`}
                      </span>
                      <span>·</span>
                      <span className="truncate max-w-[200px]" title={item.destination.openingHours}>
                        {item.destination.openingHours}
                      </span>
                    </div>
                  </div>

                  {/* Move Up / Down & Remove Controls */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleMoveItem(index, 'up')}
                      disabled={isFirst}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded hover:bg-slate-200"
                      title="Move up in order"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveItem(index, 'down')}
                      disabled={isLast}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded hover:bg-slate-200"
                      title="Move down in order"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50"
                      title="Remove from itinerary"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Practical Notes & Weather Advisory */}
                <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600">
                  <div className="flex items-center gap-1 text-slate-500 italic">
                    <span>{item.userNotes || item.destination.bestTimeToVisit}</span>
                  </div>

                  {item.destination.isOutdoor && (
                    <div className="flex items-center gap-1 text-amber-700 font-medium">
                      <Sun className="w-3 h-3 text-amber-500" />
                      <span>Outdoor destination</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
