import { GoogleGenAI, Type } from '@google/genai';

export interface AiGradingRequest {
  images: string[]; // Base64 data URLs or standard base64 strings
  cropName?: string;
  variety?: string;
  category?: string;
  language?: 'en' | 'hi';
}

export interface CropCharacteristics {
  grainLuster: string;
  uniformity: string;
  cleanliness: string;
  foreignParticles: string;
  color: string;
  damageLevel: string;
}

export interface AiGradingResponse {
  success: boolean;
  isReliable: boolean;
  unreliableReason?: string;
  detectedCrop: string;
  detectedVariety: string;
  classification: 'PREMIUM' | 'STANDARD' | 'UNVERIFIED';
  grade: 'PREMIUM' | 'STANDARD' | 'UNVERIFIED' | 'A' | 'B' | 'C';
  isManual?: boolean;
  confidence?: number;
  confidenceScore?: number;
  grainUniformityScore?: number;
  cropCharacteristics?: CropCharacteristics;
  gradeExplanation?: string;
  detectedFeatures?: string[];
  summaryText?: string;
  visualIndicators: string[];
  potentialIssues: string[];
  recommendation: string;
  observations: string;
  qualityFactors?: {
    uniformity: number; // 0 - 100
    cleanliness: number; // 0 - 100
    colorVibrancy: number; // 0 - 100
    damageLevel: 'Low' | 'Moderate' | 'High';
  };
  disclaimer: string;
  timestamp: string;
}

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
  if (!aiClient && apiKey) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

/**
 * Extracts pure base64 data and mimeType from data URL, HTTP/HTTPS URL, or raw base64 string
 */
async function prepareImagePayload(imageStr: string): Promise<{ mimeType: string; data: string } | null> {
  if (!imageStr || typeof imageStr !== 'string') return null;
  const trimmed = imageStr.trim();

  // 1. Data URL (e.g. data:image/jpeg;base64,...)
  const match = trimmed.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
  if (match) {
    return { mimeType: match[1], data: match[2] };
  }

  // 2. HTTP / HTTPS URL (Fetch buffer and convert to base64)
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const response = await fetch(trimmed);
      if (!response.ok) return null;
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const contentType = response.headers.get('content-type') || 'image/jpeg';
      const mimeType = contentType.split(';')[0].trim() || 'image/jpeg';
      return {
        mimeType,
        data: buffer.toString('base64'),
      };
    } catch (e) {
      console.warn('[AI Crop Grading] Failed to fetch remote image URL:', trimmed, e);
      return null;
    }
  }

  // 3. Raw base64 string
  const cleaned = trimmed.replace(/\s+/g, '');
  if (/^[A-Za-z0-9+/=]+$/.test(cleaned) && cleaned.length > 50) {
    return { mimeType: 'image/jpeg', data: cleaned };
  }

  return null;
}

