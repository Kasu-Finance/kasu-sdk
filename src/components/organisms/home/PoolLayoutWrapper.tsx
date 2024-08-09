'use client'

import { ReactNode } from 'react'

import useHomeState from '@/hooks/context/useHomeState'

import PoolCardWrapperSkeleton from '@/components/molecules/loaders/home/PoolCardWrapperSkeleton'
import PoolCardContainer from '@/components/organisms/home/PoolCard/PoolCardContainer'
import PoolTable from '@/components/organisms/home/PoolTable'

import { LayoutTypes } from '@/context/home/home.types'

import { PoolOverviewWithDelegate } from '@/types/page'

type PoolCardWrapperProps = {
  pools: PoolOverviewWithDelegate[]
  emptyPoolsPlaceholder: ReactNode
}

const PoolLayoutWrapper: React.FC<PoolCardWrapperProps> = ({
  pools,
  emptyPoolsPlaceholder,
}) => {
  const { layout } = useHomeState()

  if (!layout) {
    return <PoolCardWrapperSkeleton />
  }

  if (!pools.length) {
    return emptyPoolsPlaceholder
  }

  return layout === LayoutTypes.CARD ? (
    <PoolCardContainer pools={pools} />
  ) : (
    <PoolTable pools={pools} />
  )
}

export default PoolLayoutWrapper
