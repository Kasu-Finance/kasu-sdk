import { Box, Card, Typography } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

import InfoRow from '@/components/atoms/InfoRow'

import poolDelegateMock from '@/mock-data/pool-details/poolDelegateMock'

const PoolDelegateCard = () => {
  const { t } = useTranslation()

  const data = poolDelegateMock

  return (
    <Card sx={{ minWidth: 275, boxShadow: 3, padding: 2 }} elevation={1}>
      <Typography variant='h6' mb={2}>
        {t('details.poolDelegate.title')}
      </Typography>

      <Box display='flex'>
        <Box width='50%' p={2}>
          {data.leftColumn.map((row, index) => (
            <InfoRow
              key={index}
              title={row.title}
              toolTipInfo={row.toolTipInfo}
              titleStyle={{ pl: 2, mt: 1 }}
              showDivider
              metric={
                Array.isArray(row.metric) ? (
                  <Box
                    display='flex'
                    flexDirection='column'
                    alignItems='flex-end'
                  >
                    {row.metric.map((item, itemIndex) => (
                      <Typography
                        key={itemIndex}
                        variant='body2'
                        component='span'
                        color='primary'
                        sx={{ cursor: 'pointer', pr: 2 }}
                      >
                        {item}
                      </Typography>
                    ))}
                  </Box>
                ) : (
                  <Typography variant='body2' component='span' pr={2}>
                    {row.metric}
                  </Typography>
                )
              }
            />
          ))}
        </Box>
        <Box width='50%' p={2}>
          {data.rightColumn.map((row, index) => (
            <InfoRow
              key={index}
              title={row.title}
              toolTipInfo={row.toolTipInfo}
              titleStyle={{ pl: 2, mt: 1 }}
              showDivider
              metric={
                <Typography variant='body2' component='span' pr={2}>
                  <b>{row.metric}</b> {row?.unit || ''}
                </Typography>
              }
            />
          ))}
        </Box>
      </Box>
    </Card>
  )
}

export default PoolDelegateCard
