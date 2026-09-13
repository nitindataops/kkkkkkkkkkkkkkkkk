import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  ShieldCheck,
  TrendingUp,
  Users,
  Sparkles,
  Camera,
  MapPin,
  Store,
  Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LanguageCode, TranslationDictionary } from '../types';
import { PWAInstallButton } from './pwa/PWAInstallButton';
import { getLocalizedCropName } from '../utils/cropLocalization';

interface HeroSectionProps {
  translations: TranslationDictionary;
  currentLanguage?: LanguageCode;
  onGetStarted: () => void;
  onExplore: () => void;
}

interface BannerSlide {
  id: string;
  badge: Record<LanguageCode, string>;
  headline: Record<LanguageCode, string>;
  subtext: Record<LanguageCode, string>;
  cta: Record<LanguageCode, string>;
  ctaAction: 'get-started' | 'explore';
  secondaryCta?: Record<LanguageCode, string>;
  image: string;
  fallbackImage: string;
  altText: string;
  cropHighlight?: string;
}

export const BANNER_SLIDES: BannerSlide[] = [
  // BANNER 1: Smart Farming & Better Decisions (Original Content Kept)
  {
    id: 'smart-farming-better-decisions-hero',
    badge: {
      hi: 'स्मार्ट खेती • डिजिटल प्लेटफॉर्म',
      en: 'Smart Farming • Unified Platform',
      pa: 'ਸਮਾਰਟ ਖੇਤੀ • ਡਿਜੀਟਲ ਪਲੇਟਫਾਰਮ',
      hr: 'स्मार्ट खेती • डिजिटल प्लेटफॉर्म',
      te: 'స్మార్ట్ వ్యవసాయం • డిజిటల్ వేదిక',
      ta: 'ஸ்மார்ட் விவசாயம் • டிஜிட்டல் தளம்',
    },
    headline: {
      hi: 'स्मार्ट खेती,\nबेहतर फैसले',
      en: 'Smart Farming.\nBetter Decisions.',
      pa: 'ਸਮਾਰਟ ਖੇਤੀ,\nਬਿਹਤਰ ਫੈਸਲੇ',
      hr: 'स्मार्ट खेती,\nबेहतर फैसले',
      te: 'స్మార్ట్ వ్యవసాయం,\nమెరుగైన నిర్ణయాలు',
      ta: 'ஸ்மார்ட் விவசாயம்,\nசிறந்த முடிவுகள்',
    },
    subtext: {
      hi: 'AI फसल विश्लेषण, सरकारी मंडी भाव, और सीधा डिजिटल मार्केटप्लेस एक ही प्लेटफॉर्म पर।',
      en: 'AI crop intelligence, government market intelligence, and direct digital marketplace on one platform.',
      pa: 'ਏਆਈ ਫ਼ਸਲ ਵਿਸ਼ਲੇਸ਼ਣ, ਸਰਕਾਰੀ ਮੰਡੀ ਭਾਅ, ਅਤੇ ਸਿੱਧਾ ਡਿਜੀਟਲ ਮਾਰਕੀਟਪਲੇਸ ਇੱਕੋ ਪਲੇਟਫਾਰਮ \'ਤੇ।',
      hr: 'AI फसल विश्लेषण, सरकारी मंडी भाव, अर सीधा डिजिटल मार्केटप्लेस एकै मंच पै।',
      te: 'AI పంట విశ్లేషణ, ప్రభుత్వ మార్కెట్ ధరలు, మరియు ప్రత్యక్ష డిజిటల్ మార్కెట్‌ప్లేస్ ఒకే వేదికపై.',
      ta: 'AI பயிர் பகுப்பாய்வு, அரசு மண்டி விலைகள் மற்றும் நேரடி டிஜிட்டல் சந்தை ஒரே தளத்தில்.',
    },
    cta: {
      hi: 'शुरू करें',
      en: 'Get Started',
      pa: 'ਸ਼ੁਰੂ ਕਰੋ',
      hr: 'शुरू करो',
      te: 'ప్రారంభించండి',
      ta: 'தொடங்குங்கள்',
    },
    ctaAction: 'get-started',
    secondaryCta: {
      hi: 'मार्केटप्लेस देखें',
      en: 'View Marketplace',
      pa: 'ਮਾਰਕੀਟਪਲੇਸ ਵੇਖੋ',
      hr: 'मार्केटप्लेस देखो',
      te: 'మార్కెట్‌ప్లేస్ చూడండి',
      ta: 'சந்தைப்பகுதியைப் பார்க்கவும்',
    },
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1600&q=80',
    fallbackImage: '/images/indian_farm_landscape.jpg',
    altText: 'Fertile green agricultural farmland landscape with Indian village horizon',
  },
  // BANNER 2: AI Crop Quality & Intelligence (Original Content Kept)
  {
    id: 'fasal-ai-intelligence',
    badge: {
      hi: 'एआई फसल विश्लेषण • गुणवत्ता जांच',
      en: 'AI Crop Analysis • Quality Insights',
      pa: 'ਏਆਈ ਫ਼ਸਲ ਵਿਸ਼ਲੇਸ਼ਣ • ਗੁਣਵੱਤਾ ਪਰਖ',
      hr: 'एआई फसल विश्लेषण • गुण परख',
      te: 'AI పంట విశ్లేషణ • నాణ్యతా పరిశీలన',
      ta: 'AI பயிர் பகுப்பாய்வு • தர நுண்ணறிவு',
    },
    headline: {
      hi: 'फसल को समझें AI के साथ',
      en: 'Understand Crops with AI',
      pa: 'ਫ਼ਸਲ ਨੂੰ ਸਮਝੋ AI ਦੇ ਨਾਲ',
      hr: 'फसल समझो AI के साथ',
      te: 'AIతో పంట నాణ్యతను తెలుసుకోండి',
      ta: 'AI உடன் பயிரைப் புரிந்து கொள்ளுங்கள்',
    },
    subtext: {
      hi: 'एआई-संचालित फसल विश्लेषण से गुणवत्ता ग्रेडिंग और उपयोगी फसल सलाह समझें।',
      en: 'AI-powered crop analysis to understand quality grading and actionable harvest insights.',
      pa: 'ਏਆਈ-ਸੰਚਾਲਿਤ ਫ਼ਸਲ ਵਿਸ਼ਲੇਸ਼ਣ ਨਾਲ ਗੁਣਵੱਤਾ ਗ੍ਰੇਡਿੰਗ ਅਤੇ ਲਾਭਦਾਇਕ ਸੁਝਾਅ ਸਮਝੋ।',
      hr: 'एआई तकनीक ते फसल की क्वालिटी अर जरूरी जानकारी समझो।',
      te: 'AI ఆధారిత విశ్లేషణతో నాణ్యత గ్రేడింగ్ మరియు ఉపయోగకరమైన సూచనలు పొందండి.',
      ta: 'AI பகுப்பாய்வு மூலம் தர வகைப்பாடு மற்றும் பயனுள்ள அறுவடை ஆலோசனைகளைப் பெறுங்கள்.',
    },
    cta: {
      hi: 'मेरी फसल जांचें',
      en: 'Analyze My Crop',
      pa: 'ਮੇਰੀ ਫ਼ਸਲ ਪਰਖੋ',
      hr: 'म्हारी फसल जांचो',
      te: 'నా పంటను పరీక్షించండి',
      ta: 'என் பயிரை ஆராயுங்கள்',
    },
    ctaAction: 'get-started',
    secondaryCta: {
      hi: 'मार्केटप्लेस देखें',
      en: 'View Marketplace',
      pa: 'ਮਾਰਕੀਟਪਲੇਸ ਵੇਖੋ',
      hr: 'मार्केटप्लेस देखो',
      te: 'మార్కెట్‌ప్లేస్ చూడండి',
      ta: 'சந்தைப்பகுதியைப் பார்க்கவும்',
    },
    image: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=1600&q=80',
    fallbackImage: '/images/indian_farm_landscape.jpg',
    altText: 'Indian farmer proudly standing in a green crop field at sunrise',
  },
  // BANNER 3: Government Mandi Price Transparency (Original Content Kept)
  {
    id: 'mandiyon-ka-bhav',
    badge: {
      hi: 'सरकारी मंडी भाव • लाइव डाटा',
      en: 'Government Mandi Data • Live Rates',
      pa: 'ਸਰਕਾਰੀ ਮੰਡੀ ਭਾਅ • ਲਾਈਵ ਡਾਟਾ',
      hr: 'सरकारी मंडी भाव • लाइव डाटा',
      te: 'ప్రభుత్వ మార్కెట్ డేటా • లైవ్ ధరలు',
      ta: 'அரசு மண்டி தரவு • நேரலை விலைகள்',
    },
    headline: {
      hi: 'मंडियों का भाव, फैसला आपका',
      en: 'Mandi Rates, Your Decision',
      pa: 'ਮੰਡੀਆਂ ਦਾ ਭਾਅ, ਫ਼ੈਸਲਾ ਤੁਹਾਡਾ',
      hr: 'मंडियों का भाव, फैसला थारा',
      te: 'మార్కెట్ ధరలు, మీ నిర్ణయం',
      ta: 'மண்டி விலைகள், உங்கள் முடிவு',
    },
    subtext: {
      hi: 'सरकारी बाज़ार डेटा और लाइव मंडी भावों के साथ बिक्री के सही और सटीक फैसले लें।',
      en: 'Official government market data and market intelligence to empower informed selling decisions.',
      pa: 'ਸਰਕਾਰੀ ਮੰਡੀ ਡਾਟਾ ਅਤੇ ਲਾਈਵ ਰੇਟਾਂ ਨਾਲ ਵਿਕਰੀ ਦੇ ਸਹੀ ਅਤੇ ਲਾਹੇਵੰਦ ਫ਼ੈਸਲੇ ਲਓ।',
      hr: 'सरकारी मंडी आंकड़े अर ताज़ा भावां के साथ अपनी उपज बेचण का सही फैसला लो।',
      te: 'అధికారిక ప్రభుత్వ మార్కెట్ డేటాతో సరైన అమ్మకపు నిర్ణయాలు తీసుకోండి.',
      ta: 'அரசாங்க சந்தை தரவுகளுடன் தகவலறிந்த விற்பனை முடிவுகளை எடுங்கள்.',
    },
    cta: {
      hi: 'मंडी भाव देखें',
      en: 'Check Market Prices',
      pa: 'ਮੰਡੀ ਭਾਅ ਵੇਖੋ',
      hr: 'मंडी भाव देखो',
      te: 'మార్కెట్ ధరలు చూడండి',
      ta: 'சந்தை விலைகளைப் பார்க்கவும்',
    },
    ctaAction: 'explore',
    secondaryCta: {
      hi: 'मार्केटप्लेस देखें',
      en: 'View Marketplace',
      pa: 'ਮਾਰਕੀਟਪਲੇਸ ਵੇਖੋ',
      hr: 'मार्केटप्लेस देखो',
      te: 'మార్కెట్‌ప్లేస్ చూడండి',
      ta: 'சந்தைப்பகுதியைப் பார்க்கவும்',
    },
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1600&q=80',
    fallbackImage: '/images/indian_farm_landscape.jpg',
    altText: 'Golden ripe Indian wheat and grain harvest ready for market',
    cropHighlight: 'Wheat • Rice • Maize • Pulses',
  },
  // BANNER 4: Direct Digital Connection (Original Content Kept)
  {
    id: 'beecholiye-kam-seedha-bazaar',
    badge: {
      hi: 'बिचौलिए कम • सीधा व्यापार',
      en: 'Zero Middlemen • Direct Connection',
      pa: 'ਵਿਚੋਲਿਆਂ ਤੋਂ ਮੁਕਤੀ • ਸਿੱਧਾ ਵਪਾਰ',
      hr: 'बिचौलिए ख़तम • सीधा सौदा',
      te: 'మధ్యవర్తులు లేని • ప్రత్యక్ష వ్యాపారం',
      ta: 'இடைத்தரகர்கள் இல்லை • நேரடி வர்த்தகம்',
    },
    headline: {
      hi: 'बिचौलिए कम, सीधा बाज़ार',
      en: 'Direct Trade, Zero Middlemen',
      pa: 'ਵਿਚੋਲੀਏ ਬੰਦ, ਸਿੱਧਾ ਬਾਜ਼ਾਰ',
      hr: 'बिचौलिए ख़तम, सीधा ब्योपार',
      te: 'మధ్యవర్తులు లేని ప్రత్యక్ష మార్కెట్',
      ta: 'நேரடி வர்த்தகம், தரகர்கள் இல்லை',
    },
    subtext: {
      hi: 'मेहनती किसानों और सत्यापित खरीदारों के बीच सीधा डिजिटल संपर्क और पारदर्शी सौदे।',
      en: 'Direct digital connection between genuine farmers and verified buyers with transparent deals.',
      pa: 'ਕਿਸਾਨਾਂ ਅਤੇ ਪ੍ਰਮਾਣਿਤ ਖਰੀਦਦਾਰਾਂ ਵਿਚਕਾਰ ਸਿੱਧਾ ਡਿਜੀਟਲ ਸੰਪਰਕ ਅਤੇ ਪਾਰਦਰਸ਼ੀ ਸੌਦੇ।',
      hr: 'किसान अर जाँचे-परखे खरीददारां के बीच सीधा डिजिटल नाता अर सच्चा सौदा।',
      te: 'నిజమైన రైతులు మరియు ధృవీకరించబడిన కొనుగోలుదారుల మధ్య ప్రత్యక్ష డిజిటల్ అనుసంధానం.',
      ta: 'விவசாயிகள் மற்றும் சரிபார்க்கப்பட்ட வாங்குபவர்களுக்கு இடையே நேரடி டிஜிட்டல் இணைப்பு.',
    },
    cta: {
      hi: 'खरीदार खोजें',
      en: 'Find Buyers',
      pa: 'ਖਰੀਦਦਾਰ ਲੱਭੋ',
      hr: 'खरीदार ढूंढो',
      te: 'కొనుగోలుదారులను కనుగొనండి',
      ta: 'வாங்குபவர்களைக் கண்டறியவும்',
    },
    ctaAction: 'explore',
    secondaryCta: {
      hi: 'मार्केटप्लेस देखें',
      en: 'View Marketplace',
      pa: 'ਮਾਰਕੀਟਪਲੇਸ ਵੇਖੋ',
      hr: 'मार्केटप्लेस देखो',
      te: 'మార్కెట్‌ప్లేస్ చూడండి',
      ta: 'சந்தைப்பகுதியைப் பார்க்கவும்',
    },
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=1600&q=80',
    fallbackImage: '/images/crops/chana_pulses.jpg',
    altText: 'Harvested grain sacks and farm produce ready for direct buyer transport',
  },
  // BANNER 5: Sell Harvest. Get Better Value. (CRITICAL USER REQUIREMENT)
  {
    id: 'sell-harvest-better-value',
    badge: {
      hi: 'फसल बिक्री • सीधा बाज़ार',
      en: 'Sell Harvest • Direct Market',
      pa: 'ਫ਼ਸਲ ਵਿਕਰੀ • ਸਿੱਧਾ ਬਾਜ਼ਾਰ',
      hr: 'फसल बिक्री • सीधा सौदा',
      te: 'పంట విక్రయం • ప్రత్యక్ష మార్కెట్',
      ta: 'பயிர் விற்பனை • நேரடி சந்தை',
    },
    headline: {
      hi: 'फसल बेचें।\nपाएं बेहतर दाम।',
      en: 'Sell Harvest.\nGet Better Value.',
      pa: 'ਫ਼ਸਲ ਵੇਚੋ।\nਵੱਧ ਮੁਨਾਫ਼ਾ ਪਾਓ।',
      hr: 'फसल बेचो।\nपाओ चोखा भाव।',
      te: 'పంటను అమ్మండి.\nమంచి ధర పొందండి.',
      ta: 'விளைச்சலை விற்கவும்.\nசிறந்த விலை பெறவும்.',
    },
    subtext: {
      hi: 'अपनी फसलें सीधे सत्यापित खरीदारों को बेचें और बिना बिचौलियों के पारदर्शी बाज़ार-आधारित मूल्य पाएं।',
      en: 'Sell your crops directly to verified buyers and get transparent market-linked prices without unnecessary middlemen.',
      pa: 'ਆਪਣੀਆਂ ਫ਼ਸਲਾਂ ਸਿੱਧੇ ਤਸਦੀਕਸ਼ੁਦਾ ਖਰੀਦਦਾਰਾਂ ਨੂੰ ਵੇਚੋ ਅਤੇ ਬਿਨਾਂ ਵਿਚੋਲਿਆਂ ਦੇ ਪਾਰਦਰਸ਼ੀ ਮੰਡੀ ਮੁੱਲ ਪ੍ਰਾਪਤ ਕਰੋ।',
      hr: 'अपनी फसल सीधे जाँचे-परखे खरीददारां नै बेचो अर बिना बिचौलिया के खरा मंडी भाव पाओ।',
      te: 'మధ్యవర్తులు లేకుండా ధృవీకరించబడిన కొనుగోలుదారులకు మీ పంటలను నేరుగా విక్రయించి పారదర్శక మార్కెట్ ధరలను పొందండి.',
      ta: 'இடைத்தரகர்கள் இன்றி உங்கள் பயிர்களை சரிபார்க்கப்பட்ட வாங்குபவர்களுக்கு நேரடியாக விற்று வெளிப்படையான சந்தை விலையைப் பெறுங்கள்.',
    },
    cta: {
      hi: 'फसल बेचें',
      en: 'Sell Harvest',
      pa: 'ਫ਼ਸਲ ਵੇਚੋ',
      hr: 'फसल बेचो',
      te: 'పంటను అమ్మండి',
      ta: 'விளைச்சலை விற்கவும்',
    },
    ctaAction: 'get-started',
    secondaryCta: {
      hi: 'मार्केटप्लेस देखें',
      en: 'View Marketplace',
      pa: 'ਮਾਰਕੀਟਪਲੇਸ ਵੇਖੋ',
      hr: 'मार्केटप्लेस देखो',
      te: 'మార్కెట్‌ప్లేస్ చూడండి',
      ta: 'சந்தைப்பகுதியைப் பார்க்கவும்',
    },
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=1600&q=80',
    fallbackImage: '/images/crops/kabuli_chana.jpg',
    altText: 'Close up inspection of clean golden wheat grains for quality grading',
  },
];

