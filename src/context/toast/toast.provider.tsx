'use client'

import {
  Alert,
  AlertTitle,
  Button,
  LinearProgress,
  Modal,
  Typography,
} from '@mui/material'
import { ReactNode, useReducer } from 'react'

import ToastContext from '@/context/toast/toast.context'
import toastReducer from '@/context/toast/toast.reducer'
import { ToastStateType } from '@/context/toast/toast.types'

import { CrossIcon } from '@/assets/icons'
import SuccessIcon from '@/assets/icons/general/SuccessIcon'

import { SupportedChainIds } from '@/connection/chains'
import { networks } from '@/connection/networks'

type ToastStateProps = {
  children: ReactNode
}

const initialState: ToastStateType = {
  toast: null,
}

const ToastState: React.FC<ToastStateProps> = ({ children }) => {
  const [state, dispatch] = useReducer(toastReducer, initialState)

  const handleClose = () => {
    state.toast?.onCloseCallback?.()

    dispatch({
      type: 'REMOVE_TOAST',
    })
  }

  return (
    <ToastContext.Provider value={{ ...state, dispatch }}>
      {children}
      {state.toast && (
        <Modal
          open={true}
          onClose={state.toast.isClosable ? handleClose : undefined}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Alert
            severity={state.toast.type}
            sx={{
              '& .MuiAlert-message': {
                width: '100%',
              },
            }}
            iconMapping={{ success: <SuccessIcon /> }}
            action={
              state.toast.type === 'info' ? undefined : (
                <>
                  {state.toast.txHash && (
                    <Button
                      href={`${
                        networks[SupportedChainIds.BASE_SEPOLIA]
                          .blockExplorerUrls[0]
                      }/tx/${state.toast.txHash}`}
                      target='_blank'
                      sx={{
                        width: 57,
                        height: 30,
                        px: 0.5,
                        py: '5px',
                        mt: -0.1,
                      }}
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
                      onClick={handleClose}
                    >
                      <CrossIcon />
                    </Button>
                  )}
                </>
              )
            }
          >
            <AlertTitle>{state.toast.title || 'Title'}</AlertTitle>
            {state.toast.message}
            {state.toast.type === 'info' && <LinearProgress sx={{ mt: 2 }} />}
          </Alert>
        </Modal>
      )}
    </ToastContext.Provider>
  )
}

export default ToastState
