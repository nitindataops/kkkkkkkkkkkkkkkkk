import fs from 'fs';
import path from 'path';
import { OfficialHistoricalObservation, DailySnapshotStatus } from '../types/market';
import { parseDateToIso, buildDeduplicationKey, isApprovedHistoricalCrop } from './historicalMandiService';
import { isSupabaseConfigured } from './db/supabaseClient';
import { SupabaseRepo } from './db/supabaseRepository';
import { loadPersistedOfficialHistory } from './providers/agmarknetProvider';

const DATA_DIR = path.resolve(process.cwd(), '.data');
const HISTORY_FILE_PATH = path.join(DATA_DIR, 'kisansetu_mandi_history.json');
const META_FILE_PATH = path.join(DATA_DIR, 'kisansetu_mandi_snapshot_meta.json');

const OFFICIAL_DATA_GOV_IN_RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070';
const OFFICIAL_SOURCE_PROVENANCE =
  'Government of India — Directorate of Marketing & Inspection (DMI) — Open Government Data Platform';
const OFFICIAL_SOURCE_URL = `https://data.gov.in/resource/${OFFICIAL_DATA_GOV_IN_RESOURCE_ID}`;

// Four active crop families strictly
export const ACTIVE_CROP_COMMODITY_FILTERS = [
  'Wheat',
  'Paddy(Dhan)',
  'Rice',
  'Maize',
  'Bengal Gram(Gram)(Whole)',
  'Gram Raw(Chana)',
];

interface SnapshotMetadata {
  lastSuccessfulIngestion: string | null;
  lastObservationDate: string | null;
  recordsInLatestSnapshot: number;
  totalHistoricalRecords: number;
  uniqueObservationDates: number;
  oldestObservationDate: string | null;
  latestObservationDate: string | null;
  lastError: string | null;
}

function ensureDataDir(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn('[DailyMandiSnapshotService] Failed to create .data dir:', err);
  }
}

let inMemoryMetadata: SnapshotMetadata = {
  lastSuccessfulIngestion: null,
  lastObservationDate: null,
  recordsInLatestSnapshot: 0,
  totalHistoricalRecords: 0,
  uniqueObservationDates: 0,
  oldestObservationDate: null,
  latestObservationDate: null,
  lastError: null,
};

export function loadSnapshotMetadata(): SnapshotMetadata {
  return inMemoryMetadata;
}

export async function hydrateSnapshotMetadataFromSupabase(): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const meta = await SupabaseRepo.getMandiSyncMetadata();
    if (meta && meta.totalHistoricalRecords > 0) {
      inMemoryMetadata = meta;
    } else if (fs.existsSync(META_FILE_PATH)) {
      const content = fs.readFileSync(META_FILE_PATH, 'utf-8');
      inMemoryMetadata = JSON.parse(content);
    }
  } catch (err) {
    console.warn('[DailyMandiSnapshotService] Failed to load metadata from Supabase:', err);
  }
}

export function saveSnapshotMetadata(meta: SnapshotMetadata): void {
  inMemoryMetadata = { ...meta };
  if (isSupabaseConfigured()) {
    SupabaseRepo.saveMandiSyncMetadata(meta).catch((err) => {
      console.warn('[DailyMandiSnapshotService] Failed to save metadata to Supabase:', err);
    });
  }
}

/**
 * Loads all stored observations from Supabase-backed in-memory state.
 */
export function loadAllStoredObservations(): OfficialHistoricalObservation[] {
  const records = loadPersistedOfficialHistory();
  return records.map((r) => ({
    state: r.state,
    district: r.district,
    market: r.market,
    commodity: r.commodity,
    variety: r.variety,
    arrivalDate: r.arrivalDate,
    minPrice: r.minPriceQuintal || (r.minPriceKg ? r.minPriceKg * 100 : 0),
    maxPrice: r.maxPriceQuintal || (r.maxPriceKg ? r.maxPriceKg * 100 : 0),
    modalPrice: r.modalPriceQuintal || (r.modalPriceKg ? r.modalPriceKg * 100 : 0),
    priceUnit: (r as any).priceUnit || '₹/quintal',
    observationDate: r.arrivalDate,
    rawDate: r.arrivalDate,
    displayDate: r.arrivalDate,
    timestamp: r.fetchedTimestamp ? new Date(r.fetchedTimestamp).getTime() : Date.now(),
    source: r.source || 'AGMARKNET (DMI, GoI)',
    sourceUrl: (r as any).sourceUrl || OFFICIAL_SOURCE_URL,
  }));
}

/**
 * Saves all observations to Supabase with strict deduplication.
 */
export function saveAllStoredObservations(records: OfficialHistoricalObservation[]): void {
  if (isSupabaseConfigured()) {
    SupabaseRepo.insertMandiObservations(records).catch((err) => {
      console.warn('[DailyMandiSnapshotService] Failed to write observations to Supabase:', err);
    });
  }
}

/**
 * Fetches the daily government bulletin for a single commodity filter from data.gov.in with retries.
 */
