import { Stack, Typography } from '@mui/material'

import useLockModalState from '@/hooks/context/useLockModalState'
import useModalState from '@/hooks/context/useModalState'
import getTranslation from '@/hooks/useTranslation'

import PartialUnlockMessage from '@/components/organisms/modals/UnlockModal/UnlockModalConfirmed/PartialUnlockMessage'
import UnlockModalConfirmedActions from '@/components/organisms/modals/UnlockModal/UnlockModalConfirmed/UnlockModalConfirmedActions'

import { ModalsKeys } from '@/context/modal/modal.types'

import { formatAmount, toBigNumber } from '@/utils'

const UnlockModalConfirmed = () => {
  const { t } = getTranslation()

  const { amount } = useLockModalState()

  const { modal } = useModalState()

  const { userLock } = modal[ModalsKeys.UNLOCK]

  const isPartial = !toBigNumber(amount).eq(toBigNumber(userLock.lockedAmount))

  return (
    <Stack spacing={3}>
      <Typography variant='h4'>
        {t('modals.unlock.completed.description-1')}
      </Typography>
      {isPartial ? (
        <PartialUnlockMessage />
      ) : (
        <Typography variant='baseMd'>
          <Typography variant='baseMdBold'>
            {formatAmount(amount, { minDecimals: 2 })} KSU{' '}
          </Typography>
          {t('modals.unlock.completed.description-2')}
        </Typography>
      )}
      <UnlockModalConfirmedActions />
    </Stack>
  )
}

export default UnlockModalConfirmed
