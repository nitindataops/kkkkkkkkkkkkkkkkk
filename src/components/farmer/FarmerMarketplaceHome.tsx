import React, { useState } from 'react';
import {
  Sprout,
  Plus,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Package,
  Bell,
  Sparkles,
  ChevronRight,
  Truck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Mic,
  MapPin,
  Calendar,
  Edit2,
  Trash2,
  Eye,
  QrCode,
  AlertTriangle,
  Layers,
  Scale,
  Building2,
  FileCheck,
  Search,
} from 'lucide-react';
import {
  CropListing,
  BuyerMatch,
  OrderRecord,
  MarketPriceRecord,
  BuyerEnquiry,
  NotificationItem,
  FarmerDashboardTab,
  FarmerProfile,
} from '../../types/farmer';
import { LanguageCode } from '../../types';
import { getFarmerTranslations } from '../../data/farmerTranslations';
import { resolveCropImage, handleCropImageError } from '../../data/imageAssets';
import { isApprovedCrop } from '../../data/cropVarieties';
import { getListingPrice } from '../../services/aiGradingService';
import { CropQRPassportModal, CropPassportData } from '../trust/CropQRPassportModal';
import { QRVerificationModal } from '../trust/QRVerificationModal';

interface FarmerMarketplaceHomeProps {
  profile: FarmerProfile;
  crops: CropListing[];
  buyers: BuyerMatch[];
  orders: OrderRecord[];
  marketPrices: MarketPriceRecord[];
  enquiries: BuyerEnquiry[];
  notifications: NotificationItem[];
  onSelectTab: (tab: FarmerDashboardTab) => void;
  onOpenAddCropModal: () => void;
  onOpenCropDetails: (crop: CropListing) => void;
  onEditCrop?: (crop: CropListing) => void;
  onDeleteCrop?: (cropId: string) => void;
  onSellCrop?: (crop: CropListing) => void;
  onOpenBuyerDetails?: (buyer: BuyerMatch) => void;
  onOpenContactBuyer?: (buyer: BuyerMatch) => void;
  onOpenMakeOffer?: (buyer: BuyerMatch) => void;
  onOpenAiAssistant: (initialPrompt?: string) => void;
  currentLanguage: LanguageCode;
}

