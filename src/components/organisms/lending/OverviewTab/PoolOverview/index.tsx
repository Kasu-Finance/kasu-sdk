import { Box, Grid, Typography } from '@mui/material'
import React from 'react'

import getTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import CustomCardHeader from '@/components/atoms/CustomCard/CustomCardHeader'
import CustomInnerCardContent from '@/components/atoms/CustomCard/CustomInnerCardContent'
import LendButton from '@/components/atoms/LendButton'
import WaveBox from '@/components/atoms/WaveBox'
import DelegateOverview from '@/components/organisms/lending/OverviewTab/PoolOverview/DelegateOverview'
import LoanOverview from '@/components/organisms/lending/OverviewTab/PoolOverview/LoanOverview'
import Summary from '@/components/organisms/lending/OverviewTab/PoolOverview/Summary'

import { PoolOverviewWithDelegate } from '@/types/page'

type PoolOverviewProps = {
  pool: PoolOverviewWithDelegate
  currentEpoch: string
}

const PoolOverview: React.FC<PoolOverviewProps> = ({ pool, currentEpoch }) => {
  const { t } = getTranslation()

  const isMultiTranche = pool.tranches.length > 1

  return (
    <CustomCard>
      <CustomCardHeader title={t('lending.poolOverview.title')} />
      <WaveBox borderRadius={2}>
        <Box px={2} py={4}>
          <Typography variant='baseMd' whiteSpace='pre-wrap'>
            {pool.description}
          </Typography>
        </Box>
        <CustomInnerCardContent sx={{ paddingY: 3 }}>
          <Grid container spacing={4} columns={isMultiTranche ? 6 : 12}>
            <Grid item sm={6}>
              <Summary pool={pool} />
            </Grid>
            <Grid item sm={6}>
              <LoanOverview pool={pool} />
            </Grid>
          </Grid>
          <DelegateOverview pool={pool} />
          <Box width={368} display='flex' mt={4} mx='auto'>
            <LendButton pool={pool} currentEpoch={currentEpoch} />
          </Box>
        </CustomInnerCardContent>
      </WaveBox>
    </CustomCard>
  )
}

export default PoolOverview
