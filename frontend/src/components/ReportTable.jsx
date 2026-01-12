// Monthly report table with totals.
// MUI table components.
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
// Remaining table primitives.
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

function ReportTable({ report }) {
  // Early exit for empty state.
  if (!report || !report.costs || report.costs.length === 0) {
    return (
      <Typography variant="body1" sx={{ my: 2 }}>
        No costs found for the selected month.
      </Typography>
    );
  }
  // Render table rows for each cost item.
  const rows = report.costs.map((row) => (
    <TableRow key={`${row.category}-${row.description}-${row.Date.day}`}>
      <TableCell>{row.Date.day}</TableCell><TableCell>{row.category}</TableCell>
      <TableCell>{row.description}</TableCell><TableCell>{row.currency}</TableCell>
      <TableCell align="right">{row.sum.toFixed(2)}</TableCell>
    </TableRow>
  ));
  // Total row at the bottom of the table.
  const totalRow = (
    <TableRow sx={{
      backgroundColor: 'rgba(14, 165, 165, 0.12)',
      '&:nth-of-type(even)': { backgroundColor: 'rgba(14, 165, 165, 0.12)' },
    }}>
      <TableCell colSpan={3} align="right" sx={{ fontWeight: 600 }}>Total</TableCell>
      <TableCell sx={{ fontWeight: 600 }}>{report.total.currency}</TableCell>
      <TableCell align="right" sx={{ fontWeight: 600 }}>{report.total.total.toFixed(2)}</TableCell>
    </TableRow>
  );
  // Header row labels for the report table.
  const headerRow = (
    // Column headers for the report table.
    <TableRow>
      <TableCell sx={{ backgroundColor: 'rgba(15, 42, 67, 0.06)', fontWeight: 600 }}>Day</TableCell>
      <TableCell sx={{ backgroundColor: 'rgba(15, 42, 67, 0.06)', fontWeight: 600 }}>Category</TableCell>
      <TableCell sx={{ backgroundColor: 'rgba(15, 42, 67, 0.06)', fontWeight: 600 }}>Description</TableCell>
      <TableCell sx={{ backgroundColor: 'rgba(15, 42, 67, 0.06)', fontWeight: 600 }}>Currency</TableCell>
      <TableCell align="right" sx={{ backgroundColor: 'rgba(15, 42, 67, 0.06)', fontWeight: 600 }}>Sum</TableCell>
    </TableRow>
  );
  // Body rows including totals.
  const tableBody = (
    <TableBody>
      {rows}
      {totalRow}
    </TableBody>
  );
  // Table wrapper with header and body.
  const tableContent = (
    <Table size="small" sx={{
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: 0,
      '& th:first-of-type, & td:first-of-type': { pl: 2.5 },
      '& th:last-of-type, & td:last-of-type': { pr: 2.5 },
    }}>
      <TableHead>{headerRow}</TableHead>
      {tableBody}
    </Table>
  );
  // Render the report table.
  return (
    <TableContainer component={Paper} sx={{
      mt: 2,
      borderRadius: 2,
      border: 1,
      borderColor: 'divider',
      px: 2,
      pt: 1.25,
      pb: 1.5,
      overflow: 'hidden',
    }}>
      {tableContent}
    </TableContainer>
  );
  // End of report table render.
}
// Export the component.
export default ReportTable;
