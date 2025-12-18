'use client'

import { Button, Stack, Typography } from '@mui/material'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useModalState from '@/hooks/context/useModalState'
import getTranslation from '@/hooks/useTranslation'

import WaveBox from '@/components/atoms/WaveBox'

import { ModalsKeys } from '@/context/modal/modal.types'

import { formatPercentage } from '@/utils'

const ShareReferralCta = () => {
  const { t } = getTranslation()

  const { txHash, pool, trancheId, fixedTermConfigId } = useDepositModalState()

  const { openModal, closeModal } = useModalState()

  if (!txHash) return null

  const handleOpenReferral = () => {
    const selectedTranche = pool.tranches.find(
      (tranche) => tranche.id === trancheId
    )

    const selectedFixedTerm = selectedTranche?.fixedTermConfig?.find(
      (cfg) => cfg.configId === fixedTermConfigId
    )

    const apyValue =
      fixedTermConfigId && fixedTermConfigId !== '0' && selectedFixedTerm?.apy
        ? selectedFixedTerm.apy
        : selectedTranche?.apy

    openModal({
      name: ModalsKeys.REFERRAL,
      source: 'lending',
      lendingPoolName: pool.poolName,
      trancheName: selectedTranche?.name,
      apy: apyValue ? formatPercentage(apyValue) : undefined,
    })
    closeModal(ModalsKeys.LEND)
  }

  return (
    <WaveBox variant='gold' px={2} py={3} borderRadius={2}>
      <Stack spacing={2} alignItems='center'>
        <Typography variant='h4' textAlign='center'>
          {t('modals.lending.completed.referralCta.title')}
        </Typography>
        <Typography variant='baseMd' textAlign='center'>
          {t('modals.lending.completed.referralCta.description')}
        </Typography>
        <Button
          variant='contained'
          color='secondary'
          fullWidth
          onClick={handleOpenReferral}
          sx={{ textTransform: 'capitalize' }}
        >
          {t('modals.lending.completed.referralCta.action')}
        </Button>
      </Stack>
    </WaveBox>
  )
}

export default ShareReferralCta
