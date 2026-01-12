// Form for adding a new cost item.
// React state hook.
import { useState } from 'react';
// MUI layout and form components.
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid2';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
// MUI typography and alerts.
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
  // Track validation errors for user feedback.
  const [error, setError] = useState('');

  // Handles updates on inputs.
  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  // Validates and sends the add request.
  const handleSubmit = async (event) => {
    event.preventDefault();
    // Reset any previous error.
    setError('');
    // Validate numeric sum.
    if (!form.sum || Number(form.sum) <= 0) {
      setError('Please provide a positive sum.');
      return;
    }
    // Validate description content.
    if (!form.description.trim()) {
      setError('Please add a description.');
      return;
    }
    try {
      // Send the normalized cost to the parent.
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
    } catch (error) {
      // Ignore error details and surface a friendly message.
      void error;
      setError('Failed to add cost item.');
    }
  };

  // Error message element when validation fails.
  const errorMessage = error ? <Alert severity="error">{error}</Alert> : null;
  // Sum input field.
  const sumField = (
    <Grid size={{ xs: 12, md: 6 }}>
      <TextField label="Sum" type="number" fullWidth required value={form.sum} onChange={handleChange('sum')} />
    </Grid>
  );
  // Currency selector field.
  const currencyField = (
    <Grid size={{ xs: 12, md: 6 }}>
      <TextField select label="Currency" fullWidth value={form.currency} onChange={handleChange('currency')}>
        {currencyOptions.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
      </TextField>
    </Grid>
  );
  // Category selector field.
  const categoryField = (
    <Grid size={{ xs: 12, md: 6 }}>
      <TextField select label="Category" fullWidth value={form.category} onChange={handleChange('category')}>
        {defaultCategories.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
      </TextField>
    </Grid>
  );
  // Description input field.
  const descriptionField = (
    // Multiline layout for the description field.
    <Grid size={{ xs: 12, md: 6 }}>
      <TextField label="Description" fullWidth required value={form.description}
        onChange={handleChange('description')}
      />
    </Grid>
  );

  // Group the fields for the form grid.
  const formFields = (
    // Layout fields in a responsive grid.
    <Grid container spacing={2} component="form" onSubmit={handleSubmit} className="add-cost-form__grid">
      {sumField}
      {currencyField}
      {categoryField}
      {descriptionField}
    </Grid>
  );
  // Main card content with heading and fields.
  const cardContent = (
    <CardContent className="add-cost-form__content">
      <Typography variant="h6" gutterBottom>Add Cost</Typography>
      {errorMessage}
      {formFields}
    </CardContent>
  );
  // Action row for the submit button.
  const formActions = (
    <CardActions className="add-cost-form__actions">
      <Button type="submit" variant="contained" onClick={handleSubmit}>Save</Button>
    </CardActions>
  );
  // Render the form card.
  return (
    <Card className="add-cost-form__card">
      {cardContent}
      {formActions}
    </Card>
  );
  // End of form rendering.
}

// Export the component.
export default AddCostForm;