export async function gradeCropImage(req: AiGradingRequest): Promise<AiGradingResponse> {
  const { images, cropName = '', variety = '', language = 'en' } = req;
  const isHindi = language === 'hi';
  const timestamp = new Date().toISOString();

  if (!images || images.length === 0) {
    return {
      success: false,
      isReliable: false,
      unreliableReason: isHindi
        ? 'कृपया फसल की गुणवत्ता विश्लेषण के लिए कैमरे से फोटो लें।'
        : 'Please capture a crop photo for quality assessment.',
      detectedCrop: cropName || 'Unknown',
      detectedVariety: variety || 'Standard',
      classification: 'UNVERIFIED',
      grade: 'UNVERIFIED',
      visualIndicators: [],
      potentialIssues: [isHindi ? 'कोई फोटो उपलब्ध नहीं' : 'No photo provided'],
      recommendation: isHindi ? 'कैमरे से फोटो लें' : 'Capture photo for analysis',
      observations: '',
      disclaimer: isHindi
        ? 'गुणवत्ता मूल्यांकन कैमरे द्वारा खींची गई वास्तविक फोटो के दृश्य संकेतों पर आधारित है।'
        : 'Quality assessment is based on visual indicators from captured camera photos.',
      timestamp,
    };
  }

  const ai = getAiClient();

  if (ai) {
    try {
      const extracted = await Promise.all(images.slice(0, 3).map((img) => prepareImagePayload(img)));
      const imageParts = extracted
        .filter((part): part is { mimeType: string; data: string } => part !== null && part.data.length > 20)
        .map((part) => ({
          inlineData: {
            mimeType: part.mimeType,
            data: part.data,
          },
        }));

      if (imageParts.length === 0) {
        throw new Error('No valid image payloads extracted');
      }

      const promptText = `
You are an expert Agricultural Commodity Visual Assessor inspecting farmer camera-captured crop photos for KisanSetu marketplace.
The farmer claims this crop is: "${cropName || 'Unspecified'}" and variety: "${variety || 'Unspecified'}".
Target Language for text fields: ${isHindi ? 'Hindi' : 'English'}.

CRITICAL GUIDELINES:
1. Carefully inspect the visual features in the provided camera-captured image(s).
2. Detect visible crop characteristics:
   - Grain Luster (दाने की चमक)
   - Uniformity (दाना एकसमानता)
   - Cleanliness (सफाई)
   - Foreign Particles (विदेशी तत्व/कचरा)
   - Color and visible damage (रंग और दृश्य क्षति)
3. Automatically determine the Quality Classification:
   - "PREMIUM": High uniformity (>90%), clean grain, strong luster, low/zero visible damage or foreign particles.
   - "STANDARD": Commercial mandi acceptable, average uniformity (75-90%), standard market condition, minor cosmetic variations.
4. If the image is blurred, too dark, unreadable, out of focus, or NOT an agricultural crop, you MUST set isReliable: false and provide a helpful unreliableReason ("${isHindi ? 'छवि स्पष्ट नहीं है या फसल दृश्यमान नहीं है। कृपया स्पष्ट फोटो लें।' : 'Unable to reliably analyze this image. Please capture a clearer crop image.'}").
5. Clearly indicate that this is an "AI Estimated Quality Grade" or "AI-Based Quality Estimate" (Do NOT claim official government or AGMARK certification).
6. Provide a concise gradeExplanation justifying why it was classified as PREMIUM or STANDARD.

Respond strictly in JSON matching the schema.
`;

      const candidateModels = Array.from(
        new Set(
          [
            process.env.GEMINI_MODEL,
            process.env.AI_MODEL,
            'gemini-3.8-flash',
            'gemini-flash-latest',
            'gemini-3.1-flash-lite',
          ].filter((m): m is string => Boolean(m && m.startsWith('gemini-') && !m.includes('1.5') && !m.includes('2.0') && !m.includes('2.5') && !m.includes('3.6')))
        )
      );

      let response: any = null;
      let lastErr: any = null;

      for (const modelName of candidateModels) {
        try {
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`Timeout after 7000ms for ${modelName}`)), 7000)
          );
          response = await Promise.race([
            ai.models.generateContent({
              model: modelName,
              contents: {
                parts: [...imageParts, { text: promptText }],
              },
              config: {
                responseMimeType: 'application/json',
                responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                    isReliable: { type: Type.BOOLEAN },
                    unreliableReason: { type: Type.STRING },
                    detectedCrop: { type: Type.STRING },
                    detectedVariety: { type: Type.STRING },
                    classification: { type: Type.STRING, enum: ['PREMIUM', 'STANDARD'] },
                    gradeExplanation: { type: Type.STRING },
                    cropCharacteristics: {
                      type: Type.OBJECT,
                      properties: {
                        grainLuster: { type: Type.STRING },
                        uniformity: { type: Type.STRING },
                        cleanliness: { type: Type.STRING },
                        foreignParticles: { type: Type.STRING },
                        color: { type: Type.STRING },
                        damageLevel: { type: Type.STRING },
                      },
                      required: ['grainLuster', 'uniformity', 'cleanliness', 'foreignParticles', 'color', 'damageLevel'],
                    },
                    visualIndicators: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    potentialIssues: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    recommendation: { type: Type.STRING },
                    observations: { type: Type.STRING },
                  },
                  required: [
                    'isReliable',
                    'detectedCrop',
                    'detectedVariety',
                    'classification',
                    'gradeExplanation',
                    'cropCharacteristics',
                    'visualIndicators',
                    'potentialIssues',
                    'recommendation',
                    'observations',
                  ],
                },
              },
            }),
            timeoutPromise,
          ]);
          break;
        } catch (mErr) {
          lastErr = mErr;
          console.warn(`[AI Crop Grading] Model ${modelName} failed, attempting next candidate:`, (mErr as any)?.message || mErr);
        }
      }

      if (!response) {
        throw lastErr || new Error('All candidate AI models failed');
      }

      const text = response.text?.trim() || '{}';
      const parsed = JSON.parse(text);

      const isReliable = parsed.isReliable ?? true;
      const classification = (parsed.classification === 'PREMIUM' ? 'PREMIUM' : 'STANDARD') as 'PREMIUM' | 'STANDARD';
      const visualIndicators = Array.isArray(parsed.visualIndicators) && parsed.visualIndicators.length > 0
        ? parsed.visualIndicators
        : isHindi
        ? ['अच्छा दाना स्वरूप', 'समान आकार व रंग', 'स्वच्छ सतह', 'कम दृश्यमान क्षति']
        : ['Good appearance', 'Uniform size & color', 'Clean surface', 'Low visible damage'];
      const potentialIssues = Array.isArray(parsed.potentialIssues) ? parsed.potentialIssues : [];
      const recommendation = parsed.recommendation || (classification === 'PREMIUM'
        ? (isHindi ? 'प्रीमियम ई-मंडी संदर्भ दर (+5% बोनस) के लिए उपयुक्त।' : 'Eligible for premium mandi reference pricing (+5% bonus).')
        : (isHindi ? 'मानक मंडी संदर्भ दर के अनुसार उपयुक्त।' : 'Suitable for standard mandi model reference pricing.'));
      const observations = parsed.observations || (isHindi ? 'दृश्य निरीक्षण में उत्पाद अच्छी स्थिति में है।' : 'Visual inspection shows sound physical quality.');
      const gradeExplanation = parsed.gradeExplanation || (classification === 'PREMIUM'
        ? (isHindi
            ? 'उच्च एकसमानता, स्वच्छ दाना, उत्कृष्ट चमक और न्यूनतम दृश्यमान क्षति।'
            : 'High uniformity, clean grain, strong luster, low/zero visible damage.')
        : (isHindi
            ? 'मंडी वाणिज्यिक मानक, औसत एकसमानता और मानक बाजार स्थिति।'
            : 'Commercial mandi acceptable, average uniformity, standard market condition.'));

      const cropCharacteristics: CropCharacteristics = parsed.cropCharacteristics || {
        grainLuster: classification === 'PREMIUM'
          ? (isHindi ? 'उत्कृष्ट प्राकृतिक चमक' : 'Strong Natural Luster')
          : (isHindi ? 'सामान्य वाणिज्यिक चमक' : 'Standard Commercial Luster'),
        uniformity: classification === 'PREMIUM'
          ? (isHindi ? 'उच्च दाना एकसमानता (>90%)' : 'High Grain Uniformity (>90%)')
          : (isHindi ? 'मध्यम एकसमानता (75-90%)' : 'Moderate Uniformity (75-90%)'),
        cleanliness: classification === 'PREMIUM'
          ? (isHindi ? 'स्वच्छ व छना हुआ दाना' : 'Clean & Well Screened')
          : (isHindi ? 'मानक मंडी स्वच्छता' : 'Standard Mandi Cleanliness'),
        foreignParticles: classification === 'PREMIUM'
          ? (isHindi ? 'नगण्य / शून्य' : 'Low / Zero Foreign Matter')
          : (isHindi ? 'स्वीकार्य सीमा में' : 'Within Commercial Limits'),
        color: classification === 'PREMIUM'
          ? (isHindi ? 'प्राकृतिक चमकदार रंग' : 'Sound Natural Color')
          : (isHindi ? 'मानक वाणिज्यिक रंग' : 'Standard Commercial Color'),
        damageLevel: classification === 'PREMIUM'
          ? (isHindi ? 'न्यूनतम (<1%)' : 'Low (<1%)')
          : (isHindi ? 'सामान्य (1-3%)' : 'Moderate (1-3%)'),
      };

      return {
        success: isReliable,
        isReliable,
        unreliableReason: isReliable ? undefined : parsed.unreliableReason || (isHindi ? 'छवि गुणवत्ता अपर्याप्त है - गुणवत्ता असत्यापित।' : 'AI Analysis Failed / Quality Unverified.'),
        detectedCrop: parsed.detectedCrop || cropName || 'Crop',
        detectedVariety: parsed.detectedVariety || variety || 'Standard Variety',
        classification: isReliable ? classification : 'UNVERIFIED',
        grade: isReliable ? classification : 'UNVERIFIED',
        cropCharacteristics,
        gradeExplanation,
        visualIndicators,
        detectedFeatures: visualIndicators,
        potentialIssues,
        recommendation,
        observations,
        summaryText: observations || recommendation,
        disclaimer: isHindi
          ? 'एआई आधारित गुणवत्ता अनुमान - फोटो के दृश्य संकेतों पर आधारित। यह कोई आधिकारिक सरकारी या एगमार्क (AGMARK) प्रमाणीकरण नहीं है।'
          : 'AI Estimated Quality Grade - Based on visual grain indicators. Does not constitute official government or AGMARK certification.',
        timestamp,
      };
    } catch (error) {
      console.warn('[AI Crop Grading] Gemini API call error or quota exceeded:', error);
    }
  }

  // Honest failure state when Gemini API is unavailable or image cannot be processed by AI.
  // Correct semantic state: AI Analysis Failed / Quality Unverified
  const fallbackCrop = cropName || (isHindi ? 'फसल' : 'Crop');
  const fallbackVariety = variety || (isHindi ? 'मानक' : 'Standard');

  return {
    success: false,
    isReliable: false,
    unreliableReason: isHindi
      ? 'एआई गुणवत्ता विश्लेषण पूरा नहीं हो सका (गुणवत्ता असत्यापित)।'
      : 'AI Analysis Failed / Quality Unverified',
    detectedCrop: fallbackCrop,
    detectedVariety: fallbackVariety,
    classification: 'UNVERIFIED',
    grade: 'UNVERIFIED',
    visualIndicators: [],
    detectedFeatures: [],
    potentialIssues: [isHindi ? 'एआई विश्लेषण उपलब्ध नहीं' : 'AI analysis unavailable'],
    recommendation: isHindi
      ? 'कृपया स्पष्ट फोटो लेकर पुनः जांच करें या मानक मंडी दर से आगे बढ़ें।'
      : 'Please capture a clear crop photo to re-analyze or proceed with standard reference rate.',
    observations: isHindi
      ? 'फसल की छवि का एआई विश्लेषण पूर्ण नहीं हो सका।'
      : 'AI visual analysis could not be completed for this image.',
    summaryText: isHindi
      ? 'फसल की छवि का एआई विश्लेषण पूर्ण नहीं हो सका।'
      : 'AI visual analysis could not be completed for this image.',
    disclaimer: isHindi
      ? 'एआई आधारित गुणवत्ता अनुमान - कैमरे से खींची गई फोटो के दृश्य संकेतों पर आधारित। यह कोई आधिकारिक सरकारी या एगमार्क (AGMARK) प्रमाणीकरण नहीं है।'
      : 'AI Estimated Quality Grade - Based on visual grain indicators from captured camera photo. Does not constitute official government or AGMARK certification.',
    timestamp,
  };
}
