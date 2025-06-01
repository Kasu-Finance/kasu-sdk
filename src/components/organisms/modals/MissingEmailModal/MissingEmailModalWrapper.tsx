import {
  ComPilotProvider,
  createConfig,
  createWeb3AuthAdapter,
} from '@compilot/react-sdk'
import { createWagmiWalletAdapter } from '@compilot/web-sdk-wallet-wagmi'
import { useMemo } from 'react'

import { DialogChildProps } from '@/components/atoms/DialogWrapper'

import { wagmiConfig } from '@/context/privy.provider'

import { generateEmailChallenge } from '@/config/nexera/nexera.config'

import MissingEmailModal from '.'

const MissingEmailModalWrapper: React.FC<DialogChildProps> = ({
  handleClose,
}) => {
  const authAdapter = useMemo(() => {
    return createWeb3AuthAdapter({
      wallet: createWagmiWalletAdapter(wagmiConfig),
      generateChallenge: generateEmailChallenge,
    })
  }, [])

  const config = useMemo(() => createConfig({ authAdapter }), [authAdapter])

  return (
    <ComPilotProvider config={config} autoLoad>
      <MissingEmailModal handleClose={handleClose} />
    </ComPilotProvider>
  )
}

export default MissingEmailModalWrapper
