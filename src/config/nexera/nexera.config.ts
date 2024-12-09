import { EvmChainId, Web3Wallet } from '@compilot/react-sdk'
import { Connector } from '@web3-react/types'

export const customWalletConfig = (connector: Connector): Web3Wallet => {
  const provider = connector.provider!

  return {
    namespace: 'eip155',
    getAddress: async () => {
      const accounts = (await provider.request({
        method: 'eth_accounts',
      })) as string[] | undefined

      return accounts?.[0]
    },
    isConnected: async () => {
      const accounts = (await provider.request({
        method: 'eth_accounts',
      })) as string[] | undefined

      return Boolean(accounts?.[0])
    },
    sign: async ({ message }: { message: string }) => {
      const accounts = (await provider.request({
        method: 'eth_accounts',
      })) as string[]

      const account = accounts[0]

      const signature = (await provider.request({
        method: 'personal_sign',
        params: [message, account],
      })) as string

      return {
        message,
        signature,
        signerPublicKey: account,
        signedMessage: message,
      }
    },
    getBlockchainId: async () => {
      const chainId = (await provider.request({
        method: 'eth_chainId',
      })) as string | number

      return (
        typeof chainId === 'string' ? Number.parseInt(chainId, 16) : chainId
      ).toString() as EvmChainId
    },
  }
}

export const generateChallenge =
  (isIndividual: boolean) => async (params: any) => {
    const res = await fetch('/api/kyc-challenge', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...params, isIndividual }),
    })

    return res.json()
  }

export const generateEmailChallenge = async (params: any) => {
  const res = await fetch('/api/email-challenge', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...params }),
  })

  return res.json()
}
