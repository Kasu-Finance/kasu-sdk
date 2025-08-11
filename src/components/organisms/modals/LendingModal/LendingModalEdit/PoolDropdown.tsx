import { SelectChangeEvent, Typography } from '@mui/material'
import React from 'react'

import useModalState from '@/hooks/context/useModalState'
import getTranslation from '@/hooks/useTranslation'

import CustomSelect from '@/components/atoms/CustomSelect'

import { ModalsKeys } from '@/context/modal/modal.types'

import { capitalize, mergeSubheading } from '@/utils'

type PoolDropdownProps = {
  selectedPool: string
  setSelectedPool: (pool: string) => void
}

const PoolDropdown: React.FC<PoolDropdownProps> = ({
  selectedPool,
  setSelectedPool,
}) => {
  const { t } = getTranslation()

  const { modal } = useModalState()

  const { pools } = modal[ModalsKeys.LEND]

  if (!pools) return null

  const handleChange = (e: SelectChangeEvent) => {
    const poolId = e.target.value

    setSelectedPool(poolId)
  }

  return (
    <CustomSelect
      variant='secondary'
      options={pools.map((pool) => ({
        ...pool,
        label: mergeSubheading(pool.poolName, pool.subheading),
      }))}
      label={capitalize(t('general.lendingStrategy'))}
      labelKey='label'
      valueKey='id'
      value={selectedPool}
      onChange={handleChange}
      renderSelected={(val) => (
        <Typography variant='baseMd'>
          {val ? val.label : 'Select Lending Strategy'}
        </Typography>
      )}
    />
  )
}

export default PoolDropdown
