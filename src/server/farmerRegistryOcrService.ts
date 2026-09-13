import { GoogleGenAI, Type } from '@google/genai';
import sharp from 'sharp';
import {
  FarmerRegistryExtractedData,
  FarmerRegistryComparisonField,
  FarmerRegistryOcrProcessResult,
  FarmerRegistryValidationStatus,
  FarmerSignupComparisonInput,
} from '../types/farmerRegistryOcr';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build-farmer-ocr',
        },
      },
    });
  }
  return aiClient;
}

/**
 * Mask Aadhaar for UI and logging to protect sensitive information
 * Formats: 12 digits -> XXXX-XXXX-1234 or XXXX XXXX 1234
 */
export function maskAadhaar(raw?: string | null): string {
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '');
  if (digits.length >= 4) {
    const last4 = digits.slice(-4);
    return `XXXX-XXXX-${last4}`;
  }
  return 'XXXX-XXXX-XXXX';
}

/**
 * Safe diagnostic logging for OCR operations.
 * NEVER logs full Aadhaar number, passwords, tokens or secrets.
 */
function logDiagnostic(step: string, details?: Record<string, any>) {
  const safeDetails: Record<string, any> = {};
  if (details) {
    for (const [key, val] of Object.entries(details)) {
      if (key.toLowerCase().includes('aadhaar')) {
        safeDetails[key] = maskAadhaar(String(val));
      } else if (
        key.toLowerCase().includes('password') ||
        key.toLowerCase().includes('secret') ||
        key.toLowerCase().includes('token') ||
        key.toLowerCase().includes('key') ||
        key.toLowerCase().includes('base64')
      ) {
        safeDetails[key] = '[REDACTED]';
      } else {
        safeDetails[key] = val;
      }
    }
  }
  console.log(`[OCR-DIAGNOSTIC] ${step}`, Object.keys(safeDetails).length > 0 ? safeDetails : '');
}

/**
 * Normalizes strings for comparison:
 * lowercase, trimmed, collapse internal spaces, removes punctuation
 */
export function normalizeText(str?: string | null): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Levenshtein distance for fuzzy string comparison
 */
function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

/**
 * Calculates string similarity between 0.0 and 1.0
 */
export function stringSimilarity(s1: string, s2: string): number {
  const n1 = normalizeText(s1);
  const n2 = normalizeText(s2);
  if (!n1 || !n2) return 0;
  if (n1 === n2) return 1;
  const maxLen = Math.max(n1.length, n2.length);
  if (maxLen === 0) return 1;
  const dist = levenshteinDistance(n1, n2);
  return (maxLen - dist) / maxLen;
}

/**
 * Strips common honorifics, titles, and relationship prefixes in English and Hindi
 */
