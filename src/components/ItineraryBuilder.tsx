import React, { useState } from 'react';
import {
  ItineraryPlan,
  ItineraryItem,
  Destination,
  TravelModeOption,
  SegmentTravelMode,
} from '../types/travel';
import { ItineraryCostPieChart } from './ItineraryCostPieChart';
import { RouteModeComparisonModal } from './RouteModeComparisonModal';
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
  Bus,
  Bike,
  Footprints,
  Compass,
  ArrowDownUp,
  PieChart as PieIcon,
  ListOrdered,
  LayoutGrid,
  Copy,
  Check,
  Share2,
  Plane,
  Train,
  FileText,
  Shirt,
  RotateCcw,
  Plus,
} from 'lucide-react';

interface ItineraryBuilderProps {
  itinerary: ItineraryPlan | null;
  onUpdateItinerary: (updated: ItineraryPlan) => void;
  onSaveItinerary: () => void;
  onFocusDestination: (dest: Destination) => void;
  isSaving: boolean;
  customBudgetAmount?: number;
  onOpenExportSheet?: () => void;
  onOpenPackingList?: () => void;
  onClearItinerary?: () => void;
  onAutoFillPlan?: () => void;
  onNavigateToExplore?: () => void;
}

export const ItineraryBuilder: React.FC<ItineraryBuilderProps> = ({
  itinerary,
  onUpdateItinerary,
  onSaveItinerary,
  onFocusDestination,
  isSaving,
  customBudgetAmount,
  onOpenExportSheet,
  onOpenPackingList,
  onClearItinerary,
  onAutoFillPlan,
  onNavigateToExplore,
}) => {
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [copiedSchedule, setCopiedSchedule] = useState(false);
  const [viewDisplayMode, setViewDisplayMode] = useState<'timeline' | 'cost_chart' | 'combined'>('combined');
  const [comparingSegment, setComparingSegment] = useState<{
    segmentId: string;
    dayNumber: number;
    orderNumber: number;
    fromName: string;
    toName: string;
    distanceKm: number;
    currentMode?: SegmentTravelMode;
    currentTimeMin?: number;
    departureTime?: string;
  } | null>(null);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);

  const handleOpenModeComparison = (
    item: ItineraryItem,
    prevItem: ItineraryItem | null,
    dayNumber: number
  ) => {
    const fromName = prevItem
      ? prevItem.destination.name
      : itinerary?.startingLocation.name.split(',')[0].split('(')[0].trim() || 'Origin Hub';

    const dist = item.travelDistanceFromPreviousKm || 4.2;

    setComparingSegment({
      segmentId: item.id,
      dayNumber,
      orderNumber: item.order,
      fromName,
      toName: item.destination.name,
      distanceKm: dist,
      currentMode: item.travelMode || 'driving',
      currentTimeMin: item.travelTimeFromPreviousMin || 15,
      departureTime: item.timeSlot ? item.timeSlot.split('-')[0].trim() : '09:00',
    });
    setIsComparisonModalOpen(true);
  };

  const handleSelectSegmentMode = (segmentId: string, option: TravelModeOption) => {
    if (!itinerary) return;

    const updatedDays = itinerary.days.map((day) => {
      const updatedItems = day.items.map((item) => {
        if (item.id === segmentId) {
          return {
            ...item,
            travelMode: option.mode,
            travelTimeFromPreviousMin: option.durationMin,
            travelCostINR: option.costINR,
          };
        }
        return item;
      });

      const newTotalDuration = updatedItems.reduce(
        (acc, it) => acc + it.durationMin + (it.travelTimeFromPreviousMin || 0),
        0
      );

      return {
        ...day,
        items: updatedItems,
        totalDurationMin: newTotalDuration,
      };
    });

    onUpdateItinerary({
      ...itinerary,
      days: updatedDays,
      updatedAt: new Date().toISOString(),
    });
  };

  const renderModeIcon = (mode?: SegmentTravelMode) => {
    switch (mode) {
      case 'flight':
        return <Plane className="w-3.5 h-3.5 text-sky-600" />;
      case 'train':
        return <Train className="w-3.5 h-3.5 text-indigo-700" />;
      case 'transit':
        return <Bus className="w-3.5 h-3.5 text-emerald-600" />;
      case 'auto_rickshaw':
        return <Compass className="w-3.5 h-3.5 text-amber-600" />;
      case 'two_wheeler':
        return <Bike className="w-3.5 h-3.5 text-sky-600" />;
      case 'walking':
        return <Footprints className="w-3.5 h-3.5 text-emerald-700" />;
      case 'driving':
      default:
        return <Car className="w-3.5 h-3.5 text-indigo-600" />;
    }
  };

  const getModeLabel = (mode?: SegmentTravelMode) => {
    switch (mode) {
      case 'flight':
        return 'Flight (Air)';
      case 'train':
        return 'Express Rail';
      case 'transit':
        return 'Public Bus / Transit';
      case 'auto_rickshaw':
        return 'Auto-Rickshaw';
      case 'two_wheeler':
        return 'Two-Wheeler';
      case 'walking':
        return 'Walking';
      case 'driving':
      default:
        return 'Cab / Car';
    }
  };

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

  const handleCopySchedule = () => {
    if (!itinerary) return;
    let text = `🗓️ ${itinerary.title}\n📍 Starting Location: ${itinerary.startingLocation.name}\n🏁 Total Stops: ${itinerary.totalDestinations}\n━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    itinerary.days.forEach((d) => {
      text += `📅 ${d.date} (~${d.totalDistanceKm} km, ~${Math.round(d.totalDurationMin / 60)} hrs)\n`;
      d.items.forEach((item) => {
        text += `  • [${item.timeSlot}] #${item.order} ${item.destination.name} (${item.destination.category})\n`;
        text += `    Fee: ${item.destination.feeINR === 0 ? 'Free' : '₹' + item.destination.feeINR} | Duration: ${item.durationMin} mins\n`;
        if (item.travelDistanceFromPreviousKm) {
          text += `    Transit: ~${item.travelDistanceFromPreviousKm} km via ${item.travelMode || 'driving'} (~${item.travelTimeFromPreviousMin || 15} mins)\n`;
        }
      });
      text += '\n';
    });

    text += `Plan generated with AI-TRAVELMATE`;
    navigator.clipboard.writeText(text);
    setCopiedSchedule(true);
    setTimeout(() => setCopiedSchedule(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.04)] space-y-5">
      {/* Title & Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-lg font-extrabold text-slate-900 tracking-tight">
              {itinerary.title}
            </h2>
            <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-lg font-mono font-semibold">
              {itinerary.totalDestinations} Stops
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 flex-wrap">
            <span>Origin: {itinerary.startingLocation.name.split('(')[0]}</span>
            <span>·</span>
            <span>Est. Entry Fees: ₹{itinerary.totalEstimatedBudgetINR}</span>
            {customBudgetAmount && customBudgetAmount > 0 && (
              <>
                <span>·</span>
                <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  Target Budget: ₹{customBudgetAmount.toLocaleString()}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenPackingList && (
            <button
              onClick={onOpenPackingList}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors cursor-pointer"
              title="Open Smart Packing List Generator"
            >
              <Shirt className="w-3.5 h-3.5 text-indigo-600" />
              <span>Packing List</span>
            </button>
          )}

          <button
            onClick={onOpenExportSheet || handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-colors cursor-pointer"
            title="Download PDF or offline printable travel sheet"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span>PDF / Offline Sheet</span>
          </button>

          <button
            onClick={handleCopySchedule}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            title="Copy formatted schedule to clipboard for WhatsApp or Notes"
          >
            {copiedSchedule ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSchedule ? 'Copied!' : 'Copy'}</span>
          </button>

          {onClearItinerary && itinerary.totalDestinations > 0 && (
            <button
              onClick={onClearItinerary}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
              title="Clear all destinations to start planning by yourself from scratch"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
              <span>Clear Plan</span>
            </button>
          )}

          {onAutoFillPlan && itinerary.totalDestinations === 0 && (
            <button
              onClick={onAutoFillPlan}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors cursor-pointer"
              title="Auto-fill an AI recommended itinerary"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Auto-Suggest</span>
            </button>
          )}

          <button
            onClick={onSaveItinerary}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Plan'}</span>
          </button>
        </div>
      </div>

      {/* View Display Mode Toggle: Timeline, Cost Pie Chart, or Combined */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-medium text-slate-600">
          <button
            onClick={() => setViewDisplayMode('combined')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              viewDisplayMode === 'combined'
                ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Combined Overview</span>
          </button>
          <button
            onClick={() => setViewDisplayMode('timeline')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              viewDisplayMode === 'timeline'
                ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>Schedule Timeline</span>
          </button>
          <button
            onClick={() => setViewDisplayMode('cost_chart')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              viewDisplayMode === 'cost_chart'
                ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5 text-indigo-600" />
            <span>Cost Distribution (D3)</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Showing {itinerary.totalDestinations} destination stop(s)
        </div>
      </div>

      {/* D3 Cost Pie Chart: Shown in 'cost_chart' or 'combined' view */}
      {(viewDisplayMode === 'cost_chart' || viewDisplayMode === 'combined') && (
        <div className="print:block">
          <ItineraryCostPieChart
            itinerary={itinerary}
            activeDayIndex={activeDayIndex}
            onSelectDestination={onFocusDestination}
            onOpenSegmentComparison={(itemId, dayNum) => {
              const day = itinerary.days.find((d) => d.dayNumber === dayNum) || itinerary.days[0];
              if (!day) return;
              const idx = day.items.findIndex((it) => it.id === itemId);
              if (idx !== -1) {
                const item = day.items[idx];
                const prev = idx > 0 ? day.items[idx - 1] : null;
                handleOpenModeComparison(item, prev, dayNum);
              }
            }}
          />
        </div>
      )}

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

      {/* Ordered Timeline Items (FR-47 to FR-51): Shown in 'timeline' or 'combined' view */}
      {(viewDisplayMode === 'timeline' || viewDisplayMode === 'combined') && (
        <div className="space-y-4">
          {/* Day Overview Strip */}
          <div className="flex items-center justify-between text-xs text-slate-600 px-1 font-mono pt-1">
            <span className="font-semibold text-slate-800">Day {currentDay.dayNumber} Stop-by-Stop Schedule</span>
            <div className="flex items-center gap-3">
              <span>Transit: ~{currentDay.totalDistanceKm} km</span>
              <span>·</span>
              <span>Dwell + Travel: ~{Math.round(currentDay.totalDurationMin / 60)} hrs</span>
            </div>
          </div>

          {currentDay.items.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-300 rounded-xl space-y-3">
              <Calendar className="w-8 h-8 text-indigo-500 mx-auto opacity-75" />
              <div>
                <h4 className="text-sm font-bold text-slate-800">Day {currentDay.dayNumber} is Ready for Your Custom Plan</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  You are in self-planning mode! Browse popular spots in your selected destination and click <strong>"+ Add to Plan"</strong> to build your customized route.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                {onNavigateToExplore && (
                  <button
                    onClick={onNavigateToExplore}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Browse & Pick Popular Spots</span>
                  </button>
                )}
                {onAutoFillPlan && (
                  <button
                    onClick={onAutoFillPlan}
                    className="px-3 py-1.5 bg-white hover:bg-slate-50 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-medium cursor-pointer flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Auto-Suggest Initial Plan</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
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

                  {/* Transit link from previous / Origin */}
                  {!isFirst && (
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5 pl-2 py-1.5 px-3 rounded-lg bg-slate-50/90 border border-slate-200/80 text-[11px] font-mono">
                      <div className="flex items-center gap-2 text-slate-700">
                        <span className="p-1 rounded bg-white border border-slate-200 shadow-2xs">
                          {renderModeIcon(item.travelMode)}
                        </span>
                        <span className="font-semibold text-slate-800">
                          {getModeLabel(item.travelMode)}: ~{item.travelDistanceFromPreviousKm || 4.2} km · {item.travelTimeFromPreviousMin || 15} mins
                        </span>
                        {typeof item.travelCostINR === 'number' && (
                          <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            {item.travelCostINR === 0 ? 'Free (₹0)' : `₹${item.travelCostINR}`}
                          </span>
                        )}
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

                      <button
                        onClick={() => handleOpenModeComparison(item, currentDay.items[index - 1], currentDay.dayNumber)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[11px] transition-colors border border-indigo-200/80 shadow-2xs"
                        title="Compare travel modes side-by-side (Car vs. Public Transit vs. Auto vs. Two-Wheeler)"
                      >
                        <ArrowDownUp className="w-3 h-3 text-indigo-600" />
                        <span>Compare Modes (Car vs. Transit)</span>
                      </button>
                    </div>
                  )}

                  {isFirst && (
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pl-2 py-1 px-2.5 rounded-lg bg-slate-50/70 border border-slate-200/60 text-[11px] font-mono">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <MapPin className="w-3 h-3 text-indigo-500" />
                        <span>Origin Hub: {itinerary.startingLocation.name.split(',')[0].split('(')[0].trim()}</span>
                        <span>·</span>
                        <span>~{item.travelDistanceFromPreviousKm || 3.2} km to Stop 1</span>
                      </div>
                      <button
                        onClick={() => handleOpenModeComparison(item, null, currentDay.dayNumber)}
                        className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-medium text-[10px] transition-colors border border-slate-200"
                        title="Compare travel modes from trip origin hub"
                      >
                        <ArrowDownUp className="w-2.5 h-2.5 text-indigo-600" />
                        <span>Compare Modes</span>
                      </button>
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
        )}
      </div>
    )}

      {/* Route Mode Comparison Modal (Car vs. Public Transit vs. Auto vs. Bike) */}
      <RouteModeComparisonModal
        isOpen={isComparisonModalOpen}
        onClose={() => setIsComparisonModalOpen(false)}
        segmentData={comparingSegment}
        onSelectMode={handleSelectSegmentMode}
      />
    </div>
  );
};
