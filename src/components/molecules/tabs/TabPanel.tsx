'use client'

import Box from '@mui/material/Box'

interface TabPanelProps {
  children?: React.ReactNode
  id: string
  isActive: boolean
}

const TabPanel: React.FC<TabPanelProps> = ({
  children,
  id,
  isActive,
  ...rest
}) => (
  <div data-tab={id} role='tabpanel' hidden={!isActive} {...rest}>
    {isActive && <Box sx={{ p: 0 }}>{children}</Box>}
  </div>
)

export default TabPanel
