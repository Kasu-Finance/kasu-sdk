import { Box, Stack, Typography } from '@mui/material'

import useModalState from '@/hooks/context/useModalState'
import getTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import WaveBox from '@/components/atoms/WaveBox'
import DialogHeader from '@/components/molecules/DialogHeader'
import RequestDetailsAction from '@/components/organisms/modals/RequestDetailsModal/RequestDetailsAction'
import RequestOverview from '@/components/organisms/modals/RequestDetailsModal/RequestOverview'
import SubsequentTransactions from '@/components/organisms/modals/RequestDetailsModal/SubsequentTransactions'

import { ModalsKeys } from '@/context/modal/modal.types'

const RequestDetailsModal: React.FC<DialogChildProps> = ({ handleClose }) => {
  const { t } = getTranslation()

  const { modal } = useModalState()

  const { detailedTransaction } = modal[ModalsKeys.REQUEST_DETAILS]

  const isCancellable =
    'canCancel' in detailedTransaction && detailedTransaction.canCancel

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
              {detailedTransaction.lendingPool.name}
            </Typography>
          </Box>
          <Box>
            <Typography variant='baseMd'>{t('general.request')}</Typography>
            <Typography variant='h4'>
              {detailedTransaction.requestType === 'Deposit'
                ? t(
                    'portfolio.transactions.detailedTransactions.lendingRequest'
                  )
                : detailedTransaction.requestType === 'Withdrawal'
                  ? t(
                      'portfolio.transactions.detailedTransactions.withdrawalRequest'
                    )
                  : t(
                      'portfolio.transactions.detailedTransactions.reallocation'
                    )}{' '}
              - {detailedTransaction.trancheName} {t('general.tranche')}
            </Typography>
          </Box>
          <RequestOverview
            transaction={detailedTransaction}
            isCancellable={isCancellable}
          />
          <SubsequentTransactions
            poolName={detailedTransaction.lendingPool.name}
            transaction={detailedTransaction}
          />
          {isCancellable && (
            <Stack spacing={5}>
              <Typography variant='h4'>
                {t('modals.requestDetails.notAcceptedMessage')}
              </Typography>
              <RequestDetailsAction
                detailedTransaction={detailedTransaction}
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
