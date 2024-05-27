'use client'

import LoginIcon from '@mui/icons-material/Login'
import { Box, Grid } from '@mui/material'
import { useRef } from 'react'

import useModalState from '@/hooks/context/useModalState'
import useIsSticky from '@/hooks/useIsSticky'
import useTranslation from '@/hooks/useTranslation'

import MetricWithSuffix from '@/components/atoms/MetricWithSuffix'

import { COLS } from '@/constants'

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

import { ModalsKeys } from '@/context/modal/modal.types'

import { SupportedTokens } from '@/constants/tokens'
import { formatAmount, getPoolData, sortTranches } from '@/utils'

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
      tooltip: `lending.tranche.${key}.tooltip`,
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
        transform: `translate3d(0, 0, 0)`,
        transformOrigin: '0% 0%',
        background: '#fff',
        zIndex: 1200,
        transition: 'box-shadow .25s ease-in-out, top .8s ease',
        width: isStickyAndNotMobile ? '100%' : 'auto',
        maxWidth: '1152px',
        backfaceVisibility: 'hidden',
        willChange: 'top, scroll-position',
        ml: 0,
        pt: 2,
        pl: 2,
        pr: 2,
      }}
    >
      <Box
        borderRadius={2}
        className='light-colored-background'
        sx={{
          flexGrow: 1,
          mb: 2,
          pb: 0.5,
        }}
      >
        <Grid
          container
          rowSpacing={1}
          m={0}
          columnSpacing={{ xs: 1, sm: 2, md: 3 }}
          maxWidth='lg'
          direction={isMobile ? 'column' : 'row'}
        >
          {tranches.map((tranche, index) => {
            const titleKey =
              tranches.length === 1 ? 'APY' : `${tranche.name} Tranche APY`

            return (
              <Grid item xs={COLS / pool.tranches.length} key={index}>
                <MetricWithSuffix
                  content={formatAmount(+tranche.apy * 100 || '0') + ' %'}
                  tooltipKey={tranche.tooltip}
                  titleKey={titleKey}
                  variant='h5'
                />
              </Grid>
            )
          })}
        </Grid>
      </Box>{' '}
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
          {t('general.deposit')}
        </AuthenticateButton>
      </Box>
    </Box>
  )
}

export default TranchesApyCard
