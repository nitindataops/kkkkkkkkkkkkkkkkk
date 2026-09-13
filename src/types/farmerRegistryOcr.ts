export type FarmerRegistryValidationStatus =
  | 'MATCHED'
  | 'POSSIBLE_MISMATCH'
  | 'UNREADABLE'
  | 'SUSPICIOUS_REVIEW';

export interface FarmerRegistryExtractedData {
  farmerNameEnglish?: string;
  farmerNameHindi?: string;
  cardholderNameEnglish?: string;
  cardholderNameHindi?: string;
  fatherOrIdentifierName?: string;
  fatherOrIdentifierNameHindi?: string;
  aadhaarNumber?: string; // Masked for UI display (e.g. XXXX XXXX 1234)
  aadhaarNumberRaw?: string; // Cleaned normalized 12-digit digits if present
  dob?: string;
  gender?: string;
  address?: string;
  registryNumber?: string;
  state?: string;
  district?: string;
  tehsil?: string;
  village?: string;
  pincode?: string;
  landAreaTotal?: string;
  landUnit?: string;
  khataOrSurveyNumber?: string;
  isFarmerRegistryDocument: boolean;
  isAadhaarDocument?: boolean;
  sideDetected?: 'front' | 'back' | 'both' | 'unknown';
  isReadable: boolean;
  unreadableReason?: string;
  confidenceScore?: number;
  extractedAt: string;
}

export interface FarmerRegistryComparisonField {
  field: 'name' | 'fatherName' | 'aadhaarNumber' | 'district' | 'tehsil' | 'village' | 'registryNumber';
  labelHi: string;
  labelEn: string;
  signupValue: string;
  ocrValue: string;
  status: 'MATCH' | 'MISMATCH' | 'NOT_PROVIDED' | 'DETECTED';
  notes?: string;
}

export interface FarmerRegistryOcrProcessResult {
  success: boolean;
  validationStatus: FarmerRegistryValidationStatus;
  statusBadgeTextHi: string;
  statusBadgeTextEn: string;
  statusTitle: string;
  statusMessage: string;
  warningMessage?: string;
  fileName: string;
  fileSizeFormatted?: string;
  // Structured summary fields as per specification
  extractedName?: string;
  extractedNameHindi?: string;
  extractedFatherName?: string;
  extractedFatherNameHindi?: string;
  extractedAadhaar?: string;
  extractedAadhaarRaw?: string;
  nameMatch?: boolean | null;
  fatherNameMatch?: boolean | null;
  aadhaarMatch?: boolean | null;
  confidence?: number | null;
  error?: string | null;
  extractedData: FarmerRegistryExtractedData;
  comparisons: FarmerRegistryComparisonField[];
  canProceed: boolean;
  disclaimer: string;
}

export interface FarmerSignupComparisonInput {
  name: string;
  fatherName?: string;
  aadhaarNumber?: string;
  district?: string;
  tehsil?: string;
  village?: string;
  registryNumber?: string;
}

export interface FarmerOcrApiRequestPayload {
  documentBase64?: string;
  frontDocumentBase64?: string;
  backDocumentBase64?: string;
  fileName?: string;
  frontFileName?: string;
  backFileName?: string;
  fileSizeBytes?: number;
  mimeType?: string;
  signupDetails?: FarmerSignupComparisonInput;
}

