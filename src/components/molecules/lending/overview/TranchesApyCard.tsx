'use client'

import LoginIcon from '@mui/icons-material/Login'
import { Box, Grid } from '@mui/material'
import { useRef } from 'react'

import useModalState from '@/hooks/context/useModalState'
import useIsSticky from '@/hooks/useIsSticky'
import useTranslation from '@/hooks/useTranslation'

import KycButton from '@/components/atoms/KycButton'
import MetricWithSuffix from '@/components/atoms/MetricWithSuffix'

import { COLS } from '@/constants'

export type PoolData = {
  poolName: string
  lendingPoolId: `0x${string}`
  totalUserInvestment: string
  tranches: {
    content: string
    toolTip: string
    title: string
    trancheId: `0x${string}`
  }[]
}

const TranchesApyCard = () => {
  const divRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()

  const { openModal } = useModalState()

  const { isSticky } = useIsSticky({
    elementRef: divRef,
    threshold: 64,
  })

  const handleOpen = () =>
    openModal({ name: 'depositModal', poolData: POOL_DATA })

  const POOL_DATA: PoolData = {
    poolName: 'Apxium Invoice Standard Financing Pool',
    lendingPoolId: '0xd63541135Be7f482f0A337553E8E40a871019895',
    totalUserInvestment: '200000',
    tranches: [
      {
        content: '12.50 %',
        toolTip: '01',
        title: t('lending.tranche.senior'),
        trancheId: '0xe840a390756cb7c18b6102457f81803fb63635d9',
      },
      {
        content: '12.50 %',
        toolTip: '01',
        title: t('lending.tranche.mezzanine'),
        trancheId: '0x90adcd57397133c6ce6078dbc70143b7acbc2670',
      },
      {
        content: '2.4 %',
        toolTip: '01',
        title: t('lending.tranche.junior'),
        trancheId: '0xf73306c30023538d588cca69f347b136d52f374f',
      },
    ],
  }

  return (
    <Box
      ref={divRef}
      sx={{
        boxShadow: isSticky ? 12 : 0,
        position: isSticky ? 'sticky' : 'relative',
        top: isSticky ? 64 : 0,
        transform: `translate3d(0, 0px, 0)`,
        transformOrigin: '0% 0%',
        background: isSticky ? '#fff' : 'inherit',
        zIndex: 1200,
        transition: 'box-shadow .25s ease-in-out, top .05s ease',
        width: '1152px',
        backfaceVisibility: 'hidden',
        ml: 0,
        pt: 2,
        pl: 2,
        pr: 2,
      }}
    >
      <Box
        borderRadius={2}
        className='light-blue-background'
        sx={{
          flexGrow: 1,
          mt: 2,
          mb: 2,
        }}
      >
        <Grid
          container
          rowSpacing={1}
          m={0}
          columnSpacing={{ xs: 1, sm: 2, md: 3 }}
          maxWidth='lg'
        >
          {POOL_DATA.tranches.map((tranche, index) => {
            return (
              <Grid item xs={COLS / POOL_DATA.tranches.length} key={index}>
                <MetricWithSuffix
                  content={tranche.content}
                  tooltipKey={tranche.toolTip}
                  titleKey={`${tranche.title} APY`}
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
        <KycButton
          variant='contained'
          sx={{ pl: 2.25, pr: 2.25 }}
          startIcon={<LoginIcon />}
          onClick={handleOpen}
        >
          {t('general.deposit')}
        </KycButton>
      </Box>
    </Box>
  )
}

export default TranchesApyCard
