import { createContext } from 'react'

import { BuyKasuModalTypes } from '@/context/buyKasuModal/buyKasuModal.types'

const buyKasuModalContext = createContext({} as BuyKasuModalTypes)
buyKasuModalContext.displayName = 'buyKasuModalContext'

export default buyKasuModalContext
