import { UserRequestEvent } from '@kasufinance/kasu-sdk'
import { Box, Button, TableCell, TableRow, Typography } from '@mui/material'
import React from 'react'

import getTranslation from '@/hooks/useTranslation'
import { useExplorerUrl } from '@/hooks/web3/useExplorerUrl'

import DottedDivider from '@/components/atoms/DottedDivider'
import ToolTip from '@/components/atoms/ToolTip'

import { ReceiptIcon } from '@/assets/icons'

import { theme } from '@/themes/MainTheme'
import { formatAmount, formatTimestamp } from '@/utils'

type UserTransactionCollapsedContentProps = {
  actionHistory: UserRequestEvent
  requestTrancheName: string
}

const UserTransactionCollapsedContent: React.FC<
  UserTransactionCollapsedContentProps
> = ({ actionHistory, requestTrancheName }) => {
  const { t } = getTranslation()

  const { getTxUrl } = useExplorerUrl()

  const eventTrancheName = actionHistory?.trancheName

  const isReallocated = eventTrancheName !== requestTrancheName

  const formattedTime = formatTimestamp(actionHistory.timestamp, {
    format: 'DD.MM.YYYY',
  })

  return (
    <>
      <TableRow
        sx={{
          zIndex: 1,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            width: 'calc(100% - 32px)',
            left: 16,
            height: '100%',
            zIndex: -1,
            bgcolor: 'rgba(226, 226, 226, 1)',
          },
          '.MuiTableCell-root': { bgcolor: 'transparent' },
        }}
      >
        <TableCell sx={{ pl: 6 }} width='17%'>
          {isReallocated ? (
            <Box display='flex' alignItems='center'>
              <Typography variant='inherit'>
                {t(
                  'lending.poolOverview.transactionsHistory.reallocated.label'
                )}
              </Typography>
              <ToolTip
                title={t(
                  'lending.poolOverview.transactionsHistory.reallocated.tooltip'
                )}
                iconSx={{
                  color: theme.palette.gray.middle,
                }}
              />
            </Box>
          ) : (
            actionHistory.requestType
          )}
        </TableCell>
        <TableCell width='12%'>
          {isReallocated
            ? `${requestTrancheName} ${String.fromCodePoint(8594)} ${eventTrancheName}`
            : eventTrancheName}
        </TableCell>
        <TableCell width='14%'>
          {formatAmount(actionHistory.totalRequested)} USDC
        </TableCell>
        <TableCell width='14%'>
          {formatAmount(actionHistory.totalAccepted)} USDC
        </TableCell>
        <TableCell width='14%'>
          {formatAmount(actionHistory.totalRejected)} USDC
        </TableCell>
        <TableCell width='13%'>{formattedTime.date}</TableCell>
        <TableCell width='16%'>
          <Button
            variant='text'
            startIcon={<ReceiptIcon />}
            sx={{ textTransform: 'capitalize', mt: -0.5 }}
            size='small'
            href={getTxUrl(actionHistory.transactionHash)}
            target='_blank'
          >
            {t('lending.poolOverview.transactionsHistory.viewTx')}
          </Button>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={8} padding='none'>
          <DottedDivider
            color='white'
            width='calc(100% - 32px)'
            style={{ marginLeft: 16, background: 'rgba(226, 226, 226, 1)' }}
          />
        </TableCell>
      </TableRow>
    </>
  )
}

export default UserTransactionCollapsedContent
