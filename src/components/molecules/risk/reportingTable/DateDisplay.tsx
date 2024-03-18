import { Typography } from '@mui/material'
import React from 'react'

import { formatToDateTimeUtc, splitDateAndTime } from '@/utils'

interface DateDisplayProps {
  uploadDate: number
}

const DateDisplay: React.FC<DateDisplayProps> = ({ uploadDate }) => {
  const formattedDate = formatToDateTimeUtc(uploadDate)
  const { date, utcOffset } = splitDateAndTime(formattedDate)

  return (
    <>
      <Typography variant='body1'>{date}</Typography>
      <Typography variant='body2' color='grey.500' sx={{ fontSize: 12 }}>
        {utcOffset}
      </Typography>
    </>
  )
}

export default DateDisplay
