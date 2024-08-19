import { Box, Typography } from '@mui/material'
import Image from 'next/image'

import CustomCard from '@/components/atoms/CustomCard'
import CustomCardContent from '@/components/atoms/CustomCard/CustomCardContent'
import PoolCardActions from '@/components/organisms/home/PoolCard/PoolCardActions'
import PoolCardContent from '@/components/organisms/home/PoolCard/PoolCardContent'

import { FireIcon, LockIcon } from '@/assets/icons'

import { PoolOverviewWithDelegate } from '@/types/page'

interface PoolCardProps {
  pool: PoolOverviewWithDelegate
}

const PoolCard: React.FC<PoolCardProps> = ({ pool }) => {
  return (
    <CustomCard
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
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
      <CustomCardContent>
        <PoolCardContent pool={pool} />
        <PoolCardActions pool={pool} />
      </CustomCardContent>
    </CustomCard>
  )
}

export default PoolCard
