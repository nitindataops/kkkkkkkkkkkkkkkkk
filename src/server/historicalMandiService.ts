import fs from 'fs';
import path from 'path';
import { isSupabaseConfigured } from './db/supabaseClient';
import { SupabaseRepo } from './db/supabaseRepository';
import {
  MandiHistoryRecord,
  MandiHistoryResponse,
  MandiHistoryDiagnostic,
  OfficialHistoricalObservation,
} from '../types/market';
import {
  searchOfficialMandiPrices,
  fetchAgmarknetHistoryFromMandiApi,
  normalizeCommodity,
  normalizeState,
  toCanonicalState,
  matchesStateStrict,
  matchesDistrictStrict,
  matchesMarketStrict,
  matchesCommodityStrict,
  matchesVarietyTerms,
  getApprovedCropCommodities,
  loadPersistedOfficialHistory,
} from './providers/agmarknetProvider';

const DATA_DIR = path.resolve(process.cwd(), '.data');
const HISTORY_FILE_PATH = path.join(DATA_DIR, 'kisansetu_mandi_history.json');

/**
 * Ensures the persistence directory exists.
 */
function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn('[HistoricalMandiService] Could not create .data directory:', err);
  }
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
  const month = referenceDate.getUTCMonth(); // 0-indexed (e.g. 8 for September)

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
 * Normalizes any arrival date string into standard ISO 'YYYY-MM-DD' and timestamp.
 */
export function parseDateToIso(dateStr: string): {
  isoDate: string;
  displayDate: string;
  timestamp: number;
} {
  if (!dateStr) {
    return { isoDate: '', displayDate: '', timestamp: 0 };
  }

  const trimmed = dateStr.trim();

  // DD/MM/YYYY
  const slashMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const day = parseInt(slashMatch[1], 10);
    const month = parseInt(slashMatch[2], 10) - 1;
    const year = parseInt(slashMatch[3], 10);
    const d = new Date(Date.UTC(year, month, day));
    if (!isNaN(d.getTime())) {
      const isoDate = d.toISOString().slice(0, 10);
      const displayDate = d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
      });
      return { isoDate, displayDate, timestamp: d.getTime() };
    }
  }

  // YYYY-MM-DD
  const dashMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (dashMatch) {
    const year = parseInt(dashMatch[1], 10);
    const month = parseInt(dashMatch[2], 10) - 1;
    const day = parseInt(dashMatch[3], 10);
    const d = new Date(Date.UTC(year, month, day));
    if (!isNaN(d.getTime())) {
      const isoDate = d.toISOString().slice(0, 10);
      const displayDate = d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
      });
      return { isoDate, displayDate, timestamp: d.getTime() };
    }
  }

  // Fallback Date.parse
  const parsed = Date.parse(trimmed);
  if (!isNaN(parsed)) {
    const d = new Date(parsed);
    const isoDate = d.toISOString().slice(0, 10);
    const displayDate = d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    });
    return { isoDate, displayDate, timestamp: d.getTime() };
  }

  return { isoDate: trimmed, displayDate: trimmed, timestamp: 0 };
}

/**
 * Builds the mandatory unique deduplication key:
 * state|district|market|commodity|variety|observationDate
 */
export function buildDeduplicationKey(rec: {
  state?: string;
  district?: string;
  market?: string;
  commodity?: string;
  variety?: string;
  observationDate?: string;
  arrivalDate?: string;
}): string {
  const s = (rec.state || '').trim().toLowerCase();
  const d = (rec.district || '').trim().toLowerCase();
  const m = (rec.market || '').trim().toLowerCase();
  const c = (rec.commodity || '').trim().toLowerCase();
  const v = (rec.variety || '').trim().toLowerCase();
  const dateParsed = parseDateToIso(rec.observationDate || rec.arrivalDate || '');
  const o = dateParsed.isoDate.toLowerCase();
  return `${s}|${d}|${m}|${c}|${v}|${o}`;
}

/**
 * Loads the official historical mandi observations from Supabase / in-memory cache.
 */
