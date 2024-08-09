import { Box, Card, Typography } from '@mui/material'
import Image from 'next/image'

import PoolCardActions from '@/components/organisms/home/PoolCard/PoolCardActions'
import PoolCardContent from '@/components/organisms/home/PoolCard/PoolCardContent'

import { FireIcon, LockIcon } from '@/assets/icons'

import { PoolOverviewWithDelegate } from '@/types/page'

interface PoolCardProps {
  pool: PoolOverviewWithDelegate
}

const PoolCard: React.FC<PoolCardProps> = ({ pool }) => {
  return (
    <Card
      sx={{
        flex: 1,
        bgcolor: 'gray.extraDark',
        overflow: 'unset',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        borderBottomLeftRadius: 25, // to prevent extra pixels from rendering
        borderBottomRightRadius: 25, // to prevent extra pixels from rendering
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pt: 3,
        boxShadow: '0px 5px 20px 0px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Box position='absolute' top={16} left={16}>
        {pool.isActive ? <FireIcon /> : <LockIcon />}
      </Box>
      <Image
        src={pool.thumbnailImageUrl}
        alt={pool.poolName}
        width={240}
        height={240}
      />
      <Box
        height={72}
        maxWidth='90%'
        textAlign='center'
        display='flex'
        alignItems='center'
      >
        <Typography variant='h4' color='primary' lineHeight='24px'>
          {pool.poolName}
        </Typography>
      </Box>
      <Box
        borderRadius={2}
        bgcolor='white'
        display='flex'
        flexDirection='column'
        flexGrow={1}
        width='100%'
        overflow='hidden'
      >
        <PoolCardContent pool={pool} />
        <PoolCardActions pool={pool} />
      </Box>
    </Card>
  )
}

export default PoolCard
