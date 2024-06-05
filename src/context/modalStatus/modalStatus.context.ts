import { createContext } from 'react'

import { ModalStatusTypes } from '@/context/modalStatus/modalStatus.types'

const modalStatusContext = createContext({} as ModalStatusTypes)
modalStatusContext.displayName = 'ModalStatusContext'

export default modalStatusContext
