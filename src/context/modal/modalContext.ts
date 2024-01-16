import { createContext } from 'react'

import { ModalStateType } from './modalTypes'

const modalContext = createContext({} as ModalStateType)
modalContext.displayName = 'ModalContext'

export default modalContext
