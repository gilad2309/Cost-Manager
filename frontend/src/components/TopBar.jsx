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
  const titleBlock = (
    <Stack spacing={0.2}>
      <Typography variant="h5" component="div" className="top-bar__title">
        Cost Manager
      </Typography>
      <Typography variant="body2" component="div" className="top-bar__subtitle">
        Expense tracking and reporting
      </Typography>
    </Stack>
  );
  const metaBlock = (
    <Box className="top-bar__meta">
      <img src="/money.png" alt="Cash icon" className="top-bar__icon" />
    </Box>
  );
  // Render the app bar shell.
  return (
    <AppBar
      position="sticky"
      elevation={0}
      className="top-bar"
    >
      <Toolbar className="top-bar__toolbar">
        <Container maxWidth="lg" className="top-bar__content">
          {titleBlock}
          {metaBlock}
        </Container>
      </Toolbar>
    </AppBar>
  );
}

// Export the component.
export default TopBar;
