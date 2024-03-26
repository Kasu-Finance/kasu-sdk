'use client'

import LoginIcon from '@mui/icons-material/Login'
import { Box, Button, Grid } from '@mui/material'
import { useRef } from 'react'

import useIsSticky from '@/hooks/useIsSticky'
import useTranslation from '@/hooks/useTranslation'

import MetricWithSuffix from '@/components/atoms/MetricWithSuffix'

import { COLS } from '@/constants'

const TranchesApyCard = () => {
  const divRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()

  const tranches = [
    {
      content: '12.50 %',
      tooltip: '01',
      title: t('lending.tranche.senior'),
    },
    {
      content: '12.50 %',
      tooltip: '01',
      title: t('lending.tranche.mezzanine'),
    },
    {
      content: '2.4 %',
      tooltip: '01',
      title: t('lending.tranche.junior'),
    },
  ]

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
          {tranches.length > 0 &&
            tranches.map((tranche, index) => {
              return (
                <Grid item xs={COLS / tranches.length} key={index}>
                  <MetricWithSuffix
                    content={tranche.content}
                    tooltipKey={tranche.tooltip}
                    titleKey={t(tranche.title)}
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
        <Button
          variant='contained'
          sx={{ pl: 2.25, pr: 2.25 }}
          startIcon={<LoginIcon />}
        >
          {t('general.deposit')}
        </Button>
      </Box>
    </Box>
  )
}

export default TranchesApyCard
