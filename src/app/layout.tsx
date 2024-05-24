import { Box } from '@mui/material'
import type { Metadata } from 'next'
import { ReactNode } from 'react'

import '@/styles/fonts.module.css'

import Tracking from '@/components/atoms/Tracking'
import PageFooter from '@/components/molecules/PageFooter'
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
      <body className='hide-overflow-mobile'>
        <div className='top-layout-bg'></div>
        <SWRProvider lockPeriods={lockPeriods}>
          <ThemeRegistry>
            <Web3Provider>
              <KycState>
                <ModalState>
                  <ToastState>
                    <Header />
                    <Box
                      component='main'
                      sx={{
                        marginTop: 3,
                        paddingBottom: 2,
                        overflowX: 'hidden',
                        '@media (max-width: 600px)': {
                          overflow: 'hidden',
                        },
                      }}
                    >
                      {children}

                      <PageFooter />
                    </Box>
                    <ModalsContainer />
                  </ToastState>
                </ModalState>
              </KycState>
            </Web3Provider>
          </ThemeRegistry>
        </SWRProvider>
        <div className='bottom-layout-bg'></div>
      </body>
    </html>
  )
}
