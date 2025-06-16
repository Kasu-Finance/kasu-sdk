import { Box } from '@mui/material'
import { PoolOverviewDirectus } from '@solidant/kasu-sdk/src/services/DataService/directus-types'
import type { Metadata } from 'next'
import Script from 'next/script'
import { ReactNode } from 'react'

import Chatbot from '@/components/atoms/Chatbot'
import Footer from '@/components/organisms/footer'
import Header from '@/components/organisms/header'
import ModalsContainer from '@/components/organisms/modals/ModalsContainer'

import KycState from '@/context/kyc/kyc.provider'
import ModalState from '@/context/modal/modal.provider'
import PrivyProvider from '@/context/privy.provider'
import SwrProvider from '@/context/swr.provider'
import ToastState from '@/context/toast/toast.provider'

import sdkConfig from '@/config/sdk'
import ThemeRegistry from '@/themes/ThemeRegistry'

type RootLayoutProps = {
  children: ReactNode
}

export const metadata: Metadata = {
  title: 'Kasu',
  description: 'Kasu',
  manifest: '/manifest.json',
}

// Since this is the root layout, all fetch requests in the app
// that don't set their own cache option will be cached.
export const fetchCache = 'default-cache'

export default async function RootLayout({ children }: RootLayoutProps) {
  const res = await fetch(
    `${sdkConfig.directusUrl}items/PoolOverview?filter[enabled][_neq]=true`
  )

  const unusedPools: { data: PoolOverviewDirectus[] } = await res.json()
  const filteredPools = unusedPools.data.map((pool) => pool.id)

  return (
    <html lang='en'>
      <link rel='shortcut icon' href='/favicon.ico' />
      <link
        rel='icon'
        type='image/png'
        sizes='16x16'
        href='/favicons/favicon-16x16.png'
      />
      <link
        rel='icon'
        type='image/png'
        sizes='32x32'
        href='/favicons/favicon-32x32.png'
      />
      <link
        rel='apple-touch-icon'
        sizes='180x180'
        href='/favicons/apple-touch-icon.png'
      />
      <link
        rel='icon'
        type='image/png'
        sizes='192x192'
        href='/favicons/android-chrome-192x192.png'
      />
      <link
        rel='icon'
        type='image/png'
        sizes='512x512'
        href='/favicons/android-chrome-512x512.png'
      />
      <Chatbot />

      <body>
        <ThemeRegistry>
          <PrivyProvider>
            <SwrProvider unusedPools={filteredPools}>
              <ToastState>
                <KycState>
                  <ModalState>
                    {/* <NftTracker /> */}
                    <Header />
                    <Box component='main'>{children}</Box>
                    <Footer />
                    <ModalsContainer />
                  </ModalState>
                </KycState>
              </ToastState>
            </SwrProvider>
          </PrivyProvider>
        </ThemeRegistry>
      </body>
      <Script
        src='https://cdn.markfi.xyz/scripts/analytics/0.11.24/cookie3.analytics.min.js'
        integrity='sha384-ihnQ09PGDbDPthGB3QoQ2Heg2RwQIDyWkHkqxMzq91RPeP8OmydAZbQLgAakAOfI'
        crossOrigin='anonymous'
        async
        strategy='lazyOnload'
        site-id='9d57619d-d1f7-404f-9e5b-6ab88f39d5a0'
      />
    </html>
  )
}
