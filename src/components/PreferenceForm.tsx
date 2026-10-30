import React, { useState } from 'react';
import { UserPreference, ScoringWeights } from '../types/travel';
import { VIJAYAWADA_ORIGIN } from '../data/destinations';
import { Sliders, Clock, MapPin, IndianRupee, Sparkles, RefreshCw } from 'lucide-react';

interface PreferenceFormProps {
  preferences: UserPreference;
  onUpdatePreferences: (prefs: UserPreference) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const PRESET_ORIGINS = [
  {
    name: 'Vijayawada Central Junction (Besant Rd / Station)',
    latitude: 16.5161,
    longitude: 80.6200,
  },
  {
    name: 'Pandit Nehru Bus Station (PNBS River Terminal)',
    latitude: 16.5098,
    longitude: 80.6185,
  },
  {
    name: 'Vijayawada International Airport (Gannavaram - VGA)',
    latitude: 16.5278,
    longitude: 80.7972,
  },
  {
    name: 'Benz Circle Commercial Hub (MG Road)',
    latitude: 16.4988,
    longitude: 80.6558,
  },
];

const AVAILABLE_INTERESTS = [
  { id: 'heritage', label: 'Heritage & Temples' },
  { id: 'caves', label: 'Caves & Monoliths' },
  { id: 'nature', label: 'River & Islands' },
  { id: 'culture', label: 'Museums & Art' },
  { id: 'food', label: 'Local Food & Bazaars' },
  { id: 'family', label: 'Parks & Families' },
];

export const PreferenceForm: React.FC<PreferenceFormProps> = ({
  preferences,
  onUpdatePreferences,
  onSubmit,
  isLoading,
}) => {
  const [showWeightSettings, setShowWeightSettings] = useState(false);

  const toggleInterest = (interestId: string) => {
    const exists = preferences.interests.includes(interestId);
    const updated = exists
      ? preferences.interests.filter((i) => i !== interestId)
      : [...preferences.interests, interestId];
    onUpdatePreferences({ ...preferences, interests: updated });
  };

  const handleOriginChange = (index: number) => {
    const selected = PRESET_ORIGINS[index];
    if (selected) {
      onUpdatePreferences({
        ...preferences,
        startingLocation: selected,
      });
    }
  };

  const handleWeightChange = (key: keyof ScoringWeights, value: number) => {
    const rounded = Math.round(value * 100) / 100;
    onUpdatePreferences({
      ...preferences,
      scoringWeights: {
        ...preferences.scoringWeights,
        [key]: rounded,
      },
    });
  };

  const resetWeightsToDefault = () => {
    onUpdatePreferences({
      ...preferences,
      scoringWeights: {
        preferenceMatch: 0.35,
        budgetSuitability: 0.25,
        travelTimeSuitability: 0.20,
        weatherSuitability: 0.20,
      },
    });
  };

  const currentWeightSum = Math.round(
    (preferences.scoringWeights.preferenceMatch +
      preferences.scoringWeights.budgetSuitability +
      preferences.scoringWeights.travelTimeSuitability +
      preferences.scoringWeights.weatherSuitability) *
      100
  ) / 100;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Travel Preferences & Parameters
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure your journey parameters to compute personalized recommendations
          </p>
        </div>
        <button
          onClick={() => setShowWeightSettings(!showWeightSettings)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border ${
            showWeightSettings
              ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
          title="Customize transparent scoring formula weights (SRS FR-14)"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Formula Weights</span>
        </button>
      </div>

      <div className="space-y-4 pt-4">
        {/* 1. Starting Origin */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Starting Location / Departure Origin
          </label>
          <div className="relative">
            <select
              value={PRESET_ORIGINS.findIndex((p) => p.name === preferences.startingLocation.name)}
              onChange={(e) => handleOriginChange(parseInt(e.target.value, 10))}
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg py-2.5 px-3 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {PRESET_ORIGINS.map((origin, idx) => (
                <option key={idx} value={idx}>
                  {origin.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 2. Interests Multi-select */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Travel Interests & Themes
            </label>
            <span className="text-xs text-slate-500 font-mono">
              {preferences.interests.length} selected
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {AVAILABLE_INTERESTS.map((item) => {
              const isSelected = preferences.interests.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleInterest(item.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Budget & Duration Split */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Budget Target
            </label>
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg">
              {(['budget', 'moderate', 'luxury'] as const).map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => onUpdatePreferences({ ...preferences, budget: b })}
                  className={`py-1.5 text-xs font-medium capitalize rounded-md transition-all ${
                    preferences.budget === b
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Trip Duration
            </label>
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg">
              {[1, 2, 3].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => onUpdatePreferences({ ...preferences, tripDurationDays: days })}
                  className={`py-1.5 text-xs font-medium rounded-md transition-all ${
                    preferences.tripDurationDays === days
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {days} {days === 1 ? 'Day' : 'Days'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Start Departure
            </label>
            <div className="relative">
              <input
                type="time"
                value={preferences.departureTime}
                onChange={(e) => onUpdatePreferences({ ...preferences, departureTime: e.target.value })}
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg py-2 px-3 text-slate-900 focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* 4. Transparent Scoring Weights Panel (SRS FR-14) */}
        {showWeightSettings && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 transition-all">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">
                  SRS Transparent Formula Configuration
                </span>
                <span
                  className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                    Math.abs(currentWeightSum - 1.0) < 0.05
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  Sum: {currentWeightSum} (Target: 1.0)
                </span>
              </div>
              <button
                onClick={resetWeightsToDefault}
                className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800"
              >
                <RefreshCw className="w-3 h-3" />
                Reset Defaults
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <div className="flex justify-between text-slate-700 mb-1">
                  <span>Preference Match Weight</span>
                  <span className="font-mono font-semibold">{preferences.scoringWeights.preferenceMatch}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.6"
                  step="0.05"
                  value={preferences.scoringWeights.preferenceMatch}
                  onChange={(e) => handleWeightChange('preferenceMatch', parseFloat(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-700 mb-1">
                  <span>Budget Suitability Weight</span>
                  <span className="font-mono font-semibold">{preferences.scoringWeights.budgetSuitability}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.5"
                  step="0.05"
                  value={preferences.scoringWeights.budgetSuitability}
                  onChange={(e) => handleWeightChange('budgetSuitability', parseFloat(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-700 mb-1">
                  <span>Travel-Time Proximity Weight</span>
                  <span className="font-mono font-semibold">{preferences.scoringWeights.travelTimeSuitability}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.4"
                  step="0.05"
                  value={preferences.scoringWeights.travelTimeSuitability}
                  onChange={(e) => handleWeightChange('travelTimeSuitability', parseFloat(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-700 mb-1">
                  <span>Weather Suitability Weight</span>
                  <span className="font-mono font-semibold">{preferences.scoringWeights.weatherSuitability}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.4"
                  step="0.05"
                  value={preferences.scoringWeights.weatherSuitability}
                  onChange={(e) => handleWeightChange('weatherSuitability', parseFloat(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-500 italic">
              Formula: Recommendation Score = (w1 × Preference) + (w2 × Budget) + (w3 × TravelTime) + (w4 × Weather). All variables normalized to 0–100 scale.
            </p>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onSubmit}
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Computing Recommendations & Routes...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Calculate Personalized Recommendations
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
