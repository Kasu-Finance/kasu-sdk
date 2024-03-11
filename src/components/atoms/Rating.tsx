import MuiRating from '@mui/material/Rating'
import { styled, SxProps } from '@mui/material/styles'
import React from 'react'

interface RatingProps {
  sx?: SxProps
  value?: number
  defaultValue?: number
  precision?: number
  readOnly?: boolean
}

const StyledRating = styled(MuiRating)(({ theme }) => ({
  '& .MuiRating-iconFilled': {
    color: theme.palette.grey[900],
  },
}))

const Rating: React.FC<RatingProps> = ({
  sx,
  value = 0,
  defaultValue = 0,
  precision = 0.5,
  readOnly = false,
  ...props
}) => {
  return (
    <StyledRating
      sx={sx}
      value={value}
      defaultValue={defaultValue}
      precision={precision}
      readOnly={readOnly}
      {...props}
    />
  )
}

export default Rating
