'use client'

import { Box, Container } from '@mui/material'
import Tabs from '@mui/material/Tabs'
import { usePathname } from 'next/navigation'
import { memo, useRef } from 'react'

import useIsSticky from '@/hooks/useIsSticky'
import getTranslation from '@/hooks/useTranslation'

import CustomTab from '@/components/atoms/CustomTab'
import TabsContainer from '@/components/atoms/TabsContainer'

import { Routes } from '@/config/routes'

type PoolTabsProps = {
  poolId: string
}

const PoolTabs: React.FC<PoolTabsProps> = ({ poolId }) => {
  const ref = useRef(null)

  const { t } = getTranslation()

  const pathName = usePathname()

  const basePath = `${Routes.lending.root.url}/${poolId}`

  const { isSticky } = useIsSticky({
    elementRef: ref,
    threshold: 84,
  })

  return (
    <>
      {/* Adds filler space when container becomes fixed and becomes "missing" space from the DOM */}
      {isSticky && <Box pb={6} />}
      <Container
        maxWidth='lg'
        ref={ref}
        style={{ padding: isSticky ? undefined : 0 }}
        sx={{
          bgcolor: 'white',
          ...(isSticky && {
            position: 'fixed',
            top: 84, // navbar height
            zIndex: 1000,
            transform: 'translateX(-24px)',
          }),
        }}
      >
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
      </Container>
    </>
  )
}

export default memo(PoolTabs)
