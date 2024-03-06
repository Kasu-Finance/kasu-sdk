'use client'

import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { memo, useCallback, useState } from 'react'

import OverviewCard from '@/components/molecules/lending/OverviewCard'
import TabPanel from '@/components/molecules/tabs/TabPanel'
import RepaymentsTable from '@/components/organisms/repayments/repaymentsTable'

import repaymentsMock from '@/app/mock-data/repayments-data'

const PoolTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0)
  const panelsId = 'lending'

  const handleChange = useCallback(
    (event: React.SyntheticEvent, newValue: number) => {
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
          <Tab label='Item Repayments' />
          <Tab label='Risk Reporting' />
          <Tab label='Support' />
        </Tabs>
      </Box>
      <TabPanel value={activeTab} index={0} id={panelsId}>
        <OverviewCard />
      </TabPanel>
      <TabPanel value={activeTab} index={1} id={panelsId}>
        Pool Details
      </TabPanel>
      <TabPanel value={activeTab} index={2} id={panelsId}>
        <RepaymentsTable data={repaymentsMock} />
      </TabPanel>
      <TabPanel value={activeTab} index={3} id={panelsId}>
        Risk Reporting
      </TabPanel>
      <TabPanel value={activeTab} index={4} id={panelsId}>
        Support
      </TabPanel>
    </Box>
  )
}

export default memo(PoolTabs)
