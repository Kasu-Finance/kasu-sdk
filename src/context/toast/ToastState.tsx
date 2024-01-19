'use client'

import { Alert, AlertTitle, Button, Modal, Typography } from '@mui/material'
import { ReactNode, useReducer } from 'react'

import { CrossIcon } from '@/assets/icons'
import SuccessIcon from '@/assets/icons/general/SuccessIcon'

import ToastContext from '@/context/toast/toastContext'
import toastReducer from '@/context/toast/toastReducer'
import { ToastStateType } from '@/context/toast/toastTypes'

type ToastStateProps = {
  children: ReactNode
}

const initialState: ToastStateType = {
  toast: null,
}

const ToastState: React.FC<ToastStateProps> = ({ children }) => {
  const [state, dispatch] = useReducer(toastReducer, initialState)

  return (
    <ToastContext.Provider value={{ ...state, dispatch }}>
      {children}
      {state.toast && (
        <Modal
          open={true}
          onClose={() => {}}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Alert
            severity={state.toast.type}
            iconMapping={{ success: <SuccessIcon /> }}
            action={
              <>
                {state.toast.txHash && (
                  <Button
                    href={state.toast.txHash}
                    target='_blank'
                    sx={{ width: 57, height: 30, px: 0.5, py: '5px', mt: -0.1 }}
                  >
                    <Typography variant='button' component='span'>
                      TX LOG
                    </Typography>
                  </Button>
                )}
                {state.toast.isClosable && (
                  <Button
                    sx={{ width: 28, height: 28, p: 0.5 }}
                    className='close-button'
                    onClick={() => dispatch({ type: 'REMOVE_TOAST' })}
                  >
                    <CrossIcon />
                  </Button>
                )}
              </>
            }
          >
            <AlertTitle>{state.toast.title || 'Title'}</AlertTitle>
            {state.toast.message}
          </Alert>
        </Modal>
      )}
    </ToastContext.Provider>
  )
}

export default ToastState
