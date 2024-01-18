import { Dialog } from '@mui/material'

import { getModal } from '@/components/organisms/modals/ModalsContainer'

import { Modals } from '@/context/modal/modalTypes'
import useModalState from '@/context/modal/useModalState'

const DialogWrapper: React.FC<{
  modalName: keyof Modals
}> = ({ modalName }) => {
  const { modal, closeModal } = useModalState()

  const modalDetails = getModal(modalName)

  if (!modalDetails) return

  return (
    <Dialog
      open={modal[modalName].isOpen}
      PaperProps={{ sx: { width: 600 } }}
      onClose={() => closeModal(modalName)}
      aria-labelledby={modalDetails.ariaLabel}
      aria-describedby={modalDetails.ariaDescription}
    >
      {modalDetails.component}
    </Dialog>
  )
}

export default DialogWrapper
