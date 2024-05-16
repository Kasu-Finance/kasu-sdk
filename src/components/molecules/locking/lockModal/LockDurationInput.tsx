import { Box, Slider, Typography } from '@mui/material'

import useLockModalState from '@/hooks/context/useLockModalState'
import useModalStatusState from '@/hooks/context/useModalStatusState'
import useLockPeriods from '@/hooks/locking/useLockPeriods'
import useTranslation from '@/hooks/useTranslation'

import ColoredBox from '@/components/atoms/ColoredBox'
import InfoRow from '@/components/atoms/InfoRow'
import LockPeriodInfo from '@/components/molecules/LockPeriodInfo'

import { DATE_FORMAT } from '@/constants'
import dayjs from '@/dayjs'

const LockDurationInput = () => {
  const { lockPeriods } = useLockPeriods()

  const { selectedLockPeriod, setSelectedLockPeriod } = useLockModalState()

  const { modalStatus, setModalStatus } = useModalStatusState()

  const { t } = useTranslation()

  const handleChange = (_: Event, value: number | number[]) => {
    setSelectedLockPeriod(lockPeriods[value as number])
  }

  const unlockTime = dayjs().add(Number(selectedLockPeriod.lockPeriod), 'days')

  const disabled = modalStatus.type === 'error'

  return (
    <Box>
      <Typography variant='subtitle1' component='span' display='block'>
        {t('modals.lock.duration.title')}
      </Typography>
      <Slider
        disabled={disabled}
        sx={{
          maxWidth: 430,
          mt: 2,
        }}
        getAriaValueText={(val) => val.toString()}
        valueLabelFormat={(val) =>
          `${lockPeriods[val].lockPeriod} ${t('time.days')}`
        }
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

      <LockPeriodInfo
        activePeriod={{
          ...selectedLockPeriod,
          id: disabled ? 'invalid id' : selectedLockPeriod.id, // use invalid id to disable highlighting
        }}
      />
      <ColoredBox
        display='flex'
        justifyContent='space-between'
        alignItems='center'
        mt={1}
        sx={{
          bgcolor: modalStatus.bgColor,
        }}
      >
        <InfoRow
          title={t('modals.lock.duration.unlocking')}
          toolTipInfo='info'
          metric={
            <Typography
              variant='h6'
              component='span'
              color={(theme) =>
                disabled ? theme.palette.text.disabled : undefined
              }
              textTransform='capitalize'
            >
              {disabled
                ? t('general.notAvailable')
                : unlockTime.format(DATE_FORMAT)}
            </Typography>
          }
        ></InfoRow>
      </ColoredBox>
    </Box>
  )
}

export default LockDurationInput
