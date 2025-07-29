import { Box, Button, Stack, Typography } from '@mui/material'

import useModalState from '@/hooks/context/useModalState'
import useFundingConsent from '@/hooks/lending/useFundingConsent'
import getTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import WaveBox from '@/components/atoms/WaveBox'
import CountdownCard from '@/components/molecules/CountdownCard'
import DialogHeader from '@/components/molecules/DialogHeader'

import { ModalsKeys } from '@/context/modal/modal.types'

import { LoanTicketStatus } from '@/config/api.lendersAgreement'
import dayjs from '@/dayjs'

const BorrowerIdentifiedModal: React.FC<DialogChildProps> = ({
  handleClose,
}) => {
  const { t } = getTranslation()

  const { modal } = useModalState()

  const fundingConsent = useFundingConsent()

  const { subsequentTransaction, poolName, callback } =
    modal[ModalsKeys.BORROWER_IDENTIFIED]

  const handleConsent = async (
    decision: LoanTicketStatus.optedIn | LoanTicketStatus.optedOut
  ) => {
    await fundingConsent(
      poolName,
      subsequentTransaction,
      decision,
      (newLoanTickets) => {
        callback(newLoanTickets)
        handleClose()
      }
    )
  }

  return (
    <CustomCard>
      <DialogHeader
        title={t('modals.borrowerIdentified.title')}
        onClose={handleClose}
      />
      <WaveBox variant='gold' px={2} py={3} borderRadius={2} textAlign='center'>
        <Stack alignItems='center' spacing={3}>
          <Stack alignItems='center' spacing={2}>
            <Stack alignItems='center' spacing={2}>
              <Typography variant='baseMd' maxWidth='90%'>
                {t('modals.borrowerIdentified.description-1')}
              </Typography>
              <Typography variant='baseMd'>
                {t('modals.borrowerIdentified.description-2')}
              </Typography>
            </Stack>
            <Box px={2} py={3} borderRadius={2} bgcolor='gold.dark'>
              <CountdownCard
                time={dayjs
                  .unix(subsequentTransaction.timestamp)
                  .add(2, 'days')
                  .unix()}
                format='HH:mm:ss'
                label={[t('time.hours'), t('time.minutes'), t('time.seconds')]}
                pb={4}
              />
              <Typography variant='baseMd'>
                {t('modals.borrowerIdentified.description-3')}
              </Typography>
            </Box>
            <Stack spacing={1}>
              <Typography variant='baseMd'>
                {t('modals.borrowerIdentified.description-4')}
              </Typography>
              <Typography variant='baseMd' color='white'>
                no-reply@lenders.kasu.finance
              </Typography>
            </Stack>
          </Stack>
          <Box display='flex' gap={4} width='100%'>
            <Button
              variant='contained'
              color='secondary'
              fullWidth
              onClick={() => handleConsent(LoanTicketStatus.optedIn)}
              sx={{ textTransform: 'capitalize' }}
            >
              {t('general.optIn')}
            </Button>
            <Button
              variant='outlined'
              color='secondary'
              fullWidth
              onClick={() => handleConsent(LoanTicketStatus.optedOut)}
              sx={{ textTransform: 'capitalize' }}
            >
              {t('general.optOut')}
            </Button>
          </Box>
        </Stack>
      </WaveBox>
    </CustomCard>
  )
}

export default BorrowerIdentifiedModal
