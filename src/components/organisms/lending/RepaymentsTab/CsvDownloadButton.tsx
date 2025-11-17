'use client'

import { PoolRepayment } from '@kasufinance/kasu-sdk/src/services/DataService/types'
import { Button } from '@mui/material'

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
