'use client'

import LoginIcon from '@mui/icons-material/Login'
import { Box, Typography } from '@mui/material'
import { useRef } from 'react'

import useModalState from '@/hooks/context/useModalState'
import useIsSticky from '@/hooks/useIsSticky'
import useTranslation from '@/hooks/useTranslation'

export type PoolData = {
  poolName: string
  lendingPoolId: `0x${string}`
  totalUserInvestment: string
  tranches: {
    toolTip: string
    title: string
    trancheId: `0x${string}`
    minimumDeposit: string
    maximumDeposit: string
  }[]
}

import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'
import { formatUnits } from 'ethers/lib/utils'

import useUserPoolBalance from '@/hooks/lending/useUserPoolBalance'
import useDeviceDetection, { Device } from '@/hooks/useDeviceDetections'
import useSupportedTokenInfo from '@/hooks/web3/useSupportedTokenInfo'

import AuthenticateButton from '@/components/atoms/AuthenticateButton'
import ColoredBox from '@/components/atoms/ColoredBox'
import InfoColumn from '@/components/atoms/InfoColumn'

import { ModalsKeys } from '@/context/modal/modal.types'

import { SupportedTokens } from '@/constants/tokens'
import { formatPercentage, getPoolData, sortTranches } from '@/utils'

const TranchesApyCard: React.FC<{ pool: PoolOverview }> = ({ pool }) => {
  const divRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()
  const { openModal } = useModalState()
  const { data: userPoolBalance } = useUserPoolBalance(pool?.id)
  const sortedTranches = sortTranches(pool.tranches)

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

  const { isSticky } = useIsSticky({
    elementRef: divRef,
    threshold: 64,
  })

  const handleOpen = () =>
    openModal({
      name: ModalsKeys.EARNINGS_CALCULATOR,
      poolData,
      poolOverview: pool,
    })

  const tranches = sortedTranches.map((item) => {
    const key = item.name.toLowerCase()

    return {
      ...item,
      tooltip: t(`lending.tranche.${key}.tooltip`),
    }
  })

  const isStickyAndNotMobile = isSticky && !isMobile

  return (
    <Box
      ref={divRef}
      sx={{
        boxShadow: isStickyAndNotMobile ? 12 : 0,
        position: isStickyAndNotMobile ? 'fixed' : 'relative',
        top: isStickyAndNotMobile ? 64 : 0,
        transform: `translate3d(-50%, 0, 0)`,
        transformOrigin: '0% 0%',
        background: '#fff',
        zIndex: 1200,
        transition: 'box-shadow .25s ease-in-out, top .8s ease',
        width: isStickyAndNotMobile ? '100%' : 'auto',
        maxWidth: '1150px',
        backfaceVisibility: 'hidden',
        willChange: 'top, scroll-position',
        ml: 0,
        pt: 2,
        px: isMobile ? 1 : 2,
        left: '50%',
      }}
    >
      <ColoredBox p={{ xs: 1, sm: 0 }}>
        <Box
          display='grid'
          rowGap={1}
          columnGap={{ xs: 2, sm: 3 }}
          gridTemplateColumns={`repeat(${tranches.length}, minmax(0, 1fr))`}
        >
          {tranches.map((tranche, index) => {
            const titleKey =
              tranches.length === 1
                ? t('general.apy')
                : t(`lending.tranche.${tranche.name.toLowerCase()}.title`)

            const toolTipKey =
              tranches.length === 1
                ? t('lending.poolOverview.investmentCard.tooltip')
                : tranche.tooltip

            return (
              <InfoColumn
                title={titleKey}
                titleStyle={{
                  display: 'block',
                  maxWidth: { xs: 80, sm: 'unset' },
                  fontSize: { xs: 12, sm: 14 },
                }}
                key={index}
                titleContainerSx={(theme) => ({
                  [theme.breakpoints.down('sm')]: {
                    px: 0,
                  },
                })}
                toolTipInfo={toolTipKey}
                showDivider
                metric={
                  <Typography
                    variant='h5'
                    display='block'
                    px={{ xs: 0, sm: 2 }}
                    py={{ xs: 0, sm: '6px' }}
                  >
                    {formatPercentage(tranche.apy || '0')}
                  </Typography>
                }
              />
            )
          })}
        </Box>
      </ColoredBox>
      {!isMobile && (
        <Box
          display='flex'
          justifyContent='center'
          width='100%'
          sx={{
            pt: 0,
            pl: 0,
            pr: 0,
            pb: 2,
          }}
        >
          <AuthenticateButton
            variant='contained'
            sx={{ pl: 2.25, pr: 2.25 }}
            startIcon={<LoginIcon />}
            onClick={handleOpen}
          >
            {t('general.lend')}
          </AuthenticateButton>
        </Box>
      )}
    </Box>
  )
}

export default TranchesApyCard
