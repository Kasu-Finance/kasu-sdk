import { Box, Button, Grid, Skeleton, Typography } from '@mui/material'
import React from 'react'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useModalState from '@/hooks/context/useModalState'
import useTranslation from '@/hooks/useTranslation'
import useNextClearingPeriod from '@/hooks/web3/useNextClearingPeriod'

import ColoredBox from '@/components/atoms/ColoredBox'
import Countdown from '@/components/atoms/Countdown'
import InfoColumn from '@/components/atoms/InfoColumn'
import TokenAmount from '@/components/atoms/TokenAmount'

import { ModalsKeys } from '@/context/modal/modal.types'

import dayjs from '@/dayjs'
import { formatAmount, formatTimestamp } from '@/utils'
import { PoolData } from '@/utils/lending/getPoolData'

type DepositModalReviewProps = {
  poolData: PoolData
}

const DepositModalReview: React.FC<DepositModalReviewProps> = ({
  poolData,
}) => {
  const { t } = useTranslation()

  const { openModal } = useModalState()

  const { amount, amountInUSD, trancheId } = useDepositModalState()

  const handleOpen = () => openModal({ name: ModalsKeys.LOYALTY_LEVELS })

  const { nextClearingPeriod, isLoading } = useNextClearingPeriod()

  const formattedTimeNow = formatTimestamp(dayjs().unix(), {
    format: 'DD.MM.YYYY HH:mm:ss',
    includeUtcOffset: true,
  })

  const formattedNextClearingPeriod = formatTimestamp(nextClearingPeriod, {
    format: 'DD.MM.YYYY HH:mm:ss',
    includeUtcOffset: true,
  })

  const selectedTranche = poolData.tranches.find(
    (tranche) => tranche.trancheId === trancheId
  )

  return (
    <Box display='grid' gap={2} mt={2}>
      <ColoredBox>
        <Grid container columnSpacing={2} rowSpacing={1.5}>
          <Grid item xs={6}>
            <InfoColumn
              title={t('modals.lending.review.metric-1')}
              toolTipInfo={t('modals.lending.review.metric-1-tooltip')}
              showDivider
              metric={
                <Typography
                  variant='h6'
                  component='span'
                  display='block'
                  px={2}
                  py='5px'
                >
                  {poolData.poolName}
                </Typography>
              }
            />
          </Grid>
          <Grid item xs={6}>
            <InfoColumn
              title={t('modals.lending.review.metric-3')}
              toolTipInfo={t('modals.lending.review.metric-3-tooltip')}
              showDivider
              metric={
                <TokenAmount
                  px={2}
                  amount={formatAmount(amountInUSD || amount || '0', {
                    maxDecimals: 4,
                  })}
                  symbol='USDC'
                />
              }
            />
          </Grid>
          {poolData.tranches.length > 1 && selectedTranche && (
            <Grid item xs={6}>
              <InfoColumn
                title={t('general.tranche')}
                toolTipInfo={t('modals.lending.review.metric-5-tooltip')}
                showDivider
                metric={
                  <Typography
                    variant='h6'
                    component='span'
                    display='block'
                    px={2}
                    pt='5px'
                  >
                    {selectedTranche.title}
                  </Typography>
                }
              />
            </Grid>
          )}
          <Grid
            item
            xs={6}
            order={poolData.tranches.length > 1 ? undefined : 5} // change layout order
          >
            <InfoColumn
              title={t('modals.lending.review.metric-4')}
              toolTipInfo={t('modals.lending.review.metric-4-tooltip')}
              showDivider
              metric={
                <TokenAmount
                  px={2}
                  amount={formatAmount(poolData.totalUserInvestment || '0')}
                  symbol='USDC'
                />
              }
            />
          </Grid>
          <Grid item xs={6}>
            <InfoColumn
              title={t('modals.lending.review.metric-2')}
              toolTipInfo={t('modals.lending.review.metric-2-tooltip')}
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
        </Grid>
      </ColoredBox>
      <Typography variant='body2' component='p' textAlign='center'>
        {t('modals.lending.terms-and-conditions-1')}{' '}
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
          {t('modals.lending.terms-and-conditions-2')}
        </Button>
      </Typography>
      <InfoColumn
        title={t('general.nextClearingPeriodStart')}
        showDivider
        metric={
          <Box px={2} py='6px'>
            {isLoading ? (
              <>
                <Skeleton variant='rounded' height={28} width={200} />
                <Skeleton
                  variant='rounded'
                  height={18}
                  width={150}
                  sx={{ mt: 1 }}
                />
              </>
            ) : (
              <>
                {' '}
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
                  <Typography
                    variant='caption'
                    color='inherit'
                    component='span'
                  >
                    {formattedNextClearingPeriod.utcOffset}
                  </Typography>
                </Typography>
              </>
            )}
          </Box>
        }
      />
    </Box>
  )
}

export default DepositModalReview
