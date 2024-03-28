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
    lendingPoolId: '0x1e870492b6abcf7efca6c8ff10ae6426b5fb51a5',
    totalUserInvestment: '200000',
    tranches: [
      {
        content: '12.50 %',
        toolTip: '01',
        title: t('lending.tranche.senior'),
        trancheId: '0x3b7264cc166c0d88cae8acf0668e260c11d58f04',
      },
      {
        content: '12.50 %',
        toolTip: '01',
        title: t('lending.tranche.mezzanine'),
        trancheId: '0x08a0a6c2ba4452b40cf657cd32f00d601a1f609e',
      },
      {
        content: '2.4 %',
        toolTip: '01',
        title: t('lending.tranche.junior'),
        trancheId: '0x832e347083ed6283ae325e5dd8f67032a5cb7644',
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
