import React, { useState, useRef, useEffect } from 'react';
import { Compass, Sparkles, Bookmark, BarChart2, Calendar, Globe2, ChevronDown, Check, FileText, Shirt } from 'lucide-react';
import { useLanguage, CurrencyCode } from '../context/LanguageContext';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '../i18n/translations';

interface NavbarProps {
  activeTab: 'explore' | 'recommendations' | 'itinerary' | 'assistant' | 'saved';
  setActiveTab: (tab: 'explore' | 'recommendations' | 'itinerary' | 'assistant' | 'saved') => void;
  onOpenEvaluation: () => void;
  savedTripsCount: number;
  onOpenExportSheet?: () => void;
  onOpenPackingList?: () => void;
}

const CURRENCIES: Array<{ code: CurrencyCode; label: string; symbol: string }> = [
  { code: 'INR', label: 'INR (₹)', symbol: '₹' },
  { code: 'USD', label: 'USD ($)', symbol: '$' },
  { code: 'EUR', label: 'EUR (€)', symbol: '€' },
  { code: 'GBP', label: 'GBP (£)', symbol: '£' },
  { code: 'JPY', label: 'JPY (¥)', symbol: '¥' },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenEvaluation,
  savedTripsCount,
  onOpenExportSheet,
  onOpenPackingList,
}) => {
  const { language, setLanguage, currency, setCurrency, t } = useLanguage();
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isCurrMenuOpen, setIsCurrMenuOpen] = useState(false);

  const langRef = useRef<HTMLDivElement>(null);
  const currRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
      if (currRef.current && !currRef.current.contains(event.target as Node)) {
        setIsCurrMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('explore')}
              className="flex items-center gap-2.5 text-left focus:outline-none cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
                  {t('appTitle', 'AI-TRAVELMATE')}
                </span>
                <span className="hidden lg:inline-block ml-2 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Worldwide & Pilot Ready
                </span>
              </div>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('explore')}
              className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'explore'
                  ? 'bg-slate-100 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {t('explore', 'Explore Places')}
            </button>

            <button
              onClick={() => setActiveTab('recommendations')}
              className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'recommendations'
                  ? 'bg-slate-100 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {t('recommendations', 'AI Recommender')}
            </button>

            <button
              onClick={() => setActiveTab('itinerary')}
              className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'itinerary'
                  ? 'bg-slate-100 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Calendar className="w-4 h-4 text-indigo-600" />
              {t('itinerary', 'Trip Itinerary & Budget')}
            </button>

            <button
              onClick={() => setActiveTab('assistant')}
              className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'assistant'
                  ? 'bg-slate-100 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              {t('assistant', 'AI Travel Advisor')}
            </button>

            <button
              onClick={() => setActiveTab('saved')}
              className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'saved'
                  ? 'bg-slate-100 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Bookmark className="w-4 h-4 text-slate-500" />
              <span>{t('savedTrips', 'Saved Trips')}</span>
              {savedTripsCount > 0 && (
                <span className="text-[11px] bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.2 rounded-full font-mono">
                  {savedTripsCount}
                </span>
              )}
            </button>
          </nav>

          {/* Right Controls: Quick Tools, Language Selector, Currency, Diagnostics */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {onOpenPackingList && (
              <button
                onClick={onOpenPackingList}
                className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                title="Smart Packing List Generator"
              >
                <Shirt className="w-3.5 h-3.5 text-indigo-600" />
                <span>Packing</span>
              </button>
            )}

            {onOpenExportSheet && (
              <button
                onClick={onOpenExportSheet}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                title="Print or Save Offline Travel Sheet PDF"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                <span>Export PDF</span>
              </button>
            )}

            {/* Language Selector Dropdown */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 cursor-pointer"
                title="Change Language / భాషను మార్చండి / भाषा बदलें"
              >
                <Globe2 className="w-3.5 h-3.5 text-indigo-600" />
                <span className="font-semibold">{currentLangObj.flag} {currentLangObj.nativeName}</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              {isLangMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                  <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Language
                  </div>
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setIsLangMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                        language === lang.code ? 'bg-indigo-50/70 text-indigo-700 font-semibold' : 'text-slate-700'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.nativeName}</span>
                        <span className="text-[10px] text-slate-400">({lang.name})</span>
                      </span>
                      {language === lang.code && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Currency Selector */}
            <div className="relative" ref={currRef}>
              <button
                onClick={() => setIsCurrMenuOpen(!isCurrMenuOpen)}
                className="flex items-center gap-1 px-2 py-1.5 text-xs font-mono font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 cursor-pointer"
                title="Select Currency"
              >
                <span>{currency}</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              {isCurrMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-32 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                  <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Currency
                  </div>
                  {CURRENCIES.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => {
                        setCurrency(c.code);
                        setIsCurrMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                        currency === c.code ? 'bg-indigo-50/70 text-indigo-700 font-semibold' : 'text-slate-700'
                      }`}
                    >
                      <span>{c.label}</span>
                      {currency === c.code && <Check className="w-3 h-3 text-indigo-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* SRS Diagnostics Button */}
            <button
              onClick={onOpenEvaluation}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 cursor-pointer"
              title="SRS Specifications, Scoring Formula & ML Model Evaluation Metrics"
            >
              <BarChart2 className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden xl:inline">Diagnostics</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Subnavigation */}
      <div className="flex md:hidden overflow-x-auto px-4 py-2 bg-slate-50 border-t border-slate-200 gap-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('explore')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap cursor-pointer ${
            activeTab === 'explore' ? 'bg-white shadow-xs text-indigo-600 font-semibold' : 'text-slate-600'
          }`}
        >
          {t('explore', 'Explore')}
        </button>
        <button
          onClick={() => setActiveTab('recommendations')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap cursor-pointer ${
            activeTab === 'recommendations' ? 'bg-white shadow-xs text-indigo-600 font-semibold' : 'text-slate-600'
          }`}
        >
          {t('recommendations', 'Recommendations')}
        </button>
        <button
          onClick={() => setActiveTab('itinerary')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap cursor-pointer ${
            activeTab === 'itinerary' ? 'bg-white shadow-xs text-indigo-600 font-semibold' : 'text-slate-600'
          }`}
        >
          {t('itinerary', 'Itinerary & Budget')}
        </button>
        <button
          onClick={() => setActiveTab('assistant')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap cursor-pointer ${
            activeTab === 'assistant' ? 'bg-white shadow-xs text-indigo-600 font-semibold' : 'text-slate-600'
          }`}
        >
          {t('assistant', 'AI Chat')}
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap cursor-pointer ${
            activeTab === 'saved' ? 'bg-white shadow-xs text-indigo-600 font-semibold' : 'text-slate-600'
          }`}
        >
          {t('savedTrips', 'Saved')} ({savedTripsCount})
        </button>
      </div>
    </header>
  );
};
