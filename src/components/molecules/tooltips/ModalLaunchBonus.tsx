import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'

const ModalLaunchBonus = () => {
  return (
    <>
      <Typography variant='inherit'>
        Your projected KASU Launch Bonus for being an early Token Locker, based
        on the amount and duration of KASU locked and the associated multiplier
        as follows:
      </Typography>

      <Table size='small' className='tooltipTable'>
        <TableHead>
          <TableRow>
            <TableCell>
              <b>Locking duration</b>
            </TableCell>
            <TableCell>
              <b>KASU Multiplier</b>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>30 days</TableCell>
            <TableCell>0.00x multiplier (0%)</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>180 days</TableCell>
            <TableCell>0.10x multiplier (10%)</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>360 days</TableCell>
            <TableCell>0.25x multiplier (25%)</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>720 days</TableCell>
            <TableCell>0.70x multiplier (70%)</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </>
  )
}

export default ModalLaunchBonus
