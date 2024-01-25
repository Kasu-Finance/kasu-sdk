import { createContext } from 'react'

import { ModalStateType } from '@/context/modal/modal.types'

const modalContext = createContext({} as ModalStateType)
modalContext.displayName = 'ModalContext'

export default modalContext
