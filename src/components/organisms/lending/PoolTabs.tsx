'use client'

import Box from '@mui/material/Box'
import Tabs from '@mui/material/Tabs'
import { memo, useCallback, useState } from 'react'

import useDeviceDetection, { Device } from '@/hooks/useDeviceDetections'
import useTranslation from '@/hooks/useTranslation'

import StyledTab from '@/components/atoms/StyledTab'
import PoolOverview from '@/components/molecules/lending/overview/PoolOverview'
import TabPanel from '@/components/molecules/tabs/TabPanel'
import PoolDetails from '@/components/organisms/details/PoolDetails'
import Repayments from '@/components/organisms/repayments/Repayments'
import RiskReporting from '@/components/organisms/risk/RiskReporting'

const PoolTabs: React.FC = () => {
  const { t } = useTranslation()

  const currentDevice = useDeviceDetection()

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
          variant='scrollable'
          scrollButtons='auto'
          sx={(theme) => ({
            [theme.breakpoints.down('sm')]: {
              '.MuiTabs-flexContainer': {
                justifyContent: 'space-between',
              },
            },
          })}
        >
          <StyledTab
            label={t('details.poolDetails.tabs.overview')}
            isActive={activeTab === 0}
          />
          <StyledTab
            label={
              currentDevice === Device.MOBILE
                ? t('details.poolDetails.tabs.details')
                : t('details.poolDetails.tabs.lendingStrategyDetails')
            }
            isActive={activeTab === 1}
          />
          <StyledTab
            label={t('details.poolDetails.tabs.repayments')}
            isActive={activeTab === 2}
          />
          <StyledTab
            label={t('details.poolDetails.tabs.riskReporting')}
            isActive={activeTab === 3}
          />
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
    </Box>
  )
}

export default memo(PoolTabs)
