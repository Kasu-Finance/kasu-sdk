import {
  ComPilotProvider,
  createConfig,
  createWeb3AuthAdapter,
} from '@compilot/react-sdk'
import { useWeb3React } from '@web3-react/core'
import { useMemo, useState } from 'react'

import { DialogChildProps } from '@/components/atoms/DialogWrapper'

import {
  customWalletConfig,
  generateChallenge,
} from '@/config/nexera/nexera.config'

import KycModal from '.'

const KycModalWrapper: React.FC<DialogChildProps> = ({ handleClose }) => {
  const { connector } = useWeb3React()

  const [isIndividual, setIsIndividual] = useState(true)

  const authAdapter = useMemo(() => {
    return createWeb3AuthAdapter({
      wallet: customWalletConfig(connector),
      generateChallenge: generateChallenge(isIndividual),
    })
  }, [isIndividual, connector])

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
