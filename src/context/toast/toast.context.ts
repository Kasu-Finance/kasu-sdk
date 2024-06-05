import { createContext } from 'react'

import { ToastTypes } from '@/context/toast/toast.types'

const toastContext = createContext({} as ToastTypes)
toastContext.displayName = 'ToastContext'

export default toastContext
