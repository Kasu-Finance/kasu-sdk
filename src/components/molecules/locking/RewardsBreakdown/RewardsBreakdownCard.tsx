import { Box, Grid, Typography } from '@mui/material'

import ColoredBox from '@/components/atoms/ColoredBox'
import InfoRow from '@/components/atoms/InfoRow'

type RewardsBreakdownCardProps = {
  title: string
  subtitle?: string
  breakdowns: {
    title: string
    toolTipInfo: string
    metric: [string, string?]
  }[]
}

const RewardsBreakdownCard: React.FC<RewardsBreakdownCardProps> = ({
  title,
  subtitle,
  breakdowns,
}) => {
  return (
    <Grid item xs={4}>
      <ColoredBox sx={{ p: 0 }}>
        <Typography
          variant='subtitle1'
          component='span'
          display='block'
          px={2}
          py={1}
        >
          {title}
          {subtitle && (
            <Typography variant='caption' component='span'>
              {' '}
              {subtitle}
            </Typography>
          )}
        </Typography>
        <Box mt={1}>
          {breakdowns.map(({ title, toolTipInfo, metric }, index) => (
            <InfoRow
              key={index}
              title={title}
              toolTipInfo={toolTipInfo}
              metric={
                <Box>
                  <Typography variant='h6' component='span'>
                    {metric[0]}
                  </Typography>
                  {metric[1] && (
                    <Typography variant='body1' component='span'>
                      {' '}
                      {metric[1]}
                    </Typography>
                  )}
                </Box>
              }
              showDivider={index !== breakdowns.length - 1}
            />
          ))}
        </Box>
      </ColoredBox>
    </Grid>
  )
}

export default RewardsBreakdownCard
