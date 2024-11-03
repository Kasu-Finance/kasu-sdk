import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from '@mui/material'
import { Fragment } from 'react'

import useModalState from '@/hooks/context/useModalState'
import useTranslation from '@/hooks/useTranslation'

import Countdown from '@/components/atoms/Countdown'
import DottedDivider from '@/components/atoms/DottedDivider'

import { ModalsKeys } from '@/context/modal/modal.types'

import { OptInOutIcon } from '@/assets/icons'

import { LoanTicketDto, LoanTicketStatus } from '@/config/api.lendersAgreement'
import dayjs from '@/dayjs'
import { customTypography } from '@/themes/typography'
import {
  formatAmount,
  formatTimestamp,
  LoanTicket,
  mapLoanTicketsTranche,
} from '@/utils'
import { DetailedTransaction } from '@/utils/lending/getDetailedTransactions'
import getPendingDecisions from '@/utils/lending/getPendingDecisions'
import getSubsequentTransactions from '@/utils/lending/getSubsequentTransactions'

type SubsequentTransactionsProps = {
  transaction: DetailedTransaction
  poolName: string
}

const SubsequentTransactions: React.FC<SubsequentTransactionsProps> = ({
  transaction,
  poolName,
}) => {
  const { t } = useTranslation()

  const { openModal } = useModalState()

  const handleOpen = (loanTicket: LoanTicket) =>
    openModal({
      name: ModalsKeys.BORROWER_IDENTIFIED,
      loanTicket,
      poolName,
      callback: (newLoanTickets: LoanTicketDto[]) => {
        const trancheMap = mapLoanTicketsTranche(newLoanTickets)

        const loanTicketGroups = trancheMap.get(
          transaction.trancheId.toLowerCase()
        )

        if (!loanTicketGroups) return

        const newTransaction = {
          ...transaction,
        }

        const { loanTickets } = getPendingDecisions(loanTicketGroups)

        newTransaction.pendingDecisions = loanTickets

        const subsequentTransactions =
          getSubsequentTransactions(loanTicketGroups)

        newTransaction.subsequentTransactions = [
          ...subsequentTransactions,
          ...loanTickets, // add pending decisions to last
        ].sort((a, b) => a.createdOn - b.createdOn)

        openModal({
          name: ModalsKeys.REQUEST_DETAILS,
          detailedTransaction: newTransaction,
        })
      },
    })

  if (!transaction.subsequentTransactions.length) return null

  return (
    <>
      <Typography variant='h4'>
        {t('modals.requestDetails.subtitle')}
      </Typography>
      <Box>
        <TableContainer sx={{ border: 'none' }}>
          <Table>
            <TableBody
              sx={{
                '.MuiTableCell-root': {
                  px: 0,
                  border: 'none',
                },
              }}
            >
              {transaction.subsequentTransactions.map((transaction, index) => (
                <Fragment key={index}>
                  <TableRow>
                    <TableCell>
                      <Typography variant='baseMdBold'>
                        {
                          formatTimestamp(transaction.createdOn, {
                            format: 'DD.MM.YYYY',
                          }).date
                        }
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {transaction.currentStatus ===
                      LoanTicketStatus.optedIn ? (
                        t('general.optedIn')
                      ) : transaction.currentStatus ===
                        LoanTicketStatus.optedOut ? (
                        t('general.optedOut')
                      ) : (
                        <Box display='flex' alignItems='center'>
                          <Button
                            variant='text'
                            sx={{
                              ...customTypography.baseMdBold,
                              color: 'white',
                              textTransform: 'capitalize',
                              height: 21,
                            }}
                            startIcon={<OptInOutIcon />}
                            onClick={() => handleOpen(transaction)}
                          >
                            {t('general.optInOut')}
                          </Button>
                          <Typography variant='baseMd'>
                            {t('general.timeLeft')}:{' '}
                            <Countdown
                              endTime={dayjs
                                .unix(transaction.createdOn)
                                .add(2, 'days')
                                .unix()}
                              format='HH:mm:ss'
                              render={(countDown) => {
                                const [hours, minutes, seconds] =
                                  countDown.split(':')

                                return `${hours} hrs, ${minutes} mins, ${seconds} secs.`
                              }}
                            />
                          </Typography>
                        </Box>
                      )}
                    </TableCell>
                    <TableCell align='right'>
                      <Typography variant='baseMdBold'>
                        {formatAmount(transaction.assets, { minDecimals: 2 })}{' '}
                        USDC
                      </Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={3} sx={{ py: 0 }}>
                      <DottedDivider color='white' />
                    </TableCell>
                  </TableRow>
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </>
  )
}

export default SubsequentTransactions
