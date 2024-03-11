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

  return (
    <Dialog
      open={modal[modalName].isOpen}
      PaperProps={{ sx: { width: 600 } }}
      onClose={handleClose}
      aria-labelledby={modalDetails.ariaLabel}
      aria-describedby={modalDetails.ariaDescription}
    >
      {modalDetails.component}
    </Dialog>
  )
}

export default DialogWrapper
