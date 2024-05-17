import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import LoginIcon from '@mui/icons-material/Login'
import { Box, Button } from '@mui/material'
import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'
import Link from 'next/link'

import useModalState from '@/hooks/context/useModalState'
import useUserPoolBalance from '@/hooks/lending/useUserPoolBalance'
import useTranslation from '@/hooks/useTranslation'

import { PoolData } from '@/components/molecules/lending/overview/TranchesApyCard'

import { ModalsKeys } from '@/context/modal/modal.types'

import { getPoolData } from '@/utils'

interface PoolCardActionsProps {
  pool: PoolOverview
  link: string
}

const PoolCardActions: React.FC<PoolCardActionsProps> = ({ pool, link }) => {
  const { t } = useTranslation()
  const { openModal } = useModalState()
  const { data: userPoolBalance } = useUserPoolBalance(pool?.id)
  const poolData: PoolData = getPoolData(pool, userPoolBalance)

  const handleOpenDeposit = () =>
    openModal({
      name: ModalsKeys.EARNINGS_CALCULATOR,
      poolData: poolData,
    })

  return (
    <Box display='flex' justifyContent='center' mt={3} mb={2}>
      <Button
        variant='contained'
        sx={{ pl: 2.25, pr: 2.25 }}
        startIcon={<LoginIcon />}
        onClick={handleOpenDeposit}
      >
        {t('general.deposit')}
      </Button>
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
