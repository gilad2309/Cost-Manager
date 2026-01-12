// Settings card to manage the exchange rates URL.
// React state hook.
import { useState } from 'react';
// MUI card components.
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
// MUI text and alert elements.
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

function SettingsPanel({ initialUrl, onSave, onTest }) {
  // Store local input for the URL.
  const [url, setUrl] = useState(initialUrl || '');
  const [message, setMessage] = useState('');

  // Saves the new URL to IndexedDB.
  const handleSave = async () => {
    // Clear previous message, then save.
    setMessage('');
    await onSave(url);
    setMessage('Saved settings.');
  };

  // Triggers a test fetch.
  const handleTest = async () => {
    // Clear previous message, then test.
    setMessage('');
    const ok = await onTest(url);
    // Update status based on the fetch result.
    if (ok) {
      setMessage('Rates fetched successfully.');
      return;
    }
    setMessage('Fetching rates failed. Check the URL or CORS.');
  };

  // Status message element when available.
  const statusMessage = message ? (
    <Alert severity="info" sx={{ mt: 1, mb: 1.5 }}>{message}</Alert>
  ) : null;

  // Input for the exchange rates URL.
  const urlField = (
    // Full-width input for the remote URL.
    <TextField
      label="Exchange Rates URL" fullWidth sx={{ mt: 2 }}
      value={url} onChange={(e) => setUrl(e.target.value)}
      placeholder="https://example.com/rates.json"
    />
  );
  // Card body content for the settings form.
  const cardBody = (
    <CardContent sx={{ pb: 0 }}>
      <Typography variant="h6" gutterBottom>Settings</Typography>
      {statusMessage}
      {urlField}
    </CardContent>
  );
  // Action buttons for fetch and save.
  const actionButtons = (
    <CardActions sx={{ px: 2, pb: 2, pt: 0, mt: 1, gap: 1 }}>
      <Button variant="outlined" onClick={handleTest}>Test Fetch</Button>
      <Button variant="contained" onClick={handleSave}>Save</Button>
    </CardActions>
  );
  // Render the settings card.
  return (
    <Card>
      {cardBody}
      {actionButtons}
    </Card>
  );
  // End of settings panel render.
}
// Export the component.
export default SettingsPanel;
