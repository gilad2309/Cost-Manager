// Main application shell for the cost manager.
// React hooks for state and lifecycle.
import { useCallback, useEffect, useMemo, useState } from 'react';
// MUI layout components.
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
// MUI form controls.
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
// MUI typography and feedback.
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
// MUI surfaces and dividers.
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
// Chart.js elements used by chart components.
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
// Local UI components.
import TopBar from './components/TopBar.jsx';
import AddCostForm from './components/AddCostForm.jsx';
import SettingsPanel from './components/SettingsPanel.jsx';
import ReportTable from './components/ReportTable.jsx';
import PieChartCard from './components/PieChartCard.jsx';
import BarChartCard from './components/BarChartCard.jsx';
// Data access and rates helpers.
import { openCostsDB, defaultRates, convertAmount } from './lib/idb.js';
import { fetchRates as fetchRemoteRates } from './lib/rates.js';
// App-specific styles.
import './app.css';

// Register chart.js elements once.
ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

// Supported currencies per instructions.
const currencyOptions = ['USD', 'ILS', 'GBP', 'EURO'];
const monthLabels = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const DEFAULT_RATES_URL = 'https://rates-json.onrender.com/rates.json';

function App() {
  // Database handle for IndexedDB.
  const [db, setDb] = useState(null);
  // Rates configuration and active values.
  const [ratesUrl, setRatesUrl] = useState('');
  const [rates, setRates] = useState(defaultRates());
  const [previewRates, setPreviewRates] = useState(null);
  // UI status and data results.
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [yearlyData, setYearlyData] = useState(null);
  // Current view selection.
  const [view, setView] = useState('home'); // home | charts | settings
  // Filter state for reports.
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    currency: 'USD',
  });

  // Fetch rates from the configured URL.
  const handleFetchRates = useCallback(async (url, showPreview = false) => {
    // Normalize the URL and fall back to the default.
    const trimmedUrl = (url || '').trim();
    if (showPreview && !trimmedUrl) {
      setRates(defaultRates());
      setPreviewRates(null);
      setStatus('Using default rates (fetch failed).');
      return false;
    }
    const effectiveUrl = trimmedUrl ? trimmedUrl : DEFAULT_RATES_URL;
    // Notify the user while loading.
    setStatus('Fetching rates...');
    try {
      // Load rates and optionally show the preview.
      const fetched = await fetchRemoteRates(effectiveUrl);
      setRates(fetched);
      // Update preview state when requested.
      if (showPreview) {
        setPreviewRates(fetched);
      }
      setStatus('Rates updated.');
      return true;
    } catch (error) {
      // Ignore error details and fall back to defaults.
      void error;
      setRates(defaultRates());
      setPreviewRates(null);
      setStatus('Using default rates (fetch failed).');
      return false;
    }
    // End of rate fetch handler.
  }, [DEFAULT_RATES_URL, defaultRates, fetchRemoteRates]);

  // Refresh report and yearly summary based on filters.
  const refreshReport = useCallback(async () => {
    if (!db) {
      return;
    }
    // Load report data and yearly totals.
    setLoading(true);
    try {
      const rep = await db.getReport(filters.year, filters.month, filters.currency, rates);
      const yearly = await db.getYearlySummary(filters.year, filters.currency, rates);
      // Store results in state.
      setReport(rep);
      setYearlyData(yearly);
    } catch (error) {
      void error;
      setReport(null);
      setYearlyData(null);
      openCostsDB().then((database) => {
        setDb(database);
      });
    } finally {
      setLoading(false);
    }
  }, [db, filters.currency, filters.month, filters.year, rates]);

  // Open the database on mount.
  useEffect(() => {
    openCostsDB().then((database) => {
      setDb(database);
    });
  }, []);

  // Load saved settings and rates once DB is ready.
  useEffect(() => {
    if (!db) {
      return;
    }
    db.loadSettings().then((savedUrl) => {
      const url = savedUrl || '';
      setRatesUrl(url);
      // Fetch rates using the stored URL.
      handleFetchRates(url, false);
    });
  }, [db, handleFetchRates]);

  // Add a cost item through the DB wrapper.
  const handleAddCost = async (cost) => {
    if (!db) {
      return;
    }
    // Persist the cost and refresh totals.
    try {
      await db.addCost(cost);
      setStatus('Cost item added.');
      refreshReport();
      return;
    } catch (error) {
      void error;
    }
    const nextDb = await openCostsDB();
    setDb(nextDb);
    await nextDb.addCost(cost);
    setStatus('Cost item added.');
    refreshReport();
  };

  // Persist the settings URL and refresh rates.
  const handleSaveSettings = async (url) => {
    if (!db) {
      return;
    }
    // Store the URL before fetching.
    await db.saveSettings(url);
    setRatesUrl(url);
    setPreviewRates(null);
    // Reload rates using the stored URL.
    const ok = await handleFetchRates(url, false);
    // Share status based on the fetch result.
    if (ok) {
      setStatus('Settings saved. Rates updated.');
      return;
    }
    setStatus('Settings saved. Using default rates (fetch failed).');
  };

  // Re-run report when filters or rates change.
  useEffect(() => {
    // Keep table and charts in sync.
    refreshReport();
  }, [refreshReport]);

  // Build pie chart data from the report.
  const pieData = useMemo(() => {
    if (!report || !report.costs) {
      return [];
    }
    // Aggregate per-category totals in the selected currency.
    const map = new Map();
    report.costs.forEach((item) => {
      const convertedSum = convertAmount(item.sum, item.currency, filters.currency, rates);
      const prev = map.get(item.category) || 0;
      map.set(item.category, prev + convertedSum);
    });
    // Convert map into chart-friendly array.
    return Array.from(map.entries()).map(([category, sum]) => ({ category, sum }));
  }, [report, rates, filters.currency]);

  // Change handler for filters.
  const onFilterChange = (field) => (event) => {
    // Coerce numeric fields while preserving string input.
    setFilters((prev) => ({ ...prev, [field]: Number(event.target.value) || event.target.value }));
  };

  // Status banner element when a message is available.
  const statusBanner = status ? <Alert severity="info" className="status-banner">{status}</Alert> : null;
  // Navigation control row.
  const navTabs = <NavTabs view={view} onNavigate={setView} />;
  const headerStack = (
    <Stack spacing={1} className="app__header-stack">
      {statusBanner}
      {navTabs}
    </Stack>
  );
  // Report content with loading fallback.
  const reportContent = loading ? (
    <Box className="app__loading">
      <CircularProgress />
    </Box>
  ) : (
    <ReportTable report={report} />
  );
  // Capture costs section for the home view.
  const captureCostsSection = (
    <SectionCard title="Capture Costs" subtitle="Add spending.">
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 7 }}><AddCostForm onAdd={handleAddCost} /></Grid>
      </Grid>
    </SectionCard>
  );
  // Reports section for the home view.
  const reportsSection = (
    <SectionCard title="Reports" subtitle="Filter by month, year, and currency to review totals.">
      <CardFilterRow filters={filters} onChange={onFilterChange} onRefresh={refreshReport} />
      {reportContent}
    </SectionCard>
  );
  // Home view layout.
  const homeView = (
    <>
      {captureCostsSection}
      {reportsSection}
    </>
  );
  // Pie chart grid cell.
  const pieChartCell = (
    <Grid size={{ xs: 12, md: 6 }}>
      <PieChartCard
        data={pieData}
        currency={filters.currency}
        periodLabel={`${monthLabels[filters.month - 1]} ${filters.year}`}
      />
    </Grid>
  );
  // Bar chart grid cell.
  const barChartCell = (
    <Grid size={{ xs: 12, md: 6 }}>
      <BarChartCard data={yearlyData} currency={filters.currency} />
    </Grid>
  );
  // Chart grid for the insights view.
  const chartsGrid = (
    <Grid container spacing={2}>
      {pieChartCell}
      {barChartCell}
    </Grid>
  );
  // Charts view layout.
  const chartsView = (
    <SectionCard title="Insights" subtitle="Visualize category breakdowns and yearly trends.">
      {chartsGrid}
    </SectionCard>
  );
  // Intro text for the rates preview.
  const ratesIntro = (
    <Typography variant="body2" color="text.secondary">
      Use this page to update and test your currency rates source.
    </Typography>
  );
  // Rates preview column for settings view.
  const ratesPreview = (
    <Stack spacing={2}>
      {ratesIntro}
      <RatesPreview rates={previewRates} />
    </Stack>
  );
  // Settings panel column.
  const settingsPanelCell = (
    // Settings inputs content.
    <Grid size={{ xs: 12, md: 6 }}>
      <SettingsPanel key={ratesUrl} initialUrl={ratesUrl} onSave={handleSaveSettings}
        onTest={(url) => handleFetchRates(url, true)}
      />
    </Grid>
  );
  // Settings panel column complete.
  // Rates preview column.
  const settingsPreviewCell = (
    <Grid size={{ xs: 12, md: 6 }}>
      {ratesPreview}
    </Grid>
  );
  // Settings layout grid for the settings view.
  const settingsGrid = (
    <Grid container spacing={2}>
      {settingsPanelCell}
      {settingsPreviewCell}
    </Grid>
  );
  // Settings view layout.
  const settingsView = (
    <SectionCard title="Rates & Settings" subtitle="Manage the exchange rates URL and test the fetch.">
      {settingsGrid}
    </SectionCard>
  );

  // View content selected by the nav state.
  const viewContent = (
    <>
      {view === 'home' ? homeView : null}
      {view === 'charts' ? chartsView : null}
      {view === 'settings' ? settingsView : null}
    </>
  );
  // Stack layout for the main content.
  const pageStack = (
    <Stack spacing={3}>
      {headerStack}
      {viewContent}
    </Stack>
  );
  // Container wrapping the main content.
  const pageContainer = (
    <Container maxWidth="lg" className="app__container">
      {pageStack}
    </Container>
  );
  // Render the page layout.
  return (
    <>
      <TopBar />
      {pageContainer}
    </>
  );
  // End of App render.
}

