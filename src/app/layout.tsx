import { Box } from '@mui/material'
import { PoolOverviewDirectus } from '@solidant/kasu-sdk/src/services/DataService/directus-types'
import type { Metadata } from 'next'
import { ReactNode } from 'react'

import '@/styles/fonts.module.css'

import Tracking from '@/components/atoms/Tracking'
import Footer from '@/components/organisms/footer'
import Header from '@/components/organisms/header'
import ModalsContainer from '@/components/organisms/modals/ModalsContainer'

import KycState from '@/context/kyc/kyc.provider'
import ModalState from '@/context/modal/modal.provider'
import SwrProvider from '@/context/swr.provider'
import ToastState from '@/context/toast/toast.provider'
import Web3Provider from '@/context/web3provider/web3.provider'

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
      <Tracking />
      <body>
        <ThemeRegistry>
          <SwrProvider unusedPools={filteredPools}>
            <Web3Provider>
              <ToastState>
                <KycState>
                  <ModalState>
                    <Header />
                    <Box component='main'>{children}</Box>
                    <Footer />
                    <ModalsContainer />
                  </ModalState>
                </KycState>
              </ToastState>
            </Web3Provider>
          </SwrProvider>
        </ThemeRegistry>
      </body>
    </html>
  )
}
