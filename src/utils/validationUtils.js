import { getTodayDate } from './dateUtils';

/**
 * Central Field-Specific Validation Utility (100% Secure)
 */

// Name Validation: ONLY alphabetic characters and spaces (NO numbers, NO special symbols)
export const validateName = (name, fieldName = 'Full Name') => {
  if (!name || !name.trim()) {
    return { isValid: false, message: `${fieldName} is required.` };
  }
  const cleanName = name.trim();
  if (cleanName.length < 2) {
    return { isValid: false, message: `${fieldName} must be at least 2 letters long.` };
  }
  // Regex: Only English letters, spaces, and hyphens for compound names
  const nameRegex = /^[A-Za-z\s'-]+$/;
  if (!nameRegex.test(cleanName)) {
    return { isValid: false, message: `${fieldName} can only contain letters and spaces (no numbers or special symbols allowed).` };
  }
  return { isValid: true, message: '' };
};

// Email Validation: Strict email format regex
export const validateEmail = (email) => {
  if (!email || !email.trim()) return { isValid: false, message: 'Email address is required.' };
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, message: 'Please enter a valid email address (e.g. name@domain.com).' };
  }
  return { isValid: true, message: '' };
};

// Phone Validation: Digits, spaces, hyphens, and optional + prefix only
export const validatePhone = (phone) => {
  if (!phone || !phone.trim()) return { isValid: true, message: '' }; // Optional check if blank
  const cleanPhone = phone.trim();
  const phoneRegex = /^[+]?[0-9\s-]{7,15}$/;
  if (!phoneRegex.test(cleanPhone)) {
    return { isValid: false, message: 'Phone number can only contain digits, spaces, and optional country code (+91).' };
  }
  return { isValid: true, message: '' };
};

// Password Validation
export const validatePassword = (password, minLength = 6) => {
  if (!password) return { isValid: false, message: 'Password is required.' };
  if (password.length < minLength) {
    return { isValid: false, message: `Password must be at least ${minLength} characters long.` };
  }
  return { isValid: true, message: '' };
};

// Title / Game / Pitch Name Validation: At least 3 characters
export const validateTitle = (title, fieldName = 'Title') => {
  if (!title || !title.trim()) {
    return { isValid: false, message: `${fieldName} is required.` };
  }
  const clean = title.trim();
  if (clean.length < 3) {
    return { isValid: false, message: `${fieldName} must be at least 3 characters long.` };
  }
  return { isValid: true, message: '' };
};

// Time Range Validation: Start < End
export const validateTimeRange = (startTime, endTime) => {
  if (!startTime || !endTime) return { isValid: false, message: 'Start and End times are required.' };
  if (startTime >= endTime) {
    return { isValid: false, message: 'End time must be strictly after Start time.' };
  }
  return { isValid: true, message: '' };
};

// Date Validation: Prevents past dates
export const validateDateNotPast = (dateStr, fieldName = 'Date') => {
  if (!dateStr) return { isValid: false, message: `${fieldName} is required.` };
  const today = getTodayDate(0);
  if (dateStr < today) {
    return { isValid: false, message: `${fieldName} cannot be in the past. Please select today or a future date.` };
  }
  return { isValid: true, message: '' };
};

// Amount / Price Validation
export const validatePositiveAmount = (amount, fieldName = 'Amount', allowZero = true) => {
  const num = parseFloat(amount);
  if (isNaN(num)) {
    return { isValid: false, message: `${fieldName} must be a valid number.` };
  }
  if (!allowZero && num <= 0) {
    return { isValid: false, message: `${fieldName} must be greater than ₹0.` };
  }
  if (num < 0) {
    return { isValid: false, message: `${fieldName} cannot be negative.` };
  }
  return { isValid: true, message: '' };
};

// Integer Range Validation (e.g. score between 0 and 99, max players 1 to 50)
export const validateIntegerRange = (val, min, max, fieldName = 'Value') => {
  const num = parseInt(val, 10);
  if (isNaN(num)) {
    return { isValid: false, message: `${fieldName} must be a valid whole number.` };
  }
  if (num < min || num > max) {
    return { isValid: false, message: `${fieldName} must be between ${min} and ${max}.` };
  }
  return { isValid: true, message: '' };
};

// URL Validation
export const validateUrl = (urlStr, fieldName = 'URL') => {
  if (!urlStr || !urlStr.trim()) return { isValid: false, message: `${fieldName} is required.` };
  try {
    const parsed = new URL(urlStr.trim());
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { isValid: false, message: `${fieldName} must start with http:// or https://.` };
    }
  } catch (e) {
    return { isValid: false, message: `Please enter a valid ${fieldName} (e.g. https://domain.com/video.mp4).` };
  }
  return { isValid: true, message: '' };
};

// Generic Non-Empty
export const validateNonEmpty = (value, fieldName = 'Field') => {
  if (!value || !String(value).trim()) {
    return { isValid: false, message: `${fieldName} cannot be empty.` };
  }
  return { isValid: true, message: '' };
};
