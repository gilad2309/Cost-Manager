// Pie chart for category totals.
import { Pie } from 'react-chartjs-2';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

function PieChartCard({ data, currency }) {
  // Empty state guard.
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="body1">No data for the pie chart.</Typography>
        </CardContent>
      </Card>
    );
  }
  // Build chart.js dataset.
  const chartData = {
    labels: data.map((item) => item.category),
    datasets: [
      {
        label: `Totals (${currency})`,
        data: data.map((item) => item.sum),
        backgroundColor: ['#1976d2', '#9c27b0', '#ff9800', '#2e7d32', '#455a64'],
      },
    ],
  };
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Category Breakdown
        </Typography>
        <Pie data={chartData} />
      </CardContent>
    </Card>
  );
}

export default PieChartCard;
