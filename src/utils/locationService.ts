/**
 * High-Reliability Geolocation Service with Multi-Tier Fallback:
 * 1. Hardware Browser GPS (10s generous timeout so user has time to click 'Allow')
 * 2. Direct Client-Side Browser IP Lookup (ipwho.is, freeipapi.com, ipapi.co)
 * 3. Server-side proxy check (strictly discarding datacenter container IPs)
 * 4. Graceful Indian regional transit hub preset
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

// Discard false datacenter readings (such as cloud container IPs in Taiwan / Google LLC)
function isDatacenterLocation(country?: string, city?: string, org?: string): boolean {
  if (country === 'Taiwan' || city === 'Taipei') return true;
  if (org && /Google|Amazon|Microsoft|Cloud|DigitalOcean/i.test(org)) return true;
  return false;
}

export async function detectUserLocation(): Promise<DetectedLocation> {
  // Step 1: Try real browser geolocation with generous timeout
  if (typeof navigator !== 'undefined' && navigator.geolocation) {
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
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
      console.warn('High-accuracy GPS failed or timed out, trying coarse / client IP...');
    }
  }

  // Step 2: Direct Client-Side Browser IP Geolocation (Queries directly from traveler's browser/ISP)
  // 2A: ipwho.is (Free, CORS-friendly, SSL, returns city, region, country, lat, lon)
  try {
    const res = await fetch('https://ipwho.is/', {
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const d = await res.json();
      if (d.success && d.latitude && d.longitude && !isDatacenterLocation(d.country, d.city, d.connection?.org)) {
        const placeName = [d.city, d.region, d.country].filter(Boolean).join(', ');
        return {
          name: placeName || `${d.city}, ${d.country}`,
          latitude: Number(d.latitude),
          longitude: Number(d.longitude),
          city: d.city,
          state: d.region,
          country: d.country,
          source: 'ip-geolocation',
        };
      }
    }
  } catch (ipWhoErr) {
    console.warn('ipwho.is client lookup failed:', ipWhoErr);
  }

  // 2B: freeipapi.com fallback
  try {
    const res2 = await fetch('https://freeipapi.com/api/json');
    if (res2.ok) {
      const d2 = await res2.json();
      if (d2.latitude && d2.longitude && !isDatacenterLocation(d2.countryName, d2.cityName)) {
        const placeName = [d2.cityName, d2.regionName, d2.countryName].filter(Boolean).join(', ');
        return {
          name: placeName || `${d2.cityName}, ${d2.countryName}`,
          latitude: Number(d2.latitude),
          longitude: Number(d2.longitude),
          city: d2.cityName,
          state: d2.regionName,
          country: d2.countryName,
          source: 'ip-geolocation',
        };
      }
    }
  } catch (freeIpErr) {
    console.warn('freeipapi lookup failed:', freeIpErr);
  }

  // 2C: ipapi.co direct client fallback
  try {
    const res3 = await fetch('https://ipapi.co/json/');
    if (res3.ok) {
      const d3 = await res3.json();
      if (d3.latitude && d3.longitude && !isDatacenterLocation(d3.country_name, d3.city, d3.org)) {
        const placeName = [d3.city, d3.region, d3.country_name].filter(Boolean).join(', ');
        return {
          name: placeName,
          latitude: Number(d3.latitude),
          longitude: Number(d3.longitude),
          city: d3.city,
          state: d3.region,
          country: d3.country_name,
          source: 'ip-geolocation',
        };
      }
    }
  } catch (ipapiErr) {
    console.warn('ipapi.co direct lookup failed:', ipapiErr);
  }

  // Step 3: Backend proxy geocode (Only if backend resolved a non-datacenter client IP)
  try {
    const ipRes = await fetch('/api/geocode/ip');
    if (ipRes.ok) {
      const data = await ipRes.json();
      if (data.success && data.latitude && data.longitude && !isDatacenterLocation(data.country, data.city)) {
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
  } catch (backendIpErr) {
    console.warn('Backend proxy lookup failed:', backendIpErr);
  }

  // Step 4: Graceful regional transit hub default (Central South India Hub)
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
