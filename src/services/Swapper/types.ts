import { SwapInfoStruct } from '../../contracts/SwapperAbi';

export interface SwapDepositBagStruct {
    tokensIn: string[],
    swapInfo: SwapInfoStruct[],
    tokenOut: string,
    receiver: string,
}

export interface OneInchQuoteRes {
  fromToken: {
    symbol: string
    name: string
    address: string
    decimals: number
    logoURI: string
  }
  toToken: {
    symbol: string
    name: string
    address: string
    decimals: number
    logoURI: string
  }
  toAmount: string
  gas: number
}

export interface OneInchSwapRes {
    fromToken: {
        symbol: string
        name: string
        address: string
        decimals: number
        logoURI: string
    }
    toToken: {
        symbol: string
        name: string
        address: string
        decimals: number
        logoURI: string
    }
    toAmount: string
    protocols: string[]
    tx: {
        from: string
        to: string
        data: string
        value: string
        gasPrice: string
        gas: number
    }
}