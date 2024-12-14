import { Box, Typography } from '@mui/material'
import { useWeb3React } from '@web3-react/core'

import useModalState from '@/hooks/context/useModalState'
import useWithdrawModalState from '@/hooks/context/useWithdrawModalState'
import getTranslation from '@/hooks/useTranslation'

import InfoRow from '@/components/atoms/InfoRow'
import ToolTip from '@/components/atoms/ToolTip'

import { ModalsKeys } from '@/context/modal/modal.types'

import { formatAmount, mergeSubheading } from '@/utils'

const WithdrawModalReviewOverview = () => {
  const { t } = getTranslation()

  const { account } = useWeb3React()

  const { modal } = useModalState()

  const { pool } = modal[ModalsKeys.WITHDRAW]

  const { amount, trancheId } = useWithdrawModalState()

  const selectedTranche = pool.tranches.find(
    (tranche) => tranche.id === trancheId
  )

  return (
    <Box>
      <InfoRow
        title={t('lending.withdraw.fromPool')}
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
        metric={
          <Typography variant='baseMdBold'>
            {mergeSubheading(pool.poolName, pool.subheading)}
          </Typography>
        }
        showDivider
        dividerProps={{
          color: 'white',
        }}
      />
      <InfoRow
        title={t('lending.withdraw.subtitle')}
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
        metric={
          <Typography variant='baseMdBold'>
            {formatAmount(amount, {
              minDecimals: 2,
            })}{' '}
            USDC
          </Typography>
        }
      />
      {pool.tranches.length > 1 && selectedTranche && (
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
        metric={<Typography variant='baseMdBold'>{account}</Typography>}
      />
    </Box>
  )
}
export default WithdrawModalReviewOverview
