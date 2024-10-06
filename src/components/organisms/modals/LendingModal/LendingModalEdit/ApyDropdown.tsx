import { Box, SelectChangeEvent, Typography } from '@mui/material'
import { useMemo } from 'react'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useModalState from '@/hooks/context/useModalState'
import useTranslation from '@/hooks/useTranslation'

import CustomSelect from '@/components/atoms/CustomSelect'

import { ModalsKeys } from '@/context/modal/modal.types'

import { formatEpoch, formatPercentage, TimeConversions } from '@/utils'

const ApyDropdown = () => {
  const { t } = useTranslation()

  const { modal } = useModalState()

  const { trancheId, fixedTermConfigId, setFixedTermConfigId } =
    useDepositModalState()

  const pool = modal[ModalsKeys.LEND].pool

  const selectedTranche = pool.tranches.find(
    (tranche) => tranche.id === trancheId
  )

  const apyOptions = useMemo(
    () =>
      selectedTranche
        ? [
            {
              label: t('general.variableApy'),
              id: '0',
              value: selectedTranche.apy,
            },
            ...selectedTranche.fixedTermConfig.map((fixedTermConfig) => {
              const durationInMonths =
                (parseFloat(fixedTermConfig.epochLockDuration) *
                  TimeConversions.DAYS_PER_WEEK) /
                TimeConversions.DAYS_PER_MONTH

              return {
                label: `${t('general.fixedApy')}, ~ ${formatEpoch(durationInMonths)} ${fixedTermConfig.fixedTermDepositStatus === 'AllowlistedOnly' ? '(Whitelisted)' : ''}`,
                id: fixedTermConfig.configId,
                value: fixedTermConfig.apy,
              }
            }),
          ]
        : null,
    [t, selectedTranche]
  )

  if (!apyOptions) return null

  const handleChange = (e: SelectChangeEvent) => {
    const apyValue = e.target.value

    setFixedTermConfigId(apyValue)
  }

  return (
    <CustomSelect
      variant='secondary'
      options={apyOptions}
      label={t('general.apy')}
      labelKey='label'
      valueKey='id'
      onChange={handleChange}
      value={fixedTermConfigId ?? ''}
      selectSx={{
        '.MuiOutlinedInput-input': {
          pl: 2.5,
        },
      }}
      renderSelected={(val) => (
        <Typography variant='baseMd'>
          {val
            ? `${val.label} (${formatPercentage(val.value)})`
            : t('modals.lending.select-apy')}
        </Typography>
      )}
      renderItem={(val) => (
        <Box
          display='flex'
          alignItems='center'
          justifyContent='space-between'
          width='100%'
          py={1}
        >
          <Typography variant='baseMd'>{val.label}</Typography>
          <Typography variant='baseMd'>
            {formatPercentage(val.value)}
          </Typography>
        </Box>
      )}
    />
  )
}

export default ApyDropdown