export const FarmerMarketplaceHome: React.FC<FarmerMarketplaceHomeProps> = ({
  profile,
  crops,
  buyers,
  orders,
  marketPrices,
  enquiries,
  notifications,
  onSelectTab,
  onOpenAddCropModal,
  onOpenCropDetails,
  onEditCrop,
  onDeleteCrop,
  onSellCrop,
  onOpenBuyerDetails,
  onOpenContactBuyer,
  onOpenMakeOffer,
  onOpenAiAssistant,
  currentLanguage,
}) => {
  const t = getFarmerTranslations(currentLanguage);
  const homeT = t.home;
  const isHi = currentLanguage === 'hi';

  // Modal states for QR Passport and Verification
  const [selectedCropForPassport, setSelectedCropForPassport] = useState<CropListing | null>(null);
  const [isQRPassportOpen, setIsQRPassportOpen] = useState<boolean>(false);
  const [isQRVerifyOpen, setIsQRVerifyOpen] = useState<boolean>(false);

  // Aggregate metrics
  const totalStockKg = crops.reduce((acc, c) => acc + c.quantityKg, 0);
  const activeOrders = orders.filter((o) => o.status !== 'Payment Completed');
  const availableCrops = crops.filter((crop) => isApprovedCrop(crop.name || (crop as any).crop));
  const availableCropsCount = availableCrops.filter((c) => c.status === 'Available for Sale').length;

  // Selected major mandi rates for overview (4 major crops: Wheat, Rice/Paddy, Maize, Pulses)
  const featuredMandiPrices = marketPrices.slice(0, 4);

  // Top 3 authentic buyer opportunities matching active crops
  const matchedBuyers = buyers.slice(0, 3);

  // Recent 2 active orders
  const recentOrders = orders.slice(0, 2);

  // Open QR passport helper
  const handleOpenQRForCrop = (crop: CropListing) => {
    setSelectedCropForPassport(crop);
    setIsQRPassportOpen(true);
  };

  // Build active passport data
  const defaultCrop = availableCrops[0] || crops[0];
  const activePassportTarget = selectedCropForPassport || defaultCrop;
  const activePassportData: CropPassportData = {
    batchId: activePassportTarget ? `KS-LOT-${activePassportTarget.id}` : `KS-LOT-${profile.farmerId || '2026-089'}`,
    cropName: activePassportTarget?.name || 'Wheat',
    variety: activePassportTarget?.variety || 'Sharbati A-Grade',
    quantityKg: activePassportTarget?.quantityKg || 3500,
    grade: (activePassportTarget?.grade as any) === 'A+' ? 'PREMIUM' : 'STANDARD',
    qualityScore: 94,
    farmerId: profile.farmerId || 'KISAN-UP-2026-8842',
    farmerName: profile.name || 'Rajesh Kumar',
    district: profile.district || 'Bareilly',
    state: 'Uttar Pradesh',
    harvestDate: activePassportTarget?.harvestedDate || 'March 2026',
    mandiBenchmarkRate: activePassportTarget?.currentMandiPrice || 27.5,
    landRecordVerified: true,
    weighmentSlipVerified: true,
  };

  // 7-Stage Visual Journey Workflow
  const journeyStages = [
    {
      id: 'CAPTURE',
      step: 1,
      name: isHi ? 'कैप्चर' : 'Capture',
      desc: isHi ? 'कैमरा परीक्षण' : 'Camera Capture',
      icon: Plus,
      actionLabel: isHi ? 'फोटो लें' : 'Take Photo',
      onClick: onOpenAddCropModal,
      badge: isHi ? 'कैमरा-ओनली' : 'Camera Only',
    },
    {
      id: 'UNDERSTAND',
      step: 2,
      name: isHi ? 'समझें' : 'Understand',
      desc: isHi ? 'एआई ग्रेडिंग' : 'AI Grading',
      icon: Sparkles,
      actionLabel: isHi ? 'गुणवत्ता देखें' : 'View Grade',
      onClick: () => onSelectTab('value-engine'),
      badge: '94% Quality',
    },
    {
      id: 'PROTECT',
      step: 3,
      name: isHi ? 'संरक्षण' : 'Protect',
      desc: isHi ? 'जोखिम रडार' : 'Risk & Rescue',
      icon: ShieldCheck,
      actionLabel: isHi ? 'सुरक्षा रडार' : 'Risk Radar',
      onClick: () => onSelectTab('value-engine'),
      badge: isHi ? 'वैल्यू क्लॉक' : 'Loss Clock',
    },
    {
      id: 'MATCH',
      step: 4,
      name: isHi ? 'मिलान' : 'Match',
      desc: isHi ? 'सत्यापित खरीदार' : 'Buyer Match',
      icon: Building2,
      actionLabel: isHi ? 'खरीदार खोजें' : 'Find Buyers',
      onClick: () => onSelectTab('search-buyers'),
      badge: `${buyers.length} ${isHi ? 'मांग' : 'Demands'}`,
    },
    {
      id: 'TRADE',
      step: 5,
      name: isHi ? 'व्यापार' : 'Trade',
      desc: isHi ? 'प्रत्यक्ष सौदा' : 'Direct Trade',
      icon: MessageSquare,
      actionLabel: isHi ? 'प्रस्ताव भेजें' : 'Make Offer',
      onClick: () => onSelectTab('enquiries'),
      badge: isHi ? 'एस्क्रो सुरक्षित' : 'Escrow Guard',
    },
    {
      id: 'VERIFY',
      step: 6,
      name: isHi ? 'सत्यापन' : 'Verify',
      desc: isHi ? 'क्यूआर पासपोर्ट' : 'QR Passport',
      icon: QrCode,
      actionLabel: isHi ? 'क्यूआर पासपोर्ट' : 'Batch QR',
      onClick: () => {
        if (defaultCrop) {
          handleOpenQRForCrop(defaultCrop);
        } else {
          setIsQRVerifyOpen(true);
        }
      },
      badge: 'Cryptographic',
    },
    {
      id: 'DELIVER',
      step: 7,
      name: isHi ? 'आपूर्ति' : 'Deliver',
      desc: isHi ? 'लॉजिस्टिक्स ट्रैकिंग' : 'Transport Pool',
      icon: Truck,
      actionLabel: isHi ? 'पिकअप ट्रैक करें' : 'Track Pickup',
      onClick: () => onSelectTab('orders'),
      badge: isHi ? 'लाइव ट्रैकिंग' : 'Live Transit',
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-300">
      {/* ========================================================================= */}
      {/* HERO HEADER: FARMER PROFILE AT A GLANCE                                  */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#245C3A] via-[#1B432B] to-[#122E1D] text-white p-6 sm:p-8 shadow-lg border border-[#5F8F45]/30">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#D6A63A] text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D6A63A]" />
              <span>
                {isHi ? 'सत्यापित किसान' : 'Verified Farmer'} • ID: {profile.farmerId}
              </span>
              {profile.village && (
                <span className="text-gray-300">
                  • {profile.village}, {profile.district}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black font-serif tracking-tight text-white">
              {(() => {
                const name = profile?.name?.trim() || '';
                const hour = new Date().getHours();
                let template = homeT.greetingMorning;
                if (hour >= 12 && hour < 17) {
                  template = homeT.greetingAfternoon;
                } else if (hour >= 17 || hour < 5) {
                  template = homeT.greetingEvening;
                }
                if (name) {
                  return template.replace(/\{name\}/g, name);
                }
                return template.replace(/\{name\}\s*/g, '').trim();
              })()}
            </h1>

            <p className="text-xs sm:text-sm text-gray-200 max-w-2xl leading-relaxed">
              {isHi
                ? 'आपकी फसल, आपका बाज़ार — कटाई से लेकर पारदर्शी भुगतान तक फसल के मूल्य का 100% संरक्षण।'
                : 'Aapki Fasal, Aapka Bazaar — Protecting full post-harvest value from crop inspection to escrow payout.'}
            </p>

            {/* Quick Actions in Hero */}
            <div className="pt-2 flex items-center gap-3 flex-wrap">
              <button
                id="farmer-hero-add-crop-btn"
                onClick={onOpenAddCropModal}
                className="px-4 py-2.5 rounded-xl bg-[#D6A63A] hover:bg-[#C2942F] text-[#245C3A] font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 transition-all cursor-pointer hover:scale-102"
              >
                <Plus className="w-4 h-4 text-[#245C3A]" />
                <span>{homeT.quickActions.addCrop}</span>
              </button>

              <button
                onClick={() => onSelectTab('voice-assistant')}
                className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Mic className="w-4 h-4 text-[#D6A63A]" />
                <span>{isHi ? '🎙️ आवाज सहायक' : '🎙️ Voice Assistant'}</span>
              </button>

              <button
                onClick={() => setIsQRVerifyOpen(true)}
                className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <QrCode className="w-4 h-4 text-emerald-300" />
                <span>{isHi ? 'क्यूआर सत्यापन केंद्र' : 'QR Verification Hub'}</span>
              </button>
            </div>
          </div>

          {/* 3 Compact High-Level Metrics */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 shrink-0">
            <div className="p-3 sm:p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-left">
              <div className="text-[11px] text-gray-300 font-medium">
                {isHi ? 'सक्रिय फसलें' : 'Active Crops'}
              </div>
              <div className="text-xl sm:text-2xl font-black font-serif text-[#D6A63A] mt-0.5">
                {availableCrops.length}
              </div>
              <div className="text-[10px] text-green-300 font-semibold mt-0.5">
                ✓ {availableCropsCount} {isHi ? 'बिक्री योग्य' : 'Available'}
              </div>
            </div>

            <div className="p-3 sm:p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-left">
              <div className="text-[11px] text-gray-300 font-medium">
                {isHi ? 'कुल उपलब्ध स्टॉक' : 'Total Stock'}
              </div>
              <div className="text-xl sm:text-2xl font-black font-serif text-white mt-0.5">
                {(totalStockKg ?? 0).toLocaleString('en-IN')}{' '}
                <span className="text-xs font-normal">kg</span>
              </div>
              <div className="text-[10px] text-gray-300 font-medium mt-0.5">
                ≈ {(totalStockKg / 100).toFixed(1)} {isHi ? 'क्विंटल' : 'Quintals'}
              </div>
            </div>

            <div className="p-3 sm:p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-left">
              <div className="text-[11px] text-gray-300 font-medium">
                {isHi ? 'सक्रिय ऑर्डर्स' : 'Active Orders'}
              </div>
              <div className="text-xl sm:text-2xl font-black font-serif text-[#D6A63A] mt-0.5">
                {activeOrders.length}
              </div>
              <div className="text-[10px] text-amber-300 font-semibold mt-0.5">
                🚚 {activeOrders.length > 0 ? (isHi ? 'पिकअप शेड्यूल' : 'In Transit') : (isHi ? 'सुरक्षित' : 'Settled')}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 1: MY CROPS (वर्तमान फसलें)                                       */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#245C3A]/10 text-[#245C3A] flex items-center justify-center">
              <Sprout className="w-5 h-5 text-[#245C3A]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black font-serif text-[#26332B]">
                  {isHi ? '1. मेरी फसलें (My Crops)' : '1. My Crops'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-[#245C3A]/10 text-[#245C3A] text-xs font-bold">
                  {availableCrops.length} {isHi ? 'सक्रिय लॉट' : 'Active Lots'}
                </span>
              </div>
              <p className="text-xs text-[#68736B]">
                {isHi
                  ? 'आपके खेत की सक्रिय फसलें (गेहूं, धान, मक्का, दालें), एआई ग्रेडिंग, नमी, मंडी भाव एवं डिजिटल क्यूआर'
                  : 'Active harvest lots (Wheat, Rice/Paddy, Maize, Pulses/Chana) with AI visual grading, moisture, live Mandi ref & QR'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="present-crops-add-btn"
              onClick={onOpenAddCropModal}
              className="px-4 py-2 rounded-xl bg-[#245C3A] hover:bg-[#1E4D31] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#D6A63A]" />
              <span>{isHi ? '+ नई फसल जोड़ें (कैमरा)' : '+ Add Crop (Camera)'}</span>
            </button>
          </div>
        </div>

        {availableCrops.length === 0 ? (
          <div className="p-8 sm:p-12 rounded-3xl bg-white border border-[#EEF3E8] shadow-xs text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#EEF3E8] text-[#245C3A] flex items-center justify-center mx-auto text-2xl shadow-2xs">
              🌾
            </div>
            <h3 className="text-base font-bold text-[#26332B]">
              {isHi ? 'वर्तमान में कोई सक्रिय फसल सूचीबद्ध नहीं है' : 'No active crops currently listed'}
            </h3>
            <p className="text-xs text-[#68736B] max-w-md mx-auto leading-relaxed">
              {isHi
                ? 'लाइव कैमरे से फसल की फोटो खींचकर अपनी कटाई को सीधे सत्यापित खरीदारों को बेचने के लिए नई फसल जोड़ें।'
                : 'Take live crop photos to list verified harvest lots and connect directly with authenticated buyers.'}
            </p>
            <button
              onClick={onOpenAddCropModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#245C3A] hover:bg-[#1E4D31] text-white text-xs font-bold shadow-md cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4 text-[#D6A63A]" />
              <span>{isHi ? '+ नई फसल जोड़ें (कैमरा-ओनली)' : '+ Add Your First Crop (Camera Only)'}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {availableCrops.map((crop) => {
              const cropPricing = getListingPrice(crop);
              return (
                <div
                  key={crop.id}
                  className="bg-white rounded-3xl border border-[#EEF3E8] hover:border-[#5F8F45]/50 transition-all shadow-xs hover:shadow-md overflow-hidden flex flex-col justify-between group"
                >
                  <div>
                    {/* Crop Banner Image with Badges */}
                    <div className="relative h-44 sm:h-48 w-full bg-gray-100 overflow-hidden">
                      <img
                        src={resolveCropImage({
                          imageUrl: crop.imageUrl || (crop as any).image,
                          crop: crop.name,
                          variety: crop.variety,
                          category: crop.category,
                          images: crop.images,
                        })}
                        alt={crop.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                        onError={(e) => handleCropImageError(e, crop.name, crop.variety, crop.category)}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                        {cropPricing.isPremium ? (
                          <span className="px-2.5 py-1 rounded-full bg-[#B45309] text-white text-xs font-black shadow-xs flex items-center gap-1">
                            <span>★</span>
                            <span>PREMIUM (+5%)</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-[#245C3A] text-white text-xs font-black shadow-xs">
                            STANDARD
                          </span>
                        )}

                        <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-[#D6A63A]" />
                          <span>{isHi ? 'एआई सत्यापित' : 'AI Verified'}</span>
                        </span>
                      </div>

                      {/* Status badge top right */}
                      <div className="absolute top-3 right-3">
                        <span className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-[#245C3A] text-[10px] font-bold shadow-2xs">
                          {crop.status || 'Available for Sale'}
                        </span>
                      </div>

                      {/* Quantity pill bottom right */}
                      <div className="absolute bottom-3 right-3 px-3 py-1 rounded-xl bg-white/95 backdrop-blur-md text-[#245C3A] text-xs font-black shadow-xs">
                        {(crop.quantityKg ?? 0).toLocaleString('en-IN')} kg
                        <span className="text-[10px] text-[#68736B] font-medium ml-1">
                          ({((crop.quantityKg ?? 0) / 100).toFixed(1)} {isHi ? 'क्विंटल' : 'Qtl'})
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 sm:p-5 space-y-3">
                      <div>
                        <h3 className="font-bold text-base sm:text-lg text-[#26332B] font-serif leading-snug">
                          {crop.name}
                        </h3>
                        <p className="text-xs text-[#68736B]">
                          {crop.variety || 'Standard Approved'} • {crop.location || `${crop.district || 'Bareilly'}, Uttar Pradesh`}
                        </p>
                      </div>

                      {/* Specifications */}
                      <div className="grid grid-cols-2 gap-2 text-xs text-[#68736B] py-2 border-y border-[#EEF3E8]">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-gray-400 block">
                            {isHi ? 'कटाई तिथि' : 'Harvest Date'}:
                          </span>
                          <span className="font-semibold text-[#26332B]">
                            {crop.harvestedDate || 'March 2026'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-gray-400 block">
                            {isHi ? 'नमी / सूखापन' : 'Moisture'}:
                          </span>
                          <span className="font-semibold text-[#26332B]">
                            {crop.moistureContent || '11.5%'}
                          </span>
                        </div>
                      </div>

                      {/* Price Comparison */}
                      <div className="grid grid-cols-2 gap-2.5 p-3 rounded-2xl bg-[#FBFAF4] border border-[#EEF3E8]">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-[#68736B] block">
                            {isHi ? 'सरकारी मंडी भाव' : 'Live Mandi Ref'}
                          </span>
                          <div className="text-sm sm:text-base font-bold text-[#26332B]">
                            ₹{cropPricing.mandiRateKg}{' '}
                            <span className="text-xs font-normal text-gray-500">/kg</span>
                          </div>
                          <span className="text-[10px] text-gray-400 block">
                            (₹{cropPricing.mandiRateQuintal.toLocaleString('en-IN')}/q)
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] uppercase font-bold text-[#68736B] block">
                            {isHi ? 'सूचीबद्ध भाव' : 'Listing Price'}
                          </span>
                          <div className="text-sm sm:text-base font-black text-[#245C3A]">
                            ₹{cropPricing.pricePerKg}{' '}
                            <span className="text-xs font-normal text-gray-500">/kg</span>
                          </div>
                          <span className="text-[10px] text-[#245C3A] font-semibold block">
                            (₹{Math.round(cropPricing.pricePerKg * 100).toLocaleString('en-IN')}/q)
                            {cropPricing.isPremium && <span className="text-[#B45309] ml-1 font-bold">+5%</span>}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-4 sm:p-5 pt-0 space-y-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => (onSellCrop ? onSellCrop(crop) : onSelectTab('search-buyers'))}
                        className="flex-1 py-2.5 rounded-xl bg-[#245C3A] hover:bg-[#1B432B] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <span>{isHi ? 'खरीदार खोजें' : 'Find Buyers'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      {/* QR Passport Button */}
                      <button
                        onClick={() => handleOpenQRForCrop(crop)}
                        className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-[#245C3A] transition-colors cursor-pointer"
                        title={isHi ? 'डिजिटल क्यूआर पासपोर्ट' : 'Digital QR Passport'}
                      >
                        <QrCode className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onOpenCropDetails(crop)}
                        className="p-2.5 rounded-xl bg-[#FBFAF4] hover:bg-[#EEF3E8] border border-[#EEF3E8] text-[#26332B] transition-colors cursor-pointer"
                        title={isHi ? 'विवरण देखें' : 'View Details'}
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {onEditCrop && (
                        <button
                          onClick={() => onEditCrop(crop)}
                          className="p-2.5 rounded-xl bg-[#FBFAF4] hover:bg-[#EEF3E8] border border-[#EEF3E8] text-[#26332B] transition-colors cursor-pointer"
                          title={isHi ? 'संपादित करें' : 'Edit Crop'}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}

                      {onDeleteCrop && (
                        <button
                          onClick={() => onDeleteCrop(crop.id)}
                          className="p-2.5 rounded-xl bg-[#FBFAF4] hover:bg-rose-50 border border-[#EEF3E8] hover:border-rose-200 text-rose-600 transition-colors cursor-pointer"
                          title={isHi ? 'हटाएं' : 'Delete Crop'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: CROP VALUE INSIGHT & VISUAL WORKFLOW JOURNEY                   */}
      {/* ========================================================================= */}
      <section className="bg-gradient-to-br from-[#FAF7F0] via-white to-[#FAF7F0] rounded-3xl p-5 sm:p-7 border border-[#D5DDD2] shadow-sm space-y-6">
        {/* Insight Header + Clear Action: VIEW CROP INTELLIGENCE */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E3DCB]">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#245C3A]/10 text-[#245C3A] text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isHi ? '2. फसल मूल्य एवं संरक्षण अंतर्दृष्टि' : '2. Crop Value Insight'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-serif text-[#26332B]">
              {isHi ? 'मूल्य संरक्षण एवं प्रत्यक्ष व्यापार अंतर्दृष्टि' : 'Value Preservation & Decision Support'}
            </h2>
            <p className="text-xs text-[#68736B] max-w-2xl leading-relaxed">
              {isHi
                ? 'क्या अभी बेचें? या स्टोर करें? या लॉट विभाजित करें? फसल की गुणवत्ता और आधिकारिक मंडी भाव के आधार पर निष्पक्ष निर्णय सहायता।'
                : 'Sell now? Store? Find buyer? Split lot? Clear decision-support based on authentic crop condition & APMC benchmarks.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              id="btn-view-crop-intelligence"
              onClick={() => onSelectTab('value-engine')}
              className="px-5 py-3 rounded-2xl bg-[#245C3A] hover:bg-[#1E4D31] text-white text-xs sm:text-sm font-black shadow-md flex items-center gap-2 transition-all cursor-pointer hover:scale-102"
            >
              <Sparkles className="w-4 h-4 text-[#D6A63A]" />
              <span>{isHi ? '🌾 फसल बुद्धिमत्ता देखें (VIEW CROP INTELLIGENCE)' : '🌾 VIEW CROP INTELLIGENCE'}</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Actionable Decision Card (Sell now? Store? Split lot?) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-[#D5DDD2] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#26332B]">{isHi ? 'वर्तमान स्थिति' : 'Crop Condition'}</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                Grade A / Premium
              </span>
            </div>
            <p className="text-xs text-[#68736B]">
              {isHi
                ? 'नमी सुरक्षित (11.5%)। अनाज की चमक व भार उत्कृष्ट है। कोई फफूंद या कीट क्षति नहीं पाई गई।'
                : 'Moisture safe (11.5%). Optimal grain hardness & lustre with zero damage.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#D5DDD2] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#26332B]">{isHi ? 'वैल्यू लॉस क्लॉक' : 'Preservation Clock'}</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                42 Days Safe Window
              </span>
            </div>
            <p className="text-xs text-[#68736B]">
              {isHi
                ? 'अगले 18 दिन सर्वोत्तम भाव प्राप्त करने के लिए अनुकूल हैं। बारिश से पूर्व कवर शेड में रखें।'
                : 'Next 18 days optimal for top modal realization before humid weather changes.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-300 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-950">{isHi ? 'सिफारिश' : 'Engine Recommendation'}</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-900">
                Decision Support
              </span>
            </div>
            <p className="text-xs text-emerald-900 font-medium">
              {isHi
                ? '60% स्टॉक को प्रीमियम लॉट बनाकर सीधे मिल को बेचें। 40% सुरक्षित शेड में होल्ड करें।'
                : 'Sell 60% as Premium Lot directly to verified buyer mill; hold 40% in aerated storage.'}
            </p>
          </div>
        </div>

        {/* VISUAL WORKFLOW: 🌾 CROP VALUE PRESERVATION JOURNEY */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-[#26332B]">
                🌾 {isHi ? 'फसल मूल्य संरक्षण यात्रा (Crop Value Preservation Journey)' : 'Crop Value Preservation Journey'}
              </span>
            </div>
            <span className="text-[11px] text-[#68736B]">
              {isHi ? 'प्रत्येक चरण वास्तविक फीचर से जुड़ा हुआ है (क्लिक करें)' : 'Click any stage to launch the real feature'}
            </span>
          </div>

          {/* 7 Connected Stages Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {journeyStages.map((stage, idx) => {
              const IconComp = stage.icon;
              return (
                <button
                  key={stage.id}
                  onClick={stage.onClick}
                  className="p-3 rounded-2xl bg-white hover:bg-[#F3EFE6] border border-[#D5DDD2] hover:border-[#245C3A] text-left transition-all flex flex-col justify-between group cursor-pointer shadow-2xs hover:shadow-xs"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-6 h-6 rounded-full bg-[#245C3A]/10 text-[#245C3A] text-[11px] font-black flex items-center justify-center group-hover:bg-[#245C3A] group-hover:text-white transition-colors">
                      {stage.step}
                    </span>
                    <IconComp className="w-4 h-4 text-[#245C3A]" />
                  </div>

                  <div>
                    <div className="text-xs font-black text-[#26332B] uppercase tracking-wide">
                      {stage.name}
                    </div>
                    <div className="text-[10px] text-[#68736B] truncate">
                      {stage.desc}
                    </div>
                  </div>

                  <div className="mt-2 pt-1.5 border-t border-gray-100 flex items-center justify-between text-[10px] font-bold text-[#245C3A]">
                    <span>{stage.actionLabel}</span>
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: BUYER OPPORTUNITIES (सत्यापित खरीदार मांग व अवसर)              */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#245C3A]/10 text-[#245C3A] flex items-center justify-center">
              <Building2 className="w-5 h-5 text-[#245C3A]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black font-serif text-[#26332B]">
                  {isHi ? '3. खरीदार अवसर (Buyer Opportunities)' : '3. Buyer Opportunities'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  {matchedBuyers.length} {isHi ? 'सत्यापित खरीदार' : 'Matched Commercial Buyers'}
                </span>
              </div>
              <p className="text-xs text-[#68736B]">
                {isHi
                  ? 'आपकी फसल से मेल खाती वास्तविक मांग: दाल मिलें, आटा चक्की, निर्यातक व खाद्य प्रसंस्करण उद्योग'
                  : 'Authentic buyer demand matching your crops: flour mills, dal processors, and exporters with escrow backing'}
              </p>
            </div>
          </div>

          <button
            onClick={() => onSelectTab('search-buyers')}
            className="text-xs font-bold text-[#245C3A] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{isHi ? 'सभी खरीदार देखें' : 'View All Buyers'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {matchedBuyers.length === 0 ? (
          <div className="p-6 rounded-2xl bg-white border border-[#EEF3E8] text-center text-xs text-[#68736B]">
            {isHi ? 'वर्तमान में कोई खरीदार मेल नहीं खा रहा है।' : 'No buyer requirements matched right now.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {matchedBuyers.map((buyer) => (
              <div
                key={buyer.id}
                className="p-5 rounded-3xl bg-white border border-[#EEF3E8] hover:border-[#5F8F45]/50 shadow-xs flex flex-col justify-between space-y-4 group transition-all"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-[#26332B] flex items-center gap-1.5">
                        <span>{buyer.name}</span>
                        {buyer.verified && <ShieldCheck className="w-4 h-4 text-[#5F8F45] shrink-0" />}
                      </h3>
                      <p className="text-xs text-[#68736B] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#B86F4B]" />
                        <span>{buyer.location} ({buyer.distanceKm} km)</span>
                      </p>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#245C3A]/10 text-[#245C3A]">
                      {buyer.matchScore}% Match
                    </span>
                  </div>

                  {/* Requirements & Rate */}
                  <div className="p-3 rounded-2xl bg-[#FBFAF4] border border-[#EEF3E8] space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#68736B]">{isHi ? 'मांग:' : 'Demanded:'}</span>
                      <span className="font-bold text-[#26332B]">{buyer.requiredCrop}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#68736B]">{isHi ? 'आवश्यक मात्रा:' : 'Required:'}</span>
                      <span className="font-semibold text-[#26332B]">{buyer.requiredQuantityKg.toLocaleString('en-IN')} kg</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-[#EEF3E8]">
                      <span className="text-[#68736B]">{isHi ? 'प्रस्तावित दर:' : 'Offered Rate:'}</span>
                      <span className="font-black text-[#245C3A]">₹{buyer.offeredPrice} / kg</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-[#68736B] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{buyer.paymentTerms || 'Instant RTGS on weighment'}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      if (onOpenMakeOffer) {
                        onOpenMakeOffer(buyer);
                      } else {
                        onSelectTab('enquiries');
                      }
                    }}
                    className="flex-1 py-2 rounded-xl bg-[#245C3A] hover:bg-[#1E4D31] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                  >
                    <span>{isHi ? 'सौदा शुरू करें' : 'Start Trade'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => {
                      if (onOpenBuyerDetails) {
                        onOpenBuyerDetails(buyer);
                      } else if (onOpenContactBuyer) {
                        onOpenContactBuyer(buyer);
                      } else {
                        onSelectTab('search-buyers');
                      }
                    }}
                    className="p-2 rounded-xl bg-[#FBFAF4] hover:bg-[#EEF3E8] border border-[#EEF3E8] text-[#245C3A] text-xs font-bold transition-colors cursor-pointer"
                    title={isHi ? 'मांग देखें' : 'View Requirement'}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* SECTION 4 & 5: ORDERS & MANDI SNAPSHOT IN TWO COLUMNS                     */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SECTION 4: ORDERS (ऑर्डर्स व आपूर्ति) */}
        <section className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EEF3E8] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EEF3E8]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#EEF3E8] text-[#245C3A] flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#26332B]">
                  {isHi ? '4. ऑर्डर्स व आपूर्ति (Orders)' : '4. Orders & Deliveries'}
                </h2>
                <p className="text-xs text-[#68736B]">
                  {isHi ? 'कटाई बिक्री, पिकअप ट्रैकिंग एवं एस्क्रो भुगतान' : 'Harvest sales, pickup tracking & escrow'}
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-[#245C3A] bg-[#EEF3E8] px-2.5 py-1 rounded-full">
              Escrow Protected
            </span>
          </div>

          {recentOrders.length === 0 ? (
            <div className="p-6 rounded-2xl bg-[#FBFAF4] border border-dashed border-[#EEF3E8] text-center text-xs text-[#68736B]">
              {isHi ? 'कोई सक्रिय ऑर्डर नहीं है।' : 'No active orders found.'}
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentOrders.map((ord) => (
                <div
                  key={ord.orderNumber}
                  className="p-3.5 rounded-2xl bg-[#FBFAF4] border border-[#EEF3E8] flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-[#245C3A]">{ord.orderNumber}</span>
                      <span className="text-[#68736B]">• {ord.buyerName}</span>
                    </div>
                    <div className="font-medium text-[#26332B]">
                      {ord.crop || ord.cropName} ({ord.variety}) • {ord.quantityKg.toLocaleString('en-IN')} kg
                    </div>
                    <div className="text-[11px] text-[#5F8F45] font-bold flex items-center gap-1">
                      <Truck className="w-3 h-3" />
                      <span>
                        {isHi ? 'पिकअप' : 'Pickup'}: {ord.pickupDate || ord.pickupScheduledDate || 'Scheduled'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-black font-serif text-sm text-[#26332B]">
                      ₹{ord.totalAmount.toLocaleString('en-IN')}
                    </div>
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D6A63A]/20 text-[#8C6212] mt-1">
                      {ord.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-1 text-right">
            <button
              onClick={() => onSelectTab('orders')}
              className="text-xs font-bold text-[#245C3A] hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>{isHi ? 'मेनू में "ऑर्डर्स" से पूरी सूची देखें' : 'View all orders in Menu → Orders'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>

        {/* SECTION 5: MANDI SNAPSHOT (सरकारी एपीएमसी मंडी लाइव भाव) */}
        <section className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EEF3E8] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EEF3E8]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#EEF3E8] text-[#245C3A] flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#26332B]">
                  {isHi ? '5. मंडी स्नैपशॉट (Mandi Snapshot)' : '5. Mandi Snapshot'}
                </h2>
                <p className="text-xs text-[#68736B]">
                  {isHi ? 'सरकारी ई-नाम व एगमार्कनेट आधिकारिक भाव' : 'Live AGMARKNET & e-NAM modal rates'}
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-[#5F8F45] bg-[#EEF3E8] px-2.5 py-1 rounded-full">
              LIVE APMC
            </span>
          </div>

          <div className="space-y-2.5">
            {featuredMandiPrices.map((mp, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-[#FBFAF4] border border-[#EEF3E8] flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold text-[#26332B] text-sm">{mp.crop}</div>
                  <div className="text-[11px] text-[#68736B] flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-[#B86F4B]" />
                    <span>{mp.nearestMandi || 'District APMC Mandi'}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-black font-serif text-sm sm:text-base text-[#245C3A]">
                    ₹{(mp.modalPrice || mp.currentMandiPrice * 100).toLocaleString('en-IN')}{' '}
                    <span className="text-[10px] font-normal text-[#68736B]">/q</span>
                  </div>
                  <div className="flex items-center justify-end gap-1 text-[11px] font-bold mt-0.5">
                    {mp.trend === 'up' ? (
                      <span className="text-emerald-700 flex items-center">
                        <TrendingUp className="w-3 h-3 mr-0.5" />
                        +₹{Math.abs(mp.priceChange24h)}
                      </span>
                    ) : (
                      <span className="text-rose-700 flex items-center">
                        <TrendingDown className="w-3 h-3 mr-0.5" />
                        -₹{Math.abs(mp.priceChange24h)}
                      </span>
                    )}
                    <span className="text-gray-400 font-normal">• 24h</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-1 text-right">
            <button
              onClick={() => onSelectTab('market-prices')}
              className="text-xs font-bold text-[#245C3A] hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>{isHi ? 'मेनू में "मंडी भाव" से सभी मंडियां देखें' : 'View all APMC rates in Menu → Mandi Rates'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>
      </div>

      {/* ========================================================================= */}
      {/* SIDE-BY-SIDE: RECENT ENQUIRIES + NOTIFICATIONS & ADVISORY                 */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RECENT BUYER ENQUIRIES */}
        <section className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EEF3E8] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EEF3E8]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#EEF3E8] text-[#245C3A] flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#26332B]">
                  {isHi ? 'ताज़ा पूछताछ व संदेश' : 'Recent Inquiries & Offers'}
                </h2>
                <p className="text-xs text-[#68736B]">
                  {isHi ? 'खरीदारों से सीधे प्राप्त प्रस्ताव' : 'Direct trade messages & counter-offers'}
                </p>
              </div>
            </div>

            {enquiries.filter((e) => e.status === 'New').length > 0 && (
              <span className="text-[11px] font-black text-white bg-[#B86F4B] px-2.5 py-0.5 rounded-full">
                {enquiries.filter((e) => e.status === 'New').length} {isHi ? 'नई' : 'New'}
              </span>
            )}
          </div>

          {enquiries.slice(0, 3).length === 0 ? (
            <div className="p-6 rounded-2xl bg-[#FBFAF4] border border-dashed border-[#EEF3E8] text-center text-xs text-[#68736B]">
              {isHi ? 'फिलहाल कोई नई पूछताछ लंबित नहीं है।' : 'No active enquiries pending right now.'}
            </div>
          ) : (
            <div className="space-y-2.5">
              {enquiries.slice(0, 3).map((enq) => (
                <div
                  key={enq.id}
                  className="p-3 rounded-2xl bg-[#FBFAF4] border border-[#EEF3E8] flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 font-bold text-[#26332B]">
                      <span>{enq.buyerName}</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-[#5F8F45]" />
                    </div>
                    <div className="text-[11px] text-[#68736B]">
                      {enq.crop} • {enq.requestedQuantityKg.toLocaleString('en-IN')} kg
                    </div>
                    <div className="text-[11px] font-semibold text-[#8C6212]">
                      {isHi ? 'प्रस्तावित भाव' : 'Offered'}: ₹{enq.offeredPricePerKg}/kg
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        enq.status === 'New'
                          ? 'bg-[#B86F4B]/15 text-[#B86F4B]'
                          : enq.status === 'Accepted'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {enq.status}
                    </span>
                    <button
                      onClick={() => onSelectTab('enquiries')}
                      className="block mt-1 text-[11px] font-bold text-[#245C3A] hover:underline cursor-pointer"
                    >
                      {isHi ? 'उत्तर दें →' : 'Respond →'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* IMPORTANT NOTIFICATIONS & ADVISORY */}
        <section className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EEF3E8] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EEF3E8]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#EEF3E8] text-[#245C3A] flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#26332B]">
                  {isHi ? 'महत्वपूर्ण सूचनाएं' : 'Important Notifications'}
                </h2>
                <p className="text-xs text-[#68736B]">
                  {isHi ? 'मंडी भाव व ऑर्डर संबंधी ताज़ा अलर्ट्स' : 'Market alerts and order updates'}
                </p>
              </div>
            </div>

            {notifications.filter((n) => !n.read).length > 0 && (
              <span className="text-[11px] font-black text-[#245C3A] bg-[#D6A63A] px-2.5 py-0.5 rounded-full">
                {notifications.filter((n) => !n.read).length} {isHi ? 'नए' : 'Unread'}
              </span>
            )}
          </div>

          <div className="space-y-2.5">
            {notifications.slice(0, 3).map((notif) => (
              <div
                key={notif.id}
                className="p-3 rounded-2xl bg-[#FBFAF4] border border-[#EEF3E8] flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-[#26332B] flex items-center gap-1.5">
                    {!notif.read && <span className="w-2 h-2 rounded-full bg-[#B86F4B]" />}
                    <span>{notif.title}</span>
                  </div>
                  <div className="text-[11px] text-[#68736B] line-clamp-2">{notif.message}</div>
                </div>
                <div className="text-[10px] text-gray-400 shrink-0 font-medium whitespace-nowrap">
                  {notif.timestamp}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-1 text-right">
            <button
              onClick={() => onSelectTab('notifications')}
              className="text-xs font-bold text-[#245C3A] hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>{isHi ? 'मेनू में "सूचनाएं" खोलें' : 'View all in Menu → Notifications'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>
      </div>

      {/* ========================================================================= */}
      {/* MODALS: QR PASSPORT & QR VERIFICATION                                    */}
      {/* ========================================================================= */}
      <CropQRPassportModal
        isOpen={isQRPassportOpen}
        onClose={() => setIsQRPassportOpen(false)}
        passportData={activePassportData}
        currentLanguage={currentLanguage}
      />

      <QRVerificationModal
        isOpen={isQRVerifyOpen}
        onClose={() => setIsQRVerifyOpen(false)}
        currentLanguage={currentLanguage}
      />
    </div>
  );
};
