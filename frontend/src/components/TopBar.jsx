// Simple top bar for the application shell.
// MUI app bar components.
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

function TopBar() {
  // Keeps the header consistent across screens.
  // Layout content for the toolbar.
  // Title block with name and subtitle.
  const titleBlock = (
    <Stack spacing={0.2}>
      <Typography variant="h5" component="div" sx={{ letterSpacing: '0.3px' }}>Cost Manager</Typography>
      <Typography variant="body2" component="div" sx={{ color: 'rgba(255, 255, 255, 0.75)' }}>
        Expense tracking and reporting
      </Typography>
    </Stack>
  );
  // Meta block with the header icon.
  const metaBlock = (
    <Box sx={{ display: { xs: 'none', md: 'block' }, textAlign: 'right' }}>
      <Box component="img" src="/money.png" alt="Cash icon" sx={{
        width: 42,
        height: 42,
        objectFit: 'contain',
        filter: 'drop-shadow(0 6px 12px rgba(0, 0, 0, 0.25))',
      }} />
    </Box>
  );
  // Match the previous gradient header styling via sx overrides.
  const appBarSx = {
    background: 'linear-gradient(90deg, #0f2a43 0%, #133a55 55%, #0b2238 100%)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
    color: '#ffffff',
  };
  // Keep toolbar height aligned with the earlier CSS.
  const toolbarSx = (theme) => ({
    minHeight: 72,
    [theme.breakpoints.up('md')]: {
      minHeight: 84,
    },
  });
  // Render the app bar shell.
  return (
    // Header container.
    <AppBar position="sticky" elevation={0} sx={appBarSx}>
      <Toolbar sx={toolbarSx}>
        <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {titleBlock}
          {metaBlock}
        </Container>
      </Toolbar>
    </AppBar>
  );
}

// Export the component.
export default TopBar;