export function loadCachedMandiHistory(): OfficialHistoricalObservation[] {
  const records = loadPersistedOfficialHistory();
  return records.map((item: any) => {
    const dateParsed = parseDateToIso(item.observationDate || item.arrivalDate || '');
    const minP = Number(item.minPrice ?? item.minPriceQuintal ?? 0);
    const maxP = Number(item.maxPrice ?? item.maxPriceQuintal ?? 0);
    const modalP = Number(item.modalPrice ?? item.modalPriceQuintal ?? 0);
    return {
      observationDate: dateParsed.isoDate || item.observationDate || item.arrivalDate || '',
      state: item.state || '',
      district: item.district || '',
      market: item.market || '',
      commodity: item.commodity || '',
      variety: item.variety || 'Other',
      grade: item.grade || 'FAQ',
      minPrice: minP,
      maxPrice: maxP,
      modalPrice: modalP,
      priceUnit: item.priceUnit || '₹/quintal',
      arrivalQuantity: item.arrivalQuantity,
      source: item.source || 'Government of India — Directorate of Marketing & Inspection (DMI) — Open Government Data Platform',
      sourceUrl: item.sourceUrl || 'https://data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070',
      ingestedAt: item.ingestedAt,
    };
  });
}

/**
 * Persists historical records directly to Supabase as single source of truth.
 */
export function saveCachedMandiHistory(records: OfficialHistoricalObservation[]): void {
  if (isSupabaseConfigured()) {
    SupabaseRepo.insertMandiObservations(records).catch((err) => {
      console.warn('[HistoricalMandiService] Failed to save observations to Supabase:', err);
    });
  }
}

/**
 * Validates whether the requested crop is one of the 4 approved staple crops:
 * 1. Wheat
 * 2. Rice / Paddy
 * 3. Maize
 * 4. Pulses / Chana
 */
export function isApprovedHistoricalCrop(commodity: string): boolean {
  if (!commodity) return false;
  const lower = commodity.trim().toLowerCase();

  // Explicit non-staples / perishables
  if (
    lower.includes('tomato') ||
    lower.includes('potato') ||
    lower.includes('onion') ||
    lower.includes('mustard') ||
    lower.includes('sarson') ||
    lower.includes('tamatar') ||
    lower.includes('aloo') ||
    lower.includes('pyaz')
  ) {
    return false;
  }

  // 1. Wheat
  if (lower.includes('wheat') || lower.includes('gehu') || lower.includes('gehun')) return true;

  // 2. Rice / Paddy
  if (
    lower.includes('rice') ||
    lower.includes('paddy') ||
    lower.includes('dhan') ||
    lower.includes('basmati') ||
    lower.includes('chawal')
  ) {
    return true;
  }

  // 3. Maize
  if (lower.includes('maize') || lower.includes('makka') || lower.includes('corn')) return true;

  // 4. Pulses / Chana
  if (
    lower.includes('gram') ||
    lower.includes('chana') ||
    lower.includes('pulse') ||
    lower.includes('dal') ||
    lower.includes('arhar') ||
    lower.includes('tur') ||
    lower.includes('moong') ||
    lower.includes('urad') ||
    lower.includes('masoor') ||
    lower.includes('bengal gram')
  ) {
    return true;
  }

  return false;
}

/**
 * Historical Mandi Service Execution Pipeline
 * GET /api/mandi-prices/history
 */
