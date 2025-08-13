import { useState } from 'react'
import { useAccount, useChainId, useSignMessage } from 'wagmi'

import useToastState from '@/hooks/context/useToastState'
import useHandleError from '@/hooks/web3/useHandleError'

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

const useGenerateContract = () => {
  const account = useAccount()

  const chainId = useChainId()

  const { signMessage } = useSignMessage()

  const { setToast, removeToast } = useToastState()

  const handleError = useHandleError()

  const [generatedContract, setGeneratedContract] = useState(
    initialGeneratedContractState
  )

  return {
    generatedContract,
    resetGeneratedContract: () =>
      setGeneratedContract(initialGeneratedContractState),
    generateContract: async (amount: string) => {
      if (!account.address) {
        return console.error('Generate contract:: Account is undefiend')
      }

      if (!chainId) {
        return console.error('Generate contract:: ChainID is undefiend')
      }

      const now = dayjs().unix() * 1000

      try {
        setToast({
          type: 'info',
          title: 'Generating Loan Contract...',
          message:
            'Please sign the transaction in your wallet to generate the Loan Contract.',
          isClosable: false,
        })

        signMessage(
          {
            message: `I request contract content for ${account.address.toLowerCase()} at ${now}.`,
          },
          {
            onSuccess: async (signature) => {
              if (!account.address) {
                return console.error('Generate contract:: Account is undefiend')
              }

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
                    address: account.address.toLowerCase(),
                    signature,
                    timestamp: now,
                    depositAmount: parseFloat(amount),
                  }),
                }
              )

              if (res.status !== 200) {
                throw new Error('Failed to retrieve fullname')
              }

              const data: FundingConsentGenerateContractRes = await res.json()

              if ('error' in data) {
                throw new Error(data.message)
              }

              setGeneratedContract({
                createdAt: now,
                status: true,
                contractMessage: data.contractMessage
                  .replaceAll('\\n', '\n')
                  .replaceAll('\\t', '\t'),
                fullName: data.fullName,
                contractType: data.contractType,
                contractVersion: data.contractVersion,
                formattedMessage: JSON.parse(data.formattedMessage),
              })

              removeToast()
            },
            onError: (error) => {
              if (userRejectedTransaction(error)) {
                handleError(
                  error,
                  'Generate Loan Contract Error',
                  'Message signature request declined. Unable to generate Loan Contract.',
                  true
                )
              } else {
                handleError(error)
              }
            },
          }
        )
      } catch (error) {
        handleError(error)
      }
    },
  }
}

export default useGenerateContract
