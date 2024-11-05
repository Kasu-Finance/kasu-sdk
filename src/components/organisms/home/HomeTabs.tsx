'use client'

import { Tabs } from '@mui/material'
import { usePathname } from 'next/navigation'

import getTranslation from '@/hooks/useTranslation'

import CustomTab from '@/components/atoms/CustomTab'
import TabsContainer from '@/components/atoms/TabsContainer'
import DisplayOptions from '@/components/organisms/home/DisplayOptions'

import { Routes } from '@/config/routes'

const HomeTabs = () => {
  const { t } = getTranslation()

  const pathName = usePathname()

  return (
    <TabsContainer>
      <Tabs
        value={pathName}
        TabIndicatorProps={{
          sx: { bgcolor: 'gray.extraDark', height: 4, borderRadius: 1 },
        }}
        sx={{
          width: 'max-content',
        }}
      >
        <CustomTab
          label={t('home.tabs.activePools')}
          value={Routes.lending.root.url}
        />
        <CustomTab
          label={t('home.tabs.closedPools')}
          value={Routes.lending.closedLendingStrategies.url}
        />
      </Tabs>
      <DisplayOptions />
    </TabsContainer>
  )
}

export default HomeTabs
