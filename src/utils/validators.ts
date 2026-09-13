/**
 * KisanSetu - Indian Mobile and Aadhaar Strict Validation Utilities
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  cleaned: string;
  formatted: string;
}

/**
 * Checks if a string of digits is purely sequential (ascending or descending cyclic 0-9)
 */
export function isSequentialDigits(digits: string): boolean {
  if (!digits || digits.length < 3) return false;
  let isAsc = true;
  let isDesc = true;
  for (let i = 1; i < digits.length; i++) {
    const prev = Number(digits[i - 1]);
    const curr = Number(digits[i]);
    if (curr !== (prev + 1) % 10) {
      isAsc = false;
    }
    if (curr !== (prev - 1 + 10) % 10) {
      isDesc = false;
    }
  }
  return isAsc || isDesc;
}

/**
 * Checks if all digits are the same repeated character (e.g. 1111111111, 0000000000)
 */
export function isAllRepeatedDigits(digits: string): boolean {
  if (!digits || digits.length < 2) return false;
  return new Set(digits.split('')).size === 1;
}

/**
 * Validates an Indian mobile phone number:
 * - Exactly 10 digits
 * - Starts with 6, 7, 8, or 9
 * - Rejects all repeated digits (e.g., 1111111111, 9999999999)
 * - Rejects sequential digits (e.g., 1234567890, 9876543210)
 */
export function validateIndianMobile(rawPhone: string, isHindi: boolean = true): ValidationResult {
  if (!rawPhone || typeof rawPhone !== 'string') {
    return {
      isValid: false,
      error: isHindi ? 'मोबाइल नंबर आवश्यक है।' : 'Mobile number is required.',
      cleaned: '',
      formatted: '',
    };
  }

  let cleaned = rawPhone.replace(/[\s\-\(\)\.]/g, '').trim();
  if (cleaned.startsWith('+')) cleaned = cleaned.slice(1);
  if (cleaned.startsWith('91') && cleaned.length === 12) cleaned = cleaned.slice(2);
  if (cleaned.startsWith('0') && cleaned.length === 11) cleaned = cleaned.slice(1);

  // Keep only digits
  cleaned = cleaned.replace(/\D/g, '');

  if (cleaned.length === 0) {
    return {
      isValid: false,
      error: isHindi ? 'मोबाइल नंबर आवश्यक है।' : 'Mobile number is required.',
      cleaned: '',
      formatted: '',
    };
  }

  if (cleaned.length !== 10) {
    return {
      isValid: false,
      error: isHindi ? 'मोबाइल नंबर ठीक 10 अंकों का होना चाहिए।' : 'Mobile number must be exactly 10 digits.',
      cleaned,
      formatted: cleaned,
    };
  }

  const firstDigit = cleaned[0];
  if (!['6', '7', '8', '9'].includes(firstDigit)) {
    return {
      isValid: false,
      error: isHindi
        ? 'मोबाइल नंबर 6, 7, 8 या 9 से शुरू होना चाहिए।'
        : 'Mobile number must start with 6, 7, 8, or 9.',
      cleaned,
      formatted: cleaned,
    };
  }

  if (isAllRepeatedDigits(cleaned)) {
    return {
      isValid: false,
      error: isHindi
        ? 'अमान्य मोबाइल नंबर: सभी अंक समान (जैसे 9999999999) मान्य नहीं हैं।'
        : 'Invalid mobile number: repeated digits (e.g. 9999999999) are not allowed.',
      cleaned,
      formatted: cleaned,
    };
  }

  if (isSequentialDigits(cleaned)) {
    return {
      isValid: false,
      error: isHindi
        ? 'अमान्य मोबाइल नंबर: क्रमिक अंक (जैसे 1234567890, 9876543210) मान्य नहीं हैं।'
        : 'Invalid mobile number: sequential digits (e.g. 1234567890, 9876543210) are not allowed.',
      cleaned,
      formatted: cleaned,
    };
  }

  const formatted = `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;

  return {
    isValid: true,
    error: undefined,
    cleaned,
    formatted,
  };
}

/**
 * Validates an Indian Aadhaar number:
 * - Exactly 12 digits
 * - Cannot start with 0 or 1 (must start with 2-9)
 * - Rejects all repeated digits (e.g., 111111111111, 000000000000)
 * - Rejects sequential digits (e.g., 123456789012, 987654321098)
 * - Formats with spaces for readability (XXXX XXXX XXXX)
 */
export function validateAadhaarNumber(
  rawAadhaar: string,
  isHindi: boolean = true,
  isRequired: boolean = true
): ValidationResult {
  if (!rawAadhaar || typeof rawAadhaar !== 'string') {
    if (!isRequired) {
      return { isValid: true, cleaned: '', formatted: '' };
    }
    return {
      isValid: false,
      error: isHindi ? 'आधार संख्या आवश्यक है।' : 'Aadhaar number is required.',
      cleaned: '',
      formatted: '',
    };
  }

  const cleaned = rawAadhaar.replace(/\D/g, '').slice(0, 12);
  const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');

  if (cleaned.length === 0) {
    if (!isRequired) {
      return { isValid: true, cleaned: '', formatted: '' };
    }
    return {
      isValid: false,
      error: isHindi ? 'आधार संख्या आवश्यक है।' : 'Aadhaar number is required.',
      cleaned,
      formatted,
    };
  }

  if (cleaned.length !== 12) {
    return {
      isValid: false,
      error: isHindi
        ? `आधार संख्या ठीक 12 अंकों की होनी चाहिए (${cleaned.length}/12 दर्ज)।`
        : `Aadhaar number must be exactly 12 digits (${cleaned.length}/12 entered).`,
      cleaned,
      formatted,
    };
  }

  if (cleaned.startsWith('0') || cleaned.startsWith('1')) {
    return {
      isValid: false,
      error: isHindi
        ? 'आधार संख्या 0 या 1 से शुरू नहीं हो सकती (UIDAI नियम)।'
        : 'Aadhaar number cannot start with 0 or 1 (as per UIDAI guidelines).',
      cleaned,
      formatted,
    };
  }

  if (isAllRepeatedDigits(cleaned)) {
    return {
      isValid: false,
      error: isHindi
        ? 'अमान्य आधार: सभी अंक समान (जैसे 111111111111) मान्य नहीं हैं।'
        : 'Invalid Aadhaar: repeated digits (e.g. 111111111111) are not allowed.',
      cleaned,
      formatted,
    };
  }

  if (isSequentialDigits(cleaned)) {
    return {
      isValid: false,
      error: isHindi
        ? 'अमान्य आधार: क्रमिक अंक (जैसे 123456789012) मान्य नहीं हैं।'
        : 'Invalid Aadhaar: sequential digits (e.g. 123456789012) are not allowed.',
      cleaned,
      formatted,
    };
  }

  return {
    isValid: true,
    error: undefined,
    cleaned,
    formatted,
  };
}
