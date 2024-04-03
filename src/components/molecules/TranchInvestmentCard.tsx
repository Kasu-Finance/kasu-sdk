'use client'

import { Box, Typography } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

import ContentWithSuffix from '@/components/atoms/ContentWithSuffix'
import InfoRow from '@/components/atoms/InfoRow'

interface InvestmentCardProps {
  title: string
  amount: string
  apy: string
  yieldEarned: string
}

const TranchInvestmentCard: React.FC<InvestmentCardProps> = ({
  title,
  amount,
  apy,
  yieldEarned,
}) => {
  const { t } = useTranslation()

  return (
    <Box
      className='light-blue-background'
      sx={{ minWidth: 275, margin: 0, p: 0, borderRadius: '8px' }}
    >
      <Typography
        sx={{ pl: 2, pt: 2, pb: 1 }}
        variant='subtitle1'
        component='h6'
      >
        {title}
      </Typography>
      <InfoRow
        title={t('lending.poolOverview.investmentCard.amountInvested.label')}
        toolTipInfo={t(
          'lending.poolOverview.investmentCard.amountInvested.tooltip'
        )}
        showDivider
        metric={<ContentWithSuffix content={amount} suffix='USDC' />}
      />

      <InfoRow
        title={t('lending.poolOverview.investmentCard.trancheApy.label')}
        toolTipInfo={t(
          'lending.poolOverview.investmentCard.trancheApy.tooltip'
        )}
        showDivider
        metric={<ContentWithSuffix content={apy + ' %'} />}
      />
      <InfoRow
        title={t('lending.poolOverview.investmentCard.yieldEarned.label')}
        toolTipInfo={t(
          'lending.poolOverview.investmentCard.yieldEarned.tooltip'
        )}
        metric={<ContentWithSuffix content={yieldEarned} suffix='USDC' />}
      />
    </Box>
  )
}

export default TranchInvestmentCard
