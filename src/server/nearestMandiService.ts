import { loadPersistedOfficialHistory, toCanonicalState } from './providers/agmarknetProvider';

export interface MandiCoordinate {
  market: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
}

export interface NearestMandiResponse {
  success: boolean;
  mandi?: {
    name: string;
    market: string;
    district: string;
    state: string;
    latitude: number;
    longitude: number;
    distanceKm: number;
  };
  latestRate?: {
    minPrice: number;
    modalPrice: number;
    maxPrice: number;
    unit: string;
    date: string;
    commodity: string;
    variety?: string;
  };
  source?: string;
  message?: string;
}

/**
 * Authoritative APMC Mandi Coordinates Database across India
 * Contains real geographical latitudes and longitudes for agricultural markets and district centers.
 */
export const MANDI_COORDINATES_DB: MandiCoordinate[] = [
  // --- Uttar Pradesh ---
  { market: 'Bareilly APMC', district: 'Bareilly', state: 'Uttar Pradesh', latitude: 28.3670, longitude: 79.4304 },
  { market: 'Baheri APMC', district: 'Bareilly', state: 'Uttar Pradesh', latitude: 28.7833, longitude: 79.5000 },
  { market: 'Fatehabad APMC', district: 'Agra', state: 'Uttar Pradesh', latitude: 27.0210, longitude: 78.3075 },
  { market: 'Agra APMC', district: 'Agra', state: 'Uttar Pradesh', latitude: 27.1767, longitude: 78.0081 },
  { market: 'Meerut APMC', district: 'Meerut', state: 'Uttar Pradesh', latitude: 28.9845, longitude: 77.7064 },
  { market: 'Moradabad APMC', district: 'Moradabad', state: 'Uttar Pradesh', latitude: 28.8386, longitude: 78.7733 },
  { market: 'Bulandshahr APMC', district: 'Bulandshahr', state: 'Uttar Pradesh', latitude: 28.4069, longitude: 77.8498 },
  { market: 'Badaun APMC', district: 'Badaun', state: 'Uttar Pradesh', latitude: 28.0315, longitude: 79.1278 },
  { market: 'Lucknow APMC', district: 'Lucknow', state: 'Uttar Pradesh', latitude: 26.8467, longitude: 80.9462 },
  { market: 'Kanpur APMC', district: 'Kanpur', state: 'Uttar Pradesh', latitude: 26.4499, longitude: 80.3319 },
  { market: 'Varanasi APMC', district: 'Varanasi', state: 'Uttar Pradesh', latitude: 25.3176, longitude: 82.9739 },
  { market: 'Aligarh APMC', district: 'Aligarh', state: 'Uttar Pradesh', latitude: 27.8974, longitude: 78.0880 },
  { market: 'Mathura APMC', district: 'Mathura', state: 'Uttar Pradesh', latitude: 27.4924, longitude: 77.6737 },
  { market: 'Sitapur APMC', district: 'Sitapur', state: 'Uttar Pradesh', latitude: 27.5685, longitude: 80.6829 },
  { market: 'Lakhimpur APMC', district: 'Khiri (Lakhimpur)', state: 'Uttar Pradesh', latitude: 27.9462, longitude: 80.7785 },
  { market: 'Sambhal APMC', district: 'Sambhal', state: 'Uttar Pradesh', latitude: 28.5833, longitude: 78.5667 },
  { market: 'Balrampur APMC', district: 'Balrampur', state: 'Uttar Pradesh', latitude: 27.4300, longitude: 82.1800 },

  // --- Madhya Pradesh ---
  { market: 'Sanwer APMC', district: 'Indore', state: 'Madhya Pradesh', latitude: 22.9774, longitude: 75.8239 },
  { market: 'Indore APMC', district: 'Indore', state: 'Madhya Pradesh', latitude: 22.7196, longitude: 75.8577 },
  { market: 'Ujjain APMC', district: 'Ujjain', state: 'Madhya Pradesh', latitude: 23.1765, longitude: 75.7885 },
  { market: 'Dewas APMC', district: 'Dewas', state: 'Madhya Pradesh', latitude: 22.9676, longitude: 76.0534 },
  { market: 'Bhopal APMC', district: 'Bhopal', state: 'Madhya Pradesh', latitude: 23.2599, longitude: 77.4126 },
  { market: 'Sehore APMC', district: 'Sehore', state: 'Madhya Pradesh', latitude: 23.2033, longitude: 77.0844 },
  { market: 'Shivpuri APMC', district: 'Shivpuri', state: 'Madhya Pradesh', latitude: 25.4320, longitude: 77.6582 },
  { market: 'Gwalior APMC', district: 'Gwalior', state: 'Madhya Pradesh', latitude: 26.2183, longitude: 78.1828 },
  { market: 'Jabalpur APMC', district: 'Jabalpur', state: 'Madhya Pradesh', latitude: 23.1815, longitude: 79.9864 },

  // --- Andhra Pradesh ---
  { market: 'Markapuram APMC', district: 'Prakasam', state: 'Andhra Pradesh', latitude: 15.7354, longitude: 79.2709 },
  { market: 'Ongole APMC', district: 'Prakasam', state: 'Andhra Pradesh', latitude: 15.5057, longitude: 80.0499 },
  { market: 'Guntur APMC', district: 'Guntur', state: 'Andhra Pradesh', latitude: 16.3067, longitude: 80.4365 },
  { market: 'Narasaraopet APMC', district: 'Palnadu', state: 'Andhra Pradesh', latitude: 16.2354, longitude: 80.0499 },
  { market: 'Anakapally APMC', district: 'Anakapally', state: 'Andhra Pradesh', latitude: 17.6913, longitude: 83.0039 },
  { market: 'Vijayawada APMC', district: 'Krishna', state: 'Andhra Pradesh', latitude: 16.5062, longitude: 80.6480 },
  { market: 'Kurnool APMC', district: 'Kurnool', state: 'Andhra Pradesh', latitude: 15.8281, longitude: 78.0373 },
  { market: 'Anantapur APMC', district: 'Anantapur', state: 'Andhra Pradesh', latitude: 14.6819, longitude: 77.6006 },

  // --- Punjab ---
  { market: 'Ludhiana APMC', district: 'Ludhiana', state: 'Punjab', latitude: 30.9010, longitude: 75.8573 },
  { market: 'Khanna APMC', district: 'Ludhiana', state: 'Punjab', latitude: 30.7066, longitude: 76.2205 },
  { market: 'Amritsar APMC', district: 'Amritsar', state: 'Punjab', latitude: 31.6340, longitude: 74.8723 },
  { market: 'Jalandhar APMC', district: 'Jalandhar', state: 'Punjab', latitude: 31.3260, longitude: 75.5762 },
  { market: 'Patiala APMC', district: 'Patiala', state: 'Punjab', latitude: 30.3398, longitude: 76.3869 },
  { market: 'Bathinda APMC', district: 'Bathinda', state: 'Punjab', latitude: 30.2110, longitude: 74.9455 },

  // --- Haryana ---
  { market: 'Karnal APMC', district: 'Karnal', state: 'Haryana', latitude: 29.6857, longitude: 76.9905 },
  { market: 'Kurukshetra APMC', district: 'Kurukshetra', state: 'Haryana', latitude: 29.9695, longitude: 76.8783 },
  { market: 'Ambala APMC', district: 'Ambala', state: 'Haryana', latitude: 30.3782, longitude: 76.7767 },
  { market: 'Rohtak APMC', district: 'Rohtak', state: 'Haryana', latitude: 28.8955, longitude: 76.6066 },
  { market: 'Hisar APMC', district: 'Hisar', state: 'Haryana', latitude: 29.1492, longitude: 75.7217 },
  { market: 'Sirsa APMC', district: 'Sirsa', state: 'Haryana', latitude: 29.5349, longitude: 75.0289 },

  // --- Rajasthan ---
  { market: 'Jaipur APMC', district: 'Jaipur', state: 'Rajasthan', latitude: 26.9124, longitude: 75.7873 },
  { market: 'Kota APMC', district: 'Kota', state: 'Rajasthan', latitude: 25.2138, longitude: 75.8648 },
  { market: 'Sri Ganganagar APMC', district: 'Ganganagar', state: 'Rajasthan', latitude: 29.9094, longitude: 73.8799 },
  { market: 'Bikaner APMC', district: 'Bikaner', state: 'Rajasthan', latitude: 28.0229, longitude: 73.3119 },
  { market: 'Jodhpur APMC', district: 'Jodhpur', state: 'Rajasthan', latitude: 26.2389, longitude: 73.0243 },

  // --- Maharashtra ---
  { market: 'Nashik APMC', district: 'Nashik', state: 'Maharashtra', latitude: 19.9975, longitude: 73.7898 },
  { market: 'Lasalgaon APMC', district: 'Nashik', state: 'Maharashtra', latitude: 20.1472, longitude: 74.2267 },
  { market: 'Pune APMC', district: 'Pune', state: 'Maharashtra', latitude: 18.5204, longitude: 73.8567 },
  { market: 'Nagpur APMC', district: 'Nagpur', state: 'Maharashtra', latitude: 21.1458, longitude: 79.0882 },

  // --- Gujarat ---
  { market: 'Ahmedabad APMC', district: 'Ahmedabad', state: 'Gujarat', latitude: 23.0225, longitude: 72.5714 },
  { market: 'Rajkot APMC', district: 'Rajkot', state: 'Gujarat', latitude: 22.3039, longitude: 70.8022 },
  { market: 'Gondal APMC', district: 'Rajkot', state: 'Gujarat', latitude: 21.9619, longitude: 70.7923 },

  // --- Bihar ---
  { market: 'Patna APMC', district: 'Patna', state: 'Bihar', latitude: 25.5941, longitude: 85.1376 },
  { market: 'Muzaffarpur APMC', district: 'Muzaffarpur', state: 'Bihar', latitude: 26.1209, longitude: 85.3647 },

  // --- Telangana ---
  { market: 'Nizamabad APMC', district: 'Nizamabad', state: 'Telangana', latitude: 18.6725, longitude: 78.0941 },
  { market: 'Warangal APMC', district: 'Warangal', state: 'Telangana', latitude: 17.9689, longitude: 79.5941 },

  // --- Karnataka ---
  { market: 'Kalaburagi APMC', district: 'Kalaburagi', state: 'Karnataka', latitude: 17.3297, longitude: 76.8343 },
  { market: 'Shivamogga APMC', district: 'Shivamogga', state: 'Karnataka', latitude: 13.9299, longitude: 75.5681 },

  // --- Tamil Nadu ---
  { market: 'Madurai APMC', district: 'Madurai', state: 'Tamil Nadu', latitude: 9.9252, longitude: 78.1198 },
  { market: 'Coimbatore APMC', district: 'Coimbatore', state: 'Tamil Nadu', latitude: 11.0168, longitude: 76.9558 },

  // --- West Bengal ---
  { market: 'Burdwan APMC', district: 'Purba Bardhaman', state: 'West Bengal', latitude: 23.2324, longitude: 87.8615 },
  { market: 'Siliguri APMC', district: 'Darjeeling', state: 'West Bengal', latitude: 26.7271, longitude: 88.3953 },
];

