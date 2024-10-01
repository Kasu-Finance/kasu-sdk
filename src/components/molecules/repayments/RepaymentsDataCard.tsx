import { Box, BoxProps, Typography } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

import ColoredBox from '@/components/atoms/ColoredBox'
import ContentWithSuffix from '@/components/atoms/ContentWithSuffix'
import InfoColumn from '@/components/atoms/InfoColumn'
import InfoRow from '@/components/atoms/InfoRow'
import TokenAmount from '@/components/atoms/TokenAmount'
import useDeviceDetection, { Device } from '@/hooks/useDeviceDetections'
import { formatAmount } from '@/utils'

type RepaymentsDataCardProps = BoxProps & {
  title: string
  subtitle: string
  data: {
    tooltip: string
    name: string
    value: number
  }[]
  unit: string
}

const RepaymentsDataCard: React.FC<RepaymentsDataCardProps> = ({
  title,
  subtitle,
  data,
  unit,
  ...rest
}) => {
  const { t } = useTranslation()

  const currentDevice = useDeviceDetection()
  const isMobile = currentDevice === Device.MOBILE

  return (
    <Box sx={{ width: '100%' }} {...rest}>
      <Typography variant='subtitle1'>{title}</Typography>
      <Typography variant='caption' sx={{ mb: 2 }} component='p'>
        {subtitle}
      </Typography>
      {data.map(({ name, value, tooltip }, index) =>
        index === 0 ? (
          <ColoredBox key={name} p={{ xs: 1, sm: 0 }}>
            <InfoColumn
              title={name}
              toolTipInfo={tooltip}
              showDivider
              titleContainerSx={(theme) => ({
                [theme.breakpoints.down('sm')]: {
                  px: 0,
                },
              })}
              titleStyle={{ fontSize: { xs: 10, sm: 14 } }}
              metric={
                <TokenAmount
                  amount={formatAmount(value, { minDecimals: 2 })}
                  symbol={unit}
                  px={{ xs: 0, sm: 2 }}
                  py='6px'
                />
              }
            />
          </ColoredBox>
        ) : (
          <InfoRow
            key={name}
            title={name}
            toolTipInfo={tooltip}
            titleStyle={{
              variant: isMobile ? 'body1' : 'h6',
              fontSize: { xs: 10, sm: 14 },
            }}
            sx={(theme) => ({
              flexDirection: 'row',
              [theme.breakpoints.down('sm')]: {
                py: 1,
                px: 0,
              },
            })}
            showDivider
            metric={
              <ContentWithSuffix
                content={formatAmount(value, { minDecimals: 2 })}
                suffix={unit}
                variant={isMobile ? 'body2' : 'h6'}
                suffixVariant={isMobile ? 'caption' : 'body1'}
              />
            }
          />
        )
      )}
    </Box>
  )
}

export default RepaymentsDataCard
