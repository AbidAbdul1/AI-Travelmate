import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { ItineraryPlan, ItineraryDay, ItineraryItem, Destination } from '../types/travel';
import {
  IndianRupee,
  Car,
  Ticket,
  Utensils,
  Layers,
  PieChart as PieIcon,
  HelpCircle,
  TrendingUp,
  MapPin,
  Compass,
} from 'lucide-react';

export interface CostSlice {
  id: string;
  name: string;
  category: 'activity' | 'travel_segment' | 'dining' | 'contingency';
  categoryLabel: string;
  amount: number;
  details: string;
  destinationId?: string;
  distanceKm?: number;
  color?: string;
  itemId?: string;
  dayNumber?: number;
}

interface ItineraryCostPieChartProps {
  itinerary: ItineraryPlan;
  activeDayIndex?: number;
  onSelectDestination?: (dest: Destination) => void;
  onOpenSegmentComparison?: (itemId: string, dayNumber: number) => void;
}

// Transit rates per km in Indian urban/regional travel
const TRANSIT_MODES = [
  { id: 'auto_cab', label: 'Cab / Auto (₹18/km)', ratePerKm: 18, baseFare: 40 },
  { id: 'private_fuel', label: 'Car Fuel (₹12/km)', ratePerKm: 12, baseFare: 0 },
  { id: 'public_transit', label: 'Public Bus (₹5/km)', ratePerKm: 5, baseFare: 20 },
];

