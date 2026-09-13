import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Info,
  Check,
  Camera,
} from 'lucide-react';
import {
  FarmerRegistryOcrProcessResult,
} from '../../types/farmerRegistryOcr';
import { processFarmerRegistryOcrApi } from '../../services/authApiService';
import { LanguageCode } from '../../types';

interface AadhaarOcrUploadCardProps {
  currentLanguage: LanguageCode;
  enteredName: string;
  enteredFatherName: string;
  enteredAadhaar: string;
  onFrontUploaded: (fileDataUrl: string, fileName: string, ocrResult: FarmerRegistryOcrProcessResult | null) => void;
  onBackUploaded: (fileDataUrl: string, fileName: string) => void;
  onApplyDetails: (details: { name?: string; fatherName?: string; aadhaarNumber?: string }) => void;
}

/**
 * Compresses oversized camera images client-side before network upload
 */
async function compressImageIfNeeded(file: File): Promise<{ base64: string; sizeBytes: number; mimeType: string }> {
  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ base64: reader.result as string, sizeBytes: file.size, mimeType: 'application/pdf' });
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 1600;
        let width = img.width;
        let height = img.height;

        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
          resolve({
            base64: compressedDataUrl,
            sizeBytes: Math.round((compressedDataUrl.length * 3) / 4),
            mimeType: 'image/jpeg',
          });
          return;
        }
        resolve({ base64: e.target?.result as string, sizeBytes: file.size, mimeType: file.type || 'image/jpeg' });
      };
      img.onerror = () => {
        resolve({ base64: e.target?.result as string, sizeBytes: file.size, mimeType: file.type || 'image/jpeg' });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export const AadhaarOcrUploadCard: React.FC<AadhaarOcrUploadCardProps> = ({
  currentLanguage,
  enteredName,
  enteredFatherName,
  enteredAadhaar,
  onFrontUploaded,
  onBackUploaded,
  onApplyDetails,
}) => {
  const isHi = currentLanguage === 'hi' || currentLanguage === 'hr';

  // Front file & OCR state
  const [frontFile, setFrontFile] = useState<{
    name: string;
    sizeFormatted: string;
    dataUrl: string;
    sizeBytes: number;
    mimeType: string;
  } | null>(null);

  // Back file state
  const [backFile, setBackFile] = useState<{
    name: string;
    sizeFormatted: string;
    dataUrl: string;
    sizeBytes: number;
    mimeType: string;
  } | null>(null);

  const [ocrStatus, setOcrStatus] = useState<'idle' | 'reading' | 'complete' | 'error'>('idle');
  const [ocrResult, setOcrResult] = useState<FarmerRegistryOcrProcessResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [justApplied, setJustApplied] = useState(false);

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  // Core runner: triggers OCR whenever front or back is selected/updated
  const triggerOcrProcessing = async (
    targetFront: { dataUrl: string; name: string; sizeBytes: number; mimeType: string } | null,
    targetBack: { dataUrl: string; name: string; sizeBytes: number; mimeType: string } | null
  ) => {
    if (!targetFront && !targetBack) return;

    setOcrStatus('reading');
    setErrorMessage(null);

    try {
      const result = await processFarmerRegistryOcrApi({
        frontDocumentBase64: targetFront?.dataUrl,
        frontFileName: targetFront?.name,
        backDocumentBase64: targetBack?.dataUrl,
        backFileName: targetBack?.name,
        fileSizeBytes: (targetFront?.sizeBytes || 0) + (targetBack?.sizeBytes || 0),
        mimeType: targetFront?.mimeType || targetBack?.mimeType || 'image/jpeg',
        signupDetails: {
          name: enteredName || '',
          fatherName: enteredFatherName || '',
          aadhaarNumber: enteredAadhaar || '',
        },
      });

      setOcrStatus('complete');
      setOcrResult(result);

      if (targetFront) {
        onFrontUploaded(targetFront.dataUrl, targetFront.name, result);
      }

      // Auto-fill form fields if they are currently blank
      const ext = result.extractedData;
      const candidateName = ext?.farmerNameEnglish || ext?.farmerNameHindi;
      const candidateFather = ext?.fatherOrIdentifierName || ext?.fatherOrIdentifierNameHindi;
      const candidateAadhaar = ext?.aadhaarNumberRaw || ext?.aadhaarNumber;

      if ((!enteredName && candidateName) || (!enteredFatherName && candidateFather) || (!enteredAadhaar && candidateAadhaar)) {
        onApplyDetails({
          name: !enteredName ? candidateName : undefined,
          fatherName: !enteredFatherName ? candidateFather : undefined,
          aadhaarNumber: !enteredAadhaar ? candidateAadhaar : undefined,
        });
      }
    } catch (err: any) {
      setOcrStatus('error');
      setErrorMessage(err?.message || (isHi ? 'OCR प्रक्रिया में त्रुटि हुई।' : 'OCR processing failed.'));
      if (targetFront) {
        onFrontUploaded(targetFront.dataUrl, targetFront.name, null);
      }
    }
  };

  // Handle Front selection
  const handleFrontSelect = async (file: File) => {
    setErrorMessage(null);
    const validExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'webp'];
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!validExtensions.includes(ext || '')) {
      setErrorMessage(isHi ? 'कृपया JPG, PNG, WEBP या PDF फ़ाइल चुनें।' : 'Please select JPG, PNG, WEBP or PDF file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage(isHi ? 'फ़ाइल 10 MB से कम होनी चाहिए।' : 'File must be under 10 MB.');
      return;
    }

    try {
      const compressed = await compressImageIfNeeded(file);
      const fileInfo = {
        name: file.name,
        sizeFormatted: `${(compressed.sizeBytes / (1024 * 1024)).toFixed(2)} MB`,
        dataUrl: compressed.base64,
        sizeBytes: compressed.sizeBytes,
        mimeType: compressed.mimeType,
      };
      setFrontFile(fileInfo);
      await triggerOcrProcessing(fileInfo, backFile);
    } catch (err: any) {
      setErrorMessage(isHi ? 'फ़ाइल पढ़ने में समस्या हुई।' : 'Failed to read file.');
    }
  };

  // Handle Back selection
  const handleBackSelect = async (file: File) => {
    setErrorMessage(null);
    const validExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'webp'];
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!validExtensions.includes(ext || '')) {
      setErrorMessage(isHi ? 'कृपया JPG, PNG, WEBP या PDF फ़ाइल चुनें।' : 'Please select JPG, PNG, WEBP or PDF file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage(isHi ? 'फ़ाइल 10 MB से कम होनी चाहिए।' : 'File must be under 10 MB.');
      return;
    }

    try {
      const compressed = await compressImageIfNeeded(file);
      const fileInfo = {
        name: file.name,
        sizeFormatted: `${(compressed.sizeBytes / (1024 * 1024)).toFixed(2)} MB`,
        dataUrl: compressed.base64,
        sizeBytes: compressed.sizeBytes,
        mimeType: compressed.mimeType,
      };
      setBackFile(fileInfo);
      onBackUploaded(fileInfo.dataUrl, fileInfo.name);

      // Re-trigger OCR with both front and back images for unified extraction
      await triggerOcrProcessing(frontFile, fileInfo);
    } catch (err: any) {
      setErrorMessage(isHi ? 'फ़ाइल पढ़ने में समस्या हुई।' : 'Failed to read file.');
    }
  };

  const handleApplyClick = () => {
    if (!ocrResult?.extractedData) return;
    const ext = ocrResult.extractedData;
    const candidateName = ext.farmerNameEnglish || ext.farmerNameHindi;
    const candidateFather = ext.fatherOrIdentifierName || ext.fatherOrIdentifierNameHindi;
    const candidateAadhaar = ext.aadhaarNumberRaw || ext.aadhaarNumber;

    onApplyDetails({
      name: candidateName || undefined,
      fatherName: candidateFather || undefined,
      aadhaarNumber: candidateAadhaar || undefined,
    });

    setJustApplied(true);
    setTimeout(() => setJustApplied(false), 2500);
  };

  const extractedData = ocrResult?.extractedData;
  const ocrName = extractedData?.farmerNameEnglish || extractedData?.farmerNameHindi;
  const ocrFather = extractedData?.fatherOrIdentifierName || extractedData?.fatherOrIdentifierNameHindi;
  const ocrAadhaar = extractedData?.aadhaarNumber;

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4 shadow-xs">
      {/* Header Banner */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold text-xs">
            UID
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900">
              {isHi ? 'आधार कार्ड सत्यापन (Aadhaar OCR Verification)' : 'Aadhaar Card Verification (OCR)'}
            </h4>
            <p className="text-[11px] text-gray-500">
              {isHi
                ? 'आधार कार्ड का आगे और पीछे का भाग अपलोड करें'
                : 'Upload front & back side of Aadhaar card for instant verification'}
            </p>
          </div>
        </div>
        <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          <ShieldCheck className="w-3 h-3 text-emerald-600" />
          {isHi ? 'स्मार्ट OCR तकनीक' : 'Smart OCR Engine'}
        </div>
      </div>

      {/* Step Guide Badges */}
      <div className="flex items-center gap-2 text-[11px] text-gray-600 bg-white p-2 rounded-xl border border-gray-100">
        <span className="inline-flex items-center gap-1 font-semibold text-emerald-800">
          <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 text-[10px] flex items-center justify-center font-bold">
            1
          </span>
          {isHi ? 'सामने का भाग' : 'Front'}
        </span>
        <span className="text-gray-300">→</span>
        <span className="inline-flex items-center gap-1 font-semibold text-emerald-800">
          <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 text-[10px] flex items-center justify-center font-bold">
            2
          </span>
          {isHi ? 'पीछे का भाग' : 'Back'}
        </span>
        <span className="text-gray-300">→</span>
        <span className="inline-flex items-center gap-1 font-semibold text-emerald-800">
          <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 text-[10px] flex items-center justify-center font-bold">
            3
          </span>
          {isHi ? 'मिलान व सत्यापन' : 'Verify'}
        </span>
      </div>

      {/* Grid: 8. Upload Front & 9. Upload Back */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* 8. Front Side */}
        <div className="bg-white p-3 rounded-xl border border-gray-200 hover:border-emerald-300 transition-colors flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-800">
                8. {isHi ? 'आधार कार्ड - सामने का भाग (Front)' : 'Aadhaar Front'} *
              </span>
              {ocrStatus === 'reading' && !frontFile ? null : ocrStatus === 'reading' ? (
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                  <Loader2 className="w-3 h-3 animate-spin" /> {isHi ? 'पढ़ रहा है...' : 'Scanning...'}
                </span>
              ) : frontFile ? (
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {isHi ? 'अपलोड हुआ' : 'Uploaded'}
                </span>
              ) : null}
            </div>

            <input
              ref={frontInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf"
              onChange={(e) => {
                if (e.target.files?.[0]) handleFrontSelect(e.target.files[0]);
              }}
              className="hidden"
            />

            {!frontFile ? (
              <div
                onClick={() => frontInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 hover:border-emerald-500 rounded-xl p-3 text-center cursor-pointer bg-slate-50/50 hover:bg-emerald-50/30 transition-all flex flex-col items-center justify-center min-h-[95px]"
              >
                <UploadCloud className="w-6 h-6 text-gray-400 mb-1" />
                <span className="text-xs font-medium text-gray-700">
                  {isHi ? 'आधार फ्रंट अपलोड करें' : 'Upload Aadhaar Front'}
                </span>
                <span className="text-[10px] text-gray-400">JPG, PNG, PDF (Max 10MB)</span>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg border border-slate-200">
                {frontFile.dataUrl.startsWith('data:image/') ? (
                  <img
                    src={frontFile.dataUrl}
                    alt="Aadhaar Front"
                    className="w-12 h-12 object-cover rounded-md border border-gray-200"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-md bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
                    PDF
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">{frontFile.name}</p>
                  <p className="text-[10px] text-gray-500">{frontFile.sizeFormatted}</p>
                </div>
                <button
                  type="button"
                  onClick={() => frontInputRef.current?.click()}
                  className="text-[11px] text-emerald-700 hover:underline font-semibold"
                >
                  {isHi ? 'बदलें' : 'Change'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 9. Back Side */}
        <div className="bg-white p-3 rounded-xl border border-gray-200 hover:border-emerald-300 transition-colors flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-800">
                9. {isHi ? 'आधार कार्ड - पीछे का भाग (Back)' : 'Aadhaar Back'}
              </span>
              {backFile ? (
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {isHi ? 'अपलोड हुआ' : 'Uploaded'}
                </span>
              ) : (
                <span className="text-[10px] text-gray-400">{isHi ? 'पिता/पते हेतु' : 'For Father/Address'}</span>
              )}
            </div>

            <input
              ref={backInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf"
              onChange={(e) => {
                if (e.target.files?.[0]) handleBackSelect(e.target.files[0]);
              }}
              className="hidden"
            />

            {!backFile ? (
              <div
                onClick={() => backInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 hover:border-emerald-500 rounded-xl p-3 text-center cursor-pointer bg-slate-50/50 hover:bg-emerald-50/30 transition-all flex flex-col items-center justify-center min-h-[95px]"
              >
                <UploadCloud className="w-6 h-6 text-gray-400 mb-1" />
                <span className="text-xs font-medium text-gray-700">
                  {isHi ? 'आधार बैक अपलोड करें' : 'Upload Aadhaar Back'}
                </span>
                <span className="text-[10px] text-gray-400">JPG, PNG, PDF (Max 10MB)</span>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg border border-slate-200">
                {backFile.dataUrl.startsWith('data:image/') ? (
                  <img
                    src={backFile.dataUrl}
                    alt="Aadhaar Back"
                    className="w-12 h-12 object-cover rounded-md border border-gray-200"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-md bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
                    PDF
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">{backFile.name}</p>
                  <p className="text-[10px] text-gray-500">{backFile.sizeFormatted}</p>
                </div>
                <button
                  type="button"
                  onClick={() => backInputRef.current?.click()}
                  className="text-[11px] text-emerald-700 hover:underline font-semibold"
                >
                  {isHi ? 'बदलें' : 'Change'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Manual Re-Scan / Retry Button if both or either selected */}
      {(frontFile || backFile) && (
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            disabled={ocrStatus === 'reading'}
            onClick={() => triggerOcrProcessing(frontFile, backFile)}
            className="inline-flex items-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${ocrStatus === 'reading' ? 'animate-spin' : ''}`} />
            {isHi ? 'दोबारा स्कैन करें (Re-Scan OCR)' : 'Re-Scan Documents'}
          </button>
          {ocrStatus === 'reading' && (
            <span className="text-xs text-emerald-700 font-medium animate-pulse flex items-center gap-1">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              {isHi ? 'दस्तावेज़ पढ़ा जा रहा है...' : 'Analyzing document with Gemini OCR...'}
            </span>
          )}
        </div>
      )}

      {/* Global Error Banner */}
      {errorMessage && (
        <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
          <div>
            <p className="font-semibold">{isHi ? 'त्रुटि (Error)' : 'Error'}</p>
            <p className="text-[11px] text-red-600">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Extracted Details & 1-Click Apply */}
      {ocrResult && ocrResult.extractedData && (
        <div className="p-3.5 bg-white rounded-xl border border-emerald-200 shadow-sm space-y-3">
          {/* Header of extracted section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              {isHi ? 'आधार से पहचानी गई जानकारी' : 'Details Detected from Aadhaar'}
            </div>
            {(ocrName || ocrFather || ocrAadhaar) && (
              <button
                type="button"
                onClick={handleApplyClick}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                {justApplied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    {isHi ? 'भर दिया गया!' : 'Applied!'}
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    {isHi ? 'फॉर्म में भरें (Apply to Form)' : 'Apply to Form'}
                  </>
                )}
              </button>
            )}
          </div>

          {/* Key Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            {/* Field 1: Name */}
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-gray-500 font-medium">{isHi ? 'आधार नाम:' : 'Aadhaar Name:'}</span>
                  {ocrResult.nameMatch === true && (
                    <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-0.5">
                      ✓ {isHi ? 'मेल' : 'Match'}
                    </span>
                  )}
                  {ocrResult.nameMatch === false && enteredName && (
                    <span className="text-[10px] text-amber-700 font-bold flex items-center gap-0.5">
                      ⚠️ {isHi ? 'भिन्न' : 'Mismatch'}
                    </span>
                  )}
                </div>
                <p className="font-semibold text-gray-900 leading-tight">
                  {ocrName || <span className="text-gray-400 italic">{isHi ? 'दस्तावेज़ में नहीं मिला' : 'Not detected'}</span>}
                </p>
                {extractedData.farmerNameHindi && extractedData.farmerNameEnglish && (
                  <p className="text-[11px] text-gray-500 mt-0.5">{extractedData.farmerNameHindi}</p>
                )}
              </div>
            </div>

            {/* Field 2: Father Name */}
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-gray-500 font-medium">{isHi ? 'पिता/पति का नाम:' : "Father's Name:"}</span>
                  {ocrResult.fatherNameMatch === true && (
                    <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-0.5">
                      ✓ {isHi ? 'मेल' : 'Match'}
                    </span>
                  )}
                  {ocrResult.fatherNameMatch === false && enteredFatherName && (
                    <span className="text-[10px] text-amber-700 font-bold flex items-center gap-0.5">
                      ⚠️ {isHi ? 'भिन्न' : 'Mismatch'}
                    </span>
                  )}
                  {ocrResult.fatherNameMatch === null && !ocrFather && (
                    <span className="text-[10px] text-gray-400">
                      {isHi ? 'बैक अपलोड करें' : 'Upload Back'}
                    </span>
                  )}
                </div>
                <p className="font-semibold text-gray-900 leading-tight">
                  {ocrFather || (
                    <span className="text-gray-400 italic text-[11px]">
                      {isHi ? 'पीछे का भाग अपलोड करें' : 'Upload back side'}
                    </span>
                  )}
                </p>
                {extractedData.fatherOrIdentifierNameHindi && (
                  <p className="text-[11px] text-gray-500 mt-0.5">{extractedData.fatherOrIdentifierNameHindi}</p>
                )}
              </div>
            </div>

            {/* Field 3: Aadhaar Number */}
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-gray-500 font-medium">{isHi ? 'आधार संख्या:' : 'Aadhaar No:'}</span>
                  {ocrResult.aadhaarMatch === true && (
                    <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-0.5">
                      ✓ {isHi ? 'मेल' : 'Match'}
                    </span>
                  )}
                  {ocrResult.aadhaarMatch === false && enteredAadhaar && (
                    <span className="text-[10px] text-amber-700 font-bold flex items-center gap-0.5">
                      ⚠️ {isHi ? 'भिन्न' : 'Mismatch'}
                    </span>
                  )}
                </div>
                <p className="font-mono font-bold text-gray-900 tracking-wider">
                  {ocrAadhaar || <span className="text-gray-400 italic font-sans">{isHi ? 'पहचान नहीं हुई' : 'Not detected'}</span>}
                </p>
                <span className="text-[10px] text-gray-400 block mt-0.5">
                  {isHi ? 'सुरक्षित मास्क प्रारूप' : 'Masked format'}
                </span>
              </div>
            </div>
          </div>

          {/* Validation Status Card */}
          {ocrResult.validationStatus === 'MATCHED' && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{ocrResult.statusTitle || (isHi ? 'दस्तावेज़ की जानकारी का मिलान हुआ' : 'Document Information Matched')}</p>
                <p className="text-[11px] text-emerald-800">
                  {ocrResult.statusMessage || (isHi ? 'आधार कार्ड से आपका विवरण सफलतापूर्वक मिलान हुआ।' : 'Aadhaar information successfully matched.')}
                </p>
              </div>
            </div>
          )}

          {ocrResult.validationStatus === 'POSSIBLE_MISMATCH' && (
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{isHi ? 'नाम या विवरण में भिन्नता मिली (Information Mismatch)' : 'Information Mismatch'}</p>
                <p className="text-[11px] text-amber-800">
                  {ocrResult.warningMessage ||
                    (isHi
                      ? 'कृपया सुनिश्चित करें कि दर्ज नाम आपके आधार कार्ड के नाम से मेल खाता हो। आप "फॉर्म में भरें" बटन पर क्लिक करके आधार वाला नाम उपयोग कर सकते हैं।'
                      : 'Entered name does not match Aadhaar. Click "Apply to Form" to use the name from Aadhaar.')}
                </p>
              </div>
            </div>
          )}

          {ocrResult.validationStatus === 'UNREADABLE' && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 flex items-start gap-2">
              <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{isHi ? 'दस्तावेज़ स्पष्ट नहीं है (Document Unreadable)' : 'Document Unreadable'}</p>
                <p className="text-[11px] text-red-800">
                  {ocrResult.statusMessage ||
                    (isHi
                      ? 'दस्तावेज़ की लिखावट स्पष्ट नहीं है। कृपया साफ़ फोटो दोबारा अपलोड करें।'
                      : 'Document text could not be read clearly. Please upload a clearer photo.')}
                </p>
              </div>
            </div>
          )}

          {ocrResult.validationStatus === 'SUSPICIOUS_REVIEW' && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{isHi ? 'दस्तावेज़ अमान्य (Unrecognized Document)' : 'Unrecognized Document'}</p>
                <p className="text-[11px] text-red-800">
                  {isHi
                    ? 'अपलोड किया गया दस्तावेज़ आधार कार्ड प्रतीत नहीं होता है। कृपया वास्तविक आधार कार्ड की फोटो अपलोड करें।'
                    : 'Uploaded file does not appear to be an Aadhaar card. Please upload a valid Aadhaar document.'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Security notice */}
      <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
        <Info className="w-3.5 h-3.5 shrink-0 text-gray-400" />
        <span>
          {isHi
            ? 'दस्तावेज़ सत्यापन केवल अपलोड की गई प्रति से टेक्स्ट मिलान पर आधारित है। आधार डेटा सुरक्षित रहता है।'
            : 'Validation compares document text for registration. Aadhaar data is encrypted and secure.'}
        </span>
      </div>
    </div>
  );
};
