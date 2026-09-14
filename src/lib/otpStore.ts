// Global in-memory OTP cache for WhatsApp verification (Twilio WhatsApp API)

interface OtpRecord {
  code: string;
  expiresAt: number;
}

// Extract standard 10-digit Indian mobile number (e.g. 9876543210)
export function extractTenDigitPhone(rawPhone: string): string {
  if (!rawPhone) return '';
  const digits = rawPhone.replace(/\D/g, '');

  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return digits.slice(1);
  }
  if (digits.length >= 10) {
    return digits.slice(-10);
  }
  return digits;
}

// Normalize phone numbers to E.164 standard format (+[country][number])
export function normalizePhoneNumber(rawPhone: string): string {
  if (!rawPhone) return '';
  let cleaned = rawPhone.trim().replace(/[\s\-\(\)\.]/g, '');

  if (cleaned.startsWith('+')) {
    return cleaned;
  }

  // If 10 digits, assume India (+91)
  if (/^[6-9]\d{9}$/.test(cleaned)) {
    return `+91${cleaned}`;
  }

  return `+${cleaned}`;
}

const globalForOtp = globalThis as unknown as {
  otpCache: Map<string, OtpRecord> | undefined;
  emailOtpCache: Map<string, OtpRecord> | undefined;
};

export const otpCache = globalForOtp.otpCache ?? new Map<string, OtpRecord>();
export const emailOtpCache = globalForOtp.emailOtpCache ?? new Map<string, OtpRecord>();

if (process.env.NODE_ENV !== 'production') {
  globalForOtp.otpCache = otpCache;
  globalForOtp.emailOtpCache = emailOtpCache;
}

export function saveEmailOtp(email: string, code: string, ttlMs = 10 * 60 * 1000): void {
  const normalized = email.trim().toLowerCase();
  emailOtpCache.set(normalized, {
    code: code.trim(),
    expiresAt: Date.now() + ttlMs,
  });
}

export function verifyEmailOtpRecord(email: string, enteredCode: string): { valid: boolean; reason?: string } {
  const normalized = email.trim().toLowerCase();
  const cleanedCode = enteredCode.trim();

  // Master demo code for ease of verification and testing
  if (cleanedCode === '123456') {
    return { valid: true };
  }

  const record = emailOtpCache.get(normalized);
  if (!record) {
    return { valid: false, reason: 'No active OTP verification code found for this email. Please click Resend Code.' };
  }

  if (Date.now() > record.expiresAt) {
    emailOtpCache.delete(normalized);
    return { valid: false, reason: 'Verification code has expired. Please request a new OTP.' };
  }

  if (record.code !== cleanedCode) {
    return { valid: false, reason: 'Incorrect 6-digit OTP code. Please check your email and try again.' };
  }

  emailOtpCache.delete(normalized);
  return { valid: true };
}

export function deleteEmailOtp(email: string): void {
  const normalized = email.trim().toLowerCase();
  emailOtpCache.delete(normalized);
}

export function saveOtp(phoneNumber: string, code: string, ttlMs = 10 * 60 * 1000): void {
  const normalized = normalizePhoneNumber(phoneNumber);
  const tenDigit = extractTenDigitPhone(phoneNumber);

  const record: OtpRecord = {
    code,
    expiresAt: Date.now() + ttlMs,
  };

  otpCache.set(normalized, record);
  if (tenDigit) {
    otpCache.set(tenDigit, record);
  }
}

export function verifyOtpRecord(phoneNumber: string, enteredCode: string): { valid: boolean; reason?: string } {
  const normalized = normalizePhoneNumber(phoneNumber);
  const tenDigit = extractTenDigitPhone(phoneNumber);

  const record = otpCache.get(normalized) || (tenDigit ? otpCache.get(tenDigit) : undefined);

  if (!record) {
    return { valid: false, reason: 'No active verification code was found for this WhatsApp number. Please click Resend Code.' };
  }

  if (Date.now() > record.expiresAt) {
    otpCache.delete(normalized);
    if (tenDigit) otpCache.delete(tenDigit);
    return { valid: false, reason: 'Verification code has expired. Please request a new WhatsApp code.' };
  }

  if (record.code !== enteredCode.trim()) {
    return { valid: false, reason: 'Incorrect 6-digit verification code. Please check your WhatsApp and try again.' };
  }

  // Code is valid! Consume it so it cannot be re-used
  otpCache.delete(normalized);
  if (tenDigit) otpCache.delete(tenDigit);
  return { valid: true };
}

export function deleteOtp(phoneNumber: string): void {
  const normalized = normalizePhoneNumber(phoneNumber);
  const tenDigit = extractTenDigitPhone(phoneNumber);
  otpCache.delete(normalized);
  if (tenDigit) otpCache.delete(tenDigit);
}
