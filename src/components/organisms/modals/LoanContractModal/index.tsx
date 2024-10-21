import { Box, Button, Stack, Typography } from '@mui/material'

import useModalState from '@/hooks/context/useModalState'
import useTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import DialogContent from '@/components/molecules/DialogContent'
import DialogHeader from '@/components/molecules/DialogHeader'
import Background from '@/components/organisms/modals/LoanContractModal/Background'
import LoyaltyStatusCriteria from '@/components/organisms/modals/LoanContractModal/LoyaltyStatusCriteria'
import MultiplierTable from '@/components/organisms/modals/LoanContractModal/MultiplierTable'
import Parties from '@/components/organisms/modals/LoanContractModal/Parties'
import Witnesses from '@/components/organisms/modals/LoanContractModal/Witnesses'

import { ModalsKeys } from '@/context/modal/modal.types'

const LoanContractModal: React.FC<DialogChildProps> = ({ handleClose }) => {
  const { t } = useTranslation()

  const { modal } = useModalState()

  const { acceptLoanContract, canAccept } = modal[ModalsKeys.LOAN_CONTRACT]

  const handleClick = () => {
    acceptLoanContract && acceptLoanContract()
    handleClose()
  }

  return (
    <CustomCard>
      <DialogHeader title='Loan Contract' onClose={handleClose} />
      <DialogContent>
        <Stack spacing={2}>
          <Box borderRadius={2} bgcolor='gold.dark' p={2}>
            <Stack spacing={2}>
              <Typography variant='h4'>
                {t('modals.loanContract.importantNote.title')}
              </Typography>
              <Typography variant='baseSm'>
                {t('modals.loanContract.importantNote.description')}
              </Typography>
            </Stack>
          </Box>
          <Parties />
          <Background />
          <Witnesses />
          <LoyaltyStatusCriteria />
          <MultiplierTable />
        </Stack>
        <Box display='flex' gap={4} mt={5}>
          {canAccept ? (
            <>
              <Button
                variant='outlined'
                color='secondary'
                onClick={handleClose}
                fullWidth
                sx={{ textTransform: 'capitalize' }}
              >
                Back to Lending Request
              </Button>
              <Button
                variant='contained'
                color='secondary'
                fullWidth
                onClick={handleClick}
                sx={{ textTransform: 'capitalize' }}
              >
                Accept Loan Contract
              </Button>
            </>
          ) : (
            <Button
              variant='contained'
              color='secondary'
              fullWidth
              onClick={handleClose}
              sx={{ textTransform: 'capitalize' }}
            >
              {t('general.close')}
            </Button>
          )}
        </Box>
      </DialogContent>
    </CustomCard>
  )
}

export default LoanContractModal
