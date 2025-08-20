import { useContext } from 'react'

import buyKasuModalContext from '@/context/buyKasuModal/buyKasuModal.context'
import { BuyKasuModalTypes } from '@/context/buyKasuModal/buyKasuModal.types'

const useBuyKasuModalState = (): BuyKasuModalTypes => {
  const context = useContext(buyKasuModalContext)

  if (!Object.keys(context).length) {
    throw new Error('BuyKasuModalContext must be used within its provider')
  }

  return context
}

export default useBuyKasuModalState
