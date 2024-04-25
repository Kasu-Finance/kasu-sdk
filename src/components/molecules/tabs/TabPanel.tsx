'use client'

import Box from '@mui/material/Box'

interface TabPanelProps {
  children?: React.ReactNode
  isActive: boolean
  id: string
}

const TabPanel: React.FC<TabPanelProps> = ({
  children,
  isActive,
  id,
  ...rest
}) => (
  <div data-tab={id} role='tabpanel' hidden={!isActive} {...rest}>
    {isActive && <Box sx={{ p: 0 }}>{children}</Box>}
  </div>
)

export default TabPanel
