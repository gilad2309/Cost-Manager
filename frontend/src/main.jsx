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
import App from './app.jsx';

// Theme prefers a neutral palette.
const theme = createTheme({
  palette: {
    mode: 'light',
    // Accent colors used by MUI components.
    primary: { main: '#1976d2' },
    secondary: { main: '#9c27b0' },
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
