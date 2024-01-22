import { ErrorCode } from '@/constants'

const userRejectedTransaction = (error: any): boolean => {
  return error?.code === ErrorCode.USER_REJECTED_REQUEST
}

export default userRejectedTransaction
