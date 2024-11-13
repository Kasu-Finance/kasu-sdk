import { Box, SelectChangeEvent, Typography } from '@mui/material'
import { useWeb3React } from '@web3-react/core'
import { useMemo } from 'react'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useModalState from '@/hooks/context/useModalState'
import getTranslation from '@/hooks/useTranslation'

import CustomSelect from '@/components/atoms/CustomSelect'

import { ModalsKeys } from '@/context/modal/modal.types'

import { formatPercentage, formatToNearestTime, TimeConversions } from '@/utils'

const ApyDropdown = () => {
  const { t } = getTranslation()

  const { account } = useWeb3React()

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
            ...selectedTranche.fixedTermConfig
              .filter(
                (fixedTermConfig) =>
                  fixedTermConfig.fixedTermDepositStatus === 'Everyone' ||
                  fixedTermConfig.fixedTermDepositAllowlist.find(
                    (allowList) =>
                      allowList.userId.toLowerCase() === account?.toLowerCase()
                  )
              )
              .map((fixedTermConfig) => {
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
              }),
          ]
        : null,
    [t, account, selectedTranche]
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
