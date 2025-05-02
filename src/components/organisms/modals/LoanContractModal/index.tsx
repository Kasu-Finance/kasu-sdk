import { Box, Button, IconButton, Stack, Typography } from '@mui/material'
import { useSignMessage, useWallets } from '@privy-io/react-auth'
import { useRef, useState } from 'react'

import useModalState from '@/hooks/context/useModalState'
import useToastState from '@/hooks/context/useToastState'
import useDebounce from '@/hooks/useDebounce'
import getTranslation from '@/hooks/useTranslation'
import useHandleError from '@/hooks/web3/useHandleError'

import CustomCard from '@/components/atoms/CustomCard'
import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import DialogContent from '@/components/molecules/DialogContent'
import DialogHeader from '@/components/molecules/DialogHeader'
import Background from '@/components/organisms/modals/LoanContractModal/Background'
import LoyaltyStatusCriteria from '@/components/organisms/modals/LoanContractModal/LoyaltyStatusCriteria'
import Parties from '@/components/organisms/modals/LoanContractModal/Parties'
import Witnesses from '@/components/organisms/modals/LoanContractModal/Witnesses'

import { ModalsKeys } from '@/context/modal/modal.types'

import { ExpandIcon, ScrollDownIcon } from '@/assets/icons'

import dayjs from '@/dayjs'
import { userRejectedTransaction } from '@/utils'

const LoanContractModal: React.FC<DialogChildProps> = ({ handleClose }) => {
  const { t } = getTranslation()

  const { modal, openModal } = useModalState()

  const { wallets } = useWallets()

  const { signMessage } = useSignMessage()

  const { setToast, removeToast } = useToastState()

  const handleError = useHandleError()

  const containerRef = useRef<HTMLDivElement>()
  const targetRef = useRef<HTMLButtonElement>(null)

  const [showScrollDown, setShowScrollDown] = useState(true)

  const { acceptLoanContract, canAccept, generatedContract, isFullscreen } =
    modal[ModalsKeys.LOAN_CONTRACT]

  const scrollDown = () => {
    if (!containerRef.current) return

    containerRef.current.scrollTo(0, containerRef.current.scrollHeight)
  }

  const handleOnScroll = () => {
    if (!containerRef.current) return

    setShowScrollDown(
      containerRef.current.offsetHeight + containerRef.current.scrollTop <
        containerRef.current.scrollHeight
    )
  }

  const { debouncedFunction: debouncedScroll } = useDebounce(
    handleOnScroll,
    100
  )

  const handleClick = async () => {
    // const provider = await wallet.getEthereumProvider()

    // if (!provider) {
    //   return console.error('Accept Contract:: Provider is undefined')
    // }

    if (!generatedContract) {
      return console.error('Accept Contract:: generatedContract is undefined')
    }

    try {
      setToast({
        type: 'info',
        title: 'Accepting Contract...',
        message:
          'Please sign the transaction in your wallet to accept the Loan Contract.',
        isClosable: false,
      })

      const { signature } = await signMessage({
        message: generatedContract.contractMessage,
      })

      // const signature = await provider
      //   .getSigner()
      //   .signMessage(generatedContract.contractMessage)

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

  const handleFullscreen = () => {
    openModal({
      name: ModalsKeys.LOAN_CONTRACT,
      acceptLoanContract,
      canAccept,
      generatedContract,
      isFullscreen: isFullscreen ? false : true,
    })
  }

  const formattedText = generatedContract?.formattedMessage

  return (
    <CustomCard>
      <DialogHeader
        isFullscreen={modal[ModalsKeys.LOAN_CONTRACT].isFullscreen}
        title='Loan Contract'
        onClose={handleClose}
      />
      <DialogContent
        sx={{
          position: 'relative',
        }}
        innerBoxProps={{
          ref: containerRef,
          pb: 3,
          sx: {
            minHeight: '300px',
            maxHeight: isFullscreen
              ? 'calc(100vh - 224px)'
              : 'calc(100vh - 600px)',
            overflowY: 'auto',
            overflowX: 'hidden',
            scrollBehavior: 'smooth',
          },
          onScroll: debouncedScroll,
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
        <IconButton
          sx={{
            zIndex: 2,
            position: 'absolute',
            height: 42,
            bottom: 0,
            right: 89,
            p: 0,
          }}
          onClick={handleFullscreen}
        >
          <ExpandIcon
            text={t(
              isFullscreen
                ? 'modals.loanContract.actions.minimize'
                : 'modals.loanContract.actions.expand'
            )}
          />
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
          <Parties
            formattedText={formattedText}
            fullName={generatedContract?.fullName}
          />
          <Background formattedText={formattedText} />
          <Witnesses
            isExempt={generatedContract?.contractType === 'exempt'}
            formattedText={formattedText}
          />
          <LoyaltyStatusCriteria formattedText={formattedText} />
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
              ref={targetRef}
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
