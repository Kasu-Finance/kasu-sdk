import { Box, Stack, Typography } from '@mui/material'

import useModalState from '@/hooks/context/useModalState'

import CustomCard from '@/components/atoms/CustomCard'
import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import InfoRow from '@/components/atoms/InfoRow'
import DialogContent from '@/components/molecules/DialogContent'
import DialogHeader from '@/components/molecules/DialogHeader'

import { ModalsKeys } from '@/context/modal/modal.types'

import { ChevronLeftRoundedIcon } from '@/assets/icons'

import dayjs from '@/dayjs'
import { formatAmount, formatTimestamp } from '@/utils'

const HistoricalRepaymentsModal: React.FC<DialogChildProps> = ({
  handleClose,
}) => {
  const { modal } = useModalState()

  const formattedTime = formatTimestamp(dayjs().subtract(1, 'day').unix(), {
    format: 'DD.MM.YYYY HH:mm:ss',
    includeUtcOffset: true,
  })

  const { historicalRepayments } = modal[ModalsKeys.HISTORICAL_REPAYMENTS]

  return (
    <CustomCard>
      <DialogHeader title='Historical Repayments' onClose={handleClose} />
      <DialogContent>
        <Stack spacing={5}>
          <Box
            display='flex'
            justifyContent='space-between'
            alignItems='center'
            borderRadius={2}
            p={2}
            bgcolor='gold.dark'
            sx={{
              svg: {
                '&:last-child': {
                  transform: 'rotate(180deg)',
                },
                path: {
                  fill: 'black',
                },
              },
            }}
          >
            <ChevronLeftRoundedIcon />
            <Typography variant='baseMd'>
              Epoch Ended{' '}
              <Typography variant='baseMdBold'>
                {formattedTime.date} • {formattedTime.timestamp}{' '}
                {formattedTime.utcOffset}
              </Typography>
            </Typography>
            <ChevronLeftRoundedIcon />
          </Box>
          <Stack>
            <Typography variant='h4' mb={1.5}>
              Repayments
            </Typography>
            <InfoRow
              title='Opening Loan Balance'
              metric={
                <Typography variant='baseMdBold'>
                  {formatAmount(historicalRepayments.openingLoanBalance, {
                    minDecimals: 2,
                  })}{' '}
                  USD
                </Typography>
              }
              showDivider
              dividerProps={{
                color: 'white',
              }}
            />
            <InfoRow
              title='New Funding Drawdowns'
              metric={
                <Typography variant='baseMdBold'>
                  {formatAmount(historicalRepayments.newFundingDrawdowns, {
                    minDecimals: 2,
                  })}{' '}
                  USD
                </Typography>
              }
              showDivider
              dividerProps={{
                color: 'white',
              }}
            />
            <InfoRow
              title='Principal & Interest Payments'
              metric={
                <Typography variant='baseMdBold'>
                  {formatAmount(
                    historicalRepayments.principalInterestRepayments,
                    {
                      minDecimals: 2,
                    }
                  )}{' '}
                  USD
                </Typography>
              }
              showDivider
              dividerProps={{
                color: 'white',
              }}
            />
            <InfoRow
              title='Closing Loan Balance'
              metric={
                <Typography variant='baseMdBold'>
                  {formatAmount(historicalRepayments.closingLoanBalance, {
                    minDecimals: 2,
                  })}{' '}
                  USD
                </Typography>
              }
              showDivider
              dividerProps={{
                color: 'white',
              }}
            />
          </Stack>
          <Stack>
            <Typography variant='h4' mb={1.5}>
              Other Loan Data
            </Typography>
            <InfoRow
              title='Interest Payment Component'
              metric={
                <Typography variant='baseMdBold'>
                  {formatAmount(historicalRepayments.interestPaymentComponent, {
                    minDecimals: 2,
                  })}{' '}
                  USD
                </Typography>
              }
              showDivider
              dividerProps={{
                color: 'white',
              }}
            />
            <InfoRow
              title='Arrears (Current Balance - Cumulative)'
              metric={
                <Typography variant='baseMdBold'>
                  {formatAmount(historicalRepayments.arrears, {
                    minDecimals: 2,
                  })}{' '}
                  USD
                </Typography>
              }
              showDivider
              dividerProps={{
                color: 'white',
              }}
            />
            <InfoRow
              title='Unrecoverable Losses (Cumulative)'
              metric={
                <Typography variant='baseMdBold'>
                  {formatAmount(historicalRepayments.unrecoverableLosses, {
                    minDecimals: 2,
                  })}{' '}
                  USD
                </Typography>
              }
              showDivider
              dividerProps={{
                color: 'white',
              }}
            />
          </Stack>
        </Stack>
      </DialogContent>
    </CustomCard>
  )
}

export default HistoricalRepaymentsModal
