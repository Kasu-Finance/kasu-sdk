'use client'

import { Box, Card, Tabs } from '@mui/material'
import { memo, useCallback, useMemo, useState } from 'react'

import useTranslation from '@/hooks/useTranslation'

import StyledTab from '@/components/atoms/StyledTab'
import TabPanel from '@/components/molecules/tabs/TabPanel'
import LendingPortfolioTab from '@/components/organisms/portfolio/LendingPortfolioTab'
import RewardsTab from '@/components/organisms/portfolio/PortfolioRewardsTab'
import PortfolioWalletTab from '@/components/organisms/portfolio/PortfolioWalletTab'

const PortfolioTabs = () => {
  const [activeTab, setActiveTab] = useState(0)

  const { t } = useTranslation()

  const PORTFOLIO_TABS = useMemo(
    () =>
      ({
        [t('portfolio.lendingPortfolio.title')]: <LendingPortfolioTab />,
        [t('general.rewards')]: <RewardsTab />,
        [t('general.wallet')]: <PortfolioWalletTab />,
      }) as const,
    [t]
  )
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
        sx={(theme) => ({
          mb: 3,
          [theme.breakpoints.down('sm')]: {
            '.MuiTabs-flexContainer': {
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            },
          },
        })}
      >
        {Object.keys(PORTFOLIO_TABS).map((label) => (
          <StyledTab key={label} label={label} />
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
