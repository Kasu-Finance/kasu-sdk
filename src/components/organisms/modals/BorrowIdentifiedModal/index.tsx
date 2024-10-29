import { Box, Button, Stack, Typography } from '@mui/material'

import useModalState from '@/hooks/context/useModalState'
import useFundingConsent from '@/hooks/lending/useFundingConsent'
import useTranslation from '@/hooks/useTranslation'

import Countdown from '@/components/atoms/Countdown'
import CustomCard from '@/components/atoms/CustomCard'
import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import WaveBox from '@/components/atoms/WaveBox'
import DialogHeader from '@/components/molecules/DialogHeader'
import CountdownCard from '@/components/organisms/modals/BorrowIdentifiedModal/CountdownCard'
import CountdownSeparator from '@/components/organisms/modals/BorrowIdentifiedModal/CountdownSeparator'

import { ModalsKeys } from '@/context/modal/modal.types'

import { LoanTicketStatus } from '@/config/api.lendersAgreement'
import dayjs from '@/dayjs'

const BorrowerIdentifiedModal: React.FC<DialogChildProps> = ({
  handleClose,
}) => {
  const { t } = useTranslation()

  const { modal, openModal } = useModalState()

  const fundingConsent = useFundingConsent()

  const { loanTicket, pools } = modal[ModalsKeys.BORROWER_IDENTIFIED]

  const handleConsent = async (
    decision: LoanTicketStatus.optedIn | LoanTicketStatus.optedOut
  ) => {
    await fundingConsent(
      {
        endBorrowerID: loanTicket.endBorrowerID,
        poolID: loanTicket.poolID,
        trancheID: loanTicket.trancheID,
        status: decision,
      },
      pools,
      () => {
        handleClose()

        openModal({
          name:
            decision === LoanTicketStatus.optedIn
              ? ModalsKeys.OPT_IN
              : ModalsKeys.OPT_OUT,
        })
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
              <Box
                pb={4}
                display='grid'
                gridTemplateColumns='repeat(auto-fit, minmax(0, max-content))'
                alignItems='end'
                gap={1}
                justifyContent='center'
              >
                <Countdown
                  endTime={dayjs(loanTicket.createdOn).add(2, 'days').unix()}
                  format='HH:mm:ss'
                  render={(countdown) => {
                    const [hours, minutes, seconds] = countdown.split(':')

                    return (
                      <>
                        <Box display='flex' gap={0.5} position='relative'>
                          <CountdownCard value={hours[0]} />
                          <CountdownCard value={hours[1]} />
                          <Typography
                            variant='baseXs'
                            position='absolute'
                            sx={{ transform: 'translateX(-50%)' }}
                            left='50%'
                            bottom='-20px'
                          >
                            {t('time.hours')}
                          </Typography>
                        </Box>
                        <CountdownSeparator />
                        <Box display='flex' gap={0.5} position='relative'>
                          <CountdownCard value={minutes[0]} />
                          <CountdownCard value={minutes[1]} />
                          <Typography
                            variant='baseXs'
                            position='absolute'
                            sx={{ transform: 'translateX(-50%)' }}
                            left='50%'
                            bottom='-20px'
                          >
                            {t('time.minutes')}
                          </Typography>
                        </Box>
                        <CountdownSeparator />
                        <Box display='flex' gap={0.5} position='relative'>
                          <CountdownCard value={seconds[0]} />
                          <CountdownCard value={seconds[1]} />
                          <Typography
                            variant='baseXs'
                            position='absolute'
                            sx={{ transform: 'translateX(-50%)' }}
                            left='50%'
                            bottom='-20px'
                          >
                            {t('time.seconds')}
                          </Typography>
                        </Box>
                      </>
                    )
                  }}
                />
              </Box>
              <Typography variant='baseMd'>
                {t('modals.borrowerIdentified.description-3')}
              </Typography>
            </Box>
            <Typography variant='baseMd'>
              {t('modals.borrowerIdentified.description-4')}
            </Typography>
            <Typography variant='baseMd' color='white'>
              no-reply@kasu.finance
            </Typography>
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
