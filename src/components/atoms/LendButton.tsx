'use client'

import React from 'react'

import useModalState from '@/hooks/context/useModalState'
import useTranslation from '@/hooks/useTranslation'

import AuthenticateButton from '@/components/atoms/AuthenticateButton'

import { ModalsKeys } from '@/context/modal/modal.types'

import { PoolOverviewWithDelegate } from '@/types/page'

type LendButtonProps = {
  pool: PoolOverviewWithDelegate
}

const LendButton: React.FC<LendButtonProps> = ({ pool }) => {
  const { t } = useTranslation()

  const { openModal } = useModalState()

  const handleOpen = () =>
    openModal({
      name: ModalsKeys.EARNINGS_CALCULATOR,
      pool,
    })

  return (
    <AuthenticateButton
      variant='contained'
      sx={{ pl: 2.25, pr: 2.25, flex: 1, textTransform: 'capitalize' }}
      onClick={handleOpen}
    >
      {t('general.lend')}
    </AuthenticateButton>
  )
}

export default LendButton
