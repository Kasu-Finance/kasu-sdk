import { Box, TableCell, TableRow, Typography } from '@mui/material'
import { UserRequestEvent } from '@solidant/kasu-sdk/src/services/UserLending/types'
import React from 'react'

import useTranslation from '@/hooks/useTranslation'

import DottedDivider from '@/components/atoms/DottedDivider'
import ToolTip from '@/components/atoms/ToolTip'

import { theme } from '@/themes/MainTheme'
import { formatAmount, formatTimestamp } from '@/utils'

type UserTransactionCollapsedContentProps = {
  actionHistory: UserRequestEvent
  requestTrancheName: string
}

const UserTransactionCollapsedContent: React.FC<
  UserTransactionCollapsedContentProps
> = ({ actionHistory, requestTrancheName }) => {
  const { t } = useTranslation()

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
            bgcolor: 'gray.light',
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
              />
            </Box>
          ) : (
            actionHistory.requestType
          )}
        </TableCell>
        <TableCell width='14%'>
          {isReallocated
            ? `${requestTrancheName} ${String.fromCodePoint(8594)} ${eventTrancheName}`
            : eventTrancheName}
        </TableCell>
        <TableCell width='15%'>
          {formatAmount(actionHistory.totalRequested)} USDC
        </TableCell>
        <TableCell width='15%'>
          {formatAmount(actionHistory.totalAccepted)} USDC
        </TableCell>
        <TableCell width='15%'>
          {formatAmount(actionHistory.totalRejected)} USDC
        </TableCell>
        <TableCell width='12%'>{formattedTime.date}</TableCell>
        <TableCell width='12%'>-</TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={8} padding='none'>
          <DottedDivider
            color='white'
            width='calc(100% - 32px)'
            style={{ marginLeft: 16, background: theme.palette.gray.light }}
          />
        </TableCell>
      </TableRow>
    </>
  )
}

export default UserTransactionCollapsedContent
