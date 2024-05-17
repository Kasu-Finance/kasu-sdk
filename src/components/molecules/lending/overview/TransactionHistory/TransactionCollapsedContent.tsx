import Receipt from '@mui/icons-material/Receipt'
import { Box, Button, TableCell, TableRow, Typography } from '@mui/material'
import { UserRequestEvent } from '@solidant/kasu-sdk/src/services/UserLending/types'
import { useWeb3React } from '@web3-react/core'
import { useMemo } from 'react'

import useTranslation from '@/hooks/useTranslation'

import TokenAmount from '@/components/atoms/TokenAmount'
import ToolTip from '@/components/atoms/ToolTip'

import { SupportedChainIds } from '@/connection/chains'
import { networks } from '@/connection/networks'
import { DATE_FORMAT, TIME_FORMAT } from '@/constants'
import dayjs from '@/dayjs'
import { formatAmount } from '@/utils'

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

  return (
    <TableRow>
      <TableCell align='left' width='17%'>
        {isReallocated ? (
          <Box display='flex' alignItems='center' pl={1}>
            <Typography variant='caption'>
              {t(
                'lending.poolOverview.transactionsHistory.table.reallocated.label'
              )}
            </Typography>
            <ToolTip
              title={t(
                'lending.poolOverview.transactionsHistory.table.reallocated.tooltip'
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
      <TableCell align='center' width='11%'>
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
      <TableCell align='right' width='16%'>
        <TokenAmount
          amount={formatAmount(actionHistory.totalRequested || '0')}
          amountVariant='body1'
          symbol='USDC'
          symbolVariant='caption'
          sx={{ width: '100%', textAlign: 'right' }}
        />
      </TableCell>
      <TableCell align='right' width='15.5%'>
        <TokenAmount
          amount={formatAmount(actionHistory.totalAccepted || '0')}
          amountVariant='body1'
          symbol='USDC'
          symbolVariant='caption'
          sx={{ width: '100%', textAlign: 'right' }}
        />
      </TableCell>
      <TableCell align='right' width='15.5%'>
        <TokenAmount
          amount={formatAmount(actionHistory.totalRejected || '0')}
          amountVariant='body1'
          symbolVariant='caption'
          symbol='USDC'
          sx={{ width: '100%', textAlign: 'right' }}
        />
      </TableCell>
      <TableCell align='right'>
        <Typography variant='body1' component='span'>
          {dayjs.unix(actionHistory.timestamp).format(DATE_FORMAT)}
        </Typography>
        <br />
        <Typography variant='caption' component='span'>
          {dayjs.unix(actionHistory.timestamp).format(TIME_FORMAT)}
        </Typography>
      </TableCell>
      <TableCell align='right'>
        <Button
          variant='outlined'
          size='small'
          disabled={!chainId}
          href={`${
            networks[(chainId as SupportedChainIds) || SupportedChainIds.BASE]
              .blockExplorerUrls[0]
          }/tx/${actionHistory.transactionHash}`}
          target='_blank'
          startIcon={<Receipt />}
          sx={{ height: 30, width: 97 }}
        >
          VIEW TX
        </Button>
      </TableCell>
    </TableRow>
  )
}

export default TransactionCollapsedContent
