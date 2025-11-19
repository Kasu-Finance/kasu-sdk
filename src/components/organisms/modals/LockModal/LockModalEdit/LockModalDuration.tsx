import { LockPeriod } from '@kasufinance/kasu-sdk/src/services/Locking/types'
import { Box, Button, Slider, Typography } from '@mui/material'
import { Dispatch, memo, SetStateAction } from 'react'

import useModalState from '@/hooks/context/useModalState'
import useModalStatusState from '@/hooks/context/useModalStatusState'
import getTranslation from '@/hooks/useTranslation'

import InfoRow from '@/components/atoms/InfoRow'
import ToolTip from '@/components/atoms/ToolTip'

import { ModalsKeys } from '@/context/modal/modal.types'

import { DATE_FORMAT } from '@/constants'
import dayjs from '@/dayjs'
import { customTypography } from '@/themes/typography'
import { formatAmount, formatToNearestTime, TimeConversions } from '@/utils'

const getAlignment = (index: number, arrayLength: number) => {
  switch (true) {
    case index === 0:
      return 'left'
    case index === arrayLength - 1:
      return 'right'
    default:
      return 'center'
  }
}

type LockModalDurationProps = {
  selectedLockPeriod: LockPeriod
  setSelectedLockPeriod: Dispatch<SetStateAction<LockPeriod>>
}

const LockModalDuration: React.FC<LockModalDurationProps> = ({
  selectedLockPeriod,
  setSelectedLockPeriod,
}) => {
  const { modal } = useModalState()

  const { lockPeriods } = modal[ModalsKeys.LOCK]

  const { modalStatus, setModalStatus } = useModalStatusState()

  const { t } = getTranslation()

  const handleChange = (_: Event, value: number | number[]) => {
    setSelectedLockPeriod(lockPeriods[value as number])
  }

  const unlockTime = dayjs().add(
    Number(
      parseFloat(selectedLockPeriod.lockPeriod) /
        TimeConversions.SECONDS_PER_DAY
    ),
    'days'
  )

  const disabled = modalStatus.type === 'error'

  // in the wild events a new lock period is added ( more than 4 )
  const gridTemplateColumns = `minmax(0, 0.5fr) ${[...new Array(lockPeriods.length - 2)].map(() => 'minmax(0,1fr)').join(' ')} minmax(0, 0.5fr)`

  return (
    <Box display='flex' flexDirection='column' sx={{ overflowX: 'hidden' }}>
      <Box display='grid' gridTemplateColumns={gridTemplateColumns}>
        {lockPeriods.map((period, index) => (
          <Button
            key={index}
            variant='text'
            onClick={() => setSelectedLockPeriod(period)}
            sx={{
              ...customTypography.baseXs,
              justifySelf: getAlignment(index, lockPeriods.length),
              color: 'white',
              textTransform: 'unset',
              p: 0,
              width: 'max-content',
              height: 'max-content',

              '&.Mui-disabled': {
                color: 'white',
              },
            }}
            disabled={disabled}
          >
            {formatToNearestTime(parseFloat(period.lockPeriod) * 1000)}
          </Button>
        ))}
      </Box>
      <Slider
        sx={{
          mt: 1,
          maxWidth: 'calc(100% - 30px)',
          mx: 'auto',
          '.MuiSlider-mark': {
            opacity: 1,
            bgcolor: 'white',
            '&.MuiSlider-markActive': {
              bgcolor: 'gray.extraDark',
            },
            '&::before': {
              position: 'absolute',
              content: '""',
              top: '50%',
              left: '50%',
              width: 10,
              height: 10,
              borderRadius: '50%',
              bgcolor: 'inherit',
              transform: 'translate(-50%, -50%)',
            },
          },
        }}
        disabled={disabled}
        getAriaValueText={(val) => val.toString()}
        valueLabelFormat={(val) =>
          `${parseFloat(lockPeriods[val].lockPeriod) / TimeConversions.SECONDS_PER_DAY} ${t('time.days')}`
        }
        color='secondary'
        valueLabelDisplay='auto'
        step={null}
        marks={
          disabled
            ? undefined
            : lockPeriods.map((_, index) => ({
                value: index,
              }))
        }
        max={lockPeriods.length - 1}
        value={lockPeriods.findIndex(
          ({ lockPeriod }) => lockPeriod === selectedLockPeriod.lockPeriod
        )}
        onChange={handleChange}
        onChangeCommitted={() => setModalStatus({ type: 'default' })}
      />
      <Box display='grid' gridTemplateColumns={gridTemplateColumns}>
        {lockPeriods.map((lockPeriod, index) => (
          <Box
            key={lockPeriod.id}
            flex={1}
            textAlign={getAlignment(index, lockPeriods.length)}
          >
            <Typography variant='baseSmBold' component='span'>
              {formatAmount(lockPeriod.rKSUMultiplier || '0', {
                minDecimals: 2,
                hideTrailingZero: false,
              })}{' '}
              ✕
              <Typography variant='baseSm' whiteSpace='nowrap'>
                <br />
                rKASU {t('general.multiplier')}
              </Typography>
            </Typography>
          </Box>
        ))}
      </Box>

      <InfoRow
        sx={{ mt: 3, py: 0 }}
        title={t('modals.lock.duration.unlocking')}
        toolTipInfo={
          <ToolTip
            title={t('modals.lock.duration.unlocking-date')}
            iconSx={{
              color: 'gold.extraDark',
              '&:hover': {
                color: 'rgba(133, 87, 38, 1)',
              },
            }}
          />
        }
        metric={
          <Typography
            variant='baseMdBold'
            component='span'
            color={disabled ? 'rgba(133, 87, 38, 1)' : undefined}
            textTransform='capitalize'
          >
            {disabled
              ? t('general.notAvailable')
              : unlockTime.format(DATE_FORMAT)}
          </Typography>
        }
      ></InfoRow>
    </Box>
  )
}

export default memo(LockModalDuration)
