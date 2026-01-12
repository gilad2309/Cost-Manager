// Pie chart for category totals.
// Chart.js React wrapper.
import { Pie } from 'react-chartjs-2';
// MUI card components.
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

function PieChartCard({ data, currency, periodLabel }) {
  const theme = useTheme();
  // Empty state guard.
  if (!data || data.length === 0) {
    return (
      <Card><CardContent><Typography variant="body1">No data for the pie chart.</Typography></CardContent></Card>
    );
  }
  const paletteColors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    '#f59e0b',
    '#10b981',
    '#64748b',
  ];
  // Build chart.js dataset.
  const chartData = {
    labels: data.map((item) => item.category),
    // Single dataset for category totals.
    datasets: [
      {
        label: `Totals (${currency})`,
        // Data values are aligned to the selected currency.
        data: data.map((item) => item.sum),
        backgroundColor: paletteColors.map((color) => alpha(color, 0.85)),
        borderColor: paletteColors.map((color) => alpha(color, 1)),
        borderWidth: 0,
      },
    ],
  };
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          boxWidth: 10,
          color: theme.palette.text.secondary,
          padding: 16,
        },
      },
    },
  };
  // Compose the chart content block.
  const chartBody = (
    <CardContent>
      <Typography variant="h6" gutterBottom>Category Breakdown</Typography>
      {periodLabel ? (
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {periodLabel}
        </Typography>
      ) : null}
      <Box className="pie-chart__plot">
        <Pie data={chartData} options={chartOptions} />
      </Box>
    </CardContent>
  );
  // Render the chart card.
  return (
    <Card className="pie-chart__card">
      {chartBody}
    </Card>
  );
}

// Export the component.
export default PieChartCard;
