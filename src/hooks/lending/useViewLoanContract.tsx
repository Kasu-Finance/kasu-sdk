import { useChainId, useSignMessage } from 'wagmi'

import useToastState from '@/hooks/context/useToastState'
import useHandleError from '@/hooks/web3/useHandleError'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

import downloadLoanContract from '@/actions/downloadLoanContract'
import getLoanContracts from '@/actions/viewLoanContract'
import dayjs from '@/dayjs'
import { userRejectedTransaction } from '@/utils'

const useViewLoanContract = () => {
  const { address } = usePrivyAuthenticated()

  const chainId = useChainId()

  const { signMessage } = useSignMessage()

  const handleError = useHandleError()

  const { setToast, removeToast } = useToastState()

  return async (id: string) => {
    if (!address) {
      return console.error('View Loan Contract:: Account is undefiend')
    }
    if (!chainId) {
      return console.error('View Loan Contract:: ChainID is undefiend')
    }

    const now = dayjs().unix() * 1000

    try {
      setToast({
        type: 'info',
        title: 'Downloading Loan Contract...',
        message:
          'Please sign the transaction in your wallet to download the Loan Contract.',
        isClosable: false,
      })

      signMessage(
        {
          message: `Requesting contract content for ${address.toLowerCase()}/${id} at ${now}.`,
        },

        {
          onError: (error) => {
            throw new Error(error.message)
          },
          onSuccess: async (signature) => {
            if (!address) {
              return console.error('View Loan contract:: Account is undefiend')
            }

            setToast({
              type: 'info',
              title: 'Downloading Loan Contract...',
              message: 'Your Loan Contract is being downloaded.',
              isClosable: false,
            })

            const data = await getLoanContracts(
              {
                address: address.toLowerCase(),
                signature,
                timestamp: now,
                id,
              },
              chainId
            )

            if ('error' in data) {
              throw new Error(data.message)
            }

            const pdfBlob = await downloadLoanContract(
              data.contractMessage
                .replaceAll('\\n', '<br/>')
                .replaceAll('\\t', '&emsp;')
            )

            const blob = new Blob([pdfBlob], {
              type: 'application/octet-stream',
            })

            const fileURL = URL.createObjectURL(blob)

            const downloadLink = document.createElement('a')
            downloadLink.href = fileURL
            downloadLink.download = `loan-contract-${data.timestamp}.pdf`
            document.body.appendChild(downloadLink)
            downloadLink.click()

            URL.revokeObjectURL(fileURL)

            removeToast()
          },
        }
      )
    } catch (error) {
      if (userRejectedTransaction(error)) {
        handleError(
          error,
          'View Loan Contract Error',
          'Message signature request declined. Unable to view Loan Contract.',
          true
        )
      } else {
        handleError(error)
      }
    }
  }
}

export default useViewLoanContract
