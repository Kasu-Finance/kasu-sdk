import {
  Box,
  Button,
  Collapse,
  FormControlLabel,
  Slider,
  Typography,
} from '@mui/material'
import { LockPeriod } from '@solidant/kasu-sdk/src/services/Locking/types'
import { Dispatch, memo, SetStateAction } from 'react'

import useBuyKasuModalState from '@/hooks/context/useBuyKasuModalState'
import useModalState from '@/hooks/context/useModalState'
import useModalStatusState from '@/hooks/context/useModalStatusState'
import getTranslation from '@/hooks/useTranslation'

import CustomCheckbox from '@/components/atoms/CustomCheckbox'
import InfoRow from '@/components/atoms/InfoRow'
import ToolTip from '@/components/atoms/ToolTip'

import { ModalsKeys } from '@/context/modal/modal.types'

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

type BuyKasuLockProps = {
  selectedLockPeriod: LockPeriod
  setSelectedLockPeriod: Dispatch<SetStateAction<LockPeriod>>
}

const BuyKasuLock: React.FC<BuyKasuLockProps> = ({
  selectedLockPeriod,
  setSelectedLockPeriod,
}) => {
  const { t } = getTranslation()
  const { swapAndLock, toggleSwapAndLock } = useBuyKasuModalState()

  const { modal } = useModalState()

  const { modalStatus, setModalStatus } = useModalStatusState()

  const { lockPeriods } = modal[ModalsKeys.BUY_KASU]

  const handleChange = (_: Event, value: number | number[]) => {
    setSelectedLockPeriod(lockPeriods[value as number])
  }

  const disabled = modalStatus.type === 'error'

  const gridTemplateColumns = `minmax(0, 0.5fr) ${[...new Array(lockPeriods.length - 2)].map(() => 'minmax(0,1fr)').join(' ')} minmax(0, 0.5fr)`

  return (
    <>
      <FormControlLabel
        control={
          <CustomCheckbox
            checked={swapAndLock}
            onChange={toggleSwapAndLock}
            name='Automatically lock'
            sx={{ mr: 2 }}
          />
        }
        label={
          <Typography variant='baseMd' component='p'>
            {t('modals.buyKasu.automaticallyLock')}
          </Typography>
        }
      />
      <Collapse in={swapAndLock} timeout={500} collapsedSize={0}>
        <Box
          px={2}
          py={2}
          borderRadius={2}
          bgcolor='gold.dark'
          display='flex'
          flexDirection='column'
        >
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
          <Box display='flex' flexDirection='column' alignItems='center'>
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
              value={
                selectedLockPeriod
                  ? lockPeriods.findIndex(
                      ({ lockPeriod }) =>
                        lockPeriod === selectedLockPeriod.lockPeriod
                    )
                  : 0
              }
              onChange={handleChange}
              onChangeCommitted={() => setModalStatus({ type: 'default' })}
            />
          </Box>
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
          <Box mt={4}>
            <InfoRow
              sx={{ pt: 0 }}
              title={`${t('modals.buyKasu.lock.metric-1')}`}
              titleStyle={{ textTransform: 'capitalize' }}
              metric={
                <Box>
                  <Typography variant='baseMdBold'>
                    {formatAmount('0.00', {
                      minDecimals: 2,
                    })}{' '}
                    KASU{' '}
                  </Typography>
                </Box>
              }
              showDivider
              dividerProps={{
                color: 'white',
              }}
            />
            <InfoRow
              sx={{ pt: 2 }}
              title={`${t('modals.buyKasu.lock.metric-2')}`}
              titleStyle={{ textTransform: 'capitalize' }}
              metric={
                <Box>
                  <Typography variant='baseMdBold'>
                    {formatAmount('0.00', {
                      minDecimals: 2,
                    })}{' '}
                    KASU{' '}
                  </Typography>
                </Box>
              }
              showDivider
              dividerProps={{
                color: 'white',
              }}
            />
            <InfoRow
              sx={{ pt: 4, pb: 0 }}
              title={`${t('modals.buyKasu.lock.metric-3')}`}
              titleStyle={{ textTransform: 'capitalize' }}
              toolTipInfo={
                <ToolTip
                  title={t('locking.widgets.overview.metric-1-tooltip')}
                  iconSx={{
                    color: 'gold.extraDark',
                    '&:hover': {
                      color: 'rgba(133, 87, 38, 1)',
                    },
                  }}
                />
              }
              metric={
                <Box>
                  <Typography variant='baseMdBold'>
                    {formatAmount('0.00', {
                      minDecimals: 2,
                    })}{' '}
                    KASU{' '}
                  </Typography>
                </Box>
              }
            />
          </Box>
        </Box>
      </Collapse>
    </>
  )
}

export default memo(BuyKasuLock)
