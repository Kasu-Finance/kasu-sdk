'use client'

import { Box, Typography } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

import ContentWithSuffix from '@/components/atoms/ContentWithSuffix'
import InfoRow from '@/components/atoms/InfoRow'

interface TranchDetailCardProps {
  title: string
  remainingAmount: { pct: string; value: string }
  minimumDepositAmount: string
  maxDepositAmount: string
}

const TranchDetailCard: React.FC<TranchDetailCardProps> = ({
  title,
  remainingAmount,
  minimumDepositAmount,
  maxDepositAmount,
}) => {
  const { t } = useTranslation()

  return (
    <Box
      className='light-colored-background'
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
        title={t('lending.poolOverview.trancheCard.remainingCapacity.label')}
        toolTipInfo={t(
          'lending.poolOverview.trancheCard.remainingCapacity.tooltip'
        )}
        showDivider
        metric={
          <div>
            <ContentWithSuffix
              textAlign='right'
              content={remainingAmount.pct + ' %'}
              variant='body1'
            />
            <Typography
              textAlign='right'
              sx={{ fontSize: '12px' }}
              variant='caption'
              component='h6'
            >
              {remainingAmount.value} USDC
            </Typography>
          </div>
        }
      />

      <InfoRow
        title='Minimum Deposit Amount'
        showDivider
        metric={
          <ContentWithSuffix
            textAlign='right'
            content={minimumDepositAmount}
            suffix='USDC'
            variant='body1'
          />
        }
      />
      <InfoRow
        title='Maximum Deposit Amount'
        metric={
          <ContentWithSuffix
            textAlign='right'
            content={maxDepositAmount}
            suffix='USDC'
            variant='body1'
          />
        }
      />
    </Box>
  )
}

export default TranchDetailCard
