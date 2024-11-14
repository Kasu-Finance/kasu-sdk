'use client'

import { Button } from '@mui/material'

import useModalState from '@/hooks/context/useModalState'
import getTranslation from '@/hooks/useTranslation'

import { ModalsKeys } from '@/context/modal/modal.types'

const LoanContractButton = () => {
  const { t } = getTranslation()

  const { openModal } = useModalState()

  const handleOpen = () =>
    openModal({ name: ModalsKeys.LOAN_CONTRACT, canAccept: false })

  return (
    <Button
      variant='text'
      sx={{
        p: 0,
        height: 'auto',
        textTransform: 'unset',
        font: 'inherit',
        verticalAlign: 'inherit',
        display: 'inline',
        color: 'gold.dark',
      }}
      onClick={handleOpen}
    >
      {t('modals.loanContract.title')}
    </Button>
  )
}

export default LoanContractButton
