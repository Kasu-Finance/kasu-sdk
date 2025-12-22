import { Box, Typography } from '@mui/material'
import React from 'react'

import useModalState from '@/hooks/context/useModalState'

import InfoRow from '@/components/atoms/InfoRow'
import ToolTip from '@/components/atoms/ToolTip'

import { ModalsKeys } from '@/context/modal/modal.types'

import { formatAmount, TimeConversions } from '@/utils'

type ForecastedEarningsProps = {
  amountInUSD: string
  selectedPool: string
  selectedTranche: `0x${string}`
}

const ForecastedEarnings: React.FC<ForecastedEarningsProps> = ({
  amountInUSD,
  selectedPool,
  selectedTranche,
}) => {
  const { modal } = useModalState()

  const { pools, pool: defaultPool } = modal[ModalsKeys.LEND]

  const pool = pools?.find((pool) => pool.id === selectedPool) ?? defaultPool

  const tranche = pool?.tranches.find(
    (tranche) => tranche.id === selectedTranche
  )

  if (!tranche || !pool) return null

  const forecastedEarnings =
    (parseFloat(amountInUSD ?? '0') * parseFloat(tranche.apy)) /
    TimeConversions.MONTH_PER_YEAR

  return (
    <Box>
      <InfoRow
        title='Forecast monthly earnings'
        showDivider
        dividerProps={{ color: 'white' }}
        toolTipInfo={
          <ToolTip
            title='Assumes interest / yield is autocompounded every week based on the current APY stated. Forecast interest earnings and approximates only and are subject to changes in APY.'
            iconSx={{
              color: 'gold.extraDark',
              '&:hover': { color: 'rgba(133, 87, 38, 1)' },
            }}
          />
        }
        metric={
          <Typography variant='baseMdBold'>
            {formatAmount(forecastedEarnings, { currency: 'USD' }).trimEnd()}
            {` / `}
            month
          </Typography>
        }
        sx={{ pt: 0 }}
      />
    </Box>
  )
}

export default ForecastedEarnings
