import {
  Box,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { Fragment } from 'react'

import useModalState from '@/hooks/context/useModalState'
import getTranslation from '@/hooks/useTranslation'

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
  mapLoanTicketsTranche,
  TimeConversions,
} from '@/utils'
import {
  DetailedTransactionReallocationRequest,
  DetailedTransactionWrapper,
} from '@/utils/lending/getDetailedTransactions'
import getPendingDecisions from '@/utils/lending/getPendingDecisions'
import getSubsequentTransactions, {
  SubsequentTransaction,
} from '@/utils/lending/getSubsequentTransactions'

type SubsequentTransactionsProps = {
  detailedTransaction:
    | DetailedTransactionWrapper
    | DetailedTransactionReallocationRequest
  currentEpoch: string
  poolName: string
}

const SubsequentTransactionsHistory: React.FC<SubsequentTransactionsProps> = ({
  detailedTransaction,
  currentEpoch,
  poolName,
}) => {
  const { t } = getTranslation()

  const { openModal } = useModalState()

  const handleOpen = (subsequentTx: SubsequentTransaction) =>
    openModal({
      name: ModalsKeys.BORROWER_IDENTIFIED,
      subsequentTransaction: subsequentTx,
      poolName,
      callback: (newLoanTickets: LoanTicketDto[]) => {
        const trancheMap = mapLoanTicketsTranche(newLoanTickets)

        const loanTicketGroups = trancheMap.get(
          subsequentTx.trancheID.toLowerCase()
        )

        if (!loanTicketGroups) return

        const newTransaction = {
          ...detailedTransaction,
        }

        const { loanTickets } = getPendingDecisions(loanTicketGroups)

        newTransaction.pendingDecisions = loanTickets

        const subsequentTransactionsMap =
          getSubsequentTransactions(newLoanTickets)

        newTransaction.subsequentTransactions =
          subsequentTransactionsMap.get(subsequentTx.depositRequestID) ?? []

        openModal({
          name: ModalsKeys.REQUEST_DETAILS,
          detailedTransaction: newTransaction,
          currentEpoch,
        })
      },
    })

  if (!detailedTransaction.subsequentTransactions.length) return null

  return (
    <Stack spacing={2}>
      <Typography variant='h4'>
        {t('modals.requestDetails.subtitle')}
      </Typography>
      <Box sx={{ overflowX: 'hidden', minWidth: 0 }}>
        <Table
          sx={{
            tableLayout: 'fixed',
            width: '100%',
          }}
        >
          <TableHead>
            <TableRow
              sx={{
                whiteSpace: 'normal',
                '.MuiTableCell-root': {
                  ...(detailedTransaction.subsequentTransactions.length > 1
                    ? { borderColor: 'gray.extraDark' }
                    : { border: 'none' }),
                  px: 1,
                  whiteSpace: 'normal',
                  overflowWrap: 'anywhere',
                  wordBreak: 'break-word',
                  '&:first-child': {
                    pl: 0,
                  },
                  '&:last-child': {
                    pr: 0,
                  },
                },
              }}
            >
              <TableCell width='24%'>Date</TableCell>
              <TableCell width='28%'>Transaction</TableCell>
              <TableCell width='12%' align='right'>
                Amount
              </TableCell>
              <TableCell width='36%'>Status/Outcome</TableCell>
            </TableRow>
          </TableHead>
          <TableBody
            sx={{
              '.MuiTableCell-root': {
                border: 'none',
                whiteSpace: 'normal',
                overflowWrap: 'anywhere',
                wordBreak: 'break-word',
              },
            }}
          >
            {detailedTransaction.subsequentTransactions.map(
              (transaction, index, originalArray) => {
                const formattedTime = formatTimestamp(transaction.timestamp, {
                  format: 'DD.MM.YYYY HH:mm:ss',
                  includeUtcOffset: true,
                })

                return (
                  <Fragment key={index}>
                    <TableRow
                      sx={{
                        whiteSpace: 'normal',
                        '.MuiTableCell-root': {
                          px: 1,
                          background:
                            transaction.action === LoanTicketStatus.emailSent
                              ? 'url("/images/wave-dark-gold.png") repeat'
                              : undefined,
                          backgroundSize: '17px 16px',
                          '&:first-child': {
                            borderTopLeftRadius:
                              originalArray[index - 1]?.action !==
                              LoanTicketStatus.emailSent
                                ? 4
                                : 0,
                            borderBottomLeftRadius:
                              originalArray[index + 1]?.action !==
                              LoanTicketStatus.emailSent
                                ? 4
                                : 0,
                            pl: 0.5,
                          },
                          '&:last-child': {
                            borderTopRightRadius:
                              originalArray[index - 1]?.action !==
                              LoanTicketStatus.emailSent
                                ? 4
                                : 0,
                            borderBottomRightRadius:
                              originalArray[index + 1]?.action !==
                              LoanTicketStatus.emailSent
                                ? 4
                                : 0,
                            pr: 0.5,
                          },
                        },
                      }}
                    >
                      <TableCell>
                        <Typography
                          variant='baseMd'
                          sx={{
                            wordBreak: 'break-word',
                            overflowWrap: 'anywhere',
                            whiteSpace: 'normal',
                            lineHeight: 1.25,
                          }}
                        >
                          {formattedTime.date}
                          <br />
                          <Typography
                            variant='inherit'
                            color='rgba(133, 87, 38, 1)'
                            display='inline'
                          >
                            {formattedTime.timestamp} {formattedTime.utcOffset}
                          </Typography>
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant='baseMdBold'
                          sx={{
                            wordBreak: 'break-word',
                            overflowWrap: 'anywhere',
                            whiteSpace: 'normal',
                            lineHeight: 1.25,
                          }}
                        >
                          {transaction.action === LoanTicketStatus.emailSent
                            ? 'Opt In/Out - Lender Decision'
                            : transaction.action === LoanTicketStatus.optedIn
                              ? 'Opted In'
                              : transaction.action ===
                                  LoanTicketStatus.fundsReturned
                                ? 'Funds Returned'
                                : 'Opted Out'}
                        </Typography>
                      </TableCell>
                      <TableCell align='right'>
                        <Typography
                          variant='baseMdBold'
                          sx={{ lineHeight: 1.25 }}
                        >
                          {formatAmount(transaction.amount, { minDecimals: 2 })}{' '}
                          USDC
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {transaction.action === LoanTicketStatus.optedIn ? (
                          'Delegate Deploying/Deployed Funds to RWA Loan'
                        ) : transaction.action === LoanTicketStatus.optedOut ? (
                          'Funds Returned'
                        ) : transaction.action ===
                          LoanTicketStatus.fundsReturned ? (
                          'transactions' in detailedTransaction &&
                          detailedTransaction.events[0].timestamp +
                            TimeConversions.SECONDS_PER_DAY * 30 >
                            transaction.timestamp ? (
                            'Delegate Initiated Withdrawal'
                          ) : (
                            'No End Borrower Demand'
                          )
                        ) : transaction.status === 'pending' ? (
                          <Box
                            display='flex'
                            alignItems='center'
                            flexWrap='wrap'
                            columnGap={1}
                            rowGap={0.5}
                            sx={{ minWidth: 0 }}
                          >
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
                                  .unix(transaction.timestamp)
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
                        ) : (
                          'Decision Completed'
                        )}
                      </TableCell>
                    </TableRow>
                    {transaction.action !== LoanTicketStatus.emailSent &&
                      originalArray[index + 1]?.action !==
                        LoanTicketStatus.emailSent && (
                        <TableRow>
                          <TableCell colSpan={4} padding='none'>
                            <DottedDivider color='white' />
                          </TableCell>
                        </TableRow>
                      )}
                  </Fragment>
                )
              }
            )}
          </TableBody>
        </Table>
      </Box>
    </Stack>
  )
}

export default SubsequentTransactionsHistory
