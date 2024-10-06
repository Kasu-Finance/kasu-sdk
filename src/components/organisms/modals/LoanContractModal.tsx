import { Box, Button, Stack, Typography } from '@mui/material'

import useModalState from '@/hooks/context/useModalState'

import CustomCard from '@/components/atoms/CustomCard'
import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import DialogContent from '@/components/molecules/DialogContent'
import DialogHeader from '@/components/molecules/DialogHeader'

import { ModalsKeys } from '@/context/modal/modal.types'

const LoanContractModal: React.FC<DialogChildProps> = ({ handleClose }) => {
  const { modal } = useModalState()

  const { acceptLoanContract } = modal[ModalsKeys.LOAN_CONTRACT]

  const handleClick = () => {
    acceptLoanContract()
    handleClose()
  }

  return (
    <CustomCard>
      <DialogHeader title='Loan Contract' onClose={handleClose} />
      <DialogContent>
        <Stack spacing={2}>
          <Stack spacing={3}>
            <Typography variant='h4'>Loan Agreement</Typography>

            <Typography variant='baseSmBold'>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam
              vel dolor ut risus venenatis consectetur et in ipsum.
            </Typography>
            <Typography variant='baseSm'>
              Should you unlock any amount of KSU, your rKSU will be burned in
              relative proportion. This may adversely affect your Loyalty Level,
              which in turn, adversely affects your access to Lending Strategies
              and loan Tranches, along with your position in the queue for
              withdrawals from your existing lending. It may also affect your
              APY bonus. It will also reduce your share of Protocol Fees,
              regardless of Loyalty Level.
            </Typography>
          </Stack>
          <Box display='flex' gap={4}>
            <Button
              variant='outlined'
              color='secondary'
              onClick={handleClose}
              fullWidth
              sx={{ textTransform: 'capitalize' }}
            >
              Back to Lend Request
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
          </Box>
        </Stack>
      </DialogContent>
    </CustomCard>
  )
}

export default LoanContractModal
