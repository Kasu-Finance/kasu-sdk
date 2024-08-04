import { Box, Grid, Typography } from '@mui/material'
import { ReactNode } from 'react'

import ColoredBox from '@/components/atoms/ColoredBox'
import InfoRow from '@/components/atoms/InfoRow'

type RewardsBreakdownCardProps = {
  title: string
  subtitle?: string
  breakdowns: {
    title: string
    toolTipInfo: string | ReactNode
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
      <ColoredBox
        sx={(theme) => ({
          p: 0,
          [theme.breakpoints.down('sm')]: {
            p: 1,
          },
        })}
      >
        <Typography
          variant='subtitle1'
          component='span'
          display='block'
          px={{ xs: 0, sm: 2 }}
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
        <Box mt={{ xs: 0, sm: 1 }}>
          {breakdowns.map(({ title, toolTipInfo, metric }, index) => (
            <InfoRow
              key={index}
              title={title}
              titleStyle={{ fontSize: { xs: 12, sm: 14 } }}
              sx={(theme) => ({ [theme.breakpoints.down('sm')]: { px: 0 } })}
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