// Small filter row component to keep App lean.
function CardFilterRow({ filters, onChange, onRefresh }) {
  // Months for selection.
  // Month options mapped into menu items.
  const months = [
    // Q1 months.
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    // Q2 months.
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    // Q3 months.
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    // Q4 months.
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];
  // Build menu items for the month selector.
  const monthItems = months.map((m) => (
    <MenuItem key={m.value} value={m.value}>
      {m.label}
    </MenuItem>
  ));
  // Build menu items for the currency selector.
  const currencyItems = currencyOptions.map((c) => (
    <MenuItem key={c} value={c}>
      {c}
    </MenuItem>
  ));
  // Month selector control.
  const monthField = (
    // Month dropdown input.
    <TextField select label="Month" size="small" value={filters.month} onChange={onChange('month')}>
      {monthItems}
    </TextField>
  );
  // End of month field setup.
  // Year input control.
  const yearField = (
    // Numeric year input.
    <TextField label="Year" type="number" size="small" value={filters.year} onChange={onChange('year')} />
  );
  // End of year field setup.
  // Currency selector control.
  const currencyField = (
    // Currency dropdown input.
    <TextField select label="Currency" size="small" value={filters.currency} onChange={onChange('currency')}>
      {currencyItems}
    </TextField>
  );
  // End of currency field setup.
  // Refresh button control.
  const refreshButton = <Button variant="outlined" onClick={onRefresh}>Refresh</Button>;
  // Collection of filter controls in order.
  const filterControls = (
    <>{monthField}{yearField}{currencyField}{refreshButton}</>
  );
  // Render the filter row layout.
  return (
    <Stack spacing={2} direction={{ xs: 'column', md: 'row' }} alignItems="center">
      <Typography variant="h6">Report Filters</Typography>
      {filterControls}
    </Stack>
  );
  // Filter row layout rendered above.
  // End of filter row rendering.
}

