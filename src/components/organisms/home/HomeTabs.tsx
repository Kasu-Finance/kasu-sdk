'use client'

import { Box, Tabs } from '@mui/material'
import { usePathname } from 'next/navigation'

import useTranslation from '@/hooks/useTranslation'

import DisplayOptions from '@/components/organisms/home/DisplayOptions'
import HomeTab from '@/components/organisms/home/HomeTab'

import { Routes } from '@/config/routes'

const HomeTabs = () => {
  const { t } = useTranslation()

  const pathName = usePathname()

  // const currentDevice = useDeviceDetection()
  // const isMobile = currentDevice === Device.MOBILE
  // const isTablet = currentDevice === Device.TABLET

  // const sortPoolsByTrancheLength = (pools: PoolOverview[]) => {
  //   return pools?.sort((a, b) => a?.tranches?.length - b?.tranches?.length)
  // }

  // const sortedPools = useMemo(
  //   () => sortPoolsByTrancheLength([...pools]),
  //   [pools]
  // )

  // const activePools = useMemo(
  //   () => sortedPools.filter((pool) => pool.isActive),
  //   [sortedPools]
  // )

  // const closedPools = useMemo(
  //   () => pools?.filter((pool) => !pool.isActive),
  //   [pools]
  // )

  // const getDelegateByPoolId = useCallback(
  //   (poolId: string) =>
  //     poolDelegates?.find((delegate) => delegate.poolIdFK === poolId),
  //   [poolDelegates]
  // )

  return (
    <Box
      sx={{
        width: '100%',
        mt: 0.5,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          width: '100%',
          height: 4,
          bgcolor: 'primary.main',
          borderRadius: 1,
        },
      }}
      display='flex'
      justifyContent='space-between'
    >
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
    </Box>
  )

  // <Box sx={{ width: '100%', mt: 0.5 }}>
  //   <Tabs value={activeTab} onChange={handleChange} indicatorColor='primary'>
  //     <StyledTab
  //       label={t('home.tabs.activePools')}
  //       isActive={activeTab === 0}
  //       sx={(theme) => ({
  //         [theme.breakpoints.down('sm')]: {
  //           padding: theme.spacing(0.5, 1),
  //         },
  //       })}
  //     />
  //     <StyledTab
  //       label={t('home.tabs.closedPools')}
  //       isActive={activeTab === 1}
  //     />
  //   </Tabs>
  //   <TabPanel isActive={activeTab === 0} id='home-pools-active'>
  //     {activePools?.length ? (
  //       <Carousel
  //         slidesPerPage={isTablet || isMobile ? 1 : 3}
  //         arrowButtonStyle={{
  //           leftArrow: { left: isMobile ? '-20px' : '-35px' },
  //           rightArrow: { right: isMobile ? '-25px' : '-40px' },
  //         }}
  //       >
  //         {activePools.map((pool) => (
  //           <PoolCard
  //             key={pool.id}
  //             pool={pool}
  //             poolDelegate={getDelegateByPoolId(pool.id)}
  //             link={`${Routes.lending.root.url}/${pool.id}`}
  //           />
  //         ))}
  //       </Carousel>
  //     ) : (
  //       <EmptyCardState message={t('home.no-data.activePools')} />
  //     )}
  //   </TabPanel>
  //   <TabPanel isActive={activeTab === 1} id='home-pools-closed'>
  //     <Box mt={3}>
  //       {closedPools?.length ? (
  //         <ClosedPoolsTable
  //           pools={closedPools}
  //           poolDelegates={poolDelegates}
  //         />
  //       ) : (
  //         <EmptyCardState message={t('home.no-data.closedPools')} />
  //       )}
  //     </Box>
  //   </TabPanel>
  // </Box>
}

export default HomeTabs
