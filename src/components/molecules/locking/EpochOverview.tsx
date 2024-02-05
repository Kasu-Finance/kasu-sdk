'use client'

import { Typography } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

import CardWidget from '@/components/atoms/CardWidget'
import ColoredBox from '@/components/atoms/ColoredBox'
import InfoRow from '@/components/atoms/InfoRow'

const EPOCHS = [
  {
    title: 'locking.widgets.epoch.table.1',
    amount: '820.00',
    info: 'general.info',
  },
  {
    title: 'locking.widgets.epoch.table.2',
    subtitle: 'general.nextEpoch',
    amount: '100.21',
    info: 'general.info',
  },
]

const EpochOverview = () => {
  const { t } = useTranslation()

  return (
    <CardWidget title='Epoch'>
      <Typography
        variant='subtitle2'
        component='span'
        color='text.secondary'
        my='6px'
        mx={2}
        display='block'
      >
        {t('locking.widgets.epoch.description')}
      </Typography>
      <Typography variant='h6' component='span' mx={2} display='block'>
        {`2 ${t('time.days')} • 3 ${t('time.hours')} • 2 ${t('time.minutes')} `}
      </Typography>
      <ColoredBox mt={1}>
        {EPOCHS.map((epoch, index) => (
          <InfoRow
            key={'epoch_' + index}
            {...(epoch.subtitle
              ? { subtitle: '(' + t(epoch.subtitle) + ')' }
              : {})}
            title={t(epoch.title)}
            info={t(epoch.info)}
            showDivider={index !== EPOCHS.length - 1}
            metricInfo={epoch.amount + ' KASU'}
          />
        ))}
      </ColoredBox>
    </CardWidget>
  )
}

export default EpochOverview
