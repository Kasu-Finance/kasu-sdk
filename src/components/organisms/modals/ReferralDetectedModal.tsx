import { Button, Stack, Typography } from '@mui/material'
import { useLogin } from '@privy-io/react-auth'
import React from 'react'
import { useAccount } from 'wagmi'

import useModalState from '@/hooks/context/useModalState'
import useVerifyReferral from '@/hooks/referrals/useVerifyReferral'
import getTranslation from '@/hooks/useTranslation'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

import CustomCard from '@/components/atoms/CustomCard'
import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import DialogContent from '@/components/molecules/DialogContent'
import DialogHeader from '@/components/molecules/DialogHeader'

import { ModalsKeys } from '@/context/modal/modal.types'

const ReferralDetectedModal: React.FC<DialogChildProps> = ({ handleClose }) => {
  const { t } = getTranslation()

  const { modal } = useModalState()

  const { referralCode } = modal[ModalsKeys.REFERRAL_DETECTED]

  const { isAuthenticated } = usePrivyAuthenticated()

  const { address } = useAccount()

  const verifyReferral = useVerifyReferral()

  const { login } = useLogin()

  const handleVerify = async () => {
    if (!address) return

    await verifyReferral(address, referralCode, handleClose)
  }

  return (
    <CustomCard>
      <DialogHeader title='Referral Detected' onClose={handleClose} />
      <DialogContent>
        {isAuthenticated ? (
          <Stack spacing={2}>
            <Typography variant='baseMd' textAlign='center'>
              You are being referred by {referralCode}.
              <br />
              Click on the button below to confirm your referral.
            </Typography>
            <Button
              variant='contained'
              color='secondary'
              fullWidth
              sx={{ textTransform: 'capitalize' }}
              onClick={handleVerify}
            >
              Confirm Referral
            </Button>
          </Stack>
        ) : (
          <Stack spacing={2}>
            <Typography variant='baseMd' textAlign='center'>
              Connect Wallet to verify this referral.
            </Typography>
            <Button
              fullWidth
              onClick={login}
              variant='contained'
              color='secondary'
              sx={{ textTransform: 'capitalize' }}
            >
              {t('general.connectWallet')}
            </Button>
          </Stack>
        )}
      </DialogContent>
    </CustomCard>
  )
}

export default ReferralDetectedModal
