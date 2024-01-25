'use client'

import { Typography } from '@mui/material'
import { unix } from 'dayjs'

import CardWidget from '@/components/atoms/CardWidget'
import ColoredBox from '@/components/atoms/ColoredBox'
import InfoRow from '@/components/atoms/InfoRow'

const UNLOCKS = [
  {
    amount: '5000',
    date: 1737044680,
  },
  {
    amount: '6000',
    date: 1705767903,
  },
]

const UnlockOverview = () => {
  const hasLockedTokens = Boolean(UNLOCKS.length)

  return (
    <CardWidget title='Time until KASU unlock'>
      <ColoredBox display='grid' rowGap={1}>
        {hasLockedTokens ? (
          UNLOCKS.map((unlock) => (
            <div key={unlock.date}>
              {/* <UnlockRow key={unlock.date} unlockDetail={unlock} /> */}
              <InfoRow
                title={unlock.amount + ' KSU unlocks on'}
                tooltip={false}
                info='date'
                metricStyle='subtitle2'
                metricInfo={unix(unlock.date).format('Do MMM YYYY') + ''}
              />
            </div>
          ))
        ) : (
          <Typography
            variant='subtitle2'
            component='span'
            mx='6px'
            my={1}
            display='block'
          >
            Currently no locked KASU
          </Typography>
        )}
      </ColoredBox>
    </CardWidget>
  )
}

export default UnlockOverview
