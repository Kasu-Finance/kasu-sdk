import { Box, IconButton, TableCell, TableRow, Typography } from '@mui/material'
import { useChainId } from 'wagmi'

import useEpochDate from '@/hooks/web3/useEpochDate'

import ToolTip from '@/components/atoms/ToolTip'

import { PaperIcon } from '@/assets/icons'

import { SupportedChainIds } from '@/connection/chains'
import { networks } from '@/connection/networks'
import { formatAmount, formatTimestamp } from '@/utils'

type SystemProcessHistoryRowProps = {
  transactionEpoch: string
  currentEpoch: string
  date: EpochTimeStamp
  description: string
  amount: string
  remainingAmount?: string
  status?: string
  tranasctionHash: string
  highlight?: boolean
}

const SystemProcessHistoryRow: React.FC<SystemProcessHistoryRowProps> = ({
  transactionEpoch,
  currentEpoch,
  amount,
  date,
  description,
  status,
  remainingAmount,
  tranasctionHash,
  highlight = false,
}) => {
  const chainId = useChainId()

  const formattedTime = formatTimestamp(date, {
    format: 'DD.MM.YYYY HH:mm:ss',
    includeUtcOffset: true,
  })

  const { getEpochDate } = useEpochDate()

  const epochDate = getEpochDate(transactionEpoch, currentEpoch)

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

          ...(highlight
            ? {
                background: 'url("/images/wave-dark-gold.png") repeat',
                backgroundSize: '17px 16px',

                '&:first-child': {
                  borderTopLeftRadius: 4,
                  borderBottomLeftRadius: 4,
                  pl: 0.5,
                },
                '&:last-child': {
                  borderTopRightRadius: 4,
                  borderBottomRightRadius: 4,
                  pr: 0.5,
                },
              }
            : undefined),
        },
      }}
    >
      <TableCell>
        <Box display='flex' alignItems='center'>
          <Typography variant='baseMdBold'>{transactionEpoch}</Typography>
          <ToolTip
            title={
              <Typography variant='baseMd'>
                {
                  formatTimestamp(epochDate.startTime, { format: 'DD.MM.YYYY' })
                    .date
                }
                {` - `}
                {
                  formatTimestamp(epochDate.endTime, { format: 'DD.MM.YYYY' })
                    .date
                }
              </Typography>
            }
            iconSx={{
              color: 'gold.extraDark',
              '&:hover': {
                color: 'rgba(133, 87, 38, 1)',
              },
            }}
          />
        </Box>
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

export default SystemProcessHistoryRow
