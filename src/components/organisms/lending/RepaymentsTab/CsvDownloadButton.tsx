'use client'

import { Button } from '@mui/material'
import { PoolRepayment } from '@solidant/kasu-sdk/src/services/DataService/types'

import useTranslation from '@/hooks/useTranslation'

type CsvDownloadButtonProps = {
  repayment: PoolRepayment
}

const CsvDownloadButton: React.FC<CsvDownloadButtonProps> = ({ repayment }) => {
  const { t } = useTranslation()

  return (
    <Button
      variant='contained'
      href={repayment.repaymentsFileUrl}
      sx={{ maxWidth: 368, mx: 'auto' }}
      fullWidth
    >
      {t('general.csvDownload')}
    </Button>
  )
}

export default CsvDownloadButton
