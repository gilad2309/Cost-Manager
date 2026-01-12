// Vanilla IndexedDB helper - attaches idb to the global object.
(function attachIdb() {
  // Local constants for database structure.
  const DB_NAME = 'costsdb';
  const DB_VERSION = 1;
  const COSTS_STORE = 'costs';
  const SETTINGS_STORE = 'settings';

  // Public API exposed on window.idb.
  const api = {
    // Core database methods.
    openCostsDB,
    addCost,
    getReport,
    getYearlySummary,
    // Settings and utility methods.
    saveRatesUrl,
    loadRatesUrl,
    convertAmount,
    defaultRates,
  };

  // Expose the object on the global scope.
  window.idb = api;

  // Opens the database and resolves a db wrapper with methods.
  function openCostsDB(databaseName, databaseVersion) {
    return new Promise((resolve, reject) => {
      // Open or create the database.
      const request = indexedDB.open(databaseName || DB_NAME, databaseVersion || DB_VERSION);
      // Create stores during upgrades.
      request.onupgradeneeded = () => {
        const db = request.result;
        // Cost items store.
        if (!db.objectStoreNames.contains(COSTS_STORE)) {
          const store = db.createObjectStore(COSTS_STORE, { keyPath: 'id', autoIncrement: true });
          store.createIndex('date', 'date', { unique: false });
        }
        // Settings store.
        if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
          db.createObjectStore(SETTINGS_STORE, { keyPath: 'key' });
        }
      };
      // Basic error handling.
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        // Expose a small API wrapper.
        resolve({
          // Methods bound to this DB instance.
          addCost: addCostWithDb.bind(null, db),
          getReport: getReportWithDb.bind(null, db),
          getYearlySummary: getYearlySummaryWithDb.bind(null, db),
          saveSettings: saveRatesUrlWithDb.bind(null, db),
          loadSettings: loadRatesUrlWithDb.bind(null, db),
        });
        // End of open success handler.
      };
    });
  }

  function addCost(cost) {
    return openCostsDB().then((database) => database.addCost(cost));
  }

  // Adds a cost item with current date.
  function addCostWithDb(db, cost) {
    return new Promise((resolve, reject) => {
      // Write transaction for the costs store.
      const tx = db.transaction(COSTS_STORE, 'readwrite');
      const store = tx.objectStore(COSTS_STORE);
      const now = new Date();
      // Normalize the input sum.
      const sum = Number(cost.sum);
      // Record stored in IndexedDB.
      const payload = {
        sum,
        currency: cost.currency,
        category: cost.category,
        description: cost.description,
        date: now.toISOString(),
      };
      // Result matches the required API shape.
      const result = {
        sum,
        currency: cost.currency,
        category: cost.category,
        description: cost.description,
      };
      // Persist record and resolve on completion.
      const addRequest = store.add(payload);
      tx.oncomplete = () => resolve(result);
      tx.onerror = () => reject(tx.error);
      addRequest.onerror = () => reject(addRequest.error);
    });
  }

  function getReport(year, month, currency) {
    const rates = arguments[3];
    return openCostsDB().then((database) => database.getReport(year, month, currency, rates));
  }

  // Gets a monthly report and converts currency when rates exist.
  function getReportWithDb(db, year, month, currency, rates) {
    return new Promise((resolve, reject) => {
      // Readonly transaction for report data.
      const tx = db.transaction(COSTS_STORE, 'readonly');
      const store = tx.objectStore(COSTS_STORE);
      // Cursor used to scan all cost records.
      const cursorRequest = store.openCursor();
      const costs = [];
      let total = 0;
      const effectiveRates = rates || defaultRates();
      // Track totals for matching entries.
      cursorRequest.onsuccess = () => {
        const cursor = cursorRequest.result;
        if (cursor) {
          const value = cursor.value;
          const d = new Date(value.date);
          if (d.getFullYear() === year && d.getMonth() + 1 === month) {
            // Convert each item into the target currency for totals.
            const convertedSum = convertAmount(value.sum, value.currency, currency, effectiveRates);
            total += convertedSum;
            // Preserve the original currency on each row.
            costs.push({
              sum: value.sum,
              currency: value.currency,
              category: value.category,
              description: value.description,
              // Store day for report display.
              Date: { day: d.getDate() },
            });
          }
          // Continue scanning the store.
          cursor.continue();
          return;
        }
        // Resolve after processing all rows.
        resolve({ year, month, costs, total: { currency, total } });
      };
      cursorRequest.onerror = () => reject(cursorRequest.error);
      tx.onerror = () => reject(tx.error);
    });
  }

  function getYearlySummary(year, currency) {
    const rates = arguments[2];
    return openCostsDB().then((database) => database.getYearlySummary(year, currency, rates));
  }

  // Summarizes a full year for chart needs.
  function getYearlySummaryWithDb(db, year, currency, rates) {
    return new Promise((resolve, reject) => {
      // Readonly transaction for yearly totals.
      const tx = db.transaction(COSTS_STORE, 'readonly');
      const store = tx.objectStore(COSTS_STORE);
      const cursorRequest = store.openCursor();
      // Bucket totals by month.
      const buckets = Array.from({ length: 12 }, () => 0);
      const effectiveRates = rates || defaultRates();
      // Iterate through yearly cursor entries.
      cursorRequest.onsuccess = () => {
        const cursor = cursorRequest.result;
        if (cursor) {
          const value = cursor.value;
          const d = new Date(value.date);
          if (d.getFullYear() === year) {
            const idx = d.getMonth();
            // Convert item into the target currency.
            buckets[idx] += convertAmount(value.sum, value.currency, currency, effectiveRates);
          }
          // Continue scanning the store.
          cursor.continue();
          return;
        }
        // Resolve with monthly totals.
        resolve({ year, currency, totals: buckets });
      };
      cursorRequest.onerror = () => reject(cursorRequest.error);
      tx.onerror = () => reject(tx.error);
    });
  }

  function saveRatesUrl(url) {
    return openCostsDB().then((database) => database.saveSettings(url));
  }

  function loadRatesUrl() {
    return openCostsDB().then((database) => database.loadSettings());
  }

  // Saves the rates URL to the settings store.
  function saveRatesUrlWithDb(db, url) {
    return new Promise((resolve, reject) => {
      // Write the URL value.
      const tx = db.transaction(SETTINGS_STORE, 'readwrite');
      const store = tx.objectStore(SETTINGS_STORE);
      store.put({ key: 'ratesUrl', value: url });
      // Resolve after the transaction completes.
      tx.oncomplete = () => resolve(url);
      tx.onerror = () => reject(tx.error);
    });
  }

  // Loads the rates URL from the settings store.
  function loadRatesUrlWithDb(db) {
    return new Promise((resolve, reject) => {
      // Read the URL value.
      const tx = db.transaction(SETTINGS_STORE, 'readonly');
      const store = tx.objectStore(SETTINGS_STORE);
      const request = store.get('ratesUrl');
      request.onsuccess = () => {
        const record = request.result;
        // Default to empty string when missing.
        resolve(record ? record.value : '');
      };
      request.onerror = () => reject(request.error);
      tx.onerror = () => reject(tx.error);
    });
  }

  // Converts amounts to the target currency using USD as base.
  function convertAmount(amount, from, to, rates) {
    // Return the raw amount when rates are missing.
    if (!rates || !rates[from] || !rates[to]) {
      return Number(amount);
    }
    // Convert to USD, then to target currency.
    const amountInUsd = Number(amount) / rates[from];
    return amountInUsd * rates[to];
  }

  // Fallback rates for offline usage.
  function defaultRates() {
    // Matches the required JSON schema.
    return { USD: 1, GBP: 0.6, EURO: 0.7, ILS: 3.4 };
  }
}());
