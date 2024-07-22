import ReceiptIcon from '@mui/icons-material/Receipt'
import { Box, IconButton, TableCell, TableRow, Typography } from '@mui/material'
import { UserRequestEvent } from '@solidant/kasu-sdk/src/services/UserLending/types'
import { useWeb3React } from '@web3-react/core'
import { useMemo } from 'react'

import useTranslation from '@/hooks/useTranslation'

import ToolTip from '@/components/atoms/ToolTip'

import { SupportedChainIds } from '@/connection/chains'
import { networks } from '@/connection/networks'
import { formatAmount, formatTimestamp } from '@/utils'

type TotalAmountsRowProps = {
  actionHistory: UserRequestEvent
  requestTrancheName: string
}

const TotalAmountsRow: React.FC<TotalAmountsRowProps> = ({
  actionHistory,
  requestTrancheName,
}) => {
  const { t } = useTranslation()
  const { chainId } = useWeb3React()

  const eventTrancheName = actionHistory?.trancheName

  const isReallocated = useMemo(
    () => eventTrancheName !== requestTrancheName,
    [eventTrancheName, requestTrancheName]
  )

  const formattedTime = formatTimestamp(actionHistory.timestamp, {
    format: 'DD.MM.YYYY HH:mm:ss',
    includeUtcOffset: true,
  })

  return (
    <>
      <TableRow
        sx={{
          '.MuiTableCell-root': {
            p: 0,
            color: 'white',
            border: 'none',
            fontSize: 10,
          },
        }}
      >
        <TableCell colSpan={4}>
          {isReallocated ? (
            <Box display='inline-flex' alignItems='center'>
              <Typography variant='caption' fontSize={10}>
                {t(
                  'lending.poolOverview.transactionsHistory.reallocated.label'
                )}
              </Typography>
              <ToolTip
                title={t(
                  'lending.poolOverview.transactionsHistory.reallocated.tooltip'
                )}
              />
            </Box>
          ) : (
            <Typography variant='inherit' display='inline-block'>
              {actionHistory.requestType}
            </Typography>
          )}
          {!isReallocated && (
            <Typography variant='inherit' display='inline' color='#606060'>
              {' '}
              {formattedTime.date} {formattedTime.timestamp}{' '}
              {formattedTime.utcOffset}
            </Typography>
          )}
        </TableCell>
      </TableRow>
      {isReallocated && (
        <TableRow
          sx={{
            '.MuiTableCell-root': {
              p: 0,
              color: 'white',
              border: 'none',
              fontSize: 10,
            },
          }}
        >
          <TableCell colSpan={4}>
            <Typography
              variant='inherit'
              component='span'
              display='inline'
              color='primary.main'
            >
              {requestTrancheName}
            </Typography>
            <Typography variant='inherit' component='span' display='inline'>
              {' '}
              &#8594;{' '}
            </Typography>
            <Typography
              variant='inherit'
              component='span'
              display='inline'
              color='primary.main'
            >
              {eventTrancheName}
            </Typography>
            <Typography variant='inherit' display='inline' color='#606060'>
              {' '}
              {formattedTime.date} {formattedTime.timestamp}{' '}
              {formattedTime.utcOffset}
            </Typography>
          </TableCell>
        </TableRow>
      )}
      <TableRow
        sx={{
          '.MuiTableCell-root': {
            p: 0,
            color: 'primary.main',
            border: 'none',
            fontSize: 10,
          },
        }}
      >
        <TableCell>
          {formatAmount(actionHistory.totalRequested || '0', {
            minDecimals: 2,
          })}{' '}
          USDC
        </TableCell>
        <TableCell>
          {formatAmount(actionHistory.totalAccepted || '0', {
            minDecimals: 2,
          })}{' '}
          USDC
        </TableCell>
        <TableCell>
          {formatAmount(actionHistory.totalRejected || '0', {
            minDecimals: 2,
          })}{' '}
          USDC
        </TableCell>
        <TableCell
          sx={(theme) => ({
            '.MuiSvgIcon-root': {
              width: 16,
              height: 16,
              fill: theme.palette.primary.main,
            },
          })}
        >
          <IconButton
            disabled={!chainId}
            href={`${
              networks[(chainId as SupportedChainIds) || SupportedChainIds.BASE]
                .blockExplorerUrls[0]
            }/tx/${actionHistory.transactionHash}`}
            target='_blank'
          >
            <ReceiptIcon />
          </IconButton>
        </TableCell>
      </TableRow>
    </>
  )
}

export default TotalAmountsRow
