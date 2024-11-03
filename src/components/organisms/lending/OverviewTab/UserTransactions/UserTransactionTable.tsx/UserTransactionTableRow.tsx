import {
  Box,
  Button,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@mui/material'
import { UserRequest } from '@solidant/kasu-sdk/src/services/UserLending/types'

import useModalState from '@/hooks/context/useModalState'
import useTranslation from '@/hooks/useTranslation'

import DottedDivider from '@/components/atoms/DottedDivider'
import UserTransactionCollapsedContent from '@/components/organisms/lending/OverviewTab/UserTransactions/UserTransactionTable.tsx/UserTransactionCollapsedContent'

import { ModalsKeys } from '@/context/modal/modal.types'

import { CancelIcon, ChevronDownIcon } from '@/assets/icons'

import { formatAmount, formatTimestamp } from '@/utils'

type UserTransactionTableRowProps = {
  transaction: UserRequest
  isActive: boolean
  toggle: () => void
}

const UserTransactionTableRow: React.FC<UserTransactionTableRowProps> = ({
  transaction,
  isActive,
  toggle,
}) => {
  const { t } = useTranslation()

  const { openModal } = useModalState()

  const formattedTime = formatTimestamp(transaction.timestamp, {
    format: 'DD.MM.YYYY',
  })

  const handleCancel = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation()

    openModal({
      name:
        transaction.requestType === 'Deposit'
          ? ModalsKeys.CANCEL_DEPOSIT
          : ModalsKeys.CANCEL_WITHDRAWAL,
      transaction,
    })
  }

  return (
    <>
      <TableRow
        onClick={toggle}
        hover={!isActive}
        sx={{
          cursor: 'pointer',
          zIndex: 1,
          position: 'relative',
          '.MuiTableCell-root:first-child::before': {
            content: '""',
            position: 'absolute',
            width: 'calc(100% - 32px)',
            left: 16,
            top: 0,
            height: '100%',
            zIndex: -1,
            bgcolor: 'gray.extraLight',
            opacity: isActive ? 1 : 0,
            transition: 'opacity 0.3s ease',
          },
          '&.MuiTableRow-hover:hover': {
            background: 'unset',
            '.MuiTableCell-root:first-child::before': {
              opacity: 1,
            },
          },
        }}
      >
        <TableCell
          sx={{
            pl: 3,
          }}
        >
          <Box
            display='flex'
            alignItems='center'
            gap={1}
            sx={{
              svg: {
                transform: isActive ? 'rotate(-180deg)' : undefined,
                transition: 'transform 0.3s ease',
              },
            }}
          >
            <ChevronDownIcon />
            {transaction.requestType === 'Deposit'
              ? 'Lending'
              : transaction.requestType}
          </Box>
        </TableCell>
        <TableCell>{transaction.trancheName}</TableCell>
        <TableCell>{formatAmount(transaction.requestedAmount)} USDC</TableCell>
        <TableCell>{formatAmount(transaction.acceptedAmount)} USDC</TableCell>
        <TableCell>{formatAmount(transaction.rejectedAmount)} USDC</TableCell>
        <TableCell>{formattedTime.date}</TableCell>
        <TableCell>
          <Box
            display='flex'
            alignItems='top'
            rowGap={0.5}
            columnGap={1}
            flexWrap='wrap'
          >
            {transaction.status}
            {transaction.canCancel && (
              <Button
                sx={{
                  textTransform: 'capitalize',
                  mt: -0.6,
                  '.MuiButton-icon': {
                    mr: 0.5,
                  },
                }}
                size='small'
                variant='text'
                startIcon={<CancelIcon />}
                onClick={handleCancel}
              >
                {t('general.cancel')}
              </Button>
            )}
          </Box>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={7} padding='none'>
          <DottedDivider
            color={isActive ? 'rgba(226, 226, 226, 1)' : undefined}
            width='calc(100% - 32px)'
            style={{ marginLeft: 16 }}
          />
          <Collapse in={isActive} timeout='auto' unmountOnExit>
            <Table>
              <TableBody>
                {transaction.events.map((event) => (
                  <UserTransactionCollapsedContent
                    requestTrancheName={transaction.trancheName}
                    actionHistory={event}
                    key={event.id}
                  />
                ))}
              </TableBody>
            </Table>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  )
}

export default UserTransactionTableRow
