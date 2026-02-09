'use client'

import {
  PoolOverview,
  TrancheData,
  UserTrancheBalance,
} from '@kasufinance/kasu-sdk'
import { Button, ButtonProps } from '@mui/material'

import useModalState from '@/hooks/context/useModalState'
import useUserLendingBalance from '@/hooks/portfolio/useUserLendingBalance'
import getTranslation from '@/hooks/useTranslation'

import { ModalsKeys } from '@/context/modal/modal.types'

import { PoolOverviewWithDelegate } from '@/types/page'

type WithdrawButtonProps = ButtonProps & {
  pool: PoolOverviewWithDelegate
  pools?: PoolOverview[]
}

const WithdrawButton: React.FC<WithdrawButtonProps> = ({
  pool,
  pools,
  ...rest
}) => {
  const { t } = getTranslation()

  const { openModal } = useModalState()

  const { userLendingBalance } = useUserLendingBalance(pools ?? [pool])

  const handleWithdraw = () => {
    if (!userLendingBalance) return

    const userLendingBalances = userLendingBalance
      ? userLendingBalance.flatMap(({ tranches }) => tranches)
      : []

    openModal({
      name: ModalsKeys.WITHDRAW,
      pool,
      pools,
      trancheBalance: userLendingBalances,
    })
  }

  const userLendingTrancheBalance:
    | (TrancheData & {
        balanceData: UserTrancheBalance
      })[]
    | undefined = userLendingBalance?.find(({ id }) => id === pool.id)?.tranches

  const hasBalance = userLendingTrancheBalance?.find(
    (tranche) => !tranche.balanceData.availableToWithdraw.isZero()
  )

  return (
    <Button
      variant='contained'
      onClick={handleWithdraw}
      fullWidth
      sx={{ textTransform: 'capitalize' }}
      disabled={Boolean(!hasBalance || !userLendingTrancheBalance)}
      {...rest}
    >
      {t('general.withdraw')}
    </Button>
  )
}

export default WithdrawButton
