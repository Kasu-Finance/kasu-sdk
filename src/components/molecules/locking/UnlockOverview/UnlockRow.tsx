import { Button, TableCell, TableRow, Typography } from '@mui/material'
import { UserLock } from '@solidant/kasu-sdk/src/services/Locking/types'

import useModalState from '@/hooks/context/useModalState'
import useCountdown from '@/hooks/useCountdown'
import useTranslation from '@/hooks/useTranslation'

import TokenAmount from '@/components/atoms/TokenAmount'

import { UnlockIcon } from '@/assets/icons'

import dayjs from '@/dayjs'
import { formatAmount } from '@/utils'

type UnlockRowProps = {
  userLock: UserLock
}

const UnlockRow: React.FC<UnlockRowProps> = ({ userLock }) => {
  const { t } = useTranslation()

  const { openModal } = useModalState()

  const { endTime, lockPeriod, lockedAmount, rKSUAmount, startTime } = userLock

  const handleOpen = () => {
    openModal({ name: 'unlockModal', userLock })
  }

  const isUnlocked = dayjs.unix(endTime).isBefore()

  const [timeLeft, timeUnit] = useCountdown(endTime, {
    toNearestUnit: true,
  }).split(' ')

  return (
    <TableRow>
      <TableCell>
        <TokenAmount
          amount={formatAmount(lockedAmount, { minDecimals: 2 })}
          symbol='KSU'
        />
        <Typography variant='caption' component='span' display='block'>
          {dayjs.unix(startTime).format('DD.MM.YYYY • HH:mm:ss UTCZZ')}
        </Typography>
        <Button
          variant='contained'
          startIcon={<UnlockIcon />}
          sx={{
            mt: 1,
            '& .MuiButton-startIcon > svg > path': isUnlocked
              ? undefined
              : {
                  fill: 'rgba(0,0,0,0.26)',
                },
          }}
          onClick={handleOpen}
          disabled={!isUnlocked}
        >
          {t('general.unlock')}
        </Button>
      </TableCell>
      <TableCell align='right'>
        <Typography variant='body1' component='span'>
          {dayjs.unix(endTime).format('DD.MM.YYYY')}
        </Typography>
      </TableCell>
      <TableCell align='right'>
        <Typography variant='body1' component='span'>
          {timeLeft}&nbsp;
        </Typography>
        <Typography variant='caption' component='span'>
          {timeUnit}
        </Typography>
      </TableCell>
      <TableCell align='right'>
        <Typography variant='body1' component='span'>
          {lockPeriod.rKSUMultiplier}{' '}
        </Typography>
        <Typography variant='caption' component='span'>
          ✕
        </Typography>
      </TableCell>
      <TableCell align='right'>
        <Typography variant='body1' component='span'>
          {rKSUAmount}{' '}
        </Typography>
        <Typography variant='caption' component='span'>
          rKSU
        </Typography>
      </TableCell>
    </TableRow>
  )
}

export default UnlockRow
