import { Box, Stack, Typography } from '@mui/material'
import { formatEther, parseEther } from 'ethers/lib/utils'

import useBuyKasuModalState from '@/hooks/context/useBuyKasuModalState'
import getTranslation from '@/hooks/useTranslation'
import useKsuPrice from '@/hooks/web3/useKsuPrice'

import InfoRow from '@/components/atoms/InfoRow'
import ToolTip from '@/components/atoms/ToolTip'
import BuyKasuReviewActions from '@/components/organisms/modals/BuyKasuModal/BuyKasuReview/BuyKasuReviewActions'

import { formatAmount, toBigNumber } from '@/utils'

const BuyKasuModalReview = () => {
  const { t } = getTranslation()

  const { amountInUSD, amount } = useBuyKasuModalState()

  const { ksuPrice } = useKsuPrice()

  const purchaseAmount =
    ksuPrice && !toBigNumber(ksuPrice).isZero()
      ? toBigNumber(amountInUSD ?? amount ?? '0')
          .mul(toBigNumber('1'))
          .div(parseEther(ksuPrice))
      : '0'

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
              {formatAmount(amountInUSD ?? amount ?? 0, {
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
                {formatAmount(1, {
                  minDecimals: 2,
                })}{' '}
                KASU{' '}
              </Typography>
              =
              <Typography variant='baseMdBold'>
                {' '}
                {formatAmount(ksuPrice || '0', {
                  minDecimals: 2,
                })}{' '}
                KASU
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
                {formatAmount(formatEther(purchaseAmount), {
                  minDecimals: 2,
                })}{' '}
                KASU
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
