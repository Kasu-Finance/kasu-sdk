import { useChainId, useSignMessage } from 'wagmi'

import useToastState from '@/hooks/context/useToastState'
import useHandleError from '@/hooks/web3/useHandleError'

import { VerifyReferralRes } from '@/app/api/referral/route'

const useVerifyReferral = () => {
  const chainId = useChainId()

  const handleError = useHandleError()

  const { signMessage } = useSignMessage()

  const { setToast, removeToast } = useToastState()

  return async (userAddress: string, referralCode: string) => {
    try {
      const res = await fetch(
        `/api/referral?${new URLSearchParams({
          chainId: chainId.toString(),
          userAddress,
          referralCode,
        })}`
      )

      const data = await res.json()

      if ('error' in data) {
        throw new Error(data.message)
      }

      setToast({
        type: 'info',
        title: 'Verifying Referral...',
        message:
          'Please sign the transaction in your wallet to verify the referral.',
        isClosable: false,
      })

      signMessage(
        { message: data.message },

        {
          onError: (error) => {
            handleError(error)
          },
          onSuccess: async (signature) => {
            const verifyRes = await fetch(
              `/api/referral?${new URLSearchParams({
                chainId: chainId.toString(),
              })}`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  owner: referralCode.toLowerCase(),
                  signature,
                  refferer: userAddress.toLowerCase(),
                }),
              }
            )

            const verifyData: VerifyReferralRes = await verifyRes.json()

            if ('error' in verifyData) {
              if (verifyData.error === 'User has already deposited') {
                setToast({
                  type: 'error',
                  title: 'Unable to use referral code',
                  message:
                    'Only new users who have not deposited are eligible for the referral program.',
                })
                return
              }

              throw new Error(verifyData.message)
            }

            if (verifyData.isValid) {
              setToast({
                type: 'success',
                title: 'Referral Code Applied',
                message: `Your referral code from ${referralCode.toLowerCase()} has been applied succesfully.`,
              })
              return
            }

            removeToast()
          },
        }
      )
    } catch (error) {
      handleError(error)
    }
  }
}

export default useVerifyReferral