// Reusable card wrapper for page sections.
function SectionCard({ title, subtitle, children }) {
  // Optional subtitle element.
  const subtitleText = subtitle ? (
    <Typography variant="body2" color="text.secondary">
      {subtitle}
    </Typography>
  ) : null;
  // Section header block with title and subtitle.
  const headerBlock = (
    <Box>
      <Typography variant="h6">{title}</Typography>
      {subtitleText}
    </Box>
  );
  // Section body content layout.
  const sectionBody = (
    <Stack spacing={2}>
      {headerBlock}
      <Divider />
      {children}
    </Stack>
  );
  // Render the section shell.
  return (
    <Paper elevation={1} className="section-card">
      {sectionBody}
    </Paper>
  );
  // Section layout rendered above.
  // End of section card render.
}

// Navigation button row for view switching.
function NavTabs({ view, onNavigate }) {
  const handleChange = (event, next) => {
    void event;
    onNavigate(next);
  };
  return (
    <Tabs
      value={view}
      onChange={handleChange}
      className="nav-tabs"
    >
      <Tab label="Home" value="home" className="nav-tabs__tab" />
      <Tab label="Charts" value="charts" className="nav-tabs__tab" />
      <Tab label="Rates / Settings" value="settings" className="nav-tabs__tab" />
    </Tabs>
  );
}

function RatesPreview({ rates }) {
  // Hide preview when nothing to show.
  if (!rates) {
    return null;
  }
  // Keep a stable order for display.
  const ordered = ['USD', 'GBP', 'EURO', 'ILS'];
  // Build the list of rate rows.
  const rateRows = ordered.map((code) => (
    <Typography key={code} variant="body2">
      {code}: {rates[code] !== undefined ? rates[code] : 'n/a'}
    </Typography>
  ));
  // Title for the rates list.
  const ratesTitle = (
    <Typography variant="subtitle2" gutterBottom>
      Current rates (relative to USD)
    </Typography>
  );
  // Stack layout for the rates list.
  const ratesList = (
    <Stack spacing={0.5}>
      {rateRows}
    </Stack>
  );
  // Render the rates list.
  return (
    <Box className="rates-preview">
      {ratesTitle}
      {ratesList}
    </Box>
  );
}
// Export the app entry.
export default App;
