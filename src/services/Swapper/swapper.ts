import axios from 'axios';
import { BigNumber, ethers } from 'ethers'

import {
    SwapInfoStruct,
} from '../../contracts/SwapperAbi'

import { OneInchQuoteRes, OneInchSwapRes, SwapDepositBagStruct } from './types';

export class Swapper {
    private readonly PRECISION_DECIMALS = 18
    private readonly PRECISION = BigNumber.from(10).pow(this.PRECISION_DECIMALS)

    public async getSwapData(
        url: string,
        fromTokenAddress: string,
        toTokenAddress: string,
        amountInDecimals: string,
        fromAddress: string,
        slippage: string,
    ): Promise<OneInchSwapRes> {
        const res: { data: OneInchSwapRes } = await axios.get(url,{
            params: {
                getRequest: `/swap/v5.2/1/swap?fromTokenAddress=${fromTokenAddress}&toTokenAddress=${toTokenAddress}&amount=${amountInDecimals}&fromAddress=${fromAddress}&slippage=${slippage}&disableEstimate=true&allowPartialFill=false&includeTokensInfo=true`
            }
        });
        return res.data
    }

    public async getConversionData(
        url: string,
        fromTokenAddress: string,
        toTokenAddress: string,
        amountInDecimals: string,
    ): Promise<OneInchQuoteRes> {
        const res: { data: OneInchQuoteRes } = await axios.get(url, {
            params: {
                getRequest: `/swap/v5.2/1/quote?fromTokenAddress=${fromTokenAddress}&toTokenAddress=${toTokenAddress}&amount=${amountInDecimals}&includeTokensInfo=true&includeGas=true`
            }
        });
        return res.data
    }
    private async getTokenRatioAtMax(
        swapUrl: string,
        inToken: string,
        inAmount: BigNumber,
        outToken: string,
    ): Promise<BigNumber> {
        const data = await this.getConversionData(
            swapUrl,
            inToken,
            outToken,
            inAmount.toString(),
        )

        return inAmount
            .mul(this.PRECISION)
            .div(
                ethers.utils.parseUnits(
                    data.toAmount,
                    this.PRECISION_DECIMALS - data.toToken.decimals,
                ),
            )
    }

    public async getSwap(
        swapUrl: string,
        inTokens: string[],
        inAmounts: BigNumber[],
        inDecimals: BigNumber[],
        outToken: string,
        userAddress: string,
        swapperAddress: string,
        slippage: string,
    ): Promise<SwapDepositBagStruct> {
        if (
            inTokens.length !== inAmounts.length ||
            inTokens.length !== inDecimals.length
        ) {
            throw new Error('Invalid input')
        }



        const transaction: SwapDepositBagStruct = {
            tokensIn: inTokens,
            swapInfo: [],
            tokenOut: outToken,
            receiver: userAddress,
        }

        const swapDataPromises: Promise<OneInchSwapRes>[] = []
        for (let i = 0; i < inTokens.length; i++) {
                    swapDataPromises[i] = this.getSwapData(
                        swapUrl,
                        inTokens[i],
                        outToken,
                        ethers.utils.formatUnits(inAmounts[i], 0).split('.')[0],
                        swapperAddress,
                        slippage
                    )
        }

        const promiseSwapData2D = Promise.all(
            swapDataPromises
        )

        await promiseSwapData2D.then((values) => {
            for (let i = 0; i < inTokens.length; i++) {
                if (inTokens[i] !== outToken) {
                    const swapInfo: SwapInfoStruct = {
                        swapTarget: values[i].tx.to,
                        token: inTokens[i],
                        swapCallData: values[i].tx.data,
                    }
                    transaction.swapInfo.push(swapInfo)
                }
            }
        })
        return transaction
    }

    public async getSwapInfo(
        swapUrl: string,
        inTokens: string[],
        inAmounts: BigNumber[],
        inDecimals: BigNumber[],
        outToken: string,
        userAddress: string,
        swapperAddress: string,
        slippage: string,
    ): Promise<Awaited<OneInchSwapRes>[]> {
        if (
            inTokens.length !== inAmounts.length ||
            inTokens.length !== inDecimals.length
        ) {
            throw new Error('Invalid input')
        }



        const transaction: SwapDepositBagStruct = {
            tokensIn: inTokens,
            swapInfo: [],
            tokenOut: outToken,
            receiver: userAddress,
        }

        const swapDataPromises: Promise<OneInchSwapRes>[] = []
        for (let i = 0; i < inTokens.length; i++) {
            swapDataPromises[i] = this.getSwapData(
                swapUrl,
                inTokens[i],
                outToken,
                ethers.utils.formatUnits(inAmounts[i], 0).split('.')[0],
                swapperAddress,
                slippage
            )
        }

        const promiseSwapData2D = Promise.all(
            swapDataPromises
        )
        return promiseSwapData2D;
    }
}
