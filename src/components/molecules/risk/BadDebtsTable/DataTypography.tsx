import { Typography, TypographyProps } from '@mui/material'
import React from 'react'

interface DataTypographyProps extends TypographyProps {
  data: number | string | null
  suffix?: string
}

const DataTypography: React.FC<DataTypographyProps> = ({
  data,
  suffix,
  ...typographyProps
}) => {
  const isValidData = data !== null && data !== undefined && data !== ''
  const content = isValidData ? data : 'N/A'
  const color = isValidData ? 'inherit' : 'grey.400'

  return (
    <Typography {...typographyProps} color={color}>
      {content}
      {suffix && isValidData && (
        <Typography variant='caption' component='span'>
          {suffix}
        </Typography>
      )}
    </Typography>
  )
}

export default DataTypography
