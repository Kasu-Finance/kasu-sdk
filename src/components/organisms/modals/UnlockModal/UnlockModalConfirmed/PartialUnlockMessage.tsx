import { Typography } from '@mui/material'
import { formatEther } from 'ethers/lib/utils'
import { useAccount } from 'wagmi'

import useUnlockModalState from '@/hooks/context/useUnlockModalState'
import useRatio from '@/hooks/useRatio'
import getTranslation from '@/hooks/useTranslation'

import { formatAccount, formatAmount, toBigNumber } from '@/utils'

const PartialUnlockMessage = () => {
  const { t } = getTranslation()

  const account = useAccount()

  const { amount, userLock } = useUnlockModalState()

  const ratio = useRatio(amount, userLock.lockedAmount)

  return (
    <Typography variant='baseMd'>
      <Typography variant='baseMdBold'>
        {formatAmount(
          formatEther(
            toBigNumber(userLock.lockedAmount).sub(toBigNumber(amount))
          ),
          { minDecimals: 2 }
        )}{' '}
        KASU{' '}
      </Typography>
      {t('modals.unlock.completed.description-3')},{' '}
      <Typography variant='baseMdBold'>
        {formatAmount(
          formatEther(
            toBigNumber(userLock.rKSUAmount).mul(ratio).div(toBigNumber('1'))
          ),
          { minDecimals: 2 }
        )}{' '}
        rKASU{' '}
      </Typography>
      {t('modals.unlock.completed.description-4')}{' '}
      <Typography variant='baseMdBold'>
        {formatAmount(amount, { minDecimals: 2 })} KASU{' '}
      </Typography>
      {t('modals.unlock.completed.description-5')}{' '}
      <Typography variant='baseMdBold'>
        {formatAccount(account.address)}{' '}
      </Typography>
      {t('modals.unlock.completed.description-6')}
    </Typography>
  )
}

export default PartialUnlockMessage
