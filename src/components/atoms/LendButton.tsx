'use client'

import React from 'react'

import useModalState from '@/hooks/context/useModalState'
import getTranslation from '@/hooks/useTranslation'

import KycButton from '@/components/atoms/KycButton'

import { ModalsKeys } from '@/context/modal/modal.types'

import { PoolOverviewWithDelegate } from '@/types/page'

type LendButtonProps = {
  pool: PoolOverviewWithDelegate
  currentEpoch: string
}

const LendButton: React.FC<LendButtonProps> = ({ pool, currentEpoch }) => {
  const { t } = getTranslation()

  const { openModal } = useModalState()

  const handleOpen = () =>
    openModal({
      name: ModalsKeys.LEND,
      pool,
      currentEpoch,
    })

  return (
    <KycButton
      variant='contained'
      sx={{ pl: 2.25, pr: 2.25, flex: 1, textTransform: 'capitalize' }}
      onClick={handleOpen}
    >
      {t('general.lend')}
    </KycButton>
  )
}

export default LendButton
