import { TableCell, TableRow, Typography } from '@mui/material'

const RiskConcentrationsTableHeader = () => {
  return (
    <TableRow>
      <TableCell>
        <Typography variant='baseMdBold'>Risk Concentrations</Typography>
      </TableCell>
      <TableCell>Not yet due</TableCell>
      <TableCell>0-29 days</TableCell>
      <TableCell>30-59 days</TableCell>
      <TableCell>60-89 days</TableCell>
      <TableCell>90+ days</TableCell>
      <TableCell>Credits</TableCell>
      <TableCell>Total</TableCell>
    </TableRow>
  )
}

export default RiskConcentrationsTableHeader
