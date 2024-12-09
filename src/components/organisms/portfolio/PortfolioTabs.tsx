'use client'

import { Box, Container, Tabs } from '@mui/material'
import { usePathname } from 'next/navigation'
import { memo, useRef } from 'react'

import useIsSticky from '@/hooks/useIsSticky'
import getTranslation from '@/hooks/useTranslation'

import CustomTab from '@/components/atoms/CustomTab'
import TabsContainer from '@/components/atoms/TabsContainer'

import { Routes } from '@/config/routes'

const PortfolioTabs = () => {
  const ref = useRef(null)

  const { t } = getTranslation()

  const pathName = usePathname()

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
      </Container>
    </>
  )
}

export default memo(PortfolioTabs)
