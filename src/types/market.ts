export interface AgmarknetRawRecord {
  state?: string;
  district?: string;
  market?: string;
  commodity?: string;
  variety?: string;
  arrival_date?: string;
  min_price?: string | number;
  max_price?: string | number;
  modal_price?: string | number;
  // Case variations from different versions of data.gov.in
  State?: string;
  District?: string;
  Market?: string;
  Commodity?: string;
  Variety?: string;
  Arrival_Date?: string;
  Min_Price?: string | number;
  Max_Price?: string | number;
  Modal_Price?: string | number;
}

export interface OfficialMandiRecord {
  id: string;
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  arrivalDate: string; // ISO or DD/MM/YYYY
  minPriceQuintal: number;
  maxPriceQuintal: number;
  modalPriceQuintal: number;
  minPriceKg: number;
  maxPriceKg: number;
  modalPriceKg: number;
  unit: string;
  source: string;
  isOfficialRecord: boolean;
  provenanceLabel: string;
  priceChange24h?: number;
  percentChange24h?: number;
  trend: 'up' | 'down' | 'stable';
  lastUpdated: string;
  fetchedTimestamp?: string;
  sevenDayHistory: {
    date: string;
    day: string;
    modalPriceQuintal: number;
    modalPriceKg: number;
    minPriceKg: number;
    maxPriceKg: number;
  }[];
}

export interface MandiSearchParams {
  state?: string;
  district?: string;
  market?: string;
  commodity?: string;
  variety?: string;
  date?: string;
  mode?: 'official' | 'demo';
  limit?: number;
}

export interface MandiSearchResponse {
  success: boolean;
  source: 'official_agmarknet_api' | 'demo_data';
  isLiveApi: boolean;
  totalRecords: number;
  records: OfficialMandiRecord[];
  fetchedAt?: string;
  dataDate?: string;
  resourceId?: string;
  meta: {
    state?: string;
    district?: string;
    market?: string;
    commodity?: string;
    variety?: string;
    queryDate?: string;
    latestArrivalDate?: string;
    dataDate?: string;
    fetchedAt?: string;
    httpStatus?: number;
    resourceId?: string;
    note?: string;
  };
  errorMessage?: string;
}

export interface MandiHistoryRecord {
  observationDate?: string; // ISO date 'YYYY-MM-DD'
  arrivalDate: string;
  rawDate: string;
  displayDate: string;
  timestamp: number;
  modalPriceQuintal: number;
  modalPriceKg: number;
  minPriceQuintal: number;
  maxPriceQuintal: number;
  minPriceKg: number;
  maxPriceKg: number;
  minPrice?: number;
  maxPrice?: number;
  modalPrice?: number;
  priceUnit?: string;
  arrivalQuantity?: string;
  variety?: string;
  market?: string;
  district?: string;
  state?: string;
  commodity?: string;
  source?: string;
  sourceUrl?: string;
}

export interface OfficialHistoricalObservation {
  observationDate: string; // ISO 'YYYY-MM-DD'
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  grade?: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  priceUnit: string; // '₹/quintal'
  arrivalQuantity?: string;
  source: string;
  sourceUrl: string;
  ingestedAt?: string;
}

export interface DailySnapshotStatus {
  lastSuccessfulIngestion: string | null;
  lastObservationDate: string | null;
  recordsInLatestSnapshot: number;
  totalHistoricalRecords: number;
  uniqueObservationDates: number;
  oldestObservationDate: string | null;
  latestObservationDate: string | null;
  lastError: string | null;
}

export interface MandiHistoryDiagnostic {
  currentDataAvailable: boolean;
  historicalEndpointUnavailable: boolean;
  officialSourceChecked: string;
  apiKeyConfigured: boolean;
  dateWiseRetrievalSupported: boolean;
  explanation: string;
}

export interface MandiHistoryResponse {
  success: boolean;
  source: string;
  from?: string;
  to?: string;
  records: MandiHistoryRecord[];
  chartRecords?: MandiHistoryRecord[];
  latestRecord?: OfficialMandiRecord;
  uniqueDates: number;
  latestObservationDate?: string;
  oldestObservationDate?: string;
  historicalCoverage: 'sufficient' | 'insufficient' | 'partial';
  totalRecords?: number;
  isLiveApi?: boolean;
  totalDistinctDates?: number;
  reason?: 'HISTORICAL_GOVERNMENT_DATA_UNAVAILABLE' | string;
  diagnostic?: MandiHistoryDiagnostic;
  state?: string;
  district?: string;
  market?: string;
  commodity?: string;
  variety?: string;
  latestArrivalDate?: string;
  dataDate?: string;
  fetchedAt?: string;
  resourceId?: string;
  errorMessage?: string;
  dataSource?: string;
  dataType?: string;
  priceUnit?: string;
}

export interface MandiComparisonItem {
  market: string;
  district: string;
  state: string;
  distanceKm?: number;
  modalPriceKg: number;
  modalPriceQuintal: number;
  minPriceKg: number;
  maxPriceKg: number;
  arrivalDate: string;
  trend: 'up' | 'down' | 'stable';
  isNearest?: boolean;
  isHighestRate?: boolean;
}

