'use client'

import { Box, Button, Grid } from '@mui/material'
import { useRef } from 'react'

import useIsSticky from '@/hooks/useIsSticky'
import useTranslation from '@/hooks/useTranslation'

import MetricWithSuffix from '@/components/atoms/MetricWithSuffix'

const TranchesApyCard = () => {
  const divRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()

  const { isSticky } = useIsSticky({
    elementRef: divRef,
    threshold: 64,
  })

  return (
    <Box
      ref={divRef}
      sx={{
        boxShadow: isSticky ? 12 : 0,
        position: isSticky ? 'sticky' : 'relative',
        top: isSticky ? 64 : 0,
        background: isSticky ? '#fff' : 'inherit',
        zIndex: 1200,
        transition: 'all .25s ease-in-out',
        width: '100%',
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
          width='100%'
          m={0}
          columnSpacing={{ xs: 1, sm: 2, md: 3 }}
        >
          <Grid item xs={4}>
            <MetricWithSuffix
              content='12.50 %'
              tooltipKey='01'
              titleKey={t('lending.tranche.senior')}
            />
          </Grid>
          <Grid item xs={4}>
            <MetricWithSuffix
              content='5.50 %'
              tooltipKey='01'
              titleKey={t('lending.tranche.mezzanine')}
            />
          </Grid>
          <Grid item xs={4}>
            <MetricWithSuffix
              content=' 2.4 %'
              tooltipKey='01'
              titleKey={t('lending.tranche.junior')}
            />
          </Grid>
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
        <Button variant='contained'>Deposit</Button>
      </Box>
    </Box>
  )
}

export default TranchesApyCard
