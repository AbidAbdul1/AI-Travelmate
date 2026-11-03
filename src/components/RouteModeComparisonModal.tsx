import React, { useState, useEffect } from 'react';
import {
  SegmentRouteComparison,
  TravelModeOption,
  SegmentTravelMode,
  Destination,
  ItineraryPlan,
} from '../types/travel';
import {
  Car,
  Bus,
  Bike,
  Footprints,
  Clock,
  IndianRupee,
  Sparkles,
  Leaf,
  Check,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  X,
  Compass,
  ArrowDownUp,
  Percent,
  Plane,
  Train,
} from 'lucide-react';

interface RouteModeComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  segmentData: {
    segmentId: string;
    dayNumber: number;
    orderNumber: number;
    fromName: string;
    toName: string;
    distanceKm: number;
    currentMode?: SegmentTravelMode;
    currentTimeMin?: number;
    departureTime?: string;
  } | null;
  onSelectMode: (segmentId: string, selectedOption: TravelModeOption) => void;
}

export const RouteModeComparisonModal: React.FC<RouteModeComparisonModalProps> = ({
  isOpen,
  onClose,
  segmentData,
  onSelectMode,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [comparison, setComparison] = useState<SegmentRouteComparison | null>(null);
  const [selectedModeState, setSelectedModeState] = useState<SegmentTravelMode>('driving');

  useEffect(() => {
    if (!isOpen || !segmentData) return;

    const initialMode = segmentData.currentMode || 'driving';
    setSelectedModeState(initialMode);

    const fetchComparison = async () => {
      setLoading(true);
      try {
        const resp = await fetch('/api/routes/compare-modes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            distanceKm: segmentData.distanceKm,
            departureTime: segmentData.departureTime || '09:00',
            currentMode: initialMode,
          }),
        });
        const data = await resp.json();
        if (resp.ok && data.success) {
          setComparison({
            segmentId: segmentData.segmentId,
            dayNumber: segmentData.dayNumber,
            fromName: segmentData.fromName,
            toName: segmentData.toName,
            fromLocation: { latitude: 0, longitude: 0, name: segmentData.fromName },
            toLocation: { latitude: 0, longitude: 0, name: segmentData.toName },
            distanceKm: data.distanceKm,
            currentMode: initialMode,
            options: data.options,
            recommendedMode: data.recommendedMode,
            recommendationExplanation: data.recommendationExplanation,
          });
        }
      } catch (err) {
        console.error('Failed to load mode comparisons:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchComparison();
  }, [isOpen, segmentData]);

  if (!isOpen || !segmentData) return null;

  const handleApplyMode = (option: TravelModeOption) => {
    setSelectedModeState(option.mode);
    onSelectMode(segmentData.segmentId, option);
    onClose();
  };

  const getModeIcon = (mode: SegmentTravelMode) => {
    switch (mode) {
      case 'driving':
        return <Car className="w-5 h-5 text-indigo-600" />;
      case 'transit':
        return <Bus className="w-5 h-5 text-emerald-600" />;
      case 'auto_rickshaw':
        return <Compass className="w-5 h-5 text-amber-600" />;
      case 'two_wheeler':
        return <Bike className="w-5 h-5 text-sky-600" />;
      case 'walking':
        return <Footprints className="w-5 h-5 text-emerald-700" />;
      case 'flight':
        return <Plane className="w-5 h-5 text-sky-600" />;
      case 'train':
        return <Train className="w-5 h-5 text-indigo-700" />;
      default:
        return <Car className="w-5 h-5 text-slate-600" />;
    }
  };

  // Find max values for visual benchmark bars
  const maxCost = comparison ? Math.max(...comparison.options.map((o) => o.costINR), 1) : 100;
  const maxDuration = comparison ? Math.max(...comparison.options.map((o) => o.durationMin), 1) : 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header Bar */}
        <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 font-mono">
                Day {segmentData.dayNumber} · Segment #{segmentData.orderNumber}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                ~{segmentData.distanceKm} km stretch
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-1 flex items-center gap-2">
              <span>{segmentData.fromName}</span>
              <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{segmentData.toName}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Compare side-by-side cost, travel duration, traffic delays, and environmental footprint across modes.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            title="Close comparison"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-mono">
                Calculating multi-mode route times, transit fares, and ML congestion delays...
              </p>
            </div>
          ) : comparison ? (
            <>
              {/* AI Recommendation Banner */}
              {comparison.recommendationExplanation && (
                <div className="p-3.5 bg-indigo-50/80 border border-indigo-150 rounded-xl flex items-start gap-3 text-xs text-indigo-950">
                  <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-indigo-900">
                      Smart Route Recommendation:
                    </span>{' '}
                    <span>{comparison.recommendationExplanation}</span>
                  </div>
                </div>
              )}

              {/* Side-by-Side Travel Modes Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {comparison.options.map((option) => {
                  const isCurrent = option.mode === selectedModeState;
                  const isRecommended = option.mode === comparison.recommendedMode;

                  // Benchmark percentages
                  const costPct = Math.round((option.costINR / maxCost) * 100);
                  const durPct = Math.round((option.durationMin / maxDuration) * 100);

                  return (
                    <div
                      key={option.mode}
                      className={`relative rounded-xl border p-4 flex flex-col justify-between transition-all ${
                        isCurrent
                          ? 'border-indigo-600 bg-indigo-50/20 ring-2 ring-indigo-500/20 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                      }`}
                    >
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-1 mb-3">
                        <div className="p-2 rounded-lg bg-slate-100">{getModeIcon(option.mode)}</div>
                        <div className="flex flex-col items-end gap-1">
                          {isCurrent && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white font-mono uppercase tracking-wider">
                              Active Mode
                            </span>
                          )}
                          {isRecommended && !isCurrent && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono uppercase tracking-wider flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5" /> Best Value
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Mode Name */}
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{option.label}</h3>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 min-h-[32px]">
                          {option.practicalNotes}
                        </p>
                      </div>

                      {/* Side-by-Side Core Metrics (Duration & Cost) */}
                      <div className="my-4 pt-3 border-t border-slate-100 space-y-3">
                        {/* Duration Metric */}
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-slate-500 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" /> Duration
                            </span>
                            <span className="font-mono font-bold text-slate-900 text-sm">
                              {option.durationMin} mins
                            </span>
                          </div>
                          {/* Duration progress bar */}
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-slate-800 rounded-full"
                              style={{ width: `${durPct}%` }}
                            />
                          </div>
                          {option.trafficDelayMin > 0 && (
                            <div className="text-[10px] text-amber-700 font-mono mt-1">
                              +{option.trafficDelayMin} mins peak congestion delay
                            </div>
                          )}
                        </div>

                        {/* Cost Metric */}
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-slate-500 flex items-center gap-1">
                              <IndianRupee className="w-3.5 h-3.5 text-slate-400" /> Est. Cost
                            </span>
                            <span className="font-mono font-bold text-slate-900 text-sm">
                              {option.costINR === 0 ? 'Free (₹0)' : `₹${option.costINR}`}
                            </span>
                          </div>
                          {/* Cost progress bar */}
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-600 rounded-full"
                              style={{ width: `${costPct}%` }}
                            />
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-1 truncate" title={option.costFormula}>
                            {option.costFormula}
                          </div>
                        </div>

                        {/* Platform Breakdown Badges (Uber / Rapido) */}
                        {option.platformEstimates && option.platformEstimates.length > 0 && (
                          <div className="space-y-1.5 pt-2 border-t border-slate-100">
                            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                              Platform Estimates:
                            </span>
                            <div className="space-y-1">
                              {option.platformEstimates.map((plat) => (
                                <div
                                  key={plat.serviceName}
                                  className="flex items-center justify-between text-[11px] p-1.5 rounded-md bg-slate-50 border border-slate-200/70"
                                >
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className={`text-[9px] px-1 py-0.2 rounded font-bold uppercase ${
                                        plat.platform === 'uber'
                                          ? 'bg-slate-900 text-white'
                                          : 'bg-amber-400 text-slate-950'
                                      }`}
                                    >
                                      {plat.platformName}
                                    </span>
                                    <span className="font-semibold text-slate-800">
                                      {plat.serviceName}
                                    </span>
                                  </div>
                                  <div className="text-right font-mono">
                                    <span className="font-bold text-slate-900">
                                      ₹{plat.estimatedCostMin}–₹{plat.estimatedCostMax}
                                    </span>
                                    <span className="text-[10px] text-slate-400 block">
                                      ETA ~{plat.etaArrivalMinutes}m
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Extra details (Transit lines or CO2) */}
                        <div className="pt-2 border-t border-slate-100/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                          <span className="flex items-center gap-1 text-emerald-700">
                            <Leaf className="w-3 h-3 text-emerald-500" />
                            {option.co2Kg} kg CO₂
                          </span>
                          <span>Rating: {option.convenienceRating}/5</span>
                        </div>

                        {/* Flight Facility & Long-Distance Details */}
                        {option.flightDetails && (
                          <div className="space-y-1.5 pt-2 border-t border-sky-100 bg-sky-50/50 p-2 rounded-lg">
                            <div className="flex items-center justify-between text-[11px] font-bold text-sky-900">
                              <span className="flex items-center gap-1">
                                <Plane className="w-3 h-3 text-sky-600" />
                                {option.flightDetails.departureAirport.code} ✈️ {option.flightDetails.arrivalAirport.code}
                              </span>
                              <span className="text-[10px] bg-sky-100 text-sky-800 px-1.5 py-0.2 rounded font-mono">
                                In-Flight: ~{Math.round(option.flightDetails.flightDurationMin / 60)}h {option.flightDetails.flightDurationMin % 60}m
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-600">
                              <div><strong>Departure:</strong> {option.flightDetails.departureAirport.name}</div>
                              <div><strong>Arrival:</strong> {option.flightDetails.arrivalAirport.name}</div>
                            </div>
                            <div className="text-[10px] text-sky-800 font-mono">
                              Airlines: {option.flightDetails.airlines.join(', ')}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              🧳 {option.flightDetails.baggageAllowance}
                            </div>
                            {option.flightDetails.aiRecommendation && (
                              <div className="text-[10px] bg-white p-1.5 rounded border border-sky-200 text-sky-900 italic">
                                ✨ {option.flightDetails.aiRecommendation}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Train / Rail Details */}
                        {option.trainDetails && (
                          <div className="space-y-1 pt-2 border-t border-indigo-100 bg-indigo-50/40 p-2 rounded-lg text-[10px]">
                            <div className="font-bold text-indigo-900 flex items-center gap-1">
                              <Train className="w-3 h-3 text-indigo-600" />
                              {option.trainDetails.trainType}
                            </div>
                            <div className="text-slate-600">
                              {option.trainDetails.departureStation} ➔ {option.trainDetails.arrivalStation}
                            </div>
                            <div className="text-indigo-800 font-mono">
                              Sleeper: ₹{option.trainDetails.fareINR.sleeper} | 3AC: ₹{option.trainDetails.fareINR.thirdAC} | CC: ₹{option.trainDetails.fareINR.chairCar}
                            </div>
                          </div>
                        )}

                        {option.transitLineInfo && !option.flightDetails && !option.trainDetails && (
                          <div className="text-[10px] p-1.5 bg-emerald-50 text-emerald-800 rounded font-mono">
                            Line: {option.transitLineInfo}
                          </div>
                        )}
                      </div>

                      {/* Select / Switch Action Button */}
                      <button
                        onClick={() => handleApplyMode(option)}
                        className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                          isCurrent
                            ? 'bg-indigo-600 text-white cursor-default'
                            : 'bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700'
                        }`}
                      >
                        {isCurrent ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Currently Active</span>
                          </>
                        ) : (
                          <>
                            <span>Select Mode</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* DEDICATED PLATFORM COMPARISON: UBER (CAR) VS RAPIDO (BIKE) */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-4 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-amber-50 text-amber-700 font-bold text-xs">
                      ⚡ App Pricing
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        Platform Fare Breakdown: Uber vs. Rapido
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Estimated ride fares for this ~{segmentData.distanceKm} km segment modeled on live platform pricing algorithms
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded font-mono">
                    Real-time traffic calibrated
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Uber Car Column */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-950 text-white font-mono">
                          UBER
                        </span>
                        <span className="text-xs font-bold text-slate-900">Car (Uber Go)</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-900">
                        {(() => {
                          const carOpt = comparison.options.find((o) => o.mode === 'driving');
                          const uber = carOpt?.platformEstimates?.find((p) => p.serviceName === 'Uber Go');
                          return uber ? `₹${uber.estimatedCostMin}–₹${uber.estimatedCostMax}` : `₹${carOpt?.costINR || 140}`;
                        })()}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600 space-y-1 font-mono">
                      <div className="flex justify-between">
                        <span>Base Fare:</span>
                        <span>₹45</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Distance Rate:</span>
                        <span>₹14.50 / km</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ride Time:</span>
                        <span>₹1.50 / min</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Platform & Safety Fee:</span>
                        <span>₹18</span>
                      </div>
                      <div className="flex justify-between text-indigo-700 font-semibold pt-1 border-t border-slate-200">
                        <span>Surge Factor:</span>
                        <span>
                          {comparison.options.find((o) => o.mode === 'driving')?.platformEstimates?.[0]?.surgeMultiplier || 1.0}x
                        </span>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200 flex items-center justify-between">
                      <span>ETA: ~3 mins away</span>
                      <span className="text-emerald-700 font-medium">AC Hatchback</span>
                    </div>
                  </div>

                  {/* Rapido Bike Column */}
                  <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-950 font-mono">
                          RAPIDO
                        </span>
                        <span className="text-xs font-bold text-slate-900">Bike Taxi</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-amber-900">
                        {(() => {
                          const bikeOpt = comparison.options.find((o) => o.mode === 'two_wheeler');
                          const rapido = bikeOpt?.platformEstimates?.find((p) => p.serviceName === 'Rapido Bike Taxi');
                          return rapido ? `₹${rapido.estimatedCostMin}–₹${rapido.estimatedCostMax}` : `₹${bikeOpt?.costINR || 60}`;
                        })()}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600 space-y-1 font-mono">
                      <div className="flex justify-between">
                        <span>Base Fare (first 1.5 km):</span>
                        <span>₹20</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Distance Rate:</span>
                        <span>₹9.00 / km</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ride Time:</span>
                        <span>₹0.75 / min</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Platform Fee:</span>
                        <span>₹4</span>
                      </div>
                      <div className="flex justify-between text-amber-800 font-semibold pt-1 border-t border-amber-200/80">
                        <span>Surge Factor:</span>
                        <span>
                          {comparison.options.find((o) => o.mode === 'two_wheeler')?.platformEstimates?.[0]?.surgeMultiplier || 1.0}x
                        </span>
                      </div>
                    </div>

                    <div className="text-[10px] text-amber-800 pt-1 border-t border-amber-200/80 flex items-center justify-between">
                      <span>ETA: ~2 mins away</span>
                      <span className="font-semibold text-emerald-700">Helmet Included</span>
                    </div>
                  </div>

                  {/* Rapido / Uber Auto Column */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white font-mono">
                          AUTO
                        </span>
                        <span className="text-xs font-bold text-slate-900">Rapido / Uber Auto</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-900">
                        {(() => {
                          const autoOpt = comparison.options.find((o) => o.mode === 'auto_rickshaw');
                          const auto = autoOpt?.platformEstimates?.[0];
                          return auto ? `₹${auto.estimatedCostMin}–₹${auto.estimatedCostMax}` : `₹${autoOpt?.costINR || 90}`;
                        })()}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600 space-y-1 font-mono">
                      <div className="flex justify-between">
                        <span>Base Fare:</span>
                        <span>₹30</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Distance Rate:</span>
                        <span>₹14.00 / km</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Platform Fee:</span>
                        <span>₹7</span>
                      </div>
                      <div className="flex justify-between text-slate-700 font-semibold pt-1 border-t border-slate-200">
                        <span>Surge Factor:</span>
                        <span>
                          {comparison.options.find((o) => o.mode === 'auto_rickshaw')?.platformEstimates?.[0]?.surgeMultiplier || 1.0}x
                        </span>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200 flex items-center justify-between">
                      <span>ETA: ~3 mins away</span>
                      <span className="text-slate-700 font-medium">3 Seats Covered</span>
                    </div>
                  </div>
                </div>

                {/* Savings Callout Banner */}
                {(() => {
                  const carOpt = comparison.options.find((o) => o.mode === 'driving');
                  const bikeOpt = comparison.options.find((o) => o.mode === 'two_wheeler');
                  if (carOpt && bikeOpt) {
                    const savings = carOpt.costINR - bikeOpt.costINR;
                    const timeDiff = carOpt.durationMin - bikeOpt.durationMin;
                    return (
                      <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>
                            Rapido Bike Taxi saves <strong>₹{savings}</strong> (~{Math.round((savings / carOpt.costINR) * 100)}% cheaper than Uber Go)
                            {timeDiff > 0 ? ` and arrives ~${timeDiff} mins faster in traffic!` : '!'}
                          </span>
                        </div>
                        <span className="font-mono text-[11px] font-bold text-emerald-700">
                          Solo Traveler Pick
                        </span>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>

              {/* Side-by-side Comparative Analysis Table */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <ArrowDownUp className="w-3.5 h-3.5 text-slate-500" />
                  <span>Side-by-Side Trade-off Comparison Matrix</span>
                </h4>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500">
                        <th className="pb-2 font-medium">Travel Mode</th>
                        <th className="pb-2 font-medium">Est. Duration</th>
                        <th className="pb-2 font-medium">Est. Cost</th>
                        <th className="pb-2 font-medium">Cost Savings vs Cab</th>
                        <th className="pb-2 font-medium">Time Difference</th>
                        <th className="pb-2 font-medium">Carbon (CO₂)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/60 text-slate-700">
                      {comparison.options.map((opt) => {
                        const cabOption = comparison.options.find((o) => o.mode === 'driving');
                        const cabCost = cabOption ? cabOption.costINR : 100;
                        const cabDur = cabOption ? cabOption.durationMin : 20;

                        const costDiff = cabCost - opt.costINR;
                        const durDiff = opt.durationMin - cabDur;

                        return (
                          <tr
                            key={opt.mode}
                            className={`hover:bg-white/80 transition-colors ${
                              opt.mode === selectedModeState ? 'bg-indigo-50/50 font-semibold' : ''
                            }`}
                          >
                            <td className="py-2.5 pr-3 font-sans font-medium text-slate-900 flex items-center gap-2">
                              {getModeIcon(opt.mode)}
                              <span>{opt.label}</span>
                            </td>
                            <td className="py-2.5 pr-3">
                              <span className="font-bold text-slate-900">{opt.durationMin} mins</span>
                            </td>
                            <td className="py-2.5 pr-3">
                              <span className="font-bold text-slate-900">
                                {opt.costINR === 0 ? '₹0' : `₹${opt.costINR}`}
                              </span>
                            </td>
                            <td className="py-2.5 pr-3">
                              {costDiff > 0 ? (
                                <span className="text-emerald-700 font-bold">Save ₹{costDiff}</span>
                              ) : costDiff === 0 ? (
                                <span className="text-slate-400">Baseline</span>
                              ) : (
                                <span className="text-slate-500">+₹{Math.abs(costDiff)}</span>
                              )}
                            </td>
                            <td className="py-2.5 pr-3">
                              {durDiff < 0 ? (
                                <span className="text-emerald-700 font-bold">{Math.abs(durDiff)} min faster</span>
                              ) : durDiff === 0 ? (
                                <span className="text-slate-400">Baseline</span>
                              ) : (
                                <span className="text-amber-700">+{durDiff} min slower</span>
                              )}
                            </td>
                            <td className="py-2.5">
                              <span className="text-slate-600">{opt.co2Kg} kg</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="py-10 text-center text-xs text-slate-500">
              No comparison metrics available for this segment.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 text-xs text-slate-500">
          <span>
            Selecting a mode updates the itinerary segment duration and recalculates the D3 Budget Pie Chart.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
