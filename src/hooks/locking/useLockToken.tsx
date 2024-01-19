import useToastState from '@/context/toast/useToastState'
import { sleep } from '@/utils'

const useLockToken = () => {
  const { setToast } = useToastState()

  return async (amount: string, duration: string) => {
    try {
      setToast({
        type: 'info',
        title: 'Processing',
        message: 'Your transaction request is being processed...',
        isClosable: false,
      })

      await sleep(3000)

      const random = Math.random() * 2

      if (Math.floor(random)) {
        throw new Error(JSON.stringify({ amount, duration }))
      }

      setToast({
        type: 'success',
        title: 'Lock Successful',
        message: 'Lock request has been successfull.',
        txHash: 'https://www.google.com',
      })
    } catch (error) {
      setToast({
        type: 'error',
        title: 'Lock Error',
        message:
          'An error has occurred in the lock request. Please review log for more details.',
        txHash: 'https://www.google.com',
      })
    }
  }
}

export default useLockToken
