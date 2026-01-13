/**
 * Data masking utilities for sensitive vehicle and personal information
 * Used to protect VINs, license plates, and other sensitive identifiers
 */

/**
 * Masks a VIN number, showing only the last 4 characters
 * @param vin - The full VIN number
 * @returns Masked VIN (e.g., "***************1234")
 */
export function maskVIN(vin: string | null | undefined): string {
  if (!vin || vin.length < 4) return vin || '';
  const visibleChars = 4;
  const maskedPortion = '*'.repeat(vin.length - visibleChars);
  return maskedPortion + vin.slice(-visibleChars);
}

/**
 * Masks a license plate, showing only the last 3 characters
 * @param plate - The full license plate
 * @returns Masked plate (e.g., "****234")
 */
export function maskLicensePlate(plate: string | null | undefined): string {
  if (!plate || plate.length < 3) return plate || '';
  const visibleChars = 3;
  const maskedPortion = '*'.repeat(plate.length - visibleChars);
  return maskedPortion + plate.slice(-visibleChars);
}

/**
 * Masks an IFTA account number, showing only the last 4 characters
 * @param account - The full IFTA account number
 * @returns Masked account (e.g., "********1234")
 */
export function maskIFTAAccount(account: string | null | undefined): string {
  if (!account || account.length < 4) return account || '';
  const visibleChars = 4;
  const maskedPortion = '*'.repeat(account.length - visibleChars);
  return maskedPortion + account.slice(-visibleChars);
}

/**
 * Masks an email address, showing only first 2 chars and domain
 * @param email - The full email address
 * @returns Masked email (e.g., "jo***@example.com")
 */
export function maskEmail(email: string | null | undefined): string {
  if (!email || !email.includes('@')) return email || '';
  const [localPart, domain] = email.split('@');
  if (localPart.length <= 2) return email;
  const visibleChars = 2;
  const maskedLocal = localPart.slice(0, visibleChars) + '***';
  return `${maskedLocal}@${domain}`;
}

/**
 * Masks a phone number, showing only the last 4 digits
 * @param phone - The full phone number
 * @returns Masked phone (e.g., "(***) ***-1234")
 */
export function maskPhone(phone: string | null | undefined): string {
  if (!phone) return '';
  // Remove non-digits to get the raw number
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return phone;
  const lastFour = digits.slice(-4);
  return `(***) ***-${lastFour}`;
}

/**
 * Masks a DOT number, showing only the last 3 digits
 * @param dotNumber - The full DOT number
 * @returns Masked DOT (e.g., "*****123")
 */
export function maskDOTNumber(dotNumber: string | null | undefined): string {
  if (!dotNumber || dotNumber.length < 3) return dotNumber || '';
  const visibleChars = 3;
  const maskedPortion = '*'.repeat(dotNumber.length - visibleChars);
  return maskedPortion + dotNumber.slice(-visibleChars);
}

/**
 * Masks a FEID/EIN number, showing only the last 4 digits
 * @param feid - The full FEID number
 * @returns Masked FEID (e.g., "**-***1234")
 */
export function maskFEID(feid: string | null | undefined): string {
  if (!feid || feid.length < 4) return feid || '';
  const visibleChars = 4;
  const maskedPortion = '*'.repeat(feid.length - visibleChars);
  return maskedPortion + feid.slice(-visibleChars);
}
