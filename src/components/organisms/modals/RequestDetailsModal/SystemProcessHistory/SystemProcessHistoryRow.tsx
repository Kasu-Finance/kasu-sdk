import { IconButton, TableCell, TableRow, Typography } from '@mui/material'
import { useWeb3React } from '@web3-react/core'

import { PaperIcon } from '@/assets/icons'

import { SupportedChainIds } from '@/connection/chains'
import { networks } from '@/connection/networks'
import { formatAmount, formatTimestamp } from '@/utils'

type TransactionHistoryRowProps = {
  epochId: string
  date: EpochTimeStamp
  description: string
  amount: string
  remainingAmount?: string
  status?: string
  tranasctionHash: string
}

const TransactionHistoryRow: React.FC<TransactionHistoryRowProps> = ({
  epochId,
  amount,
  date,
  description,
  status,
  remainingAmount,
  tranasctionHash,
}) => {
  const { chainId } = useWeb3React()

  const formattedTime = formatTimestamp(date, {
    format: 'DD.MM.YYYY HH:mm:ss',
    includeUtcOffset: true,
  })

  return (
    <TableRow
      sx={{
        '.MuiTableCell-root': {
          border: 'none',
          px: 1,
          '&:first-child': {
            pl: 0.5,
          },
          '&:last-child': {
            pr: 0.5,
          },
        },
      }}
    >
      <TableCell>
        <Typography variant='baseMdBold'>{epochId}</Typography>
      </TableCell>
      <TableCell>
        <Typography variant='baseMd'>
          {formattedTime.date} •
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
        <Typography variant='baseMdBold'>{description}</Typography>
      </TableCell>
      <TableCell align='right'>
        <Typography variant='baseMdBold'>
          {formatAmount(amount, { minDecimals: 2 })} USDC
        </Typography>
      </TableCell>
      <TableCell align={remainingAmount ? 'right' : 'left'}>
        {remainingAmount
          ? `${formatAmount(remainingAmount, { minDecimals: 2 })} USDC`
          : status}
      </TableCell>
      <TableCell>
        <IconButton
          sx={{
            'svg path': {
              fill: 'white',
            },
          }}
          href={`${
            networks[(chainId as SupportedChainIds) || SupportedChainIds.BASE]
              .blockExplorerUrls[0]
          }/tx/${tranasctionHash}`}
          target='_blank'
        >
          <PaperIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  )
}

export default TransactionHistoryRow
