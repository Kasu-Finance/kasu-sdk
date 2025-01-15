import { Box, Stack, Typography } from '@mui/material'

import useModalState from '@/hooks/context/useModalState'
import getTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import WaveBox from '@/components/atoms/WaveBox'
import DialogHeader from '@/components/molecules/DialogHeader'
import NextClearingPeriodInfo from '@/components/molecules/NextClearingPeriodInfo'
import RequestDetailsAction from '@/components/organisms/modals/RequestDetailsModal/RequestDetailsAction'
import RequestOverview from '@/components/organisms/modals/RequestDetailsModal/RequestOverview'
import SubsequentTransactionsHistory from '@/components/organisms/modals/RequestDetailsModal/SubsequentTransactionsHistory'
import SystemProcessHistory from '@/components/organisms/modals/RequestDetailsModal/SystemProcessHistory'

import { ModalsKeys } from '@/context/modal/modal.types'

const RequestDetailsModal: React.FC<DialogChildProps> = ({ handleClose }) => {
  const { t } = getTranslation()

  const { modal } = useModalState()

  const { detailedTransaction, currentEpoch } =
    modal[ModalsKeys.REQUEST_DETAILS]

  const isReallocation = 'id' in detailedTransaction

  const isCancellable = Boolean(
    !isReallocation &&
      detailedTransaction.transactions.find(
        (transaction) => transaction.requestStatus === 'Requested'
      )?.canCancel
  )

  return (
    <CustomCard>
      <DialogHeader
        title={t('modals.requestDetails.title')}
        onClose={handleClose}
      />
      <WaveBox variant='gold' px={2} py={3} borderRadius={2}>
        <Stack spacing={5}>
          <Box>
            <Typography variant='baseMd' textTransform='capitalize'>
              {t('general.lendingStrategy')}
            </Typography>
            <Typography variant='h4'>
              {isReallocation
                ? detailedTransaction.lendingPool.name
                : detailedTransaction.poolName}
            </Typography>
          </Box>
          <RequestOverview transaction={detailedTransaction} />
          {!isReallocation && detailedTransaction.type === 'Withdrawal' && (
            <Box bgcolor='gold.dark' borderRadius={2} p={2} textAlign='center'>
              <Typography variant='baseMdBold'>
                All withdrawal amounts that remain queued for an entire 7 day
                epoch will continue to accrue interest.
                <br />
                Similarly, each withdrawal amount accepted will include the
                proportionate amount of accrued interest.
              </Typography>
            </Box>
          )}
          <SystemProcessHistory transaction={detailedTransaction} />
          {(isReallocation || detailedTransaction.type === 'Deposit') && (
            <SubsequentTransactionsHistory
              poolName={
                isReallocation
                  ? detailedTransaction.lendingPool.name
                  : detailedTransaction.poolName
              }
              detailedTransaction={detailedTransaction}
              currentEpoch={currentEpoch}
            />
          )}
          {!isReallocation && isCancellable && (
            <Stack spacing={5}>
              <Typography variant='h4'>
                {t(
                  detailedTransaction.type === 'Deposit'
                    ? 'modals.requestDetails.notAcceptedMessage.lending'
                    : 'modals.requestDetails.notAcceptedMessage.withdrawal'
                )}
              </Typography>
              <NextClearingPeriodInfo />
              <RequestDetailsAction
                detailedTransaction={detailedTransaction}
                currentEpoch={currentEpoch}
                handleClose={handleClose}
              />
            </Stack>
          )}
        </Stack>
      </WaveBox>
    </CustomCard>
  )
}

export default RequestDetailsModal
