import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import LoginIcon from '@mui/icons-material/Login'
import { Box, Button } from '@mui/material'
import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'
import Link from 'next/link'

import useModalState from '@/hooks/context/useModalState'
import useUserPoolBalance from '@/hooks/lending/useUserPoolBalance'
import useDeviceDetection, { Device } from '@/hooks/useDeviceDetections'
import useTranslation from '@/hooks/useTranslation'

import KycButton from '@/components/atoms/KycButton'
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

  const currentDevice = useDeviceDetection()

  const handleOpenDeposit = () =>
    openModal({
      name: ModalsKeys.DEPOSIT,
      poolData: poolData,
    })

  return (
    <Box display='flex' justifyContent='center' mt={3} mb={2}>
      {currentDevice !== Device.MOBILE && (
        <KycButton
          variant='contained'
          sx={{ pl: 2.25, pr: 2.25 }}
          startIcon={<LoginIcon />}
          onClick={handleOpenDeposit}
        >
          {t('general.lend')}
        </KycButton>
      )}

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