export interface MandiComparisonResponse {
  success: boolean;
  commodity: string;
  state: string;
  district?: string;
  records: MandiComparisonItem[];
  averageModalPriceKg: number;
  highestMandi: MandiComparisonItem | null;
  lowestMandi: MandiComparisonItem | null;
  latestArrivalDate: string;
  isLiveApi?: boolean;
  errorMessage?: string;
}

export type ForecastHorizonKey = '7_days' | '15_days' | '30_days';

export interface ForecastHorizonSummary {
  horizonDays: number;
  label: string;
  targetDate: string;
  expectedPriceQuintal: number;
  expectedPriceKg: number;
  minPriceQuintal: number;
  maxPriceQuintal: number;
  minPriceKg: number;
  maxPriceKg: number;
  predictedChangePercent: number;
  predictedChangeAmountQuintal: number;
  predictedChangeAmountKg: number;
  trend: 'bullish' | 'bearish' | 'stable';
  confidence: 'High' | 'Medium' | 'Low' | 'Unavailable';
  reliabilityStatus: 'active' | 'low_reliability' | 'disabled';
  statusMessage?: string;
}

export interface ForecastProjectedPoint {
  dayIndex: number;
  date: string;
  displayDate: string;
  expectedPriceQuintal: number;
  minPriceQuintal: number;
  maxPriceQuintal: number;
  expectedPriceKg: number;
  minPriceKg: number;
  maxPriceKg: number;
}

export interface ForecastValidationMetrics {
  method: string;
  maeQuintal: number;
  mapePercent: number;
  rmseQuintal: number;
  testObservations: number;
  trainObservations: number;
  backtestStatus: 'passed' | 'marginal' | 'insufficient_history';
}

export interface MandiPriceForecastResponse {
  success: boolean;
  reason?:
    | 'INSUFFICIENT_HISTORICAL_DATA'
    | 'INSUFFICIENT_HISTORY'
    | 'INSUFFICIENT_VALIDATION_DATA'
    | 'MANDI_API_UNAVAILABLE'
    | 'DATA_UNAVAILABLE'
    | 'NO_MARKET_DATA'
    | 'FORECAST_ERROR'
    | 'INVALID_CROP'
    | 'MODEL_ERROR';
  message?: string;
  errorMessage?: string;
  commodity?: string;
  variety?: string;
  state?: string;
  district?: string;
  market?: string;
  unit?: string;

  // Diagnostic parameters requested in specification
  rawRecords?: number;
  normalizedRecords?: number;
  uniqueDates?: number;
  selectedCrop?: string;
  selectedVariety?: string;
  selectedMarket?: string;
  selectedDistrict?: string;
  selectedState?: string;
  historicalLevel?: 'market' | 'district' | 'state';
  forecastAvailable?: boolean;

  currentPrice?: number;
  currentPriceQuintal?: number;
  currentPriceKg?: number;
  historicalPointsCount?: number;
  historyObservations?: number;
  historicalStartDate?: string;
  historicalEndDate?: string;
  historicalCalendarDaysSpan?: number;
  dataLevel?: 'market' | 'district' | 'state';
  dataLevelDescription?: string;
  historicalPoints?: Array<{
    date: string;
    displayDate: string;
    timestamp?: number;
    priceQuintal: number;
    priceKg: number;
    minPriceQuintal: number;
    maxPriceQuintal: number;
    market?: string;
    district?: string;
    state?: string;
    commodity?: string;
    variety?: string;
  }>;
  latestObservation?: {
    date: string;
    mandi: string;
    commodity: string;
    variety: string;
    modalPriceQuintal: number;
    modalPriceKg: number;
    minPriceQuintal: number;
    maxPriceQuintal: number;
    source: string;
  };
  latestSource?: string;
  blocker?: string;
  forecastNotice?: string;
  forecasts?: {
    '7_days': ForecastHorizonSummary;
    '15_days': ForecastHorizonSummary;
    '30_days': ForecastHorizonSummary;
  };
  forecast?: {
    '7_days': ForecastHorizonSummary;
    '15_days': ForecastHorizonSummary;
    '30_days': ForecastHorizonSummary;
  };
  projectedTimeline?: ForecastProjectedPoint[];
  overallTrend?: 'bullish' | 'bearish' | 'stable';
  trend?: 'Increasing' | 'Stable' | 'Decreasing';
  confidence?: 'High' | 'Medium' | 'Low' | 'Unavailable';
  confidenceScore?: number;
  confidenceReason?: string;
  volatilityIndex?: 'low' | 'moderate' | 'high';
  validationMetrics?: ForecastValidationMetrics;
  advisory?: {
    en: string;
    hi: string;
    recommendation: 'SELL_GRADUAL' | 'HOLD_HARVEST' | 'SELL_IMMEDIATE' | 'MONITOR_ARRIVALS' | 'GRADUAL_SALES_OUTLOOK' | 'STORAGE_EVALUATION_OUTLOOK' | 'REGULAR_SALES_OUTLOOK';
  };
  algorithm?: string;
  dataObservationsCount?: number;
  source?: string;
  cached?: boolean;
  generatedAt?: string;
  lastUpdated?: string;
}

export interface MandiForecastTelemetryStatus {
  success: boolean;
  totalForecastRequests: number;
  cacheHits: number;
  cacheMisses: number;
  lastForecastGeneratedAt: string | null;
  supportedCrops: string[];
  horizons: number[];
  apiProvider: string;
  providerStatus: 'online' | 'standby' | 'key_missing';
  persistedObservationsCount: number;
}

