import { PropsWithChildren, useReducer } from 'react'

import useFixApyModalActions from '@/context/fixApyModal/fixApyModal.actions'
import fixApyModalContext from '@/context/fixApyModal/fixApyModal.context'
import fixApyModalReducer from '@/context/fixApyModal/fixApyModal.reducer'
import { FixApyModalStateType } from '@/context/fixApyModal/fixApyModal.types'

const initialState: FixApyModalStateType = {
  amount: '',
  fixedTermConfigId: '',
  txHash: undefined,
}

const FixApyState: React.FC<PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = useReducer(fixApyModalReducer, initialState)

  const fixApyModalActions = useFixApyModalActions(dispatch)

  return (
    <fixApyModalContext.Provider value={{ ...state, ...fixApyModalActions }}>
      {children}
    </fixApyModalContext.Provider>
  )
}

export default FixApyState
