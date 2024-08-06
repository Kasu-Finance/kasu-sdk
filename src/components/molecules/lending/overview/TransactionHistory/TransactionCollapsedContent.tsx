import ReceiptIcon from '@mui/icons-material/Receipt'
import { Box, Button, TableCell, TableRow, Typography } from '@mui/material'
import { UserRequestEvent } from '@solidant/kasu-sdk/src/services/UserLending/types'
import { useWeb3React } from '@web3-react/core'
import { useMemo } from 'react'

import useTranslation from '@/hooks/useTranslation'

import TokenAmount from '@/components/atoms/TokenAmount'
import ToolTip from '@/components/atoms/ToolTip'

import { SupportedChainIds } from '@/connection/chains'
import { networks } from '@/connection/networks'
import { formatAmount, formatTimestamp } from '@/utils'

type TransactionCollapsedContentProps = {
  actionHistory: UserRequestEvent
  requestTrancheName: string
}

const TransactionCollapsedContent: React.FC<
  TransactionCollapsedContentProps
> = ({ actionHistory, requestTrancheName }) => {
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
    <TableRow>
      <TableCell align='left' width='18%'>
        {isReallocated ? (
          <Box display='flex' alignItems='center' pl={6}>
            <Typography variant='caption'>
              {t('lending.poolOverview.transactionsHistory.reallocated.label')}
            </Typography>
            <ToolTip
              title={t(
                'lending.poolOverview.transactionsHistory.reallocated.tooltip'
              )}
            />
          </Box>
        ) : (
          <Typography
            fontSize='inherit'
            fontFamily='inherit'
            fontWeight='inherit'
            display='block'
            pl={6}
          >
            {actionHistory.requestType}
          </Typography>
        )}
      </TableCell>
      <TableCell align='center' width='12%'>
        {isReallocated ? (
          <Box>
            <Typography
              variant='caption'
              component='p'
              textAlign='center'
              pl={2}
            >
              {requestTrancheName}
            </Typography>
            <Typography variant='caption' component='p' textAlign='center'>
              <span>&#8594;</span> {eventTrancheName}
            </Typography>
          </Box>
        ) : (
          <Typography variant='caption' component='p' textAlign='center'>
            {eventTrancheName}
          </Typography>
        )}
      </TableCell>
      <TableCell align='right' width='18%'>
        <TokenAmount
          amount={formatAmount(actionHistory.totalRequested || '0')}
          amountProps={{ variant: 'body1' }}
          symbol='USDC'
          symbolProps={{ variant: 'caption' }}
          sx={{ width: '100%', textAlign: 'right' }}
        />
      </TableCell>
      <TableCell align='right' width='18%'>
        <TokenAmount
          amount={formatAmount(actionHistory.totalAccepted || '0')}
          amountProps={{ variant: 'body1' }}
          symbol='USDC'
          symbolProps={{ variant: 'caption' }}
          sx={{ width: '100%', textAlign: 'right' }}
        />
      </TableCell>
      <TableCell align='right' width='18%'>
        <TokenAmount
          amount={formatAmount(actionHistory.totalRejected || '0')}
          amountProps={{ variant: 'body1' }}
          symbolProps={{ variant: 'caption' }}
          symbol='USDC'
          sx={{ width: '100%', textAlign: 'right' }}
        />
      </TableCell>
      <TableCell align='right' width='14%'>
        <Typography variant='body1' component='span'>
          {formattedTime.date}
        </Typography>
        <br />
        <Typography variant='caption' component='span'>
          {formattedTime.timestamp} {formattedTime.utcOffset}
        </Typography>
      </TableCell>
      <TableCell align='right' width='14%'>
        <Button
          variant='outlined'
          size='small'
          disabled={!chainId}
          href={`${
            networks[(chainId as SupportedChainIds) || SupportedChainIds.BASE]
              .blockExplorerUrls[0]
          }/tx/${actionHistory.transactionHash}`}
          target='_blank'
          startIcon={<ReceiptIcon />}
          sx={{ height: 30, width: 97 }}
        >
          VIEW TX
        </Button>
      </TableCell>
    </TableRow>
  )
}

export default TransactionCollapsedContent
