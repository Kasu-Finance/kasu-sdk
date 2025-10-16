import { Box, Typography } from '@mui/material'

import useWithdrawModalState from '@/hooks/context/useWithdrawModalState'
import getTranslation from '@/hooks/useTranslation'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

import InfoRow from '@/components/atoms/InfoRow'
import ToolTip from '@/components/atoms/ToolTip'

import { formatAmount, mergeSubheading } from '@/utils'

const WithdrawModalReviewOverview = () => {
  const { t } = getTranslation()

  const { address } = usePrivyAuthenticated()

  const { amount, trancheId, selectedPool } = useWithdrawModalState()

  const selectedTranche = selectedPool.tranches.find(
    (tranche) => tranche.id === trancheId
  )

  return (
    <Box>
      <InfoRow
        title={t('modals.withdrawal.metric-1')}
        toolTipInfo={
          <ToolTip
            title={t('modals.withdrawal.metric-1-tooltip')}
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
            {mergeSubheading(selectedPool.poolName, selectedPool.subheading)}
          </Typography>
        }
        showDivider
        dividerProps={{
          color: 'white',
        }}
      />
      {selectedPool.tranches.length > 1 && selectedTranche && (
        <InfoRow
          title={t('general.tranche')}
          toolTipInfo={
            <ToolTip
              title={t('modals.lending.review.metric-5-tooltip')}
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
              {selectedTranche.name} {t('general.tranche')}
            </Typography>
          }
          showDivider
          dividerProps={{
            color: 'white',
          }}
        />
      )}
      <InfoRow
        title={t('modals.withdrawal.metric-5')}
        toolTipInfo={
          <ToolTip
            title={t('modals.withdrawal.metric-5-tooltip')}
            iconSx={{
              color: 'gold.extraDark',
              '&:hover': {
                color: 'rgba(133, 87, 38, 1)',
              },
            }}
          />
        }
        showDivider
        dividerProps={{
          color: 'white',
        }}
        metric={
          <Typography variant='baseMdBold'>
            {formatAmount(amount, {
              minDecimals: 2,
            })}{' '}
            USDC
          </Typography>
        }
      />
      <InfoRow
        title={t('lending.withdraw.toWallet')}
        toolTipInfo={
          <ToolTip
            title='info'
            iconSx={{
              color: 'gold.extraDark',
              '&:hover': {
                color: 'rgba(133, 87, 38, 1)',
              },
            }}
          />
        }
        showDivider
        dividerProps={{
          color: 'white',
        }}
        metric={<Typography variant='baseMdBold'>{address}</Typography>}
      />
    </Box>
  )
}
export default WithdrawModalReviewOverview
