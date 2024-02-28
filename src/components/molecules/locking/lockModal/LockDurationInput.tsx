import { Box, lighten, Slider, Typography } from '@mui/material'

import useLockModalState from '@/hooks/context/useLockModalState'
import useLockPeriods from '@/hooks/locking/useLockPeriods'
import useTranslation from '@/hooks/useTranslation'

import ColoredBox from '@/components/atoms/ColoredBox'
import InfoRow from '@/components/atoms/InfoRow'
import LockPeriodInfo from '@/components/molecules/LockPeriodInfo'

import dayjs from '@/dayjs'

const LockDurationInput = () => {
  const { lockPeriods } = useLockPeriods()

  const { selectedLockPeriod, setSelectedLockPeriod, lockState, setLockState } =
    useLockModalState()

  const { t } = useTranslation()

  const handleChange = (_: Event, value: number | number[]) => {
    setLockState
    setSelectedLockPeriod(lockPeriods[value as number])
  }

  const unlockTime = dayjs().add(Number(selectedLockPeriod.lockPeriod), 'days')

  const disabled = lockState.type === 'error'

  return (
    <Box>
      <Typography variant='subtitle1' component='span' display='block'>
        {t('modals.lock.duration.title')}
      </Typography>
      <Slider
        disabled={disabled}
        sx={{
          height: 4,
          maxWidth: 450,
          mt: 2,
          mx: 'auto',
          display: 'block',
          '& .MuiSlider-mark': {
            width: 8,
            height: 8,
            borderRadius: '2px',
            '&[data-index="0"]': {
              ml: '2px',
            },
            '&.MuiSlider-markActive': {
              width: 4,
              height: 4,
              backgroundColor: lighten('#ffffff', 0.2),
            },
          },
        }}
        getAriaValueText={(val) => val.toString()}
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
        onChangeCommitted={() => setLockState({ type: 'default' })}
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
          bgcolor: lockState.bgColor,
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
            >
              {disabled ? 'Not Available' : unlockTime.format('DD.MM.YYYY')}
            </Typography>
          }
        ></InfoRow>
      </ColoredBox>
    </Box>
  )
}

export default LockDurationInput
