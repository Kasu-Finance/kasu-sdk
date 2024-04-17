import { Box, Typography } from '@mui/material'
import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'

import useTranslation from '@/hooks/useTranslation'

interface PoolCardContentProps {
  pool: PoolOverview
}

const PoolCardContent: React.FC<PoolCardContentProps> = ({ pool }) => {
  const { t } = useTranslation()
  return (
    <Box display='flex' justifyContent='center' mt={3}>
      {/* PoolCardContent  */}
      {/* Metrics */}
      <Typography variant='h5'>{pool.poolName}</Typography>
    </Box>
  )
}

export default PoolCardContent