export const ItineraryCostPieChart: React.FC<ItineraryCostPieChartProps> = ({
  itinerary,
  activeDayIndex = 0,
  onSelectDestination,
  onOpenSegmentComparison,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Filter & breakdown state
  const [scope, setScope] = useState<'day' | 'all'>('day');
  const [viewMode, setViewMode] = useState<'detailed' | 'category'>('detailed');
  const [transitModeId, setTransitModeId] = useState<'auto_cab' | 'private_fuel' | 'public_transit'>('auto_cab');
  const [includeMeals, setIncludeMeals] = useState<boolean>(true);
  const [hoveredSliceId, setHoveredSliceId] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    slice: CostSlice | null;
    percent: number;
  }>({
    visible: false,
    x: 0,
    y: 0,
    slice: null,
    percent: 0,
  });

  const selectedTransit = TRANSIT_MODES.find((m) => m.id === transitModeId) || TRANSIT_MODES[0];

  // Helper: compute Haversine distance if km missing
  const getDistanceKm = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  };

  // Compile cost items based on scope and transit mode
  const { slices, totalBudget, freeDestinationsCount } = useMemo(() => {
    const rawSlices: CostSlice[] = [];
    let freeCount = 0;

    const daysToInclude: ItineraryDay[] =
      scope === 'day' && itinerary.days[activeDayIndex]
        ? [itinerary.days[activeDayIndex]]
        : itinerary.days;

    daysToInclude.forEach((day) => {
      let previousLat = itinerary.startingLocation.latitude;
      let previousLng = itinerary.startingLocation.longitude;
      let previousName = itinerary.startingLocation.name.split(',')[0].split('(')[0].trim();

      day.items.forEach((item, idx) => {
        // 1. Destination Entry / Activity Fee
        const fee = item.destination.feeINR ?? 0;
        if (fee > 0) {
          rawSlices.push({
            id: `act-${day.dayNumber}-${item.id}`,
            name: `${item.destination.name} (Admission)`,
            category: 'activity',
            categoryLabel: 'Activity / Entry Fee',
            amount: fee,
            details: `${item.destination.category} · Stop #${item.order} (Day ${day.dayNumber})`,
            destinationId: item.destination.id,
          });
        } else {
          freeCount++;
        }

        // 2. Travel Segment Cost (respects user-selected travel mode if configured)
        let segmentDistance = item.travelDistanceFromPreviousKm;
        if (!segmentDistance || segmentDistance <= 0) {
          segmentDistance = getDistanceKm(
            previousLat,
            previousLng,
            item.destination.latitude,
            item.destination.longitude
          );
        }
        if (segmentDistance <= 0.2) segmentDistance = 2.5; // minimum city crawl

        // Use segment-specific chosen cost from route mode comparison if set, or fallback to global transit setting
        const transitCost =
          typeof item.travelCostINR === 'number'
            ? item.travelCostINR
            : Math.max(
                selectedTransit.baseFare,
                Math.round(segmentDistance * selectedTransit.ratePerKm + selectedTransit.baseFare)
              );

        const modeDisplay =
          item.travelMode === 'transit'
            ? 'Bus / Transit'
            : item.travelMode === 'auto_rickshaw'
            ? 'Auto-Rickshaw'
            : item.travelMode === 'two_wheeler'
            ? 'Two-Wheeler'
            : item.travelMode === 'walking'
            ? 'Walking'
            : selectedTransit.label.split('(')[0].trim();

        const fromLabel = idx === 0 ? 'Origin' : previousName;
        rawSlices.push({
          id: `seg-${day.dayNumber}-${item.id}`,
          itemId: item.id,
          dayNumber: day.dayNumber,
          name: `Transit (${modeDisplay}): ${fromLabel} → ${item.destination.name}`,
          category: 'travel_segment',
          categoryLabel: 'Road Transit Segment',
          amount: transitCost,
          details: `~${segmentDistance} km via ${modeDisplay}`,
          distanceKm: segmentDistance,
        });

        previousLat = item.destination.latitude;
        previousLng = item.destination.longitude;
        previousName = item.destination.name;
      });

      // 3. Estimated Dining / Refreshment Allowance per Day (South Indian meals/snacks)
      if (includeMeals && day.items.length > 0) {
        rawSlices.push({
          id: `meal-day-${day.dayNumber}`,
          name: `Day ${day.dayNumber} Refreshments & Dining`,
          category: 'dining',
          categoryLabel: 'Meals & Refreshments',
          amount: 250,
          details: 'Est. local snacks, tea/coffee & casual dining along route',
        });
      }
    });

    // If grouping by category
    if (viewMode === 'category') {
      const categoryMap = new Map<string, { label: string; amount: number; itemsCount: number }>();
      rawSlices.forEach((slice) => {
        const existing = categoryMap.get(slice.category) || {
          label: slice.categoryLabel,
          amount: 0,
          itemsCount: 0,
        };
        existing.amount += slice.amount;
        existing.itemsCount += 1;
        categoryMap.set(slice.category, existing);
      });

      const aggregatedSlices: CostSlice[] = Array.from(categoryMap.entries()).map(
        ([catKey, data]) => ({
          id: `cat-${catKey}`,
          name: data.label,
          category: catKey as CostSlice['category'],
          categoryLabel: data.label,
          amount: data.amount,
          details: `${data.itemsCount} combined item(s)`,
        })
      );

      const total = aggregatedSlices.reduce((acc, curr) => acc + curr.amount, 0);
      return { slices: aggregatedSlices, totalBudget: total, freeDestinationsCount: freeCount };
    }

    const total = rawSlices.reduce((acc, curr) => acc + curr.amount, 0);
    return { slices: rawSlices, totalBudget: total, freeDestinationsCount: freeCount };
  }, [
    itinerary,
    scope,
    activeDayIndex,
    viewMode,
    transitModeId,
    includeMeals,
    selectedTransit,
  ]);

  // Color generator palette using cohesive Tailwind hex values
  const colorScale = useMemo(() => {
    // Curated rich color palette
    const activityColors = ['#059669', '#0d9488', '#10b981', '#14b8a6', '#047857'];
    const segmentColors = ['#4f46e5', '#3b82f6', '#0284c7', '#6366f1', '#2563eb', '#1d4ed8'];
    const diningColor = '#f59e0b';
    const contingencyColor = '#8b5cf6';

    let actIdx = 0;
    let segIdx = 0;

    const assigned = new Map<string, string>();
    slices.forEach((slice) => {
      if (slice.category === 'activity') {
        assigned.set(slice.id, activityColors[actIdx % activityColors.length]);
        actIdx++;
      } else if (slice.category === 'travel_segment') {
        assigned.set(slice.id, segmentColors[segIdx % segmentColors.length]);
        segIdx++;
      } else if (slice.category === 'dining') {
        assigned.set(slice.id, diningColor);
      } else {
        assigned.set(slice.id, contingencyColor);
      }
    });

    return (id: string) => assigned.get(id) || '#64748b';
  }, [slices]);

  // D3 Render Effect
  useEffect(() => {
    if (!svgRef.current || slices.length === 0) return;

    const width = 320;
    const height = 320;
    const radius = Math.min(width, height) / 2;
    const innerRadius = radius * 0.58;
    const outerRadius = radius * 0.88;
    const hoverOuterRadius = radius * 0.95;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const g = svg
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    // D3 Pie Generator
    const pie = d3
      .pie<CostSlice>()
      .value((d) => d.amount)
      .sort(null)
      .padAngle(0.025);

    // D3 Arc Generator
    const arc = d3
      .arc<d3.PieArcDatum<CostSlice>>()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .cornerRadius(4);

    const arcHover = d3
      .arc<d3.PieArcDatum<CostSlice>>()
      .innerRadius(innerRadius - 2)
      .outerRadius(hoverOuterRadius)
      .cornerRadius(5);

    const arcsData = pie(slices);

    // Draw Arc Slices
    const paths = g
      .selectAll<SVGPathElement, d3.PieArcDatum<CostSlice>>('path')
      .data(arcsData)
      .enter()
      .append('path')
      .attr('d', (d) => {
        return d.data.id === hoveredSliceId ? arcHover(d) : arc(d);
      })
      .attr('fill', (d) => colorScale(d.data.id))
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .style('transition', 'all 200ms ease-out');

    // Attach Event Listeners
    paths
      .on('mouseenter', function (event: MouseEvent, d) {
        setHoveredSliceId(d.data.id);
        d3.select(this)
          .transition()
          .duration(150)
          .attr('d', (arcDatum: any) => arcHover(arcDatum));

        const percent = totalBudget > 0 ? (d.data.amount / totalBudget) * 100 : 0;
        const rect = containerRef.current?.getBoundingClientRect();
        const mouseX = rect ? event.clientX - rect.left : event.clientX;
        const mouseY = rect ? event.clientY - rect.top : event.clientY;

        setTooltip({
          visible: true,
          x: mouseX,
          y: mouseY,
          slice: d.data,
          percent,
        });
      })
      .on('mousemove', function (event: MouseEvent) {
        const rect = containerRef.current?.getBoundingClientRect();
        const mouseX = rect ? event.clientX - rect.left : event.clientX;
        const mouseY = rect ? event.clientY - rect.top : event.clientY;
        setTooltip((prev) => ({
          ...prev,
          x: mouseX,
          y: mouseY,
        }));
      })
      .on('mouseleave', function () {
        setHoveredSliceId(null);
        d3.select(this)
          .transition()
          .duration(150)
          .attr('d', (arcDatum: any) => arc(arcDatum));

        setTooltip((prev) => ({ ...prev, visible: false }));
      })
      .on('click', function (_event: MouseEvent, d) {
        if (d.data.destinationId && onSelectDestination) {
          const found = itinerary.days
            .flatMap((day) => day.items)
            .find((item) => item.destination.id === d.data.destinationId);
          if (found) {
            onSelectDestination(found.destination);
          }
        }
      });
  }, [slices, hoveredSliceId, totalBudget, colorScale, itinerary, onSelectDestination]);

  // Center display data
  const hoveredSlice = useMemo(
    () => slices.find((s) => s.id === hoveredSliceId),
    [slices, hoveredSliceId]
  );

  return (
    <div
      ref={containerRef}
      className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-5 relative"
    >
      {/* Header & Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <PieIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Estimated Cost Distribution
              </h3>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-mono font-semibold">
                D3 Visualization
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live breakdown across destination entry tickets, road transit segments & refreshments
            </p>
          </div>
        </div>

        {/* Scope and View Mode Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Day vs Trip Scope Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-medium text-slate-600">
            <button
              onClick={() => setScope('day')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                scope === 'day'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'hover:text-slate-900'
              }`}
            >
              Day {itinerary.days[activeDayIndex]?.dayNumber || 1}
            </button>
            <button
              onClick={() => setScope('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                scope === 'all'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'hover:text-slate-900'
              }`}
            >
              All Days ({itinerary.days.length})
            </button>
          </div>

          {/* Detailed vs Aggregated Category Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-medium text-slate-600">
            <button
              onClick={() => setViewMode('detailed')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                viewMode === 'detailed'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'hover:text-slate-900'
              }`}
              title="Individual destination fees & travel segments"
            >
              By Item
            </button>
            <button
              onClick={() => setViewMode('category')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                viewMode === 'category'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'hover:text-slate-900'
              }`}
              title="Grouped by Activities, Transit, and Dining"
            >
              By Category
            </button>
          </div>
        </div>
      </div>

      {/* Transit Rate Configuration Strip */}
      <div className="bg-slate-50/80 border border-slate-200/80 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-700">
          <Car className="w-3.5 h-3.5 text-slate-500" />
          <span className="font-medium">Transit Model:</span>
          <div className="flex items-center gap-1">
            {TRANSIT_MODES.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setTransitModeId(mode.id as any)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                  transitModeId === mode.id
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 select-none">
          <input
            type="checkbox"
            checked={includeMeals}
            onChange={(e) => setIncludeMeals(e.target.checked)}
            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span>Include daily food/refreshment estimate (₹250/day)</span>
        </label>
      </div>

      {/* Main Chart + Legend Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* D3 Donut Chart with Center Readout */}
        <div className="md:col-span-5 flex flex-col items-center justify-center relative py-2">
          <div className="relative w-[280px] h-[280px] sm:w-[300px] sm:h-[300px]">
            <svg
              ref={svgRef}
              className="w-full h-full drop-shadow-xs"
              style={{ overflow: 'visible' }}
            />

            {/* Center Donut Info Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-6">
              {hoveredSlice ? (
                <div className="space-y-0.5 animate-fadeIn">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                    {hoveredSlice.categoryLabel}
                  </span>
                  <div className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">
                    ₹{hoveredSlice.amount.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] text-indigo-600 font-bold font-mono">
                    {totalBudget > 0
                      ? `${((hoveredSlice.amount / totalBudget) * 100).toFixed(1)}% of total`
                      : '0%'}
                  </div>
                  <div className="text-[11px] text-slate-600 max-w-[130px] truncate mx-auto font-medium">
                    {hoveredSlice.name}
                  </div>
                </div>
              ) : (
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                    {scope === 'day' ? `Day ${itinerary.days[activeDayIndex]?.dayNumber || 1} Total` : 'Full Trip Total'}
                  </span>
                  <div className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
                    ₹{totalBudget.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {slices.length} segment{slices.length === 1 ? '' : 's'}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Notice */}
          <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-1 font-mono">
            <Compass className="w-3 h-3" />
            <span>Hover segments to inspect cost contribution</span>
          </div>
        </div>

        {/* Detailed Breakdown Legend Table */}
        <div className="md:col-span-7 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono px-1 pb-1 border-b border-slate-100">
            <span>Cost Item & Distance / Details</span>
            <div className="flex items-center gap-4">
              <span>Amount</span>
              <span className="w-12 text-right">Share</span>
            </div>
          </div>

          <div className="max-h-[260px] overflow-y-auto space-y-1.5 pr-1 text-xs">
            {slices.map((slice) => {
              const isHovered = slice.id === hoveredSliceId;
              const percent = totalBudget > 0 ? (slice.amount / totalBudget) * 100 : 0;
              const color = colorScale(slice.id);

              return (
                <div
                  key={slice.id}
                  onMouseEnter={() => setHoveredSliceId(slice.id)}
                  onMouseLeave={() => setHoveredSliceId(null)}
                  onClick={() => {
                    if (slice.destinationId && onSelectDestination) {
                      const found = itinerary.days
                        .flatMap((day) => day.items)
                        .find((item) => item.destination.id === slice.destinationId);
                      if (found) {
                        onSelectDestination(found.destination);
                      }
                    } else if (slice.category === 'travel_segment' && slice.itemId && onOpenSegmentComparison) {
                      onOpenSegmentComparison(slice.itemId, slice.dayNumber || 1);
                    }
                  }}
                  className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isHovered
                      ? 'bg-slate-50 border-indigo-300 shadow-xs ring-1 ring-indigo-200'
                      : 'border-slate-150 hover:bg-slate-50/70 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {/* Color square / icon badge */}
                    <div
                      className="w-3 h-3 rounded-xs shrink-0"
                      style={{ backgroundColor: color }}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-800 truncate" title={slice.name}>
                          {slice.name}
                        </span>
                        {slice.category === 'activity' && (
                          <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1 rounded font-medium">
                            Activity
                          </span>
                        )}
                        {slice.category === 'travel_segment' && (
                          <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1 rounded font-medium flex items-center gap-0.5">
                            Transit
                            {onOpenSegmentComparison && slice.itemId && (
                              <span className="ml-1 text-[9px] text-indigo-600 underline font-semibold">
                                Compare
                              </span>
                            )}
                          </span>
                        )}
                        {slice.category === 'dining' && (
                          <span className="text-[9px] bg-amber-50 text-amber-700 px-1 rounded font-medium">
                            Dining
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {slice.details}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono font-bold text-slate-900 tabular-nums">
                      ₹{slice.amount.toLocaleString('en-IN')}
                    </span>
                    <span className="font-mono text-[11px] text-slate-500 w-12 text-right tabular-nums">
                      {percent.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}

            {freeDestinationsCount > 0 && (
              <div className="p-2 rounded-lg bg-emerald-50/60 border border-emerald-150 text-[11px] text-emerald-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Ticket className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    {freeDestinationsCount} Free Admission destination(s) included in this schedule (₹0 entry fee)
                  </span>
                </div>
                <span className="font-semibold font-mono text-emerald-700">₹0</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Tooltip */}
      {tooltip.visible && tooltip.slice && (
        <div
          className="absolute z-50 pointer-events-none bg-slate-900 text-white rounded-lg p-2.5 text-xs shadow-lg space-y-1 transform -translate-x-1/2 -translate-y-full mb-3 min-w-[180px]"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y - 10}px`,
          }}
        >
          <div className="flex items-center justify-between gap-2 border-b border-slate-700 pb-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              {tooltip.slice.categoryLabel}
            </span>
            <span className="font-mono font-bold text-amber-300">
              {tooltip.percent.toFixed(1)}%
            </span>
          </div>
          <div className="font-bold text-white leading-tight">
            {tooltip.slice.name}
          </div>
          <div className="flex items-center justify-between pt-0.5 text-[11px]">
            <span className="text-slate-300">{tooltip.slice.details}</span>
            <span className="font-mono font-extrabold text-white">
              ₹{tooltip.slice.amount.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
