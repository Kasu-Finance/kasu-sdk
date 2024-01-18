'use client'

import { Box, Button, Modal } from '@mui/material'
import { useState } from 'react'

import ModalBody from '@/components/atoms/ModalBody'
import DepositInput from '@/components/molecules/lockModal/DepositInput'
import EstimatedReturns from '@/components/molecules/lockModal/EstimatedReturns'
import LockDurationInput from '@/components/molecules/lockModal/LockDurationInput'
import LockModalOverview from '@/components/molecules/lockModal/LockModalOverview'
import ModalHeader from '@/components/molecules/ModalHeader'
import LockModalConfirmation from '@/components/organisms/modals/LockModal/LockModalConfirmation'

import LOCK_PERIODS from '@/config/lockPeriod'
import useModalState from '@/context/modal/useModalState'

const LockModal = () => {
  const { modal, closeModal } = useModalState()

  const [amount, setAmount] = useState('')
  const [duration, setDuration] = useState<number>(LOCK_PERIODS[2])
  const [isFinalized, setIsFinalized] = useState(false)

  const handleClose = () => {
    closeModal('lockModal')
  }

  return (
    <Modal
      open={modal['lockModal'].isOpen}
      onClose={handleClose}
      aria-labelledby='Connect Wallet Modal'
      aria-describedby='List of available web3 wallet connections'
    >
      <ModalBody>
        <ModalHeader title='Lock' onClose={handleClose} />
        {isFinalized ? (
          <LockModalConfirmation />
        ) : (
          <>
            <Box display='grid' gap={2}>
              <LockModalOverview />
              <DepositInput amount={amount} setAmount={setAmount} />
              <LockDurationInput
                duration={duration}
                setDuration={setDuration}
              />
              <EstimatedReturns />
            </Box>
            <Button
              variant='contained'
              sx={{ width: 157, display: 'block', mx: 'auto', mt: 2, mb: 1 }}
              onClick={() => setIsFinalized(true)}
            >
              APPROVE LOCK
            </Button>
          </>
        )}
      </ModalBody>
    </Modal>
  )
}

export default LockModal
