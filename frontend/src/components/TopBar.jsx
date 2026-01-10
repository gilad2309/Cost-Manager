// Simple top bar for the application shell.
// MUI app bar components.
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

function TopBar() {
  // Keeps the header consistent across screens.
  // Layout content for the toolbar.
  const toolbarContent = (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h6" component="div">Cost Manager</Typography>
      <Typography variant="body2" component="div">Front-End Final Project</Typography>
    </Box>
  );
  // Render the app bar shell.
  return (
    <AppBar position="static" color="primary" enableColorOnDark>
      <Toolbar>{toolbarContent}</Toolbar>
    </AppBar>
  );
}

// Export the component.
export default TopBar;
