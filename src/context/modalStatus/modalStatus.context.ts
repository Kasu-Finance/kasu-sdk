import { createContext } from 'react'

import {
  ModalStatusActions,
  ModalStatusStateType,
} from '@/context/modalStatus/modalStatus.types'

import { ContextWrapper } from '@/types/utils'

const modalStatusContext = createContext(
  {} as ContextWrapper<ModalStatusStateType, ModalStatusActions>
)
modalStatusContext.displayName = 'ModalStatusContext'

export default modalStatusContext
