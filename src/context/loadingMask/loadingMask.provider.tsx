'use client'

import { Backdrop, Box, CircularProgress, Typography } from '@mui/material'
import { ReactNode, useReducer } from 'react'

import getTranslation from '@/hooks/useTranslation'

import LoadingMaskContext from '@/context/loadingMask/loadingMask.context'
import loadingMaskReducer from '@/context/loadingMask/loadingMask.reducer'
import { LoadingMaskState } from '@/context/loadingMask/loadingMask.types'

type LoadingMaskStateProps = {
  children: ReactNode
}

const initialState: LoadingMaskState = {
  isOpen: false,
  message: undefined,
}

const LoadingMaskStateProvider: React.FC<LoadingMaskStateProps> = ({
  children,
}) => {
  const { t } = getTranslation()

  const [state, dispatch] = useReducer(loadingMaskReducer, initialState)

  const showLoadingMask = (message?: string) =>
    dispatch({ type: 'SHOW', message })
  const hideLoadingMask = () => dispatch({ type: 'HIDE' })

  return (
    <LoadingMaskContext.Provider
      value={{
        ...state,
        showLoadingMask,
        hideLoadingMask,
      }}
    >
      {children}
      <Backdrop
        open={state.isOpen}
        sx={{
          zIndex: 2000,
          color: '#fff',
          backgroundColor: 'rgba(0, 0, 0, 0.55)',
        }}
      >
        <Box display='flex' flexDirection='column' alignItems='center' gap={2}>
          <CircularProgress color='inherit' />
          <Typography variant='baseMd'>
            {state.message || t('general.preparingCsv')}
          </Typography>
        </Box>
      </Backdrop>
    </LoadingMaskContext.Provider>
  )
}

export default LoadingMaskStateProvider
