import useToastState from '@/hooks/context/useToastState'

import { ACTION_MESSAGES, ActionStatus, ActionType } from '@/constants'
import { sleep } from '@/utils'

const useLockToken = () => {
  const { setToast } = useToastState()

  return async (amount: string, duration: string) => {
    try {
      setToast({
        type: 'info',
        title: ActionStatus.PROCESSING,
        message: ACTION_MESSAGES[ActionStatus.PROCESSING],
        isClosable: false,
      })

      await sleep(3000)

      const random = Math.random() * 2

      if (Math.floor(random)) {
        throw new Error(JSON.stringify({ amount, duration }))
      }

      setToast({
        type: 'success',
        title: `${ActionType.LOCK} ${ActionStatus.SUCCESS}`,
        message: ACTION_MESSAGES[ActionType.LOCK][ActionStatus.SUCCESS],
        txHash: 'https://www.google.com',
      })
    } catch (error) {
      setToast({
        type: 'error',
        title: `${ActionType.LOCK} ${ActionStatus.ERROR}`,
        message: ACTION_MESSAGES[ActionType.LOCK][ActionStatus.ERROR],
        txHash: 'https://www.google.com',
      })
    }
  }
}

export default useLockToken
