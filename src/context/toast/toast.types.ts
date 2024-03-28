import { AlertColor } from '@mui/material'

export type Toast = {
  type: AlertColor
  title: string
  message: string
  txHash?: string
  isClosable?: boolean
  onCloseCallback?: () => void
}

export type ToastActions =
  | {
      type: 'SET_TOAST'
      payload: Toast
    }
  | {
      type: 'REMOVE_TOAST'
    }

export type ToastStateType = {
  toast: Toast | null
}

export type ToastFunctions = {
  setToast: (toast: Omit<Toast, 'removeToast'>) => void
  removeToast: () => void
}

export type ToastTypes = ToastStateType & ToastFunctions
