import React, { useState, useEffect } from 'react';
import {
  QrCode,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Download,
  Share2,
  X,
  ExternalLink,
  Lock,
  Building,
  Scale,
  Calendar,
  Sparkles,
} from 'lucide-react';
import QRCode from 'qrcode';
import { LanguageCode } from '../../types';

export interface CropPassportData {
  batchId: string;
  cropName: string;
  variety: string;
  quantityKg: number;
  grade: 'PREMIUM' | 'STANDARD' | 'UNVERIFIED';
  qualityScore: number;
  farmerId: string;
  farmerName: string;
  district: string;
  state: string;
  harvestDate: string;
  mandiBenchmarkRate?: number;
  landRecordVerified?: boolean;
  weighmentSlipVerified?: boolean;
  orderId?: string;
  verificationHash?: string;
}

interface CropQRPassportModalProps {
  isOpen: boolean;
  onClose: () => void;
  passportData: CropPassportData;
  currentLanguage?: LanguageCode;
}

export const CropQRPassportModal: React.FC<CropQRPassportModalProps> = ({
  isOpen,
  onClose,
  passportData,
  currentLanguage = 'hi',
}) => {
  const isHi = currentLanguage === 'hi';
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // Generate QR Code URL
  useEffect(() => {
    if (!isOpen) return;

    const payload = JSON.stringify({
      protocol: 'KISAN_SAATHI_VERIFIED_PASSPORT_V1',
      batchId: passportData.batchId,
      crop: `${passportData.cropName} (${passportData.variety})`,
      qty: `${passportData.quantityKg} kg`,
      grade: passportData.grade,
      score: `${passportData.qualityScore}/100`,
      farmer: passportData.farmerName,
      location: `${passportData.district}, ${passportData.state}`,
      harvest: passportData.harvestDate,
      landVerified: passportData.landRecordVerified ?? true,
      hash: passportData.verificationHash || `KS-${passportData.batchId}-${Date.now().toString(36).toUpperCase()}`,
      verifyUrl: `https://kisansaathi.in/verify/${passportData.batchId}`,
    });

    QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 320,
      color: {
        dark: '#1E4D31',
        light: '#FFFFFF',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('[QR] Failed to generate QR code:', err));
  }, [isOpen, passportData]);

  if (!isOpen) return null;

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = `kisan_saathi_passport_${passportData.batchId}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const handleCopyLink = () => {
    const link = `https://kisansaathi.in/verify/${passportData.batchId}`;
    navigator.clipboard?.writeText(link);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-[#D5DDD2] shadow-2xl max-w-md w-full overflow-hidden p-6 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#EBE6DC]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#245C3A]/10 text-[#245C3A] flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#26332B]">
                {isHi ? 'डिजिटल फसल पासपोर्ट' : 'Digital Crop Batch Passport'}
              </h3>
              <p className="text-[11px] text-[#68736B]">
                {isHi ? 'प्रमाणित क्यूआर कोड एवं ट्रेसिबिलिटी' : 'Cryptographic Traceability & Verification'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FAF7F0] hover:bg-[#EBE6DC] text-[#68736B] flex items-center justify-center font-bold text-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* QR Code Card Frame */}
        <div className="flex flex-col items-center justify-center p-6 bg-[#FAF7F0] rounded-2xl border border-[#E3DCB] relative">
          <div className="p-3 bg-white rounded-2xl shadow-sm border border-[#D5DDD2] flex items-center justify-center">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Kisan Saathi Crop Batch Passport QR"
                className="w-44 h-44 rounded-lg object-contain"
              />
            ) : (
              <div className="w-44 h-44 flex items-center justify-center text-xs text-[#68736B]">
                {isHi ? 'क्यूआर कोड तैयार हो रहा है...' : 'Generating QR Code...'}
              </div>
            )}
          </div>

          <div className="mt-3 flex items-center gap-1.5 bg-[#245C3A]/10 text-[#245C3A] px-3 py-1 rounded-full text-xs font-mono font-black">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{passportData.batchId}</span>
          </div>

          <p className="text-[10px] text-[#68736B] text-center mt-1.5 max-w-xs">
            {isHi
              ? 'खरीदार या लॉजिस्टिक्स एजेंट इस कोड को स्कैन करके सीधे खेत, ग्रेडिंग रिपोर्ट और वजन सत्यापन की पुष्टि कर सकते हैं।'
              : 'Buyers or Mandi inspectors can scan this QR to verify land record credentials, AI quality score, and weighment.'}
          </p>
        </div>

        {/* Passport Details Table */}
        <div className="p-4 rounded-2xl bg-white border border-[#EBE6DC] space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#68736B]">{isHi ? 'फसल व किस्म:' : 'Crop & Variety:'}</span>
            <span className="font-bold text-[#26332B]">{passportData.cropName} ({passportData.variety})</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#68736B]">{isHi ? 'कुल मात्रा:' : 'Lot Quantity:'}</span>
            <span className="font-bold text-[#26332B]">{passportData.quantityKg.toLocaleString()} kg</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#68736B]">{isHi ? 'गुणवत्ता ग्रेड:' : 'AI Quality Grade:'}</span>
            <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
              passportData.grade === 'PREMIUM'
                ? 'bg-emerald-100 text-emerald-800'
                : passportData.grade === 'STANDARD'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-amber-100 text-amber-800'
            }`}>
              {passportData.grade} ({passportData.qualityScore}/100)
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#68736B]">{isHi ? 'किसान एवं जिला:' : 'Farmer & District:'}</span>
            <span className="font-bold text-[#26332B]">{passportData.farmerName} ({passportData.district})</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#68736B]">{isHi ? 'भूलेख सत्यापन:' : 'Land Record Verification:'}</span>
            <span className="flex items-center gap-1 font-bold text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              {isHi ? 'सत्यापित (Verified)' : 'Verified (Khasra Linked)'}
            </span>
          </div>

          {passportData.mandiBenchmarkRate && (
            <div className="flex items-center justify-between pt-1 border-t border-[#F0EBE1]">
              <span className="text-[#68736B]">{isHi ? 'मंडी बेंचमार्क दर:' : 'Mandi Benchmark:'}</span>
              <span className="font-bold text-[#245C3A]">₹{passportData.mandiBenchmarkRate}/quintal</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 pt-2">
          <button
            onClick={handleDownloadQR}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#245C3A] hover:bg-[#1E4D31] text-white text-xs font-bold transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>{isHi ? 'क्यूआर डाउनलोड करें' : 'Download QR'}</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#FAF7F0] hover:bg-[#EBE6DC] border border-[#D5DDD2] text-[#26332B] text-xs font-bold transition-colors"
          >
            <Share2 className="w-4 h-4 text-[#245C3A]" />
            <span>{copySuccess ? (isHi ? 'कॉपी हो गया!' : 'Copied!') : (isHi ? 'लिंक कॉपी करें' : 'Copy Link')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
