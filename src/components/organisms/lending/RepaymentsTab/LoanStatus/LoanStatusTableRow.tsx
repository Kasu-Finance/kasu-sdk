'use client'

import { Button, TableCell, TableRow } from '@mui/material'

import useModalState from '@/hooks/context/useModalState'
import getTranslation from '@/hooks/useTranslation'

import { LoanStatus } from '@/components/organisms/lending/RepaymentsTab/LoanStatus/LoanStatusTableBody'

import { ModalsKeys } from '@/context/modal/modal.types'

import { customTypography } from '@/themes/typography'
import { formatAmount } from '@/utils'

type LoanStatusTableRowProps = {
  metric: LoanStatus
}

const LoanStatusTableRow: React.FC<LoanStatusTableRowProps> = ({ metric }) => {
  const { t } = getTranslation()

  const { openModal } = useModalState()

  const handleOpen = () =>
    openModal({
      name: ModalsKeys.HISTORICAL_REPAYMENTS,
      historicalRepayments: metric.historicalRepayments,
    })

  return (
    <>
      <TableRow>
        <TableCell>{metric.borrower}</TableCell>
        <TableCell>
          {formatAmount(metric.currentLoanBalance, { minDecimals: 2 })}
        </TableCell>
        <TableCell>
          {formatAmount(metric.lifetimeFundingDrawdown, { minDecimals: 2 })}
        </TableCell>
        <TableCell>
          {formatAmount(metric.lifetimePrincipalRepayments, { minDecimals: 2 })}
        </TableCell>
        <TableCell>
          {formatAmount(metric.currentArrears, { minDecimals: 2 })}
        </TableCell>
        <TableCell>
          {formatAmount(metric.historialRealisedLosses, { minDecimals: 2 })}
        </TableCell>
        <TableCell>
          <Button
            variant='text'
            sx={{
              ...customTypography.baseSm,
              color: 'gold.dark',
              textTransform: 'capitalize',
              height: 21,
              position: 'relative',
            }}
            onClick={handleOpen}
          >
            {t('repayments.loanStatus.viewDetails')}
          </Button>
        </TableCell>
      </TableRow>
    </>
  )
}

export default LoanStatusTableRow
