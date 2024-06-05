import { createContext } from 'react'

import { ModalTypes } from '@/context/modal/modal.types'

const modalContext = createContext({} as ModalTypes)
modalContext.displayName = 'ModalContext'

export default modalContext
