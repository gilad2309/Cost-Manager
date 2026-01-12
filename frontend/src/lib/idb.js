// IndexedDB wrapper for React usage (module version)
// The code follows the style guide: semicolons, let/const, no globals leaking.
const DB_NAME = 'costsdb';
const DB_VERSION = 1;
const COSTS_STORE = 'costs';
const SETTINGS_STORE = 'settings';

// Opens or upgrades the database.
export function openCostsDB(databaseName = DB_NAME, databaseVersion = DB_VERSION) {
  return new Promise((resolve, reject) => {
    // Start the async open request.
    const request = indexedDB.open(databaseName, databaseVersion);
    // Create stores during the upgrade flow.
    request.onupgradeneeded = () => {
      const db = request.result;
      // Create the costs store when missing.
      if (!db.objectStoreNames.contains(COSTS_STORE)) {
        const store = db.createObjectStore(COSTS_STORE, { keyPath: 'id', autoIncrement: true });
        store.createIndex('date', 'date', { unique: false });
      }
      // Create the settings store for the rates URL.
      if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
        db.createObjectStore(SETTINGS_STORE, { keyPath: 'key' });
      }
    };
    // Surface any open errors.
    request.onerror = () => {
      reject(request.error);
    };
    request.onsuccess = () => {
      // Resolve with a small API surface.
      // Bind the DB instance so callers use the 3-argument signature.
      const db = request.result;
      resolve({
        // API methods bound to this DB instance.
        addCost: addCostWithDb.bind(null, db),
        getReport: getReportWithDb.bind(null, db),
        getYearlySummary: getYearlySummaryWithDb.bind(null, db),
        saveSettings: saveRatesUrlWithDb.bind(null, db),
        loadSettings: loadRatesUrlWithDb.bind(null, db),
      });
      // End of the success handler.
    };
  });
}

export function addCost(cost) {
  return openCostsDB().then((database) => database.addCost(cost));
}

// Adds a cost item, stamping current date.
function addCostWithDb(db, cost) {
  return new Promise((resolve, reject) => {
    // Start a write transaction for the costs store.
    const tx = db.transaction(COSTS_STORE, 'readwrite');
    const store = tx.objectStore(COSTS_STORE);
    const now = new Date();
    // Normalize the incoming sum.
    const sum = Number(cost.sum);
    // Payload stored in IndexedDB.
    const payload = {
      sum,
      currency: cost.currency,
      category: cost.category,
      description: cost.description,
      date: now.toISOString(),
    };
    // API result that matches the spec shape.
    const result = {
      sum,
      currency: cost.currency,
      category: cost.category,
      description: cost.description,
    };
    // Write the record.
    const addRequest = store.add(payload);
    // Resolve when the transaction completes.
    tx.oncomplete = () => resolve(result);
    tx.onerror = () => reject(tx.error);
    addRequest.onerror = () => reject(addRequest.error);
  });
}

export function getReport(year, month, currency) {
  const rates = arguments[3];
  return openCostsDB().then((database) => database.getReport(year, month, currency, rates));
}

// Fetches the monthly report with conversion.
function getReportWithDb(db, year, month, currency, rates) {
  return new Promise((resolve, reject) => {
    // Readonly transaction for report data.
    const tx = db.transaction(COSTS_STORE, 'readonly');
    const store = tx.objectStore(COSTS_STORE);
    const cursorRequest = store.openCursor();
    const costs = [];
    let total = 0;
    const effectiveRates = rates || defaultRates();
    // Walk over all rows.
    cursorRequest.onsuccess = () => {
      const cursor = cursorRequest.result;
      if (cursor) {
        const value = cursor.value;
        const itemDate = new Date(value.date);
        if (itemDate.getFullYear() === year && itemDate.getMonth() + 1 === month) {
          // Convert to the requested currency for totals.
          const convertedSum = convertAmount(value.sum, value.currency, currency, effectiveRates);
          total += convertedSum;
          // Keep original currency and sum on each row.
          costs.push({
            sum: value.sum,
            currency: value.currency,
            category: value.category,
            description: value.description,
            // Store the day for report display.
            Date: { day: itemDate.getDate() },
          });
        }
        // Continue cursor traversal.
        cursor.continue();
        return;
      }
      // Aggregate totals after traversal.
      resolve({ year, month, costs, total: { currency, total } });
    };
    cursorRequest.onerror = () => reject(cursorRequest.error);
    tx.onerror = () => reject(tx.error);
  });
}

export function getYearlySummary(year, currency) {
  const rates = arguments[2];
  return openCostsDB().then((database) => database.getYearlySummary(year, currency, rates));
}

// Builds yearly totals per month for charting.
function getYearlySummaryWithDb(db, year, currency, rates) {
  return new Promise((resolve, reject) => {
    // Readonly transaction for yearly totals.
    const tx = db.transaction(COSTS_STORE, 'readonly');
    const store = tx.objectStore(COSTS_STORE);
    const cursorRequest = store.openCursor();
    // Bucket totals for each month.
    const buckets = Array.from({ length: 12 }, () => 0);
    const effectiveRates = rates || defaultRates();
    // Iterate through each cursor entry.
    cursorRequest.onsuccess = () => {
      const cursor = cursorRequest.result;
      if (cursor) {
        const value = cursor.value;
        const itemDate = new Date(value.date);
        if (itemDate.getFullYear() === year) {
          // Convert each item into the selected currency.
          const idx = itemDate.getMonth();
          const convertedSum = convertAmount(value.sum, value.currency, currency, effectiveRates);
          buckets[idx] += convertedSum;
        }
        // Continue cursor traversal.
        cursor.continue();
        return;
      }
      // Resolve with the monthly totals.
      resolve({ year, currency, totals: buckets });
    };
    cursorRequest.onerror = () => reject(cursorRequest.error);
    tx.onerror = () => reject(tx.error);
  });
}

export function saveRatesUrl(url) {
  return openCostsDB().then((database) => database.saveSettings(url));
}

export function loadRatesUrl() {
  return openCostsDB().then((database) => database.loadSettings());
}

// Saves rates URL into settings store.
function saveRatesUrlWithDb(db, url) {
  return new Promise((resolve, reject) => {
    // Persist the URL in the settings store.
    const tx = db.transaction(SETTINGS_STORE, 'readwrite');
    const store = tx.objectStore(SETTINGS_STORE);
    store.put({ key: 'ratesUrl', value: url });
    // Resolve after the transaction completes.
    tx.oncomplete = () => resolve(url);
    tx.onerror = () => reject(tx.error);
  });
}

// Loads rates URL from the store.
function loadRatesUrlWithDb(db) {
  return new Promise((resolve, reject) => {
    // Read the URL from the settings store.
    const tx = db.transaction(SETTINGS_STORE, 'readonly');
    const store = tx.objectStore(SETTINGS_STORE);
    const request = store.get('ratesUrl');
    request.onsuccess = () => {
      const record = request.result;
      // Default to an empty string when missing.
      resolve(record ? record.value : '');
    };
    request.onerror = () => reject(request.error);
    tx.onerror = () => reject(tx.error);
  });
}

// Converts between currencies using USD as the base.
export function convertAmount(amount, from, to, rates) {
  // Guard when rates are missing.
  if (!rates || !rates[from] || !rates[to]) {
    return Number(amount);
  }
  // Normalize to USD then convert to target.
  const amountInUsd = Number(amount) / rates[from];
  return amountInUsd * rates[to];
}

// A helper to get default rates for offline use.
export function defaultRates() {
  // Mirrors the required JSON shape.
  return { USD: 1, GBP: 0.6, EURO: 0.7, ILS: 3.4 };
}
