import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  Copy,
  Check,
  FileText,
  Calendar,
  MapPin,
  IndianRupee,
  Compass,
  PhoneCall,
  Clock,
  Car,
  AlertCircle,
  ShieldCheck,
  Sun,
  Umbrella,
  Shirt,
  Sparkles,
} from 'lucide-react';
import {
  ItineraryPlan,
  CostEstimationBreakdown,
  WeatherData,
  PackingItem,
  Destination,
} from '../types/travel';
import { generatePackingList } from '../utils/packingListGenerator';

interface TripExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  itinerary: ItineraryPlan | null;
  costEstimation: CostEstimationBreakdown | null;
  weather: WeatherData | null;
  customBudgetAmount?: number;
  currencySymbol?: string;
  onOpenPackingList?: () => void;
}

export const TripExportModal: React.FC<TripExportModalProps> = ({
  isOpen,
  onClose,
  itinerary,
  costEstimation,
  weather,
  customBudgetAmount,
  currencySymbol = '₹',
  onOpenPackingList,
}) => {
  const [copied, setCopied] = useState(false);
  const [downloadingHtml, setDownloadingHtml] = useState(false);

  if (!isOpen || !itinerary) return null;

  const allDestinations: Destination[] = itinerary.days.flatMap((d) => d.items.map((it) => it.destination));
  const daysCount = itinerary.days.length;
  const travelers = costEstimation?.travelersCount || 1;
  const tempC = weather?.current?.temperatureC ?? 32;
  const precipProb = weather?.current?.precipitationProbability ?? 15;
  const weatherDesc = weather?.current?.weatherDescription || 'Mainly clear';

  // Packing list items for offline export
  const packingItems = generatePackingList(daysCount, weather, allDestinations, travelers);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyMarkdown = () => {
    let md = `# 🗺️ ${itinerary.title}\n\n`;
    md += `**Starting Point:** ${itinerary.startingLocation.name}\n`;
    md += `**Duration:** ${daysCount} Day(s) | **Total Stops:** ${itinerary.totalDestinations}\n`;
    if (costEstimation) {
      md += `**Estimated Cost:** ${currencySymbol}${costEstimation.totalEstimatedCost.toLocaleString()} (${currencySymbol}${costEstimation.costPerPerson.toLocaleString()} / person)\n`;
    }
    if (customBudgetAmount) {
      md += `**Target Budget:** ${currencySymbol}${customBudgetAmount.toLocaleString()}\n`;
    }
    md += `\n---\n\n## 📅 Daily Itinerary Agenda\n\n`;

    itinerary.days.forEach((day) => {
      md += `### ${day.date} (~${day.totalDistanceKm} km, ~${Math.round(day.totalDurationMin / 60)} hrs)\n`;
      day.items.forEach((item) => {
        md += `- **[${item.timeSlot}] #${item.order} ${item.destination.name}** (${item.destination.category})\n`;
        md += `  - Address: ${item.destination.address}\n`;
        md += `  - Fee: ${item.destination.feeINR === 0 ? 'Free' : currencySymbol + item.destination.feeINR} | Duration: ${item.durationMin} mins\n`;
        if (item.travelDistanceFromPreviousKm) {
          md += `  - Transit: ~${item.travelDistanceFromPreviousKm} km via ${item.travelMode || 'driving'} (~${item.travelTimeFromPreviousMin || 15} mins)\n`;
        }
      });
      md += `\n`;
    });

    if (costEstimation) {
      md += `## 💰 Estimated Cost Breakdown\n\n`;
      md += `- **Entrance Fees:** ${currencySymbol}${costEstimation.categories.entranceFees.amount.toLocaleString()}\n`;
      md += `- **Transport & Commute:** ${currencySymbol}${costEstimation.categories.travelCost.amount.toLocaleString()} (~${costEstimation.categories.travelCost.distanceKm} km)\n`;
      md += `- **Food & Dining:** ${currencySymbol}${costEstimation.categories.foodAndDining.amount.toLocaleString()} (~${currencySymbol}${costEstimation.categories.foodAndDining.dailyAverage}/day)\n`;
      md += `- **Shelter / Accommodation:** ${currencySymbol}${costEstimation.categories.shelterAccommodation.amount.toLocaleString()} (${costEstimation.categories.shelterAccommodation.nights} nights)\n`;
      md += `- **Other Buffer (10%):** ${currencySymbol}${costEstimation.categories.otherExpenses.amount.toLocaleString()}\n`;
      md += `\n**Total Estimated Cost:** ${currencySymbol}${costEstimation.totalEstimatedCost.toLocaleString()}\n\n`;
    }

    md += `## 🎒 Recommended Packing Checklist\n\n`;
    packingItems.forEach((pi) => {
      md += `- [ ] ${pi.title} (${pi.subtitle || ''})\n`;
    });

    md += `\n## 🚨 Emergency Contacts\n\n`;
    md += `- National Emergency: 112\n- Police: 100\n- Ambulance: 108\n- Women Helpline: 1091\n- Tourism Assistance: 1363\n\n`;
    md += `*Generated offline travel sheet from AI-TRAVELMATE on ${new Date().toLocaleDateString()}*`;

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadOfflineHtml = () => {
    setDownloadingHtml(true);

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${itinerary.title} - Offline Travel Sheet</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.5; color: #1e293b; background: #f8fafc; margin: 0; padding: 24px; }
    .sheet-card { max-width: 900px; margin: 0 auto; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header-title { font-size: 26px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 6px; }
    .meta-bar { display: flex; flex-wrap: wrap; gap: 12px; padding: 12px; background: #f1f5f9; border-radius: 8px; margin-bottom: 24px; font-size: 13px; }
    .meta-tag { display: inline-flex; align-items: center; gap: 4px; font-weight: 600; color: #334155; }
    .section-title { font-size: 18px; font-weight: 700; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 28px; margin-bottom: 14px; }
    .day-header { background: #4f46e5; color: white; padding: 8px 14px; border-radius: 6px; font-weight: 700; font-size: 14px; margin-top: 18px; margin-bottom: 10px; display: flex; justify-content: space-between; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 13px; }
    th { background: #f8fafc; text-align: left; padding: 8px 10px; border: 1px solid #e2e8f0; font-weight: 600; color: #475569; }
    td { padding: 8px 10px; border: 1px solid #e2e8f0; }
    .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 600; background: #e0e7ff; color: #3730a3; }
    .cost-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 20px; }
    .cost-box { border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px; background: #fafafa; }
    .cost-box-title { font-size: 11px; font-weight: 600; text-transform: uppercase; color: #64748b; }
    .cost-box-value { font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 4px; }
    .check-list { column-count: 2; column-gap: 24px; list-style: none; padding-left: 0; font-size: 12px; }
    .check-item { margin-bottom: 8px; break-inside: avoid; display: flex; align-items: flex-start; gap: 8px; }
    .emergency-box { background: #fff1f2; border: 1px solid #fecdd3; border-radius: 8px; padding: 14px; margin-top: 24px; font-size: 13px; }
    .print-btn { display: inline-block; background: #4f46e5; color: white; border: none; padding: 10px 18px; font-weight: 600; border-radius: 6px; cursor: pointer; text-decoration: none; margin-bottom: 16px; }
    @media print {
      body { background: white; padding: 0; }
      .sheet-card { border: none; box-shadow: none; padding: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="sheet-card">
    <div class="no-print" style="margin-bottom: 16px;">
      <button class="print-btn" onclick="window.print()">🖨️ Print or Save as PDF</button>
      <span style="font-size: 13px; color: #64748b; margin-left: 12px;">Saved locally for offline access. No internet required.</span>
    </div>

    <h1 class="header-title">🗺️ ${itinerary.title}</h1>
    <div class="meta-bar">
      <div class="meta-tag">📍 Starting Point: <strong>${itinerary.startingLocation.name}</strong></div>
      <div class="meta-tag">📅 Duration: <strong>${daysCount} Day(s)</strong></div>
      <div class="meta-tag">🏁 Total Stops: <strong>${itinerary.totalDestinations} Places</strong></div>
      <div class="meta-tag">👥 Group: <strong>${travelers} Traveler(s)</strong></div>
      <div class="meta-tag">☀️ Weather: <strong>${tempC}°C (${weatherDesc})</strong></div>
    </div>

    <div class="section-title">📅 Detailed Multi-Day Agenda</div>
    ${itinerary.days
      .map(
        (day) => `
      <div class="day-header">
        <span>${day.date}</span>
        <span>~${day.totalDistanceKm} km • ~${Math.round(day.totalDurationMin / 60)} hrs</span>
      </div>
      <table>
        <thead>
          <tr>
            <th style="width: 50px;">Stop</th>
            <th style="width: 110px;">Time Slot</th>
            <th>Attraction & Location</th>
            <th>Category</th>
            <th>Ticket Fee</th>
            <th>Transit to Next</th>
          </tr>
        </thead>
        <tbody>
          ${day.items
            .map(
              (item) => `
            <tr>
              <td style="font-weight: 700; text-align: center;">#${item.order}</td>
              <td style="font-family: monospace;">${item.timeSlot}</td>
              <td>
                <strong>${item.destination.name}</strong><br/>
                <span style="font-size: 11px; color: #64748b;">${item.destination.address}</span>
              </td>
              <td><span class="badge">${item.destination.category}</span></td>
              <td>${item.destination.feeINR === 0 ? 'Free' : currencySymbol + item.destination.feeINR}</td>
              <td style="font-size: 11px; color: #475569;">
                ${
                  item.travelDistanceFromPreviousKm
                    ? `~${item.travelDistanceFromPreviousKm} km via ${item.travelMode || 'driving'} (~${item.travelTimeFromPreviousMin || 15}m)`
                    : 'Origin stop'
                }
              </td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    `
      )
      .join('')}

    ${
      costEstimation
        ? `
      <div class="section-title">💰 Cost Estimation & Budget Summary</div>
      <div class="cost-grid">
        <div class="cost-box">
          <div class="cost-box-title">Entrance Tickets</div>
          <div class="cost-box-value">${currencySymbol}${costEstimation.categories.entranceFees.amount.toLocaleString()}</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 4px;">For ${costEstimation.categories.entranceFees.items.length} destination(s)</div>
        </div>
        <div class="cost-box">
          <div class="cost-box-title">Transport & Rides</div>
          <div class="cost-box-value">${currencySymbol}${costEstimation.categories.travelCost.amount.toLocaleString()}</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 4px;">~${costEstimation.categories.travelCost.distanceKm} km circuit</div>
        </div>
        <div class="cost-box">
          <div class="cost-box-title">Food & Dining</div>
          <div class="cost-box-value">${currencySymbol}${costEstimation.categories.foodAndDining.amount.toLocaleString()}</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 4px;">~${currencySymbol}${costEstimation.categories.foodAndDining.dailyAverage}/day allowance</div>
        </div>
        <div class="cost-box">
          <div class="cost-box-title">Hotels / Shelter</div>
          <div class="cost-box-value">${currencySymbol}${costEstimation.categories.shelterAccommodation.amount.toLocaleString()}</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 4px;">${costEstimation.categories.shelterAccommodation.nights} night(s) lodging</div>
        </div>
        <div class="cost-box" style="border-color: #6366f1; background: #eef2ff;">
          <div class="cost-box-title" style="color: #4f46e5;">Grand Total (${daysCount} Days)</div>
          <div class="cost-box-value" style="color: #312e81;">${currencySymbol}${costEstimation.totalEstimatedCost.toLocaleString()}</div>
          <div style="font-size: 11px; color: #4338ca; margin-top: 4px;">${currencySymbol}${costEstimation.costPerPerson.toLocaleString()} per person</div>
        </div>
      </div>
    `
        : ''
    }

    <div class="section-title">🎒 Recommended Packing Essentials</div>
    <ul class="check-list">
      ${packingItems
        .map(
          (item) => `
        <li class="check-item">
          <input type="checkbox" style="margin-top: 2px;" />
          <div>
            <strong>${item.title}</strong><br/>
            <span style="color: #64748b;">${item.subtitle || ''}</span>
          </div>
        </li>
      `
        )
        .join('')}
    </ul>

    <div class="emergency-box">
      <strong style="color: #9f1239; font-size: 14px;">🚨 Local Emergency & Travel Assistance</strong>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 8px; margin-top: 8px;">
        <div>National Emergency: <strong>112</strong></div>
        <div>Police Control: <strong>100 / 112</strong></div>
        <div>Ambulance: <strong>108</strong></div>
        <div>Women Helpline: <strong>1091</strong></div>
        <div>Tourism Helpline: <strong>1363</strong></div>
      </div>
      <div style="font-size: 11px; color: #be123c; margin-top: 8px;">
        Tip: Keep a printed paper copy of this sheet inside your travel backpack in case your mobile battery discharges.
      </div>
    </div>

    <div style="margin-top: 28px; padding-top: 14px; border-top: 1px dashed #cbd5e1; font-size: 11px; color: #94a3b8; text-align: center;">
      Generated via AI-TRAVELMATE • ${new Date().toLocaleString()}
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${itinerary.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_offline_travel_sheet.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setDownloadingHtml(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:fixed print:inset-0">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden print:max-h-none print:max-w-none print:shadow-none print:border-none print:rounded-none">
        
        {/* Top Control Bar (Hidden on print) */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0 no-print">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Offline Printable Travel Sheet
              </h3>
              <p className="text-[11px] text-slate-500">
                Ready for PDF download, physical paper print, and offline browsing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={handleDownloadOfflineHtml}
              disabled={downloadingHtml}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Download standalone offline HTML file"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Offline HTML</span>
            </button>

            <button
              onClick={handleCopyMarkdown}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copy text summary to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy Summary'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Sheet Body */}
        <div id="printable-travel-sheet" className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-slate-800 print:overflow-visible print:p-4">
          
          {/* Header Banner */}
          <div className="border-b-2 border-slate-900 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-200">
                    Official Travel Plan & Cost Sheet
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                  {itinerary.title}
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Starting Point: <strong>{itinerary.startingLocation.name}</strong></span>
                </p>
              </div>

              {costEstimation && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-right shrink-0 print:border-slate-300">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Total Estimated Trip Budget
                  </div>
                  <div className="text-2xl font-black text-slate-900 font-mono mt-0.5">
                    {currencySymbol}{costEstimation.totalEstimatedCost.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-600 font-medium mt-0.5">
                    {currencySymbol}{costEstimation.costPerPerson.toLocaleString()} per person ({travelers} traveler{travelers > 1 ? 's' : ''})
                  </div>
                  {customBudgetAmount && (
                    <div className="text-[11px] font-semibold text-indigo-700 mt-1">
                      Target: {currencySymbol}{customBudgetAmount.toLocaleString()}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Meta Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/60">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Duration</span>
                <span className="font-bold text-slate-800">{daysCount} Day{daysCount > 1 ? 's' : ''}</span>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/60">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Destinations</span>
                <span className="font-bold text-slate-800">{itinerary.totalDestinations} Places</span>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/60">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Weather Outlook</span>
                <span className="font-bold text-slate-800">{tempC}°C • {weatherDesc}</span>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/60">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Rain Probability</span>
                <span className="font-bold text-slate-800">{precipProb}%</span>
              </div>
            </div>
          </div>

          {/* Daily Schedule Tables */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <span>Daily Itinerary Schedule</span>
              </h2>
              <span className="text-xs text-slate-500">
                Chronological sequence with time slots & transit
              </span>
            </div>

            {itinerary.days.map((day) => (
              <div key={day.dayNumber} className="border border-slate-200 rounded-xl overflow-hidden print:break-inside-avoid shadow-2xs">
                {/* Day Header */}
                <div className="bg-indigo-600 text-white px-4 py-2.5 flex items-center justify-between text-xs sm:text-sm font-bold">
                  <div className="flex items-center gap-2">
                    <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-mono">
                      Day {day.dayNumber}
                    </span>
                    <span>{day.date}</span>
                  </div>
                  <div className="font-mono text-xs text-indigo-100 font-normal">
                    ~{day.totalDistanceKm} km • ~{Math.round(day.totalDurationMin / 60)} hrs
                  </div>
                </div>

                {/* Day Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                        <th className="py-2.5 px-3 w-12 text-center">#</th>
                        <th className="py-2.5 px-3 w-28">Time Slot</th>
                        <th className="py-2.5 px-3">Destination & Address</th>
                        <th className="py-2.5 px-3 w-28">Category</th>
                        <th className="py-2.5 px-3 w-24">Entry Fee</th>
                        <th className="py-2.5 px-3 w-40">Transit from Prev</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {day.items.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3 font-bold text-center text-slate-700">
                            {item.order}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-medium text-slate-600 whitespace-nowrap">
                            {item.timeSlot}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-900">{item.destination.name}</div>
                            <div className="text-[11px] text-slate-500 line-clamp-1">{item.destination.address}</div>
                            {item.userNotes && (
                              <div className="text-[10px] text-indigo-700 italic mt-0.5">
                                Tip: {item.userNotes}
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-medium border border-slate-200">
                              {item.destination.category}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">
                            {item.destination.feeINR === 0 ? (
                              <span className="text-emerald-700">Free</span>
                            ) : (
                              `${currencySymbol}${item.destination.feeINR}`
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-[11px] text-slate-600">
                            {item.travelDistanceFromPreviousKm ? (
                              <div>
                                <span className="font-medium">~{item.travelDistanceFromPreviousKm} km</span>{' '}
                                <span className="text-slate-500">via {item.travelMode || 'driving'}</span>
                                <div className="text-[10px] text-slate-400">~{item.travelTimeFromPreviousMin || 15} mins</div>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Starting stop</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>

          {/* Cost Estimation Breakdown Section */}
          {costEstimation && (
            <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/60 print:break-inside-avoid space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <IndianRupee className="w-5 h-5 text-indigo-600" />
                  <span>Comprehensive Cost Breakdown</span>
                </h2>
                <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-mono">
                  All-Inclusive Trip Economics
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                  <div className="text-[10px] uppercase font-bold text-slate-500">1. Entrance Fees</div>
                  <div className="text-lg font-bold font-mono text-slate-900 mt-1">
                    {currencySymbol}{costEstimation.categories.entranceFees.amount.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {costEstimation.categories.entranceFees.items.length} ticketed attraction(s)
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                  <div className="text-[10px] uppercase font-bold text-slate-500">2. Travel & Transit</div>
                  <div className="text-lg font-bold font-mono text-slate-900 mt-1">
                    {currencySymbol}{costEstimation.categories.travelCost.amount.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    ~{costEstimation.categories.travelCost.distanceKm} km circuit
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                  <div className="text-[10px] uppercase font-bold text-slate-500">3. Food & Dining</div>
                  <div className="text-lg font-bold font-mono text-slate-900 mt-1">
                    {currencySymbol}{costEstimation.categories.foodAndDining.amount.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    ~{currencySymbol}{costEstimation.categories.foodAndDining.dailyAverage}/day allowance
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                  <div className="text-[10px] uppercase font-bold text-slate-500">4. Shelter / Lodging</div>
                  <div className="text-lg font-bold font-mono text-slate-900 mt-1">
                    {currencySymbol}{costEstimation.categories.shelterAccommodation.amount.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {costEstimation.categories.shelterAccommodation.nights} night(s) stay
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                  <div className="text-[10px] uppercase font-bold text-slate-500">5. Other & Buffer</div>
                  <div className="text-lg font-bold font-mono text-slate-900 mt-1">
                    {currencySymbol}{costEstimation.categories.otherExpenses.amount.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Water, parking, souvenir buffer (10%)
                  </div>
                </div>
              </div>

              {costEstimation.aiSummary && (
                <div className="bg-indigo-50/70 border border-indigo-100 rounded-lg p-3 text-xs text-indigo-950">
                  <span className="font-bold">Travel Economist Note: </span>
                  <span>{costEstimation.aiSummary}</span>
                </div>
              )}
            </div>
          )}

          {/* Packing Essentials Checklist */}
          <div className="border border-slate-200 rounded-xl p-5 bg-white print:break-inside-avoid space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2">
                <Shirt className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Packing Checklist & Essentials
                </h2>
              </div>
              {onOpenPackingList && (
                <button
                  onClick={onOpenPackingList}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold no-print cursor-pointer"
                >
                  Manage Interactive Checklist &rarr;
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs">
              {packingItems.slice(0, 14).map((item) => (
                <div key={item.id} className="flex items-start gap-2 py-1 border-b border-slate-100 last:border-none">
                  <div className="w-3.5 h-3.5 rounded border border-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-800">{item.title}</span>
                    {item.subtitle && <p className="text-[11px] text-slate-500 leading-tight">{item.subtitle}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency & Local Directory */}
          <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-4 text-xs text-rose-950 print:break-inside-avoid">
            <div className="flex items-center gap-2 mb-2">
              <PhoneCall className="w-4 h-4 text-rose-600" />
              <h3 className="font-bold text-rose-900 text-sm">
                Emergency Directory & Offline Assistance
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-medium">
              <div>National Emergency: <strong className="font-mono text-rose-800">112</strong></div>
              <div>Police: <strong className="font-mono text-rose-800">100 / 112</strong></div>
              <div>Ambulance: <strong className="font-mono text-rose-800">108</strong></div>
              <div>Women Safety: <strong className="font-mono text-rose-800">1091</strong></div>
              <div>Tourism Helpline: <strong className="font-mono text-rose-800">1363</strong></div>
            </div>
            <p className="text-[11px] text-rose-800/80 mt-2">
              Printed offline sheet. In case of mobile network loss, show this sheet or physical tickets to transport attendants.
            </p>
          </div>

          {/* Traveler Notes Area for Pen Notes */}
          <div className="border border-dashed border-slate-300 rounded-xl p-4 bg-slate-50/50 print:break-inside-avoid">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Traveler Notes & Handwritten Journal / Receipts
            </div>
            <div className="space-y-3">
              <div className="border-b border-slate-200 h-4" />
              <div className="border-b border-slate-200 h-4" />
              <div className="border-b border-slate-200 h-4" />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
