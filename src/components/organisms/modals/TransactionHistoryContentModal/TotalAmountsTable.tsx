import { TableCell, TableRow, Typography } from '@mui/material'
import { UserRequest } from '@solidant/kasu-sdk/src/services/UserLending/types'

import CustomTable from '@/components/molecules/CustomTable'
import TotalAmountsRow from '@/components/organisms/modals/TransactionHistoryContentModal/TotalAmountsRow'

import { formatAmount } from '@/utils'

type TotalAmountsTableProps = {
  transaction: UserRequest
}

const TotalAmountsTable: React.FC<TotalAmountsTableProps> = ({
  transaction,
}) => {
  //   const { openModal } = useModalState()

  //   const handleCancel = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
  //     e.stopPropagation()

  //     openModal({
  //       name:
  //         transaction.requestType === 'Deposit'
  //           ? ModalsKeys.CANCEL_DEPOSIT
  //           : ModalsKeys.CANCEL_WITHDRAWAL,
  //       transactionHistory: transaction,
  //     })
  //   }

  return (
    <CustomTable
      tableContainerStyles={{ mt: 2 }}
      data={transaction.events}
      sortKeys={['']}
      defaultSortKey=''
      handleSort={() => 0}
      pagination={false}
      headers={() => (
        <>
          <TableRow
            sx={{
              '.MuiTableCell-root': {
                p: 0,
                color: 'white',
                border: 'none',
              },
            }}
          >
            <TableCell>Requested</TableCell>
            <TableCell>Accepted</TableCell>
            <TableCell>Rejected</TableCell>
            <TableCell width={16} />
          </TableRow>
          <TableRow
            sx={{
              '.MuiTableCell-root': {
                px: 0,
                py: 1.5,
                color: 'primary.main',
              },
            }}
          >
            <TableCell>
              <Typography variant='h6' fontSize={12} display='inline'>
                {formatAmount(transaction.requestedAmount || '0', {
                  minDecimals: 2,
                })}
              </Typography>
              USDC
            </TableCell>
            <TableCell>
              <Typography variant='h6' fontSize={12} display='inline'>
                {formatAmount(transaction.acceptedAmount || '0', {
                  minDecimals: 2,
                })}
              </Typography>
              USDC
            </TableCell>
            <TableCell>
              <Typography variant='h6' fontSize={12} display='inline'>
                {formatAmount(transaction.rejectedAmount || '0', {
                  minDecimals: 2,
                })}
              </Typography>
              USDC
            </TableCell>
            <TableCell>
              {/* {transaction.canCancel && (
                <IconButton
                  sx={(theme) => ({
                    '& .MuiSvgIcon-root': {
                      width: 16,
                      height: 16,
                      fill: theme.palette.primary.main,
                    },
                  })}
                  onClick={handleCancel}
                >
                  <DeleteIcon />
                </IconButton>
              )} */}
            </TableCell>
          </TableRow>
        </>
      )}
    >
      {(data) => (
        <>
          {/* adds spacing */}
          <TableRow>
            <TableCell sx={{ pt: 0.5, border: 'none' }} />
          </TableRow>
          {data.map((action) => (
            <TotalAmountsRow
              key={action.id}
              actionHistory={action}
              requestTrancheName={transaction.trancheName}
            />
          ))}
        </>
      )}
    </CustomTable>
  )
}

export default TotalAmountsTable
