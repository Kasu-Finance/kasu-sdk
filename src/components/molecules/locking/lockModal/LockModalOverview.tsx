import { Grid } from '@mui/material'
import { formatEther, formatUnits } from 'ethers/lib/utils'
import React from 'react'

import useModalStatusState from '@/hooks/context/useModalStatusState'
import useStakedKSU from '@/hooks/locking/useStakedKSU'
import useTranslation from '@/hooks/useTranslation'
import useKsuPrice from '@/hooks/web3/useKsuPrice'
import useSupportedTokenInfo from '@/hooks/web3/useSupportedTokenInfo'
import useUserBalance from '@/hooks/web3/useUserBalance'

import ColoredBox from '@/components/atoms/ColoredBox'
import BalanceItem from '@/components/molecules/locking/BalanceOverview/BalanceItem'

import { USDC } from '@/config/sdk'
import { SupportedTokens } from '@/constants/tokens'
import { convertToUSD, formatAmount, toBigNumber } from '@/utils'

type LockModalOverviewProps = {
  balance: string
}

const LockModalOverview: React.FC<LockModalOverviewProps> = ({ balance }) => {
  const { t } = useTranslation()

  const { modalStatus } = useModalStatusState()

  const { balance: usdcBalance, decimals: usdcDecimals } = useUserBalance(USDC)

  const supportedToken = useSupportedTokenInfo()

  const { stakedKSU } = useStakedKSU()

  const { ksuPrice } = useKsuPrice()

  const ksuInUSD = convertToUSD(
    toBigNumber(balance),
    toBigNumber(
      ksuPrice || '0',
      supportedToken?.[SupportedTokens.USDC].decimals
    )
  )

  return (
    <ColoredBox sx={{ bgcolor: modalStatus.bgColor }}>
      <Grid container spacing={2}>
        <Grid item container xs={6}>
          <BalanceItem
            title={`${t('general.wallet')} ${t('general.balance')}`}
            toolTipInfo={t('modals.lock.overview.metric-1-tooltip')}
            value={[formatAmount(balance || '0'), 'KSU']}
            usdValue={formatAmount(formatEther(ksuInUSD) || '0')}
          />
          <BalanceItem
            title={t('general.availableFunds')}
            toolTipInfo={t('modals.lock.overview.metric-2-tooltip')}
            value={[
              formatAmount(formatUnits(usdcBalance || '0', usdcDecimals)),
              'USDC',
            ]}
          />
        </Grid>
        <Grid item xs={6}>
          <BalanceItem
            title={t('general.totalKsuLocked')}
            toolTipInfo={t('modals.lock.overview.metric-3-tooltip')}
            value={[formatAmount(stakedKSU || '0'), 'KSU']}
          />
        </Grid>
      </Grid>
    </ColoredBox>
  )
}

export default LockModalOverview
