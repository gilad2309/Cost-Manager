// Main application shell for the cost manager.
import { useEffect, useMemo, useState } from 'react';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import TopBar from './components/TopBar.jsx';
import AddCostForm from './components/AddCostForm.jsx';
import SettingsPanel from './components/SettingsPanel.jsx';
import ReportTable from './components/ReportTable.jsx';
import PieChartCard from './components/PieChartCard.jsx';
import BarChartCard from './components/BarChartCard.jsx';
import { openCostsDB, defaultRates } from './lib/idb.js';
import { fetchRates as fetchRemoteRates } from './lib/rates.js';
import './App.css';

// Register chart.js elements once.
ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

// Supported currencies per instructions.
const currencyOptions = ['USD', 'ILS', 'GBP', 'EURO'];

function App() {
  // DB instance and rate data.
  const [db, setDb] = useState(null);
  const [ratesUrl, setRatesUrl] = useState('');
  const [rates, setRates] = useState(defaultRates());
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [yearlyData, setYearlyData] = useState(null);
  const [view, setView] = useState('home'); // home | charts | settings
  const [previewRates, setPreviewRates] = useState(null);
  // Filter state for reports.
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    currency: 'USD',
  });

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
      handleFetchRates(url);
    });
  }, [db]);

  // Fetch rates from the configured URL.
  const handleFetchRates = async (url) => {
    setStatus('Fetching rates...');
    try {
      const fetched = await fetchRemoteRates(url);
      setRates(fetched);
       setPreviewRates(fetched);
      setStatus('Rates updated.');
    } catch (e) {
      setRates(defaultRates());
      setPreviewRates(null);
      setStatus('Using default rates (fetch failed).');
    }
  };

  // Add a cost item through the DB wrapper.
  const handleAddCost = async (cost) => {
    if (!db) {
      return;
    }
    await db.addCost(cost);
    setStatus('Cost item added.');
    refreshReport();
  };

  // Persist the settings URL and refresh rates.
  const handleSaveSettings = async (url) => {
    if (!db) {
      return;
    }
    await db.saveSettings(url);
    setRatesUrl(url);
    setPreviewRates(null);
    setStatus('Settings saved. Run Test Fetch to load rates.');
  };

  // Refresh report and yearly summary based on filters.
  const refreshReport = async () => {
    if (!db) {
      return;
    }
    setLoading(true);
    const rep = await db.getReport(filters.year, filters.month, filters.currency, rates);
    const yearly = await db.getYearlySummary(filters.year, filters.currency, rates);
    setReport(rep);
    setYearlyData(yearly);
    setLoading(false);
  };

  // Re-run report when filters or rates change.
  useEffect(() => {
    refreshReport();
  }, [db, filters.year, filters.month, filters.currency, rates]);

  // Build pie chart data from the report.
  const pieData = useMemo(() => {
    if (!report || !report.costs) {
      return [];
    }
    const map = new Map();
    report.costs.forEach((item) => {
      const prev = map.get(item.category) || 0;
      map.set(item.category, prev + item.sum);
    });
    return Array.from(map.entries()).map(([category, sum]) => ({ category, sum }));
  }, [report]);

  // Change handler for filters.
  const onFilterChange = (field) => (event) => {
    setFilters((prev) => ({ ...prev, [field]: Number(event.target.value) || event.target.value }));
  };

  return (
    <>
      <TopBar />
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Stack spacing={3}>
          {status ? <Alert severity="info">{status}</Alert> : null}

          <NavButtons
            view={view}
            onNavigate={setView}
          />

          {view === 'home' ? (
            <>
              <SectionCard
                title="Capture Costs"
                subtitle="Add spending."
              >
                <Grid container spacing={2}>
                  <Grid xs={12} md={7}>
                    <AddCostForm onAdd={handleAddCost} />
                  </Grid>
                </Grid>
              </SectionCard>

              <SectionCard
                title="Reports"
                subtitle="Filter by month, year, and currency to review totals."
              >
                <CardFilterRow filters={filters} onChange={onFilterChange} onRefresh={refreshReport} />
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <ReportTable report={report} />
                )}
              </SectionCard>
            </>
          ) : null}

          {view === 'charts' ? (
            <SectionCard
              title="Insights"
              subtitle="Visualize category breakdowns and yearly trends."
            >
              <Grid container spacing={2}>
                <Grid xs={12} md={6}>
                  <PieChartCard data={pieData} currency={filters.currency} />
                </Grid>
                <Grid xs={12} md={6}>
                  <BarChartCard data={yearlyData} currency={filters.currency} />
                </Grid>
              </Grid>
            </SectionCard>
          ) : null}

          {view === 'settings' ? (
            <SectionCard
              title="Rates & Settings"
              subtitle="Manage the exchange rates URL and test the fetch."
            >
              <Grid container spacing={2}>
                <Grid xs={12} md={6}>
                  <SettingsPanel
                    initialUrl={ratesUrl}
                    onSave={handleSaveSettings}
                    onTest={handleFetchRates}
                  />
                </Grid>
                <Grid xs={12} md={6}>
                  <Stack spacing={2}>
                    <Typography variant="body2" color="text.secondary">
                      Use this page to update and test your currency rates source.
                    </Typography>
                    <RatesPreview rates={previewRates} />
                  </Stack>
                </Grid>
              </Grid>
            </SectionCard>
          ) : null}
        </Stack>
      </Container>
    </>
  );
}

