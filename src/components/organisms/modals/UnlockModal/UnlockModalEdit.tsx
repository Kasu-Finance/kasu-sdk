import { Box, Grid, Typography } from '@mui/material'
import { UserLock } from 'kasu-sdk/src/types'
import React from 'react'

import useLockModalState from '@/hooks/context/useLockModalState'

import LockedDetails from '@/components/molecules/locking/UnlockModal/LockedDetails'
import UnlockAmountInput from '@/components/molecules/locking/UnlockModal/UnlockAmountInput'
import UnlockModalOverview from '@/components/molecules/locking/UnlockModal/UnlockModalOverview'

type UnlockModalEditProps = {
  userLock: UserLock
}

const UnlockModalEdit: React.FC<UnlockModalEditProps> = ({ userLock }) => {
  const { lockState } = useLockModalState()

  return (
    <Box
      sx={{
        backgroundColor: lockState.bgColor,
        transition: 'background-color 0.3s ease',
        p: 1,
      }}
    >
      <Grid columns={1} container spacing={2}>
        <UnlockModalOverview userLock={userLock} />
        <Grid item xs={1}>
          <Typography variant='subtitle1' component='span' display='block'>
            Unlocking
          </Typography>
          <LockedDetails userLock={userLock} />
          <UnlockAmountInput userLock={userLock} />
        </Grid>
      </Grid>
    </Box>
  )
}

export default UnlockModalEdit
