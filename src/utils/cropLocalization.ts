import { LanguageCode } from '../types';

export interface CropLocalization {
  name: string;
  category: string;
}

export const CROPS_I18N: Record<string, Record<LanguageCode, string>> = {
  wheat: {
    hi: 'गेहूँ',
    en: 'Wheat',
    pa: 'ਕਣਕ',
    hr: 'कनक / गेहूँ',
    te: 'గోధుమలు',
    ta: 'கோதுமை',
  },
  rice: {
    hi: 'धान / चावल',
    en: 'Rice / Paddy',
    pa: 'ਝੋਨਾ / ਚੌਲ',
    hr: 'धान / चावल',
    te: 'వరి / బియ్యం',
    ta: 'நெல் / அரிசி',
  },
  maize: {
    hi: 'मक्का',
    en: 'Maize / Corn',
    pa: 'ਮੱਕੀ',
    hr: 'मक्का',
    te: 'మొక్కజొన్న',
    ta: 'மக்காச்சோளம்',
  },
  pulses: {
    hi: 'दालें / चना',
    en: 'Pulses / Chana',
    pa: 'ਦਾਲਾਂ / ਛੋਲੇ',
    hr: 'दालें / चना',
    te: 'పప్పులు / శనగలు',
    ta: 'பருப்பு வகைகள் / கொண்டைக்கடலை',
  },
};

export const CATEGORIES_I18N: Record<string, Record<LanguageCode, string>> = {
  'Cereals / Grains': {
    hi: 'अनाज / खाद्यान्न',
    en: 'Cereals / Grains',
    pa: 'ਅਨਾਜ / ਖਾਦਿਆਨ',
    hr: 'अनाज / खाद्यान्न',
    te: 'ధాన్యాలు / ఆహార ధాన్యాలు',
    ta: 'தானியங்கள் / உணவு தானியங்கள்',
  },
  Pulses: {
    hi: 'दालें / दलहन',
    en: 'Pulses',
    pa: 'ਦਾਲਾਂ / ਦਲਹਨ',
    hr: 'दालें / दलहन',
    te: 'పప్పుధాన్యాలు',
    ta: 'பருப்பு வகைகள்',
  },
  Vegetables: {
    hi: 'सब्जियां',
    en: 'Vegetables',
    pa: 'ਸਬਜ਼ੀਆਂ',
    hr: 'सब्जियां',
    te: 'కూరగాయలు',
    ta: 'காய்கறிகள்',
  },
  Fruits: {
    hi: 'फल',
    en: 'Fruits',
    pa: 'ਫਲ',
    hr: 'फल',
    te: 'పండ్లు',
    ta: 'பழங்கள்',
  },
  Oilseeds: {
    hi: 'तिलहन',
    en: 'Oilseeds',
    pa: 'ਤੇਲ ਬੀਜ',
    hr: 'तिलहन',
    te: 'నూనె గింజలు',
    ta: 'எண்ணெய் வித்துக்கள்',
  },
  Spices: {
    hi: 'मसाले',
    en: 'Spices',
    pa: 'ਮਸਾਲੇ',
    hr: 'मसाले',
    te: 'సుగంధ ద్రవ్యాలు',
    ta: 'மசாலா பொருட்கள்',
  },
};

export const STATUS_I18N: Record<string, Record<LanguageCode, string>> = {
  active: {
    hi: 'सक्रिय',
    en: 'Active',
    pa: 'ਸਰਗਰਮ',
    hr: 'चालू',
    te: 'క్రియాశీలం',
    ta: 'செயலில்',
  },
  pending: {
    hi: 'लंबित',
    en: 'Pending',
    pa: 'ਬਾਕੀ',
    hr: 'बाकी',
    te: 'పెండింగ్',
    ta: 'நிலுவையில்',
  },
  verified: {
    hi: 'सत्यापित',
    en: 'Verified',
    pa: 'ਤਸਦੀਕਸ਼ੁਦਾ',
    hr: 'सत्यापित',
    te: 'ధృవీకరించబడింది',
    ta: 'சரிபார்க்கப்பட்டது',
  },
  suspended: {
    hi: 'निलंबित',
    en: 'Suspended',
    pa: 'ਮੁਅੱਤਲ',
    hr: 'रोक राख्या',
    te: 'నిలిపివేయబడింది',
    ta: 'நிறுத்தப்பட்டது',
  },
  available: {
    hi: 'उपलब्ध',
    en: 'Available',
    pa: 'ਉਪਲਬਧ',
    hr: 'उपलब्ध',
    te: 'అందుబాటులో ఉంది',
    ta: 'கிடைக்கிறது',
  },
  sold: {
    hi: 'बिक चुकी',
    en: 'Sold Out',
    pa: 'ਵਿਕ ਗਈ',
    hr: 'बिक गी',
    te: 'విక్రయించబడింది',
    ta: 'விற்கப்பட்டது',
  },
  disabled: {
    hi: 'निष्क्रिय',
    en: 'Disabled',
    pa: 'ਅਯੋਗ',
    hr: 'बंद',
    te: 'నిష్క్రియం చేయబడింది',
    ta: 'முடக்கப்பட்டது',
  },
  ORDER_PLACED: {
    hi: 'ऑर्डर दर्ज',
    en: 'Order Placed',
    pa: 'ਆਰਡਰ ਦਰਜ',
    hr: 'ऑर्डर दर्ज',
    te: 'ఆర్డర్ ఉంచబడింది',
    ta: 'ஆர்டர் செய்யப்பட்டது',
  },
  ORDER_CONFIRMED: {
    hi: 'स्वीकृत',
    en: 'Order Confirmed',
    pa: 'ਸਵੀਕਾਰਿਆ ਗਿਆ',
    hr: 'स्वीकृत',
    te: 'ఆర్డర్ నిర్ధారించబడింది',
    ta: 'ஆர்டர் உறுதிப்படுத்தப்பட்டது',
  },
  ESCROW_FUNDED: {
    hi: 'एस्क्रो सुरक्षित',
    en: 'Escrow Funded',
    pa: 'ਐਸਕਰੋ ਸੁਰੱਖਿਅਤ',
    hr: 'एस्क्रो जमा',
    te: 'ఎస్క్రో నిధులు సమకూరాయి',
    ta: 'எஸ்க்ரோ நிதியளிக்கப்பட்டது',
  },
  IN_TRANSIT: {
    hi: 'मार्ग में',
    en: 'In Transit',
    pa: 'ਰਸਤੇ ਵਿੱਚ',
    hr: 'रस्ते में',
    te: 'రవాణాలో ఉంది',
    ta: 'வழியில் உள்ளது',
  },
  DELIVERED: {
    hi: 'वितरित',
    en: 'Delivered',
    pa: 'ਡਿਲਿਵਰ ਹੋ ਗਿਆ',
    hr: 'पहुंच गया',
    te: 'డెలివరీ చేయబడింది',
    ta: 'டெலிவரி செய்யப்பட்டது',
  },
  COMPLETED: {
    hi: 'पूर्ण',
    en: 'Completed',
    pa: 'ਮੁਕੰਮਲ',
    hr: 'पूरा',
    te: 'పూర్తయింది',
    ta: 'முடிந்தது',
  },
  CANCELLED: {
    hi: 'रद्द',
    en: 'Cancelled',
    pa: 'ਰੱਦ',
    hr: 'रद्द',
    te: 'రద్దు చేయబడింది',
    ta: 'ரத்து செய்யப்பட்டது',
  },
};

