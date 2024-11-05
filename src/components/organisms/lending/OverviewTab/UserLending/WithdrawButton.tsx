'use client'

import { Button } from '@mui/material'
import { Box } from '@mui/system'

import useModalState from '@/hooks/context/useModalState'
import useUserLendingTrancheBalance from '@/hooks/lending/useUserLendingTrancheBalance'
import getTranslation from '@/hooks/useTranslation'

import { ModalsKeys } from '@/context/modal/modal.types'

import { PoolOverviewWithDelegate } from '@/types/page'

type WithdrawButtonProps = {
  pool: PoolOverviewWithDelegate
}

const WithdrawButton: React.FC<WithdrawButtonProps> = ({ pool }) => {
  const { t } = getTranslation()

  const { openModal } = useModalState()

  const { userLendingTrancheBalance } = useUserLendingTrancheBalance(pool)

  const handleWithdraw = () => {
    if (!userLendingTrancheBalance) return

    openModal({
      name: ModalsKeys.WITHDRAW,
      pool,
      trancheBalance: userLendingTrancheBalance,
    })
  }

  const hasBalance = userLendingTrancheBalance?.find(
    (tranche) => !tranche.balanceData.availableToWithdraw.isZero()
  )

  return (
    <Box width={368} mx='auto' display='flex' mt={4}>
      <Button
        variant='contained'
        onClick={handleWithdraw}
        fullWidth
        sx={{ textTransform: 'capitalize' }}
        disabled={Boolean(!hasBalance || !userLendingTrancheBalance)}
      >
        {t('general.withdraw')}
      </Button>
    </Box>
  )
}

export default WithdrawButton
