import { Box, Grid, Typography } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import CustomCardHeader from '@/components/atoms/CustomCard/CustomCardHeader'
import CustomInnerCardContent from '@/components/atoms/CustomCard/CustomInnerCardContent'
import InfoColumn from '@/components/atoms/InfoColumn'
import TokenAmount from '@/components/atoms/TokenAmount'
import WaveBox from '@/components/atoms/WaveBox'
import WaveCard from '@/components/molecules/WaveCard'

import { formatAmount, formatPercentage } from '@/utils'

import { PoolOverviewWithDelegate } from '@/types/page'

type PoolTractionProps = {
  pool: PoolOverviewWithDelegate
}

const PoolTraction: React.FC<PoolTractionProps> = ({ pool }) => {
  const { t } = getTranslation()

  return (
    <CustomCard>
      <CustomCardHeader title={t('details.poolTraction.title')} />
      <CustomInnerCardContent sx={{ py: 3 }}>
        <Grid container spacing={4}>
          <Grid item flex={1}>
            <WaveCard
              title={t('details.poolTraction.valueLocked.label')}
              toolTipInfo={t('details.poolTraction.valueLocked.tooltip')}
              content={formatAmount(pool.totalValueLocked.total, {
                minValue: 1_000_000,
              })}
              unit='USDC'
            />
          </Grid>
          <Grid item flex={1}>
            <WaveCard
              title={t('details.poolTraction.management.label')}
              toolTipInfo={t('details.poolTraction.management.tooltip')}
              content={formatAmount(pool.loansUnderManagement, {
                minValue: 1_000_000,
              })}
              unit='USDC'
            />
          </Grid>
          <Grid item flex={1}>
            <WaveCard
              title={t('details.poolTraction.yield.label')}
              toolTipInfo={t('details.poolTraction.yield.tooltip')}
              content={formatAmount(pool.yieldEarned, {
                minValue: 1_000_000,
              })}
              unit='USDC'
            />
          </Grid>
          <Grid item flex={1}>
            <WaveCard
              title={t('details.poolDelegate.totalLossRate.label')}
              toolTipInfo={t('details.poolDelegate.totalLossRate.tooltip')}
              content={formatPercentage(pool.delegate.historicLossRate)}
              unit=''
            />
          </Grid>
          <Grid item flex={1}>
            <WaveBox borderRadius={2} py={4} px={2}>
              <InfoColumn
                title={t('details.poolTraction.capacity.label')}
                toolTipInfo={t('details.poolTraction.capacity.tooltip')}
                metric={
                  <Box display='flex' alignItems='end' flexWrap='wrap'>
                    <TokenAmount
                      mt={0.5}
                      amount={formatPercentage(
                        pool.poolCapacityPercentage
                      ).replaceAll(' %', '')}
                      symbol='%'
                      whiteSpace='nowrap'
                      mr='1ch'
                    />
                    <Typography variant='baseMd' color='gray.middle'>
                      (
                      {formatAmount(pool.poolCapacity, { minValue: 1_000_000 })}{' '}
                      USDC)
                    </Typography>
                  </Box>
                }
              />
            </WaveBox>
          </Grid>
        </Grid>
      </CustomInnerCardContent>
    </CustomCard>
  )
}

export default PoolTraction
