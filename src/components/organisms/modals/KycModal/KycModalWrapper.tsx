import {
  ComPilotProvider,
  createConfig,
  createWeb3AuthAdapter,
} from '@compilot/react-sdk'
import { createWagmiWalletAdapter } from '@compilot/web-sdk-wallet-wagmi'
import { useMemo, useState } from 'react'

import { DialogChildProps } from '@/components/atoms/DialogWrapper'

import { wagmiConfig } from '@/context/privy.provider'

import { generateChallenge } from '@/config/nexera/nexera.config'

import KycModal from '.'

const KycModalWrapper: React.FC<DialogChildProps> = ({ handleClose }) => {
  const [isIndividual, setIsIndividual] = useState(true)

  const authAdapter = useMemo(() => {
    return createWeb3AuthAdapter({
      wallet: createWagmiWalletAdapter(wagmiConfig),
      generateChallenge: generateChallenge(isIndividual),
    })
  }, [isIndividual])

  const config = useMemo(() => createConfig({ authAdapter }), [authAdapter])

  return (
    <ComPilotProvider config={config} autoLoad>
      <KycModal
        isIndividual={isIndividual}
        setIsIndividual={setIsIndividual}
        handleClose={handleClose}
      />
    </ComPilotProvider>
  )
}

export default KycModalWrapper
