import { Dispatch, useMemo } from 'react'

import {
  TranasctionDecisions,
  TransactionStatus,
  TransactionTranches,
  TransactionType,
} from '@/components/organisms/lending/OverviewTab/UserTransactions/TransactionFilters'

import {
  PoolIdFilters,
  TransactionHistoryActions,
  TransactionHistoryActionsTypes,
  TransactionHistoryFunctions,
} from '@/context/transactionHistory/transactionHistory.types'

import { ValueOf } from '@/types/utils'

const useTransactionHistoryActions = (
  dispatch: Dispatch<TransactionHistoryActions>
): TransactionHistoryFunctions =>
  useMemo(
    () => ({
      setStatus: (status: ValueOf<typeof TransactionStatus>) =>
        dispatch({
          type: TransactionHistoryActionsTypes.SET_STATUS,
          payload: status,
        }),
      setTrancheType: (trancheType: ValueOf<typeof TransactionTranches>) =>
        dispatch({
          type: TransactionHistoryActionsTypes.SET_TRANCHE_TYPE,
          payload: trancheType,
        }),
      setTransactionType: (tranasctionType: ValueOf<typeof TransactionType>) =>
        dispatch({
          type: TransactionHistoryActionsTypes.SET_TRANSACTION_TYPE,
          payload: tranasctionType,
        }),
      setTransactionDecisons: (
        decisions: ValueOf<typeof TranasctionDecisions>
      ) =>
        dispatch({
          type: TransactionHistoryActionsTypes.SET_PENDING_DECISIONS,
          payload: decisions,
        }),
      setPoolId: (poolId: PoolIdFilters) =>
        dispatch({
          type: TransactionHistoryActionsTypes.SET_POOL_ID,
          payload: poolId,
        }),
    }),
    [dispatch]
  )

export default useTransactionHistoryActions
