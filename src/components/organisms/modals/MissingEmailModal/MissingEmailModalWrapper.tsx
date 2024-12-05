import {
  ComPilotProvider,
  createConfig,
  createWeb3AuthAdapter,
} from '@compilot/react-sdk'
import { useWeb3React } from '@web3-react/core'
import { useMemo } from 'react'

import { DialogChildProps } from '@/components/atoms/DialogWrapper'

import {
  customWalletConfig,
  generateEmailChallenge,
} from '@/config/nexera/nexera.config'

import MissingEmailModal from '.'

const MissingEmailModalWrapper: React.FC<DialogChildProps> = ({
  handleClose,
}) => {
  const { connector } = useWeb3React()

  const authAdapter = useMemo(() => {
    return createWeb3AuthAdapter({
      wallet: customWalletConfig(connector),
      generateChallenge: generateEmailChallenge,
    })
  }, [connector])

  const config = useMemo(() => createConfig({ authAdapter }), [authAdapter])

  return (
    <ComPilotProvider config={config} autoLoad>
      <MissingEmailModal handleClose={handleClose} />
    </ComPilotProvider>
  )
}

export default MissingEmailModalWrapper
