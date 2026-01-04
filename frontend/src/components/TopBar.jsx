// Simple top bar for the application shell.
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

function TopBar() {
  // Keeps the header consistent across screens.
  return (
    <AppBar position="static" color="primary" enableColorOnDark>
      <Toolbar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" component="div">
            Cost Manager
          </Typography>
          <Typography variant="body2" component="div">
            Front-End Final Project
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
