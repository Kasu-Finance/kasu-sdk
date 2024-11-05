'use client'

import { Button, Typography } from '@mui/material'
import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'

import useModalState from '@/hooks/context/useModalState'
import useLoanTickets from '@/hooks/lending/useLoanTickets'
import getTranslation from '@/hooks/useTranslation'

import WaveBox from '@/components/atoms/WaveBox'

import { ModalsKeys } from '@/context/modal/modal.types'

import { mapPendingDecisionsToPools } from '@/utils'

type NotificationBannerProps = {
  pools: PoolOverview[]
}

const NotificationBanner: React.FC<NotificationBannerProps> = ({ pools }) => {
  const { t } = getTranslation()

  const { openModal } = useModalState()

  const { loanTickets } = useLoanTickets()

  if (!loanTickets?.length) return

  const { count, pendingDecisions } = mapPendingDecisionsToPools(
    loanTickets,
    pools
  )

  if (!count) return

  const handleOpen = () =>
    openModal({ name: ModalsKeys.PENDING_DECISIONS, pendingDecisions, pools })

  return (
    <WaveBox
      variant='gold'
      display='flex'
      alignItems='center'
      justifyContent='space-between'
      px={2}
      py={3}
      borderRadius={2}
    >
      <Typography variant='h3'>
        {t('portfolio.transactions.notification.title').replace(
          '{count}',
          count.toString()
        )}
      </Typography>
      <Button
        variant='outlined'
        color='secondary'
        sx={{ height: 32, width: 101, textTransform: 'capitalize' }}
        onClick={handleOpen}
      >
        {t('portfolio.transactions.notification.action')}
      </Button>
    </WaveBox>
  )
}

export default NotificationBanner
