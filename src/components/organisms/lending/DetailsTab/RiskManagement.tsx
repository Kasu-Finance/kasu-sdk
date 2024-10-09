import { Box, Divider, Stack, Typography } from '@mui/material'
import { RiskManagement as RiskManagementType } from '@solidant/kasu-sdk/src/services/DataService/types'

import useTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import CustomCardHeader from '@/components/atoms/CustomCard/CustomCardHeader'
import CustomInnerCardContent from '@/components/atoms/CustomCard/CustomInnerCardContent'
import DottedDivider from '@/components/atoms/DottedDivider'
import InfoColumn from '@/components/atoms/InfoColumn'

import { groupBy } from '@/utils'

type RiskManagementProps = {
  riskManagement: RiskManagementType
}

const RiskManagement: React.FC<RiskManagementProps> = ({ riskManagement }) => {
  const { t } = useTranslation()

  const groupedItems = groupBy(riskManagement.items, ({ group }) => group)

  return (
    <CustomCard>
      <CustomCardHeader title={t('details.riskManagement.title')} />
      <CustomInnerCardContent sx={{ pt: 5, pb: 3 }}>
        <Box
          display='grid'
          gridTemplateColumns='repeat(auto-fit, minmax(30%, 1fr))'
          columnGap={4}
          rowGap={8}
        >
          {Object.entries(groupedItems).map(([group, items]) => (
            <Box key={group}>
              <Typography variant='h5' textTransform='capitalize'>
                {group}
              </Typography>
              <Divider sx={{ mt: 1.5 }} />
              {items.map((item) => (
                <Stack key={item.name} spacing={2} mt={2}>
                  <InfoColumn
                    title={item.name}
                    toolTipInfo={item.tooltip}
                    titleStyle={{ variant: 'baseMd' }}
                    metric={
                      <Typography variant='baseMdBold'>
                        {item.description}
                      </Typography>
                    }
                  />
                  <DottedDivider />
                </Stack>
              ))}
            </Box>
          ))}
        </Box>
      </CustomInnerCardContent>
    </CustomCard>
  )
}

export default RiskManagement
