import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import LoginIcon from '@mui/icons-material/Login'
import { Box, Button } from '@mui/material'
import {
  PoolOverview,
  TrancheData,
} from '@solidant/kasu-sdk/src/services/DataService/types'
import { formatUnits } from 'ethers/lib/utils'
import Link from 'next/link'
import { useMemo } from 'react'

import useModalState from '@/hooks/context/useModalState'
import useUserPoolBalance from '@/hooks/lending/useUserPoolBalance'
import useTranslation from '@/hooks/useTranslation'

import KycButton from '@/components/atoms/KycButton'
import { PoolData } from '@/components/molecules/lending/overview/TranchesApyCard'

import { ModalsKeys } from '@/context/modal/modal.types'

import { TOKENS } from '@/constants/tokens'

interface PoolCardActionsProps {
  pool: PoolOverview
  link: string
}

const PoolCardActions: React.FC<PoolCardActionsProps> = ({ pool, link }) => {
  const { t } = useTranslation()
  const { openModal } = useModalState()

  const { data: userPoolBalance } = useUserPoolBalance(pool?.id)

  const poolBalance = useMemo(() => {
    if (!userPoolBalance) return '0'
    return formatUnits(userPoolBalance?.balance || '0', TOKENS.USDC.decimals)
  }, [userPoolBalance])

  const POOL_DATA: PoolData = {
    poolName: pool.poolName,
    lendingPoolId: pool.id as `0x${string}`,
    totalUserInvestment: poolBalance,
    tranches: pool.tranches.map((tranche: TrancheData) => ({
      toolTip: `lending.tranche.${tranche.name.toLowerCase()}.tooltip`,
      title: t(`lending.tranche.${tranche.name.toLowerCase()}`),
      trancheId: tranche.id as `0x${string}`,
      minimumDeposit: tranche.minimumDeposit,
      maximumDeposit: tranche.maximumDeposit,
    })),
  }

  const handleOpenDeposit = () =>
    openModal({
      name: ModalsKeys.DEPOSIT,
      poolData: POOL_DATA,
    })

  return (
    <Box display='flex' justifyContent='center' mt={3} mb={2}>
      <KycButton
        variant='contained'
        sx={{ pl: 2.25, pr: 2.25 }}
        startIcon={<LoginIcon />}
        onClick={handleOpenDeposit}
      >
        {t('general.deposit')}
      </KycButton>
      <Button
        sx={{ ml: 2 }}
        href={link}
        component={Link}
        variant='contained'
        startIcon={<ArrowForwardIcon />}
      >
        {t('general.overview')}
      </Button>
    </Box>
  )
}

export default PoolCardActions
