import { Button, Typography } from '@mui/material'

import useModalState from '@/hooks/context/useModalState'
import useTranslation from '@/hooks/useTranslation'

import OrderedList from '@/components/atoms/OrderedList'

import { ModalsKeys } from '@/context/modal/modal.types'

const DepositDescription = () => {
  const { t } = useTranslation()

  const { openModal } = useModalState()

  const handleOpen = () => openModal({ name: ModalsKeys.LOYALTY_LEVELS })

  return (
    <>
      <Typography variant='body2' component='p' textAlign='center'>
        {t('modals.lock.deposit.description.metric-1')}{' '}
        <Button
          onClick={handleOpen}
          variant='text'
          sx={{
            display: 'inline',
            height: 'auto',
            p: 0,
            fontSize: 'inherit',
            fontWeight: 'inherit',
            fontFamily: 'inherit',
            textTransform: 'inherit',
          }}
        >
          {t('modals.lock.deposit.description.metric-2')}
        </Button>
      </Typography>
      <Typography variant='body2' component='p' fontWeight={700}>
        {t('modals.lock.deposit.description.metric-3')}
      </Typography>
      <OrderedList sx={{ paddingLeft: 1.5, fontWeight: 700 }}>
        <li>
          <Typography variant='body2' component='p' fontWeight='inherit'>
            {t('modals.lock.deposit.description.metric-4')}
          </Typography>
        </li>
        <li>
          <Typography variant='body2' component='p' fontWeight='inherit'>
            {t('modals.lock.deposit.description.metric-5')}
          </Typography>
        </li>
      </OrderedList>
      <Typography variant='subtitle2' component='p' textAlign='center'>
        {t('modals.lock.deposit.description.metric-6')}
      </Typography>
      <Typography
        variant='caption'
        component='p'
        letterSpacing='0.4px'
        color={(theme) => theme.palette.text.secondary}
      >
        {t('modals.lock.deposit.description.metric-7')}
      </Typography>
    </>
  )
}

export default DepositDescription
