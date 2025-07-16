'use client'

import { Button } from '@mui/material'
import { PoolRepayment } from '@solidant/kasu-sdk/src/services/DataService/types'

type CsvDownloadButtonProps = {
  repayment: PoolRepayment
}

const CsvDownloadButton: React.FC<CsvDownloadButtonProps> = ({ repayment }) => {
  return (
    <Button
      variant='contained'
      href={repayment.repaymentsFileUrl}
      sx={{ maxWidth: 368, mx: 'auto' }}
      fullWidth
    >
      Download Loan Tape
    </Button>
  )
}

export default CsvDownloadButton
