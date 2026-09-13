import {
  OfficialMandiRecord,
  MandiSearchParams,
  MandiSearchResponse,
  MandiComparisonResponse,
  MandiHistoryResponse,
  MandiPriceForecastResponse,
  MandiForecastTelemetryStatus,
} from '../types/market';
import { MarketPriceRecord } from '../types/farmer';

/**
 * Converts an OfficialMandiRecord to the UI MarketPriceRecord model
 */
export function mapOfficialToMarketPriceRecord(official: OfficialMandiRecord): MarketPriceRecord {
  return {
    crop: official.commodity,
    variety: official.variety,
    currentMandiPrice: official.modalPriceKg,
    minPriceToday: official.minPriceKg,
    modalPrice: official.modalPriceKg,
    maxPriceToday: official.maxPriceKg,
    unit: '₹/kg',
    isActualMandiPrice: true,
    isProjectedPrice: false,
    priceChange24h: official.priceChange24h || 0,
    percentChange24h: official.percentChange24h || 0,
    trend: official.trend,
    nearestMandi: `${official.market} APMC Yard, ${official.district} (${official.state})`,
    source: official.source,
    provenanceLabel: official.provenanceLabel,
    qualityRequirements: 'APMC Fair Average Quality (FAQ) Standard Verified Lot',
    buyerDemand: 'High',
    demandLevel: 'Official Mandi Trade Volume',
    lastUpdated: official.lastUpdated,
    sevenDayHistory: official.sevenDayHistory.map((h) => ({
      day: h.day,
      price: h.modalPriceKg,
      actualPrice: h.modalPriceKg,
      projectedPrice: undefined,
    })),
  };
}

/**
 * Client-Side API Service for Mandi Prices:
 * Strictly requests the backend /api/mandi-prices endpoint.
 * No hardcoded/synthetic records are ever injected on failure.
 */
export async function fetchMandiPrices(params: MandiSearchParams): Promise<MandiSearchResponse> {
  try {
    const query = new URLSearchParams();
    if (params.state && params.state !== 'All') query.set('state', params.state);
    if (params.district && params.district !== 'All') query.set('district', params.district);
    if (params.market && params.market !== 'All') query.set('market', params.market);
    if (params.commodity && params.commodity !== 'All') query.set('commodity', params.commodity);
    if (params.variety && params.variety !== 'All') query.set('variety', params.variety);
    if (params.date && params.date !== 'All') query.set('date', params.date);
    if (params.limit) query.set('limit', String(params.limit));

    const response = await fetch(`/api/mandi-prices?${query.toString()}`);
    if (response.ok) {
      const data: MandiSearchResponse = await response.json();
      return data;
    } else {
      const errorJson = await response.json().catch(() => ({}));
      return {
        success: false,
        source: 'official_agmarknet_api',
        isLiveApi: false,
        totalRecords: 0,
        records: [],
        errorMessage: errorJson.errorMessage || errorJson.error || `Server returned HTTP ${response.status}`,
        meta: {
          state: params.state,
          district: params.district,
          market: params.market,
          commodity: params.commodity,
          variety: params.variety,
        },
      };
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Network error';
    return {
      success: false,
      source: 'official_agmarknet_api',
      isLiveApi: false,
      totalRecords: 0,
      records: [],
      errorMessage: `Government mandi data temporarily unavailable (${msg}).`,
      meta: {
        state: params.state,
        district: params.district,
        market: params.market,
        commodity: params.commodity,
        variety: params.variety,
      },
    };
  }
}

export const searchOfficialMandiPrices = fetchMandiPrices;

/**
 * Fetch Mandi Metadata (States, Districts, Commodities)
 */
export async function fetchMandiMetadata(): Promise<{
  states: string[];
  districts: Record<string, string[]>;
  commodities: string[];
}> {
  try {
    const res = await fetch('/api/mandi-meta');
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        return {
          states: data.states || [],
          districts: data.districts || {},
          commodities: data.commodities || [],
        };
      }
    }
  } catch {
    // ignore
  }

  return {
    states: ['All States', 'Uttar Pradesh', 'Punjab', 'Maharashtra', 'Rajasthan', 'Haryana', 'Madhya Pradesh', 'Gujarat', 'Karnataka', 'Andhra Pradesh', 'Telangana', 'Bihar', 'West Bengal', 'Tamil Nadu'],
    districts: {
      'Uttar Pradesh': ['Bareilly', 'Meerut', 'Lucknow', 'Moradabad', 'Agra', 'Varanasi', 'Kanpur'],
    },
    commodities: ['Wheat', 'Rice', 'Paddy(Dhan)', 'Maize', 'Bengal Gram(Gram/Chana)'],
  };
}

