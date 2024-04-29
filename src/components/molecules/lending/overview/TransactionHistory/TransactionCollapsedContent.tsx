import Receipt from '@mui/icons-material/Receipt'
import { Button, TableCell, TableRow, Typography } from '@mui/material'
import { UserRequestEvent } from '@solidant/kasu-sdk/src/services/UserLending/types'
import { useWeb3React } from '@web3-react/core'

import TokenAmount from '@/components/atoms/TokenAmount'

import { SupportedChainIds } from '@/connection/chains'
import { networks } from '@/connection/networks'
import { DATE_FORMAT, TIME_FORMAT } from '@/constants'
import dayjs from '@/dayjs'

type TransactionCollapsedContentProps = {
  actionHistory: UserRequestEvent
}

const TransactionCollapsedContent: React.FC<
  TransactionCollapsedContentProps
> = ({ actionHistory }) => {
  const { chainId } = useWeb3React()

  return (
    <TableRow
      sx={{
        '& .MuiTableCell-root': {
          p: 2,
        },
      }}
    >
      <TableCell width='18%' padding='none'>
        <Typography
          fontSize='inherit'
          fontFamily='inherit'
          fontWeight='inherit'
          display='block'
          pl={6}
        >
          {actionHistory.requestType}
        </Typography>
      </TableCell>
      <TableCell width='18%' align='right' padding='none'>
        <TokenAmount
          amount={actionHistory.totalRequested}
          symbol='USDC'
          sx={{ width: '100%', textAlign: 'right' }}
        />
      </TableCell>
      <TableCell width='18%' align='right' padding='none'>
        <TokenAmount
          amount={actionHistory.totalAccepted}
          symbol='USDC'
          sx={{ width: '100%', textAlign: 'right' }}
        />
      </TableCell>
      <TableCell width='18%' align='right' padding='none'>
        <TokenAmount
          amount={actionHistory.totalRejected}
          symbol='USDC'
          sx={{ width: '100%', textAlign: 'right' }}
        />
      </TableCell>
      <TableCell width='14%' align='right' padding='none'>
        <Typography variant='body1' component='span'>
          {dayjs.unix(actionHistory.timestamp).format(DATE_FORMAT)}
        </Typography>
        <br />
        <Typography variant='caption' component='span'>
          {dayjs.unix(actionHistory.timestamp).format(TIME_FORMAT)}
        </Typography>
      </TableCell>
      <TableCell width='14%' align='center' padding='none'>
        <Button
          variant='outlined'
          size='small'
          disabled={!chainId}
          href={`${
            networks[
              (chainId as SupportedChainIds) || SupportedChainIds.MAINNET
            ].blockExplorerUrls[0]
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