const directTradeBadge: Record<LanguageCode, string> = {
  hi: '१००% सीधा व्यापार',
  en: '100% Direct Trade',
  pa: '੧੦੦% ਸਿੱਧਾ ਵਪਾਰ',
  hr: '१००% सीधा सौदा',
  te: '100% ప్రత్యక్ష వ్యాపారం',
  ta: '100% நேரடி வர்த்தகம்',
};

const sliderControls: Record<
  LanguageCode,
  { play: string; pause: string; prev: string; next: string }
> = {
  hi: { play: 'स्लाइडर चलाएं', pause: 'स्लाइडर रोकें', prev: 'पिछली स्लाइड', next: 'अगली स्लाइड' },
  en: { play: 'Play slideshow', pause: 'Pause slideshow', prev: 'Previous slide', next: 'Next slide' },
  pa: { play: 'ਸਲਾਈਡਰ ਚਲਾਓ', pause: 'ਸਲਾਈਡਰ ਰੋਕੋ', prev: 'ਪਿਛਲੀ ਸਲਾਈਡ', next: 'ਅਗਲੀ ਸਲਾਈਡ' },
  hr: { play: 'स्लाइडर चलाओ', pause: 'स्लाइडर रोको', prev: 'पिछली स्लाइड', next: 'अगली स्लाइड' },
  te: { play: 'స్లైడ్‌షో ప్లే చేయండి', pause: 'స్లైడ్‌షో ఆపండి', prev: 'మునుపటి స్లైడ్', next: 'తదుపరి స్లైడ్' },
  ta: { play: 'ஸ்லைடுஷோவை இயக்கவும்', pause: 'ஸ்லைடுஷோவை நிறுத்தவும்', prev: 'முந்தைய ஸ்லைடு', next: 'அடுத்த ஸ்லைடு' },
};

