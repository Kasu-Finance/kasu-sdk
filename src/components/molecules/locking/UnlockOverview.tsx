'use client'

import { Typography } from '@mui/material'

import ColoredBox from '@/components/atoms/ColoredBox'
import UnlockRow from '@/components/atoms/locking/UnlockRow'

const UNLOCKS = [
  {
    amount: '5000',
    date: 1737044680,
  },
  {
    amount: '6000',
    date: 1705767903,
  },
]

const UnlockOverview = () => {
  return (
    <>
      <Typography variant='h6' component='span' display='block' mt={1} mb={2}>
        Time until KASU unlock
      </Typography>
      <ColoredBox mt={2} mb={1} display='grid' rowGap={1}>
        {UNLOCKS.map((unlock) => (
          <UnlockRow key={unlock.date} unlockDetail={unlock} />
        ))}
      </ColoredBox>
    </>
  )
}

export default UnlockOverview
