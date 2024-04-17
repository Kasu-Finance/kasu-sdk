import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { memo, useCallback, useState } from 'react'

import EmptyCardState from '@/components/atoms/EmptyCardState'
import Carousel from '@/components/molecules/Carousel'
import PoolCard from '@/components/molecules/PoolCard'
import TabPanel from '@/components/molecules/tabs/TabPanel'

import { Routes } from '@/config/routes'

interface PoolCardProps {
  pools: any
}

const HomeTabs: React.FC<PoolCardProps> = ({ pools }) => {
  const [activeTab, setActiveTab] = useState(0)
  const panelsId = 'home-pools'

  const handleChange = useCallback(
    (event: React.SyntheticEvent, newValue: number) => {
      setActiveTab(newValue)
    },
    []
  )

  const hasPools = pools && pools.length > 0

  const poolsContent = hasPools ? (
    pools.map((pool, index) => (
      <PoolCard
        key={index}
        pool={pool}
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
        <Tab label='Active Pools' />
        <Tab label='Closed Pools' />
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
