import { Box, Divider, Grid, Typography } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import InfoRow from '@/components/atoms/InfoRow'
import ToolTip from '@/components/atoms/ToolTip'
import TermsAndStructureTooltip from '@/components/molecules/tooltips/TermsAndStructureTooltip'

import { formatAmount } from '@/utils'
import formatDuration from '@/utils/formats/formatDuration'

import { PoolOverviewWithDelegate } from '@/types/page'

type DelegateOverviewProps = {
  pool: PoolOverviewWithDelegate
}

const DelegateOverview: React.FC<DelegateOverviewProps> = ({ pool }) => {
  const { t } = getTranslation()

  return (
    <Box mt={6}>
      <Typography variant='h5'>
        {t('lending.poolOverview.subtitle-2')}
      </Typography>
      <Grid container spacing={4}>
        <Grid item sm={6}>
          <Divider sx={{ mt: 1.5 }} />
          <InfoRow
            title={t('details.poolDelegate.totalFunds.label')}
            titleStyle={{ variant: 'baseMd', color: 'gray.extraDark' }}
            toolTipInfo={t('details.poolDelegate.totalFunds.tooltip')}
            showDivider
            metric={
              <Typography variant='baseMdBold'>
                {formatAmount(pool.delegate.totalLoanFundsOriginated || '0', {
                  minValue: 1_000_000,
                })}{' '}
                USDC
              </Typography>
            }
          />
          <InfoRow
            title={t('details.poolDelegate.history.label')}
            titleStyle={{ variant: 'baseMd', color: 'gray.extraDark' }}
            toolTipInfo={t('details.poolDelegate.history.tooltip')}
            showDivider
            metric={
              <Typography variant='baseMdBold'>
                {formatDuration(pool.delegate.delegateLendingHistory, {
                  years: true,
                  months: true,
                })}
              </Typography>
            }
          />
          <InfoRow
            title={t('details.poolDetails.assetClass.label')}
            titleStyle={{ variant: 'baseMd', color: 'gray.extraDark' }}
            toolTipInfo={t('details.poolDetails.assetClass.tooltip')}
            showDivider
            metric={
              <Typography variant='baseMdBold'>{pool.assetClass}</Typography>
            }
            sx={{
              flexDirection: 'column',
            }}
          />
        </Grid>
        <Grid item sm={6}>
          <Divider sx={{ mt: 1.5 }} />
          <InfoRow
            title={t('lending.poolOverview.detailCard.terms.label')}
            titleStyle={{ variant: 'baseMd', color: 'gray.extraDark' }}
            toolTipInfo={<ToolTip title={<TermsAndStructureTooltip />} />}
            showDivider
            metric={
              <Typography variant='baseMdBold'>
                {pool.poolInvestmentTerm}
              </Typography>
            }
          />
          <InfoRow
            title={t('lending.poolOverview.detailCard.apyStructure.label')}
            titleStyle={{ variant: 'baseMd', color: 'gray.extraDark' }}
            toolTipInfo={
              <ToolTip
                title={
                  <Typography variant='inherit'>
                    {t(
                      'lending.poolOverview.detailCard.apyStructure.tooltip-1'
                    )}
                    <br />
                    <br />
                    {t(
                      'lending.poolOverview.detailCard.apyStructure.tooltip-2'
                    )}
                  </Typography>
                }
              />
            }
            showDivider
            metric={
              <Typography variant='baseMdBold'>
                {pool.poolApyStructure}
              </Typography>
            }
          />
          <InfoRow
            title={t('lending.poolOverview.detailCard.industry.label')}
            titleStyle={{ variant: 'baseMd', color: 'gray.extraDark' }}
            toolTipInfo={t('lending.poolOverview.detailCard.industry.tooltip')}
            showDivider
            metric={
              <Typography variant='baseMdBold' maxWidth={350}>
                {pool.industryExposure}
              </Typography>
            }
            sx={{
              flexDirection: 'column',
            }}
          />
        </Grid>
      </Grid>
    </Box>
  )
}

export default DelegateOverview