/**
 * Calculates geographical distance between two points in km using the Haversine formula.
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Normalizes commodity input strictly to one of the 4 active KisanSetu crops:
 * 1. Wheat
 * 2. Rice / Paddy
 * 3. Maize
 * 4. Pulses / Chana
 */
export function normalizeActiveCropCommodity(commodity?: string): string {
  if (!commodity) return 'Wheat';
  const c = commodity.trim().toLowerCase();
  if (c.includes('wheat') || c.includes('gehu') || c.includes('gehun')) return 'Wheat';
  if (c.includes('rice') || c.includes('paddy') || c.includes('dhan') || c.includes('chawal')) return 'Rice / Paddy';
  if (c.includes('maize') || c.includes('makka') || c.includes('corn')) return 'Maize';
  if (c.includes('chana') || c.includes('gram') || c.includes('pulse') || c.includes('daal')) return 'Pulses / Chana';
  return 'Wheat';
}

/**
 * Checks if a mandi record's commodity matches the requested active crop family
 */
export function recordMatchesActiveCrop(recordCommodity: string, requestedCrop: string): boolean {
  const normReq = normalizeActiveCropCommodity(requestedCrop);
  const rc = recordCommodity.toLowerCase();

  switch (normReq) {
    case 'Wheat':
      return rc.includes('wheat') || rc.includes('gehu');
    case 'Rice / Paddy':
      return rc.includes('rice') || rc.includes('paddy') || rc.includes('dhan');
    case 'Maize':
      return rc.includes('maize') || rc.includes('makka');
    case 'Pulses / Chana':
      return rc.includes('bengal gram') || rc.includes('gram') || rc.includes('chana') || rc.includes('pulse');
    default:
      return false;
  }
}

