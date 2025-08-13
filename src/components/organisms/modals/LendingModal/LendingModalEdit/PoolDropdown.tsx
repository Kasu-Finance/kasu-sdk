import { SelectChangeEvent, Typography } from '@mui/material'
import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'
import React from 'react'

import useModalState from '@/hooks/context/useModalState'
import getTranslation from '@/hooks/useTranslation'

import CustomSelect from '@/components/atoms/CustomSelect'

import { ModalsKeys } from '@/context/modal/modal.types'

import { capitalize, mergeSubheading } from '@/utils'

type PoolDropdownProps = {
  selectedPool: string
  handlePoolChange: (pool: PoolOverview) => void
}

const PoolDropdown: React.FC<PoolDropdownProps> = ({
  selectedPool,
  handlePoolChange,
}) => {
  const { t } = getTranslation()

  const { modal } = useModalState()

  const { pools } = modal[ModalsKeys.LEND]

  if (!pools) return null

  const handleChange = (e: SelectChangeEvent) => {
    const poolId = e.target.value

    const pool = pools.find((pool) => pool.id === poolId)

    if (!pool) return

    handlePoolChange(pool)
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
      selectSx={{ '.MuiOutlinedInput-input': { pl: 3 } }}
    />
  )
}

export default PoolDropdown
