import { Grid, TableCell } from '@mui/material'
import { ReactNode } from 'react'

import useDeviceDetection, { Device } from '@/hooks/useDeviceDetections'

type BadDebtsCellProp = {
  value: [ReactNode, ReactNode]
}

const BadDebtsCell: React.FC<BadDebtsCellProp> = ({ value }) => {
  const currentDevice = useDeviceDetection()
  const isMobile = currentDevice === Device.MOBILE

  return (
    <TableCell sx={(theme) => theme.typography.caption}>
      <Grid
        container
        direction={isMobile ? 'column' : 'row'}
        alignContent={isMobile ? 'center' : 'auto'}
      >
        <Grid item xs={7.8} textAlign='right'>
          {value[0]}
        </Grid>
        <Grid item xs={4.2} textAlign='center'>
          {value[1]}
        </Grid>
      </Grid>
    </TableCell>
  )
}

export default BadDebtsCell
