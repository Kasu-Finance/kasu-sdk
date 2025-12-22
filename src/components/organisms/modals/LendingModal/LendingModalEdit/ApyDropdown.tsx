import { Box, SelectChangeEvent, Typography } from '@mui/material'
import { memo, useMemo } from 'react'

import useModalState from '@/hooks/context/useModalState'
import getTranslation from '@/hooks/useTranslation'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

import CustomSelect from '@/components/atoms/CustomSelect'

import { ModalsKeys } from '@/context/modal/modal.types'

import { formatPercentage, formatToNearestTime, TimeConversions } from '@/utils'
import getAvailableFixedTermConfigs from '@/utils/lending/getAvailableFixedTermConfigs'

type ApyDropdownProps = {
  selectedTrancheId: `0x${string}`
  selectedPoolId?: string
  fixedTermConfigId: string | undefined
  setFixedTermConfigId: (fixedTermConfigId: string | undefined) => void
}

const ApyDropdown: React.FC<ApyDropdownProps> = ({
  fixedTermConfigId,
  selectedPoolId,
  selectedTrancheId,
  setFixedTermConfigId,
}) => {
  const { t } = getTranslation()
  const { address } = usePrivyAuthenticated()
  const { modal } = useModalState()

  const { pools, pool: defaultPool } = modal[ModalsKeys.LEND]

  const selectedPool =
    selectedPoolId && pools
      ? pools.find((pool) => pool.id === selectedPoolId)
      : defaultPool

  const selectedTranche = selectedPool?.tranches.find(
    (tranche) => tranche.id === selectedTrancheId
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
            ...getAvailableFixedTermConfigs(selectedTranche, address).map(
              (fixedTermConfig) => {
                const durationInMs =
                  parseFloat(fixedTermConfig.epochLockDuration) *
                  TimeConversions.DAYS_PER_WEEK *
                  TimeConversions.SECONDS_PER_DAY *
                  1000

                return {
                  label: `${t('general.fixedApy')}, ${fixedTermConfig.epochLockDuration} ${t('general.epoch')} (~${formatToNearestTime(durationInMs)})`,
                  id: fixedTermConfig.configId,
                  value: fixedTermConfig.apy,
                }
              }
            ),
          ]
        : null,
    [t, address, selectedTranche]
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

export default memo(ApyDropdown)
