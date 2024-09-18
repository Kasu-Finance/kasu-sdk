import { TableCell, TableRow, Typography } from '@mui/material'

const RiskConcentrationsTableHeader = () => {
  return (
    <TableRow>
      <TableCell width='16%'>
        <Typography variant='baseMdBold'>Risk Concentrations</Typography>
      </TableCell>
      <TableCell width='12%'>Not yet due</TableCell>
      <TableCell width='12%'>0-29 days</TableCell>
      <TableCell width='12%'>30-59 days</TableCell>
      <TableCell width='12%'>60-89 days</TableCell>
      <TableCell width='12%'>90+ days</TableCell>
      <TableCell width='12%'>Credits</TableCell>
      <TableCell width='12%'>Total</TableCell>
    </TableRow>
  )
}

export default RiskConcentrationsTableHeader
