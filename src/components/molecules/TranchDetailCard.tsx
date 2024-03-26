import { Box, Typography } from '@mui/material'

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
        title='Remaining capacity'
        toolTipInfo='01'
        showDivider
        metric={
          <div>
            <ContentWithSuffix
              textAlign='right'
              content={remainingAmount.pct + ' %'}
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
        toolTipInfo='02'
        showDivider
        metric={<ContentWithSuffix content={minimumDepositAmount} />}
      />
      <InfoRow
        title='Maximum Deposit Amount'
        toolTipInfo='03'
        metric={<ContentWithSuffix content={maxDepositAmount} suffix='USDC' />}
      />
    </Box>
  )
}

export default TranchDetailCard
