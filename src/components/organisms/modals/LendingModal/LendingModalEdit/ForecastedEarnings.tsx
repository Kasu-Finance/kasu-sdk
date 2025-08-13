import { Box, Typography } from '@mui/material'
import React from 'react'

import useModalState from '@/hooks/context/useModalState'
import getTranslation from '@/hooks/useTranslation'

import InfoRow from '@/components/atoms/InfoRow'

import { ModalsKeys } from '@/context/modal/modal.types'

import { formatAmount, formatPercentage, TimeConversions } from '@/utils'

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
  const { t } = getTranslation()

  const { modal } = useModalState()

  const { pools } = modal[ModalsKeys.LEND]

  const pool = pools?.find((pool) => pool.id === selectedPool)

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
        title='Forecasted Earnings'
        showDivider
        dividerProps={{ color: 'white' }}
        metric={
          <Typography variant='baseMdBold'>
            At {formatPercentage(tranche.apy, 2).replaceAll(' %', '%')}{' '}
            {t('general.apy')}, you can earn ~
            {formatAmount(forecastedEarnings, { currency: 'USD' }).trimEnd()}
            /month
          </Typography>
        }
        sx={{ pt: 0 }}
      />
    </Box>
  )
}

export default ForecastedEarnings