// Small filter row component to keep App lean.
function CardFilterRow({ filters, onChange, onRefresh }) {
  // Months for selection.
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];
  return (
    <Stack spacing={2} direction={{ xs: 'column', md: 'row' }} alignItems="center">
      <Typography variant="h6">Report Filters</Typography>
      <TextField
        select
        label="Month"
        size="small"
        value={filters.month}
        onChange={onChange('month')}
      >
        {months.map((m) => (
          <MenuItem key={m.value} value={m.value}>
            {m.label}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        label="Year"
        type="number"
        size="small"
        value={filters.year}
        onChange={onChange('year')}
      />
      <TextField
        select
        label="Currency"
        size="small"
        value={filters.currency}
        onChange={onChange('currency')}
      >
        {currencyOptions.map((c) => (
          <MenuItem key={c} value={c}>
            {c}
          </MenuItem>
        ))}
      </TextField>
      <Button variant="outlined" onClick={onRefresh}>
        Refresh
      </Button>
    </Stack>
  );
}

function SectionCard({ title, subtitle, children }) {
  return (
    <Paper elevation={1} sx={{ p: 3, borderRadius: 2, backgroundColor: '#ffffff' }}>
      <Stack spacing={2}>
        <Box>
          <Typography variant="h6">{title}</Typography>
          {subtitle ? (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          ) : null}
        </Box>
        <Divider />
        {children}
      </Stack>
    </Paper>
  );
}

function NavButtons({ view, onNavigate }) {
  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      <Button
        variant={view === 'home' ? 'contained' : 'outlined'}
        onClick={() => onNavigate('home')}
      >
        Home
      </Button>
      <Button
        variant={view === 'charts' ? 'contained' : 'outlined'}
        onClick={() => onNavigate('charts')}
      >
        Charts
      </Button>
      <Button
        variant={view === 'settings' ? 'contained' : 'outlined'}
        onClick={() => onNavigate('settings')}
      >
        Rates / Settings
      </Button>
    </Box>
  );
}

function RatesPreview({ rates }) {
  if (!rates) {
    return null;
  }
  const ordered = ['USD', 'GBP', 'EURO', 'ILS'];
  return (
    <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 1, p: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        Current rates (relative to USD)
      </Typography>
      <Stack spacing={0.5}>
        {ordered.map((code) => (
          <Typography key={code} variant="body2">
            {code}: {rates[code] !== undefined ? rates[code] : '—'}
          </Typography>
        ))}
      </Stack>
    </Box>
  );
}

export default App;
