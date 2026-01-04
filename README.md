# Cost Manager

React + MUI cost manager that lives entirely in the browser. It stores your expenses in IndexedDB (so it works offline), lets you tag them by category, and converts totals/charts into any of the supported currencies using a live rates JSON you provide.

## Requirements
- Node.js 18+ and npm.

## Run locally
```bash
cd frontend
npm install
npm run dev        # start dev server (Vite)
npm run build      # production build
```

## Using the app (for users)
1. Open the app in your browser (dev server or deployed URL).
2. Go to **Rates / Settings**.
3. Paste a working exchange-rates JSON URL (https://rates-json.onrender.com/rates.json) that returns:
   ```json
   {"USD":1,"GBP":0.6,"EURO":0.7,"ILS":3.4}
   ```
   The URL must allow CORS (`Access-Control-Allow-Origin: *`).
4. Click **Save**, then **Test Fetch**. Current rates appear only after a successful test.
5. Add costs (sum, currency, category, description). Each entry is timestamped automatically.
6. Use **Reports** to filter by month/year/currency and see detailed tables plus totals.
7. Switch to **Charts** for a pie (category breakdown) and bar (12-month totals) view in your chosen currency.
