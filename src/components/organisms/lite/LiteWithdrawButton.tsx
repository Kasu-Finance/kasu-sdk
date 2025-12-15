'use client'

import { PoolOverview } from '@kasufinance/kasu-sdk/src/services/DataService/types'
import { Button, ButtonProps } from '@mui/material'
import { useCallback, useMemo, useState } from 'react'
import { useChainId } from 'wagmi'

import useModalState from '@/hooks/context/useModalState'
import useToastState from '@/hooks/context/useToastState'
import { fetchUserTrancheBalancesForPools } from '@/hooks/lending/fetchUserTrancheBalancesForPools'
import getTranslation from '@/hooks/useTranslation'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

import { ModalsKeys } from '@/context/modal/modal.types'

import { PoolOverviewWithDelegate } from '@/types/page'

type LiteWithdrawButtonProps = ButtonProps & {
  pools: PoolOverviewWithDelegate[]
}

const LiteWithdrawButton: React.FC<LiteWithdrawButtonProps> = ({
  pools,
  ...rest
}) => {
  const { t } = getTranslation()
  const chainId = useChainId()

  const { address } = usePrivyAuthenticated()
  const addressLower = address?.toLowerCase()

  const { openModal } = useModalState()
  const { setToast } = useToastState()

  const [isOpening, setIsOpening] = useState(false)

  const poolOptions = useMemo(() => pools as PoolOverview[], [pools])

  const handleWithdraw = useCallback(async () => {
    if (!addressLower || !chainId) return

    try {
      setIsOpening(true)

      const trancheBalance = await fetchUserTrancheBalancesForPools({
        chainId,
        pools: poolOptions,
        userAddressLower: addressLower,
      })

      const hasBalance = trancheBalance.some(
        (tranche) => !tranche.balanceData.availableToWithdraw.isZero()
      )

      if (!hasBalance) {
        setToast({
          type: 'info',
          title: 'Nothing to withdraw',
          message: 'You do not have any available balance to withdraw yet.',
        })
        return
      }

      openModal({
        name: ModalsKeys.WITHDRAW,
        pool: pools[0],
        pools: poolOptions,
        trancheBalance,
      })
    } catch (error) {
      setToast({
        type: 'error',
        title: 'Withdraw error',
        message: 'Failed to load withdrawal balances. Please try again.',
      })
      // eslint-disable-next-line no-console
      console.error(error)
    } finally {
      setIsOpening(false)
    }
  }, [addressLower, chainId, openModal, poolOptions, pools, setToast])

  return (
    <Button
      variant='contained'
      fullWidth
      sx={{ textTransform: 'capitalize' }}
      onClick={handleWithdraw}
      disabled={Boolean(!addressLower || isOpening)}
      {...rest}
    >
      {t('general.withdraw')}
    </Button>
  )
}

export default LiteWithdrawButton