/**
 * Fetch Multi-Mandi Comparison
 */
export async function fetchMandiComparison(
  commodity: string = 'Wheat',
  state: string = 'Uttar Pradesh',
  district?: string
): Promise<MandiComparisonResponse> {
  try {
    const query = new URLSearchParams({ commodity, state });
    if (district && district !== 'All') query.set('district', district);
    const res = await fetch(`/api/mandi-compare?${query.toString()}`);
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch {
    // Handled in return
  }

  return {
    success: false,
    commodity,
    state,
    district,
    records: [],
    averageModalPriceKg: 0,
    highestMandi: null,
    lowestMandi: null,
    latestArrivalDate: '',
    isLiveApi: false,
    errorMessage: 'Government comparison data temporarily unavailable.',
  };
}

/**
 * Handle Voice Query with Mandi Assistant
 */
export async function queryVoiceMandiAssistant(query: string, lang: 'hi' | 'en' = 'hi') {
  try {
    const res = await fetch('/api/mandi-voice-query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, language: lang }),
    });
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch {
    // Handled in return
  }

  return {
    success: false,
    detectedDistrict: '',
    detectedCommodity: '',
    record: null,
    spokenText:
      lang === 'hi'
        ? 'क्षमा करें, आधिकारिक सरकारी मंडी डेटा वर्तमान में अनुपलब्ध है।'
        : 'Sorry, official government mandi data is currently unavailable.',
    errorMessage: 'Government mandi data temporarily unavailable',
    isLiveApi: false,
  };
}

/**
 * Computes dynamic date range:
 * First day of PREVIOUS MONTH → TODAY
 * Example: If today is 08 Sep 2026, range is 01 Aug 2026 → 08 Sep 2026.
 */
export function getPreviousMonthToTodayRange(referenceDate: Date = new Date()): {
  fromDate: string;
  toDate: string;
  fromDisplay: string;
  toDisplay: string;
} {
  const year = referenceDate.getUTCFullYear();
  const month = referenceDate.getUTCMonth();

  let prevMonth = month - 1;
  let prevYear = year;
  if (prevMonth < 0) {
    prevMonth = 11;
    prevYear = year - 1;
  }

  const fromObj = new Date(Date.UTC(prevYear, prevMonth, 1));
  const toObj = new Date(Date.UTC(year, month, referenceDate.getUTCDate()));

  const fromDate = fromObj.toISOString().slice(0, 10);
  const toDate = toObj.toISOString().slice(0, 10);

  const formatDisplay = (d: Date) => {
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    });
  };

  return {
    fromDate,
    toDate,
    fromDisplay: formatDisplay(fromObj),
    toDisplay: formatDisplay(toObj),
  };
}

/**
 * Client-Side API Service for Mandi Price History (Distinct Arrival Dates):
 * Strictly requests the backend /api/mandi-prices/history endpoint.
 * No hardcoded/synthetic records are ever injected on failure.
 */
