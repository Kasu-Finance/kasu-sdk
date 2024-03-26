import { Box, Typography } from '@mui/material'

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
        title='Amount invested'
        toolTipInfo='01'
        showDivider
        metric={<ContentWithSuffix content={amount} suffix='USDC' />}
      />

      <InfoRow
        title='Tranch APY'
        toolTipInfo='02'
        showDivider
        metric={<ContentWithSuffix content={apy + ' %'} />}
      />
      <InfoRow
        title='Yield Earned'
        toolTipInfo='03'
        metric={<ContentWithSuffix content={yieldEarned} suffix='USDC' />}
      />
    </Box>
  )
}

export default TranchInvestmentCard
