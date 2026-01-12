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
      <Typography variant="body1" className="report-table__empty">
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
    <TableRow className="report-table__total-row">
      <TableCell colSpan={3} align="right" className="report-table__total-cell">Total</TableCell>
      <TableCell className="report-table__total-cell">{report.total.currency}</TableCell>
      <TableCell align="right" className="report-table__total-cell">{report.total.total.toFixed(2)}</TableCell>
    </TableRow>
  );
  // Header row labels for the report table.
  const headerRow = (
    // Column headers for the report table.
    <TableRow>
      <TableCell className="report-table__header-cell">Day</TableCell>
      <TableCell className="report-table__header-cell">Category</TableCell>
      <TableCell className="report-table__header-cell">Description</TableCell>
      <TableCell className="report-table__header-cell">Currency</TableCell>
      <TableCell align="right" className="report-table__header-cell">Sum</TableCell>
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
    <Table size="small" className="report-table__table">
      <TableHead>{headerRow}</TableHead>
      {tableBody}
    </Table>
  );
  // Render the report table.
  return (
    <TableContainer component={Paper} className="report-table__container">
      {tableContent}
    </TableContainer>
  );
  // End of report table render.
}
// Export the component.
export default ReportTable;