export async function getHistoricalMandiData(params: {
  crop?: string;
  commodity?: string;
  from?: string;
  to?: string;
  state?: string;
  district?: string;
  market?: string;
  variety?: string;
  days?: number | string;
}): Promise<MandiHistoryResponse> {
  let fromDate = params.from;
  let toDate = params.to;
  if (!fromDate && params.days) {
    const dCount = Math.max(1, parseInt(String(params.days), 10) || 7);
    const now = new Date();
    const past = new Date(now.getTime() - dCount * 24 * 60 * 60 * 1000);
    fromDate = past.toISOString().slice(0, 10);
    if (!toDate) {
      toDate = now.toISOString().slice(0, 10);
    }
  } else {
    const dynamicRange = getPreviousMonthToTodayRange();
    if (!fromDate) fromDate = dynamicRange.fromDate;
    if (!toDate) toDate = dynamicRange.toDate;
  }

  const rawCrop = params.crop || params.commodity || 'Wheat';
  const cropFamily = normalizeCommodity(rawCrop);
  const normalizedState = normalizeState(params.state);
  const districtFilter = (params.district || '').trim();
  const marketFilter = (params.market || '').trim();
  const varietyFilter = (params.variety || '').trim();

  // 1. Load cached observations from .data/kisansetu_mandi_history.json
  const cachedHistory = loadCachedMandiHistory();

  // 2. Fetch latest live official observations from data.gov.in (Resource: 9ef84268-d588-465a-a308-a864a43d0070)
  let liveRecords: any[] = [];
  let isLiveApi = false;
  let latestDataDate: string | undefined;

  try {
    const liveSearch = await searchOfficialMandiPrices({
      commodity: rawCrop,
      state: params.state,
      district: params.district,
      market: params.market,
      variety: params.variety,
      limit: 1000,
    });

    if (liveSearch && liveSearch.success) {
      liveRecords = liveSearch.records || [];
      isLiveApi = liveSearch.isLiveApi;
      latestDataDate = liveSearch.dataDate;
    }
  } catch (fetchErr) {
    console.warn('[HistoricalMandiService] Live official fetch exception:', fetchErr);
  }

  // 3. Convert live records to OfficialHistoricalObservation format
  const incomingFromLive: OfficialHistoricalObservation[] = [];
  for (const r of liveRecords) {
    const dateParsed = parseDateToIso(r.arrivalDate);
    if (!dateParsed.isoDate) continue;

    incomingFromLive.push({
      observationDate: dateParsed.isoDate,
      state: r.state,
      district: r.district,
      market: r.market,
      commodity: r.commodity,
      variety: r.variety || 'Other',
      minPrice: r.minPriceQuintal || r.modalPriceQuintal,
      maxPrice: r.maxPriceQuintal || r.modalPriceQuintal,
      modalPrice: r.modalPriceQuintal,
      priceUnit: '₹/quintal',
      source: 'Government of India — DMI / AGMARKNET / data.gov.in',
      sourceUrl: 'https://data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070',
    });
  }

  // 4. Merge cached + live observations with strict deduplication key
  // state|district|market|commodity|variety|observationDate
  const allObservationsMap = new Map<string, OfficialHistoricalObservation>();

  for (const rec of cachedHistory) {
    const key = buildDeduplicationKey(rec);
    allObservationsMap.set(key, rec);
  }

  for (const rec of incomingFromLive) {
    const key = buildDeduplicationKey(rec);
    allObservationsMap.set(key, rec);
  }

  // 4b. Fetch verified historical observations from AGMARKNET-backed open mandi provider (mandi-api.onrender.com)
  // Only query external historical provider if cache lacks sufficient multi-date observations for this crop & state & district
  const cachedMatches = cachedHistory.filter((r) => {
    const matchesCrop = matchesCommodityStrict(r.commodity, rawCrop);
    const matchesState = !normalizedState || normalizedState === 'All' || matchesStateStrict(r.state, normalizedState);
    const matchesDist = !districtFilter || districtFilter === 'All' || matchesDistrictStrict(r.district, districtFilter);
    const isRecent = !fromDate || r.observationDate >= fromDate;
    return matchesCrop && matchesState && matchesDist && isRecent;
  });

  const cachedDistinctDates = new Set(cachedMatches.map((r) => r.observationDate)).size;
  const needsMoreHistory = cachedDistinctDates < 4;

  if (needsMoreHistory) {
    try {
      const historicalBatch = await fetchAgmarknetHistoryFromMandiApi({
        state: params.state || 'Uttar Pradesh',
        commodity: rawCrop,
        days: params.days ? Number(params.days) : 14,
      });
      for (const rec of historicalBatch) {
        const key = buildDeduplicationKey(rec);
        allObservationsMap.set(key, rec);
      }
    } catch (histErr) {
      console.warn('[HistoricalMandiService] Historical batch fetch exception:', histErr);
    }
  }

  // Save merged pool back to .data/kisansetu_mandi_history.json
  const mergedPool = Array.from(allObservationsMap.values());
  saveCachedMandiHistory(mergedPool);

  // 5. Filter records for the specific request (Crop, Geography, Date Range)
  const approvedVariants = getApprovedCropCommodities(cropFamily).map((c) => c.toLowerCase());

  const matchedObservations = mergedPool.filter((rec) => {
    // 1. Modal price validation
    if (rec.modalPrice <= 0) return false;

    // 2. Strict State check
    if (!matchesStateStrict(rec.state, params.state)) return false;

    // 3. Strict District check
    if (!matchesDistrictStrict(rec.district, params.district)) return false;

    // 4. Strict Market check
    if (!matchesMarketStrict(rec.market, params.market)) return false;

    // 5. Strict Commodity check
    if (!matchesCommodityStrict(rec.commodity, rawCrop)) return false;

    // 6. Variety check
    if (
      varietyFilter &&
      varietyFilter !== 'All' &&
      varietyFilter !== 'All Varieties' &&
      varietyFilter !== 'FAQ' &&
      !matchesVarietyTerms(rec.variety, varietyFilter)
    ) {
      return false;
    }

    // 7. Date range check: fromDate <= observationDate <= toDate
    if (fromDate && rec.observationDate < fromDate) return false;
    if (toDate && rec.observationDate > toDate) return false;

    return true;
  });

  // 6. Aggregate observations by unique observationDate
  const dateMap = new Map<string, OfficialHistoricalObservation[]>();
  for (const rec of matchedObservations) {
    const list = dateMap.get(rec.observationDate) || [];
    list.push(rec);
    dateMap.set(rec.observationDate, list);
  }

  const distinctDates = Array.from(dateMap.keys()).sort();
  const uniqueDates = distinctDates.length;
  const oldestObservationDate = distinctDates[0] || '';
  const latestObservationDate = distinctDates[distinctDates.length - 1] || '';

  // Aggregate into MandiHistoryRecord items (median modal price per date)
  const aggregatedRecords: MandiHistoryRecord[] = [];

  for (const dateKey of distinctDates) {
    const list = dateMap.get(dateKey) || [];
    const sortedPrices = list.map((r) => r.modalPrice).sort((a, b) => a - b);
    const mid = Math.floor(sortedPrices.length / 2);
    const medianModal =
      sortedPrices.length % 2 !== 0
        ? sortedPrices[mid]
        : Math.round((sortedPrices[mid - 1] + sortedPrices[mid]) / 2);

    const minP = Math.min(...list.map((r) => r.minPrice));
    const maxP = Math.max(...list.map((r) => r.maxPrice));
    const ref = list[0];
    const parsed = parseDateToIso(dateKey);

    aggregatedRecords.push({
      observationDate: dateKey,
      arrivalDate: dateKey,
      rawDate: ref.observationDate,
      displayDate: parsed.displayDate,
      timestamp: parsed.timestamp,
      modalPriceQuintal: medianModal,
      modalPriceKg: Math.round((medianModal / 100) * 10) / 10,
      minPriceQuintal: minP,
      maxPriceQuintal: maxP,
      minPriceKg: Math.round((minP / 100) * 10) / 10,
      maxPriceKg: Math.round((maxP / 100) * 10) / 10,
      minPrice: minP,
      maxPrice: maxP,
      modalPrice: medianModal,
      priceUnit: '₹/quintal',
      variety: ref.variety,
      market: ref.market,
      district: ref.district,
      state: ref.state,
      commodity: ref.commodity,
      source: ref.source,
      sourceUrl: ref.sourceUrl,
    });
  }

  aggregatedRecords.sort((a, b) => a.timestamp - b.timestamp);

  // Build individual records for table display (sorted newest first)
  const individualRecords: MandiHistoryRecord[] = matchedObservations.map((rec) => {
    const parsed = parseDateToIso(rec.observationDate);
    return {
      observationDate: rec.observationDate,
      arrivalDate: rec.observationDate,
      rawDate: rec.observationDate,
      displayDate: parsed.displayDate,
      timestamp: parsed.timestamp,
      modalPriceQuintal: rec.modalPrice,
      modalPriceKg: Math.round((rec.modalPrice / 100) * 10) / 10,
      minPriceQuintal: rec.minPrice,
      maxPriceQuintal: rec.maxPrice,
      minPriceKg: Math.round((rec.minPrice / 100) * 10) / 10,
      maxPriceKg: Math.round((rec.maxPrice / 100) * 10) / 10,
      minPrice: rec.minPrice,
      maxPrice: rec.maxPrice,
      modalPrice: rec.modalPrice,
      priceUnit: '₹/quintal',
      variety: rec.variety,
      market: rec.market,
      district: rec.district,
      state: rec.state,
      commodity: rec.commodity,
      source: rec.source,
      sourceUrl: rec.sourceUrl,
    };
  });
  individualRecords.sort((a, b) => b.timestamp - a.timestamp); // Newest first for table

  // Identify latest observation for Current Rate Card
  const newestRec = individualRecords[0];
  let latestRecordObj: any = undefined;
  if (newestRec) {
    latestRecordObj = {
      id: `agmarknet-latest-${newestRec.state}-${newestRec.district}-${newestRec.market}-${newestRec.commodity}-${newestRec.variety}`
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-'),
      state: newestRec.state || '',
      district: newestRec.district || '',
      market: newestRec.market || '',
      commodity: newestRec.commodity || rawCrop,
      variety: newestRec.variety || 'Other',
      arrivalDate: newestRec.arrivalDate,
      minPriceQuintal: newestRec.minPriceQuintal,
      maxPriceQuintal: newestRec.maxPriceQuintal,
      modalPriceQuintal: newestRec.modalPriceQuintal,
      minPriceKg: newestRec.minPriceKg,
      maxPriceKg: newestRec.maxPriceKg,
      modalPriceKg: newestRec.modalPriceKg,
      unit: '₹/Quintal (₹/kg)',
      source: newestRec.source || 'AGMARKNET (Ministry of Agriculture & Farmers Welfare, GoI)',
      isOfficialRecord: true,
      provenanceLabel: 'Official AGMARKNET Record • Directorate of Marketing & Inspection',
      trend: 'stable',
      lastUpdated: `Government Record • Arrival Date: ${newestRec.displayDate}`,
      fetchedTimestamp: new Date().toISOString(),
      sevenDayHistory: [],
    };
  }

  // Safe Diagnostic Logging
  console.log(
    `[HISTORICAL SERVICE] Query crop="${rawCrop}" range=${fromDate}..${toDate} records=${matchedObservations.length} uniqueDates=${uniqueDates}`
  );

  // If no records matched at all
  if (matchedObservations.length === 0) {
    return {
      success: true,
      source: 'AGMARKNET (DMI, Ministry of Agriculture & Farmers Welfare, GoI) via Mandi Price API & data.gov.in',
      from: fromDate,
      to: toDate,
      records: [],
      chartRecords: [],
      uniqueDates: 0,
      latestObservationDate: '',
      oldestObservationDate: '',
      historicalCoverage: 'insufficient',
      totalRecords: 0,
      isLiveApi: true,
      totalDistinctDates: 0,
      state: params.state,
      district: params.district,
      market: params.market,
      commodity: rawCrop,
      variety: params.variety,
      errorMessage: 'No verified mandi records found for this selection in recent government observations.',
      dataSource: 'AGMARKNET / Government of India Mandi Data via Open Data API & data.gov.in',
      dataType: 'Actual mandi reporting data',
      priceUnit: '₹/quintal',
      fetchedAt: new Date().toISOString(),
    };
  }

  // When observations exist: Return actual verified records immediately
  return {
    success: true,
    source: 'AGMARKNET (DMI, Ministry of Agriculture & Farmers Welfare, GoI) via Mandi Price API & data.gov.in',
    from: fromDate,
    to: toDate,
    records: individualRecords,
    chartRecords: aggregatedRecords,
    latestRecord: latestRecordObj,
    uniqueDates,
    latestObservationDate,
    oldestObservationDate,
    historicalCoverage: uniqueDates >= 7 ? 'sufficient' : 'partial',
    totalRecords: matchedObservations.length,
    isLiveApi: true,
    totalDistinctDates: uniqueDates,
    state: params.state,
    district: params.district,
    market: params.market,
    commodity: rawCrop,
    variety: params.variety,
    latestArrivalDate: latestObservationDate,
    dataSource: 'AGMARKNET / Government of India Mandi Data via Open Data API & data.gov.in',
    dataType: 'Actual mandi reporting data',
    priceUnit: '₹/quintal',
    fetchedAt: new Date().toISOString(),
  };
}
