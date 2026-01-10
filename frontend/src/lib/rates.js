// Fetches currency rates from a URL expected to return the required JSON.
import { defaultRates } from './idb.js';

// Gets the rates with basic validation.
export async function fetchRates(url) {
  // If no URL configured, return defaults.
  if (!url) {
    return defaultRates();
  }
  // Fetch the remote JSON response.
  const response = await fetch(url);
  // Validate HTTP success.
  if (!response.ok) {
    throw new Error('Failed fetching rates');
  }
  // Parse JSON payload.
  const data = await response.json();
  // Ensure required currencies exist.
  const required = ['USD', 'GBP', 'EURO', 'ILS'];
  const missing = required.filter((key) => data[key] === undefined);
  if (missing.length > 0) {
    throw new Error('Rates response missing keys');
  }
  // Coerce values into numbers.
  return {
    USD: Number(data.USD),
    GBP: Number(data.GBP),
    EURO: Number(data.EURO),
    ILS: Number(data.ILS),
  };
}
