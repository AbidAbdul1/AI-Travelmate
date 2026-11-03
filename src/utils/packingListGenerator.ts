import { Destination, PackingItem, WeatherData } from '../types/travel';

export function generatePackingList(
  tripDurationDays: number,
  weather: WeatherData | null,
  destinations: Destination[],
  travelersCount: number = 1
): PackingItem[] {
  const items: PackingItem[] = [];
  const days = Math.max(1, Number(tripDurationDays) || 1);
  const tempC = weather?.current?.temperatureC ?? 32;
  const precipProb = weather?.current?.precipitationProbability ?? 15;
  const isRaining = precipProb > 30 || (weather?.current?.weatherDescription || '').toLowerCase().includes('rain');
  const isHot = tempC >= 28;
  const isCool = tempC < 20;

  // Check destination categories
  const destCategories = destinations.map((d) => d.category);
  const destNames = destinations.map((d) => d.name.toLowerCase());
  const hasTemples = destCategories.some((c) => c === 'Heritage & Temples') || destNames.some((n) => n.includes('temple') || n.includes('devasthanam') || n.includes('shrine'));
  const hasWaterOrNature = destCategories.some((c) => c === 'Nature & Islands' || c === 'Parks & Recreation') || destNames.some((n) => n.includes('island') || n.includes('river') || n.includes('barrage') || n.includes('park'));
  const hasCavesOrTrek = destCategories.some((c) => c === 'Caves & Architecture') || destNames.some((n) => n.includes('cave') || n.includes('hill') || n.includes('trek'));

  // 1. CLOTHING & FOOTWEAR (Scaled to Trip Duration)
  const outfitCount = Math.min(days + 1, 10);
  items.push({
    id: 'pack-clothing-outfits',
    category: 'clothing',
    title: `${outfitCount}× Breathable Daytime Outfits`,
    subtitle: isHot
      ? `Lightweight cotton or linen shirts/t-shirts & trousers for ${days} day(s)`
      : `Comfortable casual outfits suited for ${tempC}°C climate`,
    packed: false,
    isAutoSuggested: true,
    requiredForCondition: `${days}-Day Trip Duration`,
    count: outfitCount,
  });

  const undergarmentCount = days + 2;
  items.push({
    id: 'pack-clothing-undergarments',
    category: 'clothing',
    title: `${undergarmentCount}× Sets of Undergarments & Socks`,
    subtitle: 'Breathable moisture-wicking fabrics recommended',
    packed: false,
    isAutoSuggested: true,
    requiredForCondition: `${days}-Day Trip Duration`,
    count: undergarmentCount,
  });

  const nightwearCount = Math.max(1, Math.min(Math.ceil(days / 2), 4));
  items.push({
    id: 'pack-clothing-nightwear',
    category: 'clothing',
    title: `${nightwearCount}× Comfortable Sleepwear Sets`,
    subtitle: 'Lightweight nightclothes for hotel / rest stays',
    packed: false,
    isAutoSuggested: true,
    requiredForCondition: `${days}-Day Trip Duration`,
    count: nightwearCount,
  });

  items.push({
    id: 'pack-clothing-walking-shoes',
    category: 'clothing',
    title: 'Comfortable Cushioned Walking Sneakers',
    subtitle: 'Broken-in walking shoes for heritage walks, monuments, and multi-hour exploration',
    packed: false,
    isAutoSuggested: true,
    requiredForCondition: `${destinations.length} Destination(s) to Explore`,
  });

  items.push({
    id: 'pack-clothing-sandals',
    category: 'clothing',
    title: 'Easy Slip-On Sandals / Flip-Flops',
    subtitle: 'Quick to slide off at temple entrances and relaxed evening walks',
    packed: false,
    isAutoSuggested: true,
    requiredForCondition: 'Essential for Indian Landmarks & Evening Ease',
  });

  if (days >= 5) {
    items.push({
      id: 'pack-clothing-laundry',
      category: 'clothing',
      title: 'Travel Detergent Sachets & Laundry Bag',
      subtitle: 'To freshen up quick-dry garments during extended journeys',
      packed: false,
      isAutoSuggested: true,
      requiredForCondition: `Extended Trip (${days} Days)`,
    });
  }

  // 2. WEATHER-ADAPTIVE GEAR
  if (isRaining) {
    items.push({
      id: 'pack-weather-umbrella',
      category: 'weather',
      title: 'Compact Windproof Travel Umbrella',
      subtitle: `Forecast predicts ${precipProb}% chance of rain / showers`,
      packed: false,
      isAutoSuggested: true,
      requiredForCondition: `Rain Alert: ${precipProb}% precipitation`,
    });
    items.push({
      id: 'pack-weather-raincoat',
      category: 'weather',
      title: 'Packable Lightweight Rain Poncho / Jacket',
      subtitle: 'Shields backpacks, cameras, and personal gear during unexpected downpours',
      packed: false,
      isAutoSuggested: true,
      requiredForCondition: `Rain Alert (${precipProb}%)`,
    });
    items.push({
      id: 'pack-weather-waterproof-pouch',
      category: 'weather',
      title: 'Waterproof Phone & Document Pouch',
      subtitle: 'Keeps smartphones, cash notes, and travel IDs safe and bone-dry',
      packed: false,
      isAutoSuggested: true,
      requiredForCondition: 'Precipitation Protection',
    });
  }

  if (isHot) {
    items.push({
      id: 'pack-weather-sunscreen',
      category: 'weather',
      title: 'Broad-Spectrum Sunscreen (SPF 50+ PA+++)',
      subtitle: `Essential UV defence under tropical ${tempC}°C outdoor sunshine`,
      packed: false,
      isAutoSuggested: true,
      requiredForCondition: `Tropical Heat (${tempC}°C)`,
    });
    items.push({
      id: 'pack-weather-sunglasses',
      category: 'weather',
      title: 'UV-400 Polarized Sunglasses',
      subtitle: 'Protects eyes from harsh reflective glare across riverfronts and monuments',
      packed: false,
      isAutoSuggested: true,
      requiredForCondition: `Bright Outdoor Sunshine (${tempC}°C)`,
    });
    items.push({
      id: 'pack-weather-sunhat',
      category: 'weather',
      title: 'Wide-Brim Sun Hat / Cotton Cap',
      subtitle: 'Shields neck and face during midday heritage courtyard tours',
      packed: false,
      isAutoSuggested: true,
      requiredForCondition: `High UV & Heat (${tempC}°C)`,
    });
    items.push({
      id: 'pack-weather-water-bottle',
      category: 'weather',
      title: 'Reusable Insulated Steel Water Bottle',
      subtitle: 'Keeps water chilled for 12+ hours throughout city transfers',
      packed: false,
      isAutoSuggested: true,
      requiredForCondition: 'Hydration in Warm Weather',
    });
    items.push({
      id: 'pack-weather-electrolytes',
      category: 'weather',
      title: 'Oral Rehydration Salts (ORS) / Electrolyte Sachets',
      subtitle: 'Prevents heat fatigue, dehydration, and afternoon energy slumps',
      packed: false,
      isAutoSuggested: true,
      requiredForCondition: `Heat Advisory: ${tempC}°C`,
    });
  }

  if (isCool) {
    items.push({
      id: 'pack-weather-jacket',
      category: 'weather',
      title: 'Lightweight Fleece Jacket / Windbreaker',
      subtitle: `Morning and late-night temperatures dip to ~${tempC}°C`,
      packed: false,
      isAutoSuggested: true,
      requiredForCondition: `Cool Weather (${tempC}°C)`,
    });
    items.push({
      id: 'pack-weather-lipbalm',
      category: 'weather',
      title: 'Moisturizing Lip Balm & Hand Lotion',
      subtitle: 'Prevents dry skin and chapping in breeze',
      packed: false,
      isAutoSuggested: true,
      requiredForCondition: `Chilly Wind (${tempC}°C)`,
    });
  }

  // 3. DESTINATION & CULTURAL ETIQUETTE
  if (hasTemples) {
    items.push({
      id: 'pack-cult-attire',
      category: 'cultural',
      title: 'Modest Traditional Attire (Kurtas / Long Pants / Scarf)',
      subtitle: 'Temple protocol requires covered shoulders & knees; avoids entry restrictions',
      packed: false,
      isAutoSuggested: true,
      requiredForCondition: 'Temple Entry Dress Code (e.g. Kanaka Durga Temple)',
    });
    items.push({
      id: 'pack-cult-coins',
      category: 'cultural',
      title: 'Coin Pouch & Small Currency Notes (₹10, ₹20, ₹50)',
      subtitle: 'For footwear counters, prasad offerings, temple special queue tokens, and auto drivers',
      packed: false,
      isAutoSuggested: true,
      requiredForCondition: 'Temple Footwear Stand & Cash Offerings',
    });
    items.push({
      id: 'pack-cult-scarf',
      category: 'cultural',
      title: 'Light Cotton Scarf / Angavastram / Dupatta',
      subtitle: 'Multi-purpose cover for shrine darshan and head protection from the sun',
      packed: false,
      isAutoSuggested: true,
      requiredForCondition: 'Sacred Sanctum Etiquette',
    });
  }

  if (hasWaterOrNature) {
    items.push({
      id: 'pack-water-repellent',
      category: 'cultural',
      title: 'Mosquito & Bug Repellent (DEET / Odomos)',
      subtitle: 'Essential around riverbanks, Bhavani Island, and lush botanical parks at dusk',
      packed: false,
      isAutoSuggested: true,
      requiredForCondition: 'River & Island Environment (Bhavani Island)',
    });
    items.push({
      id: 'pack-water-towel',
      category: 'cultural',
      title: 'Quick-Dry Microfiber Towel',
      subtitle: 'Compact towel for boat rides, ferry transfers, and river promenade strolls',
      packed: false,
      isAutoSuggested: true,
      requiredForCondition: 'Waterway / Boating Activities',
    });
  }

  if (hasCavesOrTrek) {
    items.push({
      id: 'pack-cave-torch',
      category: 'cultural',
      title: 'Pocket LED Flashlight or Phone Torch Diffuser',
      subtitle: 'Helps inspect rock-cut sculptures and inner sanctums at Undavalli Caves',
      packed: false,
      isAutoSuggested: true,
      requiredForCondition: 'Cave & Rock-Cut Monuments (Undavalli Caves)',
    });
  }

  // 4. HEALTH, PHARMACY & HYGIENE
  items.push({
    id: 'pack-health-firstaid',
    category: 'health',
    title: 'Travel First-Aid Pouch',
    subtitle: 'Band-aids, antiseptic liquid/cream, blister prevention pads',
    packed: false,
    isAutoSuggested: true,
    requiredForCondition: 'Travel Safety & Walking Relief',
  });

  items.push({
    id: 'pack-health-meds',
    category: 'health',
    title: 'General Travel Pharmacy Kit',
    subtitle: 'Paracetamol, antacids (Digene/Eno), motion sickness pills, anti-diarrheal',
    packed: false,
    isAutoSuggested: true,
    requiredForCondition: 'Digestive & Travel Wellness',
  });

  items.push({
    id: 'pack-health-prescriptions',
    category: 'health',
    title: `Prescribed Personal Medications (${days + 2} Days Supply)`,
    subtitle: 'Always carry a 2-day buffer beyond planned duration in original packaging',
    packed: false,
    isAutoSuggested: true,
    requiredForCondition: `${days}-Day Itinerary Coverage`,
  });

  items.push({
    id: 'pack-health-sanitizer',
    category: 'health',
    title: 'Pocket Hand Sanitizer & Disinfectant Wipes',
    subtitle: '70% alcohol hand rub for hygiene before sampling authentic street food',
    packed: false,
    isAutoSuggested: true,
    requiredForCondition: 'On-the-Go Dining & Cleanliness',
  });

  // 5. TECH, DOCUMENTS & LOGISTICS
  items.push({
    id: 'pack-tech-powerbank',
    category: 'tech_docs',
    title: '10,000+ mAh High-Speed Power Bank',
    subtitle: 'Prevents dead phone battery while navigating GPS routes & capturing photos',
    packed: false,
    isAutoSuggested: true,
    requiredForCondition: 'All-Day Phone Navigation & Photography',
  });

  items.push({
    id: 'pack-tech-id',
    category: 'tech_docs',
    title: 'Government Photo ID (Aadhaar / Driving License / Passport)',
    subtitle: 'Mandatory for hotel check-ins, ASI monument tickets, and ferry boarding',
    packed: false,
    isAutoSuggested: true,
    requiredForCondition: 'Mandatory Identity Verification',
  });

  items.push({
    id: 'pack-tech-cables',
    category: 'tech_docs',
    title: 'Multi-Cable Charging Kit & Car USB Adapter',
    subtitle: 'Phone charging cables, car cigarette lighter adapter for road trips',
    packed: false,
    isAutoSuggested: true,
    requiredForCondition: 'Mobile Power on Road Circuit',
  });

  items.push({
    id: 'pack-tech-offline-sheet',
    category: 'tech_docs',
    title: 'Printed Offline Travel Sheet & Downloaded Google Maps',
    subtitle: 'Crucial when traveling through weak network patches or remote valley zones',
    packed: false,
    isAutoSuggested: true,
    requiredForCondition: 'Offline Redundancy & Signal Backup',
  });

  items.push({
    id: 'pack-tech-cash',
    category: 'tech_docs',
    title: 'Emergency Cash Fund (₹2,000 – ₹5,000 in ₹100/₹200 notes)',
    subtitle: 'For spots where UPI or QR scanner servers face temporary connectivity drops',
    packed: false,
    isAutoSuggested: true,
    requiredForCondition: 'Offline Payment Contingency',
  });

  return items;
}
