'use client'

import Tabs from '@mui/material/Tabs'
import { usePathname } from 'next/navigation'
import { memo } from 'react'

import useTranslation from '@/hooks/useTranslation'

import CustomTab from '@/components/atoms/CustomTab'
import TabsContainer from '@/components/atoms/TabsContainer'

import { Routes } from '@/config/routes'

type PoolTabsProps = {
  poolId: string
}

const PoolTabs: React.FC<PoolTabsProps> = ({ poolId }) => {
  const { t } = useTranslation()

  const pathName = usePathname()

  const basePath = `${Routes.lending.root.url}/${poolId}`

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
          label={t('details.poolDetails.tabs.overview')}
          value={basePath}
        />
        <CustomTab
          label={t('details.poolDetails.tabs.details')}
          value={`${basePath}/details`}
        />
        <CustomTab
          label={t('details.poolDetails.tabs.repayments')}
          value={`${basePath}/repayments`}
        />
        <CustomTab
          label={t('details.poolDetails.tabs.riskReporting')}
          value={`${basePath}/risk-reporting`}
        />
      </Tabs>
    </TabsContainer>
  )
}

export default memo(PoolTabs)
