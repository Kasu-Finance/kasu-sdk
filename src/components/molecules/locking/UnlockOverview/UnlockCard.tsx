import {
  Button,
  Card,
  CardActions,
  CardContent,
  Grid,
  Typography,
} from '@mui/material'
import { UserLock } from 'kasu-sdk/src/types'

import useModalState from '@/hooks/context/useModalState'
import useTranslation from '@/hooks/useTranslation'

import ColoredBox from '@/components/atoms/ColoredBox'
import TokenAmount from '@/components/atoms/TokenAmount'
import UnlockItem from '@/components/molecules/locking/UnlockOverview/UnlockItem'

import { UnlockIcon } from '@/assets/icons'

import dayjs from '@/dayjs'
import { TimeConversions } from '@/utils'

type UnlockCardProps = {
  userLock: UserLock
}

const UnlockCard: React.FC<UnlockCardProps> = ({ userLock }) => {
  const { t } = useTranslation()

  const { openModal } = useModalState()

  const hasUnlocked = dayjs().isAfter(dayjs.unix(userLock.endTime))

  const remainingLockingPeriod = hasUnlocked
    ? 0
    : (userLock.endTime - userLock.startTime) / TimeConversions.SECONDS_PER_DAY

  const handleOpen = () => {
    openModal({ name: 'unlockModal', userLock })
  }

  return (
    <Card elevation={0}>
      <CardContent sx={{ px: 0 }}>
        <ColoredBox>
          <Grid container spacing={2}>
            <UnlockItem
              title='Amount Locked'
              metric={
                <>
                  <TokenAmount amount={userLock.lockedAmount} symbol='KSU' />
                  <Typography
                    display='block'
                    variant='caption'
                    component='span'
                  >
                    {dayjs
                      .unix(userLock.startTime)
                      .format('DD.MM.YYYY • HH:mm:ss UTCZZ')}
                  </Typography>
                </>
              }
            />
            <UnlockItem
              title='Unlocking Date'
              toolTipInfo='info'
              metric={dayjs.unix(userLock.endTime).format('DD.MM.YYYY')}
            />
            <UnlockItem
              title='Locking Duration'
              toolTipInfo='info'
              metric={`${userLock.lockPeriod.lockPeriod} days`}
            />
            <UnlockItem
              title='Remaining Locking Period'
              toolTipInfo='info'
              metric={`${remainingLockingPeriod} days`}
              disabled={hasUnlocked}
            />
            <UnlockItem
              title='Multiplier'
              toolTipInfo='info'
              metric={
                <>
                  <Typography variant='h6' component='span'>
                    {userLock.lockPeriod.ksuBonusMultiplier}{' '}
                  </Typography>
                  <Typography variant='body1' component='span'>
                    X
                  </Typography>
                </>
              }
            />
            <UnlockItem
              title='Rewards'
              toolTipInfo='info'
              metric={
                <TokenAmount amount={userLock.rKSUAmount} symbol='rKSU' />
              }
            />
          </Grid>
        </ColoredBox>
      </CardContent>
      <CardActions sx={{ justifyContent: 'center' }}>
        <Button
          variant='contained'
          sx={{
            width: 131,
            '& .MuiButton-startIcon > svg > path': hasUnlocked
              ? {
                  fill: 'white',
                  fillOpacity: 1,
                }
              : undefined,
          }}
          startIcon={<UnlockIcon />}
          disabled={!hasUnlocked}
          onClick={handleOpen}
        >
          {t('general.unlock')}
        </Button>
      </CardActions>
    </Card>
  )
}

export default UnlockCard
