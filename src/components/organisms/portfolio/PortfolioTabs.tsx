'use client'

import { Tabs } from '@mui/material'
import { usePathname } from 'next/navigation'
import { memo } from 'react'

import useTranslation from '@/hooks/useTranslation'

import CustomTab from '@/components/atoms/CustomTab'
import TabsContainer from '@/components/atoms/TabsContainer'

import { Routes } from '@/config/routes'

const PortfolioTabs = () => {
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
        <CustomTab
          label={t('portfolio.tabs.lendingPortflio')}
          value={Routes.portfolio.root.url}
        />
        <CustomTab
          label={t('portfolio.tabs.yourTransactions')}
          value={Routes.portfolio.yourTransactions.url}
        />
        <CustomTab
          label={t('portfolio.tabs.bonusAndRewards')}
          value={Routes.portfolio.rewards.url}
        />
        <CustomTab
          label={t('general.wallet')}
          value={Routes.portfolio.wallet.url}
        />
      </Tabs>
    </TabsContainer>
  )
}

export default memo(PortfolioTabs)
