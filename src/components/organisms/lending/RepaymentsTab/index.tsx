import { Stack } from '@mui/material'

import LoanStatus from '@/components/organisms/lending/RepaymentsTab/LoanStatus'
import SummaryStatistics from '@/components/organisms/lending/RepaymentsTab/SummaryStatistics'

type PoolDetailsProps = {
  poolId: string
}

const RepaymentsTab: React.FC<PoolDetailsProps> = async () => {
  return (
    <Stack spacing={3} mt={3}>
      <SummaryStatistics />
      <LoanStatus />
    </Stack>
  )
}

export default RepaymentsTab
