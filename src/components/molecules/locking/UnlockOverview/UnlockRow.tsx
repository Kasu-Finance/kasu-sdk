import { Box, Button, TableCell, TableRow, Typography } from '@mui/material'
import { UserLock } from 'kasu-sdk/src/types'

import useModalState from '@/hooks/context/useModalState'
import useTranslation from '@/hooks/useTranslation'

import TokenAmount from '@/components/atoms/TokenAmount'

import { UnlockIcon } from '@/assets/icons'

import dayjs from '@/dayjs'

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

  return (
    <TableRow>
      <TableCell>
        <Box>
          <TokenAmount amount={lockedAmount} symbol='KSU' />
        </Box>
        <Typography variant='caption' component='span' display='block'>
          {dayjs.unix(startTime).format('DD.MM.YYYY • HH:mm:ss UTCZZ')}
        </Typography>
        <Button
          variant='contained'
          startIcon={<UnlockIcon />}
          sx={{ mt: 1 }}
          onClick={handleOpen}
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
          {dayjs.unix(endTime).diff(dayjs.unix(startTime), 'days')}{' '}
        </Typography>
        <Typography variant='caption' component='span'>
          {t('time.days')}
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
