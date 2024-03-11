'use client'

import { Box, Button, Divider, Grid, Typography } from '@mui/material'
import { useRef } from 'react'

import useIsSticky from '@/hooks/useIsSticky'

import InfoTooltip from '@/components/atoms/InfoTooltip'

const TranchesApyCard = () => {
  const divRef = useRef<HTMLDivElement>(null)

  const { isSticky } = useIsSticky({
    elementRef: divRef,
    threshold: 64,
  })

  return (
    <Box
      ref={divRef}
      sx={{
        pt: 2,
        boxShadow: isSticky ? 12 : 0,
        position: isSticky ? 'sticky' : 'relative',
        top: isSticky ? 64 : 0,
        background: isSticky ? '#fff' : 'inherit',
        zIndex: 1200,
        transition: 'all .25s ease-in-out',
        width: isSticky ? 'calc(100% + 32px)' : '100%',
        ml: isSticky ? -2 : 0,
        pl: isSticky ? 2 : 0,
        pr: isSticky ? 2 : 0,
      }}
    >
      <Box
        sx={{
          flexGrow: 1,
          mt: 2,
          mb: 2,
          background: '#1976D20A',
          borderRadius: '8px',
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
            <Box>
              <Typography variant='subtitle2' sx={{ pl: 2, pb: 1 }}>
                Senior Tranche APY <InfoTooltip title='test' />
              </Typography>
              <Divider />
              <Typography variant='h5' sx={{ pl: 2, pb: 1, pt: 0.5 }}>
                12.50 %
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box>
              <Typography variant='subtitle2' sx={{ pl: 2, pb: 1 }}>
                Mezzanine Tranche <InfoTooltip title='test' />
              </Typography>
              <Divider />
              <Typography variant='h5' sx={{ pl: 2, pb: 1, pt: 0.5 }}>
                5.50 %
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box>
              <Typography variant='subtitle2' sx={{ pl: 2, pb: 1 }}>
                Junior Tranche <InfoTooltip title='test' />
              </Typography>
              <Divider />
              <Typography variant='h5' sx={{ pl: 2, pb: 1, pt: 0.5 }}>
                2.4 %
              </Typography>
            </Box>
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
