/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { InteractiveMap } from './components/InteractiveMap';
import { PreferenceForm } from './components/PreferenceForm';
import { DestinationCard } from './components/DestinationCard';
import { WeatherWidget } from './components/WeatherWidget';
import { TrafficPredictionCard } from './components/TrafficPredictionCard';
import { ItineraryBuilder } from './components/ItineraryBuilder';
import { AIAssistantChat } from './components/AIAssistantChat';
import { EvaluationModal } from './components/EvaluationModal';
import { SavedTripsModal } from './components/SavedTripsModal';
import { RegionSelector } from './components/RegionSelector';
import { PILOT_DESTINATIONS, VIJAYAWADA_ORIGIN, IndianRegion, INDIAN_REGIONS } from './data/destinations';
import {
  Destination,
  DestinationCategory,
  UserPreference,
  ScoredDestination,
  WeatherData,
  RouteCalculationResult,
  TrafficPredictionResult,
  ItineraryPlan,
} from './types/travel';
import {
  Search,
  SlidersHorizontal,
  Navigation,
  Calendar,
  Sparkles,
  MapPin,
  RefreshCw,
  Compass,
  ArrowRight,
  Sun,
  ShieldCheck,
  CheckCircle,
  Globe2,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'explore' | 'recommendations' | 'itinerary' | 'assistant' | 'saved'>('explore');

  // Active Indian Region State (default: Vijayawada Pilot)
  const [activeRegionId, setActiveRegionId] = useState<string>('vijayawada');

  // Core Data States
  const [destinations, setDestinations] = useState<Destination[]>(PILOT_DESTINATIONS);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(PILOT_DESTINATIONS[0]);
  const [selectedCategory, setSelectedCategory] = useState<DestinationCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // User Preferences & Scoring
  const [preferences, setPreferences] = useState<UserPreference>({
    startingLocation: VIJAYAWADA_ORIGIN,
    interests: ['heritage', 'caves', 'nature'],
    budget: 'moderate',
    tripDurationDays: 1,
    travelMode: 'driving',
    departureTime: '08:30',
    scoringWeights: {
      preferenceMatch: 0.35,
      budgetSuitability: 0.25,
      travelTimeSuitability: 0.20,
      weatherSuitability: 0.20,
    },
  });

  const [recommendations, setRecommendations] = useState<ScoredDestination[]>([]);
  const [isComputingRecommendations, setIsComputingRecommendations] = useState(false);
  const [recommendationBriefing, setRecommendationBriefing] = useState<string>('');

  // Weather & Environmental State
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);

  // Route & Traffic State
  const [activeRoute, setActiveRoute] = useState<RouteCalculationResult | null>(null);
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const [trafficPrediction, setTrafficPrediction] = useState<TrafficPredictionResult | null>(null);
  const [isTrafficLoading, setIsTrafficLoading] = useState(false);

  // Itinerary Plan
  const [itinerary, setItinerary] = useState<ItineraryPlan | null>(null);
  const [savedTrips, setSavedTrips] = useState<ItineraryPlan[]>([]);
  const [isSavingTrip, setIsSavingTrip] = useState(false);

  // Modals & Feedback
  const [isEvaluationOpen, setIsEvaluationOpen] = useState(false);
  const [isSavedTripsModalOpen, setIsSavedTripsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Initial Load: Weather, Saved Trips, and Default Itinerary
  useEffect(() => {
    fetchWeather(VIJAYAWADA_ORIGIN.latitude, VIJAYAWADA_ORIGIN.longitude, 'Vijayawada, AP');
    fetchSavedTrips();
    generateInitialItinerary();
    // Default initial traffic prediction for Bandar Road
    fetchTrafficPrediction('bandar-road-corridor', preferences.departureTime);
  }, []);

  const fetchWeather = async (lat: number, lon: number, name: string) => {
    setIsWeatherLoading(true);
    try {
      const resp = await fetch(`/api/weather?latitude=${lat}&longitude=${lon}&locationName=${encodeURIComponent(name)}`);
      const data = await resp.json();
      if (resp.ok && data.success) {
        setWeather(data);
      }
    } catch (err) {
      console.error('Weather load error:', err);
    } finally {
      setIsWeatherLoading(false);
    }
  };

  const fetchSavedTrips = async () => {
    try {
      const resp = await fetch('/api/saved-trips');
      const data = await resp.json();
      if (resp.ok && data.success) {
        setSavedTrips(data.trips);
      }
    } catch (err) {
      console.error('Saved trips fetch error:', err);
    }
  };

  const generateInitialItinerary = async () => {
    try {
      const resp = await fetch('/api/itineraries/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: VIJAYAWADA_ORIGIN,
          destinationIds: ['kanakadurga-temple', 'undavalli-caves', 'prakasam-barrage', 'bhavani-island'],
          tripDurationDays: 1,
          title: 'Vijayawada Heritage & River Discovery',
        }),
      });
      const data = await resp.json();
      if (resp.ok && data.success) {
        setItinerary(data.itinerary);
      }
    } catch (err) {
      console.error('Initial itinerary error:', err);
    }
  };

  const fetchTrafficPrediction = async (segmentId: string, depTime: string) => {
    setIsTrafficLoading(true);
    try {
      const resp = await fetch('/api/traffic/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roadSegmentId: segmentId,
          departureTime: depTime,
          dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
          rainfallMm: weather?.current?.precipitationMm || 0,
        }),
      });
      const data = await resp.json();
      if (resp.ok && data.success) {
        setTrafficPrediction(data);
      }
    } catch (err) {
      console.error('Traffic prediction error:', err);
    } finally {
      setIsTrafficLoading(false);
    }
  };

  // 2. Destination Search & India Region Switching
  const handleSelectRegion = (region: IndianRegion) => {
    setActiveRegionId(region.id);
    const newOrigin = {
      name: region.defaultOriginName,
      latitude: region.latitude,
      longitude: region.longitude,
    };
    setPreferences((prev) => ({
      ...prev,
      startingLocation: newOrigin,
    }));
    setDestinations(region.destinations);
    setSelectedDestination(region.destinations[0] || null);
    setActiveRoute(null);

    // Live weather for selected Indian city
    fetchWeather(region.latitude, region.longitude, `${region.name}, ${region.state}`);

    // Traffic prediction for this city corridor
    if (region.corridors && region.corridors.length > 0) {
      fetchTrafficPrediction(region.corridors[0].id, preferences.departureTime);
    } else {
      fetchTrafficPrediction('corridor-auto', preferences.departureTime);
    }

    // Refresh itinerary for this city
    fetchItineraryForRegion(region, newOrigin);
    showToast(`Active trip hub set to ${region.name}, ${region.state}!`);
  };

  const handleSelectCustomLocation = (loc: { name: string; latitude: number; longitude: number }) => {
    setActiveRegionId('custom');
    setPreferences((prev) => ({
      ...prev,
      startingLocation: loc,
    }));
    setActiveRoute(null);
    fetchWeather(loc.latitude, loc.longitude, loc.name);
    fetchTrafficPrediction('custom-arterial', preferences.departureTime);

    // Search attractions around this custom Indian location
    handleSearch('', 'All', loc);
    showToast(`Trip hub set to ${loc.name}!`);
  };

  const fetchItineraryForRegion = async (region: IndianRegion, originLoc: { name: string; latitude: number; longitude: number }) => {
    try {
      const topIds = region.destinations.slice(0, 4).map((d) => d.id);
      const resp = await fetch('/api/itineraries/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: originLoc,
          destinationIds: topIds,
          tripDurationDays: preferences.tripDurationDays,
          title: `${region.name} Circuit (${preferences.tripDurationDays} Days)`,
        }),
      });
      const data = await resp.json();
      if (resp.ok && data.success) {
        setItinerary(data.itinerary);
      }
    } catch (err) {
      console.warn('Region itinerary generation error:', err);
    }
  };

  const handleSearch = async (queryText: string, cat: DestinationCategory, customOrigin?: { latitude: number; longitude: number }) => {
    setIsSearching(true);
    const originToUse = customOrigin || preferences.startingLocation;
    try {
      const catParam = cat !== 'All' ? `&category=${encodeURIComponent(cat)}` : '';
      const qParam = queryText ? `&q=${encodeURIComponent(queryText)}` : '';
      const regionParam = activeRegionId !== 'custom' ? `&regionId=${activeRegionId}` : '';
      const resp = await fetch(`/api/destinations/search?latitude=${originToUse.latitude}&longitude=${originToUse.longitude}${qParam}${catParam}${regionParam}`);
      const data = await resp.json();
      if (resp.ok && data.success) {
        setDestinations(data.destinations);
        if (data.destinations.length > 0) {
          setSelectedDestination(data.destinations[0]);
        }
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // 3. Compute Recommendations
  const handleComputeRecommendations = async () => {
    setIsComputingRecommendations(true);
    try {
      const resp = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: preferences.startingLocation,
          interests: preferences.interests,
          budget: preferences.budget,
          tripDurationDays: preferences.tripDurationDays,
          weights: preferences.scoringWeights,
          weatherConditions: {
            temperatureC: weather?.current?.temperatureC || 32,
            isRaining: (weather?.current?.precipitationProbability || 0) > 40,
          },
        }),
      });

      const data = await resp.json();
      if (resp.ok && data.success) {
        setRecommendations(data.rankedDestinations);
        setActiveTab('recommendations');
        showToast('Personalized recommendations computed with transparent weights!');

        // Generate AI synthesis briefing
        fetchRecommendationBriefing(data.rankedDestinations.slice(0, 4));
      }
    } catch (err) {
      console.error('Recommendation computation error:', err);
      showToast('Error calculating recommendations. Please try again.');
    } finally {
      setIsComputingRecommendations(false);
    }
  };

  const fetchRecommendationBriefing = async (topScored: ScoredDestination[]) => {
    try {
      const resp = await fetch('/api/recommendations/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destinations: topScored.map((s) => s.destination),
          preferences,
          weather: weather?.current || {},
        }),
      });
      const data = await resp.json();
      if (resp.ok && data.success) {
        setRecommendationBriefing(data.explanation);
      }
    } catch (err) {
      console.warn('Briefing error:', err);
    }
  };

  // 4. Calculate Route to a Destination
  const handleCalculateRoute = async (dest: Destination) => {
    setIsRouteLoading(true);
    setSelectedDestination(dest);
    try {
      const resp = await fetch('/api/routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: preferences.startingLocation,
          destination: dest,
          departureTime: preferences.departureTime,
          dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
        }),
      });

      const data = await resp.json();
      if (resp.ok && data.success) {
        setActiveRoute(data);
        showToast(`Route computed: ${data.distanceKm} km (${data.trafficAdjustedDurationMin} mins)`);

        // Refresh traffic prediction for this corridor
        fetchTrafficPrediction(dest.id, preferences.departureTime);
      }
    } catch (err) {
      console.error('Route error:', err);
      showToast('Could not calculate route. Using geometric fallback.');
    } finally {
      setIsRouteLoading(false);
    }
  };

  // 5. Add / Remove Itinerary Items
  const handleAddToItinerary = (dest: Destination) => {
    if (!itinerary) {
      // Create fresh itinerary
      const newPlan: ItineraryPlan = {
        id: `itinerary-${Date.now()}`,
        title: 'Custom Vijayawada Trip',
        startingLocation: preferences.startingLocation,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        totalDestinations: 1,
        totalEstimatedBudgetINR: dest.feeINR,
        days: [
          {
            dayNumber: 1,
            date: 'Day 1',
            totalDistanceKm: 4.5,
            totalDurationMin: dest.estimatedDurationMin + 20,
            items: [
              {
                id: `item-${dest.id}`,
                destination: dest,
                order: 1,
                dayNumber: 1,
                timeSlot: '09:00 - 10:30',
                durationMin: dest.estimatedDurationMin,
                travelTimeFromPreviousMin: 15,
                travelDistanceFromPreviousKm: 4.5,
                trafficLevel: 'Low',
                userNotes: dest.bestTimeToVisit,
              },
            ],
          },
        ],
      };
      setItinerary(newPlan);
      showToast(`Added ${dest.name} to itinerary!`);
      return;
    }

    // Check if already in itinerary
    const exists = itinerary.days.some((d) => d.items.some((it) => it.destination.id === dest.id));
    if (exists) {
      showToast(`${dest.name} is already in your itinerary plan.`);
      return;
    }

    // Append to Day 1
    const targetDay = itinerary.days[0];
    const newItem = {
      id: `item-${Date.now()}-${dest.id}`,
      destination: dest,
      order: targetDay.items.length + 1,
      dayNumber: 1,
      timeSlot: '14:30 - 16:00',
      durationMin: dest.estimatedDurationMin,
      travelTimeFromPreviousMin: 18,
      travelDistanceFromPreviousKm: 5.2,
      trafficLevel: 'Moderate' as const,
      userNotes: dest.bestTimeToVisit,
    };

    const updatedDays = itinerary.days.map((d, i) =>
      i === 0
        ? {
            ...d,
            items: [...d.items, newItem],
            totalDistanceKm: Math.round((d.totalDistanceKm + 5.2) * 10) / 10,
            totalDurationMin: d.totalDurationMin + dest.estimatedDurationMin + 18,
          }
        : d
    );

    const updatedItinerary: ItineraryPlan = {
      ...itinerary,
      days: updatedDays,
      totalDestinations: itinerary.totalDestinations + 1,
      totalEstimatedBudgetINR: itinerary.totalEstimatedBudgetINR + dest.feeINR,
      updatedAt: new Date().toISOString(),
    };

    setItinerary(updatedItinerary);
    showToast(`Added ${dest.name} to itinerary!`);
  };

  // 6. Save Itinerary
  const handleSaveItinerary = async () => {
    if (!itinerary) return;
    setIsSavingTrip(true);
    try {
      const resp = await fetch('/api/saved-trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itinerary),
      });
      const data = await resp.json();
      if (resp.ok && data.success) {
        showToast('Itinerary successfully saved to My Trips!');
        fetchSavedTrips();
      }
    } catch (err) {
      console.error('Save error:', err);
      showToast('Failed to save itinerary.');
    } finally {
      setIsSavingTrip(false);
    }
  };

  const handleDeleteSavedTrip = async (tripId: string) => {
    try {
      await fetch(`/api/saved-trips/${tripId}`, { method: 'DELETE' });
      setSavedTrips((prev) => prev.filter((t) => t.id !== tripId));
      showToast('Trip plan removed.');
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleGenerateItineraryFromRecommendations = () => {
    if (recommendations.length === 0) return;
    const topDests = recommendations.slice(0, 5).map((r) => r.destination);

    const timeSlots = ['08:30 - 10:00', '10:30 - 12:15', '14:00 - 15:30', '16:30 - 18:00', '18:30 - 20:00'];
    const items = topDests.map((dest, idx) => ({
      id: `rec-item-${dest.id}`,
      destination: dest,
      order: idx + 1,
      dayNumber: 1,
      timeSlot: timeSlots[idx % timeSlots.length],
      durationMin: dest.estimatedDurationMin,
      travelTimeFromPreviousMin: 15,
      travelDistanceFromPreviousKm: 4.8,
      trafficLevel: 'Low' as const,
      userNotes: dest.bestTimeToVisit,
    }));

    const newPlan: ItineraryPlan = {
      id: `itinerary-${Date.now()}`,
      title: `Recommended ${preferences.tripDurationDays}-Day Vijayawada Circuit`,
      startingLocation: preferences.startingLocation,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalDestinations: topDests.length,
      totalEstimatedBudgetINR: topDests.reduce((acc, d) => acc + d.feeINR, 0),
      aiExplanation: recommendationBriefing || 'Algorithmically optimized route based on your personalized interest weights and weather forecast.',
      days: [
        {
          dayNumber: 1,
          date: 'Day 1',
          totalDistanceKm: 18.5,
          totalDurationMin: 340,
          items,
        },
      ],
    };

    setItinerary(newPlan);
    setActiveTab('itinerary');
    showToast('Generated fresh itinerary from your top recommendations!');
  };

  const categories: DestinationCategory[] = [
    'All',
    'Heritage & Temples',
    'Caves & Architecture',
    'Nature & Islands',
    'Culture & Museums',
    'Food & Cuisine',
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'saved') {
            setIsSavedTripsModalOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        onOpenEvaluation={() => setIsEvaluationOpen(true)}
        savedTripsCount={savedTrips.length}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 text-xs flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* All-India Region & Location Selector */}
        <RegionSelector
          currentRegionId={activeRegionId}
          currentOriginName={preferences.startingLocation.name}
          onSelectRegion={handleSelectRegion}
          onSelectCustomLocation={handleSelectCustomLocation}
        />

        {/* TAB 1: DESTINATIONS & MAP EXPLORER */}
        {activeTab === 'explore' && (
          <div className="space-y-6">
            {/* Dynamic Hero Banner */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-900 text-white min-h-[200px] flex flex-col justify-end p-6 sm:p-8">
              <img
                src="/src/assets/images/travelmate_hero_vijayawada_1793036232221.jpg"
                alt="AI-TRAVELMATE India Travel Intelligence"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover opacity-35"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/60 to-transparent" />

              <div className="relative z-10 max-w-3xl space-y-2">
                <div className="flex items-center gap-2 text-xs text-amber-300 font-semibold uppercase tracking-wider">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>
                    {activeRegionId === 'vijayawada'
                      ? 'Initial Pilot Location: Vijayawada, Andhra Pradesh (All-India Enabled)'
                      : activeRegionId === 'custom'
                      ? `Custom Indian Destination: ${preferences.startingLocation.name}`
                      : `Selected Region: ${INDIAN_REGIONS.find((r) => r.id === activeRegionId)?.name}, ${INDIAN_REGIONS.find((r) => r.id === activeRegionId)?.state}`}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                  {activeRegionId === 'vijayawada'
                    ? 'Intelligent Travel Planning, Weather & Route System'
                    : `${INDIAN_REGIONS.find((r) => r.id === activeRegionId)?.name || 'India'} Travel & Route Intelligence`}
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                  {activeRegionId === 'vijayawada'
                    ? 'Discover sacred hilltop shrines, monolithic rock-cut caves, tranquil river islands, and authentic Andhra culinary culture. Powered by OpenStreetMap, Open-Meteo weather intelligence, and transparent ML traffic prediction.'
                    : INDIAN_REGIONS.find((r) => r.id === activeRegionId)?.tagline ||
                      'Explore destinations, live Open-Meteo atmospheric forecasts, OSRM road routes, and ML traffic conditions anywhere in India.'}
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setActiveTab('recommendations')}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
                  >
                    <span>Compute Recommendations for {preferences.startingLocation.name.split(',')[0].split('(')[0]}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setIsEvaluationOpen(true)}
                    className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg text-xs font-medium transition-colors backdrop-blur-xs"
                  >
                    SRS Specs & ML Diagnostics
                  </button>
                </div>
              </div>
            </div>

            {/* Split Screen Layout: Map & Controls (Left 55%) + Cards & Weather (Right 45%) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Interactive Map & Live Traffic Card */}
              <div className="lg:col-span-7 space-y-4">
                <div className="h-[480px]">
                  <InteractiveMap
                    destinations={destinations}
                    selectedDestination={selectedDestination}
                    onSelectDestination={(d) => {
                      setSelectedDestination(d);
                      handleCalculateRoute(d);
                    }}
                    activeRoute={activeRoute}
                    originLocation={preferences.startingLocation}
                    onAddToItinerary={handleAddToItinerary}
                  />
                </div>

                {/* Traffic Prediction Module */}
                <TrafficPredictionCard
                  prediction={trafficPrediction}
                  isLoading={isTrafficLoading}
                  onDepartureTimeChange={(time) => {
                    setPreferences((prev) => ({ ...prev, departureTime: time }));
                    if (selectedDestination) {
                      fetchTrafficPrediction(selectedDestination.id, time);
                    }
                  }}
                />
              </div>

              {/* Right Column: Search, Category Filters & Destination Cards */}
              <div className="lg:col-span-5 space-y-4">
                {/* Search Bar & Category Segmented Tabs */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        handleSearch(e.target.value, selectedCategory);
                      }}
                      placeholder="Search temples, caves, islands, foods, or OSM places..."
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Category Filter Tabs (frontend-design interactive filter controls) */}
                  <div className="flex flex-wrap gap-1">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setSelectedCategory(cat);
                          handleSearch(searchQuery, cat);
                        }}
                        className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                          selectedCategory === cat
                            ? 'bg-slate-900 text-white font-semibold shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Weather Widget */}
                <WeatherWidget
                  weather={weather}
                  isLoading={isWeatherLoading}
                  onRefresh={() =>
                    fetchWeather(
                      preferences.startingLocation.latitude,
                      preferences.startingLocation.longitude,
                      preferences.startingLocation.name
                    )
                  }
                />

                {/* Destination Catalog List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-mono px-1">
                    <span>{destinations.length} Available Destinations</span>
                    <span>Click card to inspect route</span>
                  </div>

                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                    {destinations.map((dest) => {
                      const isInItinerary = itinerary?.days.some((d) =>
                        d.items.some((it) => it.destination.id === dest.id)
                      );
                      return (
                        <DestinationCard
                          key={dest.id}
                          destination={dest}
                          isSelected={selectedDestination?.id === dest.id}
                          onSelect={() => setSelectedDestination(dest)}
                          onCalculateRoute={() => handleCalculateRoute(dest)}
                          onAddToItinerary={() => handleAddToItinerary(dest)}
                          isInItinerary={isInItinerary}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PERSONALIZED RECOMMENDATIONS */}
        {activeTab === 'recommendations' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Preferences Form */}
              <div className="lg:col-span-4 space-y-4">
                <PreferenceForm
                  preferences={preferences}
                  onUpdatePreferences={setPreferences}
                  onSubmit={handleComputeRecommendations}
                  isLoading={isComputingRecommendations}
                />

                {/* Open-Meteo Weather Widget */}
                <WeatherWidget
                  weather={weather}
                  isLoading={isWeatherLoading}
                  onRefresh={() =>
                    fetchWeather(
                      preferences.startingLocation.latitude,
                      preferences.startingLocation.longitude,
                      preferences.startingLocation.name
                    )
                  }
                />
              </div>

              {/* Right Column: Recommendations Results */}
              <div className="lg:col-span-8 space-y-4">
                {recommendations.length === 0 ? (
                  <div className="bg-white rounded-xl border border-slate-200 p-10 text-center shadow-xs">
                    <Sparkles className="w-10 h-10 text-indigo-500 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-slate-900">
                      Personalized Recommendation Engine
                    </h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
                      Configure your travel interests, budget, and trip duration on the left, then click "Calculate Personalized Recommendations" to run the transparent weighted scoring algorithm.
                    </p>
                    <button
                      onClick={handleComputeRecommendations}
                      disabled={isComputingRecommendations}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                    >
                      Run Initial Recommendation Pass
                    </button>
                  </div>
                ) : (
                  <>
                    {/* AI Executive Briefing */}
                    {recommendationBriefing && (
                      <div className="p-4 bg-indigo-50/70 border border-indigo-200/80 rounded-xl space-y-1.5 text-xs text-indigo-950">
                        <div className="flex items-center gap-2 font-bold text-indigo-900">
                          <Sparkles className="w-4 h-4 text-indigo-600" />
                          <span>AI Executive Travel Briefing (Gemini 3.8 Flash)</span>
                        </div>
                        <p className="leading-relaxed whitespace-pre-line">{recommendationBriefing}</p>
                      </div>
                    )}

                    {/* Toolbar & Generate Itinerary Action */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          Ranked Destinations by Weighted Score
                        </h3>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">
                          Formula: {preferences.scoringWeights.preferenceMatch}×Pref + {preferences.scoringWeights.budgetSuitability}×Budget + {preferences.scoringWeights.travelTimeSuitability}×Dist + {preferences.scoringWeights.weatherSuitability}×Weather
                        </p>
                      </div>

                      <button
                        onClick={handleGenerateItineraryFromRecommendations}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs flex items-center gap-1.5 shrink-0"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Build Itinerary from Top Picks</span>
                      </button>
                    </div>

                    {/* Ranked Destination Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {recommendations.map((scored) => {
                        const isInItinerary = itinerary?.days.some((d) =>
                          d.items.some((it) => it.destination.id === scored.destination.id)
                        );
                        return (
                          <DestinationCard
                            key={scored.destination.id}
                            destination={scored.destination}
                            scoredData={scored}
                            isSelected={selectedDestination?.id === scored.destination.id}
                            onSelect={() => setSelectedDestination(scored.destination)}
                            onCalculateRoute={() => handleCalculateRoute(scored.destination)}
                            onAddToItinerary={() => handleAddToItinerary(scored.destination)}
                            isInItinerary={isInItinerary}
                          />
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ITINERARY PLANNER & SCHEDULE */}
        {activeTab === 'itinerary' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Itinerary Timeline & Reordering */}
              <div className="lg:col-span-7">
                <ItineraryBuilder
                  itinerary={itinerary}
                  onUpdateItinerary={setItinerary}
                  onSaveItinerary={handleSaveItinerary}
                  onFocusDestination={(dest) => {
                    setSelectedDestination(dest);
                    handleCalculateRoute(dest);
                  }}
                  isSaving={isSavingTrip}
                />
              </div>

              {/* Right Column: Route Map & Live Traffic */}
              <div className="lg:col-span-5 space-y-4">
                <div className="h-[380px]">
                  <InteractiveMap
                    destinations={destinations}
                    selectedDestination={selectedDestination}
                    onSelectDestination={(d) => {
                      setSelectedDestination(d);
                      handleCalculateRoute(d);
                    }}
                    activeRoute={activeRoute}
                    originLocation={preferences.startingLocation}
                  />
                </div>

                <TrafficPredictionCard
                  prediction={trafficPrediction}
                  isLoading={isTrafficLoading}
                  onDepartureTimeChange={(time) => {
                    setPreferences((prev) => ({ ...prev, departureTime: time }));
                    if (selectedDestination) {
                      fetchTrafficPrediction(selectedDestination.id, time);
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AI TRAVEL ASSISTANT */}
        {activeTab === 'assistant' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-8">
                <AIAssistantChat
                  onSelectDestinationByName={(dName) => {
                    const match = destinations.find((d) => d.name.toLowerCase().includes(dName.toLowerCase()));
                    if (match) {
                      setSelectedDestination(match);
                      setActiveTab('explore');
                      handleCalculateRoute(match);
                    }
                  }}
                  tripContextSummary={`Trip preferences: ${preferences.budget} budget, ${preferences.tripDurationDays} day(s), origin at ${preferences.startingLocation.name}. Current temperature: ${weather?.current?.temperatureC || 32}°C.`}
                />
              </div>

              {/* Side context info */}
              <div className="lg:col-span-4 space-y-4">
                <WeatherWidget
                  weather={weather}
                  isLoading={isWeatherLoading}
                  onRefresh={() =>
                    fetchWeather(
                      preferences.startingLocation.latitude,
                      preferences.startingLocation.longitude,
                      preferences.startingLocation.name
                    )
                  }
                />

                <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                    Assistant Grounding Rules (SRS FR-44)
                  </h4>
                  <p className="leading-relaxed">
                    The assistant communicates strictly using verified destination details (fees in INR, opening hours, hill rules) and Open-Meteo forecasts. It does NOT invent live traffic congestion or fabricate unverified places.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-indigo-600" />
            <span className="font-bold text-slate-900">AI-TRAVELMATE</span>
            <span>· Intelligent Travel Planning System (MVP v1.0)</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>OpenStreetMap</span>
            <span>·</span>
            <span>Open-Meteo (CC BY 4.0)</span>
            <span>·</span>
            <span>OSRM Project</span>
            <span>·</span>
            <span>Gemini 3.8 Flash</span>
          </div>
        </div>
      </footer>

      {/* Evaluation & SRS Lab Modal */}
      <EvaluationModal
        isOpen={isEvaluationOpen}
        onClose={() => setIsEvaluationOpen(false)}
      />

      {/* Saved Trips Modal */}
      <SavedTripsModal
        isOpen={isSavedTripsModalOpen}
        onClose={() => setIsSavedTripsModalOpen(false)}
        savedTrips={savedTrips}
        onLoadTrip={(trip) => {
          setItinerary(trip);
          setActiveTab('itinerary');
          showToast(`Loaded ${trip.title}`);
        }}
        onDeleteTrip={handleDeleteSavedTrip}
      />
    </div>
  );
}
