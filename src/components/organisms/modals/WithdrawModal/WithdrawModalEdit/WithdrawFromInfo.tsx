import { Box, Typography } from '@mui/material'
import { formatUnits } from 'ethers/lib/utils'

import useModalState from '@/hooks/context/useModalState'
import useWithdrawModalState from '@/hooks/context/useWithdrawModalState'
import useTranslation from '@/hooks/useTranslation'
import useSupportedTokenInfo from '@/hooks/web3/useSupportedTokenInfo'

import InfoRow from '@/components/atoms/InfoRow'
import ToolTip from '@/components/atoms/ToolTip'

import { ModalsKeys } from '@/context/modal/modal.types'

import { SupportedTokens } from '@/constants/tokens'
import { formatAmount } from '@/utils'
import { calculateUserLendingSummary } from '@/utils/lending/calculateUserBalances'

const WithdrawFromInfo = () => {
  const { t } = useTranslation()

  const { modal } = useModalState()

  const { pool, trancheBalance } = modal[ModalsKeys.WITHDRAW]

  const { trancheId } = useWithdrawModalState()

  const supportedToken = useSupportedTokenInfo()

  const { totalInvested, totalAvailableToWithdraw } =
    calculateUserLendingSummary(trancheBalance ?? [])

  const usdcDecimals = supportedToken?.[SupportedTokens.USDC].decimals

  const selectedTranche = trancheBalance.find(
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
        showDivider
        dividerProps={{
          color: 'white',
        }}
        metric={<Typography variant='baseMdBold'>{pool.poolName}</Typography>}
      />
      <InfoRow
        title={t('lending.withdraw.metrics.totalInvestment.label')}
        toolTipInfo={
          <ToolTip
            title={t('lending.withdraw.metrics.totalInvestment.tooltip')}
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
            {formatAmount(formatUnits(totalInvested, usdcDecimals), {
              minDecimals: 2,
            })}{' '}
            USDC
          </Typography>
        }
      />
      <InfoRow
        title={
          t('lending.withdraw.metrics.totalInvestment.label') + ' Remaining'
        }
        toolTipInfo={
          <ToolTip
            title={t('lending.withdraw.metrics.totalInvestment.tooltip')}
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
            {formatAmount(formatUnits(totalAvailableToWithdraw, usdcDecimals), {
              minDecimals: 2,
            })}{' '}
            USDC
          </Typography>
        }
      />
      <InfoRow
        title={t('lending.withdraw.metrics.trancheInvestment.label')}
        toolTipInfo={
          <ToolTip
            title={t('lending.withdraw.metrics.trancheInvestment.tooltip')}
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
            {formatAmount(
              formatUnits(
                selectedTranche?.balanceData.balance || '0',
                usdcDecimals
              ),
              {
                minDecimals: 2,
              }
            )}{' '}
            USDC
          </Typography>
        }
      />
      <InfoRow
        title={
          t('lending.withdraw.metrics.trancheInvestment.label') + ' Remaining'
        }
        toolTipInfo={
          <ToolTip
            title={t('lending.withdraw.metrics.trancheInvestment.tooltip')}
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
            {formatAmount(
              formatUnits(
                selectedTranche?.balanceData.availableToWithdraw || '0',
                usdcDecimals
              ),
              {
                minDecimals: 2,
              }
            )}{' '}
            USDC
          </Typography>
        }
      />
    </Box>
  )
}

export default WithdrawFromInfo
