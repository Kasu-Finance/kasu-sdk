'use client'

import { Button, Typography } from '@mui/material'

import useModalState from '@/hooks/context/useModalState'
import getTranslation from '@/hooks/useTranslation'

import { ModalsKeys } from '@/context/modal/modal.types'

import { DownloadRoundedIcon } from '@/assets/icons'

const CsvDownloadButton = () => {
  const { t } = getTranslation()

  const { openModal } = useModalState()

  const handleOpen = () => openModal({ name: ModalsKeys.UNRELEASED_FEATURE })

  return (
    <Button
      variant='text'
      endIcon={<DownloadRoundedIcon />}
      sx={{ textTransform: 'unset' }}
      onClick={handleOpen}
    >
      <Typography
        variant='inherit'
        sx={{ '&::first-letter': { textTransform: 'capitalize' } }}
        display='block'
      >
        {t('general.csvDownload')}
      </Typography>
    </Button>
  )
}

export default CsvDownloadButton
