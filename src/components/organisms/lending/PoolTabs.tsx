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

const POOL_TABS = {
  Overview: <PoolOverview />,
  'Pool Details': <PoolDetails />,
  Repayments: <Repayments />,
  'Risk Reporting': <RiskReporting />,
  Support: 'Support',
} as const

const PoolTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0)

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
          {Object.keys(POOL_TABS).map((label) => (
            <Tab label={label} key={label} />
          ))}
        </Tabs>
      </Box>
      {Object.values(POOL_TABS).map((render, index) => (
        <TabPanel
          id={`lending-${index}`}
          isActive={activeTab === index}
          key={index}
        >
          {render}
        </TabPanel>
      ))}
    </Box>
  )
}

export default memo(PoolTabs)
