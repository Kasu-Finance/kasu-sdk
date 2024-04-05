import { Box, Button, Card, Typography } from '@mui/material'
import Link from 'next/link'

interface PoolCardProps {
  poolName: string
  link: string
}

const PoolCard: React.FC<PoolCardProps> = ({ poolName, link }) => (
  <Card sx={{ p: 3 }}>
    <Typography variant='h5'>{poolName}</Typography>
    <Box display='flex' justifyContent='space-between'>
      <Button href={link} variant='contained' component={Link}>
        Overview
      </Button>
    </Box>
  </Card>
)

export default PoolCard
