import crypto from 'crypto';

// ============================================================================
// INDIAN PHONE NUMBER NORMALIZATION & VALIDATION (E.164)
// ============================================================================

export interface PhoneValidationResult {
  isValid: boolean;
  normalized: string; // e.g. "+919876543210"
  displayPhone: string; // e.g. "+91 98765 43210"
  error?: string;
}

/**
 * Normalizes Indian mobile numbers to standard E.164 (+91XXXXXXXXXX)
 */
export function normalizeIndianPhoneNumber(rawPhone: string): PhoneValidationResult {
  if (!rawPhone || typeof rawPhone !== 'string') {
    return {
      isValid: false,
      normalized: '',
      displayPhone: '',
      error: 'Phone number is required.',
    };
  }

  // Remove whitespace, dashes, parens, dots
  let cleaned = rawPhone.replace(/[\s\-\(\)\.]/g, '').trim();

  // Strip leading '+'
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.slice(1);
  }

  // Handle leading '91' (country code without plus)
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    cleaned = cleaned.slice(2);
  }

  // Handle leading '0'
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = cleaned.slice(1);
  }

  // Check if exactly 10 digits
  if (!/^\d{10}$/.test(cleaned)) {
    return {
      isValid: false,
      normalized: '',
      displayPhone: '',
      error: 'Please enter a valid 10-digit mobile number.',
    };
  }

  // Validate standard Indian mobile prefix (starts with 6, 7, 8, 9)
  const firstDigit = cleaned[0];
  if (!['6', '7', '8', '9'].includes(firstDigit)) {
    return {
      isValid: false,
      normalized: '',
      displayPhone: '',
      error: 'Invalid mobile number. Indian mobile numbers start with 6, 7, 8, or 9.',
    };
  }

  // Reject all repeated digits (e.g., 1111111111, 0000000000, 9999999999)
  if (new Set(cleaned.split('')).size === 1) {
    return {
      isValid: false,
      normalized: '',
      displayPhone: '',
      error: 'Invalid mobile number. Numbers with all repeated digits are not allowed.',
    };
  }

  // Reject sequential digits (e.g., 1234567890, 0123456789, 9876543210)
  let isAsc = true;
  let isDesc = true;
  for (let i = 1; i < cleaned.length; i++) {
    const prev = Number(cleaned[i - 1]);
    const curr = Number(cleaned[i]);
    if (curr !== (prev + 1) % 10) isAsc = false;
    if (curr !== (prev - 1 + 10) % 10) isDesc = false;
  }
  if (isAsc || isDesc) {
    return {
      isValid: false,
      normalized: '',
      displayPhone: '',
      error: 'Invalid mobile number. Sequential digits (e.g., 1234567890, 9876543210) are not allowed.',
    };
  }

  const normalized = `+91${cleaned}`;
  const displayPhone = `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;

  return {
    isValid: true,
    normalized,
    displayPhone,
  };
}

/**
 * Validates Aadhaar number on server:
 * - Exactly 12 digits
 * - Cannot start with 0 or 1
 * - Rejects all repeated digits
 * - Rejects sequential digits
 */
export function validateAadhaarNumberServer(rawAadhaar?: string, isRequired = true): { isValid: boolean; error?: string; cleaned: string } {
  if (!rawAadhaar || typeof rawAadhaar !== 'string' || !rawAadhaar.trim()) {
    if (!isRequired) return { isValid: true, cleaned: '' };
    return { isValid: false, error: 'Aadhaar number is required.', cleaned: '' };
  }

  const cleaned = rawAadhaar.replace(/\D/g, '').slice(0, 12);

  if (cleaned.length !== 12) {
    return { isValid: false, error: 'Aadhaar number must be exactly 12 digits.', cleaned };
  }

  if (cleaned.startsWith('0') || cleaned.startsWith('1')) {
    return { isValid: false, error: 'Aadhaar number cannot start with 0 or 1 (UIDAI regulations).', cleaned };
  }

  if (new Set(cleaned.split('')).size === 1) {
    return { isValid: false, error: 'Invalid Aadhaar number. Numbers with all repeated digits are not allowed.', cleaned };
  }

  let isAsc = true;
  let isDesc = true;
  for (let i = 1; i < cleaned.length; i++) {
    const prev = Number(cleaned[i - 1]);
    const curr = Number(cleaned[i]);
    if (curr !== (prev + 1) % 10) isAsc = false;
    if (curr !== (prev - 1 + 10) % 10) isDesc = false;
  }
  if (isAsc || isDesc) {
    return { isValid: false, error: 'Invalid Aadhaar number. Sequential digits (e.g., 123456789012) are not allowed.', cleaned };
  }

  return { isValid: true, cleaned };
}

/**
 * Masks a phone number for display (e.g. +91 ••••• ••210)
 */
export function maskPhoneNumber(phone: string): string {
  const norm = normalizeIndianPhoneNumber(phone);
  if (!norm.isValid) return phone;
  const digits = norm.normalized.replace('+91', '');
  return `+91 ••••• ••${digits.slice(-3)}`;
}

