import { SelectChangeEvent, Typography } from '@mui/material'
import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'
import React from 'react'

import getTranslation from '@/hooks/useTranslation'

import CustomSelect from '@/components/atoms/CustomSelect'

import { capitalize, mergeSubheading } from '@/utils'

type PoolDropdownProps = {
  pools: PoolOverview[]
  selectedPool: string
  handlePoolChange: (pool: PoolOverview) => void
}

const PoolDropdown: React.FC<PoolDropdownProps> = ({
  pools,
  selectedPool,
  handlePoolChange,
}) => {
  const { t } = getTranslation()

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