const activeCropsHeading: Record<LanguageCode, string> = {
  hi: 'समर्पित सक्रिय फसलें:',
  en: 'Dedicated Active Crops:',
  pa: 'ਸਮਰਪਿਤ ਸਰਗਰਮ ਫ਼ਸਲਾਂ:',
  hr: 'समर्पित सक्रिय फसलें:',
  te: 'అంకితమైన క్రియాశీల పంటలు:',
  ta: 'அர்ப்பணிக்கப்பட்ட செயலில் உள்ள பயிர்கள்:',
};

const zeroMiddlemanLabel: Record<LanguageCode, string> = {
  hi: 'शून्य बिचौलिया',
  en: 'Zero middleman',
  pa: 'ਜ਼ੀਰੋ ਵਿਚੋਲੀਆ',
  hr: 'शून्य बिचौलिया',
  te: 'మధ్యవర్తులు లేరు',
  ta: 'இடைத்தரகர் இல்லை',
};

const officialMandiLabel: Record<LanguageCode, string> = {
  hi: 'सरकारी मंडी संदर्भ',
  en: 'Official Mandi reference',
  pa: 'ਸਰਕਾਰੀ ਮੰਡੀ ਹਵਾਲਾ',
  hr: 'सरकारी मंडी संदर्भ',
  te: 'ప్రభుత్వ మార్కెట్ సూచన',
  ta: 'அரசு மண்டி குறிப்பு',
};

