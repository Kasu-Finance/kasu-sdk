import { Dialog } from '@mui/material'

import useModalState from '@/hooks/context/useModalState'

import { getModal } from '@/components/organisms/modals/ModalsContainer'

import { Modals } from '@/context/modal/modal.types'

// this component is used to separate dialog and child component
// if not separated, theres an unmounting issue which causes state
// within the same component to persist after closing the modal
export type DialogChildProps = {
  handleClose: () => void
}

const DialogWrapper: React.FC<{
  modalName: keyof Modals
}> = ({ modalName }) => {
  const { modal, closeModal } = useModalState()

  const handleClose = () => closeModal(modalName)

  const modalDetails = getModal(modalName, handleClose)

  if (!modalDetails || !modal[modalName].isOpen) return

  const sx = modalDetails.sx

  return (
    <Dialog
      open={modal[modalName].isOpen}
      PaperProps={{
        sx: [
          {
            background: 'transparent',
            position: 'unset',
            overflow: 'auto',
            width: 600,
            maxHeight: 'calc(100% - 200px)', // accodomate for floating cat
            marginTop: '88px', // accodomate for floating cat
            ...(modalDetails.fullscreen && {
              margin: 0,
              maxHeight: '100%',
              height: '100%',
            }),
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ],
      }}
      onClose={handleClose}
      disableEnforceFocus
      aria-labelledby={modalDetails.ariaLabel}
      aria-describedby={modalDetails.ariaDescription}
      slotProps={{
        backdrop: {
          sx: {
            background: 'rgba(0, 0, 0, 0.8)',
          },
        },
      }}
    >
      {modalDetails.component}
    </Dialog>
  )
}

export default DialogWrapper
