import { Box } from '@mui/material'
import type { Metadata } from 'next'
import { Roboto } from 'next/font/google'
import { ReactNode } from 'react'

import Tracking from '@/components/atoms/Tracking'
import Header from '@/components/organisms/header'
import ModalsContainer from '@/components/organisms/modals/ModalsContainer'

import KycState from '@/context/kyc/kyc.provider'
import ModalState from '@/context/modal/modal.provider'
import { SWRProvider } from '@/context/swrProvider/swr.provider'
import ToastState from '@/context/toast/toast.provider'
import Web3Provider from '@/context/web3provider/web3.provider'

import getLockPeriods from '@/actions/getLockPeriods'
import ThemeRegistry from '@/themes/ThemeRegistry'

import '@/connection/eagerlyConnect'

type RootLayoutProps = {
  children: ReactNode
}

const roboto = Roboto({
  weight: ['100', '300', '400', '500', '700', '900'],
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Kasu',
  description: 'Kasu',
  manifest: '/manifest.json',
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const lockPeriods = await getLockPeriods()

  return (
    <html lang='en'>
      <Tracking />
      <body className={roboto.className}>
        <SWRProvider lockPeriods={lockPeriods}>
          <ThemeRegistry>
            <Web3Provider>
              <KycState>
                <ModalState>
                  <ToastState>
                    <Header />
                    <Box component='main' paddingTop={3} paddingBottom={3}>
                      {children}
                    </Box>
                    <ModalsContainer />
                  </ToastState>
                </ModalState>
              </KycState>
            </Web3Provider>
          </ThemeRegistry>
        </SWRProvider>
      </body>
    </html>
  )
}
