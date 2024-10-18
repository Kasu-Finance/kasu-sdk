import { Box, Button, Collapse, Stack, Typography } from '@mui/material'
import { useReducer } from 'react'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useTranslation from '@/hooks/useTranslation'

import SimulatedLendingDuration from '@/components/organisms/modals/LendingModal/LendingModalEdit/EarningsSimulator/SimulatedLendingDuration'
import SimulatedYieldEarnings from '@/components/organisms/modals/LendingModal/LendingModalEdit/EarningsSimulator/SimulatedYieldEarnings'

import { ChevronDownIcon } from '@/assets/icons'

const EarningsSimulator = () => {
  const { t } = useTranslation()

  const { fixedTermConfigId } = useDepositModalState()

  const [collapsed, toggleCollapsed] = useReducer((prev) => !prev, false)

  const isFixedTermSelected = Boolean(
    fixedTermConfigId && fixedTermConfigId !== '0'
  )
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
      <Collapse in={collapsed} timeout='auto' unmountOnExit>
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
          {!isFixedTermSelected && <SimulatedLendingDuration />}
          <Typography variant='h5' color='white'>
            {t('modals.lending.earningsSimulator.subheading-2')}
          </Typography>
          <SimulatedYieldEarnings />
        </Stack>
      </Collapse>
    </Box>
  )
}

export default EarningsSimulator
