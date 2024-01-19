import { Contract } from 'ethers'
import { isAddress } from 'ethers/lib/utils'

const fetcher =
  (library: any, abi: any) =>
  (...args: any) => {
    const [arg1, arg2, ...params] = args

    if (isAddress(arg1)) {
      const address = arg1
      const method = arg2

      const contract = new Contract(address, abi, library)

      return contract[method](...params)
    }

    const method = arg1

    return library[method](arg2, ...params)
  }

export default fetcher
