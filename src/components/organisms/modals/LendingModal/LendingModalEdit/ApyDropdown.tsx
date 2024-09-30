import { Box, SelectChangeEvent, Typography } from '@mui/material'
import { useState } from 'react'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useModalState from '@/hooks/context/useModalState'
import useTranslation from '@/hooks/useTranslation'

import CustomSelect from '@/components/atoms/CustomSelect'

import { ModalsKeys } from '@/context/modal/modal.types'

import { formatPercentage } from '@/utils'

const ApyDropdown = () => {
  const { t } = useTranslation()

  const { modal } = useModalState()

  const { trancheId } = useDepositModalState()

  const [apy, setApy] = useState('')

  const pool = modal[ModalsKeys.LEND].pool

  const selectedTranche = pool.tranches.find(
    (tranche) => tranche.id === trancheId
  )

  if (!selectedTranche) return null

  const handleChange = (e: SelectChangeEvent) => {
    const apyValue = e.target.value

    setApy(apyValue)
  }

  const apyOptions = [
    {
      label: `Variable ${t('general.apy')}`,
      id: 'variable',
      value: selectedTranche.apy,
    },
    {
      label: `Fixed ${t('general.apy')}, 6 months`,
      id: 'fixed',
      value: selectedTranche.apy,
    },
  ]

  return (
    <CustomSelect
      variant='secondary'
      options={apyOptions}
      label={t('general.apy')}
      labelKey='label'
      valueKey='id'
      onChange={handleChange}
      value={apy}
      selectSx={{
        '.MuiOutlinedInput-input': {
          pl: 2.5,
        },
      }}
      renderSelected={(val) => (
        <Typography variant='baseMd'>
          {val ? val.label : t('modals.lending.select-apy')}
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
