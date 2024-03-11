import { Network } from '@ethersproject/networks'
import { Provider } from '@web3-react/types'

import { EIP6963ProviderDetail } from '@/types/eip6963'

/**
 * Returns true if the string is a RFC2397-compliant data URI
 * @see {@link https://www.rfc-editor.org/rfc/rfc2397}
 */
const isDataURI = (uri: string): boolean => {
  return /data:(image\/[-+\w.]+)(;?\w+=[-\w]+)*(;base64)?,.*/gu.test(uri)
}

const isEip1193Provider = (value: any): value is Provider => {
  return Boolean(value.request && value.on && value.removeListener)
}

export const isEIP6963ProviderDetail = (
  value: any
): value is EIP6963ProviderDetail => {
  return Boolean(
    value.provider &&
      isEip1193Provider(value.provider) &&
      value.info &&
      value.info.name &&
      value.info.uuid &&
      value.info.rdns &&
      value.info.icon &&
      isDataURI(value.info.icon)
  )
}

export const isCoinbaseProviderDetail = (
  providerDetail: EIP6963ProviderDetail
): boolean => {
  return providerDetail.info.rdns === 'com.coinbase.wallet'
}

export const checkNetworks = (networks: Array<Network>): Network | null => {
  let result: Network | null = null

  for (let i = 0; i < networks.length; i++) {
    const network = networks[i]

    // Null! We do not know our network; bail.
    if (network == null) {
      throw new Error('unknown network')
    }

    if (result) {
      // Make sure the network matches the previous networks
      if (
        !(
          result.name === network.name &&
          result.chainId === network.chainId &&
          (result.ensAddress === network.ensAddress ||
            (result.ensAddress == null && network.ensAddress == null))
        )
      ) {
        throw new Error('networks mismatch')
      }
    } else {
      result = network
    }
  }

  return result
}
