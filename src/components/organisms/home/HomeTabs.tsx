import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import {
  PoolDelegateProfileAndHistory,
  PoolOverview,
} from '@solidant/kasu-sdk/src/services/DataService/types'
import { memo, useCallback, useState } from 'react'

import useTranslation from '@/hooks/useTranslation'

import EmptyCardState from '@/components/atoms/EmptyCardState'
import Carousel from '@/components/molecules/Carousel'
import PoolCard from '@/components/molecules/PoolCard'
import TabPanel from '@/components/molecules/tabs/TabPanel'

import { Routes } from '@/config/routes'

interface PoolCardProps {
  pools: PoolOverview[]
  poolDelegates: PoolDelegateProfileAndHistory[]
}

const HomeTabs: React.FC<PoolCardProps> = ({ pools, poolDelegates }) => {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState(0)
  const panelsId = 'home-pools'

  const handleChange = useCallback(
    (event: React.SyntheticEvent, newValue: number) => {
      setActiveTab(newValue)
    },
    []
  )

  const getDelegateByPoolId = useCallback(
    (poolId: string) =>
      poolDelegates.find((delegate) => delegate.poolIdFK === poolId),
    [poolDelegates]
  )

  const hasPools = pools && pools.length > 0

  const poolsContent = hasPools ? (
    pools.map((pool) => (
      <PoolCard
        key={pool.id}
        pool={pool}
        poolDelegate={getDelegateByPoolId(pool.id)}
        link={`${Routes.lending.root.url}/${pool.id}`}
      />
    ))
  ) : (
    <EmptyCardState message='No pools available.' />
  )

  return (
    <Box sx={{ width: '100%', mt: 0.5 }}>
      <Tabs
        value={activeTab}
        onChange={handleChange}
        aria-label='Home Tabs Example'
      >
        <Tab label={t('home.tabs.activePools')} />
        <Tab label={t('home.tabs.closedPools')} />
      </Tabs>
      <TabPanel value={activeTab} index={0} id={`${panelsId}-active`}>
        <Box>
          <Carousel slidesPerPage={3}>{poolsContent}</Carousel>
        </Box>
      </TabPanel>
      <TabPanel value={activeTab} index={1} id={`${panelsId}-closed`}>
        {/* Content for Closed Pools */}
        <Box>
          <h2>Closed Pools</h2>
          <p>
            This section can contain information about pools that have been
            closed.
          </p>
        </Box>
      </TabPanel>
    </Box>
  )
}

export default memo(HomeTabs)
