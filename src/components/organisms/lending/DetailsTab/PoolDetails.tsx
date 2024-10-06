import { Divider, Grid, Typography } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import CustomCardHeader from '@/components/atoms/CustomCard/CustomCardHeader'
import CustomInnerCardContent from '@/components/atoms/CustomCard/CustomInnerCardContent'
import InfoRow from '@/components/atoms/InfoRow'

import { formatEpoch, formatPercentage, TimeConversions } from '@/utils'

import { PoolOverviewWithDelegate } from '@/types/page'

type PoolDetailsProps = {
  pool: PoolOverviewWithDelegate
}

const PoolDetails: React.FC<PoolDetailsProps> = ({ pool }) => {
  const { t } = useTranslation()

  const isMultiTranche = pool.tranches.length > 1

  return (
    <CustomCard>
      <CustomCardHeader title={t('details.poolDetails.title')} />
      <CustomInnerCardContent sx={{ py: 3 }}>
        <Grid container columnSpacing={4}>
          {pool.tranches.map((tranche) => (
            <Grid item flex={1} key={tranche.name}>
              <Typography variant='h5' textTransform='capitalize'>
                {isMultiTranche
                  ? `${tranche.name} ${t('general.tranche')}`
                  : t('general.lendingStrategy')}
              </Typography>
              <Divider sx={{ mt: 1.5 }} />
              <InfoRow
                title={t('general.variableApy')}
                titleStyle={{
                  variant: 'h5',
                }}
                metric={
                  <Typography variant='h5' color='gold.dark'>
                    {formatPercentage(tranche.apy).replaceAll(' ', '')}
                  </Typography>
                }
                showDivider
              />

              {tranche.fixedTermConfig.map(
                ({ epochLockDuration, apy, configId }) => {
                  const durationInMonths =
                    (parseFloat(epochLockDuration) *
                      TimeConversions.DAYS_PER_WEEK) /
                    TimeConversions.DAYS_PER_MONTH

                  return (
                    <InfoRow
                      key={configId}
                      title={`${t('general.fixedApy')}, ~ ${formatEpoch(durationInMonths)}`}
                      titleStyle={{
                        variant: 'h5',
                      }}
                      metric={
                        <Typography variant='h5' color='gold.dark'>
                          {formatPercentage(apy).replaceAll(' ', '')}
                        </Typography>
                      }
                      showDivider
                    />
                  )
                }
              )}
            </Grid>
          ))}
        </Grid>
        <Grid container columnSpacing={4} mt={4}>
          <Grid item xs={6}>
            <InfoRow
              title={t('details.poolDetails.structureApy.label')}
              toolTipInfo={t('details.poolDetails.structureApy.tooltip')}
              metric={
                <Typography variant='baseMdBold'>
                  {pool.poolApyStructure}
                </Typography>
              }
              showDivider
            />
          </Grid>
          <Grid item xs={6}>
            <InfoRow
              title={t('details.poolDetails.exposureIndustry.label')}
              toolTipInfo={t('details.poolDetails.exposureIndustry.tooltip')}
              metric={
                <Typography variant='baseMdBold'>
                  {pool.industryExposure}
                </Typography>
              }
              showDivider
            />
          </Grid>
          <Grid item xs={6}>
            <InfoRow
              title={t('details.poolDetails.term.label')}
              toolTipInfo={t('details.poolDetails.term.tooltip')}
              metric={
                <Typography variant='baseMdBold'>
                  {pool.poolInvestmentTerm}
                </Typography>
              }
              showDivider
            />
          </Grid>
          <Grid item xs={6}>
            <InfoRow
              title={t('details.poolDetails.loan.label')}
              toolTipInfo={t('details.poolDetails.loan.tooltip-1')}
              metric={
                <Typography variant='baseMdBold'>
                  {pool.loanStructure}
                </Typography>
              }
              showDivider
            />
          </Grid>
        </Grid>
      </CustomInnerCardContent>
    </CustomCard>
  )
}

export default PoolDetails
