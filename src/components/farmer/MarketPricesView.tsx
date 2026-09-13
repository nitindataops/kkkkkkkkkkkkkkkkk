import React, { useState, useEffect } from 'react';
import {
  Building2,
  CheckCircle2,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Search,
  RotateCw,
  SlidersHorizontal,
  TrendingUp,
  Scale,
  Calendar,
  ShieldCheck,
  BellRing,
  AlertTriangle,
  AlertCircle,
  Clock,
  Database,
  Sparkles,
  LineChart,
  MapPin,
  Navigation,
} from 'lucide-react';
import {
  OfficialMandiRecord,
  MandiComparisonItem,
  MandiHistoryRecord,
  MandiHistoryResponse,
} from '../../types/market';
import { LanguageCode } from '../../types';
import { getFarmerTranslations } from '../../data/farmerTranslations';
import {
  fetchMandiPrices,
  fetchMandiMetadata,
  fetchMandiComparison,
  fetchMandiPriceHistory,
  fetchNearestMandi,
  getPreviousMonthToTodayRange,
} from '../../services/mandiApiService';
import { isApprovedCrop } from '../../data/cropVarieties';

interface MarketPricesViewProps {
  currentLanguage: LanguageCode;
}

interface ValidatedPoint {
  day: string;
  fullDate: string;
  rawDate: string;
  price: number; // Always in ₹/Quintal
  modalPriceQuintal: number;
  minPriceQuintal: number;
  maxPriceQuintal: number;
  variety: string;
  market: string;
  source: string;
}

function formatShortMandiDate(dateStr: string): string {
  if (!dateStr) return '';
  const trimmed = dateStr.trim();
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const mIdx = parseInt(isoMatch[2], 10) - 1;
    return `${isoMatch[3]} ${months[mIdx] || isoMatch[2]}`;
  }
  const textMatch = trimmed.match(/^(\d{1,2})\s+([A-Za-z]+)/);
  if (textMatch) {
    const day = textMatch[1].padStart(2, '0');
    const month = textMatch[2].slice(0, 3);
    return `${day} ${month}`;
  }
  const slashMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (slashMatch) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = slashMatch[1].padStart(2, '0');
    const mIdx = parseInt(slashMatch[2], 10) - 1;
    return `${day} ${months[mIdx] || slashMatch[2]}`;
  }
  return dateStr;
}

function formatFullMandiDate(dateStr: string): string {
  if (!dateStr) return '';
  const trimmed = dateStr.trim();
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const mIdx = parseInt(isoMatch[2], 10) - 1;
    return `${isoMatch[3]} ${months[mIdx] || isoMatch[2]} ${isoMatch[1]}`;
  }
  return dateStr;
}

