import { Box, Button, IconButton, TableCell, TableRow } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import DottedDivider from '@/components/atoms/DottedDivider'
import CustomTable from '@/components/molecules/CustomTable'
import DialogContent from '@/components/molecules/DialogContent'
import DialogHeader from '@/components/molecules/DialogHeader'

import { DownloadIcon } from '@/assets/icons'

import { formatAmount } from '@/utils'

const ViewLoanContractModal: React.FC<DialogChildProps> = ({ handleClose }) => {
  const { t } = getTranslation()
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
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
          }}
          tableBodySx={{
            background: 'url("/images/wave-gold.png") repeat',
            '& .MuiTableRow-root:first-child .MuiTableCell-root': {
              pb: 2,
            },
          }}
          tableHeader={
            <TableRow>
              <TableCell width='35%'>Contract Signing Date</TableCell>
              <TableCell width='25%'>Loan Amount</TableCell>
              <TableCell width='25%'>Accepted</TableCell>
              <TableCell width='15%'>Download</TableCell>
            </TableRow>
          }
          tableBody={
            <>
              <TableRow
                sx={{
                  '.MuiTableCell-root': {
                    pt: 0,
                  },
                }}
              >
                <TableCell>12.12.2024</TableCell>
                <TableCell>
                  {formatAmount(10_000, { minDecimals: 2 })}USDC
                </TableCell>
                <TableCell>
                  {formatAmount(10_000, { minDecimals: 2 })} USDC
                </TableCell>
                <TableCell>
                  <IconButton
                    sx={{
                      'svg path': {
                        fill: 'white',
                      },
                    }}
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
            </>
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
