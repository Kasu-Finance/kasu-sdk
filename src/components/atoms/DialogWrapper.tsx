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
  const backdropSx = modalDetails.backdropSx

  return (
    <Dialog
      open={modal[modalName].isOpen}
      PaperProps={{
        elevation: modalDetails.disableElevation ? 0 : 24,
        sx: [
          {
            background: 'transparent',
            position: 'unset',
            overflow: 'auto',
            width: { xs: 'calc(100% - 32px)', sm: 600 },
            maxHeight: { xs: 'calc(100% - 32px)', sm: 'calc(100% - 200px)' }, // accodomate for floating cat
            marginTop: { xs: 0, sm: '88px' }, // accodomate for floating cat
            ...(modal[modalName].isFullscreen && {
              width: '100%',
              maxWidth: '100%',
              margin: 0,
              maxHeight: 'calc(100% - 95px)',
              alignSelf: 'end',
              height: '100%',
            }),
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ],
      }}
      onClose={modalDetails.disableBackdropClose ? undefined : handleClose}
      disableEscapeKeyDown={modalDetails.disableEscapeKeyDown}
      disableEnforceFocus
      aria-labelledby={modalDetails.ariaLabel}
      aria-describedby={modalDetails.ariaDescription}
      slotProps={{
        backdrop: {
          sx: [
            {
              background: 'rgba(0, 0, 0, 0.8)',
            },
            ...(Array.isArray(backdropSx) ? backdropSx : [backdropSx]),
          ],
        },
      }}
    >
      {modalDetails.component}
    </Dialog>
  )
}

export default DialogWrapper
