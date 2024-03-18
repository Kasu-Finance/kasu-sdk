import { Box, Typography } from '@mui/material'
import React from 'react'

import { splitTextIntoRows } from '@/utils'

interface TextContentProps {
  text: string
}

const TextContent: React.FC<TextContentProps> = ({ text }) => {
  const charsPerRow = 90
  const rows = splitTextIntoRows(text, charsPerRow)

  return (
    <Box mt={1}>
      {rows.map((row, index) => (
        <Typography key={index} variant='body2'>
          {row}
        </Typography>
      ))}
    </Box>
  )
}

export default TextContent
