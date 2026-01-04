// Monthly report table with totals.
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
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
  return (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Day</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Description</TableCell>
            <TableCell align="right">Sum ({report.total.currency})</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {report.costs.map((row) => (
            <TableRow key={`${row.category}-${row.description}-${row.Date.day}`}>
              <TableCell>{row.Date.day}</TableCell>
              <TableCell>{row.category}</TableCell>
              <TableCell>{row.description}</TableCell>
              <TableCell align="right">{row.sum.toFixed(2)}</TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell colSpan={3} align="right">
              <strong>Total</strong>
            </TableCell>
            <TableCell align="right">
              <strong>{report.total.total.toFixed(2)}</strong>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default ReportTable;
