import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'

const RksuBalance = () => {
  return (
    <>
      <Typography variant='inherit'>
        The value of your current rKASU balance, which is derived by a
        multiplier applied to your amount of locked KASU.
        <br />
        <br />
        This multiplier varies according to your locking period, per the below
        table. The value of your rKASU balance relative to your total current
        and pending USDC lending across all Lending Strategies determines your
        Loyalty Level. Your Loyalty Level determines the extent of your token
        utility (lending access priority and lending withdrawal priority to and
        from Lending Strategies) and associated rewards (APY bonus). Regardless
        of your Loyalty Level, your rKASU balance relative to the total rKASU in
        the Kasu ecosystem, also determines your share of Protocol Fees (noting
        you must participate in USDC lending to be eligible for Protocol Fee
        sharing).
      </Typography>

      <Table size='small' className='tooltipTable'>
        <TableHead>
          <TableRow>
            <TableCell>
              <b>KASU locking duration</b>
            </TableCell>
            <TableCell>
              <b>rKASU Multiplier based on locked KASU</b>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>30 days</TableCell>
            <TableCell>0.05x multiplier (5%)</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>180 days</TableCell>
            <TableCell>0.25x multiplier (25%)</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>360 days</TableCell>
            <TableCell>0.50x multiplier (50%)</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>720 days</TableCell>
            <TableCell>1.00x multiplier (100%)</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </>
  )
}

export default RksuBalance
