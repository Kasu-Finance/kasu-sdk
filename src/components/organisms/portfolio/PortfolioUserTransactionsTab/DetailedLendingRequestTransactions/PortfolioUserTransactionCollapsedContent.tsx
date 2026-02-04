import { UserRequestEvent } from '@kasufinance/kasu-sdk/src/services/UserLending/types'
import {
  Box,
  Button,
  Stack,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material'
import React from 'react'

import getTranslation from '@/hooks/useTranslation'
import { useExplorerUrl } from '@/hooks/web3/useExplorerUrl'

import DottedDivider from '@/components/atoms/DottedDivider'
import ToolTip from '@/components/atoms/ToolTip'

import { ReceiptIcon } from '@/assets/icons'

import { theme } from '@/themes/MainTheme'
import { formatAmount, formatTimestamp } from '@/utils'

type PortfolioUserTransactionCollapsedContentProps = {
  actionHistory: UserRequestEvent
  requestTrancheName: string
}

const PortfolioUserTransactionCollapsedContent: React.FC<
  PortfolioUserTransactionCollapsedContentProps
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
            bgcolor: 'rgba(232, 232, 232, 1)',
          },
          '.MuiTableCell-root': {
            bgcolor: 'transparent',
            verticalAlign: 'top',
          },
        }}
      >
        <TableCell width='34%' />
        <TableCell width='12%'>
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
        <TableCell width='10%' sx={{ whiteSpace: 'normal' }}>
          {isReallocated
            ? `${requestTrancheName} ${String.fromCodePoint(8594)} ${eventTrancheName}`
            : eventTrancheName}
        </TableCell>
        <TableCell width='18%'>
          <Stack spacing={0.5}>
            <Typography variant='inherit'>
              {t(
                'lending.poolOverview.transactionsHistory.tableHeader.requested'
              )}
              : {formatAmount(actionHistory.totalRequested)} USDC
            </Typography>
            <Typography variant='inherit'>
              {t(
                'lending.poolOverview.transactionsHistory.tableHeader.accepted'
              )}
              : {formatAmount(actionHistory.totalAccepted)} USDC
            </Typography>
            <Typography variant='inherit'>
              {t(
                'lending.poolOverview.transactionsHistory.tableHeader.rejected'
              )}
              : {formatAmount(actionHistory.totalRejected)} USDC
            </Typography>
          </Stack>
        </TableCell>
        <TableCell width='10%'>{formattedTime.date}</TableCell>
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
        <TableCell colSpan={7} padding='none'>
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

export default PortfolioUserTransactionCollapsedContent
