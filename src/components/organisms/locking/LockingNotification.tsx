import { Icon, Typography } from '@mui/material'

import WaveBox from '@/components/atoms/WaveBox'
import LearnButton from '@/components/organisms/lending/OverviewTab/UserLoyalty/LearnButton'

import { InfoIcon } from '@/assets/icons'

const LockingNotification = () => {
  return (
    <WaveBox
      variant='gray'
      borderRadius={2}
      px={2}
      py={3.5}
      display='flex'
      gap={2}
      justifyContent='space-between'
      alignItems='center'
    >
      <Icon
        sx={{
          width: 44,
          height: 44,
          svg: {
            width: 'inherit',
            height: 'inherit',
          },
        }}
      >
        <InfoIcon />
      </Icon>
      <Typography variant='h5'>
        We’re working hard on the launch of the $KASU token. In the meantime,
        start lending so you’re the first to benefit once $KASU launches.
      </Typography>
      <LearnButton sx={{ maxWidth: 307, textTransform: 'capitalize' }} />
    </WaveBox>
  )
}

export default LockingNotification
