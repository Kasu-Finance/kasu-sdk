import { PoolOverview } from '@kasufinance/kasu-sdk/src/services/DataService/types'
import { Box, SelectChangeEvent, Typography } from '@mui/material'
import React from 'react'

import getTranslation from '@/hooks/useTranslation'

import CustomSelect from '@/components/atoms/CustomSelect'
import ToolTip from '@/components/atoms/ToolTip'

import { customPalette } from '@/themes/palette'
import { capitalize, mergeSubheading, toBigNumber } from '@/utils'

type PoolDropdownProps = {
  pools: PoolOverview[]
  selectedPool: string
  handlePoolChange: (pool: PoolOverview) => void
  isPoolFull?: (pool: PoolOverview) => boolean
}

const PoolDropdown: React.FC<PoolDropdownProps> = ({
  pools,
  selectedPool,
  handlePoolChange,
  isPoolFull,
}) => {
  const { t } = getTranslation()
  const isPoolFullLocal = (pool: PoolOverview) =>
    pool.tranches.every((tranche) =>
      toBigNumber(tranche.maximumDeposit).isZero()
    )

  const handleChange = (e: SelectChangeEvent) => {
    const poolId = e.target.value

    const pool = pools.find((pool) => pool.id === poolId)

    if (!pool) return

    const poolIsFull = isPoolFull?.(pool) ?? isPoolFullLocal(pool)

    // prevent switching to a fully subscribed strategy
    if (poolIsFull && pool.id !== selectedPool) return

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
      renderItem={(val) => {
        const isFull = isPoolFull?.(val) ?? isPoolFullLocal(val)

        return (
          <Box
            py={1}
            display='flex'
            alignItems='center'
            justifyContent='space-between'
            color={isFull ? customPalette.gray.dark : undefined}
            width='100%'
            sx={{
              cursor:
                isFull && val.id !== selectedPool ? 'not-allowed' : 'pointer',
              opacity: isFull && val.id !== selectedPool ? 0.8 : 1,
            }}
          >
            <Typography
              variant='baseMd'
              display='inline-flex'
              alignItems='center'
              color='inherit'
            >
              {val.label}{' '}
              {isFull ? (
                <>
                  (Full)
                  <ToolTip
                    placement='top'
                    title='This Lending Strategy is temporarily full. Please check again in the next weekly epoch. Each weekly epoch ends every Tuesday at 6am UTC.'
                    iconSx={{
                      color: customPalette.gold.dark,
                      '&:hover': {
                        color: customPalette.gold.extraDark,
                      },
                    }}
                  />
                </>
              ) : null}
            </Typography>
          </Box>
        )
      }}
      selectSx={{ '.MuiOutlinedInput-input': { pl: 3 } }}
    />
  )
}

export default PoolDropdown