const verifiedBuyersLabel: Record<LanguageCode, string> = {
  hi: 'सत्यापित थोक खरीदार',
  en: 'Verified wholesale buyers',
  pa: 'ਤਸਦੀਕਸ਼ੁਦਾ ਥੋਕ ਖਰੀਦਦਾਰ',
  hr: 'जाँचे-परखे थोक खरीदार',
  te: 'ధృవీకరించబడిన హోల్‌సేల్ కొనుగోలుదారులు',
  ta: 'சரிபார்க்கப்பட்ட மொத்த வாங்குபவர்கள்',
};

export const HeroSection: React.FC<HeroSectionProps> = ({
  translations: t,
  currentLanguage = 'hi',
  onGetStarted,
  onExplore,
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const directionRef = useRef<1 | -1>(1);

  const totalSlides = BANNER_SLIDES.length;

  // Autoplay ping-pong advancement:
  // 1 -> 2 -> 3 -> 4 -> 5 -> 4 -> 3 -> 2 -> 1 -> 2 -> 3 -> ...
  // When reaching Banner 5 (index 4): direction = -1, move to Banner 4 (index 3)
  // When reaching Banner 1 (index 0) while moving backward: direction = +1, move to Banner 2 (index 1)
  const nextSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => {
      let direction = directionRef.current;
      if (prev >= totalSlides - 1) {
        direction = -1;
      } else if (prev <= 0) {
        direction = 1;
      }
      directionRef.current = direction;
      return prev + direction;
    });
  }, [totalSlides]);

  // Manual Next:
  // Moves forward to next slide. If at Banner 5, reverses and moves to Banner 4 (never jumps to Banner 1)
  const goToNextSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => {
      if (prev >= totalSlides - 1) {
        directionRef.current = -1;
        return totalSlides - 2;
      }
      directionRef.current = 1;
      return prev + 1;
    });
  }, [totalSlides]);

  // Manual Previous:
  // Moves backward to previous slide. If at Banner 1, reverses and moves to Banner 2 (never jumps to Banner 5)
  const goToPrevSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => {
      if (prev <= 0) {
        directionRef.current = 1;
        return 1;
      }
      directionRef.current = -1;
      return prev - 1;
    });
  }, [totalSlides]);

  // Manual Dot click:
  const goToSlide = (index: number) => {
    if (index >= totalSlides - 1) {
      directionRef.current = -1;
    } else if (index <= 0) {
      directionRef.current = 1;
    }
    setCurrentSlideIndex(index);
  };

  // Auto-slide timer (4.5 seconds per slide with ping-pong behavior)
  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      nextSlide();
    }, 4500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, nextSlide]);

  // Touch Swipe Handlers for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (diff > 50) {
      goToNextSlide();
    } else if (diff < -50) {
      goToPrevSlide();
    }
    setTouchStartX(null);
  };

  const activeSlide = BANNER_SLIDES[currentSlideIndex];

  const handleCtaClick = (action: 'get-started' | 'explore') => {
    if (action === 'get-started') {
      onGetStarted();
    } else {
      onExplore();
    }
  };

  const lang = currentLanguage || 'hi';
  const controls = sliderControls[lang] || sliderControls.en;

  return (
    <section
      id="hero-section"
      aria-label="Kisan Saathi Featured Agriculture Highlights"
      className="relative pt-4 pb-12 sm:pt-6 sm:pb-16 overflow-hidden bg-transparent"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 space-y-6">
        {/* ========================================================================= */}
        {/* MAIN HERO AUTO-SLIDING BANNER CONTAINER                                  */}
        {/* ========================================================================= */}
        <div
          className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-[#D5E3CE] shadow-xl bg-[#1B432B] min-h-[440px] sm:min-h-[480px] lg:min-h-[520px] flex flex-col justify-between"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Background Images with AnimatePresence */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide.id}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="absolute inset-0 z-0"
            >
              <img
                src={
                  failedImages[activeSlide.id]
                    ? activeSlide.fallbackImage
                    : activeSlide.image
                }
                onError={() => {
                  setFailedImages((prev) => ({ ...prev, [activeSlide.id]: true }));
                }}
                alt={activeSlide.altText}
                referrerPolicy="no-referrer"
                loading="eager"
                className="w-full h-full object-cover object-center filter brightness-[0.75] contrast-[1.05]"
              />

              {/* Sophisticated Agricultural Gradient Overlays */}
              {/* Left dark-green readability vignette */}
              <div
                className="absolute inset-0 bg-gradient-to-r from-[#143321]/95 via-[#143321]/80 to-transparent sm:via-[#143321]/60 lg:to-transparent"
                aria-hidden="true"
              />
              {/* Bottom gradient for text and control contrast */}
              <div
                className="absolute inset-0 bg-gradient-to-t from-[#0F2418]/90 via-[#0F2418]/40 to-transparent"
                aria-hidden="true"
              />
              {/* Subtle warm amber touch */}
              <div
                className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"
                aria-hidden="true"
              />
            </motion.div>
          </AnimatePresence>

          {/* Top Pill / Slide Category Header */}
          <div className="relative z-10 p-5 sm:p-7 flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white text-xs sm:text-sm font-semibold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#D6A63A] animate-pulse" />
              <span>{activeSlide.badge[lang] || activeSlide.badge.en}</span>
            </div>

            {/* Quick 4 Crops Tag or Live Indicator */}
            <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#245C3A]/80 backdrop-blur-md border border-[#5F8F45]/40 text-emerald-100 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5 text-[#D6A63A]" />
              <span>{directTradeBadge[lang] || directTradeBadge.en}</span>
            </div>
          </div>

          {/* Main Content Area (Headline, Subtext, and CTAs) */}
          <div className="relative z-10 px-5 sm:px-8 lg:px-12 py-4 max-w-2xl text-left space-y-4 sm:space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4 }}
                className="space-y-3 sm:space-y-4"
              >
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.18] drop-shadow-md whitespace-pre-line">
                  {activeSlide.headline[lang] || activeSlide.headline.en}
                </h1>
                <p className="text-sm sm:text-base lg:text-lg text-emerald-50/90 leading-relaxed font-normal max-w-xl drop-shadow-xs">
                  {activeSlide.subtext[lang] || activeSlide.subtext.en}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                id="hero-banner-primary-cta"
                type="button"
                onClick={() => handleCtaClick(activeSlide.ctaAction)}
                className="inline-flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3.5 rounded-xl text-sm sm:text-base font-bold text-[#143321] bg-gradient-to-r from-amber-300 to-[#D6A63A] hover:from-amber-200 hover:to-amber-400 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <span>{activeSlide.cta[lang] || activeSlide.cta.en}</span>
                <ArrowRight className="w-5 h-5 text-[#143321]" aria-hidden="true" />
              </button>

              <button
                id="hero-banner-secondary-cta"
                type="button"
                onClick={onExplore}
                className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3.5 rounded-xl text-sm sm:text-base font-semibold text-white bg-white/15 hover:bg-white/25 border border-white/30 backdrop-blur-md transition-all cursor-pointer"
              >
                <span>
                  {activeSlide.secondaryCta?.[lang] ||
                    activeSlide.secondaryCta?.en ||
                    (lang === 'hi' ? 'मार्केटप्लेस देखें' : 'View Marketplace')}
                </span>
              </button>
            </div>
          </div>

          {/* Bottom Carousel Controls Bar (Arrows, Dots, Progress, Pause/Play) */}
          <div className="relative z-10 p-4 sm:p-6 flex items-center justify-between gap-4 border-t border-white/10 bg-black/30 backdrop-blur-xs">
            {/* Slide Indicator Dots with Progress */}
            <div className="flex items-center gap-2" role="tablist" aria-label="Slides">
              {BANNER_SLIDES.map((slide, idx) => {
                const isActive = idx === currentSlideIndex;
                return (
                  <button
                    key={slide.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-label={`Slide ${idx + 1}: ${slide.headline[lang] || slide.headline.en}`}
                    onClick={() => goToSlide(idx)}
                    className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer min-w-[10px] ${
                      isActive
                        ? 'w-8 bg-gradient-to-r from-amber-300 to-[#D6A63A] shadow-xs'
                        : 'w-2.5 bg-white/40 hover:bg-white/70'
                    }`}
                  />
                );
              })}

              {/* Slide Counter */}
              <span className="text-[11px] font-mono font-bold text-white/70 ml-2">
                0{currentSlideIndex + 1} / 0{totalSlides}
              </span>
            </div>

            {/* Play/Pause & Prev/Next Arrows */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Play/Pause Button */}
              <button
                type="button"
                onClick={() => setIsPaused((prev) => !prev)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                title={isPaused ? controls.play : controls.pause}
                aria-label={isPaused ? controls.play : controls.pause}
              >
                {isPaused ? <Play className="w-3.5 h-3.5 fill-white" /> : <Pause className="w-3.5 h-3.5 fill-white" />}
              </button>

              {/* Prev Button */}
              <button
                id="btn-hero-prev-slide"
                type="button"
                onClick={goToPrevSlide}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/15 hover:bg-white/30 border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer active:scale-95"
                title={controls.prev}
                aria-label={controls.prev}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Next Button */}
              <button
                id="btn-hero-next-slide"
                type="button"
                onClick={goToNextSlide}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/15 hover:bg-white/30 border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer active:scale-95"
                title={controls.next}
                aria-label={controls.next}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* FOUR ACTIVE CROPS STRIP (Wheat, Rice, Maize, Pulses only)                */}
        {/* ========================================================================= */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#EEF3E8] shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#26332B]">
            <Store className="w-4 h-4 text-[#245C3A]" />
            <span>{activeCropsHeading[lang] || activeCropsHeading.en}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#EEF3E8] text-[#245C3A] text-xs font-bold border border-[#D5E3CE]">
              <span>🌾</span>
              <span>{getLocalizedCropName('wheat', lang)}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#EEF3E8] text-[#245C3A] text-xs font-bold border border-[#D5E3CE]">
              <span>🍚</span>
              <span>{getLocalizedCropName('rice', lang)}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#EEF3E8] text-[#245C3A] text-xs font-bold border border-[#D5E3CE]">
              <span>🌽</span>
              <span>{getLocalizedCropName('maize', lang)}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#EEF3E8] text-[#245C3A] text-xs font-bold border border-[#D5E3CE]">
              <span>🫘</span>
              <span>{getLocalizedCropName('pulses', lang)}</span>
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PWA INSTALL & TRUST ASSURANCE BAR                                         */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Left: Direct Trade Value Assurance Badges */}
          <div className="md:col-span-8 p-4 rounded-2xl bg-[#FBFAF4] border border-[#E3DCCB] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#26332B]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#EEF3E8] text-[#245C3A] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-[#26332B] leading-tight">
                  {t.hero.directTrade}
                </p>
                <p className="text-[11px] text-[#68736B]">
                  {zeroMiddlemanLabel[lang] || zeroMiddlemanLabel.en}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-[#26332B] leading-tight">
                  {t.hero.fairPriceAssurance}
                </p>
                <p className="text-[11px] text-[#68736B]">
                  {officialMandiLabel[lang] || officialMandiLabel.en}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-[#26332B] leading-tight">
                  {t.hero.verifiedFarmers}
                </p>
                <p className="text-[11px] text-[#68736B]">
                  {verifiedBuyersLabel[lang] || verifiedBuyersLabel.en}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Small PWA Install Button */}
          <div className="md:col-span-4 flex justify-center md:justify-end">
            <PWAInstallButton
              currentLanguage={currentLanguage}
              translations={t}
              variant="home-cta"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
