/**
 * High-Reliability Geolocation Service with Multi-Tier Fallback (Browser GPS -> Wifi/Cell -> Server IP Geolocation)
 * Solves iframe sandbox permission restrictions, desktop timeouts, and inaccurate coordinate issues.
 */

export interface DetectedLocation {
  name: string;
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  country?: string;
  source: 'gps-high-accuracy' | 'network-coarse' | 'ip-geolocation' | 'preset';
}

export async function detectUserLocation(): Promise<DetectedLocation> {
  // Step 1: Try browser geolocation (Tier 1: High Accuracy, 4s timeout)
  if (typeof navigator !== 'undefined' && navigator.geolocation) {
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 4500,
          maximumAge: 30000,
        });
      });

      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      const reverseName = await reverseGeocodeCoord(lat, lon);

      return {
        name: reverseName || `Current GPS Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`,
        latitude: lat,
        longitude: lon,
        source: 'gps-high-accuracy',
      };
    } catch (gpsHighErr) {
      // Step 2: Try browser geolocation (Tier 2: Coarse Network Accuracy, 3s timeout)
      try {
        const coarsePos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 3500,
            maximumAge: 60000,
          });
        });

        const lat = coarsePos.coords.latitude;
        const lon = coarsePos.coords.longitude;
        const reverseName = await reverseGeocodeCoord(lat, lon);

        return {
          name: reverseName || `Current Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`,
          latitude: lat,
          longitude: lon,
          source: 'network-coarse',
        };
      } catch (gpsCoarseErr) {
        console.warn('Browser GPS unavailable or timed out in iframe, falling back to IP Geolocation...');
      }
    }
  }

  // Step 3: Tier 3 - IP-Based Geolocation via Backend Proxy
  try {
    const ipRes = await fetch('/api/geocode/ip');
    if (ipRes.ok) {
      const data = await ipRes.json();
      if (data.success && data.latitude && data.longitude) {
        return {
          name: data.name || `${data.city || 'Detected Location'}, ${data.region || data.country || ''}`,
          latitude: data.latitude,
          longitude: data.longitude,
          city: data.city,
          state: data.region,
          country: data.country,
          source: 'ip-geolocation',
        };
      }
    }
  } catch (ipErr) {
    console.warn('Backend IP geolocator failed, attempting direct IP check:', ipErr);
  }

  // Step 4: Tier 4 - Client-side public IP fallback
  try {
    const directIpRes = await fetch('https://ipapi.co/json/');
    if (directIpRes.ok) {
      const data = await directIpRes.json();
      if (data.latitude && data.longitude) {
        const placeName = data.city && data.region ? `${data.city}, ${data.region}` : data.city || 'My Location';
        return {
          name: placeName,
          latitude: data.latitude,
          longitude: data.longitude,
          city: data.city,
          state: data.region,
          country: data.country_name,
          source: 'ip-geolocation',
        };
      }
    }
  } catch (directErr) {
    console.warn('Direct IP check failed:', directErr);
  }

  // Final graceful fallback if completely offline or restricted
  return {
    name: 'Hyderabad Central Junction, Telangana, India',
    latitude: 17.4339,
    longitude: 78.5042,
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    source: 'preset',
  };
}

export async function reverseGeocodeCoord(lat: number, lon: number): Promise<string | null> {
  try {
    const res = await fetch(`/api/geocode/reverse?latitude=${lat}&longitude=${lon}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.name) {
        return data.name;
      }
    }
  } catch (e) {
    console.warn('Reverse geocode error:', e);
  }
  return null;
}
