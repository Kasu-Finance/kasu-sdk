import { SupportedChainIds } from '@/connection/chains'

export enum LoanTicketStatus {
  optedOut = 'optedOut',
  optedIn = 'optedIn',
  emailSent = 'emailSent',
  created = 'created',
  valueChanged = 'valueChanged',
}

export type Paginated<T> = {
  items: T[]
  offset?: number
  limit?: number
}

export type LoanTicketDtoRaw = {
  id: string
  endBorrowerID: string
  poolID: `0x${string}`
  trancheID: `0x${string}`
  userID: `0x${string}`
  assets: string
  shares: string
  depositRequestID: string
  status: LoanTicketStatus
  statusDescription: string
  createdOn: string
  epochID: string
}

export type LoanTicketDto = LoanTicketDtoRaw & {
  dailyGroupID: string
}

export type LoanTicketRes = Paginated<LoanTicketDto>

export const LENDERS_AGREEMENT_API = 'https://allocations.api.kasu.finance'

export const LENDERS_AGREEMENT_CHAIN_ID_MAP: Record<SupportedChainIds, string> =
  {
    [SupportedChainIds.BASE]: '8453X',
    [SupportedChainIds.BASE_SEPOLIA]: '84532Y',
  }
