import { Button, Typography } from '@mui/material'
import { Stack } from '@mui/system'

import useModalState from '@/hooks/context/useModalState'
import useStepperState from '@/hooks/context/useStepperState'
import getTranslation from '@/hooks/useTranslation'

import Countdown from '@/components/atoms/Countdown'
import CustomCard from '@/components/atoms/CustomCard'
import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import DialogContent from '@/components/molecules/DialogContent'
import DialogHeader from '@/components/molecules/DialogHeader'
import FixApyConfirmed from '@/components/organisms/modals/FixApyModal/FixApyConfirmed'
import FixApyEdit from '@/components/organisms/modals/FixApyModal/FixApyEdit'

import { ModalsKeys } from '@/context/modal/modal.types'

import dayjs from '@/dayjs'
const getActiveComponent = (activeStep: number) => {
  switch (activeStep) {
    case 1:
      return <FixApyEdit />
    case 2:
      return <FixApyConfirmed />
    default:
      return null
  }
}

const FixApyModal: React.FC<DialogChildProps> = ({ handleClose }) => {
  const { t } = getTranslation()

  const { activeStep } = useStepperState()

  const { modal } = useModalState()

  const { nextEpochTime } = modal[ModalsKeys.FIX_APY]

  const isClearingPeriod = dayjs()
    .add(2, 'days')
    .isAfter(dayjs.unix(nextEpochTime))

  return (
    <CustomCard>
      <DialogHeader title={t('modals.fixApy.title')} onClose={handleClose} />
      <DialogContent>
        {isClearingPeriod ? (
          <Stack spacing={3}>
            <Typography variant='h4'>
              {t('modals.fixApy.description-7')}
            </Typography>
            <Typography variant='baseMd'>
              {t('modals.fixApy.description-8')}
              {' - '}
              <Typography variant='baseMdBold'>
                <Countdown
                  endTime={nextEpochTime}
                  format='HH:mm:ss'
                  render={(countDown) => {
                    const [hours, minutes, seconds] = countDown.split(':')

                    return `${hours} hrs, ${minutes} mins, ${seconds} secs.`
                  }}
                />
              </Typography>
            </Typography>
            <Button
              variant='contained'
              color='secondary'
              fullWidth
              sx={{ textTransform: 'capitalize' }}
              onClick={handleClose}
            >
              {t('general.close')}
            </Button>
          </Stack>
        ) : (
          getActiveComponent(activeStep)
        )}
      </DialogContent>
    </CustomCard>
  )
}

export default FixApyModal
