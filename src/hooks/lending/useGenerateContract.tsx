import { useState } from 'react'
import { useChainId } from 'wagmi'

import useToastState from '@/hooks/context/useToastState'
import useHandleError from '@/hooks/web3/useHandleError'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'
import usePrivySignMessage from '@/hooks/web3/usePrivySignMessage'

import {
  ExemptLoanContract,
  RetailLoanContract,
} from '@/components/organisms/modals/LoanContractModal/contract.type'

import { FundingConsentGenerateContractRes } from '@/app/api/lender-agreements/route'
import dayjs from '@/dayjs'
import { userRejectedTransaction } from '@/utils'

const initialGeneratedContractState = {
  status: false,
  contractMessage: '',
  formattedMessage: {} as ExemptLoanContract | RetailLoanContract,
  contractVersion: 0,
  contractType: '' as 'retail' | 'exempt',
  createdAt: 0,
  fullName: '',
}

type GeneratedContractState = typeof initialGeneratedContractState

type GenerateContractResult =
  | { status: 'success'; contract: GeneratedContractState }
  | { status: 'cancelled' | 'error'; contract: null }

const useGenerateContract = () => {
  const { address } = usePrivyAuthenticated()

  const chainId = useChainId()

  const { signMessage } = usePrivySignMessage()

  const { setToast, removeToast } = useToastState()

  const handleError = useHandleError()

  const [generatedContract, setGeneratedContract] = useState(
    initialGeneratedContractState
  )

  return {
    generatedContract,
    resetGeneratedContract: () =>
      setGeneratedContract(initialGeneratedContractState),
    generateContract: async (
      amount: string,
      options?: {
        suppressToast?: boolean
        onStatus?: (status: 'signing' | 'generating') => void
      }
    ): Promise<GenerateContractResult> => {
      const shouldToast = !options?.suppressToast

      if (!address) {
        console.error('Generate contract:: Account is undefiend')
        return { status: 'error', contract: null }
      }

      if (!chainId) {
        console.error('Generate contract:: ChainID is undefiend')
        return { status: 'error', contract: null }
      }

      const now = dayjs().unix() * 1000

      try {
        if (shouldToast) {
          setToast({
            type: 'info',
            title: 'Generating Loan Contract...',
            message:
              'Please sign the transaction in your wallet to generate the Loan Contract.',
            isClosable: false,
          })
        }

        return await new Promise<GenerateContractResult>((resolve) => {
          options?.onStatus?.('signing')

          const handleReject = (error: unknown) => {
            if (userRejectedTransaction(error)) {
              if (shouldToast) {
                handleError(
                  error,
                  'Generate Loan Contract Error',
                  'Message signature request declined. Unable to generate Loan Contract.',
                  true
                )
              }
              resolve({ status: 'cancelled', contract: null })
              return
            }

            if (shouldToast) {
              handleError(error)
            } else {
              console.error(error)
            }

            resolve({ status: 'error', contract: null })
          }

          signMessage(
            {
              message: `I request contract content for ${address.toLowerCase()} at ${now}.`,
            },
            {
              onSuccess: async (signature) => {
                if (!address) {
                  console.error('Generate contract:: Account is undefiend')
                  resolve({ status: 'error', contract: null })
                  return
                }

                try {
                  options?.onStatus?.('generating')

                  const res = await fetch(
                    '/api/lender-agreements?' +
                      new URLSearchParams({
                        chainId: chainId.toString(),
                      }),
                    {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        address: address.toLowerCase(),
                        signature,
                        timestamp: now,
                        depositAmount: parseFloat(amount),
                      }),
                    }
                  )

                  if (res.status !== 200) {
                    throw new Error('Failed to retrieve fullname')
                  }

                  const data: FundingConsentGenerateContractRes =
                    await res.json()

                  if ('error' in data) {
                    throw new Error(data.message)
                  }

                  const nextGeneratedContract = {
                    createdAt: now,
                    status: true,
                    contractMessage: data.contractMessage
                      .replaceAll('\\n', '\n')
                      .replaceAll('\\t', '\t'),
                    fullName: data.fullName,
                    contractType: data.contractType,
                    contractVersion: data.contractVersion,
                    formattedMessage: JSON.parse(data.formattedMessage),
                  }

                  setGeneratedContract(nextGeneratedContract)
                  if (shouldToast) {
                    removeToast()
                  }
                  resolve({
                    status: 'success',
                    contract: nextGeneratedContract,
                  })
                } catch (error) {
                  handleReject(error)
                }
              },
              onError: (error) => {
                handleReject(error)
              },
            }
          )
        })
      } catch (error) {
        if (shouldToast) {
          handleError(error)
        } else {
          console.error(error)
        }
        return { status: 'error', contract: null }
      }
    },
  }
}

export default useGenerateContract
