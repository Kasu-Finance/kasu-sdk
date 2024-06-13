import { Box, Button, Grid, Typography } from '@mui/material'
import React from 'react'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useModalState from '@/hooks/context/useModalState'
import useTranslation from '@/hooks/useTranslation'
import useNextClearingPeriod from '@/hooks/web3/useNextClearingPeriod'

import ColoredBox from '@/components/atoms/ColoredBox'
import Countdown from '@/components/atoms/Countdown'
import InfoColumn from '@/components/atoms/InfoColumn'
import TokenAmount from '@/components/atoms/TokenAmount'
import { PoolData } from '@/components/molecules/lending/overview/TranchesApyCard'

import { ModalsKeys } from '@/context/modal/modal.types'

import dayjs from '@/dayjs'
import { formatAmount, formatTimestamp } from '@/utils'

type DepositModalReviewProps = {
  poolData: PoolData
}

const DepositModalReview: React.FC<DepositModalReviewProps> = ({
  poolData,
}) => {
  const { t } = useTranslation()

  const { openModal } = useModalState()

  const { amount } = useDepositModalState()

  const handleOpen = () => openModal({ name: ModalsKeys.LOYALTY_LEVELS })

  const { nextClearingPeriod } = useNextClearingPeriod()

  const formattedTimeNow = formatTimestamp(dayjs().unix(), {
    format: 'DD.MM.YYYY HH:mm:ss',
    includeUtcOffset: true,
  })

  const formattedNextClearingPeriod = formatTimestamp(nextClearingPeriod, {
    format: 'DD.MM.YYYY HH:mm:ss',
    includeUtcOffset: true,
  })

  return (
    <Box display='grid' gap={2} mt={2}>
      <ColoredBox>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <InfoColumn
              title='Deposit To'
              toolTipInfo='info'
              showDivider
              metric={
                <Typography
                  variant='h6'
                  component='span'
                  display='block'
                  px={2}
                  py='5px'
                  mb='10px'
                >
                  {poolData.poolName}
                </Typography>
              }
            />
            <InfoColumn
              title='Deposit Request Date'
              toolTipInfo='info'
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
                    {formattedTimeNow.date}
                  </Typography>
                  <Box px={2} pb='5px'>
                    <Typography variant='body1' component='span'>
                      {formattedTimeNow.timestamp}{' '}
                    </Typography>
                    <Typography variant='body1' component='span'>
                      {formattedTimeNow.utcOffset}
                    </Typography>
                  </Box>
                </>
              }
            />
          </Grid>
          <Grid item xs={6}>
            <InfoColumn
              title='Lending Amount'
              toolTipInfo='info'
              showDivider
              metric={
                <TokenAmount
                  px={2}
                  amount={formatAmount(amount || '0')}
                  symbol='USDC'
                />
              }
            />
            <InfoColumn
              title='Total Investment'
              toolTipInfo='info'
              showDivider
              containerSx={{ mt: 2.5 }}
              metric={
                <TokenAmount
                  px={2}
                  amount={formatAmount(poolData.totalUserInvestment || '0')}
                  symbol='USDC'
                />
              }
            />
          </Grid>
        </Grid>
      </ColoredBox>
      <Typography variant='body2' component='p' textAlign='center'>
        By depositing funds to this Lending Pool, you accept the{' '}
        <Button
          onClick={handleOpen}
          variant='text'
          sx={{
            height: 'auto',
            display: 'inline',
            p: 0,
            fontSize: 'inherit',
            fontWeight: 'inherit',
            fontFamily: 'inherit',
            textTransform: 'inherit',
          }}
        >
          Terms and Conditions.
        </Button>
      </Typography>
      <InfoColumn
        title={t('general.nextClearingPeriodStart')}
        showDivider
        metric={
          <Box px={2} py='6px'>
            <Typography variant='h6' component='span' display='block'>
              <Countdown
                endTime={nextClearingPeriod}
                format='D:HH:mm'
                render={(countDown) => {
                  const parts = countDown.split(':')

                  return `${parts[0]} ${t('time.days')} • ${parts[1]} ${t(
                    'time.hours'
                  )} • ${parts[2]} ${t('time.minutes')}`
                }}
              />
            </Typography>
            <Typography variant='body1' color='grey.500'>
              {formattedNextClearingPeriod.date} •{' '}
              {formattedNextClearingPeriod.timestamp}{' '}
              <Typography variant='caption' color='inherit' component='span'>
                {formattedNextClearingPeriod.utcOffset}
              </Typography>
            </Typography>
          </Box>
        }
      />
    </Box>
  )
}

export default DepositModalReview
