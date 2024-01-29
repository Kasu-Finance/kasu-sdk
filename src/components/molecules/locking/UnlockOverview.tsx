'use client'

import { Typography } from '@mui/material'

import useUserLocks from '@/hooks/locking/useUserLocks'

import ColoredBox from '@/components/atoms/ColoredBox'
import UnlockRow from '@/components/atoms/locking/UnlockRow'

const UnlockOverview = () => {
  const { userLocks } = useUserLocks()

  const hasLockedTokens = userLocks && Boolean(userLocks.length)
  return (
    <>
      <Typography variant='h6' component='span' display='block' mt={1} mb={2}>
        Time until KASU unlock
      </Typography>
      <ColoredBox
        mt={hasLockedTokens ? 2 : 1.5}
        mb={1}
        display='grid'
        rowGap={1}
      >
        {hasLockedTokens ? (
          userLocks.map((unlock) => (
            <UnlockRow key={unlock.startTime} unlockDetail={unlock} />
          ))
        ) : (
          <Typography
            variant='subtitle2'
            component='span'
            mx='6px'
            my={1}
            display='block'
          >
            Currently no locked KASU
          </Typography>
        )}
      </ColoredBox>
    </>
  )
}

export default UnlockOverview
