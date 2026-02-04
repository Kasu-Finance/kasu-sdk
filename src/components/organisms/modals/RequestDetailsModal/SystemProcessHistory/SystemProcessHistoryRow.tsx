import { Box, IconButton, TableCell, TableRow, Typography } from '@mui/material'

import useEpochDate from '@/hooks/web3/useEpochDate'
import { useExplorerUrl } from '@/hooks/web3/useExplorerUrl'

import ToolTip from '@/components/atoms/ToolTip'

import { PaperIcon } from '@/assets/icons'

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
  const { getTxUrl } = useExplorerUrl()

  const formattedTime = formatTimestamp(date, {
    format: 'DD.MM.YYYY HH:mm:ss',
    includeUtcOffset: true,
  })

  const { getEpochDate } = useEpochDate()

  const epochDate = getEpochDate(transactionEpoch, currentEpoch)

  return (
    <TableRow
      sx={{
        whiteSpace: 'normal',
        '.MuiTableCell-root': {
          border: 'none',
          px: 1,
          whiteSpace: 'normal',
          overflowWrap: 'anywhere',
          wordBreak: 'break-word',
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
      <TableCell
        sx={{
          wordBreak: 'break-word',
          overflowWrap: 'anywhere',
          whiteSpace: 'normal',
        }}
      >
        <Typography variant='baseMdBold' sx={{ lineHeight: 1.3 }}>
          {description}
        </Typography>
      </TableCell>
      <TableCell align='right'>
        <Typography variant='baseMdBold'>
          {formatAmount(amount, { minDecimals: 2 })} USDC
        </Typography>
      </TableCell>
      <TableCell
        align={remainingAmount ? 'right' : 'left'}
        sx={{
          wordBreak: 'break-word',
          overflowWrap: 'anywhere',
          whiteSpace: 'normal',
          lineHeight: 1.25,
        }}
      >
        {remainingAmount ? (
          `${formatAmount(remainingAmount, { minDecimals: 2 })} USDC`
        ) : (
          <Typography variant='baseMd' sx={{ lineHeight: 1.3 }}>
            {status}
          </Typography>
        )}
      </TableCell>
      <TableCell>
        <IconButton
          sx={{
            'svg path': {
              fill: 'white',
            },
          }}
          href={getTxUrl(tranasctionHash)}
          target='_blank'
        >
          <PaperIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  )
}

export default SystemProcessHistoryRow
