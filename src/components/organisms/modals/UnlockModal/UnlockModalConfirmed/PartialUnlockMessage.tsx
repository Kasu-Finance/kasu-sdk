import { Typography } from '@mui/material'
import { useWeb3React } from '@web3-react/core'
import { formatEther } from 'ethers/lib/utils'

import useLockModalState from '@/hooks/context/useLockModalState'
import useModalState from '@/hooks/context/useModalState'
import useRatio from '@/hooks/useRatio'
import useTranslation from '@/hooks/useTranslation'

import { ModalsKeys } from '@/context/modal/modal.types'

import { formatAccount, formatAmount, toBigNumber } from '@/utils'

const PartialUnlockMessage = () => {
  const { t } = useTranslation()

  const { account } = useWeb3React()

  const { amount } = useLockModalState()

  const { modal } = useModalState()

  const { userLock } = modal[ModalsKeys.UNLOCK]

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
        KSU{' '}
      </Typography>
      {t('modals.unlock.completed.description-3')},{' '}
      <Typography variant='baseMdBold'>
        {formatAmount(
          formatEther(
            toBigNumber(userLock.rKSUAmount).mul(ratio).div(toBigNumber('1'))
          ),
          { minDecimals: 2 }
        )}{' '}
        rKSU{' '}
      </Typography>
      {t('modals.unlock.completed.description-4')}{' '}
      <Typography variant='baseMdBold'>
        {formatAmount(amount, { minDecimals: 2 })} KSU{' '}
      </Typography>
      {t('modals.unlock.completed.description-5')}{' '}
      <Typography variant='baseMdBold'>{formatAccount(account)} </Typography>
      {t('modals.unlock.completed.description-6')}
    </Typography>
  )
}

export default PartialUnlockMessage
