import React, { useState } from 'react';
import { CostEstimationBreakdown } from '../types/travel';
import { useLanguage } from '../context/LanguageContext';
import {
  Sparkles,
  Ticket,
  Car,
  Utensils,
  Hotel,
  ShieldAlert,
  HelpCircle,
  Lightbulb,
  Users,
  Calendar,
  RefreshCw,
  TrendingDown,
  Info,
  Copy,
  Check,
  Share2,
  FileText,
} from 'lucide-react';

interface AICostEstimationCardProps {
  estimation: CostEstimationBreakdown | null;
  isLoading: boolean;
  onRefresh: () => void;
  onUpdateParams?: (params: { travelersCount?: number; tripDurationDays?: number; travelStyle?: 'budget' | 'moderate' | 'luxury' }) => void;
  customBudgetAmount?: number;
  onOpenExportSheet?: () => void;
}

export const AICostEstimationCard: React.FC<AICostEstimationCardProps> = ({
  estimation,
  isLoading,
  onRefresh,
  onUpdateParams,
  customBudgetAmount,
  onOpenExportSheet,
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'breakdown' | 'tips' | 'platforms'>('breakdown');
  const [copied, setCopied] = useState(false);

  if (isLoading && !estimation) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-indigo-100" />
          <div className="h-5 bg-slate-200 rounded w-48" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-lg" />
          ))}
        </div>
        <div className="h-24 bg-slate-100 rounded-lg" />
      </div>
    );
  }

  if (!estimation) {
    return null;
  }

  const {
    currencySymbol,
    totalEstimatedCost,
    costPerPerson,
    travelersCount,
    tripDurationDays,
    travelStyle,
    categories,
    aiSummary,
    budgetTips,
    isAiGenerated,
  } = estimation;

  const total = totalEstimatedCost || 1;
  const entrancePct = Math.round((categories.entranceFees.amount / total) * 100);
  const travelPct = Math.round((categories.travelCost.amount / total) * 100);
  const foodPct = Math.round((categories.foodAndDining.amount / total) * 100);
  const shelterPct = Math.round((categories.shelterAccommodation.amount / total) * 100);
  const otherPct = Math.round((categories.otherExpenses.amount / total) * 100);

  const handleCopySummary = () => {
    const summaryText = `🌍 AI-TRAVELMATE Travel Budget Breakdown
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 Total Estimated Budget: ${currencySymbol}${totalEstimatedCost.toLocaleString()} (${currencySymbol}${costPerPerson.toLocaleString()} per person)
👥 Travelers: ${travelersCount} | 📅 Duration: ${tripDurationDays} Day(s) | Tier: ${travelStyle.toUpperCase()}

📊 Categorized Expense Breakdown:
• Entrance & Tickets: ${currencySymbol}${categories.entranceFees.amount.toLocaleString()}
• Travel Transport: ${currencySymbol}${categories.travelCost.amount.toLocaleString()} (~${categories.travelCost.distanceKm} km, Uber: ${currencySymbol}${categories.travelCost.platformEstimates?.uber?.toLocaleString() || 'N/A'}, Rapido: ${currencySymbol}${categories.travelCost.platformEstimates?.rapido?.toLocaleString() || 'N/A'})
• Food & Dining: ${currencySymbol}${categories.foodAndDining.amount.toLocaleString()} (~${currencySymbol}${categories.foodAndDining.dailyAverage?.toLocaleString() || 'N/A'}/day)
• Shelter / Lodging: ${currencySymbol}${categories.shelterAccommodation.amount.toLocaleString()} (${categories.shelterAccommodation.nights} night(s))
• Miscellaneous Buffer: ${currencySymbol}${categories.otherExpenses.amount.toLocaleString()}

💡 Top AI Budget Saving Tips:
${budgetTips?.map((tip, i) => `${i + 1}. ${tip}`).join('\n')}

Plan generated with AI-TRAVELMATE`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.04)] overflow-hidden">
      {/* Header Banner - Sleek Dark Slate */}
      <div className="bg-slate-950 text-white p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-indigo-500/20 text-indigo-400">
                <Sparkles className="w-4 h-4" />
              </span>
              <h3 className="font-display text-base sm:text-lg font-extrabold text-white tracking-tight">
                {t('costEstimationTitle', 'AI Trip Cost Intelligence')}
              </h3>
              {isAiGenerated && (
                <span className="text-[10px] uppercase font-bold tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-400/30">
                  Gemini Verified
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              {t('costEstimationSubtitle', 'Granular breakdown of Entrance Tickets, Transit, Food & Dining, Accommodation, and Buffer.')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-300 block">
                {t('totalTripBudget', 'Total Estimated Budget')}
              </span>
              <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white">
                {currencySymbol}{totalEstimatedCost.toLocaleString()}
              </span>
              <span className="text-xs text-indigo-200 block font-mono">
                {currencySymbol}{costPerPerson.toLocaleString()} {t('perPerson', 'per person')}
              </span>
              {customBudgetAmount && customBudgetAmount > 0 && (
                <div className="mt-1">
                  {totalEstimatedCost <= customBudgetAmount ? (
                    <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-1.5 py-0.5 rounded">
                      ✓ Under budget by {currencySymbol}{(customBudgetAmount - totalEstimatedCost).toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30 px-1.5 py-0.5 rounded">
                      ⚠️ Exceeds target by {currencySymbol}{(totalEstimatedCost - customBudgetAmount).toLocaleString()}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {onOpenExportSheet && (
                <button
                  onClick={onOpenExportSheet}
                  className="p-2 bg-white hover:bg-indigo-50 text-indigo-950 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold shadow-xs"
                  title="Download / Print Travel Sheet PDF"
                >
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span className="hidden sm:inline">Export PDF</span>
                </button>
              )}

              <button
                onClick={handleCopySummary}
                className="p-2 bg-indigo-700 hover:bg-indigo-600 text-white rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-medium"
                title="Copy Full Budget Breakdown to Clipboard"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4 text-indigo-200" />}
                <span className="hidden md:inline">{copied ? 'Copied!' : 'Share'}</span>
              </button>

              <button
                onClick={onRefresh}
                disabled={isLoading}
                className="p-2 bg-indigo-700 hover:bg-indigo-600 text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                title="Recalculate AI Cost Estimation"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Quick parameters adjustment strip */}
        <div className="mt-4 pt-3 border-t border-indigo-700/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 text-indigo-200">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-300" />
              <span>{travelersCount} Traveler(s)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-300" />
              <span>{tripDurationDays} Day(s)</span>
            </span>
            <span className="capitalize px-2 py-0.5 rounded bg-indigo-800/80 text-white font-medium">
              {travelStyle} Tier
            </span>
          </div>

          {/* Travel style fast toggles */}
          {onUpdateParams && (
            <div className="flex items-center gap-1 bg-indigo-950/60 p-0.5 rounded-lg border border-indigo-700/50">
              {(['budget', 'moderate', 'luxury'] as const).map((style) => (
                <button
                  key={style}
                  onClick={() => onUpdateParams({ travelStyle: style })}
                  className={`px-2 py-1 rounded text-[11px] font-medium capitalize transition-all cursor-pointer ${
                    travelStyle === style
                      ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                      : 'text-indigo-300 hover:text-white'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Visual Cost Ratio Bar */}
      <div className="w-full h-2.5 flex overflow-hidden bg-slate-100">
        <div style={{ width: `${entrancePct}%` }} className="bg-amber-500" title={`Entrance Fees: ${entrancePct}%`} />
        <div style={{ width: `${travelPct}%` }} className="bg-blue-600" title={`Travel Cost: ${travelPct}%`} />
        <div style={{ width: `${foodPct}%` }} className="bg-emerald-500" title={`Food & Dining: ${foodPct}%`} />
        <div style={{ width: `${shelterPct}%` }} className="bg-purple-600" title={`Shelter/Stay: ${shelterPct}%`} />
        <div style={{ width: `${otherPct}%` }} className="bg-slate-400" title={`Other Expenses: ${otherPct}%`} />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 px-5 pt-3 gap-4 text-xs font-medium">
        <button
          onClick={() => setActiveTab('breakdown')}
          className={`pb-2.5 transition-colors cursor-pointer border-b-2 ${
            activeTab === 'breakdown'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Categorized Breakdown
        </button>
        <button
          onClick={() => setActiveTab('platforms')}
          className={`pb-2.5 transition-colors cursor-pointer border-b-2 ${
            activeTab === 'platforms'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Travel Mode & Aggregators (Uber / Rapido)
        </button>
        <button
          onClick={() => setActiveTab('tips')}
          className={`pb-2.5 transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 ${
            activeTab === 'tips'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          <span>AI Money-Saving Tips ({budgetTips?.length || 0})</span>
        </button>
      </div>

      {/* Body Content */}
      <div className="p-5">
        {activeTab === 'breakdown' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Category 1: Entrance Fees */}
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <Ticket className="w-3.5 h-3.5 text-amber-600" />
                      {t('entranceFeesCategory', 'Entrance Fees')}
                    </span>
                    <span className="font-mono font-bold text-slate-900">
                      {currencySymbol}{categories.entranceFees.amount.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    {categories.entranceFees.explanation}
                  </p>
                </div>
                {categories.entranceFees.items && categories.entranceFees.items.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-200/70 space-y-1">
                    {categories.entranceFees.items.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-600 truncate max-w-[140px]">{item.name}</span>
                        <span className="font-mono text-slate-800">{currencySymbol}{item.amount}</span>
                      </div>
                    ))}
                    {categories.entranceFees.items.length > 3 && (
                      <span className="text-[10px] text-indigo-600 block">
                        +{categories.entranceFees.items.length - 3} more place(s)
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Category 2: Travel & Transportation */}
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5 text-blue-600" />
                      {t('travelCostCategory', 'Travel Cost')}
                    </span>
                    <span className="font-mono font-bold text-slate-900">
                      {currencySymbol}{categories.travelCost.amount.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    {categories.travelCost.explanation}
                  </p>
                </div>
                <div className="mt-2.5 pt-2 border-t border-slate-200/70 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Circuit Distance</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {categories.travelCost.distanceKm} km
                  </span>
                </div>
              </div>

              {/* Category 3: Food & Dining */}
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <Utensils className="w-3.5 h-3.5 text-emerald-600" />
                      {t('foodDiningCategory', 'Food & Dining')}
                    </span>
                    <span className="font-mono font-bold text-slate-900">
                      {currencySymbol}{categories.foodAndDining.amount.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    {categories.foodAndDining.explanation}
                  </p>
                </div>
                <div className="mt-2.5 pt-2 border-t border-slate-200/70 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Daily Average</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {currencySymbol}{categories.foodAndDining.dailyAverage} / day
                  </span>
                </div>
              </div>

              {/* Category 4: Shelter / Accommodation */}
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <Hotel className="w-3.5 h-3.5 text-purple-600" />
                      {t('shelterAccommodationCategory', 'Shelter & Stay')}
                    </span>
                    <span className="font-mono font-bold text-slate-900">
                      {currencySymbol}{categories.shelterAccommodation.amount.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    {categories.shelterAccommodation.explanation}
                  </p>
                </div>
                <div className="mt-2.5 pt-2 border-t border-slate-200/70 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Tier: {categories.shelterAccommodation.tier}</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {categories.shelterAccommodation.nights} night(s)
                  </span>
                </div>
              </div>

              {/* Category 5: Other & Miscellaneous */}
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col justify-between sm:col-span-2">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-slate-600" />
                      {t('otherExpensesCategory', 'Other & Miscellaneous Buffer')}
                    </span>
                    <span className="font-mono font-bold text-slate-900">
                      {currencySymbol}{categories.otherExpenses.amount.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    {categories.otherExpenses.explanation}
                  </p>
                </div>
                {categories.otherExpenses.breakdown && (
                  <div className="mt-2.5 pt-2 border-t border-slate-200/70 grid grid-cols-3 gap-2 text-[11px]">
                    {categories.otherExpenses.breakdown.map((item, idx) => (
                      <div key={idx} className="bg-white p-1.5 rounded border border-slate-200 text-center">
                        <span className="text-[10px] text-slate-500 block truncate">{item.name}</span>
                        <span className="font-mono font-semibold text-slate-800">{currencySymbol}{item.amount}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* AI Travel Economics Summary Box */}
            <div className="bg-indigo-50/70 border border-indigo-100 rounded-lg p-3.5 text-xs text-indigo-950 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-indigo-900 block mb-0.5">
                  {t('aiSummaryTitle', 'Travel Economics Summary')}
                </span>
                <p className="text-indigo-800 leading-relaxed">
                  {aiSummary}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Travel Mode & Platforms Tab */}
        {activeTab === 'platforms' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Side-by-side travel transport costs calculated across commercial platforms and personal vehicles for this circuit (~{categories.travelCost.distanceKm} km):
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Uber Cab */}
              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-1">
                  <span>Uber Go / Cab</span>
                  <span className="font-mono text-indigo-600">
                    {currencySymbol}{categories.travelCost.platformEstimates?.uber?.toLocaleString() || categories.travelCost.amount}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Comfortable air-conditioned door-to-door cab. Ideal for families and group travel.
                </p>
                <div className="mt-2 text-[10px] text-slate-400 font-mono">
                  Base ₹60 + ₹19.5/km
                </div>
              </div>

              {/* Rapido Bike */}
              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-1">
                  <span>Rapido Bike / Auto</span>
                  <span className="font-mono text-indigo-600">
                    {currencySymbol}{categories.travelCost.platformEstimates?.rapido?.toLocaleString() || Math.round(categories.travelCost.amount * 0.55)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Fastest urban navigation to bypass rush hour congestion at Indrakeeladri and Bandar road.
                </p>
                <div className="mt-2 text-[10px] text-slate-400 font-mono">
                  Base ₹25 + ₹10.5/km
                </div>
              </div>

              {/* Personal Car Fuel */}
              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-1">
                  <span>Car Fuel & Toll</span>
                  <span className="font-mono text-indigo-600">
                    {currencySymbol}{categories.travelCost.platformEstimates?.fuel?.toLocaleString() || Math.round(categories.travelCost.amount * 0.7)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Self-driven petrol/diesel estimation at 13.5 km/L plus highway toll bridge fee where applicable.
                </p>
                <div className="mt-2 text-[10px] text-slate-400 font-mono">
                  Petrol ₹104/L + parking
                </div>
              </div>

              {/* Public Transit */}
              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-1">
                  <span>Public Bus / Metro</span>
                  <span className="font-mono text-indigo-600">
                    {currencySymbol}{categories.travelCost.platformEstimates?.publicTransit?.toLocaleString() || Math.round(categories.travelCost.amount * 0.35)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  State RTC / city buses and Krishna river ferries. Most economical option for single travelers.
                </p>
                <div className="mt-2 text-[10px] text-slate-400 font-mono">
                  ₹35/segment average
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Budget Tips Tab */}
        {activeTab === 'tips' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-1">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>{t('budgetTipsTitle', 'AI Smart Budget Saving Tips')}</span>
            </div>

            <div className="space-y-2">
              {budgetTips && budgetTips.map((tip, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50/60 border border-amber-200/60 text-xs text-amber-950">
                  <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    {idx + 1}
                  </span>
                  <p className="leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
