import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers'
import { buildSignatureMessage } from '@nexeraid/identity-sdk'
import { NEXERA_CHAINS } from '@nexeraprotocol/nexera-id-schemas'
import { useContext } from 'react'

import kycContext from '@/context/kyc/kyc.context'
import { IdentityClientData, KycTypes } from '@/context/kyc/kyc.types'

import { generateKycToken } from '@/actions/generateKycToken'

// prettier-ignore
const ABI = [   {     inputs: [       { internalType: 'address', name: 'signerAddress', type: 'address' },     ],     stateMutability: 'nonpayable',     type: 'constructor',   },   { inputs: [], name: 'BlockExpired', type: 'error' },   { inputs: [], name: 'InvalidSignature', type: 'error' },   {     anonymous: false,     inputs: [       {         indexed: false,         internalType: 'uint256',         name: 'chainID',         type: 'uint256',       },       {         indexed: false,         internalType: 'uint256',         name: 'nonce',         type: 'uint256',       },       {         indexed: false,         internalType: 'uint256',         name: 'blockExpiration',         type: 'uint256',       },       {         indexed: false,         internalType: 'address',         name: 'contractAddress',         type: 'address',       },       {         indexed: false,         internalType: 'address',         name: 'userAddress',         type: 'address',       },       {         indexed: false,         internalType: 'bytes',         name: 'functionCallData',         type: 'bytes',       },     ],     name: 'NexeraIDSignatureVerified',     type: 'event',   },   {     anonymous: false,     inputs: [       {         indexed: true,         internalType: 'address',         name: 'previousOwner',         type: 'address',       },       {         indexed: true,         internalType: 'address',         name: 'newOwner',         type: 'address',       },     ],     name: 'OwnershipTransferred',     type: 'event',   },   {     inputs: [       { internalType: 'uint256', name: 'input1', type: 'uint256' },       {         internalType: 'uint256',         name: '_blockExpiration',         type: 'uint256',       },       { internalType: 'bytes', name: '_signature', type: 'bytes' },     ],     name: 'gated',     outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],     stateMutability: 'nonpayable',     type: 'function',   },   {     inputs: [       {         components: [           { internalType: 'uint256', name: 'chainID', type: 'uint256' },           { internalType: 'uint256', name: 'nonce', type: 'uint256' },           {             internalType: 'uint256',             name: 'blockExpiration',             type: 'uint256',           },           {             internalType: 'address',             name: 'contractAddress',             type: 'address',           },           {             internalType: 'address',             name: 'userAddress',             type: 'address',           },           {             internalType: 'bytes',             name: 'functionCallData',             type: 'bytes',           },         ],         internalType: 'struct BaseTxAuthDataVerifier.TxAuthData',         name: '_txAuthData',         type: 'tuple',       },     ],     name: 'getMessageHash',     outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],     stateMutability: 'pure',     type: 'function',   },   {     inputs: [],     name: 'getSignerAddress',     outputs: [{ internalType: 'address', name: '', type: 'address' }],     stateMutability: 'view',     type: 'function',   },   {     inputs: [{ internalType: 'address', name: 'user', type: 'address' }],     name: 'getUserNonce',     outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],     stateMutability: 'view',     type: 'function',   },   {     inputs: [{ internalType: 'address', name: '', type: 'address' }],     name: 'nonces',     outputs: [{ internalType: 'uint256', name: '_value', type: 'uint256' }],     stateMutability: 'view',     type: 'function',   },   {     inputs: [],     name: 'owner',     outputs: [{ internalType: 'address', name: '', type: 'address' }],     stateMutability: 'view',     type: 'function',   },   {     inputs: [],     name: 'renounceOwnership',     outputs: [],     stateMutability: 'nonpayable',     type: 'function',   },   {     inputs: [{ internalType: 'address', name: '_signer', type: 'address' }],     name: 'setSigner',     outputs: [],     stateMutability: 'nonpayable',     type: 'function',   },   {     inputs: [{ internalType: 'address', name: 'newOwner', type: 'address' }],     name: 'transferOwnership',     outputs: [],     stateMutability: 'nonpayable',     type: 'function',   }, ]

const useKycState = (): KycTypes => {
  const context = useContext(kycContext)

  if (!Object.keys(context).length) {
    throw new Error('KycContext must be used within its provider')
  }

  const { identityClient, dispatch } = context

  const initClient = async (
    signer: JsonRpcSigner,
    initData: Omit<IdentityClientData, 'userAddress'>
  ) => {
    identityClient.onSignMessage(async (data) => {
      return (await signer.signMessage(data.message)) as `0x${string}`
    })

    identityClient.onSdkReady(async () => {
      const result = await identityClient.getTxAuthSignature({
        chainId: NEXERA_CHAINS.POLYGON_MUMBAI,
        contractAbi: ABI,
        contractAddress:
          '0x0b956cB485798a4EC3f4E58C608Bb832190Cf7eA'.toLowerCase() as `0x${string}`,
        functionName: 'gated',
        args: [1],
      })

      if (result.isAuthorized) {
        dispatch({
          type: 'SET_KYC_COMPLETED',
          payload: true,
        })
      }
    })

    identityClient.onCloseScreen(async () => {
      return new Promise((resolve) => {
        // eslint-disable-next-line
        console.log('On Close Screen callback')
        resolve('')
      })
    })

    await identityClient.init(initData)
  }

  const authenticate = async (provider: Web3Provider) => {
    const signer = provider.getSigner()

    const account = (await signer.getAddress()).toLowerCase()

    const signingMessage = buildSignatureMessage(account as `0x${string}`)

    const signature = await signer.signMessage(signingMessage)

    const accessToken = await generateKycToken(account)

    if (!accessToken) return

    await initClient(signer, { accessToken, signature, signingMessage })

    dispatch({
      type: 'AUTHENTICATE',
      payload: {
        accessToken,
        signature,
        signingMessage,
        userAddress: account,
      },
    })
  }

  return {
    ...context,
    authenticate,
  }
}

export default useKycState
