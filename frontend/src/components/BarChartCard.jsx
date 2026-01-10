// Bar chart showing totals per month.
// Chart.js React wrapper.
import { Bar } from 'react-chartjs-2';
// MUI card components.
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

// Month labels for the x-axis.
const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function BarChartCard({ data, currency }) {
  // When no totals exist, render a friendly message.
  if (!data || !data.totals || data.totals.every((v) => v === 0)) {
    return (
      <Card><CardContent><Typography variant="body1">No data for the bar chart.</Typography></CardContent></Card>
    );
  }
  // Prepare the dataset for Chart.js.
  const chartData = {
    labels: monthLabels,
    // Single dataset for yearly totals.
    datasets: [
      {
        label: `Monthly totals (${currency})`,
        // Data values already converted to the selected currency.
        data: data.totals,
        backgroundColor: '#1976d2',
      },
    ],
  };
  // Compose the chart content block.
  const chartBody = (
    <CardContent>
      <Typography variant="h6" gutterBottom>Yearly Overview</Typography>
      <Bar data={chartData} />
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
export default BarChartCard;
