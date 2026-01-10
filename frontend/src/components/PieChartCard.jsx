// Pie chart for category totals.
// Chart.js React wrapper.
import { Pie } from 'react-chartjs-2';
// MUI card components.
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

function PieChartCard({ data, currency }) {
  // Empty state guard.
  if (!data || data.length === 0) {
    return (
      <Card><CardContent><Typography variant="body1">No data for the pie chart.</Typography></CardContent></Card>
    );
  }
  // Build chart.js dataset.
  const chartData = {
    labels: data.map((item) => item.category),
    // Single dataset for category totals.
    datasets: [
      {
        label: `Totals (${currency})`,
        // Data values are aligned to the selected currency.
        data: data.map((item) => item.sum),
        backgroundColor: ['#1976d2', '#9c27b0', '#ff9800', '#2e7d32', '#455a64'],
      },
    ],
  };
  // Compose the chart content block.
  const chartBody = (
    <CardContent>
      <Typography variant="h6" gutterBottom>Category Breakdown</Typography>
      <Pie data={chartData} />
    </CardContent>
  );
  // Render the chart card.
  return (
    <Card>
      {chartBody}
    </Card>
  );
}

// Export the component.
export default PieChartCard;
