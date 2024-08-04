import { Typography } from '@mui/material'

import ColoredBox from '@/components/atoms/ColoredBox'
import InfoRow from '@/components/atoms/InfoRow'

interface MetricItemProps {
  metric: any
  t: (key: string) => string
}

const PoolCardMetricItem: React.FC<MetricItemProps> = ({ metric, t }) => {
  return (
    <ColoredBox
      key={metric.id}
      display='flex'
      flexDirection='column'
      className={metric.id}
      sx={{
        width: '100%',
        ...metric.sx,
      }}
    >
      <InfoRow
        title={t(`${metric.title}.label`)}
        toolTipInfo={t(`${metric.title}.tooltip`)}
        showDivider={metric.showDivider}
        titleStyle={{ fontSize: { xs: 12, sm: 14 } }}
        metric={
          <>
            <Typography
              variant='subtitle2'
              fontWeight={{ xs: 400, sm: 500 }}
              maxWidth={{ xs: 120, sm: 160 }}
            >
              {metric.value}
              <Typography variant='caption' component='span'>
                {metric.suffix || ''}
              </Typography>
            </Typography>
          </>
        }
      />
    </ColoredBox>
  )
}

export default PoolCardMetricItem
