import CloseIcon from '@mui/icons-material/Close'
import {
  Box,
  Button,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material'

import useModalState from '@/hooks/context/useModalState'
import useTranslation from '@/hooks/useTranslation'

import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import InfoColumn from '@/components/atoms/InfoColumn'
import TotalAmountsTable from '@/components/organisms/modals/TransactionHistoryContentModal/TotalAmountsTable'

import { ModalsKeys } from '@/context/modal/modal.types'

import { formatTimestamp } from '@/utils'

const TransactionHistoryContentModal: React.FC<DialogChildProps> = ({
  handleClose,
}) => {
  const { modal } = useModalState()

  const { t } = useTranslation()

  const transaction =
    modal[ModalsKeys.TRANSACTION_HISTORY_CONTENT].transactionHistory

  const formattedTime = formatTimestamp(transaction.timestamp, {
    format: 'DD.MM.YYYY HH:mm:ss',
    includeUtcOffset: true,
  })

  return (
    <>
      <Box
        display='flex'
        justifyContent='space-between'
        alignItems='center'
        px={2}
        py={1}
      >
        <DialogTitle
          color='primary.main'
          sx={{ p: 0 }}
          variant='h5'
          component='span'
        >
          {transaction.requestType === 'Deposit'
            ? 'Lending'
            : transaction.requestType}
        </DialogTitle>
        <Box>
          <Button
              variant='text'
              onClick={handleClose}
              sx={{
                p: 1.5,
                width: 48,
                height: 48,
                color: (theme) => theme.palette.primary.main,
              }}
            >
              <CloseIcon />
            </Button>
        </Box>
      </Box>
      <DialogContent>
        <InfoColumn
          title={t('general.tranche')}
          metric={
            <Typography
              color='primary.main'
              variant='subtitle2'
              component='span'
              fontSize={12}
            >
              {transaction.trancheName}
            </Typography>
          }
          titleContainerSx={{
            px: 0,
          }}
          titleStyle={{
            variant: 'body2',
            color: 'white',
          }}
        />
        <InfoColumn
          title="Request Date"
          metric={
            <Typography variant='body1' component='span' color='primary.main'>
              {formattedTime.date}{' '}
              <Typography variant='caption' component='span' color='#606060'>
                {formattedTime.timestamp} {formattedTime.utcOffset}
              </Typography>
            </Typography>
          }
          titleContainerSx={{
            px: 0,
            mt: 2,
          }}
          titleStyle={{
            variant: 'body2',
            color: 'white',
          }}
        />
        <InfoColumn
          title="Status"
          metric={
            <Typography
              color='primary.main'
              variant='subtitle2'
              component='span'
              fontSize={12}
            >
              {transaction.status}
            </Typography>
          }
          titleContainerSx={{
            px: 0,
            mt: 2,
          }}
          titleStyle={{
            variant: 'body2',
            color: 'white',
          }}
        />
        <Typography
          variant='h6'
          component='span'
          display='block'
          mt={2}
          color='primary.main'
        >
          Total Amounts
        </Typography>
        <TotalAmountsTable transaction={transaction} />
      </DialogContent>
    </>
  )
}

export default TransactionHistoryContentModal
