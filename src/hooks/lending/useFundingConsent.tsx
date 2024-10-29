import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'
import { useWeb3React } from '@web3-react/core'

import useModalState from '@/hooks/context/useModalState'
import useToastState from '@/hooks/context/useToastState'
import useLoanTickets from '@/hooks/lending/useLoanTickets'
import useHandleError from '@/hooks/web3/useHandleError'

import { ModalsKeys } from '@/context/modal/modal.types'

import {
  FundingConsentPayload,
  FundingConsentReturn,
} from '@/app/api/loan-tickets/route'
import { ACTION_MESSAGES, ActionStatus, ActionType } from '@/constants'
import dayjs from '@/dayjs'
import { capitalize, getPendingDecisions } from '@/utils'

const useFundingConsent = () => {
  const { account, chainId, provider } = useWeb3React()

  const handleError = useHandleError()

  const { openModal } = useModalState()

  const { setToast, removeToast } = useToastState()

  const { updateLoanTickets } = useLoanTickets()

  return async (
    payload: FundingConsentPayload['payload'],
    pools: PoolOverview[],
    callback: () => void
  ) => {
    if (!account) {
      return console.error('FundingConsent:: Account is undefined')
    }

    if (!chainId) {
      return console.error('FundingConsent:: ChainId is undefined')
    }

    if (!provider) {
      return console.error('FundingConsent:: Provider is undefined')
    }

    try {
      setToast({
        type: 'info',
        title: capitalize(ActionStatus.PROCESSING),
        message:
          ACTION_MESSAGES[ActionType.FUNDING_CONSENT][ActionStatus.SIGNING],
        isClosable: false,
      })

      let signature: string

      const signatureTimestamp = dayjs().unix() * 1000

      try {
        signature = await provider
          .getSigner()
          .signMessage(
            `I would like to record the following opt-in/out requests: ${JSON.stringify([payload])}, ${signatureTimestamp}`
          )
      } catch (error) {
        handleError(
          error,
          capitalize(ActionStatus.REJECTED),
          'Message signature request declined.',
          true
        )
        return
      }

      setToast({
        type: 'info',
        title: capitalize(ActionStatus.PROCESSING),
        message:
          ACTION_MESSAGES[ActionType.FUNDING_CONSENT][ActionStatus.PROCESSING],
        isClosable: false,
      })

      const res = await fetch(
        '/api/loan-tickets?' +
          new URLSearchParams({
            chainId: chainId.toString(),
          }),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userID: account.toLowerCase(),
            payload,
            signature,
            signatureTimestamp,
          }),
        }
      )

      const data: FundingConsentReturn = await res.json()

      if ('statusCode' in data) {
        throw new Error(data.message)
      }
      const loanTickets = await updateLoanTickets(
        (prevData) => [...(prevData || []), ...data],
        {
          revalidate: false,
        }
      )

      if (loanTickets) {
        openModal({
          name: ModalsKeys.PENDING_DECISIONS,
          pendingDecisions: getPendingDecisions(loanTickets, pools)
            .pendingDecisions,
          pools: pools,
        })
      }

      removeToast()

      callback()
    } catch (error) {
      handleError(error)
    }
  }
}

export default useFundingConsent
