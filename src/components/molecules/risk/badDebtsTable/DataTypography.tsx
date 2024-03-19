import { Typography, TypographyProps } from '@mui/material'
import React from 'react'

interface DataTypographyProps extends TypographyProps {
  data: number | string | null
}

const DataTypography: React.FC<DataTypographyProps> = ({
  data,
  ...typographyProps
}) => {
  const isValidData = data !== null && data !== undefined && data !== ''
  const content = isValidData ? data : 'N/A'
  const color = isValidData ? 'inherit' : 'grey.400'

  return (
    <Typography {...typographyProps} color={color}>
      {content}
    </Typography>
  )
}

export default DataTypography
