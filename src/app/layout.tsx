import { Box } from '@mui/material'
import type { Metadata } from 'next'
import { ReactNode } from 'react'

import '@/styles/fonts.module.css'

import Tracking from '@/components/atoms/Tracking'
import Footer from '@/components/organisms/footer'
import Header from '@/components/organisms/header'
import ModalsContainer from '@/components/organisms/modals/ModalsContainer'

import KycState from '@/context/kyc/kyc.provider'
import ModalState from '@/context/modal/modal.provider'
import ToastState from '@/context/toast/toast.provider'
import Web3Provider from '@/context/web3provider/web3.provider'

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
          <Web3Provider>
            <KycState>
              <ModalState>
                <ToastState>
                  <Header />
                  <Box component='main'>{children}</Box>
                  <Footer />
                  <ModalsContainer />
                </ToastState>
              </ModalState>
            </KycState>
          </Web3Provider>
        </ThemeRegistry>
      </body>
    </html>
  )
}
