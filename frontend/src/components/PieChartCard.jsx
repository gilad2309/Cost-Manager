// Pie chart for category totals.
// React hooks for render timing.
import { useEffect, useState } from 'react';
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
  const [renderChart, setRenderChart] = useState(false);
  // Wait for fonts/layout to settle before mounting the chart canvas.
  useEffect(() => {
    let isActive = true;
    const settleLayout = async () => {
      if (document.fonts && document.fonts.ready) {
        try {
          await document.fonts.ready;
        } catch (error) {
          void error;
        }
      }
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
  // Accent palette for slices.
  const paletteColors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    // Warm and neutral accents.
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
        // Apply the palette consistently.
        backgroundColor: paletteColors.map((color) => alpha(color, 0.85)),
        borderColor: paletteColors.map((color) => alpha(color, 1)),
        borderWidth: 0,
      },
    ],
  };
  // Chart layout options.
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    resizeDelay: 120,
    animation: { duration: 650, easing: 'easeOutQuart' },
    plugins: {
      // Legend styling for slice labels.
      legend: {
        position: 'bottom',
        // Legend label metrics.
        labels: {
          usePointStyle: true,
          boxWidth: 10,
          // Legend label color and spacing.
          color: theme.palette.text.secondary,
          padding: 16,
        },
      },
    },
  };
  // Compose the chart content block.
  // Keep the chart height consistent with the bar chart card.
  const chartBody = (
    <CardContent>
      <Typography variant="h6" gutterBottom>Category Breakdown</Typography>
      {periodLabel ? (<Typography variant="body2" color="text.secondary" gutterBottom>{periodLabel}</Typography>) : null}
      <Box className="pie-chart__plot">
        {renderChart ? <Pie data={chartData} options={chartOptions} /> : null}
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
