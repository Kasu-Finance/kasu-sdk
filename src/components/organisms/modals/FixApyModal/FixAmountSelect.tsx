import { Box, SelectChangeEvent, Typography } from '@mui/material'
import { TrancheData } from '@solidant/kasu-sdk/src/services/DataService/types'
import { useWeb3React } from '@web3-react/core'
import React, { useMemo } from 'react'

import useFixApyState from '@/hooks/context/useFixApyState'
import getTranslation from '@/hooks/useTranslation'

import CustomSelect from '@/components/atoms/CustomSelect'

import { formatPercentage, formatToNearestTime, TimeConversions } from '@/utils'

type FixAmountSelectProps = {
  fixedTermConfigs: TrancheData['fixedTermConfig']
}

const FixAmountSelect: React.FC<FixAmountSelectProps> = ({
  fixedTermConfigs,
}) => {
  const { t } = getTranslation()

  const { fixedTermConfigId, setFixedTermConfigId } = useFixApyState()

  const { account } = useWeb3React()

  const apyOptions = useMemo(
    () =>
      fixedTermConfigs
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
            label: `${t('general.fixedApy')}, ~ ${formatToNearestTime(durationInMs)} ${fixedTermConfig.fixedTermDepositStatus === 'AllowlistedOnly' ? '(Whitelisted)' : ''}`,
            id: fixedTermConfig.configId,
            value: fixedTermConfig.apy,
          }
        }),

    [t, account, fixedTermConfigs]
  )

  const handleChange = (e: SelectChangeEvent) => {
    const apyValue = e.target.value

    setFixedTermConfigId(apyValue)
  }

  return (
    <CustomSelect
      variant='secondary'
      options={apyOptions}
      label={t('modals.fixApy.selectLabel')}
      labelKey='label'
      valueKey='id'
      onChange={handleChange}
      value={fixedTermConfigId}
      selectSx={{
        '.MuiOutlinedInput-input': {
          pl: 2.5,
        },
      }}
      renderSelected={(val) => (
        <Typography variant='baseMd'>
          {val
            ? `${val.label} (${formatPercentage(val.value)})`
            : t('modals.fixApy.selectPlaceholder')}
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

export default FixAmountSelect