async function fetchGovernmentCommodityRecords(
  commodityFilter: string,
  apiKey: string,
  retries = 2
): Promise<any[]> {
  const url = `https://api.data.gov.in/resource/${OFFICIAL_DATA_GOV_IN_RESOURCE_ID}?api-key=${encodeURIComponent(
    apiKey
  )}&format=json&limit=1000&filters[commodity]=${encodeURIComponent(commodityFilter)}`;

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'User-Agent': 'KisanSetu-GovMandiSnapshot/1.0',
        },
      });

      if (!response.ok) {
        throw new Error(`data.gov.in responded with HTTP ${response.status} for ${commodityFilter}`);
      }

      const json = await response.json();
      return json.records || [];
    } catch (err: any) {
      if (attempt <= retries) {
        await new Promise((resolve) => setTimeout(resolve, 800 * attempt));
      } else {
        throw err;
      }
    }
  }
  return [];
}

/**
 * Ingests the current daily Government of India mandi bulletin for the four active staple crop families.
 * Merges and deduplicates using the strict key: state|district|market|commodity|variety|observationDate.
 */
export async function ingestDailyGovernmentSnapshot(): Promise<{
  success: boolean;
  recordsIngestedInThisRun: number;
  recordsInLatestSnapshot: number;
  totalHistoricalRecords: number;
  uniqueObservationDates: number;
  oldestObservationDate: string | null;
  latestObservationDate: string | null;
  observationDates: string[];
  cropsProcessed: string[];
  error?: string;
}> {
  const apiKey = (process.env.DATA_GOV_IN_API_KEY || process.env.DATA_GOV_API_KEY || '').trim();

  if (!apiKey) {
    const errorMsg = 'DATA_GOV_IN_API_KEY is not configured in server environment.';
    console.error(`[DailyMandiSnapshotService] ${errorMsg}`);
    const currentMeta = loadSnapshotMetadata();
    currentMeta.lastError = errorMsg;
    saveSnapshotMetadata(currentMeta);
    return {
      success: false,
      recordsIngestedInThisRun: 0,
      recordsInLatestSnapshot: 0,
      totalHistoricalRecords: currentMeta.totalHistoricalRecords,
      uniqueObservationDates: currentMeta.uniqueObservationDates,
      oldestObservationDate: currentMeta.oldestObservationDate,
      latestObservationDate: currentMeta.latestObservationDate,
      observationDates: [],
      cropsProcessed: [],
      error: errorMsg,
    };
  }

  const ingestionTimestamp = new Date().toISOString();
  const normalizedIncoming: OfficialHistoricalObservation[] = [];
  const processedCrops: string[] = [];

  try {
    for (const commodityFilter of ACTIVE_CROP_COMMODITY_FILTERS) {
      try {
        const rawRecords = await fetchGovernmentCommodityRecords(commodityFilter, apiKey);
        processedCrops.push(`${commodityFilter} (${rawRecords.length})`);

        for (const r of rawRecords) {
          const rawDate = r.arrival_date || r.Arrival_Date || '';
          const parsed = parseDateToIso(rawDate);
          if (!parsed.isoDate) continue;

          // Double check staple crop family
          const commodityName = (r.commodity || r.Commodity || '').trim();
          if (!isApprovedHistoricalCrop(commodityName)) continue;

          const minP = Number(r.min_price ?? r.Min_x0020_Price ?? 0);
          const maxP = Number(r.max_price ?? r.Max_x0020_Price ?? 0);
          const modalP = Number(r.modal_price ?? r.Modal_x0020_Price ?? 0);

          if (modalP <= 0 && minP <= 0 && maxP <= 0) continue;

          normalizedIncoming.push({
            observationDate: parsed.isoDate,
            state: (r.state || r.State || '').trim(),
            district: (r.district || r.District || '').trim(),
            market: (r.market || r.Market || '').trim(),
            commodity: commodityName,
            variety: (r.variety || r.Variety || 'Other').trim(),
            grade: (r.grade || r.Grade || 'FAQ').trim(),
            minPrice: minP > 0 ? minP : modalP,
            maxPrice: maxP > 0 ? maxP : modalP,
            modalPrice: modalP > 0 ? modalP : minP,
            priceUnit: '₹/quintal',
            arrivalQuantity: r.arrival_quantity || undefined,
            source: OFFICIAL_SOURCE_PROVENANCE,
            sourceUrl: OFFICIAL_SOURCE_URL,
            ingestedAt: ingestionTimestamp,
          });
        }
      } catch (cropErr: any) {
        console.warn(`[DailyMandiSnapshotService] Error fetching ${commodityFilter}:`, cropErr.message);
      }
    }

    // Load existing history archive
    const existingHistory = loadAllStoredObservations();
    const historyMap = new Map<string, OfficialHistoricalObservation>();

    // Put existing records
    for (const rec of existingHistory) {
      const key = buildDeduplicationKey(rec);
      historyMap.set(key, rec);
    }

    const countBefore = historyMap.size;

    // Merge incoming records with deduplication
    for (const rec of normalizedIncoming) {
      const key = buildDeduplicationKey(rec);
      // If already present for this exact day and mandi, keep the record
      if (!historyMap.has(key)) {
        historyMap.set(key, rec);
      }
    }

    const mergedRecords = Array.from(historyMap.values());
    const newRecordsCount = mergedRecords.length - countBefore;

    // Save persistent archive
    saveAllStoredObservations(mergedRecords);

    // Calculate observation dates across archive
    const uniqueDatesSet = new Set<string>();
    for (const rec of mergedRecords) {
      if (rec.observationDate) {
        uniqueDatesSet.add(rec.observationDate);
      }
    }

    const sortedDates = Array.from(uniqueDatesSet).sort();
    const oldestDate = sortedDates[0] || null;
    const latestDate = sortedDates[sortedDates.length - 1] || null;

    const metadata: SnapshotMetadata = {
      lastSuccessfulIngestion: ingestionTimestamp,
      lastObservationDate: latestDate,
      recordsInLatestSnapshot: normalizedIncoming.length,
      totalHistoricalRecords: mergedRecords.length,
      uniqueObservationDates: sortedDates.length,
      oldestObservationDate: oldestDate,
      latestObservationDate: latestDate,
      lastError: null,
    };

    saveSnapshotMetadata(metadata);

    console.log(
      `[DailyMandiSnapshotService] Ingestion complete. Snapshot records: ${normalizedIncoming.length}, Total archive: ${mergedRecords.length}, Unique dates: ${sortedDates.length}`
    );

    return {
      success: true,
      recordsIngestedInThisRun: newRecordsCount,
      recordsInLatestSnapshot: normalizedIncoming.length,
      totalHistoricalRecords: mergedRecords.length,
      uniqueObservationDates: sortedDates.length,
      oldestObservationDate: oldestDate,
      latestObservationDate: latestDate,
      observationDates: sortedDates,
      cropsProcessed: processedCrops,
    };
  } catch (error: any) {
    const errorMsg = error.message || 'Unknown ingestion failure';
    console.error('[DailyMandiSnapshotService] Ingestion failed:', error);
    const meta = loadSnapshotMetadata();
    meta.lastError = errorMsg;
    saveSnapshotMetadata(meta);
    return {
      success: false,
      recordsIngestedInThisRun: 0,
      recordsInLatestSnapshot: normalizedIncoming.length,
      totalHistoricalRecords: meta.totalHistoricalRecords,
      uniqueObservationDates: meta.uniqueObservationDates,
      oldestObservationDate: meta.oldestObservationDate,
      latestObservationDate: meta.latestObservationDate,
      observationDates: [],
      cropsProcessed: processedCrops,
      error: errorMsg,
    };
  }
}

