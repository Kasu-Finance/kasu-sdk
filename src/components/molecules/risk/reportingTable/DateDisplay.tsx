import { Typography } from '@mui/material'
import React from 'react'

import { extractDateAndUtcOffset, formatTimestampWithOffset } from '@/utils'

interface DateDisplayProps {
  uploadDate: number
}

const DateDisplay: React.FC<DateDisplayProps> = ({ uploadDate }) => {
  const formattedDate = formatTimestampWithOffset(uploadDate, 1)
  const { date, time, format, offset } = extractDateAndUtcOffset(formattedDate)

  return (
    <>
      <Typography variant='body1'>{date}</Typography>
      <Typography variant='body2' color='grey.500' sx={{ fontSize: 12 }}>
        {time} {format}
        {offset}
      </Typography>
    </>
  )
}

export default DateDisplay