export function getLocalizedCropName(crop: string | undefined, lang: LanguageCode): string {
  if (!crop) return '';
  const lower = crop.toLowerCase().trim();

  if (lower.includes('wheat') || lower.includes('गेहूं') || lower.includes('गेहूँ') || lower.includes('ਕਣਕ') || lower.includes('कनक')) {
    return CROPS_I18N.wheat[lang] || CROPS_I18N.wheat.hi;
  }
  if (lower.includes('rice') || lower.includes('paddy') || lower.includes('धान') || lower.includes('चावल') || lower.includes('ਝੋਨਾ') || lower.includes('चौल')) {
    return CROPS_I18N.rice[lang] || CROPS_I18N.rice.hi;
  }
  if (lower.includes('maize') || lower.includes('corn') || lower.includes('मक्का') || lower.includes('ਮੱਕੀ')) {
    return CROPS_I18N.maize[lang] || CROPS_I18N.maize.hi;
  }
  if (lower.includes('pulse') || lower.includes('chana') || lower.includes('दलहन') || lower.includes('चना') || lower.includes('दाल') || lower.includes('ਛੋਲੇ')) {
    return CROPS_I18N.pulses[lang] || CROPS_I18N.pulses.hi;
  }

  // Fallback to match key directly if exact
  if (CROPS_I18N[lower]) {
    return CROPS_I18N[lower][lang] || crop;
  }

  return crop;
}

export function getLocalizedCategoryName(category: string | undefined, lang: LanguageCode): string {
  if (!category) return '';
  const cat = CATEGORIES_I18N[category];
  if (cat) {
    return cat[lang] || cat.hi;
  }
  // Try case-insensitive lookup
  for (const [key, map] of Object.entries(CATEGORIES_I18N)) {
    if (key.toLowerCase() === category.toLowerCase()) {
      return map[lang] || map.hi;
    }
  }
  return category;
}

export function getLocalizedStatusName(status: string | undefined, lang: LanguageCode): string {
  if (!status) return '';
  const key = status.toUpperCase().replace(/\s+/g, '_');
  if (STATUS_I18N[key]) {
    return STATUS_I18N[key][lang] || STATUS_I18N[key].hi;
  }
  const lowerKey = status.toLowerCase();
  if (STATUS_I18N[lowerKey]) {
    return STATUS_I18N[lowerKey][lang] || STATUS_I18N[lowerKey].hi;
  }
  return status;
}

export function getLocalizedUnit(unit: string | undefined, lang: LanguageCode): string {
  if (!unit) return '';
  const lower = unit.toLowerCase();
  if (lower.includes('quintal') || lower.includes('qtl') || lower.includes('कुविंटल') || lower.includes('ਕੁਇੰਟਲ')) {
    switch (lang) {
      case 'hi': return 'कुविंटल';
      case 'pa': return 'ਕੁਇੰਟਲ';
      case 'hr': return 'कुविंटल';
      case 'te': return 'క్వింటాల్';
      case 'ta': return 'குவிண்டால்';
      default: return 'Quintal';
    }
  }
  if (lower.includes('kg') || lower.includes('किग्रा') || lower.includes('किलो') || lower.includes('ਕਿਲੋ')) {
    switch (lang) {
      case 'hi': return 'किलो';
      case 'pa': return 'ਕਿਲੋ';
      case 'hr': return 'किलो';
      case 'te': return 'కిలో';
      case 'ta': return 'கிலோ';
      default: return 'kg';
    }
  }
  return unit;
}
