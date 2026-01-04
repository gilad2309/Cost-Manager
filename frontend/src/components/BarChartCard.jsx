// Bar chart showing totals per month.
import { Bar } from 'react-chartjs-2';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function BarChartCard({ data, currency }) {
  // When no totals exist, render a friendly message.
  if (!data || !data.totals || data.totals.every((v) => v === 0)) {
    return (
      <Card>
        <CardContent>
          <Typography variant="body1">No data for the bar chart.</Typography>
        </CardContent>
      </Card>
    );
  }
  const chartData = {
    labels: monthLabels,
    datasets: [
      {
        label: `Monthly totals (${currency})`,
        data: data.totals,
        backgroundColor: '#1976d2',
      },
    ],
  };
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Yearly Overview
        </Typography>
        <Bar data={chartData} />
      </CardContent>
    </Card>
  );
}

export default BarChartCard;
