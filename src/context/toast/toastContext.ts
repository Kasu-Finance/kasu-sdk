import { createContext } from 'react'

import { ToastActions, ToastStateType } from '@/context/toast/toastTypes'

import { ContextWrapper } from '@/types/utils'

const toastContext = createContext(
  {} as ContextWrapper<ToastStateType, ToastActions>
)
toastContext.displayName = 'ToastContext'

export default toastContext
