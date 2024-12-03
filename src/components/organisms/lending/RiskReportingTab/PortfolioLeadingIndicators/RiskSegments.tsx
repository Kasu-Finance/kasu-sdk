import { Box, Divider, Stack, Typography } from '@mui/material'

import data from '@/components/organisms/lending/RiskReportingTab/PortfolioLeadingIndicators/data.json'
import PieChart from '@/components/organisms/lending/RiskReportingTab/PortfolioLeadingIndicators/PieChart'

const RiskSegments = () => {
  return (
    <Box gap={5} display='flex'>
      <Stack justifyContent='space-between' minWidth={200}>
        <Box>
          <Typography variant='h5'>Risk Segments ($)</Typography>
          <Divider sx={{ mt: 1.5 }} />
        </Box>

        <Stack spacing={1} pb={1}>
          {data.riskSegments.map(({ id, color, label }) => (
            <Box key={id} display='flex' alignItems='center'>
              <Box
                width={32}
                height={16}
                bgcolor={color}
                borderRadius={1}
                mr={1}
              />
              <Typography variant='baseMd'>{label}</Typography>
            </Box>
          ))}
        </Stack>
      </Stack>
      <Box width={220} height={220} position='relative'>
        <PieChart data={data.riskSegments} />
      </Box>
    </Box>
  )
}

export default RiskSegments
