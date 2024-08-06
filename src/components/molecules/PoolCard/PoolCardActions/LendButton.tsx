'use client'

import { formatUnits } from 'ethers/lib/utils'
import React from 'react'

import useModalState from '@/hooks/context/useModalState'
import useUserPoolBalance from '@/hooks/lending/useUserPoolBalance'
import useTranslation from '@/hooks/useTranslation'
import useSupportedTokenInfo from '@/hooks/web3/useSupportedTokenInfo'

import AuthenticateButton from '@/components/atoms/AuthenticateButton'
import { PoolData } from '@/components/molecules/lending/overview/TranchesApyCard'

import { ModalsKeys } from '@/context/modal/modal.types'

import { SupportedTokens } from '@/constants/tokens'
import { getPoolData } from '@/utils'

import { PoolOverviewWithDelegate } from '@/types/page'

type LendButtonProps = {
  pool: PoolOverviewWithDelegate
}

const LendButton: React.FC<LendButtonProps> = ({ pool }) => {
  const { t } = useTranslation()

  const { openModal } = useModalState()
  const { data: userPoolBalance } = useUserPoolBalance(pool.id)

  const supportedToken = useSupportedTokenInfo()

  const poolData: PoolData = getPoolData(
    pool,
    formatUnits(
      userPoolBalance?.balance || '0',
      supportedToken?.[SupportedTokens.USDC].decimals
    )
  )

  const handleOpen = () =>
    openModal({
      name: ModalsKeys.EARNINGS_CALCULATOR,
      poolData,
      poolOverview: pool,
    })

  return (
    <AuthenticateButton
      variant='contained'
      sx={{ pl: 2.25, pr: 2.25, flex: 1, textTransform: 'capitalize' }}
      onClick={handleOpen}
    >
      {t('general.lend')}
    </AuthenticateButton>
  )
}

export default LendButton
