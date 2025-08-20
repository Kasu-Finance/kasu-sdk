import { Box, Stack, Typography } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import InfoRow from '@/components/atoms/InfoRow'
import ToolTip from '@/components/atoms/ToolTip'
import BuyKasuReviewActions from '@/components/organisms/modals/BuyKasuModal/BuyKasuReview/BuyKasuReviewActions'

import { formatAmount } from '@/utils'

const BuyKasuModalReview = () => {
  const { t } = getTranslation()

  return (
    <Stack spacing={3}>
      <Box>
        <InfoRow
          title={t('modals.buyKasu.review.metric-1')}
          toolTipInfo={
            <ToolTip
              title={t('modals.lock.reviewLock.lockAmount-tooltip')}
              iconSx={{
                color: 'gold.extraDark',
                '&:hover': {
                  color: 'rgba(133, 87, 38, 1)',
                },
              }}
            />
          }
          metric={
            <Typography variant='baseMdBold'>
              {formatAmount(0, {
                minDecimals: 2,
              })}{' '}
              USDC
            </Typography>
          }
          showDivider
          dividerProps={{
            color: 'white',
          }}
        />
        <InfoRow
          title={t('modals.buyKasu.review.metric-2')}
          toolTipInfo={
            <ToolTip
              title={t('modals.lock.reviewLock.lockingDuration-tooltip')}
              iconSx={{
                color: 'gold.extraDark',
                '&:hover': {
                  color: 'rgba(133, 87, 38, 1)',
                },
              }}
            />
          }
          metric={
            <Box>
              <Typography variant='baseMdBold'>
                {formatAmount('0.00', {
                  minDecimals: 2,
                })}{' '}
                KASU{' '}
              </Typography>
              =
              <Typography variant='baseMdBold'>
                {' '}
                {formatAmount('0.00', {
                  minDecimals: 2,
                })}{' '}
                KASU{' '}
              </Typography>
            </Box>
          }
          showDivider
          dividerProps={{
            color: 'white',
          }}
        />
        <InfoRow
          title={t('modals.buyKasu.review.metric-3')}
          toolTipInfo={
            <ToolTip
              title={t('modals.lock.reviewLock.lockingDuration-tooltip')}
              iconSx={{
                color: 'gold.extraDark',
                '&:hover': {
                  color: 'rgba(133, 87, 38, 1)',
                },
              }}
            />
          }
          metric={
            <Box>
              <Typography variant='baseMdBold'>
                {' '}
                {formatAmount('0.00', {
                  minDecimals: 2,
                })}{' '}
                KASU{' '}
              </Typography>
            </Box>
          }
          showDivider
          dividerProps={{
            color: 'white',
          }}
        />
      </Box>
      <Typography
        variant='baseMd'
        display='inline-flex'
        alignItems='center'
        gap={1}
        color='gold.extraDark'
      >
        {t('modals.buyKasu.review.disclaimer')}
      </Typography>
      <BuyKasuReviewActions />
    </Stack>
  )
}

export default BuyKasuModalReview
