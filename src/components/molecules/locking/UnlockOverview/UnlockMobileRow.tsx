import { Grid, TableCell, TableRow, Typography } from '@mui/material'
import { UserLock } from '@solidant/kasu-sdk/src/services/Locking/types'

import useCountdown from '@/hooks/useCountdown'
import useTranslation from '@/hooks/useTranslation'

import TokenAmount from '@/components/atoms/TokenAmount'

import { DATE_FORMAT, TIME_FORMAT } from '@/constants'
import dayjs from '@/dayjs'
import { formatAmount } from '@/utils'

type UnlockRowProps = {
  userLock: UserLock
}

const UnlockMobileRow: React.FC<UnlockRowProps> = ({ userLock }) => {
  const { t } = useTranslation()

  const { endTime, lockPeriod, lockedAmount, rKSUAmount, startTime } = userLock

  const [timeLeft, timeUnit] = useCountdown(endTime, {
    toNearestUnit: true,
  }).split(' ')

  return (
    <TableRow>
      <TableCell
        sx={(theme) => ({ px: 0, borderColor: theme.palette.primary.main })}
      >
        <TokenAmount amount={formatAmount(lockedAmount || '0')} symbol='KSU' />
        <Typography variant='caption' component='span' display='block'>
          {dayjs.unix(startTime).format(`${DATE_FORMAT} • ${TIME_FORMAT}`)}
        </Typography>
        <Grid container spacing={2} mt={0.5}>
          <Grid item xs={6}>
            <Typography variant='body2' component='span' fontSize={10}>
              {t('locking.widgets.unlock.table.headers.unlockDate')}
            </Typography>
            <Typography
              variant='subtitle2'
              component='span'
              fontSize={12}
              display='block'
            >
              {dayjs.unix(endTime).format(DATE_FORMAT)}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant='body2' component='span' fontSize={10}>
              {t('locking.widgets.unlock.table.headers.remainingDuration.1')}{' '}
              {t('locking.widgets.unlock.table.headers.remainingDuration.2')}
            </Typography>
            <Typography
              variant='subtitle2'
              component='span'
              fontSize={12}
              display='block'
            >
              {timeLeft} {timeUnit}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant='body2' component='span' fontSize={10}>
              {t('locking.widgets.unlock.table.headers.multiplier')}
            </Typography>
            <Typography
              variant='subtitle2'
              component='span'
              fontSize={12}
              display='block'
            >
              {lockPeriod.rKSUMultiplier} ✕
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant='body2' component='span' fontSize={10}>
              {t('locking.widgets.unlock.table.headers.balance')}
            </Typography>
            <Typography
              variant='subtitle2'
              component='span'
              fontSize={12}
              display='block'
            >
              {rKSUAmount} rKSU
            </Typography>
          </Grid>
        </Grid>
      </TableCell>
    </TableRow>
  )
}

export default UnlockMobileRow
