import { Box, Typography } from '@mui/material'
import Link from 'next/link'

import useModalState from '@/hooks/context/useModalState'
import getTranslation from '@/hooks/useTranslation'

import OrderedList from '@/components/atoms/OrderedList'

import { ModalsKeys } from '@/context/modal/modal.types'

import { Routes } from '@/config/routes'
import { customTypography } from '@/themes/typography'

const WhatsNext = () => {
  const { t } = getTranslation()

  const { closeModal } = useModalState()

  const handleClose = () => closeModal(ModalsKeys.LEND)

  return (
    <>
      <Typography variant='h4'>
        {t('modals.lending.completed.description-3')}
      </Typography>
      <Box>
        <Typography variant='baseMd'>
          {t('modals.lending.completed.description-4')}
          <br />
          {t('modals.lending.completed.description-5')}
        </Typography>
        <OrderedList
          sx={{
            mt: 2,
            pl: 2,
            ...customTypography.baseMd,
            'li::marker': {
              fontWeight: 'bold',
            },
          }}
        >
          <li>
            <Typography variant='baseMdBold'>
              {t('modals.lending.completed.list.list-0.title')}:{' '}
            </Typography>
            {t('modals.lending.completed.list.list-0.description-1')}{' '}
            <Typography
              component={Link}
              href={Routes.portfolio.yourTransactions.url}
              variant='baseMd'
              sx={{
                textDecoration: 'none',
                color: 'white',
              }}
              onClick={handleClose}
            >
              {t('general.myPortfolio')} &gt;{' '}
              {t('portfolio.tabs.yourTransactions')}
            </Typography>{' '}
            {t('modals.lending.completed.list.list-0.description-2')}
          </li>
          <li>
            <Typography variant='baseMdBold'>
              {t('modals.lending.completed.list.list-1.title')}:{' '}
            </Typography>
            {t('modals.lending.completed.list.list-1.description-1')}
            <Typography variant='baseMd' color='white'>
              {' '}
              no-reply@lenders.kasu.finance{' '}
            </Typography>
            {t('modals.lending.completed.list.list-1.description-2')}
          </li>
          <li>
            <Typography variant='baseMdBold'>
              {t('modals.lending.completed.list.list-2.title')}:{' '}
            </Typography>
            {t('modals.lending.completed.list.list-2.description')}
          </li>
          <li>
            <Typography variant='baseMdBold'>
              {t('modals.lending.completed.list.list-3.title')}:{' '}
            </Typography>
            {t('modals.lending.completed.list.list-3.description')}
          </li>
        </OrderedList>
        <Typography variant='baseMdBold' component='p' mt={2}>
          {t('modals.lending.completed.description-6')}
        </Typography>
      </Box>
    </>
  )
}

export default WhatsNext
