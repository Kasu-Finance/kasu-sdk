import { Box, Typography } from '@mui/material'
import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'
import React, { useMemo } from 'react'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useTranslation from '@/hooks/useTranslation'

import InfoColumn from '@/components/atoms/InfoColumn'

import { formatPercentage } from '@/utils'

type SimulatedBaseApyProps = {
  poolOverview: PoolOverview
}

const SimulatedBaseApy: React.FC<SimulatedBaseApyProps> = ({
  poolOverview,
}) => {
  const { t } = useTranslation()

  const { trancheId } = useDepositModalState()

  const selectedTranche = useMemo(
    () => poolOverview.tranches.find((tranche) => tranche.id === trancheId),
    [poolOverview.tranches, trancheId]
  )

  return (
    <InfoColumn
      title={t('general.apy')}
      subtitle={`(${t('general.base')})`}
      subtitleStyle={{
        variant: 'caption',
        textTransform: 'capitalize',
      }}
      toolTipInfo={t(
        'modals.earningsCalculator.simulatedYieldEarnings.metric-1-tooltip'
      )}
      showDivider
      metric={
        <Box pt='6px' pl={2}>
          <Typography variant='h6' component='span'>
            {formatPercentage(selectedTranche?.apy || 0)}
          </Typography>
        </Box>
      }
    />
  )
}

export default SimulatedBaseApy
