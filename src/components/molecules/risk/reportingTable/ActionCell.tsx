import { Box, IconButton } from '@mui/material'
import React from 'react'

import { DownloadIcon } from '@/assets/icons'

interface ActionCellProps {
  actionUrl: string
}

const ActionCell: React.FC<ActionCellProps> = ({ actionUrl }) => (
  <Box pr={1}>
    <IconButton
      component='a'
      href={actionUrl}
      target='_blank'
      aria-label='download'
    >
      <DownloadIcon />
    </IconButton>
  </Box>
)

export default ActionCell
