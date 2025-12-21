// src/utils/fontUtils.js

/**
 * Check if text contains Dhivehi characters
 * Dhivehi Unicode range: U+0780 to U+07BF
 */
export const isDhivehiText = (text) => {
  if (!text || typeof text !== 'string') return false;
  
  // Check for Dhivehi Unicode characters
  const dhivehiRegex = /[\u0780-\u07BF]/;
  return dhivehiRegex.test(text);
};

/**
 * Get appropriate CSS class based on text language
 */
export const getFontClass = (text) => {
  return isDhivehiText(text) ? 'dhivehi-text' : '';
};

/**
 * Get language attribute based on text
 */
export const getLangAttr = (text) => {
  return isDhivehiText(text) ? 'dv' : 'en';
};