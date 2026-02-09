import {
  PoolDelegateProfileAndHistory,
  PoolOverview,
} from '@kasufinance/kasu-sdk'
import { NextPage } from 'next'
import { AppProps } from 'next/app'
import { ReactElement, ReactNode } from 'react'

export type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode
}

export type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

export type PoolOverviewWithDelegate = PoolOverview & {
  delegate: PoolDelegateProfileAndHistory
}
