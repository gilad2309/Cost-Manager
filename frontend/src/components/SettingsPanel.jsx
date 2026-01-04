// Settings card to manage the exchange rates URL.
import { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

function SettingsPanel({ initialUrl, onSave, onTest }) {
  // Store local input for the URL.
  const [url, setUrl] = useState(initialUrl || '');
  const [message, setMessage] = useState('');

  // Keep the local field in sync when props change.
  useEffect(() => {
    setUrl(initialUrl || '');
  }, [initialUrl]);

  // Saves the new URL to IndexedDB.
  const handleSave = async () => {
    setMessage('');
    await onSave(url);
    setMessage('Saved settings.');
  };

  // Triggers a test fetch.
  const handleTest = async () => {
    setMessage('');
    try {
      await onTest(url);
      setMessage('Rates fetched successfully.');
    } catch (e) {
      setMessage('Fetching rates failed. Check the URL or CORS.');
    }
  };

  return (
    <Card>
      <CardContent sx={{ pb: 0 }}>
        <Typography variant="h6" gutterBottom>
          Settings
        </Typography>
        {message ? <Alert severity="info">{message}</Alert> : null}
        <TextField
          label="Exchange Rates URL"
          fullWidth
          sx={{ mt: 2 }}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder='https://example.com/rates.json'
        />
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2, gap: 1 }}>
        <Button variant="outlined" onClick={handleTest}>
          Test Fetch
        </Button>
        <Button variant="contained" onClick={handleSave}>
          Save
        </Button>
      </CardActions>
    </Card>
  );
}

export default SettingsPanel;
