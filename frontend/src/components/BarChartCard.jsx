// Bar chart showing totals per month.
// React hooks for render timing.
import { useEffect, useState } from 'react';
// Chart.js React wrapper.
import { Bar } from 'react-chartjs-2';
// MUI card components.
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

// Month labels for the x-axis.
const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function BarChartCard({ data, currency }) {
  const theme = useTheme();
  // Gate chart rendering to let layout settle before Chart.js mounts.
  const [renderChart, setRenderChart] = useState(false);
  // Wait for fonts/layout to settle before mounting the chart canvas.
  useEffect(() => {
    let isActive = true;
    const settleLayout = async () => {
      // Ensure fonts are loaded before scheduling the first render.
      if (document.fonts && document.fonts.ready) {
        try {
          await document.fonts.ready;
        } catch (error) {
          void error;
        }
      }
      // Defer mounting by two frames so layout settles before Chart.js animates.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (isActive) {
            setRenderChart(true);
          }
        });
      });
    };
    settleLayout();
    return () => {
      isActive = false;
    };
  }, []);
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
  // Prepare the dataset for Chart.js.
  const chartData = {
    labels: monthLabels,
    // Single dataset for yearly totals.
    datasets: [
      {
        label: `Monthly totals (${currency})`,
        // Data values already converted to the selected currency.
        data: data.totals,
        // Visual styling for the bars.
        backgroundColor: alpha(theme.palette.primary.main, 0.85),
        borderRadius: 8,
        maxBarThickness: 36,
      },
    ],
  };
  // Chart scales and grid styling.
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    resizeDelay: 120,
    animation: { duration: 650, easing: 'easeOutQuart' },
    plugins: {
      legend: { display: false },
    },
    scales: {
      // X axis styling.
      x: {
        grid: { display: false },
        ticks: { color: theme.palette.text.secondary },
      },
      // Y axis styling.
      y: {
        beginAtZero: true,
        grid: { color: alpha(theme.palette.primary.main, 0.12) },
        ticks: { color: theme.palette.text.secondary },
      },
    },
  };
  // Compose the chart content block.
  // Extra line-height prevents clipped glyphs in the heading.
  const chartBody = (
    <CardContent>
      <Typography variant="h6" gutterBottom sx={{ lineHeight: 1.5, pb: 0.25 }}>
        Yearly Overview
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom sx={{ lineHeight: 1.5, pb: 0.25 }}>
        Totals shown in {currency}
      </Typography>
      <Box className="bar-chart__plot">
        {renderChart ? <Bar data={chartData} options={chartOptions} /> : null}
      </Box>
    </CardContent>
  );
  // Render the chart card.
  return (
    <Card className="bar-chart__card">
      {chartBody}
    </Card>
  );
}

// Export the component.
export default BarChartCard;
