import { Box, Button, IconButton, Stack, Typography } from '@mui/material'
import { useRef, useState } from 'react'

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

import { ScrollDownIcon } from '@/assets/icons'

const LoanContractModal: React.FC<DialogChildProps> = ({ handleClose }) => {
  const { t } = useTranslation()

  const { modal } = useModalState()

  const [showScrollDown, setShowScrollDown] = useState(true)

  const { acceptLoanContract, canAccept } = modal[ModalsKeys.LOAN_CONTRACT]

  const handleClick = () => {
    acceptLoanContract && acceptLoanContract()
    handleClose()
  }

  const ref = useRef<HTMLDivElement>()

  const scrollDown = () => {
    ref.current?.scrollTo(0, ref.current.scrollHeight)
  }

  return (
    <CustomCard>
      <DialogHeader title='Loan Contract' onClose={handleClose} />
      <DialogContent
        sx={{
          position: 'relative',
        }}
        innerBoxProps={{
          ref,
          sx: {
            minHeight: '300px',
            maxHeight: 'calc(100vh - 600px)',
            overflowY: 'auto',
            overflowX: 'hidden',
            scrollBehavior: 'smooth',
          },
          onScroll: () => {
            setShowScrollDown((ref.current?.scrollTop ?? 0) < 4200)
          },
        }}
      >
        <IconButton
          onClick={scrollDown}
          sx={{
            transition: 'opacity 0.3s ease',
            opacity: showScrollDown ? 100 : 0,
            zIndex: 2,
            position: 'absolute',
            height: 42,
            bottom: 0,
            right: 0,
            p: 0,
          }}
        >
          <ScrollDownIcon />
        </IconButton>
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
