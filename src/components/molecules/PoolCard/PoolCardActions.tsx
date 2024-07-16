import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import LoginIcon from '@mui/icons-material/Login'
import { Box, Button, Collapse, Grow } from '@mui/material'
import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'
import { formatUnits } from 'ethers/lib/utils'
import Link from 'next/link'
import { useRef } from 'react'

import useModalState from '@/hooks/context/useModalState'
import useUserPoolBalance from '@/hooks/lending/useUserPoolBalance'
import useDeviceDetection, { Device } from '@/hooks/useDeviceDetections'
import useTranslation from '@/hooks/useTranslation'
import useSupportedTokenInfo from '@/hooks/web3/useSupportedTokenInfo'

import AuthenticateButton from '@/components/atoms/AuthenticateButton'
import { PoolData } from '@/components/molecules/lending/overview/TranchesApyCard'

import { ModalsKeys } from '@/context/modal/modal.types'

import { SupportedTokens } from '@/constants/tokens'
import { getPoolData } from '@/utils'

interface PoolCardActionsProps {
  pool: PoolOverview
  link: string
  hover: boolean
}

const PoolCardActions: React.FC<PoolCardActionsProps> = ({
  pool,
  link,
  hover,
}) => {
  const { t } = useTranslation()
  const refBtnOverview = useRef(null)
  const { openModal } = useModalState()
  const { data: userPoolBalance } = useUserPoolBalance(pool?.id)

  const supportedToken = useSupportedTokenInfo()

  const poolData: PoolData = getPoolData(
    pool,
    formatUnits(
      userPoolBalance?.balance || '0',
      supportedToken?.[SupportedTokens.USDC].decimals
    )
  )

  const currentDevice = useDeviceDetection()

  const isMobile = currentDevice === Device.MOBILE

  const handleOpen = () =>
    openModal({
      name: ModalsKeys.EARNINGS_CALCULATOR,
      poolData,
      poolOverview: pool,
    })

  return (
    <Box display='flex' justifyContent='center' mt='auto' mb={{ sm: 2, xs: 1 }}>
      {!isMobile && (
        <AuthenticateButton
          variant='contained'
          sx={{ pl: 2.25, pr: 2.25 }}
          startIcon={<LoginIcon />}
          onClick={handleOpen}
        >
          {t('general.lend')}
        </AuthenticateButton>
      )}
      {isMobile ? (
        <Button
          ref={refBtnOverview}
          href={link}
          component={Link}
          fullWidth={isMobile}
          variant={isMobile ? 'outlined' : 'contained'}
          sx={(theme) => ({ mx: 1, ...theme.typography.h6 })}
        >
          {t('general.overview')}
        </Button>
      ) : (
        <Collapse in={hover} timeout={250} orientation='horizontal'>
          <Grow in={hover} timeout={500}>
            <Button
              ref={refBtnOverview}
              sx={{ ml: 1 }}
              href={link}
              component={Link}
              variant="contained"
              startIcon={<ArrowForwardIcon />}
            >
              {t('general.overview')}
            </Button>
          </Grow>
        </Collapse>
      )}
    </Box>
  )
}

export default PoolCardActions
