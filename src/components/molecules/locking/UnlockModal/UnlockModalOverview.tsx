import { Grid } from '@mui/material'
import { UserLock } from '@solidant/kasu-sdk/src/services/Locking/types'
import React from 'react'

import useModalStatusState from '@/hooks/context/useModalStatusState'

import ColoredBox from '@/components/atoms/ColoredBox'
import BalanceItem from '@/components/molecules/locking/BalanceOverview/BalanceItem'

import dayjs from '@/dayjs'
import { formatAmount } from '@/utils'

type UnlockModalOverviewProps = {
  userLock: UserLock
}

const UnlockModalOverview: React.FC<UnlockModalOverviewProps> = ({
  userLock,
}) => {
  const { modalStatus } = useModalStatusState()

  const startTime = dayjs.unix(userLock.startTime)

  return (
    <Grid item xs={1}>
      <ColoredBox sx={{ bgcolor: modalStatus.bgColor }}>
        <Grid container spacing={2}>
          <Grid item container xs={6}>
            <BalanceItem
              title='Total KSU Locked'
              toolTipInfo='info'
              value={[
                formatAmount(userLock.lockedAmount, { minDecimals: 2 }),
                'KSU',
              ]}
            />
            <BalanceItem
              title='rKSU Amount'
              toolTipInfo='info'
              value={[
                formatAmount(userLock.rKSUAmount, { minDecimals: 2 }),
                'rKSU',
              ]}
            />
          </Grid>
          <Grid item xs={6}>
            <BalanceItem
              title='Locked Date'
              toolTipInfo='info'
              value={[startTime.format('DD.MM.YYYY'), '']}
              // subValue={[
              //   startTime.format('HH:mm:ss'),
              //   startTime.format('UTCZZ'),
              // ]}
            />
          </Grid>
        </Grid>
      </ColoredBox>
    </Grid>
  )
}

export default UnlockModalOverview
