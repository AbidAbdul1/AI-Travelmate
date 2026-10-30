export type DestinationCategory =
  | 'All'
  | 'Heritage & Temples'
  | 'Caves & Architecture'
  | 'Nature & Islands'
  | 'Culture & Museums'
  | 'Parks & Recreation'
  | 'Food & Cuisine';

export interface Destination {
  id: string;
  name: string;
  category: 'Heritage & Temples' | 'Caves & Architecture' | 'Nature & Islands' | 'Culture & Museums' | 'Parks & Recreation' | 'Food & Cuisine';
  latitude: number;
  longitude: number;
  description: string;
  shortDescription: string;
  imageUrl?: string;
  rating: number;
  reviewsCount: number;
  feeINR: number;
  estimatedDurationMin: number;
  bestTimeToVisit: string;
  openingHours: string;
  address: string;
  dataSource: string;
  isOutdoor: boolean;
  tags: string[];
}

export interface ScoringWeights {
  preferenceMatch: number;      // e.g. 0.35
  budgetSuitability: number;     // e.g. 0.25
  travelTimeSuitability: number; // e.g. 0.20
  weatherSuitability: number;    // e.g. 0.20
}

export interface UserPreference {
  startingLocation: {
    name: string;
    latitude: number;
    longitude: number;
  };
  interests: string[];
  budget: 'budget' | 'moderate' | 'luxury';
  tripDurationDays: number;
  travelMode: 'driving' | 'transit' | 'walking';
  departureTime: string; // e.g. "09:00"
  scoringWeights: ScoringWeights;
}

export interface ScoredDestination {
  destination: Destination;
  scores: {
    preferenceMatch: number;      // 0 - 100
    budgetSuitability: number;    // 0 - 100
    travelTimeSuitability: number;// 0 - 100
    weatherSuitability: number;   // 0 - 100
    finalScore: number;           // 0 - 100
  };
  explanation: string;
  distanceFromOriginKm: number;
  estimatedTravelTimeMin: number;
  weatherSuitabilityStatus: 'Optimal' | 'Favorable' | 'Caution' | 'Adverse';
  weatherNotes?: string;
}

export interface WeatherCondition {
  temperatureC: number;
  apparentTemperatureC: number;
  weatherCode: number;
  weatherDescription: string;
  precipitationMm: number;
  precipitationProbability: number;
  relativeHumidity: number;
  windSpeedKmh: number;
  uvIndex: number;
  isDay: boolean;
}

export interface WeatherData {
  locationName: string;
  latitude: number;
  longitude: number;
  current: WeatherCondition;
  hourly: Array<{
    time: string;
    temperatureC: number;
    precipitationProbability: number;
    weatherCode: number;
    condition: string;
  }>;
  daily: Array<{
    date: string;
    maxTempC: number;
    minTempC: number;
    precipitationProbability: number;
    weatherCode: number;
    condition: string;
    warning?: string;
  }>;
  advisories: string[];
  dataSource: string;
  retrievalTimestamp: string;
}

export interface RouteStep {
  instruction: string;
  distanceMeters: number;
  durationSeconds: number;
}

export interface RouteCalculationResult {
  origin: { name: string; latitude: number; longitude: number };
  destination: { name: string; latitude: number; longitude: number };
  distanceKm: number;
  baseDurationMin: number;
  trafficAdjustedDurationMin: number;
  trafficCongestionLevel: 'Low' | 'Moderate' | 'Heavy' | 'Severe';
  trafficDelayMin: number;
  routeGeometry: [number, number][]; // [lat, lng] pairs for Leaflet polyline
  steps?: RouteStep[];
  routingSource: string; // e.g. "OSRM (Open Source Routing Machine)"
  trafficSource: string; // e.g. "Random Forest Regressor + Historical Baseline (Prediction)"
  calculationTimestamp: string;
}

export interface TrafficPredictionResult {
  roadSegmentId: string;
  roadName: string;
  departureTime: string;
  predictedSpeedKmh: number;
  freeFlowSpeedKmh: number;
  congestionLevel: 'Low' | 'Moderate' | 'Heavy' | 'Severe';
  congestionIndex: number; // 0 - 100
  confidenceScore: number; // 0 - 100
  dataCategory: 'Prediction' | 'Historical Estimate' | 'Live Observation';
  modelVersion: string;
  timestamp: string;
  evaluationMetrics: {
    maeMinutes: number;
    rmseMinutes: number;
    baselineMaeMinutes: number;
    sampleValidationCount: number;
  };
  hourlyTrends: Array<{
    hour: string;
    congestionLevel: 'Low' | 'Moderate' | 'Heavy' | 'Severe';
    speedKmh: number;
    travelDurationMin: number;
  }>;
  featuresUsed: {
    hourOfDay: number;
    dayOfWeek: string;
    precipitationFriction: number;
    roadArterialIndex: number;
  };
  disclaimer: string;
}

export interface ItineraryItem {
  id: string;
  destination: Destination;
  order: number;
  dayNumber: number;
  timeSlot: string; // "09:00 - 10:30"
  durationMin: number;
  travelTimeFromPreviousMin?: number;
  travelDistanceFromPreviousKm?: number;
  trafficLevel?: 'Low' | 'Moderate' | 'Heavy';
  weatherAlert?: string;
  userNotes?: string;
}

export interface ItineraryDay {
  dayNumber: number;
  date: string;
  items: ItineraryItem[];
  totalDistanceKm: number;
  totalDurationMin: number;
}

export interface ItineraryPlan {
  id: string;
  title: string;
  startingLocation: { name: string; latitude: number; longitude: number };
  createdAt: string;
  updatedAt: string;
  days: ItineraryDay[];
  totalDestinations: number;
  totalEstimatedBudgetINR: number;
  aiExplanation?: string;
}

export interface AssistantMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  groundedDestinations?: string[];
  suggestedActions?: string[];
}
