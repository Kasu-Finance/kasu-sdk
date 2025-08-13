import { Box, Stack, Typography } from '@mui/material'
import React from 'react'

import useModalState from '@/hooks/context/useModalState'
import getTranslation from '@/hooks/useTranslation'

import ProgressBar from '@/components/atoms/ProgressBar'

import { ModalsKeys } from '@/context/modal/modal.types'

import { formatPercentage, mergeSubheading } from '@/utils'

type TrancheInfoProps = { selectedPool: string; selectedTranche: `0x${string}` }

const TrancheInfo: React.FC<TrancheInfoProps> = ({
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

  const percentage = 1 - parseFloat(tranche.poolCapacityPercentage)

  return (
    <Box bgcolor='gold.dark' borderRadius={2} p={2}>
      <Stack spacing={2}>
        <ProgressBar
          value={percentage * 100}
          barStyles={{
            height: 16,
            '&.progress-background': { backgroundColor: 'gold.extraDark' },
            '&.progress-foreground': {
              borderRadius: 40,
              backgroundColor: 'gray.extraDark',
            },
          }}
          rootStyles={{ height: 16, borderRadius: 30 }}
        >
          <Typography variant='baseXs' width='100%' px={1}>
            {formatPercentage(percentage, 0).replaceAll(' %', '%')}{' '}
          </Typography>
        </ProgressBar>
        <Typography variant='baseSm' textAlign='center'>
          {mergeSubheading(pool.poolName, pool.subheading)}, {tranche.name}{' '}
          {t('general.tranche')} is{' '}
          {formatPercentage(percentage, 0).replaceAll(' %', '%')} full.
        </Typography>
      </Stack>
    </Box>
  )
}

export default TrancheInfo
