import { useWeb3React } from '@web3-react/core'

import useToastState from '@/hooks/context/useToastState'
import useHandleError from '@/hooks/web3/useHandleError'

import downloadLoanContract from '@/actions/downloadLoanContract'
import getLoanContracts from '@/actions/viewLoanContract'
import dayjs from '@/dayjs'
import { userRejectedTransaction } from '@/utils'

const useViewLoanContract = () => {
  const { account, chainId, provider } = useWeb3React()

  const handleError = useHandleError()

  const { setToast, removeToast } = useToastState()

  return async (id: string) => {
    if (!account) {
      return console.error('View Loan Contract:: Account is undefiend')
    }
    if (!chainId) {
      return console.error('View Loan Contract:: ChainID is undefiend')
    }
    if (!provider) {
      return console.error('View Loan Contract:: Provider is undefiend')
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

      const signature = await provider
        .getSigner()
        .signMessage(
          `Requesting contract content for ${account.toLowerCase()}/${id} at ${now}.`
        )

      setToast({
        type: 'info',
        title: 'Downloading Loan Contract...',
        message: 'Your Loan Contract is being downloaded.',
        isClosable: false,
      })

      const data = await getLoanContracts(
        {
          address: account.toLowerCase(),
          signature,
          timestamp: now,
          id,
        },
        chainId
      )

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