/**
 * Returns current snapshot diagnostics for GET /api/admin/mandi-snapshot/status.
 */
export function getDailySnapshotStatus(): DailySnapshotStatus {
  const meta = loadSnapshotMetadata();
  const allStored = loadAllStoredObservations();

  const uniqueDatesSet = new Set<string>();
  for (const r of allStored) {
    if (r.observationDate) uniqueDatesSet.add(r.observationDate);
  }
  const sortedDates = Array.from(uniqueDatesSet).sort();

  return {
    lastSuccessfulIngestion: meta.lastSuccessfulIngestion,
    lastObservationDate: meta.lastObservationDate || sortedDates[sortedDates.length - 1] || null,
    recordsInLatestSnapshot: meta.recordsInLatestSnapshot,
    totalHistoricalRecords: allStored.length,
    uniqueObservationDates: sortedDates.length,
    oldestObservationDate: meta.oldestObservationDate || sortedDates[0] || null,
    latestObservationDate: meta.latestObservationDate || sortedDates[sortedDates.length - 1] || null,
    lastError: meta.lastError,
  };
}

/**
 * Initializes safe background scheduling.
 * Runs on boot if today's snapshot hasn't been taken or last ingestion was > 12h ago.
 * Checks every 6 hours.
 */
let schedulerTimer: NodeJS.Timeout | null = null;

export function initDailyMandiSnapshotScheduler(): void {
  if (schedulerTimer) return;

  const runCheck = async () => {
    try {
      const meta = loadSnapshotMetadata();
      const now = Date.now();
      const lastRunTime = meta.lastSuccessfulIngestion ? Date.parse(meta.lastSuccessfulIngestion) : 0;
      const twelveHoursMs = 12 * 60 * 60 * 1000;

      if (!lastRunTime || now - lastRunTime > twelveHoursMs) {
        console.log('[DailyMandiSnapshotService] Triggering scheduled daily government mandi ingestion...');
        await ingestDailyGovernmentSnapshot();
      }
    } catch (err) {
      console.warn('[DailyMandiSnapshotService] Scheduled check encountered error:', err);
    }
  };

  // Run initial check after 5 seconds to let server finish booting
  setTimeout(() => {
    runCheck();
  }, 5000);

  // Periodic check every 6 hours
  schedulerTimer = setInterval(runCheck, 6 * 60 * 60 * 1000);
}
