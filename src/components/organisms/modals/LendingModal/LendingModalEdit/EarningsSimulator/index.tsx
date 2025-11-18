import { Box, Button, Collapse, Stack, Typography } from '@mui/material'
import { memo, Suspense, useDeferredValue, useReducer, useState } from 'react'

import useLoyaltyLevel from '@/hooks/locking/useLoyaltyLevel'
import getTranslation from '@/hooks/useTranslation'
import useLockingPercentage from '@/hooks/web3/useLockingPercentage'

import SimulatedLendingDuration from '@/components/organisms/modals/LendingModal/LendingModalEdit/EarningsSimulator/SimulatedLendingDuration'
import SimulatedYieldEarnings from '@/components/organisms/modals/LendingModal/LendingModalEdit/EarningsSimulator/SimulatedYieldEarnings'

import { ChevronDownIcon } from '@/assets/icons'

type EarningsSimulatorProps = {
  fixedTermConfigId?: string
  amount: string
  amountInUSD?: string
  trancheId: `0x${string}`
}

const EarningsSimulator: React.FC<EarningsSimulatorProps> = ({
  fixedTermConfigId,
  amount,
  amountInUSD,
  trancheId,
}) => {
  const { t } = getTranslation()

  const [duration, setDuration] = useState(0)
  const deferredValue = useDeferredValue(duration)

  const [collapsed, toggleCollapsed] = useReducer((prev) => !prev, false)

  const isFixedTermSelected = Boolean(
    fixedTermConfigId && fixedTermConfigId !== '0'
  )

  const { stakedPercentage } = useLockingPercentage()
  const { currentLevel } = useLoyaltyLevel(stakedPercentage)

  return (
    <Box bgcolor='gold.dark' borderRadius={2}>
      <Button
        onClick={toggleCollapsed}
        variant='text'
        fullWidth
        endIcon={<ChevronDownIcon />}
        sx={{
          py: 2,
          px: 2.5,
          textTransform: 'capitalize',
          justifyContent: 'space-between',
          height: 'auto',
          borderRadius: 2,
          '.MuiButton-endIcon svg path': {
            fill: 'white',
          },
        }}
      >
        <Typography variant='h4' color='gray.extraDark'>
          {t('modals.lending.earningsSimulator.title')}
        </Typography>
      </Button>
      <Collapse in={collapsed} timeout={300}>
        <Stack spacing={2} px={2.5} pb={2}>
          <Typography variant='h5' color='white'>
            {t('modals.lending.earningsSimulator.subheading-1')}
          </Typography>
          <Typography variant='baseMd'>
            {isFixedTermSelected
              ? t('modals.lending.earningsSimulator.subheading-1-description-2')
              : t(
                  'modals.lending.earningsSimulator.subheading-1-description-1'
                )}
          </Typography>
          {!isFixedTermSelected && (
            <SimulatedLendingDuration
              amount={amount}
              duration={duration}
              setDuration={setDuration}
            />
          )}
          <Typography variant='h5' color='white'>
            {t('modals.lending.earningsSimulator.subheading-2')}
          </Typography>
          <Suspense fallback={null}>
            <SimulatedYieldEarnings
              currentLevel={currentLevel}
              trancheId={trancheId}
              simulatedDuration={deferredValue}
              isDebouncing={duration !== deferredValue}
              fixedTermConfigId={fixedTermConfigId}
              amount={amount}
              amountInUSD={amountInUSD}
            />
          </Suspense>
        </Stack>
      </Collapse>
    </Box>
  )
}

export default memo(EarningsSimulator)
