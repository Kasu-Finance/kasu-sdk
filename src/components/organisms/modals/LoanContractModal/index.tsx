import { Box, Button, IconButton, Stack, Typography } from '@mui/material'
import { useWeb3React } from '@web3-react/core'
import { useRef, useState } from 'react'

import useModalState from '@/hooks/context/useModalState'
import useToastState from '@/hooks/context/useToastState'
import getTranslation from '@/hooks/useTranslation'
import useHandleError from '@/hooks/web3/useHandleError'

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

import dayjs from '@/dayjs'
import { userRejectedTransaction } from '@/utils'

const LoanContractModal: React.FC<DialogChildProps> = ({ handleClose }) => {
  const { t } = getTranslation()

  const { modal } = useModalState()

  const { provider } = useWeb3React()

  const { setToast, removeToast } = useToastState()

  const handleError = useHandleError()

  const ref = useRef<HTMLDivElement>()

  const [showScrollDown, setShowScrollDown] = useState(true)

  const { acceptLoanContract, canAccept, generatedContract } =
    modal[ModalsKeys.LOAN_CONTRACT]

  const scrollDown = () => {
    ref.current?.scrollTo(0, ref.current.scrollHeight)
  }

  const handleClick = async () => {
    if (!provider) {
      return console.error('Accept Contract:: Provider is undefined')
    }

    if (!generatedContract) {
      return console.error('Accept Contract:: generatedContract is undefined')
    }

    try {
      setToast({
        type: 'info',
        title: 'Accepting Contract...',
        message:
          'Please sign the transaction in your wallet to accept the Lending Contract.',
        isClosable: false,
      })

      const signature = await provider
        .getSigner()
        .signMessage(generatedContract.contractMessage)

      acceptLoanContract && acceptLoanContract(signature)

      removeToast()
      handleClose()
    } catch (error) {
      if (userRejectedTransaction(error)) {
        handleError(
          error,
          'Accept Contract Error',
          'Message signature request declined. Unable to accept Loan contract.',
          true
        )
      } else {
        handleError(error)
      }
    }
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
          <Parties fullName={generatedContract?.fullName} />
          <Background />
          <Witnesses />
          <LoyaltyStatusCriteria />
          <MultiplierTable />
        </Stack>
        {canAccept && (
          <Box
            display='flex'
            alignItems='center'
            justifyContent='space-between'
            mt={6}
          >
            <Typography variant='h5'>
              {t('modals.loanContract.signingDate')}
            </Typography>
            <Typography variant='h5'>
              {dayjs(generatedContract?.createdAt).format('DD.MM.YYYY')}
            </Typography>
          </Box>
        )}
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
                {t('general.back')}
              </Button>
              <Button
                variant='contained'
                color='secondary'
                fullWidth
                onClick={handleClick}
                sx={{ textTransform: 'capitalize' }}
              >
                {t('modals.loanContract.actions.accept')}
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
