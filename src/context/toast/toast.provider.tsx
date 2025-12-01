'use client'

import {
  Alert,
  AlertColor,
  AlertTitle,
  Box,
  Button,
  IconButton,
  LinearProgress,
  Snackbar,
} from '@mui/material'
import { ReactNode, useReducer } from 'react'

import useToastActions from '@/context/toast/toast.actions'
import ToastContext from '@/context/toast/toast.context'
import toastReducer from '@/context/toast/toast.reducer'
import { ToastActionsType, ToastStateType } from '@/context/toast/toast.types'

import {
  CloseRoundedIcon,
  ErrorIcon,
  InfoIcon,
  WarningIcon,
} from '@/assets/icons'
import SuccessIcon from '@/assets/icons/general/SuccessIcon'

type ToastStateProps = {
  children: ReactNode
}

const initialState: ToastStateType = {
  toast: null,
}

const getIcon = (type: AlertColor) => {
  switch (type) {
    case 'success':
      return <SuccessIcon />
    case 'info':
      return <InfoIcon />
    case 'warning':
      return <WarningIcon />
    case 'error':
      return <ErrorIcon />
  }
}

const ToastState: React.FC<ToastStateProps> = ({ children }) => {
  const [state, dispatch] = useReducer(toastReducer, initialState)

  const toastActions = useToastActions(dispatch)

  const handleClose = () => {
    state.toast?.onCloseCallback?.()

    dispatch({
      type: ToastActionsType.REMOVE_TOAST,
    })
  }

  return (
    <ToastContext.Provider value={{ ...state, ...toastActions }}>
      {children}
      {state.toast && (
        <Snackbar
          open
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          onClose={state.toast.isClosable ? handleClose : undefined}
          autoHideDuration={state.toast.isClosable ? 6000 : null}
          sx={{ zIndex: 1301 }}
        >
          <Alert
            severity={state.toast.type}
            sx={{
              minWidth: 320,
              maxWidth: 420,
              boxShadow: (theme) => theme.shadows[6],
              '& .MuiAlert-message': {
                width: '100%',
              },
            }}
            icon={false}
          >
            <Box display='flex' alignItems='center' gap={1} mb={1}>
              {getIcon(state.toast.type)}
              <AlertTitle
                variant='h4'
                color={state.toast.type === 'error' ? 'error.400' : 'gold.dark'}
                flex={1}
                my={0}
              >
                {state.toast.title || 'Title'}
              </AlertTitle>
              {state.toast.isClosable && (
                <IconButton
                  sx={{ width: 32, height: 32, p: 0.5 }}
                  className='close-button'
                  onClick={handleClose}
                >
                  <CloseRoundedIcon />
                </IconButton>
              )}
            </Box>
            {state.toast.message}
            {state.toast.action && (
              <Button
                variant='contained'
                onClick={state.toast.action.onClick}
                sx={{ mt: 2, width: '100%' }}
              >
                {state.toast.action.label}
              </Button>
            )}
            {state.toast.type === 'info' && <LinearProgress sx={{ mt: 2 }} />}
          </Alert>
        </Snackbar>
      )}
    </ToastContext.Provider>
  )
}

export default ToastState
