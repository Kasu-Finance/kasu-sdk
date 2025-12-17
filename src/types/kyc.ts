export type CustomerStatus =
  | 'Active'
  | 'Rejected'
  | 'Dormant'
  | 'To be reviewed'
  | 'Failed'
  | 'Escalated'
  | 'Terminated'
  | 'No status'
  | 'No Email'

export type CheckKycRes = {
  type: 'Company' | 'Individual'
  status: CustomerStatus
  canRetry: boolean
  reason?: string | null
}
