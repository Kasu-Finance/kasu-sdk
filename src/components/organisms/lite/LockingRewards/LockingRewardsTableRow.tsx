import { TableCell, TableRow } from '@mui/material'
import React, { ReactNode } from 'react'

import DottedDivider from '@/components/atoms/DottedDivider'

type LockingRewardsTableRowProps = {
  label: string
  lifeTimeRewards: ReactNode
  claimableRewards: ReactNode
}

const LockingRewardsTableRow: React.FC<LockingRewardsTableRowProps> = ({
  label,
  lifeTimeRewards,
  claimableRewards,
}) => (
  <>
    <TableRow sx={{ '.MuiTableCell-root': { py: 1, height: 50 } }}>
      <TableCell>{label}</TableCell>
      <TableCell align='right'>{lifeTimeRewards}</TableCell>
      <TableCell align='right'>{claimableRewards}</TableCell>
    </TableRow>
    <TableRow>
      <TableCell colSpan={3} padding='none'>
        <DottedDivider />
      </TableCell>
    </TableRow>
  </>
)

export default LockingRewardsTableRow
