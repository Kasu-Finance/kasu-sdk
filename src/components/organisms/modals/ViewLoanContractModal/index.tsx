import {
  Box,
  Button,
  IconButton,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material'
import { Fragment } from 'react'

import useModalState from '@/hooks/context/useModalState'
import useViewLoanContract from '@/hooks/lending/useViewLoanContract'
import getTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import DottedDivider from '@/components/atoms/DottedDivider'
import CustomTable from '@/components/molecules/CustomTable'
import DialogContent from '@/components/molecules/DialogContent'
import DialogHeader from '@/components/molecules/DialogHeader'

import { ModalsKeys } from '@/context/modal/modal.types'

import { DownloadIcon } from '@/assets/icons'

import { formatAmount, formatTimestamp } from '@/utils'

const ViewLoanContractModal: React.FC<DialogChildProps> = ({ handleClose }) => {
  const { t } = getTranslation()

  const { modal } = useModalState()

  const { depositDetails } = modal[ModalsKeys.VIEW_LOAN_CONTRACTS]

  const viewLoanContract = useViewLoanContract()

  return (
    <CustomCard>
      <DialogHeader title='Loan Contract(s)' onClose={handleClose} />
      <DialogContent p={0}>
        <CustomTable
          sx={{
            pb: 0,
          }}
          tableSx={{
            background: 'url("/images/wave-dark-gold.png") repeat',
            backgroundSize: '17px 16px',
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
          }}
          tableBodySx={{
            background: 'url("/images/wave-gold.png") repeat',
            backgroundSize: '17px 16px',
            '& .MuiTableRow-root:first-child .MuiTableCell-root': {
              pb: 2,
            },
          }}
          tableHeader={
            <TableRow>
              <TableCell width='30%'>Contract Signing Date</TableCell>
              <TableCell width='25%'>Loan Amount</TableCell>
              <TableCell width='25%'>Accepted</TableCell>
              <TableCell width='20%'>Download</TableCell>
            </TableRow>
          }
          tableBody={
            depositDetails.length ? (
              depositDetails.map((deposit) => (
                <Fragment key={deposit.depositAmount}>
                  <TableRow
                    sx={{
                      '.MuiTableCell-root': {
                        pt: 0,
                      },
                    }}
                  >
                    <TableCell>
                      {
                        formatTimestamp(deposit.timestamp, {
                          format: 'DD.MM.YYYY',
                        }).date
                      }
                    </TableCell>
                    <TableCell>
                      {formatAmount(deposit.depositAmount, { minDecimals: 2 })}
                      USDC
                    </TableCell>
                    <TableCell>
                      {formatAmount(deposit.acceptedAmount, { minDecimals: 2 })}{' '}
                      USDC
                    </TableCell>
                    <TableCell>
                      <IconButton
                        sx={{
                          'svg path': {
                            fill: 'white',
                          },
                        }}
                        onClick={() => viewLoanContract(deposit.id)}
                      >
                        <DownloadIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={4} sx={{ pt: 0 }}>
                      <DottedDivider color='white' />
                    </TableCell>
                  </TableRow>
                </Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align='center'>
                  <Typography variant='baseMdBold'>
                    You don't have any signed Loan Contracts yet
                  </Typography>
                </TableCell>
              </TableRow>
            )
          }
        />
        <Box p={2} mb={1}>
          <Button
            variant='contained'
            color='secondary'
            fullWidth
            sx={{ textTransform: 'capitalize' }}
            onClick={handleClose}
          >
            {t('general.close')}
          </Button>
        </Box>
      </DialogContent>
    </CustomCard>
  )
}

export default ViewLoanContractModal
