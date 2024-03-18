import { Box, Link } from '@mui/material'
import React from 'react'

import { DownloadIcon } from '@/assets/icons'

interface ActionCellProps {
  actionUrl: string
}

const ActionCell: React.FC<ActionCellProps> = ({ actionUrl }) => (
  <Box pr={1}>
    <Link href={actionUrl} target='_blank'>
      <DownloadIcon />
    </Link>
  </Box>
)

export default ActionCell
