'use client'

import { useSyncExternalStore } from 'react'

import {
  getProviderMapSnapshot,
  subscribeToProviderMap,
} from '@/connection/providers/eip6963/eip6963manager'

import { EIP6963ProviderDetail } from '@/types/eip6963'

/** Returns an up-to-date map of announced eip6963 providers */
const useInjectedProviderDetails = (): readonly EIP6963ProviderDetail[] => {
  return useSyncExternalStore(subscribeToProviderMap, getProviderMapSnapshot)
}

export default useInjectedProviderDetails
