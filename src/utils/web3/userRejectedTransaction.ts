import { ErrorCode } from '@/constants'

const userRejectedTransaction = (error: any): boolean => {
  return (
    error?.code === ErrorCode.USER_REJECTED_REQUEST ||
    // ethers v5.7.0 introduced
    error?.code === 'ACTION_REJECTED'
  )
}

export default userRejectedTransaction
