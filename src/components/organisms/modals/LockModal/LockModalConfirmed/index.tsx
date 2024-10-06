import { Stack, Typography } from '@mui/material'

import useLockModalState from '@/hooks/context/useLockModalState'
import useTranslation from '@/hooks/useTranslation'

import LockModalConfirmedActions from '@/components/organisms/modals/LockModal/LockModalConfirmed/LockModalConfirmedActions'

import { formatAmount } from '@/utils'

const LockModalConfirmed = () => {
  const { t } = useTranslation()

  const { amount } = useLockModalState()

  return (
    <Stack spacing={3}>
      <Typography variant='h4'>
        {t('modals.lock.completed.description-1')}
      </Typography>
      <Typography variant='baseMd'>
        <Typography variant='baseMdBold'>
          {formatAmount(amount)} KSU{' '}
        </Typography>
        {t('modals.lock.completed.description-2')}
      </Typography>
      <LockModalConfirmedActions />
    </Stack>
  )
}

export default LockModalConfirmed