function removeHonorifics(str: string): string {
  return str
    .replace(/\b(shri|shree|smt|shrimati|mr|mrs|ms|dr|late|c\/o|s\/o|w\/o|d\/o|so|wo|do|co)\b/gi, ' ')
    .replace(/\b(श्री|श्रीमती|स्व\.|आत्मज|सुपुत्र|सुपुत्री|पत्नी|पिता|पति)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Check if two names match using token set overlap, prefix/suffix handling & similarity threshold
 */
export function areNamesMatching(nameA?: string | null, nameB?: string | null): boolean {
  if (!nameA || !nameB) return false;
  const normA = normalizeText(nameA);
  const normB = normalizeText(nameB);

  if (!normA || !normB) return false;
  if (normA === normB) return true;

  const cleanA = removeHonorifics(normA);
  const cleanB = removeHonorifics(normB);
  if (!cleanA || !cleanB) return false;
  if (cleanA === cleanB) return true;

  // Check common Indian phonetic variant normalization (e.g. prashad vs prasad)
  const phoneticNorm = (s: string) =>
    s
      .replace(/prashad/g, 'prasad')
      .replace(/choudhary/g, 'chaudhary')
      .replace(/choudhry/g, 'chaudhary')
      .replace(/yadav/g, 'yadava')
      .replace(/varma/g, 'verma');

  if (phoneticNorm(cleanA) === phoneticNorm(cleanB)) {
    return true;
  }

  const tokensA = cleanA.split(' ').filter(Boolean);
  const tokensB = cleanB.split(' ').filter(Boolean);

  // Exact token subset match: when one name is a subset of the other (e.g. "Rahul" vs "Rahul Kumar")
  if (tokensA.length > 0 && tokensB.length > 0) {
    const setA = new Set(tokensA);
    const setB = new Set(tokensB);
    const allAInB = tokensA.every((t) => setB.has(t));
    const allBInA = tokensB.every((t) => setA.has(t));
    if (allAInB || allBInA) {
      return true;
    }
  }

  // Token-by-token comparison when number of tokens match
  if (tokensA.length === tokensB.length) {
    let matchCount = 0;
    for (let i = 0; i < tokensA.length; i++) {
      const tSim = stringSimilarity(tokensA[i], tokensB[i]);
      if (tSim >= 0.80) {
        matchCount++;
      }
    }
    if (matchCount === tokensA.length) {
      return true;
    }
  }

  // Similarity threshold on overall cleaned string only if first token is consistent
  if (tokensA.length > 0 && tokensB.length > 0) {
    const firstSim = stringSimilarity(tokensA[0], tokensB[0]);
    if (firstSim >= 0.80) {
      const sim = stringSimilarity(cleanA, cleanB);
      if (sim >= 0.85) return true;
    }
  }

  return false;
}

/**
 * Compare geographic entities (District / Tehsil / Village)
 */
function areLocationsMatching(locA?: string | null, locB?: string | null): boolean {
  if (!locA || !locB) return true; // If not provided, don't fail
  const normA = normalizeText(locA);
  const normB = normalizeText(locB);

  if (!normA || !normB) return true;
  if (normA === normB) return true;

  if (normA.includes(normB) || normB.includes(normA)) {
    return true;
  }

  return stringSimilarity(normA, normB) >= 0.75;
}

/**
 * Compare Aadhaar numbers (clean 12-digit or 4-digit suffix)
 */
export function areAadhaarMatching(aadhA?: string | null, aadhB?: string | null): boolean {
  if (!aadhA || !aadhB) return true;
  const cleanA = aadhA.replace(/\D/g, '');
  const cleanB = aadhB.replace(/\D/g, '');
  if (!cleanA || !cleanB) return true;
  if (cleanA === cleanB) return true;
  if (cleanA.length >= 4 && cleanB.length >= 4) {
    if (cleanA.endsWith(cleanB) || cleanB.endsWith(cleanA)) return true;
  }
  return false;
}

/**
 * Extract base64 payload and ensure clean MIME type
 */
function parseBase64Data(rawInput: string, providedMime?: string): { mimeType: string; base64: string } {
  let mimeType = providedMime || 'image/jpeg';
  let base64 = rawInput;

  const dataUriMatch = rawInput.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
  if (dataUriMatch) {
    mimeType = dataUriMatch[1];
    base64 = dataUriMatch[2];
  }

  if (mimeType.toLowerCase() === 'image/jpg') {
    mimeType = 'image/jpeg';
  }

  return { mimeType, base64: base64.trim() };
}

/**
 * Preprocess image with sharp:
 * - Auto-orients based on EXIF
 * - Resizes if max dimension > 1800px (preserves crystal clarity for text reading)
 * - Converts to standardized JPEG buffer
 */
async function preprocessImageBuffer(buffer: Buffer, originalMime: string): Promise<{ buffer: Buffer; mimeType: string }> {
  if (originalMime === 'application/pdf') {
    return { buffer, mimeType: 'application/pdf' };
  }

  try {
    let pipeline = sharp(buffer).rotate(); // auto orient
    const metadata = await sharp(buffer).metadata();
    const width = metadata.width || 0;
    const height = metadata.height || 0;

    if (width > 1800 || height > 1800) {
      pipeline = pipeline.resize({
        width: width >= height ? 1800 : undefined,
        height: height > width ? 1800 : undefined,
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    const processedBuffer = await pipeline.jpeg({ quality: 90 }).toBuffer();
    return { buffer: processedBuffer, mimeType: 'image/jpeg' };
  } catch (err) {
    // If sharp cannot process (e.g. unknown format), return original
    return { buffer, mimeType: originalMime };
  }
}

/**
 * Call Gemini models with resilient fallback and backoff on transient spikes (503 / 429)
 */
async function callGeminiVision(ai: GoogleGenAI, parts: any[]): Promise<string> {
  const models = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
  let lastError: any = null;

  for (let attempt = 0; attempt < models.length; attempt++) {
    const model = models[attempt];
    try {
      logDiagnostic('OCR request sent', { model, partsCount: parts.length });
      const response = await ai.models.generateContent({
        model,
        contents: [
          {
            role: 'user',
            parts,
          },
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isReadable: { type: Type.BOOLEAN },
              unreadableReason: { type: Type.STRING },
              isIdentityOrAadhaarDocument: { type: Type.BOOLEAN },
              sideDetected: { type: Type.STRING },
              aadhaarNumber: { type: Type.STRING },
              farmerNameEnglish: { type: Type.STRING },
              farmerNameHindi: { type: Type.STRING },
              fatherOrIdentifierName: { type: Type.STRING },
              fatherOrIdentifierNameHindi: { type: Type.STRING },
              dob: { type: Type.STRING },
              gender: { type: Type.STRING },
              address: { type: Type.STRING },
              state: { type: Type.STRING },
              district: { type: Type.STRING },
              tehsil: { type: Type.STRING },
              village: { type: Type.STRING },
              pincode: { type: Type.STRING },
              registryNumber: { type: Type.STRING },
              confidenceScore: { type: Type.NUMBER },
            },
            required: ['isReadable', 'isIdentityOrAadhaarDocument'],
          },
        },
      });

      logDiagnostic('OCR response received', { model });
      if (response.text) {
        return response.text;
      }
    } catch (err: any) {
      lastError = err;
      logDiagnostic(`Model ${model} failed, attempting fallback`, { status: err?.status || err?.message });
      // Brief pause before trying next model
      await new Promise((r) => setTimeout(r, 600));
    }
  }

  throw lastError || new Error('All vision models failed to process the document.');
}

/**
 * Main OCR & Document Validation Engine
 * Supports:
 * - Single document (Front or Back or Farmer Registry PDF)
 * - Dual documents (Front + Back of Aadhaar Card)
 */
export async function processFarmerRegistryDocument(
  rawDocument: string,
  fileName: string,
  fileSizeBytes: number,
  signupDetails: FarmerSignupComparisonInput,
  providedMime?: string,
  rawBackDocument?: string,
  backFileName?: string
): Promise<FarmerRegistryOcrProcessResult> {
  const DISCLAIMER =
    'दस्तावेज़ सत्यापन केवल अपलोड की गई प्रति से टेक्स्ट मिलान पर आधारित है। यह आधिकारिक सरकारी रिकॉर्ड्स की कानूनी पुष्टि नहीं करता है। (OCR validation compares document text only and does not constitute authoritative government certification).';

  logDiagnostic('OCR started', { fileName, fileSizeBytes });

  // 1. File Type and Size Quality Checks
  const { mimeType: frontMime, base64: frontBase64 } = parseBase64Data(rawDocument, providedMime);
  const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

  if (!allowedMimeTypes.includes(frontMime.toLowerCase())) {
    return {
      success: false,
      validationStatus: 'UNREADABLE',
      statusBadgeTextHi: 'अमान्य फ़ाइल प्रारूप',
      statusBadgeTextEn: 'Unsupported File Format',
      statusTitle: 'अमान्य फ़ाइल प्रारूप (Unsupported File)',
      statusMessage: 'कृपया केवल JPG, JPEG, PNG, WEBP या PDF प्रारूप में आधार कार्ड अपलोड करें।',
      warningMessage: '⚠️ केवल PDF, JPG, JPEG या PNG दस्तावेज़ स्वीकार्य हैं।',
      fileName,
      fileSizeFormatted: `${(fileSizeBytes / (1024 * 1024)).toFixed(2)} MB`,
      nameMatch: false,
      fatherNameMatch: false,
      aadhaarMatch: false,
      confidence: 0,
      error: `Unsupported file type ${frontMime}. Expected image or PDF.`,
      extractedData: {
        isFarmerRegistryDocument: false,
        isAadhaarDocument: false,
        isReadable: false,
        unreadableReason: `Unsupported file type ${frontMime}. Expected image or PDF.`,
        extractedAt: new Date().toISOString(),
      },
      comparisons: [],
      canProceed: false,
      disclaimer: DISCLAIMER,
    };
  }

  // 10 MB limit check
  const MAX_BYTES = 10 * 1024 * 1024;
  if (fileSizeBytes > MAX_BYTES) {
    return {
      success: false,
      validationStatus: 'UNREADABLE',
      statusBadgeTextHi: 'फ़ाइल बहुत बड़ी है',
      statusBadgeTextEn: 'File Too Large',
      statusTitle: 'दस्तावेज़ का आकार बहुत बड़ा है (File Size Exceeded)',
      statusMessage: 'फ़ाइल का आकार 10 MB से अधिक है। कृपया 10 MB से कम आकार का दस्तावेज़ अपलोड करें।',
      warningMessage: '⚠️ कृपया 10 MB से कम आकार का दस्तावेज़ अपलोड करें।',
      fileName,
      fileSizeFormatted: `${(fileSizeBytes / (1024 * 1024)).toFixed(2)} MB`,
      nameMatch: false,
      fatherNameMatch: false,
      aadhaarMatch: false,
      confidence: 0,
      error: 'File size exceeds maximum threshold of 10 MB.',
      extractedData: {
        isFarmerRegistryDocument: false,
        isAadhaarDocument: false,
        isReadable: false,
        unreadableReason: 'File size exceeds maximum threshold of 10 MB.',
        extractedAt: new Date().toISOString(),
      },
      comparisons: [],
      canProceed: false,
      disclaimer: DISCLAIMER,
    };
  }

  if (!frontBase64 || frontBase64.length < 50) {
    return {
      success: false,
      validationStatus: 'UNREADABLE',
      statusBadgeTextHi: 'दस्तावेज़ खाली या अमान्य है',
      statusBadgeTextEn: 'Empty or Corrupt File',
      statusTitle: 'दस्तावेज़ खाली या अमान्य है (Empty Document)',
      statusMessage: 'दस्तावेज़ में कोई डेटा नहीं मिला या फ़ाइल क्षतिग्रस्त है। कृपया साफ़ दस्तावेज़ दोबारा अपलोड करें।',
      warningMessage: '⚠️ कृपया वास्तविक आधार दस्तावेज़ अपलोड करें।',
      fileName,
      nameMatch: false,
      fatherNameMatch: false,
      aadhaarMatch: false,
      confidence: 0,
      error: 'Empty or truncated file content.',
      extractedData: {
        isFarmerRegistryDocument: false,
        isAadhaarDocument: false,
        isReadable: false,
        unreadableReason: 'Empty or truncated file content.',
        extractedAt: new Date().toISOString(),
      },
      comparisons: [],
      canProceed: false,
      disclaimer: DISCLAIMER,
    };
  }

  logDiagnostic('Image received and validated', { mimeType: frontMime });

  // 2. Prepare AI Client
  const ai = getAiClient();
  if (!ai) {
    return {
      success: false,
      validationStatus: 'UNREADABLE',
      statusBadgeTextHi: 'सेवा अनुपलब्ध',
      statusBadgeTextEn: 'OCR Service Unavailable',
      statusTitle: 'दस्तावेज़ पढ़ा नहीं जा सका (OCR Service Unavailable)',
      statusMessage: 'OCR सेवा वर्तमान में अनुपलब्ध है। कृपया बाद में पुनः प्रयास करें।',
      warningMessage: '⚠️ OCR सेवा क्रेडेंशियल सक्रिय नहीं हैं।',
      fileName,
      nameMatch: null,
      fatherNameMatch: null,
      aadhaarMatch: null,
      confidence: null,
      error: 'AI OCR service credentials not configured.',
      extractedData: {
        isFarmerRegistryDocument: false,
        isAadhaarDocument: false,
        isReadable: false,
        unreadableReason: 'AI OCR service credentials not active.',
        extractedAt: new Date().toISOString(),
      },
      comparisons: [],
      canProceed: false,
      disclaimer: DISCLAIMER,
    };
  }

  try {
    // 3. Preprocess Image(s) with Sharp for optimal clarity & EXIF orientation
    const frontBuffer = Buffer.from(frontBase64, 'base64');
    const { buffer: procFrontBuffer, mimeType: finalFrontMime } = await preprocessImageBuffer(frontBuffer, frontMime);

    const parts: any[] = [
      {
        inlineData: {
          mimeType: finalFrontMime,
          data: procFrontBuffer.toString('base64'),
        },
      },
    ];

    // Check if back document is also provided
    let hasBackDocument = false;
    if (rawBackDocument && rawBackDocument.length > 50) {
      const { mimeType: backMime, base64: backBase64 } = parseBase64Data(rawBackDocument);
      if (allowedMimeTypes.includes(backMime.toLowerCase())) {
        const backBuffer = Buffer.from(backBase64, 'base64');
        const { buffer: procBackBuffer, mimeType: finalBackMime } = await preprocessImageBuffer(backBuffer, backMime);
        parts.push({
          inlineData: {
            mimeType: finalBackMime,
            data: procBackBuffer.toString('base64'),
          },
        });
        hasBackDocument = true;
        logDiagnostic('Back image added to request', { mimeType: finalBackMime });
      }
    }

    const prompt = `You are a specialized Indian Identity & Agricultural Document OCR analyzer for KisanSetu.
Carefully read and analyze the attached document(s) (PDF or image).
${hasBackDocument ? 'Two images are provided: Aadhaar Front and Aadhaar Back.' : 'A single document/image is provided (Aadhaar Front, Aadhaar Back, or Farmer Registry record).'}

Reference Context:
1. Indian Aadhaar Card (UIDAI / आधार):
   - Government of India / Unique Identification Authority of India / भारत सरकार
   - Cardholder Name printed in both Hindi (Devanagari) and English (Latin)
   - 12-digit Aadhaar Number (format: XXXX XXXX XXXX or masked XXXX XXXX 1234)
   - Date of Birth (DOB) or Year of Birth (YOB)
   - Gender (पुरुष/MALE, महिला/FEMALE)
   - Father's / Husband's / Guardian's Name:
     * On back: preceded by "S/O:", "C/O:", "W/O:", "D/O:", or Hindi "आत्मज:", "सुपुत्र:", "पत्नी:"
     * On front (older cards): sometimes printed below or above the cardholder name
   - Address, District, Tehsil, State, Pincode
2. Farmer Registry / Enrolment Data (AgriStack / PM-KISAN):
   - Farmer Name in English & Local Language
   - Identifier Name (Father/Husband)
   - Enrolment Number, District, Village, Land details

Task Instructions:
1. isReadable: boolean. Set true if text is legible. Set false ONLY if image is completely blurry, completely dark, blank, or unintelligible.
2. unreadableReason: explain why text cannot be read if isReadable is false.
3. isIdentityOrAadhaarDocument: boolean. Set true if the document is an Indian Aadhaar Card (front or back) or Farmer Registry document. Set false if it is a random selfie, animal, landscape, car, receipt, or completely unrelated image.
4. sideDetected: 'front' | 'back' | 'both' | 'unknown'.
5. farmerNameEnglish: Cardholder's name in English script.
6. farmerNameHindi: Cardholder's name in Hindi / Devanagari script.
7. fatherOrIdentifierName: Father / Husband / Guardian name in English (from S/O, C/O, W/O, etc.).
8. fatherOrIdentifierNameHindi: Father / Husband / Guardian name in Hindi (from आत्मज, सुपुत्र, पत्नी, etc.).
9. aadhaarNumber: 12-digit Aadhaar number as printed (or 4-digit masked suffix if masked).
10. dob: Date of Birth as printed (e.g. DD/MM/YYYY or YYYY).
11. gender: Gender as printed (MALE, FEMALE, etc.).
12. address: Full address if present.
13. district: District name if present.
14. state: State name if present.
15. pincode: 6-digit postal pincode if present.
16. registryNumber: Registry / enrolment number if present.
17. confidenceScore: Readability confidence score between 0.0 and 1.0.

Strict Rules:
- Return empty strings for any fields not visible or not legible.
- Do NOT fabricate names or digits.
- Preserve original text and spelling exactly as printed.`;

    parts.push({ text: prompt });

    const rawResponseText = await callGeminiVision(ai, parts);
    const parsedJson = JSON.parse(rawResponseText || '{}');

    // Clean Aadhaar number: strip non-digits for raw
    const rawAadhaarDigits = (parsedJson.aadhaarNumber || '').replace(/\D/g, '');
    const cleanAadhaarRaw = rawAadhaarDigits.length === 12 ? rawAadhaarDigits : rawAadhaarDigits.length >= 4 ? rawAadhaarDigits : '';
    const maskedAadhaarDisplay = maskAadhaar(parsedJson.aadhaarNumber);

    const extractedData: FarmerRegistryExtractedData = {
      farmerNameEnglish: parsedJson.farmerNameEnglish?.trim() || '',
      farmerNameHindi: parsedJson.farmerNameHindi?.trim() || '',
      cardholderNameEnglish: parsedJson.farmerNameEnglish?.trim() || '',
      cardholderNameHindi: parsedJson.farmerNameHindi?.trim() || '',
      fatherOrIdentifierName: parsedJson.fatherOrIdentifierName?.trim() || '',
      fatherOrIdentifierNameHindi: parsedJson.fatherOrIdentifierNameHindi?.trim() || '',
      aadhaarNumber: maskedAadhaarDisplay || undefined,
      aadhaarNumberRaw: cleanAadhaarRaw || undefined,
      dob: parsedJson.dob?.trim() || '',
      gender: parsedJson.gender?.trim() || '',
      address: parsedJson.address?.trim() || '',
      registryNumber: parsedJson.registryNumber?.trim() || '',
      state: parsedJson.state?.trim() || '',
      district: parsedJson.district?.trim() || '',
      tehsil: parsedJson.tehsil?.trim() || '',
      village: parsedJson.village?.trim() || '',
      pincode: parsedJson.pincode?.trim() || '',
      landAreaTotal: '',
      landUnit: 'Hectare',
      khataOrSurveyNumber: '',
      isFarmerRegistryDocument: !!(parsedJson.isIdentityOrAadhaarDocument || parsedJson.isFarmerRegistryDocument),
      isAadhaarDocument: !!parsedJson.isIdentityOrAadhaarDocument,
      sideDetected: (parsedJson.sideDetected as any) || (hasBackDocument ? 'both' : 'front'),
      isReadable: !!parsedJson.isReadable,
      unreadableReason: parsedJson.unreadableReason?.trim() || '',
      confidenceScore: typeof parsedJson.confidenceScore === 'number' ? parsedJson.confidenceScore : 0.9,
      extractedAt: new Date().toISOString(),
    };

    logDiagnostic('Fields extracted', {
      isReadable: extractedData.isReadable,
      isIdentityDoc: extractedData.isAadhaarDocument,
      nameEnglish: extractedData.farmerNameEnglish,
      nameHindi: extractedData.farmerNameHindi,
      fatherEnglish: extractedData.fatherOrIdentifierName,
      aadhaarMasked: extractedData.aadhaarNumber,
    });

    // 4. Document Quality & Authenticity Check
    if (!extractedData.isReadable) {
      return {
        success: false,
        validationStatus: 'UNREADABLE',
        statusBadgeTextHi: 'दस्तावेज़ स्पष्ट नहीं है',
        statusBadgeTextEn: 'Document Unreadable',
        statusTitle: 'दस्तावेज़ स्पष्ट नहीं है (Document Unreadable)',
        statusMessage:
          'दस्तावेज़ की लिखावट स्पष्ट नहीं है। कृपया साफ़ फोटो या PDF दोबारा अपलोड करें। (Document text could not be read clearly. Please upload a clearer image).',
        warningMessage: '⚠️ कृपया अपनी वास्तविक आधार कार्ड की साफ़ फोटो अपलोड करें।',
        fileName,
        fileSizeFormatted: `${(fileSizeBytes / (1024 * 1024)).toFixed(2)} MB`,
        nameMatch: false,
        fatherNameMatch: false,
        aadhaarMatch: false,
        confidence: extractedData.confidenceScore || 0.2,
        error: extractedData.unreadableReason || 'Text on document is not readable.',
        extractedData,
        comparisons: [],
        canProceed: false,
        disclaimer: DISCLAIMER,
      };
    }

    if (!extractedData.isFarmerRegistryDocument) {
      return {
        success: false,
        validationStatus: 'SUSPICIOUS_REVIEW',
        statusBadgeTextHi: 'दस्तावेज़ संदिग्ध / अमान्य',
        statusBadgeTextEn: 'Suspicious / Unrecognized Document',
        statusTitle: 'दस्तावेज़ पहचान योग्य नहीं है (Unrecognized Document)',
        statusMessage:
          'अपलोड किया गया दस्तावेज़ आधार कार्ड या किसान पहचान पत्र प्रतीत नहीं होता है। कृपया वास्तविक आधार कार्ड अपलोड करें।',
        warningMessage: '⚠️ कृपया केवल वैध आधार कार्ड या किसान पहचान दस्तावेज़ अपलोड करें।',
        fileName,
        fileSizeFormatted: `${(fileSizeBytes / (1024 * 1024)).toFixed(2)} MB`,
        nameMatch: false,
        fatherNameMatch: false,
        aadhaarMatch: false,
        confidence: 0.1,
        error: 'Uploaded document is not an Indian Aadhaar or Farmer Registry document.',
        extractedData,
        comparisons: [],
        canProceed: false,
        disclaimer: DISCLAIMER,
      };
    }

    // 5. Compare OCR Data with Signup Data
    const comparisons: FarmerRegistryComparisonField[] = [];

    // Comparison 1: Name Match (English or Hindi)
    const ocrNameCombined = [extractedData.farmerNameEnglish, extractedData.farmerNameHindi].filter(Boolean).join(' / ');
    let isNameMatched = false;

    if (signupDetails.name && signupDetails.name.trim()) {
      isNameMatched =
        areNamesMatching(signupDetails.name, extractedData.farmerNameEnglish) ||
        areNamesMatching(signupDetails.name, extractedData.farmerNameHindi);

      comparisons.push({
        field: 'name',
        labelHi: 'नाम (Name as per Aadhaar)',
        labelEn: 'Name as per Aadhaar',
        signupValue: signupDetails.name,
        ocrValue: ocrNameCombined || '(दस्तावेज़ में नहीं मिला)',
        status: isNameMatched ? 'MATCH' : 'MISMATCH',
        notes: isNameMatched ? 'नाम का मिलान हुआ (Name matched)' : 'दस्तावेज़ में दर्ज नाम पंजीकरण नाम से भिन्न है (Name mismatch)',
      });
    } else {
      isNameMatched = true; // No name provided yet
      comparisons.push({
        field: 'name',
        labelHi: 'नाम (Name as per Aadhaar)',
        labelEn: 'Name as per Aadhaar',
        signupValue: 'पंजीकरण में स्वतः प्राप्त',
        ocrValue: ocrNameCombined || '(दस्तावेज़ में नहीं मिला)',
        status: 'DETECTED',
      });
    }

    // Comparison 2: Father's / Husband's Name Match
    const ocrFatherCombined = [extractedData.fatherOrIdentifierName, extractedData.fatherOrIdentifierNameHindi]
      .filter(Boolean)
      .join(' / ');
    let isFatherMatched: boolean | null = null;

    if (signupDetails.fatherName && signupDetails.fatherName.trim()) {
      if (extractedData.fatherOrIdentifierName || extractedData.fatherOrIdentifierNameHindi) {
        isFatherMatched =
          areNamesMatching(signupDetails.fatherName, extractedData.fatherOrIdentifierName) ||
          areNamesMatching(signupDetails.fatherName, extractedData.fatherOrIdentifierNameHindi);

        comparisons.push({
          field: 'fatherName',
          labelHi: 'पिता / पति का नाम (Father\'s Name)',
          labelEn: "Father's Name",
          signupValue: signupDetails.fatherName,
          ocrValue: ocrFatherCombined,
          status: isFatherMatched ? 'MATCH' : 'MISMATCH',
          notes: isFatherMatched ? 'पिता के नाम का मिलान हुआ' : 'दस्तावेज़ में भिन्न पिता का नाम है',
        });
      } else {
        // Document doesn't display father's name (e.g. only front of new Aadhaar)
        isFatherMatched = null;
        comparisons.push({
          field: 'fatherName',
          labelHi: 'पिता / पति का नाम (Father\'s Name)',
          labelEn: "Father's Name",
          signupValue: signupDetails.fatherName,
          ocrValue: '(आधार कार्ड के सामने भाग में उपलब्ध नहीं - पीछे का भाग अपलोड करें)',
          status: 'NOT_PROVIDED',
          notes: 'आधार बैक पर पिता का नाम उपलब्ध होता है',
        });
      }
    } else if (ocrFatherCombined) {
      comparisons.push({
        field: 'fatherName',
        labelHi: 'पिता / पति का नाम (Father\'s Name)',
        labelEn: "Father's Name",
        signupValue: 'पंजीकरण में नहीं भरा गया',
        ocrValue: ocrFatherCombined,
        status: 'DETECTED',
      });
    }

    // Comparison 3: Aadhaar Number Match
    let isAadhaarMatched: boolean | null = null;
    if (signupDetails.aadhaarNumber && signupDetails.aadhaarNumber.trim()) {
      if (cleanAadhaarRaw || maskedAadhaarDisplay) {
        isAadhaarMatched = areAadhaarMatching(signupDetails.aadhaarNumber, cleanAadhaarRaw || maskedAadhaarDisplay);
        comparisons.push({
          field: 'aadhaarNumber',
          labelHi: 'आधार संख्या (Aadhaar Number)',
          labelEn: 'Aadhaar Number',
          signupValue: maskAadhaar(signupDetails.aadhaarNumber),
          ocrValue: maskedAadhaarDisplay || '(दस्तावेज़ में नहीं मिला)',
          status: isAadhaarMatched ? 'MATCH' : 'MISMATCH',
          notes: isAadhaarMatched ? 'आधार संख्या का मिलान हुआ' : 'दस्तावेज़ में भिन्न आधार संख्या है',
        });
      } else {
        isAadhaarMatched = null;
        comparisons.push({
          field: 'aadhaarNumber',
          labelHi: 'आधार संख्या (Aadhaar Number)',
          labelEn: 'Aadhaar Number',
          signupValue: maskAadhaar(signupDetails.aadhaarNumber),
          ocrValue: '(दस्तावेज़ में संख्या स्पष्ट नहीं है)',
          status: 'NOT_PROVIDED',
        });
      }
    } else if (maskedAadhaarDisplay) {
      comparisons.push({
        field: 'aadhaarNumber',
        labelHi: 'आधार संख्या (Aadhaar Number)',
        labelEn: 'Aadhaar Number',
        signupValue: 'पंजीकरण में स्वतः प्राप्त',
        ocrValue: maskedAadhaarDisplay,
        status: 'DETECTED',
      });
    }

    // Comparison 4: District
    let isDistrictMatched = true;
    if (signupDetails.district && signupDetails.district.trim()) {
      isDistrictMatched = areLocationsMatching(signupDetails.district, extractedData.district);
      comparisons.push({
        field: 'district',
        labelHi: 'ज़िला (District)',
        labelEn: 'District',
        signupValue: signupDetails.district,
        ocrValue: extractedData.district || '(दस्तावेज़ में नहीं मिला)',
        status: isDistrictMatched ? 'MATCH' : 'MISMATCH',
      });
    }

    logDiagnostic('Name comparison completed', {
      isNameMatched,
      isFatherMatched,
      isAadhaarMatched,
    });

    // 6. Overall Validation Status Determination
    let validationStatus: FarmerRegistryValidationStatus = 'MATCHED';
    let statusBadgeTextHi = 'विवरण का मिलान हुआ';
    let statusBadgeTextEn = 'Document Information Matched';
    let statusTitle = 'दस्तावेज़ की जानकारी का मिलान हुआ (Document Information Matched)';
    let statusMessage = 'आधार कार्ड से आपका नाम और विवरण सफलतापूर्वक मिलान हुआ।';
    let warningMessage: string | undefined = undefined;
    let canProceed = true;

    // Check if there's a definite mismatch in entered values
    const hasNameMismatch = !isNameMatched;
    const hasAadhaarMismatch = isAadhaarMatched === false;
    const hasFatherMismatch = isFatherMatched === false;

    if (hasNameMismatch || hasAadhaarMismatch || hasFatherMismatch) {
      validationStatus = 'POSSIBLE_MISMATCH';
      statusBadgeTextHi = 'जानकारी में भिन्नता मिली';
      statusBadgeTextEn = 'Information Mismatch';
      statusTitle = 'दस्तावेज़ में दी गई जानकारी आपके द्वारा दी गई जानकारी से भिन्न है (Information Mismatch)';
      statusMessage =
        'कृपया सुनिश्चित करें कि दर्ज नाम, पिता का नाम और आधार संख्या आपके अपलोड किए गए आधार कार्ड से मेल खाती हो।';
      warningMessage = '⚠️ दर्ज नाम या विवरण आधार कार्ड से मेल नहीं खा रहा है। कृपया नाम सही करें या सही आधार कार्ड अपलोड करें।';
      canProceed = false;
    }

    return {
      success: true,
      validationStatus,
      statusBadgeTextHi,
      statusBadgeTextEn,
      statusTitle,
      statusMessage,
      warningMessage,
      fileName,
      fileSizeFormatted: `${(fileSizeBytes / (1024 * 1024)).toFixed(2)} MB`,
      extractedName: extractedData.farmerNameEnglish || extractedData.farmerNameHindi || '',
      extractedNameHindi: extractedData.farmerNameHindi || '',
      extractedFatherName: extractedData.fatherOrIdentifierName || extractedData.fatherOrIdentifierNameHindi || '',
      extractedFatherNameHindi: extractedData.fatherOrIdentifierNameHindi || '',
      extractedAadhaar: maskedAadhaarDisplay || '',
      extractedAadhaarRaw: cleanAadhaarRaw || '',
      nameMatch: isNameMatched,
      fatherNameMatch: isFatherMatched,
      aadhaarMatch: isAadhaarMatched,
      confidence: extractedData.confidenceScore || 0.92,
      error: null,
      extractedData,
      comparisons,
      canProceed,
      disclaimer: DISCLAIMER,
    };
  } catch (error: any) {
    logDiagnostic('OCR processing error caught', { error: error?.message });
    return {
      success: false,
      validationStatus: 'UNREADABLE',
      statusBadgeTextHi: 'दस्तावेज़ पढ़ा नहीं जा सका',
      statusBadgeTextEn: 'OCR Processing Error',
      statusTitle: 'दस्तावेज़ की जानकारी पढ़ी नहीं जा सकी (Processing Error)',
      statusMessage: 'दस्तावेज़ पढ़ने में तकनीकी समस्या हुई। कृपया साफ़ दस्तावेज़ दोबारा अपलोड करें।',
      warningMessage: '⚠️ कृपया अपनी वास्तविक आधार कार्ड की साफ़ फोटो अपलोड करें।',
      fileName,
      nameMatch: null,
      fatherNameMatch: null,
      aadhaarMatch: null,
      confidence: 0,
      error: error?.message || 'Unknown OCR processing error',
      extractedData: {
        isFarmerRegistryDocument: false,
        isAadhaarDocument: false,
        isReadable: false,
        unreadableReason: error?.message || 'Unknown OCR processing error',
        extractedAt: new Date().toISOString(),
      },
      comparisons: [],
      canProceed: false,
      disclaimer: DISCLAIMER,
    };
  }
}
