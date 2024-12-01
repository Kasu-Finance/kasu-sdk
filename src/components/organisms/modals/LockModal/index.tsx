'use client'

import React from 'react'

import useStepperState from '@/hooks/context/useStepperState'
import getTranslation, { TranslateFunction } from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import DialogContent from '@/components/molecules/DialogContent'
import DialogHeader from '@/components/molecules/DialogHeader'
import LockModalConfirmed from '@/components/organisms/modals/LockModal/LockModalConfirmed'
import LockModalEdit from '@/components/organisms/modals/LockModal/LockModalEdit/index'
import LockModalReview from '@/components/organisms/modals/LockModal/LockModalReview/index'

const getActiveComponent = (activeStep: number) => {
  switch (activeStep) {
    case 1:
      return <LockModalEdit />
    case 2:
      return <LockModalReview />
    case 3:
      return <LockModalConfirmed />
    default:
      return null
  }
}

const getTitle = (activeStep: number, t: TranslateFunction) => {
  switch (activeStep) {
    case 2:
      return t('modals.lock.reviewTitle')
    case 3:
      return t('modals.lock.confirmedTitle')
    default:
      return t('modals.lock.title')
  }
}

const LockModal: React.FC<DialogChildProps> = ({ handleClose }) => {
  const { t } = getTranslation()

  const { activeStep } = useStepperState()

  return (
    <CustomCard>
      <DialogHeader title={getTitle(activeStep, t)} onClose={handleClose} />
      <DialogContent>{getActiveComponent(activeStep)}</DialogContent>
    </CustomCard>
  )
}

export default LockModal
