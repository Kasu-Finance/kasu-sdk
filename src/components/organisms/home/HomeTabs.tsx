'use client'

import { Box, Container, Tabs } from '@mui/material'
import { usePathname } from 'next/navigation'
import { useRef } from 'react'

import useIsSticky from '@/hooks/useIsSticky'
import getTranslation from '@/hooks/useTranslation'

import CustomTab from '@/components/atoms/CustomTab'
import TabsContainer from '@/components/atoms/TabsContainer'
import DisplayOptions from '@/components/organisms/home/DisplayOptions'

import { Routes } from '@/config/routes'

const HomeTabs = () => {
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
              label={t('home.tabs.activePools')}
              value={Routes.lending.root.url}
            />
            <CustomTab
              label={t('home.tabs.oversubscribedPools')}
              value={Routes.lending.fullySubscribedLendingStrategies.url}
            />
            <CustomTab
              label={t('home.tabs.closedPools')}
              value={Routes.lending.closedLendingStrategies.url}
            />
          </Tabs>
          <DisplayOptions />
        </TabsContainer>
      </Container>
    </>
  )
}

export default HomeTabs
