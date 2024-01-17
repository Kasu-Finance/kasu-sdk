import { Box, Typography } from '@mui/material'

import dayjs from '@/dayjs'

type UnlockRowProps = {
  unlockDetail: {
    amount: string
    date: EpochTimeStamp
  }
}

const UnlockRow: React.FC<UnlockRowProps> = ({ unlockDetail }) => {
  return (
    <Box display='flex' justifyContent='space-between' px={2} py='6px'>
      <Typography variant='subtitle2' component='span'>
        {unlockDetail.amount} KSU unlocks on
      </Typography>
      <Typography variant='subtitle2' component='span'>
        {dayjs.unix(unlockDetail.date).format('Do MMM YYYY')}
      </Typography>
    </Box>
  )
}

export default UnlockRow
