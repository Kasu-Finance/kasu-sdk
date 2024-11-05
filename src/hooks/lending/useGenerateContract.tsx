import { useWeb3React } from '@web3-react/core'
import { useState } from 'react'

import useToastState from '@/hooks/context/useToastState'
import useHandleError from '@/hooks/web3/useHandleError'

import { FundingConsentGenerateContractRes } from '@/app/api/lender-agreements/route'
import dayjs from '@/dayjs'
import { userRejectedTransaction } from '@/utils'

const initialGeneratedContractState = {
  status: false,
  contractMessage: '',
  createdAt: 0,
  fullName: '',
}

const useGenerateContract = () => {
  const { account, chainId, provider } = useWeb3React()

  const { setToast, removeToast } = useToastState()

  const handleError = useHandleError()

  const [generatedContract, setGeneratedContract] = useState(
    initialGeneratedContractState
  )

  return {
    generatedContract,
    resetGeneratedContract: () =>
      setGeneratedContract(initialGeneratedContractState),
    generateContract: async () => {
      if (!account) {
        return console.error('Generate contract:: Account is undefiend')
      }
      if (!chainId) {
        return console.error('Generate contract:: ChainID is undefiend')
      }
      if (!provider) {
        return console.error('Generate contract:: Provider is undefiend')
      }

      const now = dayjs().unix() * 1000

      try {
        setToast({
          type: 'info',
          title: 'Generating Contract...',
          message:
            'Please sign the transaction in your wallet to generate the Lending Contract.',
          isClosable: false,
        })

        const signature = await provider
          .getSigner()
          .signMessage(
            `I request contract content for ${account.toLowerCase()} at ${now}.`
          )

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
              address: account.toLowerCase(),
              signature,
              timestamp: now,
            }),
          }
        )

        if (res.status !== 200) {
          throw new Error('Failed to retrieve fullname')
        }

        const data: FundingConsentGenerateContractRes = await res.json()

        setGeneratedContract({
          createdAt: now,
          status: true,
          contractMessage: data.contractMessage,
          fullName: data.fullName,
        })

        removeToast()
      } catch (error) {
        if (userRejectedTransaction(error)) {
          handleError(
            error,
            'Generate Contract Error',
            'Message signature request declined. Unable to generate Loan Contract.',
            true
          )
        } else {
          handleError(error)
        }
      }
    },
  }
}

export default useGenerateContract
