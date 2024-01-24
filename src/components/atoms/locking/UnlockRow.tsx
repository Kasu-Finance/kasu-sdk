import { Box, Typography } from '@mui/material'
import { UserLock } from 'kasu-sdk/src/types'

import dayjs from '@/dayjs'

type UnlockRowProps = {
  unlockDetail: UserLock
}

const UnlockRow: React.FC<UnlockRowProps> = ({ unlockDetail }) => {
  return (
    <Box display='flex' justifyContent='space-between' px={2} py='6px'>
      <Typography variant='subtitle2' component='span'>
        {unlockDetail.amount.toString()} KSU unlocks on
      </Typography>
      <Typography variant='subtitle2' component='span'>
        {dayjs.unix(unlockDetail.startTime).format('Do MMM YYYY')}
      </Typography>
    </Box>
  )
}

export default UnlockRow
