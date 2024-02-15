'use client'

import { Typography } from '@mui/material'

import useNextEpochTime from '@/hooks/locking/useNextEpochTime'
import useTranslation, { TranslationKeys } from '@/hooks/useTranslation'

import CardWidget from '@/components/atoms/CardWidget'
import ColoredBox from '@/components/atoms/ColoredBox'
import Countdown from '@/components/atoms/Countdown'
import InfoRow from '@/components/atoms/InfoRow'

const EPOCHS: {
  title: TranslationKeys
  amount: string
  subtitle?: TranslationKeys
  toolTipInfo: TranslationKeys
}[] = [
  {
    title: 'locking.widgets.epoch.table.1',
    amount: '820.00',
    toolTipInfo: 'general.info',
  },
  {
    title: 'locking.widgets.epoch.table.2',
    subtitle: 'general.nextEpoch',
    amount: '100.21',
    toolTipInfo: 'general.info',
  },
]

const EpochOverview = () => {
  const { nextEpochTime } = useNextEpochTime()
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
        <Countdown
          endTime={nextEpochTime ?? 0}
          format='D:HH:mm'
          render={(countDown) => {
            const parts = countDown.split(':')

            return `${parts[0]} ${t('time.days')} • ${parts[1]} ${t(
              'time.hours'
            )} • ${parts[2]} ${t('time.minutes')}`
          }}
        />
      </Typography>
      <ColoredBox mt={1}>
        {EPOCHS.map((epoch, index) => (
          <InfoRow
            key={'epoch_' + index}
            {...(epoch.subtitle
              ? { subtitle: '(' + t(epoch.subtitle) + ')' }
              : {})}
            title={t(epoch.title)}
            toolTipInfo={t(epoch.toolTipInfo)}
            showDivider={index !== EPOCHS.length - 1}
            metric={
              <Typography variant='body2' component='span'>
                {epoch.amount + ' KASU'}
              </Typography>
            }
          />
        ))}
      </ColoredBox>
    </CardWidget>
  )
}

export default EpochOverview