export const MarketPricesView: React.FC<MarketPricesViewProps> = ({
  currentLanguage,
}) => {
  const t = getFarmerTranslations(currentLanguage);
  const mpT = t.marketPricesView;

  // Filter & Search State
  const [selectedState, setSelectedState] = useState<string>('Uttar Pradesh');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Bareilly');
  const [selectedMarket, setSelectedMarket] = useState<string>('Bareilly');
  const [selectedCommodity, setSelectedCommodity] = useState<string>('Wheat');
  const [selectedVariety, setSelectedVariety] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // UI & Data State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLiveApi, setIsLiveApi] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [metaNote, setMetaNote] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [dataDate, setDataDate] = useState<string | null>(null);
  const [resourceId, setResourceId] = useState<string | null>(null);

  const [officialRecords, setOfficialRecords] = useState<OfficialMandiRecord[]>([]);
  const [activeRecord, setActiveRecord] = useState<OfficialMandiRecord | null>(null);
  const [comparisonData, setComparisonData] = useState<{
    records: MandiComparisonItem[];
    averageModalPriceKg: number;
    highestMandi: MandiComparisonItem | null;
    lowestMandi: MandiComparisonItem | null;
    isLiveApi?: boolean;
    errorMessage?: string;
  } | null>(null);

  // Historical Government Mandi State (Strictly real observations)
  const [historyRecords, setHistoryRecords] = useState<MandiHistoryRecord[]>([]);
  const [historyResponse, setHistoryResponse] = useState<MandiHistoryResponse | null>(null);
  const [isHistoryLoading, setIsHistoryLoading] = useState<boolean>(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [historyDaysTab, setHistoryDaysTab] = useState<7 | 15 | 30>(7);
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // Metadata Catalog
  const [statesList, setStatesList] = useState<string[]>([
    'Uttar Pradesh',
    'Punjab',
    'Haryana',
    'Rajasthan',
    'Madhya Pradesh',
    'Maharashtra',
    'Gujarat',
    'Bihar',
    'West Bengal',
    'Karnataka',
    'Andhra Pradesh',
    'Telangana',
    'Tamil Nadu',
    'Odisha',
    'Chattisgarh',
    'Jharkhand',
    'Uttarakhand',
    'Himachal Pradesh',
    'Keralam',
  ]);
  const [districtsMap, setDistrictsMap] = useState<Record<string, string[]>>({
    'Uttar Pradesh': ['Bareilly', 'Badaun', 'Bulandshahar', 'Balrampur', 'Khiri (Lakhimpur)', 'Sambhal', 'Sitapur', 'Meerut', 'Lucknow', 'Moradabad', 'Agra', 'Varanasi', 'Kanpur', 'Aligarh'],
    Rajasthan: ['Chittorgarh', 'Jaipur', 'Kota', 'Jodhpur', 'Bikaner', 'Alwar', 'Sri Ganganagar'],
    'Madhya Pradesh': ['Rewa', 'Indore', 'Bhopal', 'Ujjain', 'Jabalpur', 'Gwalior', 'Khandwa'],
    'Andhra Pradesh': ['Prakasam', 'Kurnool', 'Guntur', 'Krishna', 'West Godavari', 'East Godavari'],
    Punjab: ['Ludhiana', 'Amritsar', 'Patiala', 'Jalandhar', 'Bathinda'],
    Haryana: ['Karnal', 'Ambala', 'Hisar', 'Rohtak', 'Kurukshetra'],
    Maharashtra: ['Pune', 'Nashik', 'Nagpur', 'Aurangabad', 'Solapur'],
    Keralam: ['Ernakulam', 'Kozhikode(Calicut)', 'Thiruvananthapuram', 'Kollam'],
  });
  const [commoditiesList, setCommoditiesList] = useState<string[]>([
    'Wheat',
    'Paddy(Dhan)',
    'Rice',
    'Maize',
    'Bengal Gram(Gram/Chana)',
  ]);

  // Unit display switcher: per kg vs per quintal
  const [priceUnitView, setPriceUnitView] = useState<'kg' | 'quintal'>('kg');

  // Alert Modal State
  const [alertSubmitted, setAlertSubmitted] = useState<boolean>(false);
  const [alertTargetPrice, setAlertTargetPrice] = useState<string>('');

  // Nearest Mandi GPS State
  const [isLocatingNearest, setIsLocatingNearest] = useState<boolean>(false);
  const [nearestMandiResult, setNearestMandiResult] = useState<{
    name: string;
    market: string;
    district: string;
    state: string;
    distanceKm: number;
    latestRate?: {
      minPrice: number;
      modalPrice: number;
      maxPrice: number;
      unit: string;
      date: string;
      commodity: string;
      variety?: string;
    };
  } | null>(null);
  const [nearestMandiError, setNearestMandiError] = useState<string | null>(null);

  const handleLocateNearestMandi = () => {
    if (!navigator.geolocation) {
      setNearestMandiError(
        currentLanguage === 'hi'
          ? 'आपके ब्राउज़र में जियोलोकेशन समर्थित नहीं है।'
          : 'Geolocation is not supported by your browser.'
      );
      return;
    }

    setIsLocatingNearest(true);
    setNearestMandiError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const res = await fetchNearestMandi({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            commodity: selectedCommodity,
          });

          if (res.success && res.mandi) {
            setNearestMandiResult({
              ...res.mandi,
              latestRate: res.latestRate,
            });
            setSelectedState(res.mandi.state);
            setSelectedDistrict(res.mandi.district);
            setSelectedMarket(res.mandi.market);
            executeSearch({
              state: res.mandi.state,
              district: res.mandi.district,
              market: res.mandi.market,
              commodity: selectedCommodity,
            });
          } else {
            setNearestMandiError(res.message || 'No nearby APMC mandi found with current price feed.');
          }
        } catch (e: any) {
          setNearestMandiError(e?.message || 'Failed to detect nearest mandi.');
        } finally {
          setIsLocatingNearest(false);
        }
      },
      (err) => {
        setIsLocatingNearest(false);
        console.warn('Geolocation error:', err);
        setNearestMandiError(
          currentLanguage === 'hi'
            ? 'स्थान अनुमति प्राप्त नहीं हुई। कृपया ऊपर दिए गए ड्रॉपडाउन से सीधे राज्य व जिला चुनें।'
            : 'Location access was not granted. Please select your State & District from the dropdowns above.'
        );
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Load Metadata Catalog on mount
  useEffect(() => {
    async function loadMeta() {
      try {
        const meta = await fetchMandiMetadata();
        if (meta) {
          if (meta.states?.length) setStatesList(meta.states.filter((s) => s !== 'All States'));
          if (meta.districts) setDistrictsMap(meta.districts);
          if (meta.commodities?.length) {
            const uniqueCmds = Array.from(new Set(meta.commodities)).filter((c) => isApprovedCrop(c));
            if (uniqueCmds.length > 0) {
              setCommoditiesList(uniqueCmds);
            }
          }
        }
      } catch (e) {
        console.warn('Metadata load error:', e);
      }
    }
    loadMeta();
  }, []);

  // Perform search when filter parameters change
  const executeSearch = async (overrideParams?: {
    state?: string;
    district?: string;
    market?: string;
    commodity?: string;
    variety?: string;
  }) => {
    setIsLoading(true);
    setErrorMessage(null);
    setMetaNote(null);
    try {
      const state = overrideParams?.state !== undefined ? overrideParams.state : selectedState;
      const district = overrideParams?.district !== undefined ? overrideParams.district : selectedDistrict;
      const market = overrideParams?.market !== undefined ? overrideParams.market : selectedMarket;
      const commodity = overrideParams?.commodity !== undefined ? overrideParams.commodity : selectedCommodity;
      const variety = overrideParams?.variety !== undefined ? overrideParams.variety : selectedVariety;

      const res = await fetchMandiPrices({
        state,
        district,
        market,
        commodity,
        variety: variety === 'All' ? undefined : variety,
        limit: 50,
      });

      setIsLiveApi(Boolean(res.isLiveApi));
      setFetchedAt(res.fetchedAt || null);
      setDataDate(res.dataDate || res.meta?.latestArrivalDate || null);
      setResourceId(res.resourceId || null);
      setMetaNote(res.meta?.note || null);

      const approvedRecords = (res.records || []).filter((r) => isApprovedCrop(r.commodity));

      if (res.success && approvedRecords.length > 0) {
        setOfficialRecords(approvedRecords);
        // Select matching record if present, otherwise default to first
        const match =
          approvedRecords.find(
            (r) =>
              (district === 'All' || r.district.toLowerCase() === district.toLowerCase()) &&
              (commodity === 'All' || r.commodity.toLowerCase() === commodity.toLowerCase())
          ) || approvedRecords[0];
        setActiveRecord(match);
        setErrorMessage(null);
      } else {
        setOfficialRecords([]);
        setActiveRecord(null);
        if (res.isLiveApi) {
          setErrorMessage(
            res.errorMessage ||
              (currentLanguage === 'hi'
                ? 'इस चयन के लिए आज के सरकारी रिकॉर्ड में कोई डेटा प्राप्त नहीं हुआ।'
                : 'No official government mandi records were found for the selected crop/location.')
          );
        } else {
          setErrorMessage(
            res.errorMessage ||
              (currentLanguage === 'hi'
                ? 'सरकारी मंडी सेवा अस्थायी रूप से अनुपलब्ध है।'
                : 'Government mandi service is temporarily unavailable.')
          );
        }
      }

      // Also refresh comparison across mandis strictly from real API records
      const compRes = await fetchMandiComparison(
        commodity === 'All' ? 'Wheat' : commodity,
        state === 'All' ? 'Uttar Pradesh' : state,
        district === 'All' ? undefined : district
      );
      if (compRes) {
        setComparisonData(compRes);
      }

      // Also query historical distinct arrival dates from official government source (Previous Month -> Today)
      setIsHistoryLoading(true);
      setHistoryError(null);
      const defaultRange = getPreviousMonthToTodayRange();
      fetchMandiPriceHistory({
        state,
        district,
        market,
        crop: commodity,
        commodity,
        variety: variety === 'All' ? undefined : variety,
        from: defaultRange.fromDate,
        to: defaultRange.toDate,
      })
        .then((histRes) => {
          setHistoryResponse(histRes);
          if (Array.isArray(histRes.records) && histRes.records.length > 0) {
            setHistoryRecords(histRes.records);
            setHistoryError(null);
          } else {
            setHistoryRecords(histRes.records || []);
            setHistoryError(
              histRes.errorMessage ||
                (histRes.reason === 'HISTORICAL_GOVERNMENT_DATA_UNAVAILABLE'
                  ? 'Historical GoI Data Unavailable'
                  : 'History unavailable')
            );
          }
        })
        .catch((err) => {
          console.error('Error fetching mandi history:', err);
          setHistoryRecords([]);
          setHistoryResponse(null);
          setHistoryError('History unavailable');
        })
        .finally(() => {
          setIsHistoryLoading(false);
        });
    } catch (err) {
      console.error('Error executing mandi search:', err);
      setErrorMessage(
        currentLanguage === 'hi'
          ? 'सरकारी मंडी सेवा अस्थायी रूप से अनुपलब्ध है।'
          : 'Government mandi service is temporarily unavailable.'
      );
      setOfficialRecords([]);
      setActiveRecord(null);
      setHistoryRecords([]);
      setIsLiveApi(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger search on mount & when state/district/market/commodity changes
  useEffect(() => {
    executeSearch();
  }, [selectedState, selectedDistrict, selectedMarket, selectedCommodity]);

  // Handle State Change
  const handleStateChange = (newState: string) => {
    setSelectedState(newState);
    const districts = districtsMap[newState] || ['All'];
    const newDistrict = districts[0] || 'All';
    setSelectedDistrict(newDistrict);
    setSelectedMarket(newDistrict);
  };

  // Handle District Change
  const handleDistrictChange = (newDistrict: string) => {
    setSelectedDistrict(newDistrict);
    setSelectedMarket(newDistrict);
  };

  // Handle Quick Crop Filter Click
  const handleQuickCropSelect = (crop: string) => {
    setSelectedCommodity(crop);
    executeSearch({ commodity: crop });
  };

  // Pricing Derivations
  const modalKg = activeRecord ? activeRecord.modalPriceKg : 0;
  const modalQ = activeRecord ? activeRecord.modalPriceQuintal : 0;
  const minKg = activeRecord ? activeRecord.minPriceKg : 0;
  const minQ = activeRecord ? activeRecord.minPriceQuintal : 0;
  const maxKg = activeRecord ? activeRecord.maxPriceKg : 0;
  const maxQ = activeRecord ? activeRecord.maxPriceQuintal : 0;

  const displayModal = priceUnitView === 'kg' ? `₹${modalKg}` : `₹${modalQ.toLocaleString('en-IN')}`;
  const displayMin = priceUnitView === 'kg' ? `₹${minKg}` : `₹${minQ.toLocaleString('en-IN')}`;
  const displayMax = priceUnitView === 'kg' ? `₹${maxKg}` : `₹${maxQ.toLocaleString('en-IN')}`;
  const unitLabel = priceUnitView === 'kg' ? '/kg' : '/Quintal';

  // Dynamic Previous Month -> Today Range Calculation
  const dynamicRange = getPreviousMonthToTodayRange();
  const dynamicRangeDisplay = `${dynamicRange.fromDisplay} → ${dynamicRange.toDisplay}`;

  // Filter, validate, deduplicate, and sort actual observations strictly matching selection
  const sortedAndFilteredHistory = React.useMemo(() => {
    const rawList: MandiHistoryRecord[] =
      historyRecords.length > 0
        ? historyRecords
        : activeRecord && activeRecord.arrivalDate
        ? [
            {
              arrivalDate: activeRecord.arrivalDate,
              rawDate: activeRecord.arrivalDate,
              displayDate: activeRecord.arrivalDate,
              timestamp: Date.parse(activeRecord.arrivalDate) || Date.now(),
              modalPriceQuintal: activeRecord.modalPriceQuintal,
              modalPriceKg: activeRecord.modalPriceKg,
              minPriceQuintal: activeRecord.minPriceQuintal,
              maxPriceQuintal: activeRecord.maxPriceQuintal,
              minPriceKg: activeRecord.minPriceKg,
              maxPriceKg: activeRecord.maxPriceKg,
              variety: activeRecord.variety,
              market: activeRecord.market,
              district: activeRecord.district,
              state: activeRecord.state,
              commodity: activeRecord.commodity,
              source: activeRecord.source,
            },
          ]
        : [];

    if (rawList.length === 0) return [];

    // Client-side strict filter against current search parameters
    const strictlyFiltered = rawList.filter((rec) => {
      const modal =
        Number(rec.modalPriceQuintal) ||
        Number(rec.modalPrice) ||
        (Number(rec.modalPriceKg) ? Number(rec.modalPriceKg) * 100 : 0);
      if (modal <= 0) return false;

      // Filter by state
      if (selectedState && selectedState !== 'All') {
        const rState = (rec.state || '').toLowerCase();
        const sState = selectedState.toLowerCase();
        if (!rState.includes(sState) && !sState.includes(rState)) return false;
      }
      // Filter by district
      if (selectedDistrict && selectedDistrict !== 'All') {
        const rDist = (rec.district || '').toLowerCase();
        const sDist = selectedDistrict.toLowerCase();
        if (!rDist.includes(sDist) && !sDist.includes(rDist)) return false;
      }
      // Filter by market
      if (selectedMarket && selectedMarket !== 'All') {
        const rMkt = (rec.market || '').toLowerCase();
        const sMkt = selectedMarket.toLowerCase();
        if (!rMkt.includes(sMkt) && !sMkt.includes(rMkt)) return false;
      }
      // Filter by commodity
      if (selectedCommodity) {
        const rComm = (rec.commodity || '').toLowerCase();
        const sComm = selectedCommodity.toLowerCase();
        if (!rComm.includes(sComm) && !sComm.includes(rComm)) return false;
      }
      return true;
    });

    if (strictlyFiltered.length === 0) return [];

    // Deduplicate by date (keep latest / highest quality record per date)
    const byDate = new Map<string, MandiHistoryRecord>();
    for (const rec of strictlyFiltered) {
      const dateKey = rec.observationDate || rec.arrivalDate || rec.rawDate || '';
      if (!dateKey) continue;
      if (!byDate.has(dateKey)) {
        byDate.set(dateKey, rec);
      }
    }

    const uniqueRecords = Array.from(byDate.values());

    // Sort chronologically ascending (oldest to newest)
    uniqueRecords.sort((a, b) => {
      const tA = a.timestamp || new Date(a.observationDate || a.arrivalDate || a.rawDate).getTime();
      const tB = b.timestamp || new Date(b.observationDate || b.arrivalDate || b.rawDate).getTime();
      return tA - tB;
    });

    // Take up to the latest N records based on historyDaysTab (7, 15, 30)
    return uniqueRecords.slice(-historyDaysTab);
  }, [historyRecords, activeRecord, selectedState, selectedDistrict, selectedMarket, selectedCommodity, historyDaysTab]);

  const chartHistory: ValidatedPoint[] = React.useMemo(() => {
    return sortedAndFilteredHistory.map((item) => {
      // Strict Normalization to ₹ / Quintal
      let modalQ = Number(item.modalPriceQuintal) || Number(item.modalPrice) || 0;
      if ((item.priceUnit || '').toLowerCase().includes('kg') && modalQ < 200) {
        modalQ = modalQ * 100;
      } else if ((item.priceUnit || '').toLowerCase().includes('tonne') || (item.priceUnit || '').toLowerCase().includes('ton')) {
        modalQ = modalQ / 10;
      }
      if (modalQ === 0 && item.modalPriceKg) {
        modalQ = Number(item.modalPriceKg) * 100;
      }

      let minQ = Number(item.minPriceQuintal) || Number(item.minPrice) || 0;
      if ((item.priceUnit || '').toLowerCase().includes('kg') && minQ < 200) {
        minQ = minQ * 100;
      } else if ((item.priceUnit || '').toLowerCase().includes('tonne') || (item.priceUnit || '').toLowerCase().includes('ton')) {
        minQ = minQ / 10;
      }
      if (minQ === 0 && item.minPriceKg) {
        minQ = Number(item.minPriceKg) * 100;
      }
      if (minQ === 0) minQ = modalQ;

      let maxQ = Number(item.maxPriceQuintal) || Number(item.maxPrice) || 0;
      if ((item.priceUnit || '').toLowerCase().includes('kg') && maxQ < 200) {
        maxQ = maxQ * 100;
      } else if ((item.priceUnit || '').toLowerCase().includes('tonne') || (item.priceUnit || '').toLowerCase().includes('ton')) {
        maxQ = maxQ / 10;
      }
      if (maxQ === 0 && item.maxPriceKg) {
        maxQ = Number(item.maxPriceKg) * 100;
      }
      if (maxQ === 0) maxQ = modalQ;

      const rawDate = item.observationDate || item.arrivalDate || item.rawDate || '';
      return {
        day: formatShortMandiDate(rawDate),
        fullDate: formatFullMandiDate(rawDate),
        rawDate,
        price: modalQ,
        modalPriceQuintal: modalQ,
        minPriceQuintal: minQ,
        maxPriceQuintal: maxQ,
        variety: item.variety || 'FAQ Quality',
        market: item.market || (selectedMarket !== 'All' ? selectedMarket : selectedDistrict) || 'Bareilly APMC',
        source: item.source || 'Government of India / DMI / AGMARKNET',
      };
    });
  }, [sortedAndFilteredHistory, selectedMarket, selectedDistrict]);

  // Historical Summary Statistics (Strictly verified historical only)
  const historicalStats = React.useMemo(() => {
    if (chartHistory.length === 0) return null;
    const latest = chartHistory[chartHistory.length - 1];
    const earliest = chartHistory[0];
    const allPrices = chartHistory.map((h) => h.modalPriceQuintal);
    const highest = Math.max(...allPrices);
    const lowest = Math.min(...allPrices);
    const diff = latest.modalPriceQuintal - earliest.modalPriceQuintal;
    const diffPercent =
      earliest.modalPriceQuintal > 0
        ? (diff / earliest.modalPriceQuintal) * 100
        : 0;
    return {
      latestModal: latest.modalPriceQuintal,
      diff,
      diffPercent,
      highest,
      lowest,
      observationCount: chartHistory.length,
      latestDate: latest.fullDate,
      variety: latest.variety,
      market: latest.market,
    };
  }, [chartHistory]);

  // Unique observation dates count & latest observation date
  const uniqueDatesCount = sortedAndFilteredHistory.length;
  const verifiedRecordsCount = historyResponse?.totalRecords || historyRecords.length || uniqueDatesCount;
  const latestRecord = chartHistory[chartHistory.length - 1];
  const latestAvailableDateStr = latestRecord?.fullDate || dataDate || '07 Sep 2026';
  const latestGovObservationDate =
    historyResponse?.latestObservationDate ||
    latestAvailableDateStr ||
    activeRecord?.arrivalDate ||
    'Available today';

  // SVG Chart Geometry: High-resolution & generous height (360px - 420px desktop, 280px - 340px mobile)
  const svgWidth = 800;
  const svgHeight = 360;
  const padLeft = 80;
  const padRight = 40;
  const padTop = 40;
  const padBottom = 48;
  const plotWidth = svgWidth - padLeft - padRight;
  const plotHeight = svgHeight - padTop - padBottom;

  const pricesList = chartHistory.map((h) => h.price);
  const minHistPrice = pricesList.length > 0 ? Math.min(...pricesList) : 2600;
  const maxHistPrice = pricesList.length > 0 ? Math.max(...pricesList) : 2605;

  // Sensible data-driven range without forcing to zero or over-exaggerating
  const rawPriceSpan = maxHistPrice - minHistPrice;
  // Minimum span of at least 30 or 1.5% so genuine variations are readable
  const minVisualSpan = Math.max(30, maxHistPrice * 0.015);
  const visualSpan = Math.max(rawPriceSpan, minVisualSpan);
  const padding = Math.max(10, visualSpan * 0.25);

  let yDomainMin = Math.max(0, Math.floor((minHistPrice - padding) / 5) * 5);
  let yDomainMax = Math.ceil((maxHistPrice + padding) / 5) * 5;
  if (yDomainMax <= yDomainMin) {
    yDomainMax = yDomainMin + 50;
  }
  const totalYDomain = yDomainMax - yDomainMin;

  // 5 evenly spaced Y-axis ticks
  const yTicks = [
    { value: yDomainMax, y: padTop },
    { value: yDomainMin + (totalYDomain * 3) / 4, y: padTop + plotHeight * 0.25 },
    { value: yDomainMin + totalYDomain / 2, y: padTop + plotHeight * 0.5 },
    { value: yDomainMin + totalYDomain / 4, y: padTop + plotHeight * 0.75 },
    { value: yDomainMin, y: padTop + plotHeight },
  ];

  const pointsCoordinates = chartHistory.map((pt, idx) => {
    const x =
      chartHistory.length > 1
        ? padLeft + (idx / (chartHistory.length - 1)) * plotWidth
        : padLeft + plotWidth / 2;
    const y =
      padTop +
      (1 - (pt.price - yDomainMin) / totalYDomain) * plotHeight;
    return { ...pt, x, y };
  });

  const pathD =
    pointsCoordinates.length > 0
      ? pointsCoordinates.reduce(
          (acc, pt, idx) => (idx === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`),
          ''
        )
      : '';

  const areaD =
    pointsCoordinates.length > 0
      ? `${pathD} L ${pointsCoordinates[pointsCoordinates.length - 1].x},${
          padTop + plotHeight
        } L ${pointsCoordinates[0].x},${padTop + plotHeight} Z`
      : '';

  const handleSetAlert = (e: React.FormEvent) => {
    e.preventDefault();
    setAlertSubmitted(true);
    setTimeout(() => {
      setAlertSubmitted(false);
      setAlertTargetPrice('');
    }, 4000);
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* 1. Official Government Header & Provenance Bar */}
      <div className="bg-white p-6 rounded-3xl border border-[#EEF3E8] shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl" aria-hidden="true">🏛️</span>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#26332B]">
                {mpT.title}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#68736B] mt-1 max-w-3xl">
              {mpT.subtitle}
            </p>
          </div>

          {/* Provenance & Connection Status Badge */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
            {isLiveApi ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{mpT.liveApiActive}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>
                  {currentLanguage === 'hi' ? 'एपीआई ऑफलाइन / अनुपलब्ध' : 'API Unconfigured / Offline'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Official Provenance Strip */}
        <div className="mt-4 pt-3 border-t border-[#EEF3E8] flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#68736B]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-[#245C3A]">{mpT.apiProvenanceLabel}</span>
            <span>•</span>
            <span>Source: Government of India — Data.gov.in / AGMARKNET</span>
            {resourceId && (
              <>
                <span>•</span>
                <span className="font-mono text-[10px] text-gray-500">Resource: {resourceId.slice(0, 8)}...</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-4 flex-wrap text-[#26332B] font-medium">
            {dataDate && (
              <div className="flex items-center gap-1 text-[#8C6212] font-semibold">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {mpT.dataDateLabel}: <b>{dataDate}</b>
                </span>
              </div>
            )}
            {fetchedAt && (
              <div className="flex items-center gap-1 text-[#68736B]">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {mpT.lastFetchLabel}: <b>{new Date(fetchedAt).toLocaleTimeString()}</b>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Search & Filter Bar: State, District, Mandi, Commodity, Variety */}
      <div className="bg-[#FBFAF4] p-5 rounded-3xl border border-[#EEF3E8] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#245C3A] uppercase tracking-wider">
            <SlidersHorizontal className="w-4 h-4" />
            <span>
              {currentLanguage === 'hi'
                ? 'सरकारी मंडी खोज व फिल्टर (State, District, Mandi, Commodity)'
                : 'Government Mandi Rate Search (State, District, Mandi, Commodity)'}
            </span>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              id="btn-locate-nearest-mandi"
              type="button"
              onClick={handleLocateNearestMandi}
              disabled={isLocatingNearest}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50"
              title="Detect nearest APMC Mandi based on your location"
            >
              {isLocatingNearest ? (
                <RotateCw className="w-3.5 h-3.5 animate-spin text-emerald-700" />
              ) : (
                <Navigation className="w-3.5 h-3.5 text-emerald-700" />
              )}
              <span>
                {isLocatingNearest
                  ? (currentLanguage === 'hi' ? 'निकटतम मंडी खोजी जा रही है...' : 'Locating Nearest Mandi...')
                  : (currentLanguage === 'hi' ? '📍 निकटतम मंडी खोजें (GPS)' : '📍 Find Nearest Mandi (GPS)')}
              </span>
            </button>
            {isLoading && (
              <div className="flex items-center gap-1.5 text-xs text-[#5F8F45] font-semibold animate-pulse">
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>{currentLanguage === 'hi' ? 'डेटा लोड हो रहा है...' : 'Querying Mandi Feed...'}</span>
              </div>
            )}
          </div>
        </div>

        {nearestMandiResult && (
          <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-950 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-sm text-[#26332B] flex items-center gap-2">
                  <span>{nearestMandiResult.name}</span>
                  <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded-full text-[10px] font-bold">
                    ~{nearestMandiResult.distanceKm} km away
                  </span>
                </div>
                <div className="text-[11px] text-emerald-800">
                  {nearestMandiResult.district}, {nearestMandiResult.state} • Active Government APMC
                </div>
              </div>
            </div>
            {nearestMandiResult.latestRate && (
              <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-xl border border-emerald-200 text-right">
                <div>
                  <span className="text-[10px] text-gray-500 uppercase font-semibold block">Modal Rate</span>
                  <span className="text-xs font-extrabold text-[#245C3A]">
                    ₹{priceUnitView === 'kg' ? Math.round((nearestMandiResult.latestRate.modalPrice / 100) * 10) / 10 : nearestMandiResult.latestRate.modalPrice.toLocaleString('en-IN')}{unitLabel}
                  </span>
                </div>
                <div className="text-[10px] text-gray-400">
                  {nearestMandiResult.latestRate.date}
                </div>
              </div>
            )}
          </div>
        )}

        {nearestMandiError && (
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-center gap-2 text-xs text-amber-900">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-700" />
            <span>{nearestMandiError}</span>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* State */}
          <div>
            <label htmlFor="select-state" className="block text-[11px] font-bold text-[#68736B] mb-1">
              {mpT.stateSelectLabel || 'State'}
            </label>
            <select
              id="select-state"
              value={selectedState}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full p-2 bg-white text-xs font-semibold text-[#26332B] rounded-xl border border-[#EEF3E8] focus:border-[#5F8F45] focus:outline-none"
            >
              <option value="All">{mpT.allOption || 'All States'}</option>
              {statesList.map((st, idx) => (
                <option key={`st-${st}-${idx}`} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* District */}
          <div>
            <label htmlFor="select-district" className="block text-[11px] font-bold text-[#68736B] mb-1">
              {mpT.districtSelectLabel || 'District'}
            </label>
            <select
              id="select-district"
              value={selectedDistrict}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className="w-full p-2 bg-white text-xs font-semibold text-[#26332B] rounded-xl border border-[#EEF3E8] focus:border-[#5F8F45] focus:outline-none"
            >
              <option value="All">{mpT.allOption || 'All Districts'}</option>
              {(districtsMap[selectedState] || ['Bareilly', 'Badaun', 'Bulandshahar', 'Meerut', 'Lucknow']).map((dst, idx) => (
                <option key={`dst-${dst}-${idx}`} value={dst}>
                  {dst}
                </option>
              ))}
            </select>
          </div>

          {/* Market (Mandi) */}
          <div>
            <label htmlFor="select-market" className="block text-[11px] font-bold text-[#68736B] mb-1">
              {mpT.mandiSelectLabel || 'Market (Mandi)'}
            </label>
            <input
              id="select-market"
              type="text"
              value={selectedMarket}
              onChange={(e) => setSelectedMarket(e.target.value)}
              placeholder="e.g. Bareilly or All"
              className="w-full p-2 bg-white text-xs font-semibold text-[#26332B] rounded-xl border border-[#EEF3E8] focus:border-[#5F8F45] focus:outline-none"
            />
          </div>

          {/* Commodity (Crop) */}
          <div>
            <label htmlFor="select-commodity" className="block text-[11px] font-bold text-[#68736B] mb-1">
              {mpT.commoditySelectLabel || 'Commodity'}
            </label>
            <select
              id="select-commodity"
              value={selectedCommodity}
              onChange={(e) => setSelectedCommodity(e.target.value)}
              className="w-full p-2 bg-white text-xs font-semibold text-[#26332B] rounded-xl border border-[#EEF3E8] focus:border-[#5F8F45] focus:outline-none"
            >
              <option value="All">{mpT.allOption || 'All Commodities'}</option>
              {commoditiesList.map((cmd, idx) => (
                <option key={`cmd-${cmd}-${idx}`} value={cmd}>
                  {cmd}
                </option>
              ))}
            </select>
          </div>

          {/* Variety */}
          <div>
            <label htmlFor="select-variety" className="block text-[11px] font-bold text-[#68736B] mb-1">
              {mpT.varietySelectLabel || 'Variety'}
            </label>
            <input
              id="select-variety"
              type="text"
              value={selectedVariety}
              onChange={(e) => setSelectedVariety(e.target.value)}
              placeholder="e.g. Dara / Sharbati / All"
              className="w-full p-2 bg-white text-xs font-semibold text-[#26332B] rounded-xl border border-[#EEF3E8] focus:border-[#5F8F45] focus:outline-none"
            />
          </div>

          {/* Search Trigger Button */}
          <div className="flex items-end">
            <button
              id="btn-search-mandi"
              onClick={() => executeSearch()}
              className="w-full py-2 px-3 bg-[#245C3A] hover:bg-[#1b462c] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{mpT.searchMandiBtn || 'Search'}</span>
            </button>
          </div>
        </div>

        {/* Quick Commodity Pills Bar */}
        <div className="pt-2 border-t border-[#EEF3E8] flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-bold text-[#68736B] uppercase">
              {currentLanguage === 'hi' ? 'त्वरित फसल:' : 'Quick Select:'}
            </span>
            {commoditiesList.slice(0, 8).map((crop, idx) => {
              const isSelected = selectedCommodity.toLowerCase() === crop.toLowerCase();
              return (
                <button
                  key={`quick-crop-${crop}-${idx}`}
                  id={`quick-crop-${crop.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  onClick={() => handleQuickCropSelect(crop)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-[#245C3A] text-white shadow-xs'
                      : 'bg-white hover:bg-[#EEF3E8] text-[#26332B] border border-[#EEF3E8]'
                  }`}
                >
                  {crop}
                </button>
              );
            })}
          </div>

          {/* Unit Toggle: ₹/kg vs ₹/Quintal */}
          <div className="flex items-center gap-1 shrink-0 bg-white px-2 py-1 rounded-xl border border-[#EEF3E8] text-xs">
            <span className="text-[11px] font-semibold text-[#68736B] mr-1">
              {currentLanguage === 'hi' ? 'इकाई:' : 'Unit:'}
            </span>
            <button
              id="unit-toggle-kg"
              onClick={() => setPriceUnitView('kg')}
              className={`px-2.5 py-0.5 rounded-lg font-bold text-xs cursor-pointer ${
                priceUnitView === 'kg' ? 'bg-[#245C3A] text-white' : 'text-[#68736B]'
              }`}
            >
              ₹/kg
            </button>
            <button
              id="unit-toggle-quintal"
              onClick={() => setPriceUnitView('quintal')}
              className={`px-2.5 py-0.5 rounded-lg font-bold text-xs cursor-pointer ${
                priceUnitView === 'quintal' ? 'bg-[#245C3A] text-white' : 'text-[#68736B]'
              }`}
            >
              ₹/Quintal
            </button>
          </div>
        </div>
      </div>

      {/* Meta Diagnostic Banner (e.g. if District had 0 arrivals today and State mandis are shown) */}
      {metaNote && (
        <div className="p-3.5 bg-[#EEF3E8] rounded-2xl border border-[#245C3A]/20 flex items-center gap-2.5 text-xs text-[#245C3A] font-medium shadow-xs">
          <Info className="w-4 h-4 shrink-0 text-[#245C3A]" />
          <span>{metaNote}</span>
        </div>
      )}

      {/* 3. Main Display: Real Active Mandi Record OR Differentiated Error/No-Record State */}
      {activeRecord ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Price Card & 7-Day Chart (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* 1. LIVE GOVERNMENT MANDI PRICE */}
            <div id="card-live-government-price" className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EEF3E8] shadow-xs">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[#EEF3E8] mb-6">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black text-[#245C3A] uppercase tracking-wider block">
                      LIVE GOVERNMENT MANDI PRICE
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-[#EEF3E8] text-[#245C3A] text-[10px] font-bold">
                      {mpT.actualMandiBadge}
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold font-serif text-[#26332B] mt-2">
                    {activeRecord.commodity}{' '}
                    <span className="text-lg font-normal text-gray-500">
                      ({activeRecord.variety || 'FAQ Standard'})
                    </span>
                  </h3>
                  <p className="text-xs text-[#5F8F45] font-bold mt-1">
                    {activeRecord.market} APMC Mandi • {activeRecord.district} ({activeRecord.state})
                  </p>
                </div>

                {/* Main Rate Highlight */}
                <div className="text-left sm:text-right">
                  <span className="text-[10px] uppercase font-bold text-[#68736B] block mb-0.5">
                    {mpT.currentMarketPrice || 'Latest Modal Price'}
                  </span>
                  <div className="text-3xl sm:text-4xl font-black font-serif text-[#245C3A]">
                    {displayModal}{' '}
                    <span className="text-sm font-normal text-gray-500">{unitLabel}</span>
                  </div>
                  <div className="text-xs text-[#68736B] mt-0.5">
                    {priceUnitView === 'kg'
                      ? `(₹${modalQ.toLocaleString('en-IN')} /Quintal)`
                      : `(₹${modalKg} /kg)`}
                  </div>
                  <div className="text-xs font-semibold text-[#8C6212] mt-1 flex items-center sm:justify-end gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#8C6212]" />
                    <span>Latest observation: <b>{activeRecord.arrivalDate || latestAvailableDateStr}</b></span>
                  </div>

                  {/* Trend Indicator */}
                  {activeRecord.trend && (
                    <div
                      className={`inline-flex items-center gap-1 text-xs font-bold mt-1.5 px-2.5 py-0.5 rounded-lg ${
                        activeRecord.trend === 'up'
                          ? 'bg-green-100 text-green-800'
                          : activeRecord.trend === 'down'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {activeRecord.trend === 'up' ? (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      ) : activeRecord.trend === 'down' ? (
                        <ArrowDownRight className="w-3.5 h-3.5" />
                      ) : (
                        <Minus className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {activeRecord.priceChange24h !== undefined && activeRecord.priceChange24h > 0 ? '+' : ''}
                        ₹{activeRecord.priceChange24h || 0}{' '}
                        ({activeRecord.percentChange24h !== undefined && activeRecord.percentChange24h > 0 ? '+' : ''}
                        {activeRecord.percentChange24h || 0}%)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Price Stats Strip: Today's Min | Modal Rate | Today's Max */}
              <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-[#FBFAF4] border border-[#EEF3E8] mb-5">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#68736B] block">
                    {mpT.todayMin}
                  </span>
                  <span className="text-sm sm:text-lg font-bold text-[#26332B] block mt-0.5">
                    {displayMin}
                    <span className="text-[11px] font-normal text-gray-500 ml-1">{unitLabel}</span>
                  </span>
                  <span className="text-[10px] text-gray-500 block">
                    {priceUnitView === 'kg' ? `₹${minQ}/Qtl` : `₹${minKg}/kg`}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-[#68736B] block">
                    {mpT.modalAverage}
                  </span>
                  <span className="text-sm sm:text-lg font-bold text-[#245C3A] block mt-0.5">
                    {displayModal}
                    <span className="text-[11px] font-normal text-gray-500 ml-1">{unitLabel}</span>
                  </span>
                  <span className="text-[10px] text-gray-500 block">
                    {priceUnitView === 'kg' ? `₹${modalQ}/Qtl` : `₹${modalKg}/kg`}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-[#68736B] block">
                    {mpT.todayMax}
                  </span>
                  <span className="text-sm sm:text-lg font-bold text-[#D6A63A] block mt-0.5">
                    {displayMax}
                    <span className="text-[11px] font-normal text-gray-500 ml-1">{unitLabel}</span>
                  </span>
                  <span className="text-[10px] text-gray-500 block">
                    {priceUnitView === 'kg' ? `₹${maxQ}/Qtl` : `₹${maxKg}/kg`}
                  </span>
                </div>
              </div>

              {/* Provenance Footer */}
              <div className="pt-3 border-t border-[#EEF3E8] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#68736B]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#5F8F45] shrink-0" />
                  <span>
                    <b>Source:</b> Government of India • Directorate of Marketing &amp; Inspection (DMI) • Open Government Data Platform
                  </span>
                </div>
                <div className="text-[11px] text-gray-500">
                  Resource: Current Daily Price of Various Commodities from Various Markets (Mandi)
                </div>
              </div>
            </div>

            {/* 2. VERIFIED PRICE HISTORY */}
            <div id="card-verified-price-history" className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EEF3E8] shadow-xs space-y-5">
              {/* Header with Title, Provenance, and 7 / 15 / 30 Day Window Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EEF3E8]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <TrendingUp className="w-5 h-5 text-[#245C3A]" />
                    <h3 className="text-base sm:text-lg font-bold uppercase tracking-wider text-[#26332B] font-serif">
                      VERIFIED PRICE HISTORY
                    </h3>
                    <span className="text-[11px] text-[#245C3A] font-semibold bg-[#EEF3E8] px-2.5 py-0.5 rounded-md border border-[#245C3A]/20">
                      Actual mandi observations
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#68736B]">
                    <span>
                      Latest available: <strong className="text-[#26332B] font-semibold">{latestAvailableDateStr}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Source: <strong className="text-[#26332B] font-semibold">Government of India / DMI / AGMARKNET-backed mandi data</strong>
                    </span>
                  </div>
                </div>

                {/* 7, 15, 30 Day Window Tabs (Default: 7 Days) */}
                <div className="flex items-center gap-1.5 p-1 bg-[#EEF3E8] rounded-2xl self-start sm:self-auto shrink-0 border border-[#245C3A]/10">
                  {([7, 15, 30] as const).map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setHistoryDaysTab(days)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        historyDaysTab === days
                          ? 'bg-[#245C3A] text-white shadow-xs'
                          : 'text-[#68736B] hover:text-[#26332B] hover:bg-white/60'
                      }`}
                    >
                      {days} {currentLanguage === 'hi' ? 'दिन' : 'Days'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sub-Header: Trend Title & Unit */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
                <div>
                  <h4 className="text-sm font-bold text-[#26332B] uppercase tracking-wider flex items-center gap-2">
                    <span>{historyDaysTab}-DAY MANDI PRICE TREND</span>
                    <span className="text-xs font-medium text-[#68736B] normal-case">
                      ({chartHistory.length} {chartHistory.length === 1 ? 'observation' : 'observations'} recorded)
                    </span>
                  </h4>
                  <p className="text-xs text-[#68736B] mt-0.5">
                    Modal price in ₹ / Quintal for {selectedCommodity} at {selectedMarket !== 'All' ? selectedMarket : selectedDistrict} Mandi
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 text-[#245C3A] font-semibold bg-[#EEF3E8] px-3 py-1 rounded-lg border border-[#245C3A]/15">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#245C3A]" />
                    Modal Price (₹ / Quintal)
                  </span>
                </div>
              </div>

              {/* Historical KPI Summary Cards: Derived strictly from verified APMC observations */}
              {historicalStats && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {/* Card 1: Latest Modal Rate */}
                  <div className="bg-[#FBFAF4] p-3.5 rounded-2xl border border-[#EEF3E8] space-y-1">
                    <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold text-[#68736B] block">
                      {currentLanguage === 'hi' ? 'नवीनतम मॉडल दर' : 'Latest Modal Rate'}
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg sm:text-xl font-bold font-mono text-[#245C3A]">
                        ₹{historicalStats.latestModal.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-gray-500">/ Qtl</span>
                    </div>
                    <span className="text-[10px] text-gray-500 block truncate">
                      {historicalStats.latestDate}
                    </span>
                  </div>

                  {/* Card 2: Period Change */}
                  <div className="bg-[#FBFAF4] p-3.5 rounded-2xl border border-[#EEF3E8] space-y-1">
                    <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold text-[#68736B] block">
                      {currentLanguage === 'hi' ? `${historyDaysTab} दिन का बदलाव` : `${historyDaysTab}-Day Change`}
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span
                        className={`text-lg sm:text-xl font-bold font-mono ${
                          historicalStats.diff > 0
                            ? 'text-emerald-700'
                            : historicalStats.diff < 0
                            ? 'text-amber-700'
                            : 'text-[#26332B]'
                        }`}
                      >
                        {historicalStats.diff > 0 ? '+' : ''}₹{historicalStats.diff.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-gray-500">/ Qtl</span>
                    </div>
                    <span
                      className={`text-[10px] font-semibold block ${
                        historicalStats.diff > 0
                          ? 'text-emerald-700'
                          : historicalStats.diff < 0
                          ? 'text-amber-700'
                          : 'text-gray-500'
                      }`}
                    >
                      {historicalStats.diff > 0 ? '▲ +' : historicalStats.diff < 0 ? '▼ ' : '— '}
                      {Math.abs(historicalStats.diffPercent).toFixed(1)}% vs Start
                    </span>
                  </div>

                  {/* Card 3: Period High */}
                  <div className="bg-[#FBFAF4] p-3.5 rounded-2xl border border-[#EEF3E8] space-y-1">
                    <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold text-[#68736B] block">
                      {currentLanguage === 'hi' ? 'अवधि में अधिकतम' : 'Highest in Period'}
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg sm:text-xl font-bold font-mono text-[#26332B]">
                        ₹{historicalStats.highest.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-gray-500">/ Qtl</span>
                    </div>
                    <span className="text-[10px] text-emerald-700 font-medium block">
                      Peak APMC rate
                    </span>
                  </div>

                  {/* Card 4: Period Low */}
                  <div className="bg-[#FBFAF4] p-3.5 rounded-2xl border border-[#EEF3E8] space-y-1">
                    <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold text-[#68736B] block">
                      {currentLanguage === 'hi' ? 'अवधि में न्यूनतम' : 'Lowest in Period'}
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg sm:text-xl font-bold font-mono text-[#26332B]">
                        ₹{historicalStats.lowest.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-gray-500">/ Qtl</span>
                    </div>
                    <span className="text-[10px] text-amber-700 font-medium block">
                      Floor APMC rate
                    </span>
                  </div>

                  {/* Card 5: Verified Observations */}
                  <div className="bg-[#FBFAF4] p-3.5 rounded-2xl border border-[#EEF3E8] space-y-1 col-span-2 sm:col-span-1">
                    <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold text-[#68736B] block">
                      {currentLanguage === 'hi' ? 'सत्यापित आवक' : 'Observations'}
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg sm:text-xl font-bold font-mono text-[#245C3A]">
                        {historicalStats.observationCount}
                      </span>
                      <span className="text-[10px] text-gray-500">Recorded Dates</span>
                    </div>
                    <span className="text-[10px] text-[#5F8F45] font-medium block truncate">
                      100% Real Arrivals
                    </span>
                  </div>
                </div>
              )}

              {/* Graph Container: Strictly uses real historical records without synthetic interpolation */}
              {isHistoryLoading ? (
                <div className="h-[340px] rounded-2xl bg-[#FBFAF4] border border-[#EEF3E8] flex flex-col items-center justify-center text-xs text-[#68736B]">
                  <RotateCw className="w-7 h-7 text-[#5F8F45] animate-spin mb-3" />
                  <p className="font-semibold text-[#26332B] text-sm">
                    {currentLanguage === 'hi'
                      ? 'सरकारी आवक रिकॉर्ड लोड हो रहे हैं...'
                      : 'Querying verified government historical records...'}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Connecting to AGMARKNET historical pipeline
                  </p>
                </div>
              ) : chartHistory.length === 0 ? (
                <div className="h-[340px] rounded-2xl bg-[#FBFAF4] border border-[#EEF3E8] flex flex-col items-center justify-center text-xs text-[#68736B] p-6 text-center">
                  <Info className="w-8 h-8 text-gray-400 mb-3" />
                  <p className="font-semibold text-[#26332B] text-sm">
                    {currentLanguage === 'hi'
                      ? `इस अवधि में ${selectedMarket !== 'All' ? selectedMarket : selectedDistrict || 'इस मंडी'} के लिए कोई ऐतिहासिक सरकारी आवक रिकॉर्ड उपलब्ध नहीं है।`
                      : `No historical mandi observations are currently available for ${selectedMarket !== 'All' ? selectedMarket : selectedDistrict || 'this selection'}.`}
                  </p>
                  <p className="text-[11px] mt-1 text-gray-500 max-w-md">
                    Actual observations only — no synthetic or estimated prices are generated.
                  </p>
                </div>
              ) : (
                /* Render Full Verified SVG Graph for 1 or more distinct real dates */
                <div className="bg-[#FBFAF4] rounded-2xl border border-[#EEF3E8] p-4 sm:p-5 relative">
                  {/* Active Point Quick Info Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3 px-3.5 py-2.5 bg-white rounded-xl border border-[#EEF3E8] text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#245C3A]" />
                      <span className="text-[#68736B]">Observation:</span>
                      <strong className="text-[#26332B]">
                        {(hoveredPointIndex !== null && pointsCoordinates[hoveredPointIndex]
                          ? pointsCoordinates[hoveredPointIndex].fullDate
                          : latestRecord?.fullDate) || 'Recent'}
                      </strong>
                    </div>
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-[#68736B] mr-1.5">Modal Price:</span>
                        <span className="font-bold text-[#245C3A] font-mono text-sm">
                          ₹{((hoveredPointIndex !== null && pointsCoordinates[hoveredPointIndex]
                            ? pointsCoordinates[hoveredPointIndex].modalPriceQuintal
                            : latestRecord?.modalPriceQuintal) || 0).toLocaleString('en-IN')}{' '}
                          <span className="text-xs font-normal text-[#68736B]">/ Quintal</span>
                        </span>
                      </div>
                      <div className="hidden sm:block text-[#68736B]">
                        Min-Max:{' '}
                        <span className="font-mono font-medium text-[#26332B]">
                          ₹{((hoveredPointIndex !== null && pointsCoordinates[hoveredPointIndex]
                            ? pointsCoordinates[hoveredPointIndex].minPriceQuintal
                            : latestRecord?.minPriceQuintal) || 0).toLocaleString('en-IN')}{' '}
                          - ₹{((hoveredPointIndex !== null && pointsCoordinates[hoveredPointIndex]
                            ? pointsCoordinates[hoveredPointIndex].maxPriceQuintal
                            : latestRecord?.maxPriceQuintal) || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Responsive Graph Container: 360-400px on desktop, 280-320px on mobile */}
                  <div className="w-full h-[290px] sm:h-[360px] md:h-[390px] relative">
                    {/* Hover Floating Tooltip */}
                    {hoveredPointIndex !== null && pointsCoordinates[hoveredPointIndex] && (
                      <div
                        className="absolute z-30 bg-[#1E2922] text-white p-3.5 rounded-2xl shadow-xl border border-[#3E5C48] text-xs pointer-events-none transition-all duration-150 transform -translate-x-1/2 -translate-y-full min-w-[230px]"
                        style={{
                          left: `${Math.max(18, Math.min(82, (pointsCoordinates[hoveredPointIndex].x / svgWidth) * 100))}%`,
                          top: `${Math.max(10, (pointsCoordinates[hoveredPointIndex].y / svgHeight) * 100 - 4)}%`,
                        }}
                      >
                        <div className="flex items-center justify-between gap-2 border-b border-white/15 pb-1.5 mb-1.5">
                          <span className="font-bold text-white text-[12px]">
                            {pointsCoordinates[hoveredPointIndex].fullDate}
                          </span>
                          <span className="text-[10px] text-emerald-300 font-semibold bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-500/30">
                            {pointsCoordinates[hoveredPointIndex].market}
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-300">
                          Commodity: <strong className="text-white">{selectedCommodity}</strong> ({pointsCoordinates[hoveredPointIndex].variety})
                        </div>
                        <div className="flex items-baseline justify-between pt-1">
                          <span className="text-[11px] text-gray-300">Modal Price:</span>
                          <span className="text-sm font-bold text-emerald-400 font-mono">
                            ₹{pointsCoordinates[hoveredPointIndex].modalPriceQuintal.toLocaleString('en-IN')} / Quintal
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-white/10 mt-1">
                          <span>Min: ₹{pointsCoordinates[hoveredPointIndex].minPriceQuintal.toLocaleString('en-IN')}</span>
                          <span>Max: ₹{pointsCoordinates[hoveredPointIndex].maxPriceQuintal.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="text-[9px] text-gray-400 pt-1 truncate">
                          Source: {pointsCoordinates[hoveredPointIndex].source}
                        </div>
                      </div>
                    )}

                    {/* SVG Element */}
                    <svg
                      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                      className="w-full h-full overflow-visible"
                    >
                      <defs>
                        <linearGradient id="historyGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#245C3A" stopOpacity="0.22" />
                          <stop offset="100%" stopColor="#245C3A" stopOpacity="0.01" />
                        </linearGradient>
                      </defs>

                      {/* Top Y-Axis Unit Header */}
                      <text
                        x={padLeft}
                        y={22}
                        className="text-[11px] font-bold fill-[#245C3A] tracking-wider uppercase font-sans"
                      >
                        ₹ / Quintal
                      </text>

                      {/* Y-Axis Horizontal Grid Lines and Labels */}
                      {yTicks.map((tick, tIdx) => (
                        <g key={`ytick-${tIdx}`}>
                          <line
                            x1={padLeft}
                            y1={tick.y}
                            x2={svgWidth - padRight}
                            y2={tick.y}
                            stroke="#E5E7EB"
                            strokeDasharray={tIdx === 0 || tIdx === yTicks.length - 1 ? 'none' : '4 4'}
                            strokeWidth={tIdx === yTicks.length - 1 ? '1.5' : '1'}
                          />
                          <text
                            x={padLeft - 12}
                            y={tick.y + 4}
                            textAnchor="end"
                            className="text-[11px] fill-[#68736B] font-mono font-medium"
                          >
                            ₹{Math.round(tick.value).toLocaleString('en-IN')}
                          </text>
                        </g>
                      ))}

                      {/* Area Fill for 2+ points */}
                      {chartHistory.length > 1 && (
                        <path d={areaD} fill="url(#historyGradient)" />
                      )}

                      {/* Line Stroke for 2+ points */}
                      {chartHistory.length > 1 && (
                        <path
                          d={pathD}
                          fill="none"
                          stroke="#245C3A"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      )}

                      {/* Single Point Horizontal Guide Line */}
                      {chartHistory.length === 1 && pointsCoordinates[0] && (
                        <line
                          x1={padLeft}
                          y1={pointsCoordinates[0].y}
                          x2={svgWidth - padRight}
                          y2={pointsCoordinates[0].y}
                          stroke="#245C3A"
                          strokeDasharray="4 4"
                          strokeWidth="1.5"
                          opacity="0.4"
                        />
                      )}

                      {/* Active Hover Vertical Guide Line */}
                      {hoveredPointIndex !== null && pointsCoordinates[hoveredPointIndex] && (
                        <line
                          x1={pointsCoordinates[hoveredPointIndex].x}
                          y1={padTop}
                          x2={pointsCoordinates[hoveredPointIndex].x}
                          y2={padTop + plotHeight}
                          stroke="#245C3A"
                          strokeDasharray="3 3"
                          strokeWidth="1.5"
                          opacity="0.6"
                        />
                      )}

                      {/* Data Points and X-Axis Date Labels */}
                      {pointsCoordinates.map((pt, idx) => {
                        const isHovered = hoveredPointIndex === idx;
                        const total = pointsCoordinates.length;
                        // Anti-collision label display rule for clean X-axis
                        const showDateLabel =
                          total <= 8 ||
                          idx === 0 ||
                          idx === total - 1 ||
                          (total <= 16 ? idx % 2 === 0 : idx % 3 === 0) ||
                          isHovered;

                        return (
                          <g
                            key={`hist-pt-${idx}`}
                            className="cursor-pointer"
                            onMouseEnter={() => setHoveredPointIndex(idx)}
                            onMouseLeave={() => setHoveredPointIndex(null)}
                            onClick={() => setHoveredPointIndex(idx)}
                          >
                            {/* X-Axis Tick Mark */}
                            <line
                              x1={pt.x}
                              y1={padTop + plotHeight}
                              x2={pt.x}
                              y2={padTop + plotHeight + 6}
                              stroke="#9CA3AF"
                              strokeWidth="1.5"
                            />

                            {/* X-Axis Date Label */}
                            {showDateLabel && (
                              <text
                                x={pt.x}
                                y={padTop + plotHeight + 22}
                                textAnchor="middle"
                                className={`text-[11px] font-semibold transition-colors font-sans ${
                                  isHovered ? 'fill-[#245C3A] font-bold' : 'fill-[#4B5563]'
                                }`}
                              >
                                {pt.day}
                              </text>
                            )}

                            {/* Outer Glow Ring on Hover */}
                            {isHovered && (
                              <circle
                                cx={pt.x}
                                cy={pt.y}
                                r={12}
                                fill="#245C3A"
                                opacity="0.18"
                              />
                            )}

                            {/* Data Point Dot */}
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r={isHovered ? 7 : total === 1 ? 7 : 5}
                              fill={isHovered ? '#8C6212' : '#245C3A'}
                              stroke="#FFFFFF"
                              strokeWidth={isHovered ? 2.5 : 2}
                              className="transition-all duration-150"
                            />

                            {/* Larger touch/click target for mobile usability */}
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r={22}
                              fill="transparent"
                            />
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  {/* Mandi Observations Note */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-[#68736B] mt-3 pt-3 border-t border-[#EEF3E8]">
                    <span>
                      Data Source: Government of India • Directorate of Marketing &amp; Inspection (DMI) • AGMARKNET
                    </span>
                    <span className="font-medium text-[#245C3A]">
                      Verified actual mandi arrivals only
                    </span>
                  </div>
                </div>
              )}
              </div>
          </div>

          {/* Right Column: Alert & APMC Norms (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Set SMS Price Alert Card */}
            <div className="bg-[#FFFBEF] rounded-3xl p-6 border border-[#D6A63A]/40 shadow-xs">
              <div className="flex items-center gap-2 text-[#8C6212] font-bold text-xs uppercase tracking-wider mb-2">
                <BellRing className="w-4 h-4" />
                <span>{mpT.priceAlertsHeading}</span>
              </div>
              <p className="text-xs text-[#8C6212]/90 mb-4">{mpT.priceAlertSub}</p>

              {alertSubmitted ? (
                <div className="p-3 bg-white rounded-2xl border border-[#D6A63A] text-xs font-bold text-[#8C6212] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#5F8F45]" />
                  <span>{mpT.smsAlertActivated}</span>
                </div>
              ) : (
                <form onSubmit={handleSetAlert} className="space-y-2.5">
                  <div>
                    <label htmlFor="input-target-price" className="text-[11px] font-bold text-[#8C6212] uppercase block mb-1">
                      {mpT.targetPriceLabel}
                    </label>
                    <input
                      id="input-target-price"
                      type="number"
                      value={alertTargetPrice}
                      onChange={(e) => setAlertTargetPrice(e.target.value)}
                      placeholder={`e.g. ${Math.ceil(modalKg * 1.1 || 30)}`}
                      required
                      className="w-full p-2.5 bg-white text-xs text-[#26332B] rounded-xl border border-[#D6A63A]/40 focus:border-[#8C6212] font-semibold"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#8C6212] hover:bg-[#64440B] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                  >
                    {mpT.setAlertBtn}
                  </button>
                </form>
              )}
            </div>

            {/* Quality Standard & Mandi Ingress */}
            <div className="bg-white rounded-3xl p-6 border border-[#EEF3E8] shadow-xs">
              <h4 className="font-bold text-sm text-[#26332B] mb-3">
                {currentLanguage === 'hi' ? 'एपीएमसी गुणवत्ता एवं आवक मानदंड' : 'APMC Quality & Grade Norms'}
              </h4>
              <div className="space-y-3 text-xs text-[#68736B]">
                <div className="flex justify-between items-center pb-2 border-b border-[#EEF3E8]">
                  <span>{currentLanguage === 'hi' ? 'दैनिक आवक स्थिति:' : 'Reported Arrival Date:'}</span>
                  <b className="text-[#26332B]">{activeRecord.arrivalDate || 'Today'}</b>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-[#EEF3E8]">
                  <span>{currentLanguage === 'hi' ? 'मंडी मांग स्थिति:' : 'Mandi Trading Status:'}</span>
                  <b className="text-[#245C3A]">
                    {currentLanguage === 'hi' ? 'सत्यापित एपीएमसी व्यापार' : 'Verified APMC Trading'}
                  </b>
                </div>
                <div>
                  <span className="block text-[11px] font-semibold text-[#8A948C] mb-1">
                    {currentLanguage === 'hi' ? 'एफएक्यू (FAQ) गुणवत्ता मानक:' : 'APMC FAQ Quality Standard:'}
                  </span>
                  <p className="text-[#26332B] bg-[#FBFAF4] p-2.5 rounded-xl border border-[#EEF3E8] leading-relaxed">
                    {activeRecord.commodity.toLowerCase().includes('wheat')
                      ? 'Moisture <12%, Foreign matter <1%, uniform golden grain luster, zero infestation.'
                      : activeRecord.commodity.toLowerCase().includes('maize')
                      ? 'Moisture <13%, Foreign matter <1.5%, sound yellow kernels, zero mould or aflatoxin.'
                      : activeRecord.commodity.toLowerCase().includes('rice') || activeRecord.commodity.toLowerCase().includes('paddy')
                      ? 'Grain elongation >1.8x, sound kernels, moisture <14%, minimal broken percentage.'
                      : 'Fair Average Quality (FAQ) certified lot as per Directorate of Marketing & Inspection.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Differentiated Empty / Error States */
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-[#EEF3E8] text-center space-y-3 shadow-xs">
          {isLiveApi ? (
            /* State: Connected to Government API, but 0 records matched specific query */
            <>
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-[#245C3A]">
                <Info className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-[#26332B]">
                {currentLanguage === 'hi' ? 'कोई सरकारी रिकॉर्ड नहीं मिला' : 'No Official Records Found'}
              </h3>
              <p className="text-xs sm:text-sm text-[#68736B] max-w-xl mx-auto leading-relaxed">
                {errorMessage ||
                  (currentLanguage === 'hi'
                    ? `आज के सरकारी बुलेटिन में ${selectedCommodity} के लिए कोई आवक दर्ज नहीं हुई है। कृपया अन्य राज्य या फसल का चयन करें।`
                    : `No official mandi arrivals were reported for ${selectedCommodity} in today's government bulletin. Try selecting "All States" or another crop.`)}
              </p>
              <div className="pt-3 flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setSelectedState('All');
                    setSelectedDistrict('All');
                    executeSearch({ state: 'All', district: 'All' });
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#245C3A] hover:bg-[#1b462c] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{currentLanguage === 'hi' ? 'सभी राज्यों में खोजें' : 'Search Across All States'}</span>
                </button>
                <button
                  onClick={() => executeSearch()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-[#EEF3E8] text-[#245C3A] border border-[#EEF3E8] text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>{currentLanguage === 'hi' ? 'पुनः प्रयास करें' : 'Refresh'}</span>
                </button>
              </div>
            </>
          ) : (
            /* State: API Error or Key unconfigured */
            <>
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-700">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-[#26332B]">
                {currentLanguage === 'hi'
                  ? 'सरकारी मंडी सेवा अस्थायी रूप से अनुपलब्ध है'
                  : 'Government Mandi Service Temporarily Unavailable'}
              </h3>
              <p className="text-xs sm:text-sm text-[#68736B] max-w-xl mx-auto leading-relaxed">
                {errorMessage ||
                  (currentLanguage === 'hi'
                    ? 'सरकारी ओपन डेटा एपीआई से कनेक्ट नहीं हो सका। कृपया पुनः प्रयास करें।'
                    : 'The official Government Open Data feed is currently unreachable. Please retry.')}
              </p>
              <div className="pt-3">
                <button
                  onClick={() => executeSearch()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#245C3A] hover:bg-[#1b462c] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>{currentLanguage === 'hi' ? 'पुनः प्रयास करें' : 'Retry Government API Request'}</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* 5. Multi-Mandi Comparison Table: Strictly Uses Real API records */}
      <div className="bg-white p-6 rounded-3xl border border-[#EEF3E8] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#245C3A]" />
              <h3 className="text-lg font-bold font-serif text-[#26332B]">
                {mpT.multiMandiCompareTitle} — {selectedCommodity}
              </h3>
            </div>
            <p className="text-xs text-[#68736B] mt-0.5">
              {mpT.multiMandiCompareSub}
            </p>
          </div>

          {comparisonData?.averageModalPriceKg ? (
            <div className="px-3 py-1.5 rounded-xl bg-[#EEF3E8] text-[#245C3A] text-xs font-bold self-start sm:self-auto">
              <span>{mpT.averageRateAcrossMandis}: </span>
              <span className="font-extrabold">₹{comparisonData.averageModalPriceKg} /kg</span>{' '}
              <span className="text-[11px] font-normal text-gray-600">
                (₹{Math.round(comparisonData.averageModalPriceKg * 100)} /Qtl)
              </span>
            </div>
          ) : null}
        </div>

        {/* Comparison Table / Empty Notice */}
        {comparisonData?.records && comparisonData.records.length > 0 ? (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#EEF3E8] text-[#68736B] font-bold uppercase text-[10px]">
                  <th className="py-3 px-3">{currentLanguage === 'hi' ? 'मंडी यार्ड' : 'Mandi Yard'}</th>
                  <th className="py-3 px-3">{currentLanguage === 'hi' ? 'जिला व राज्य' : 'District & State'}</th>
                  <th className="py-3 px-3 text-right">{currentLanguage === 'hi' ? 'न्यूनतम दर' : 'Min Rate'}</th>
                  <th className="py-3 px-3 text-right font-black text-[#245C3A]">
                    {currentLanguage === 'hi' ? 'मॉडल दर (Modal)' : 'Modal Rate'}
                  </th>
                  <th className="py-3 px-3 text-right">{currentLanguage === 'hi' ? 'अधिकतम दर' : 'Max Rate'}</th>
                  <th className="py-3 px-3 text-center">{currentLanguage === 'hi' ? 'आवक तिथि' : 'Arrival Date'}</th>
                  <th className="py-3 px-3 text-center">{currentLanguage === 'hi' ? 'रुझान' : '24h Trend'}</th>
                  <th className="py-3 px-3 text-center">{currentLanguage === 'hi' ? 'कार्रवाई' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF3E8]">
                {comparisonData.records.map((row, i) => {
                  const isSelected =
                    activeRecord?.market.toLowerCase() === row.market.toLowerCase() &&
                    activeRecord?.district.toLowerCase() === row.district.toLowerCase();

                  return (
                    <tr
                      key={i}
                      className={`hover:bg-[#FBFAF4] transition-colors ${
                        isSelected ? 'bg-[#EEF3E8]/50 font-semibold' : ''
                      }`}
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#26332B]">{row.market} Mandi</span>
                          {row.isNearest && (
                            <span className="px-2 py-0.5 rounded-md bg-[#EEF3E8] text-[#245C3A] text-[10px] font-bold">
                              {mpT.nearestMandiBadge}
                            </span>
                          )}
                          {row.isHighestRate && (
                            <span className="px-2 py-0.5 rounded-md bg-[#FFFBEF] text-[#8C6212] border border-[#D6A63A]/30 text-[10px] font-bold">
                              ⭐ {mpT.highestRateBadge}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-[#68736B]">
                        {row.district}, {row.state}
                      </td>
                      <td className="py-3 px-3 text-right text-[#68736B]">
                        ₹{priceUnitView === 'kg' ? row.minPriceKg : row.minPriceKg * 100}
                      </td>
                      <td className="py-3 px-3 text-right font-black text-[#245C3A] text-sm">
                        ₹{priceUnitView === 'kg' ? row.modalPriceKg : row.modalPriceQuintal}
                        <span className="text-[10px] font-normal text-gray-500 ml-0.5">{unitLabel}</span>
                      </td>
                      <td className="py-3 px-3 text-right text-[#D6A63A] font-bold">
                        ₹{priceUnitView === 'kg' ? row.maxPriceKg : row.maxPriceKg * 100}
                      </td>
                      <td className="py-3 px-3 text-center text-[#68736B]">{row.arrivalDate || 'Today'}</td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            row.trend === 'up'
                              ? 'bg-green-100 text-green-800'
                              : row.trend === 'down'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {row.trend === 'up' ? '▲ Up' : row.trend === 'down' ? '▼ Down' : '● Stable'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => {
                            setSelectedDistrict(row.district);
                            setSelectedMarket(row.market);
                            const matched = officialRecords.find(
                              (r) =>
                                r.market.toLowerCase() === row.market.toLowerCase() &&
                                r.commodity.toLowerCase() === selectedCommodity.toLowerCase()
                            );
                            if (matched) {
                              setActiveRecord(matched);
                            }
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-[#245C3A] text-white'
                              : 'bg-white hover:bg-[#EEF3E8] text-[#245C3A] border border-[#EEF3E8]'
                          }`}
                        >
                          {isSelected
                            ? currentLanguage === 'hi'
                              ? 'सक्रिय'
                              : 'Selected'
                            : currentLanguage === 'hi'
                            ? 'चुनें'
                            : 'View Mandi'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-[#FBFAF4] border border-[#EEF3E8] text-center text-xs text-[#68736B]">
            <Info className="w-5 h-5 text-gray-400 mx-auto mb-1.5" />
            <p className="font-semibold text-[#26332B]">{mpT.mandiCompareUnavailable}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {currentLanguage === 'hi'
                ? 'सरकारी डेटा उपलब्ध होने पर यहां विभिन्न मंडियों की तुलना प्रदर्शित की जाएगी।'
                : 'Mandi rate comparison across markets will populate automatically when official records are returned.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
