// Vanilla IndexedDB helper - attaches idb to the global object.
// Keep semicolons and short comments to satisfy the style guide.
(function attachIdb() {
  const DB_NAME = 'costsdb';
  const DB_VERSION = 1;
  const COSTS_STORE = 'costs';
  const SETTINGS_STORE = 'settings';

  // Public API exposed on window.idb.
  const api = {
    openCostsDB,
    addCost,
    getReport,
    getYearlySummary,
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
      const request = indexedDB.open(databaseName || DB_NAME, databaseVersion || DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(COSTS_STORE)) {
          const store = db.createObjectStore(COSTS_STORE, { keyPath: 'id', autoIncrement: true });
          store.createIndex('date', 'date', { unique: false });
        }
        if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
          db.createObjectStore(SETTINGS_STORE, { keyPath: 'key' });
        }
      };
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        resolve({
          addCost: (cost) => addCost(db, cost),
          getReport: (year, month, currency, rates) => getReport(db, year, month, currency, rates),
          getYearlySummary: (year, currency, rates) => getYearlySummary(db, year, currency, rates),
          saveSettings: (url) => saveRatesUrl(db, url),
          loadSettings: () => loadRatesUrl(db),
        });
      };
    });
  }

  // Adds a cost item with current date.
  function addCost(db, cost) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(COSTS_STORE, 'readwrite');
      const store = tx.objectStore(COSTS_STORE);
      const now = new Date();
      const payload = {
        sum: Number(cost.sum),
        currency: cost.currency,
        category: cost.category,
        description: cost.description,
        date: now.toISOString(),
      };
      const addRequest = store.add(payload);
      tx.oncomplete = () => resolve(payload);
      tx.onerror = () => reject(tx.error);
      addRequest.onerror = () => reject(addRequest.error);
    });
  }

  // Gets a monthly report and converts currency when rates exist.
  function getReport(db, year, month, currency, rates) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(COSTS_STORE, 'readonly');
      const store = tx.objectStore(COSTS_STORE);
      const cursorRequest = store.openCursor();
      const costs = [];
      cursorRequest.onsuccess = () => {
        const cursor = cursorRequest.result;
        if (cursor) {
          const value = cursor.value;
          const d = new Date(value.date);
          if (d.getFullYear() === year && d.getMonth() + 1 === month) {
            const convertedSum = convertAmount(value.sum, value.currency, currency, rates);
            costs.push({
              sum: convertedSum,
              currency,
              category: value.category,
              description: value.description,
              Date: { day: d.getDate() },
            });
          }
          cursor.continue();
          return;
        }
        const total = costs.reduce((acc, item) => acc + item.sum, 0);
        resolve({ year, month, costs, total: { currency, total } });
      };
      cursorRequest.onerror = () => reject(cursorRequest.error);
      tx.onerror = () => reject(tx.error);
    });
  }

  // Summarizes a full year for chart needs.
  function getYearlySummary(db, year, currency, rates) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(COSTS_STORE, 'readonly');
      const store = tx.objectStore(COSTS_STORE);
      const cursorRequest = store.openCursor();
      const buckets = Array.from({ length: 12 }, () => 0);
      cursorRequest.onsuccess = () => {
        const cursor = cursorRequest.result;
        if (cursor) {
          const value = cursor.value;
          const d = new Date(value.date);
          if (d.getFullYear() === year) {
            const idx = d.getMonth();
            buckets[idx] += convertAmount(value.sum, value.currency, currency, rates);
          }
          cursor.continue();
          return;
        }
        resolve({ year, currency, totals: buckets });
      };
      cursorRequest.onerror = () => reject(cursorRequest.error);
      tx.onerror = () => reject(tx.error);
    });
  }

  // Saves the rates URL to the settings store.
  function saveRatesUrl(db, url) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(SETTINGS_STORE, 'readwrite');
      const store = tx.objectStore(SETTINGS_STORE);
      store.put({ key: 'ratesUrl', value: url });
      tx.oncomplete = () => resolve(url);
      tx.onerror = () => reject(tx.error);
    });
  }

  // Loads the rates URL from the settings store.
  function loadRatesUrl(db) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(SETTINGS_STORE, 'readonly');
      const store = tx.objectStore(SETTINGS_STORE);
      const request = store.get('ratesUrl');
      request.onsuccess = () => {
        const record = request.result;
        resolve(record ? record.value : '');
      };
      request.onerror = () => reject(request.error);
      tx.onerror = () => reject(tx.error);
    });
  }

  // Converts amounts to the target currency using USD as base.
  function convertAmount(amount, from, to, rates) {
    if (!rates || !rates[from] || !rates[to]) {
      return Number(amount);
    }
    const amountInUsd = Number(amount) / rates[from];
    return amountInUsd * rates[to];
  }

  // Fallback rates for offline usage.
  function defaultRates() {
    return { USD: 1, GBP: 0.6, EURO: 0.7, ILS: 3.4 };
  }
}());
