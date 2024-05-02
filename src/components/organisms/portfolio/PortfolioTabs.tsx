'use client'

import { Box, Card, Tab, Tabs } from '@mui/material'
import { memo, useCallback, useState } from 'react'

import TabPanel from '@/components/molecules/tabs/TabPanel'
import LendingPortfolioTab from '@/components/organisms/portfolio/LendingPortfolioTab'
import RewardsTab from '@/components/organisms/portfolio/PortfolioRewardsTab'
import PortfolioWalletTab from '@/components/organisms/portfolio/PortfolioWalletTab'

const PORTFOLIO_TABS = {
  'Lending Portfolio': <LendingPortfolioTab />,
  Rewards: <RewardsTab />,
  Wallet: <PortfolioWalletTab />,
} as const

const PortfolioTabs = () => {
  const [activeTab, setActiveTab] = useState(0)

  const handleChange = useCallback(
    (_: React.SyntheticEvent, newValue: number) => {
      setActiveTab(newValue)
    },
    []
  )

  return (
    <Box>
      <Tabs
        value={activeTab}
        onChange={handleChange}
        aria-label='basic tabs example'
      >
        {Object.keys(PORTFOLIO_TABS).map((label) => (
          <Tab label={label} key={label} />
        ))}
      </Tabs>
      {Object.values(PORTFOLIO_TABS).map((render, index) => (
        <TabPanel
          id={`lending-${index}`}
          isActive={activeTab === index}
          key={index}
        >
          <Card>{render}</Card>
        </TabPanel>
      ))}
    </Box>
  )
}

export default memo(PortfolioTabs)
