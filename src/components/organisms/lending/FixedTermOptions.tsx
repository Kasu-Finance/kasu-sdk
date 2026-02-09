'use client'

import { TrancheData } from '@kasufinance/kasu-sdk'
import { Typography } from '@mui/material'
import React from 'react'

import getTranslation from '@/hooks/useTranslation'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

import InfoRow from '@/components/atoms/InfoRow'
import ToolTip from '@/components/atoms/ToolTip'
import GrossApyTooltip from '@/components/molecules/tooltips/GrossApyTooltip'
import VariableAndFixedApyTooltip from '@/components/molecules/tooltips/VariableAndFixedApyTooltip'

import { formatPercentage, formatToNearestTime, TimeConversions } from '@/utils'
import getAvailableFixedTermConfigs from '@/utils/lending/getAvailableFixedTermConfigs'

type FixedTermOptionsProps = {
  tranche: TrancheData
  tooltipVariant: 'gross' | 'variableFixed'
  subtitleMuted?: boolean
}

const FixedTermOptions: React.FC<FixedTermOptionsProps> = ({
  tranche,
  tooltipVariant,
  subtitleMuted,
}) => {
  const { t } = getTranslation()
  const { address, isAuthenticated } = usePrivyAuthenticated()

  if (!isAuthenticated) return null

  const fixedTermConfigs = getAvailableFixedTermConfigs(tranche, address)

  if (!fixedTermConfigs.length) return null

  const tooltipContent =
    tooltipVariant === 'gross' ? (
      <GrossApyTooltip />
    ) : (
      <VariableAndFixedApyTooltip />
    )

  return (
    <>
      {fixedTermConfigs.map(({ epochLockDuration, apy, configId }) => {
        const durationInMs =
          parseFloat(epochLockDuration) *
          TimeConversions.DAYS_PER_WEEK *
          TimeConversions.SECONDS_PER_DAY *
          1000

        return (
          <InfoRow
            key={configId}
            title={`${t('general.fixedApy')}, ${epochLockDuration} ${t('general.epoch')}`}
            subtitle={`(~${formatToNearestTime(durationInMs)})`}
            toolTipInfo={<ToolTip title={tooltipContent} />}
            titleStyle={{
              variant: 'h5',
            }}
            subtitleStyle={
              subtitleMuted
                ? {
                    color: 'gray.middle',
                  }
                : undefined
            }
            metric={
              <Typography variant='h5' color='gold.dark'>
                {formatPercentage(apy)}
              </Typography>
            }
            showDivider
          />
        )
      })}
    </>
  )
}

export default FixedTermOptions
