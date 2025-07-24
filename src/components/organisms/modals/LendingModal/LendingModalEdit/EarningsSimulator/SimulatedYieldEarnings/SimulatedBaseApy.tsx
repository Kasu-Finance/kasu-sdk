import { Typography } from '@mui/material'
import React, { memo, useMemo } from 'react'

import useModalState from '@/hooks/context/useModalState'
import getTranslation from '@/hooks/useTranslation'

import InfoRow from '@/components/atoms/InfoRow'
import ToolTip from '@/components/atoms/ToolTip'

import { ModalsKeys } from '@/context/modal/modal.types'

import { capitalize, formatPercentage } from '@/utils'

type SimulatedBaseApyProps = {
  trancheId: `0x${string}`
  fixedTermConfigId?: string
}

const SimulatedBaseApy: React.FC<SimulatedBaseApyProps> = ({
  trancheId,
  fixedTermConfigId,
}) => {
  const { t } = getTranslation()

  const { modal } = useModalState()

  const pool = modal[ModalsKeys.LEND].pool

  const selectedApy = useMemo(() => {
    const selectedTranche = pool.tranches.find(
      (tranche) => tranche.id === trancheId
    )

    if (!selectedTranche?.fixedTermConfig.length) return selectedTranche?.apy

    const fixedTermApy = selectedTranche.fixedTermConfig.find(
      ({ configId }) => configId === fixedTermConfigId
    )

    return fixedTermApy?.apy
  }, [pool.tranches, trancheId, fixedTermConfigId])

  return (
    <InfoRow
      title={`${t('general.grossApy')} (${capitalize(t('general.base'))})`}
      toolTipInfo={
        <ToolTip
          title={t(
            'modals.earningsCalculator.simulatedYieldEarnings.metric-1-tooltip'
          )}
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
          {formatPercentage(selectedApy || 0)}
        </Typography>
      }
    />
  )
}

export default memo(SimulatedBaseApy)
