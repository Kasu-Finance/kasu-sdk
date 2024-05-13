import { Box, Grid, Typography } from '@mui/material'
import { UserLock } from '@solidant/kasu-sdk/src/services/Locking/types'
import React from 'react'

import useModalStatusState from '@/hooks/context/useModalStatusState'
import useTranslation from '@/hooks/useTranslation'

import ColoredBox from '@/components/atoms/ColoredBox'
import InfoColumn from '@/components/atoms/InfoColumn'
import BalanceItem from '@/components/molecules/locking/BalanceOverview/BalanceItem'

import { DATE_FORMAT } from '@/constants'
import dayjs from '@/dayjs'
import { formatAmount } from '@/utils'

type UnlockModalOverviewProps = {
  userLock: UserLock
}

const UnlockModalOverview: React.FC<UnlockModalOverviewProps> = ({
  userLock,
}) => {
  const { t } = useTranslation()

  const { modalStatus } = useModalStatusState()

  const startTime = dayjs.unix(userLock.startTime)

  return (
    <Grid item xs={1}>
      <ColoredBox sx={{ bgcolor: modalStatus.bgColor }}>
        <Grid container spacing={2}>
          <Grid item container xs={6}>
            <BalanceItem
              title={t('general.totalKsuLocked')}
              toolTipInfo={t('modals.unlock.overview.metric-1-tooltip')}
              value={[formatAmount(userLock.lockedAmount), 'KSU']}
            />
            <BalanceItem
              title={`rKSU ${t('general.balance')}`}
              toolTipInfo={t('modals.unlock.overview.metric-2-tooltip')}
              value={[formatAmount(userLock.rKSUAmount), 'rKSU']}
              titleStyle={{}}
            />
          </Grid>
          <Grid item xs={6}>
            <InfoColumn
              title={t('modals.unlock.overview.lockedDate')}
              toolTipInfo={t('modals.unlock.overview.metric-3-tooltip')}
              showDivider
              metric={
                <>
                  <Typography
                    variant='h6'
                    component='span'
                    display='block'
                    px={2}
                    pt='5px'
                  >
                    {startTime.format(DATE_FORMAT)}
                  </Typography>
                  <Box px={2} pb='5px'>
                    <Typography variant='body1' component='span'>
                      {startTime.format('HH:mm:ss')}{' '}
                    </Typography>
                    <Typography variant='caption' component='span'>
                      {startTime.format('UTCZZ')}
                    </Typography>
                  </Box>
                </>
              }
            />
          </Grid>
        </Grid>
      </ColoredBox>
    </Grid>
  )
}

export default UnlockModalOverview
