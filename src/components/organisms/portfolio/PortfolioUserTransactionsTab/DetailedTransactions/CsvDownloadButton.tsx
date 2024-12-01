'use client'

import { Button } from '@mui/material'

import useModalState from '@/hooks/context/useModalState'
import useTransactionHistory from '@/hooks/lending/useTransactionHistory'
import getTranslation from '@/hooks/useTranslation'

import { ModalsKeys } from '@/context/modal/modal.types'

import { DownloadRoundedIcon } from '@/assets/icons'

const CsvDownloadButton = () => {
  const { t } = getTranslation()

  const { transactionHistory, isLoading } = useTransactionHistory()

  const { openModal } = useModalState()

  if (isLoading || !transactionHistory?.length) {
    return null
  }

  const handleOpen = () => openModal({ name: ModalsKeys.UNRELEASED_FEATURE })

  return (
    <Button
      variant='text'
      sx={{
        maxWidth: 368,
        ml: 'auto',
        textTransform: 'capitalize',
        height: 'auto',
      }}
      endIcon={<DownloadRoundedIcon />}
      onClick={handleOpen}
    >
      {t('general.csvDownload')}
    </Button>
  )
}

export default CsvDownloadButton
