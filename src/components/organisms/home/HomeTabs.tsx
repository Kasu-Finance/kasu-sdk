'use client'

import { Tabs } from '@mui/material'
import { usePathname } from 'next/navigation'

import useTranslation from '@/hooks/useTranslation'

import TabsContainer from '@/components/atoms/TabsContainer'
import DisplayOptions from '@/components/organisms/home/DisplayOptions'
import HomeTab from '@/components/organisms/home/HomeTab'

import { Routes } from '@/config/routes'

const HomeTabs = () => {
  const { t } = useTranslation()

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
        <HomeTab
          label={t('home.tabs.activePools')}
          value={Routes.lending.root.url}
        />
        <HomeTab
          label={t('home.tabs.closedPools')}
          value={Routes.lending.closedLendingStrategies.url}
        />
      </Tabs>
      <DisplayOptions />
    </TabsContainer>
  )
}

export default HomeTabs
