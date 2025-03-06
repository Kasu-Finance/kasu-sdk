import { Box, Typography } from '@mui/material'
import { formatEther, formatUnits } from 'ethers/lib/utils'

import useStakedKSU from '@/hooks/locking/useStakedKSU'
import getTranslation from '@/hooks/useTranslation'
import useKsuPrice from '@/hooks/web3/useKsuPrice'
import useSupportedTokenInfo from '@/hooks/web3/useSupportedTokenInfo'
import useUserBalance from '@/hooks/web3/useUserBalance'

import InfoRow from '@/components/atoms/InfoRow'
import ToolTip from '@/components/atoms/ToolTip'

import sdkConfig from '@/config/sdk'
import { SupportedTokens } from '@/constants/tokens'
import { convertToUSD, formatAmount, toBigNumber } from '@/utils'

const LockModalBalanceOverview = () => {
  const { t } = getTranslation()

  const supportedToken = useSupportedTokenInfo()

  const { balance: ksuBalance, decimals: ksuDecimals } = useUserBalance(
    sdkConfig.contracts.KSUToken
  )

  const { balance: usdcBalance, decimals: usdcDecimals } = useUserBalance(
    supportedToken?.[SupportedTokens.USDC].address
  )

  const { stakedKSU } = useStakedKSU()

  const { ksuPrice } = useKsuPrice()

  const ksuInUSD = convertToUSD(ksuBalance, toBigNumber(ksuPrice || '0'))

  return (
    <Box>
      <InfoRow
        title={`${t('general.wallet')} ${t('general.balance')}`}
        titleStyle={{ textTransform: 'capitalize' }}
        toolTipInfo={
          <ToolTip
            title={t('locking.widgets.overview.metric-1-tooltip')}
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
              {formatAmount(formatUnits(ksuBalance, ksuDecimals), {
                minDecimals: 2,
              })}{' '}
              KASU{' '}
            </Typography>
            <Typography variant='baseMd' color='rgba(133, 87, 38, 1)'>
              {formatAmount(formatEther(ksuInUSD), {
                minDecimals: 2,
              })}{' '}
              USDC
            </Typography>
          </Box>
        }
        showDivider
        dividerProps={{
          color: 'white',
        }}
      />
      <InfoRow
        title={t('general.totalKsuLocked')}
        titleStyle={{ textTransform: 'capitalize' }}
        toolTipInfo={
          <ToolTip
            title={t('locking.widgets.overview.metric-3-tooltip')}
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
            {formatAmount(stakedKSU || 0, {
              minDecimals: 2,
            })}
          </Typography>
        }
        showDivider
        dividerProps={{
          color: 'white',
        }}
      />
      <InfoRow
        title={t('general.availableFunds')}
        titleStyle={{ textTransform: 'capitalize' }}
        toolTipInfo={
          <ToolTip
            title={t('locking.widgets.overview.metric-2-tooltip')}
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
            {formatAmount(formatUnits(usdcBalance, usdcDecimals), {
              minDecimals: 2,
            })}
          </Typography>
        }
        showDivider
        dividerProps={{
          color: 'white',
        }}
      />
    </Box>
  )
}

export default LockModalBalanceOverview
