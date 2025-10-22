import { Grid, Typography } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import CustomCardHeader from '@/components/atoms/CustomCard/CustomCardHeader'
import CustomInnerCardContent from '@/components/atoms/CustomCard/CustomInnerCardContent'
import DottedDivider from '@/components/atoms/DottedDivider'
import InfoColumn from '@/components/atoms/InfoColumn'
import NextLink from '@/components/atoms/NextLink'
import UnorderedList from '@/components/atoms/UnorderedList'
import WaveCard from '@/components/molecules/WaveCard'

import { Routes } from '@/config/routes'
import { formatAmount, formatPercentage } from '@/utils'
import formatDuration from '@/utils/formats/formatDuration'

import { PoolOverviewWithDelegate } from '@/types/page'

type DelegateProfileProps = {
  pool: PoolOverviewWithDelegate
}

const DelegateProfile: React.FC<DelegateProfileProps> = ({ pool }) => {
  const { t } = getTranslation()

  const filteredPools = pool.delegate.otherKASUPools.filter(
    (otherPool) => otherPool.id !== pool.id && otherPool.isActive
  )

  return (
    <CustomCard>
      <CustomCardHeader title={t('details.poolDelegate.title')} />
      <CustomInnerCardContent sx={{ py: 3 }}>
        <Grid container spacing={4}>
          <Grid item xs={3}>
            <WaveCard
              title={t('details.poolDelegate.history.label')}
              toolTipInfo={t('details.poolDelegate.history.tooltip')}
              content={formatDuration(pool.delegate.delegateLendingHistory, {
                years: true,
                months: true,
                days: true,
              })}
              unit=''
            />
          </Grid>
          <Grid item xs={3}>
            <WaveCard
              title={t('details.poolDelegate.totalFunds.label')}
              toolTipInfo={t('details.poolDelegate.totalFunds.tooltip')}
              content={formatAmount(pool.delegate.totalLoanFundsOriginated)}
              unit='USDC'
            />
          </Grid>
          <Grid item xs={3}>
            <WaveCard
              title={t('details.poolDelegate.loans.label')}
              toolTipInfo={t('details.poolDelegate.loans.tooltip')}
              content={formatAmount(pool.delegate.loansUnderManagement)}
              unit='USDC'
            />
          </Grid>
          <Grid item xs={3}>
            <WaveCard
              title={t('details.poolDelegate.loss.label')}
              toolTipInfo={t('details.poolDelegate.loss.tooltip')}
              content={formatPercentage(pool.delegate.historicLossRate)}
              unit='%'
            />
          </Grid>
        </Grid>
        <Grid container columnSpacing={4} mt={7}>
          <Grid item xs={6}>
            <InfoColumn
              title={t('details.poolDelegate.assetClass.label')}
              toolTipInfo={t('details.poolDelegate.assetClass.tooltip')}
              metric={
                <Typography variant='baseMdBold'>
                  {pool.delegate.assetClasses}
                </Typography>
              }
              containerSx={{ mb: 1.5 }}
            />
          </Grid>
          <Grid item xs={6}>
            <InfoColumn
              title={t('details.poolDelegate.otherPools.label')}
              toolTipInfo={t('details.poolDelegate.otherPools.tooltip')}
              metric={
                filteredPools.length ? (
                  <UnorderedList sx={{ fontSize: 12, pl: 2 }}>
                    {filteredPools.map((otherPool) => (
                      <li key={otherPool.name}>
                        <NextLink
                          href={`${Routes.lending.root.url}/${otherPool.id}`}
                          display='block'
                          fontWeight={600}
                        >
                          {otherPool.name}
                        </NextLink>
                      </li>
                    ))}
                  </UnorderedList>
                ) : (
                  <Typography variant='baseMdBold'>N/A</Typography>
                )
              }
            />
          </Grid>
          <Grid item xs={6}>
            <DottedDivider />
          </Grid>
          <Grid item xs={6}>
            <DottedDivider />
          </Grid>
          {/* <Grid item xs={6}>
            <InfoRow
              title={t('details.poolDelegate.totalLoans.label')}
              toolTipInfo={t('details.poolDelegate.totalLoans.tooltip')}
              metric={
                <Typography variant='baseMdBold'>
                  {formatAmount(pool.delegate.totalLoansOriginated)}
                </Typography>
              }
              showDivider
            />
          </Grid> */}
          {/* <Grid item xs={6}>
            <InfoRow
              title={t('details.poolDelegate.loss.label')}
              toolTipInfo={t('details.poolDelegate.loss.tooltip')}
              metric={
                <Typography variant='baseMdBold'>
                  {formatPercentage(pool.delegate.historicLossRate)}
                </Typography>
              }
              showDivider
            />
          </Grid> */}
        </Grid>
      </CustomInnerCardContent>
    </CustomCard>
  )
}

export default DelegateProfile
