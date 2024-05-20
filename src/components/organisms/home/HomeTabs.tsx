import Box from '@mui/material/Box'
import Tabs from '@mui/material/Tabs'
import {
  PoolDelegateProfileAndHistory,
  PoolOverview,
} from '@solidant/kasu-sdk/src/services/DataService/types'
import { memo, useCallback, useMemo, useState } from 'react'

import useTranslation from '@/hooks/useTranslation'

import EmptyCardState from '@/components/atoms/EmptyCardState'
import StyledTab from '@/components/atoms/StyledTab'
import Carousel from '@/components/molecules/Carousel'
import ClosedPoolsTable from '@/components/molecules/home/ClosedPoolsTable'
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

  const closedPools = useMemo(
    () => pools?.filter((pool) => !pool.isActive),
    [pools]
  )

  const handleChange = useCallback(
    (event: React.SyntheticEvent, newValue: number) => {
      setActiveTab(newValue)
    },
    []
  )

  const getDelegateByPoolId = useCallback(
    (poolId: string) =>
      poolDelegates?.find((delegate) => delegate.poolIdFK === poolId),
    [poolDelegates]
  )

  const poolsContent =
    pools?.length > 0 ? (
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
      <Tabs value={activeTab} onChange={handleChange} indicatorColor='primary'>
        <StyledTab
          label={t('home.tabs.activePools')}
          isActive={activeTab === 0}
        />
        <StyledTab
          label={t('home.tabs.closedPools')}
          isActive={activeTab === 1}
        />
      </Tabs>
      <TabPanel isActive={activeTab === 0} id='home-pools-active'>
        <Box>
          <Carousel
            slidesPerPage={3}
            arrowButtonStyle={{
              leftArrow: { left: '-40px' },
              rightArrow: { right: '-40px' },
            }}
          >
            {poolsContent}
          </Carousel>
        </Box>
      </TabPanel>
      <TabPanel isActive={activeTab === 1} id='home-pools-closed'>
        <Box mt={3}>
          {closedPools?.length ? (
            <ClosedPoolsTable
              pools={closedPools}
              poolDelegates={poolDelegates}
            />
          ) : (
            <EmptyCardState message='No closed pools available.' />
          )}
        </Box>
      </TabPanel>
    </Box>
  )
}

export default memo(HomeTabs)
