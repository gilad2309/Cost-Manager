// Form for adding a new cost item.
import { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid2';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

// Options for currencies and categories.
const currencyOptions = ['USD', 'ILS', 'GBP', 'EURO'];
const defaultCategories = ['Food', 'Car', 'Education', 'Entertainment', 'Other'];

function AddCostForm({ onAdd }) {
  // Local state holds form values.
  const [form, setForm] = useState({
    sum: '',
    currency: 'USD',
    category: 'Food',
    description: '',
  });
  const [error, setError] = useState('');

  // Handles updates on inputs.
  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  // Validates and sends the add request.
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!form.sum || Number(form.sum) <= 0) {
      setError('Please provide a positive sum.');
      return;
    }
    if (!form.description.trim()) {
      setError('Please add a description.');
      return;
    }
    try {
      await onAdd({
        sum: Number(form.sum),
        currency: form.currency,
        category: form.category,
        description: form.description,
      });
      // Reset after success.
      setForm({
        sum: '',
        currency: 'USD',
        category: 'Food',
        description: '',
      });
    } catch (e) {
      setError('Failed to add cost item.');
    }
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ pb: 0 }}>
        <Typography variant="h6" gutterBottom>
          Add Cost
        </Typography>
        {error ? <Alert severity="error">{error}</Alert> : null}
        <Grid
          container
          spacing={2}
          component="form"
          onSubmit={handleSubmit}
          sx={{ mt: 1 }}
        >
          <Grid xs={12} md={6}>
            <TextField
              label="Sum"
              type="number"
              fullWidth
              required
              value={form.sum}
              onChange={handleChange('sum')}
            />
          </Grid>
          <Grid xs={12} md={6}>
            <TextField
              select
              label="Currency"
              fullWidth
              value={form.currency}
              onChange={handleChange('currency')}
            >
              {currencyOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid xs={12} md={6}>
            <TextField
              select
              label="Category"
              fullWidth
              value={form.category}
              onChange={handleChange('category')}
            >
              {defaultCategories.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid xs={12} md={6}>
            <TextField
              label="Description"
              fullWidth
              required
              value={form.description}
              onChange={handleChange('description')}
            />
          </Grid>
        </Grid>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button type="submit" variant="contained" onClick={handleSubmit}>
          Save
        </Button>
      </CardActions>
    </Card>
  );
}

export default AddCostForm;
