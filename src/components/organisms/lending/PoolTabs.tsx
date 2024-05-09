'use client'

import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { memo, useCallback, useState } from 'react'

import PoolOverview from '@/components/molecules/lending/overview/PoolOverview'
import TabPanel from '@/components/molecules/tabs/TabPanel'
import PoolDetails from '@/components/organisms/details/PoolDetails'
import Repayments from '@/components/organisms/repayments/Repayments'
import RiskReporting from '@/components/organisms/risk/RiskReporting'

const PoolTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0)
  const panelsId = 'lending'

  const handleChange = useCallback(
    (_: React.SyntheticEvent, newValue: number) => {
      setActiveTab(newValue)
    },
    []
  )

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 1.5 }}>
        <Tabs
          value={activeTab}
          onChange={handleChange}
          aria-label='basic tabs example'
        >
          <Tab label='Overview' />
          <Tab label='Pool Details' />
          <Tab label='Repayments' />
          <Tab label='Risk Reporting' />
          <Tab label='Support' />
        </Tabs>
      </Box>
      <TabPanel isActive={activeTab === 0} id={panelsId}>
        <PoolOverview />
      </TabPanel>
      <TabPanel isActive={activeTab === 1} id={panelsId}>
        <PoolDetails />
      </TabPanel>
      <TabPanel isActive={activeTab === 2} id={panelsId}>
        <Repayments />
      </TabPanel>
      <TabPanel isActive={activeTab === 3} id={panelsId}>
        <RiskReporting />
      </TabPanel>
      <TabPanel isActive={activeTab === 4} id={panelsId}>
        Support
      </TabPanel>
    </Box>
  )
}

export default memo(PoolTabs)