/**
 * Finds known coordinates for a given market, district, and state
 */
export function findMandiCoordinates(market: string, district: string, state: string): { latitude: number; longitude: number } | null {
  const canonicalState = toCanonicalState(state);
  const cleanMarket = market.toLowerCase().replace(/\s+apmc(\s+yard)?/gi, '').trim();
  const cleanDistrict = district.toLowerCase().trim();

  // 1. Exact market match
  const exactMarket = MANDI_COORDINATES_DB.find((m) => {
    const mState = toCanonicalState(m.state);
    if (mState !== canonicalState) return false;
    const mMarket = m.market.toLowerCase().replace(/\s+apmc(\s+yard)?/gi, '').trim();
    return mMarket === cleanMarket || mMarket.includes(cleanMarket) || cleanMarket.includes(mMarket);
  });
  if (exactMarket) return { latitude: exactMarket.latitude, longitude: exactMarket.longitude };

  // 2. District match within state
  const districtMatch = MANDI_COORDINATES_DB.find((m) => {
    const mState = toCanonicalState(m.state);
    if (mState !== canonicalState) return false;
    return m.district.toLowerCase() === cleanDistrict || m.district.toLowerCase().includes(cleanDistrict);
  });
  if (districtMatch) return { latitude: districtMatch.latitude, longitude: districtMatch.longitude };

  // 3. Fallback district match across entire DB
  const generalDistrictMatch = MANDI_COORDINATES_DB.find(
    (m) => m.district.toLowerCase() === cleanDistrict
  );
  if (generalDistrictMatch) return { latitude: generalDistrictMatch.latitude, longitude: generalDistrictMatch.longitude };

  return null;
}