export async function fetchMandiPriceHistory(
  params: MandiSearchParams & { from?: string; to?: string; crop?: string }
): Promise<MandiHistoryResponse> {
  try {
    const defaultRange = getPreviousMonthToTodayRange();
    const query = new URLSearchParams();
    if (params.state && params.state !== 'All') query.set('state', params.state);
    if (params.district && params.district !== 'All') query.set('district', params.district);
    if (params.market && params.market !== 'All') query.set('market', params.market);
    const cropName = params.crop || params.commodity;
    if (cropName && cropName !== 'All') {
      query.set('crop', cropName);
      query.set('commodity', cropName);
    }
    if (params.variety && params.variety !== 'All') query.set('variety', params.variety);
    query.set('from', params.from || defaultRange.fromDate);
    query.set('to', params.to || defaultRange.toDate);

    const response = await fetch(`/api/mandi-prices/history?${query.toString()}`);
    const data: MandiHistoryResponse = await response.json();
    return data;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Network error';
    return {
      success: false,
      source: 'Government of India — DMI / AGMARKNET / data.gov.in',
      uniqueDates: 0,
      historicalCoverage: 'insufficient',
      records: [],
      reason: 'HISTORICAL_GOVERNMENT_DATA_UNAVAILABLE',
      errorMessage: `Government mandi data temporarily unavailable (${msg}).`,
    };
  }
}

/**
 * Client-Side API Service for Mandi Price Forecasting:
 * Requests the backend /api/market/price-forecast endpoint.
 * Returns estimated future forecasts (7, 15, 30 days) calculated strictly from
 * official historical mandi records. Returns INSUFFICIENT_HISTORY if < 2 distinct dates.
 */
export async function fetchMandiPriceForecast(
  params: MandiSearchParams
): Promise<MandiPriceForecastResponse> {
  try {
    const query = new URLSearchParams();
    if (params.state && params.state !== 'All') query.set('state', params.state);
    if (params.district && params.district !== 'All') query.set('district', params.district);
    if (params.market && params.market !== 'All') query.set('market', params.market);
    if (params.commodity && params.commodity !== 'All') query.set('commodity', params.commodity);
    if (params.variety && params.variety !== 'All') query.set('variety', params.variety);

    const response = await fetch(`/api/market/price-forecast?${query.toString()}`);
    const data: MandiPriceForecastResponse = await response.json();
    return data;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Network error';
    return {
      success: false,
      reason: 'DATA_UNAVAILABLE',
      errorMessage: `Official mandi forecast temporarily unavailable (${msg}).`,
    };
  }
}

/**
 * Fetch Mandi Forecast Telemetry for Admin monitoring
 */
export async function fetchMandiForecastTelemetry(): Promise<MandiForecastTelemetryStatus | null> {
  try {
    const response = await fetch('/api/admin/mandi-forecast/status');
    if (response.ok) {
      return await response.json();
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Fetch Daily Snapshot Pipeline Status for Admin / UI
 */
export async function fetchDailySnapshotStatus(): Promise<{
  success: boolean;
  lastSuccessfulIngestion: string | null;
  lastObservationDate: string | null;
  recordsInLatestSnapshot: number;
  totalHistoricalRecords: number;
  uniqueObservationDates: number;
  oldestObservationDate: string | null;
  latestObservationDate: string | null;
  lastError: string | null;
} | null> {
  try {
    const response = await fetch('/api/admin/mandi-snapshot/status');
    if (response.ok) {
      return await response.json();
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Client-Side API Service for Nearest Mandi:
 * Requests the backend /api/mandi-prices/nearest endpoint with user coordinates.
 * Returns nearest APMC mandi with calculated Haversine distance and real verified rates.
 */
export async function fetchNearestMandi(params: {
  latitude: number;
  longitude: number;
  commodity?: string;
}): Promise<{
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
}> {
  try {
    const query = new URLSearchParams();
    query.set('latitude', String(params.latitude));
    query.set('longitude', String(params.longitude));
    if (params.commodity) query.set('commodity', params.commodity);

    const response = await fetch(`/api/mandi-prices/nearest?${query.toString()}`);
    return await response.json();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Network error';
    return {
      success: false,
      message: `Failed to find nearest mandi (${msg}).`,
    };
  }
}


