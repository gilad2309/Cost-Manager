// React runtime and DOM root.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// MUI theme providers.
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
// React Query client for async data.
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// Global styles and app entry.
import './index.css';
import './ui.css';
import App from './app.jsx';

// Theme for a clean, professional dashboard aesthetic.
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0f2a43', contrastText: '#ffffff' },
    secondary: { main: '#0ea5a5' },
    background: { default: '#f6f8fb', paper: '#ffffff' },
    text: { primary: '#0f172a', secondary: '#55627a' },
    divider: '#e1e6ef',
  },
  typography: {
    fontFamily: '"IBM Plex Sans", "Segoe UI", Arial, sans-serif',
    h1: { fontFamily: '"Sora", "IBM Plex Sans", sans-serif', fontWeight: 700 },
    h2: { fontFamily: '"Sora", "IBM Plex Sans", sans-serif', fontWeight: 700 },
    h3: { fontFamily: '"Sora", "IBM Plex Sans", sans-serif', fontWeight: 700 },
    h4: { fontFamily: '"Sora", "IBM Plex Sans", sans-serif', fontWeight: 700 },
    h5: { fontFamily: '"Sora", "IBM Plex Sans", sans-serif', fontWeight: 700 },
    h6: { fontFamily: '"Sora", "IBM Plex Sans", sans-serif', fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          border: '1px solid #e1e6ef',
          boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)',
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 12, paddingInline: 18 },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: { fontWeight: 600, color: '#0f172a' },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:nth-of-type(even)': { backgroundColor: 'rgba(15, 42, 67, 0.03)' },
        },
      },
    },
    MuiTextField: {
      defaultProps: { size: 'small' },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: '#e1e6ef' },
      },
    },
  },
});

// React Query client for data fetching and caching.
const queryClient = new QueryClient();

// Mount the React app and top-level providers.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}><CssBaseline /><App /></ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
);
// End of bootstrap.