/**
 * Finds the nearest real mandi having verified official rate data for the requested crop.
 * Does NOT generate fake rates or pick mandis with missing price data.
 */
export async function findNearestMandiWithRates(params: {
  latitude: number;
  longitude: number;
  commodity: string;
}): Promise<NearestMandiResponse> {
  const { latitude, longitude, commodity } = params;

  if (typeof latitude !== 'number' || isNaN(latitude) || latitude < -90 || latitude > 90) {
    return { success: false, message: 'Invalid latitude parameter.' };
  }
  if (typeof longitude !== 'number' || isNaN(longitude) || longitude < -180 || longitude > 180) {
    return { success: false, message: 'Invalid longitude parameter.' };
  }

  const activeCrop = normalizeActiveCropCommodity(commodity);

  // Load all verified official records from local historical store
  const allHistory = loadPersistedOfficialHistory();

  // Filter records that match the active crop and have a valid modal price
  const matchingRecords = allHistory.filter((r) => {
    if (!r.state || !r.market || !r.commodity) return false;
    const modalPrice = Number(r.modalPriceQuintal || (r as any).modalPrice || 0);
    if (modalPrice <= 0) return false;
    return recordMatchesActiveCrop(r.commodity, activeCrop);
  });

  if (matchingRecords.length === 0) {
    return {
      success: false,
      message: `No verified mandi records found for ${activeCrop} in current government observations.`,
    };
  }

  // Deduplicate by mandi (market + district + state) and select latest observation
  const mandiMap = new Map<string, any>();
  for (const rec of matchingRecords) {
    const key = `${rec.state}|${rec.district}|${rec.market}`.toLowerCase();
    const existing = mandiMap.get(key);
    const date = rec.arrivalDate || (rec as any).observationDate || '';
    const existingDate = existing ? (existing.arrivalDate || existing.observationDate || '') : '';
    if (!existing || date >= existingDate) {
      mandiMap.set(key, rec);
    }
  }

  // Calculate distance for all mandis with known coordinates
  interface CandidateMandi {
    record: any;
    market: string;
    district: string;
    state: string;
    latitude: number;
    longitude: number;
    distanceKm: number;
  }

  const candidates: CandidateMandi[] = [];

  for (const rec of mandiMap.values()) {
    const coords = findMandiCoordinates(rec.market, rec.district, rec.state);
    if (!coords) continue;

    const dist = calculateHaversineDistanceKm(latitude, longitude, coords.latitude, coords.longitude);
    candidates.push({
      record: rec,
      market: rec.market,
      district: rec.district,
      state: toCanonicalState(rec.state),
      latitude: coords.latitude,
      longitude: coords.longitude,
      distanceKm: dist,
    });
  }

  if (candidates.length === 0) {
    return {
      success: false,
      message: `No geographic coordinates available for mandis currently trading ${activeCrop}.`,
    };
  }

  // Sort by geographical distance ascending
  candidates.sort((a, b) => a.distanceKm - b.distanceKm);

  const nearest = candidates[0];
  const rec = nearest.record;
  const modalQ = Number(rec.modalPriceQuintal || rec.modalPrice || 0);
  const minQ = Number(rec.minPriceQuintal || rec.minPrice || modalQ);
  const maxQ = Number(rec.maxPriceQuintal || rec.maxPrice || modalQ);
  const dateStr = rec.arrivalDate || rec.observationDate || '';

  const cleanName = nearest.market.toLowerCase().includes('apmc') || nearest.market.toLowerCase().includes('mandi')
    ? nearest.market
    : `${nearest.market} Mandi`;

  return {
    success: true,
    mandi: {
      name: cleanName,
      market: nearest.market,
      district: nearest.district,
      state: nearest.state,
      latitude: nearest.latitude,
      longitude: nearest.longitude,
      distanceKm: nearest.distanceKm,
    },
    latestRate: {
      minPrice: minQ,
      modalPrice: modalQ,
      maxPrice: maxQ,
      unit: 'quintal',
      date: dateStr,
      commodity: rec.commodity,
      variety: rec.variety || 'Other',
    },
    source: rec.source || 'AGMARKNET (DMI, Ministry of Agriculture & Farmers Welfare, GoI)',
  };
}
