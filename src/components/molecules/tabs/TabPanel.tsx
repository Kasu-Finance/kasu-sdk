'use client'

import Box from '@mui/material/Box'

interface TabPanelProps {
  children?: React.ReactNode
  id: string
  index: number
  value: number
}

const TabPanel: React.FC<TabPanelProps> = ({
  children,
  id,
  value,
  index,
  ...other
}) => (
  <div
    role='tabpanel'
    hidden={value !== index}
    id={`${id}-panel-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ p: 0 }}>{children}</Box>}
  </div>
)

export default TabPanel
