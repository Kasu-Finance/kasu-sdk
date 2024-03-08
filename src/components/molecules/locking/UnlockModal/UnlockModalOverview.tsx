import { Grid } from '@mui/material'
import { UserLock } from 'kasu-sdk/src/types'
import React from 'react'

import useLockModalState from '@/hooks/context/useLockModalState'

import ColoredBox from '@/components/atoms/ColoredBox'
import BalanceItem from '@/components/molecules/locking/BalanceOverview/BalanceItem'

import dayjs from '@/dayjs'

type UnlockModalOverviewProps = {
  userLock: UserLock
}

const UnlockModalOverview: React.FC<UnlockModalOverviewProps> = ({
  userLock,
}) => {
  const { lockState } = useLockModalState()

  const startTime = dayjs.unix(userLock.startTime)

  return (
    <Grid item xs={1}>
      <ColoredBox sx={{ bgcolor: lockState.bgColor }}>
        <Grid container spacing={2}>
          <Grid item container xs={6}>
            <BalanceItem
              title='Total KSU Locked'
              toolTipInfo='info'
              value={[userLock.lockedAmount, 'KSU']}
            />
            <BalanceItem
              title='rKSU Amount'
              toolTipInfo='info'
              value={[userLock.rKSUAmount, 'rKSU']}
            />
          </Grid>
          <Grid item xs={6}>
            <BalanceItem
              title='Locked Date'
              toolTipInfo='info'
              value={[startTime.format('DD.MM.YYYY'), '']}
              subValue={[
                startTime.format('HH:mm:ss'),
                startTime.format('UTCZZ'),
              ]}
            />
          </Grid>
        </Grid>
      </ColoredBox>
    </Grid>
  )
}

export default UnlockModalOverview
