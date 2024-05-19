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

    public calculateAmountToBuy(
        inTokens: string[],
        outTokens: string[],
        ratiosAtMax: BigNumber[][],
        outRatio: BigNumber[],
        outRatioDecimals: BigNumber[],
        inAmounts: BigNumber[],
    ): BigNumber[][] {
        const amountToBuy: BigNumber[][] = []
        const values: BigNumber[] = []
        for (let i = 0; i < inTokens.length; i++) {
            let x = BigNumber.from(0)
            for (let j = 0; j < outTokens.length; j++) {
                x = x.add(
                    ratiosAtMax[i][j]
                        .mul(
                            outRatio[j]
                                .mul(this.PRECISION)
                                .div(BigNumber.from(10).pow(outRatioDecimals[j])),
                        )
                        .div(this.PRECISION),
                )
            }
            values[i] = inAmounts[i].mul(this.PRECISION).div(x)
        }

        for (let i = 0; i < inTokens.length; i++) {
            amountToBuy[i] = []
            for (let j = 0; j < outTokens.length; j++) {
                amountToBuy[i][j] = values[i]
                    .mul(
                        outRatio[j]
                            .mul(this.PRECISION)
                            .div(BigNumber.from(10).pow(outRatioDecimals[j])),
                    )
                    .mul(ratiosAtMax[i][j])
            }
        }

        return amountToBuy
    }

    public fixAmountToBuy(
        inAmounts: BigNumber[],
        amountToBuy: BigNumber[][],
    ): BigNumber[][] {
        const fixedAmountToBuy: BigNumber[][] = []
        for (let i = 0; i < amountToBuy.length; i++) {
            let sum: BigNumber = BigNumber.from(0)
            for (const amount of amountToBuy[i]) {
                sum = sum.add(amount.div(this.PRECISION.mul(2)))
            }
            fixedAmountToBuy[i] = []
            if (sum.gt(inAmounts[i])) {
                for (let j = 0; j < amountToBuy[i].length; j++) {
                    fixedAmountToBuy[i][j] = amountToBuy[i][j]
                        .div(this.PRECISION.mul(2))
                        .mul(inAmounts[i])
                        .div(sum)
                }
            }
        }
        return fixedAmountToBuy
    }

    public async getSwap(
        swapUrl: string,
        inTokens: string[],
        inAmounts: BigNumber[],
        inDecimals: BigNumber[],
        outTokens: string[],
        outRatio: BigNumber[],
        outRatioDecimals: BigNumber[],
        userAddress: string,
        swapperAddress: string,
        slippage: string
    ): Promise<SwapDepositBagStruct> {
        if (
            inTokens.length !== inAmounts.length ||
            outTokens.length !== outRatio.length ||
            inTokens.length !== inDecimals.length ||
            outTokens.length !== outRatioDecimals.length
        ) {
            throw new Error('Invalid input')
        }

        const ratiosAtMax: BigNumber[][] = []
        const ratiosAtMaxPromises: Promise<BigNumber>[][] = []
        for (let i = 0; i < inTokens.length; i++) {
            ratiosAtMax[i] = []
            for (let j = 0; j < outTokens.length; j++) {
                if (inTokens[i] === outTokens[j]) {
                    ratiosAtMax[i][j] = BigNumber.from(10).pow(inDecimals[i])
                    continue
                }
                ratiosAtMaxPromises[i][j] = this.getTokenRatioAtMax(
                    swapUrl,
                    inTokens[i],
                    inAmounts[i],
                    outTokens[j],
                )
            }
        }

        const promiseRatiosAtMax2D = Promise.all(
            ratiosAtMaxPromises.map(function (innerPromiseArray) {
                return Promise.all(innerPromiseArray)
            }),
        )

        await promiseRatiosAtMax2D.then((values) => {
            for (let i = 0; i < inTokens.length; i++) {
                for (let j = 0; j < outTokens.length; j++) {
                    if (inTokens[i] !== outTokens[j]) {
                        ratiosAtMax[i][j] = values[i][j]
                    }
                }
            }
        })

        const amountToBuy: BigNumber[][] = this.calculateAmountToBuy(
            inTokens,
            outTokens,
            ratiosAtMax,
            outRatio,
            outRatioDecimals,
            inAmounts,
        )

        const fixedAmountToBuy: BigNumber[][] = this.fixAmountToBuy(
            inAmounts,
            amountToBuy,
        )

        const transaction: SwapDepositBagStruct = {
            tokensIn: inTokens,
            swapInfo: [],
            tokenOut: outTokens[0],
            receiver: userAddress,
        }

        const swapDataPromises: Promise<OneInchSwapRes>[][] = []
        for (let i = 0; i < inTokens.length; i++) {
            for (let j = 0; j < outTokens.length; j++) {
                if (inTokens[i] !== outTokens[j]) {
                    swapDataPromises[i][j] = this.getSwapData(
                        swapUrl,
                        inTokens[i],
                        outTokens[j],
                        ethers.utils.formatUnits(fixedAmountToBuy[i][j], 0).split('.')[0],
                        swapperAddress,
                        slippage
                    )
                }
            }
        }

        const promiseSwapData2D = Promise.all(
            swapDataPromises.map(function (innerPromiseArray) {
                return Promise.all(innerPromiseArray)
            }),
        )

        await promiseSwapData2D.then((values) => {
            for (let i = 0; i < inTokens.length; i++) {
                for (let j = 0; j < outTokens.length; j++) {
                    if (inTokens[i] !== outTokens[j]) {
                        const swapInfo: SwapInfoStruct = {
                            swapTarget: values[i][j].tx.to,
                            token: inTokens[i],
                            swapCallData: values[i][j].tx.data,
                        }
                        transaction.swapInfo.push(swapInfo)
                    }
                }
            }
        })
        return transaction
    }
}
