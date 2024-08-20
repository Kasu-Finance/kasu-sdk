import { Box, Divider, Grid, Typography } from '@mui/material'
import { RiskManagement as RiskManagementType } from '@solidant/kasu-sdk/src/services/DataService/types'
import { Fragment } from 'react'

import useTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import CustomInnerCardContent from '@/components/atoms/CustomCard/CustomInnerCardContent'
import DottedDivider from '@/components/atoms/DottedDivider'
import InfoColumn from '@/components/atoms/InfoColumn'
import WaveCard from '@/components/molecules/WaveCard'

import { formatAmount, groupBy } from '@/utils'

type RiskManagementProps = {
  riskManagement: RiskManagementType
}

const RiskManagement: React.FC<RiskManagementProps> = ({ riskManagement }) => {
  const { t } = useTranslation()

  const groupedItems = groupBy(riskManagement.items, ({ group }) => group)

  return (
    <CustomCard>
      <Typography variant='h3' color='gold.darkNoises' px={2} mb={3}>
        {t('details.riskManagement.title')}
      </Typography>
      <CustomInnerCardContent sx={{ py: 3 }}>
        <Typography variant='h5' textTransform='capitalize' mt={2}>
          {t('details.riskManagement.riskStatus.title')}
        </Typography>
        <Divider sx={{ mt: 1.5 }} />
        <Grid container columnSpacing={4} mt={4}>
          <Grid item xs={6}>
            <WaveCard
              title={t('details.riskManagement.riskStatus.firstLoss.label')}
              toolTipInfo={t(
                'details.riskManagement.riskStatus.firstLoss.tooltip'
              )}
              content={formatAmount(
                riskManagement.riskPerformance.firstLossCapital
              )}
              unit='USDC'
            />
          </Grid>
          <Grid item xs={6}>
            <WaveCard
              title={t('details.riskManagement.riskStatus.lossRate.label')}
              toolTipInfo={t(
                'details.riskManagement.riskStatus.lossRate.tooltip'
              )}
              content={formatAmount(
                riskManagement.riskPerformance.poolLossRate * 100
              )}
              unit='%'
            />
          </Grid>
        </Grid>
        {Object.entries(groupedItems).map(([group, items]) => (
          <Box key={group}>
            <Typography variant='h5' textTransform='capitalize' mt={6}>
              {group}
            </Typography>
            <Divider sx={{ mt: 1.5 }} />
            <Grid container rowSpacing={3} columnSpacing={4} mt={4}>
              {items.map((item) => (
                <Fragment key={item.id}>
                  <Grid
                    item
                    xs={6}
                    display='flex'
                    flexDirection='column'
                    gap={2.5}
                  >
                    <InfoColumn
                      title={item.title}
                      toolTipInfo={item.tooltip}
                      titleStyle={{ variant: 'baseMd' }}
                      metric={
                        <Typography variant='baseMdBold'>
                          {item.description}
                        </Typography>
                      }
                    />
                    <DottedDivider style={{ marginTop: 'auto' }} />
                  </Grid>
                </Fragment>
              ))}
            </Grid>
          </Box>
        ))}
      </CustomInnerCardContent>
    </CustomCard>
  )
}

export default RiskManagement
