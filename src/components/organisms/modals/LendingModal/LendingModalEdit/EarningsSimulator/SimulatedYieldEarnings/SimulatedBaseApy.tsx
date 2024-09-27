import { Typography } from '@mui/material'
import { useMemo } from 'react'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useModalState from '@/hooks/context/useModalState'
import useTranslation from '@/hooks/useTranslation'

import InfoRow from '@/components/atoms/InfoRow'
import ToolTip from '@/components/atoms/ToolTip'

import { ModalsKeys } from '@/context/modal/modal.types'

import { capitalize, formatPercentage } from '@/utils'

const SimulatedBaseApy = () => {
  const { t } = useTranslation()

  const { modal } = useModalState()

  const pool = modal[ModalsKeys.LEND].pool

  const { trancheId } = useDepositModalState()

  const selectedTranche = useMemo(
    () => pool.tranches.find((tranche) => tranche.id === trancheId),
    [pool.tranches, trancheId]
  )

  return (
    <InfoRow
      title={`${t('general.apy')} (${capitalize(t('general.base'))})`}
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
          {formatPercentage(selectedTranche?.apy || 0)}
        </Typography>
      }
    />
  )
}

export default SimulatedBaseApy
