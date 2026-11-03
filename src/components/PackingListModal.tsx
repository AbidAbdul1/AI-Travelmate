import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Printer,
  Sparkles,
  CloudSun,
  Shirt,
  ShieldCheck,
  Smartphone,
  HeartPulse,
  Landmark,
  RotateCcw,
  CheckCheck,
  AlertTriangle,
  Umbrella,
  Sun,
  Calendar,
  Layers,
} from 'lucide-react';
import { Destination, PackingCategory, PackingItem, WeatherData } from '../types/travel';
import { generatePackingList } from '../utils/packingListGenerator';

interface PackingListModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripDurationDays: number;
  weather: WeatherData | null;
  destinations: Destination[];
  tripTitle?: string;
  onOpenExportSheet?: () => void;
}

export const PackingListModal: React.FC<PackingListModalProps> = ({
  isOpen,
  onClose,
  tripDurationDays,
  weather,
  destinations,
  tripTitle = 'Trip Itinerary',
  onOpenExportSheet,
}) => {
  const [items, setItems] = useState<PackingItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<PackingCategory | 'all'>('all');
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<PackingCategory>('custom');

  const storageKey = `travelmate_packing_items_${tripDurationDays}_${destinations.map((d) => d.id).sort().join('_')}`;

  // Initialize or load from localStorage
  useEffect(() => {
    if (!isOpen) return;

    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems(parsed);
          return;
        }
      }
    } catch (_e) {
      // ignore
    }

    // Generate fresh auto-suggested list
    const generated = generatePackingList(tripDurationDays, weather, destinations);
    setItems(generated);
  }, [isOpen, tripDurationDays, destinations, weather]);

  // Persist to localStorage whenever items change
  const updateAndSaveItems = (newItems: PackingItem[]) => {
    setItems(newItems);
    try {
      localStorage.setItem(storageKey, JSON.stringify(newItems));
    } catch (_e) {
      // ignore
    }
  };

  if (!isOpen) return null;

  const totalCount = items.length;
  const packedCount = items.filter((i) => i.packed).length;
  const percentage = totalCount > 0 ? Math.round((packedCount / totalCount) * 100) : 0;

  const handleTogglePacked = (id: string) => {
    const updated = items.map((item) =>
      item.id === id ? { ...item, packed: !item.packed } : item
    );
    updateAndSaveItems(updated);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: PackingItem = {
      id: `custom-${Date.now()}`,
      category: newCategory,
      title: newTitle.trim(),
      packed: false,
      isAutoSuggested: false,
      subtitle: 'Custom personal item',
    };

    updateAndSaveItems([newItem, ...items]);
    setNewTitle('');
  };

  const handleDeleteItem = (id: string) => {
    const updated = items.filter((i) => i.id !== id);
    updateAndSaveItems(updated);
  };

  const handleMarkAllPacked = () => {
    const updated = items.map((i) => ({ ...i, packed: true }));
    updateAndSaveItems(updated);
  };

  const handleResetChecklist = () => {
    const generated = generatePackingList(tripDurationDays, weather, destinations);
    updateAndSaveItems(generated);
  };

  const handlePrintPackingList = () => {
    window.print();
  };

  const filteredItems = activeCategory === 'all'
    ? items
    : items.filter((i) => i.category === activeCategory);

  const tempC = weather?.current?.temperatureC ?? 32;
  const precipProb = weather?.current?.precipitationProbability ?? 15;
  const weatherDesc = weather?.current?.weatherDescription || 'Mainly clear';

  const categoryIcons: Record<PackingCategory | 'all', React.ReactNode> = {
    all: <Layers className="w-3.5 h-3.5" />,
    clothing: <Shirt className="w-3.5 h-3.5" />,
    weather: <CloudSun className="w-3.5 h-3.5" />,
    cultural: <Landmark className="w-3.5 h-3.5" />,
    health: <HeartPulse className="w-3.5 h-3.5" />,
    tech_docs: <Smartphone className="w-3.5 h-3.5" />,
    custom: <Sparkles className="w-3.5 h-3.5" />,
  };

  const categoryLabels: Record<PackingCategory | 'all', string> = {
    all: 'All Items',
    clothing: 'Clothing & Footwear',
    weather: 'Weather Essentials',
    cultural: 'Temple & Heritage',
    health: 'Health & Pharmacy',
    tech_docs: 'Tech & Docs',
    custom: 'Custom',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Shirt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Smart Packing List Generator
                </h3>
                <span className="text-[11px] font-semibold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                  AI Adaptive
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Tailored for {tripDurationDays} day{tripDurationDays > 1 ? 's' : ''} • {tempC}°C {weatherDesc}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintPackingList}
              title="Print Packing Slip"
              className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-white rounded-lg border border-slate-200 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dynamic Trip & Weather Intelligence Banner */}
        <div className="px-5 py-3 bg-gradient-to-r from-indigo-50 via-sky-50 to-emerald-50 border-b border-indigo-100 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 font-medium text-slate-800 bg-white/80 px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span>{tripDurationDays} Day{tripDurationDays > 1 ? 's' : ''} ({destinations.length} Stops)</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium text-slate-800 bg-white/80 px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>{tempC}°C ({tempC >= 28 ? 'Tropical Heat' : 'Mild'})</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium text-slate-800 bg-white/80 px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs">
              <Umbrella className="w-3.5 h-3.5 text-sky-600" />
              <span>{precipProb}% Rain Probability</span>
            </div>
          </div>

          {onOpenExportSheet && (
            <button
              onClick={() => {
                onClose();
                onOpenExportSheet();
              }}
              className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 hover:underline flex items-center gap-1 cursor-pointer ml-auto"
            >
              <span>View with Full Travel Sheet &rarr;</span>
            </button>
          )}
        </div>

        {/* Progress & Quick Actions */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white shrink-0">
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
              <span>Packing Progress</span>
              <span className="font-mono text-indigo-600">
                {packedCount} / {totalCount} Packed ({percentage}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  percentage === 100 ? 'bg-emerald-500' : 'bg-indigo-600'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleMarkAllPacked}
              className="px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-100 rounded-lg border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Pack All</span>
            </button>
            <button
              onClick={handleResetChecklist}
              title="Reset checklist to original recommendations"
              className="px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Regenerate</span>
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          {(['all', 'clothing', 'weather', 'cultural', 'health', 'tech_docs', 'custom'] as const).map(
            (cat) => {
              const catCount = cat === 'all' ? items.length : items.filter((i) => i.category === cat).length;
              if (catCount === 0 && cat === 'custom') return null;

              const isSelected = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {categoryIcons[cat]}
                  <span>{categoryLabels[cat]}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isSelected ? 'bg-indigo-500/40 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {catCount}
                  </span>
                </button>
              );
            }
          )}
        </div>

        {/* Checklist Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 space-y-2">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No items in this category.</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleTogglePacked(item.id)}
                className={`group flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                  item.packed
                    ? 'bg-emerald-50/50 border-emerald-200 text-slate-400'
                    : 'bg-white hover:bg-slate-50/80 border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div className="mt-0.5 shrink-0 text-slate-400">
                  {item.packed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-sm font-semibold tracking-tight ${
                        item.packed ? 'line-through text-slate-400' : 'text-slate-800'
                      }`}
                    >
                      {item.title}
                    </span>

                    {item.requiredForCondition && (
                      <span className="text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200/60 px-1.5 py-0.2 rounded-md">
                        {item.requiredForCondition}
                      </span>
                    )}
                  </div>

                  {item.subtitle && (
                    <p className={`text-xs mt-0.5 ${item.packed ? 'text-slate-400' : 'text-slate-500'}`}>
                      {item.subtitle}
                    </p>
                  )}
                </div>

                {!item.isAutoSuggested && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteItem(item.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Add Custom Item Footer Form */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0">
          <form onSubmit={handleAddItem} className="flex items-center gap-2">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Add your own custom packing item (e.g. Camera lens, baby wipes)..."
              className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 placeholder:text-slate-400"
            />

            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as PackingCategory)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer hidden sm:block"
            >
              <option value="clothing">Clothing</option>
              <option value="weather">Weather Gear</option>
              <option value="cultural">Temple/Culture</option>
              <option value="health">Health</option>
              <option value="tech_docs">Tech/Docs</option>
              <option value="custom">General</option>
            </select>

            <button
              type="submit"
              disabled={!newTitle.trim()}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
